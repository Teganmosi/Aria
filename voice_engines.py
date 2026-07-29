"""
Realtime voice engines for Aria calls.

Each engine bridges the browser to a speech-to-speech AI provider behind one
normalized interface, so the WebSocket handler (and the browser protocol) never
needs to know which provider is on the other end:

  - HFS2SEngine    — the free tier: the Pocket-S2S Hugging Face Space (no API key,
                     no SLA, cold starts). The engine Aria launched with.
  - GeminiLiveEngine — premium candidate: Google Gemini Live API (native audio).
  - QwenOmniEngine   — premium candidate: Alibaba DashScope Qwen-Omni Realtime.

All engines output 24 kHz PCM16 audio events and accept 16 kHz Float32 from the
browser (converting internally as needed), which keeps the frontend untouched.

NOTE: the Gemini and Qwen wire protocols were written from their public docs and
must be verified live once API keys are available — small event-shape differences
are possible and stay contained to this file by design.
"""

import asyncio
import base64
import json
import logging
import os
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


class ProviderConnectionLost(Exception):
    """The provider socket dropped; the handler decides whether to restart."""


@dataclass
class VoiceEvent:
    """One normalized event coming from a provider."""
    kind: str  # "audio" | "user_transcript" | "ai_text" | "vad_user" | "aria_done"
    audio: bytes = b""    # PCM16 mono at the engine's playback_sample_rate
    text: str = ""
    speaking: bool = False


class VoiceEngine:
    name = "base"
    capture_sample_rate = 16000     # what the browser captures at
    playback_sample_rate = 24000    # what `audio` events carry
    cost_per_minute_usd = 0.0       # blended estimate, for metering/reports

    async def start(self, system_prompt: str, voice: str, call_id: str) -> None:
        raise NotImplementedError

    async def send_audio(self, float32_16k: bytes) -> None:
        """Raw Float32 PCM at 16 kHz, exactly as the browser sends it."""
        raise NotImplementedError

    async def recv_event(self) -> VoiceEvent:
        """Next normalized event. Raises ProviderConnectionLost when the socket drops."""
        raise NotImplementedError

    async def restart(self, system_prompt: str, voice: str, call_id: str) -> None:
        """Drop the provider session and start a fresh one (conversation resets)."""
        await self.close()
        await self.start(system_prompt, voice, call_id)

    async def close(self) -> None:
        pass


# ── Conversions ──────────────────────────────────────────────────────────────

def _float32_16k_to_pcm16(data: bytes) -> bytes:
    import numpy as np
    samples = np.frombuffer(data, dtype=np.float32)
    return np.clip(samples * 32768.0, -32768, 32767).astype(np.int16).tobytes()


def _resample_float32_16k_to_pcm16_24k(data: bytes) -> bytes:
    """16 kHz Float32 in → 24 kHz PCM16 out (linear interpolation)."""
    import numpy as np
    samples = np.frombuffer(data, dtype=np.float32)
    if len(samples) == 0:
        return b""
    n_target = int(len(samples) * 24000 / 16000)
    x_orig = np.arange(len(samples))
    x_target = np.linspace(0, len(samples) - 1, n_target)
    resampled = np.interp(x_target, x_orig, samples)
    return np.clip(resampled * 32768.0, -32768, 32767).astype(np.int16).tobytes()


# ── Free tier: Hugging Face Pocket-S2S ───────────────────────────────────────

class HFS2SEngine(VoiceEngine):
    name = "hf"
    cost_per_minute_usd = 0.0  # free public Space — no per-minute cost

    S2S_URL = "wss://teganmosi-realtime.hf.space/s2s"
    MAX_CONNECT_ATTEMPTS = 5

    def __init__(self):
        self._ws = None

    async def start(self, system_prompt: str, voice: str, call_id: str) -> None:
        import websockets

        for attempt in range(1, self.MAX_CONNECT_ATTEMPTS + 1):
            try:
                logger.info(f"[{self.name}] connect attempt {attempt}/{self.MAX_CONNECT_ATTEMPTS} for call {call_id}")
                self._ws = await websockets.connect(
                    self.S2S_URL, open_timeout=15, ping_interval=30, ping_timeout=60
                )
                await self._ws.send(json.dumps({
                    "type": "config",
                    "voice": voice,
                    "system_prompt": system_prompt,
                }))
                config_response = await self._ws.recv()
                logger.info(f"[{self.name}] configured (attempt {attempt}): {config_response}")
                return
            except Exception as e:
                logger.warning(f"[{self.name}] connect attempt {attempt} failed: {e}")
                if attempt < self.MAX_CONNECT_ATTEMPTS:
                    await asyncio.sleep(2 ** (attempt - 1))  # 1s, 2s, 4s, 8s (handles cold starts)
                else:
                    raise ProviderConnectionLost(str(e))

    async def send_audio(self, float32_16k: bytes) -> None:
        if self._ws is None:
            return
        try:
            await self._ws.send(float32_16k)  # the Space wants raw Float32 16 kHz
        except Exception:
            pass  # drops during reconnect are acceptable; recv_event surfaces the loss

    async def recv_event(self) -> VoiceEvent:
        import websockets

        try:
            res = await self._ws.recv()
        except websockets.exceptions.ConnectionClosed as e:
            raise ProviderConnectionLost(str(e))

        if isinstance(res, bytes):
            return VoiceEvent(kind="audio", audio=res)  # PCM16 24 kHz, native format

        data = json.loads(res)
        msg_type = data.get("type")
        if msg_type == "status":
            msg = data.get("message", "")
            if msg == "Listening...":
                return VoiceEvent(kind="vad_user", speaking=True)
            if msg == "Transcribing...":
                return VoiceEvent(kind="vad_user", speaking=False)
            return VoiceEvent(kind="aria_done")
        if msg_type == "transcription":
            return VoiceEvent(kind="user_transcript", text=data.get("text", ""))
        if msg_type == "llm_text":
            return VoiceEvent(kind="ai_text", text=data.get("text", ""))
        if msg_type == "done":
            return VoiceEvent(kind="aria_done")
        return VoiceEvent(kind="aria_done")

    async def close(self) -> None:
        if self._ws is not None:
            try:
                await self._ws.close()
            except Exception:
                pass
            self._ws = None


# ── Premium candidate: Google Gemini Live API ────────────────────────────────

class GeminiLiveEngine(VoiceEngine):
    """Native audio Gemini Live over the bidi WebSocket protocol (raw JSON, no SDK)."""
    name = "gemini"
    playback_sample_rate = 24000
    # Blended estimate: input ~$0.006/min + output ~$0.018/min at typical talk ratios.
    cost_per_minute_usd = 0.02

    def __init__(self, model: Optional[str] = None):
        from config import settings
        self._api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "gemini_api_key", "")
        self._model = model or os.getenv("GEMINI_LIVE_MODEL", "gemini-2.5-flash-native-audio-preview-09-2025")
        self._ws = None
        self._url = (
            "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage."
            f"v1alpha.GenerativeService.BidiGenerateContent?key={self._api_key}"
        )

    async def start(self, system_prompt: str, voice: str, call_id: str) -> None:
        import websockets

        if not self._api_key:
            raise ProviderConnectionLost("GEMINI_API_KEY is not configured")
        try:
            self._ws = await websockets.connect(
                self._url, open_timeout=15, ping_interval=30, ping_timeout=60, max_size=None
            )
            await self._ws.send(json.dumps({"setup": {
                "model": f"models/{self._model}",
                "generation_config": {
                    "response_modalities": ["AUDIO"],
                    "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": voice or "Leda"}}},
                },
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "realtime_input_config": {"automatic_activity_detection": {}},
            }}))
            setup_ack = await self._ws.recv()
            logger.info(f"[{self.name}] setup complete for call {call_id}: {str(setup_ack)[:200]}")
        except Exception as e:
            raise ProviderConnectionLost(str(e))

    async def send_audio(self, float32_16k: bytes) -> None:
        if self._ws is None:
            return
        try:
            pcm16 = _float32_16k_to_pcm16(float32_16k)  # Gemini wants PCM16 16 kHz
            await self._ws.send(json.dumps({"realtime_input": {"media_chunks": [
                {"data": base64.b64encode(pcm16).decode(), "mime_type": "audio/pcm"}
            ]}}))
        except Exception:
            pass

    async def recv_event(self) -> VoiceEvent:
        import websockets

        try:
            raw = await self._ws.recv()
        except websockets.exceptions.ConnectionClosed as e:
            raise ProviderConnectionLost(str(e))

        msg = json.loads(raw)
        content = msg.get("serverContent", {})

        turn = content.get("modelTurn", {})
        for part in turn.get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return VoiceEvent(kind="audio", audio=base64.b64decode(inline["data"]))

        inp = content.get("inputTranscription") or content.get("input_transcription") or {}
        if inp.get("text"):
            return VoiceEvent(kind="user_transcript", text=inp["text"])

        out = content.get("outputTranscription") or content.get("output_transcription") or {}
        if out.get("text"):
            return VoiceEvent(kind="ai_text", text=out["text"])

        if content.get("turnComplete") or content.get("turn_complete"):
            return VoiceEvent(kind="aria_done")

        if msg.get("setupComplete") or msg.get("setup_complete"):
            return VoiceEvent(kind="aria_done")

        return VoiceEvent(kind="aria_done")

    async def close(self) -> None:
        if self._ws is not None:
            try:
                await self._ws.close()
            except Exception:
                pass
            self._ws = None


# ── Premium candidate: Alibaba DashScope Qwen-Omni Realtime ──────────────────

class QwenOmniEngine(VoiceEngine):
    """Qwen-Omni Realtime (OpenAI-Realtime-style event protocol) on DashScope."""
    name = "qwen"
    playback_sample_rate = 24000  # Qwen-Omni realtime speaks 24 kHz PCM16 both ways
    cost_per_minute_usd = 0.008   # ~¥0.05/min blended at launch pricing

    def __init__(self, model: Optional[str] = None):
        from config import settings
        self._api_key = os.getenv("DASHSCOPE_API_KEY") or getattr(settings, "dashscope_api_key", "")
        self._model = model or os.getenv("QWEN_REALTIME_MODEL", "qwen3-omni-flash-realtime")
        self._ws = None

    async def start(self, system_prompt: str, voice: str, call_id: str) -> None:
        import websockets

        if not self._api_key:
            raise ProviderConnectionLost("DASHSCOPE_API_KEY is not configured")
        url = f"wss://dashscope.aliyuncs.com/api-ws/v1/realtime?model={self._model}"
        try:
            self._ws = await websockets.connect(
                url,
                additional_headers={"Authorization": f"Bearer {self._api_key}"},
                open_timeout=15, ping_interval=30, ping_timeout=60, max_size=None,
            )
            await self._ws.send(json.dumps({"type": "session.update", "session": {
                "modalities": ["text", "audio"],
                "instructions": system_prompt,
                "voice": voice or "Cherry",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {"model": "gummy-realtime-v1"},
                "turn_detection": {"type": "server_vad"},
            }}))
            # Drain until session.updated (or timeout) so audio flows into a ready session.
            for _ in range(20):
                raw = await self._ws.recv()
                msg = json.loads(raw)
                if msg.get("type") == "session.updated":
                    break
                if msg.get("type") == "error":
                    raise ProviderConnectionLost(f"session.update rejected: {msg}")
            logger.info(f"[{self.name}] session ready for call {call_id}")
        except ProviderConnectionLost:
            raise
        except Exception as e:
            raise ProviderConnectionLost(str(e))

    async def send_audio(self, float32_16k: bytes) -> None:
        if self._ws is None:
            return
        try:
            pcm16_24k = _resample_float32_16k_to_pcm16_24k(float32_16k)
            await self._ws.send(json.dumps({
                "type": "input_audio_buffer.append",
                "audio": base64.b64encode(pcm16_24k).decode(),
            }))
        except Exception:
            pass

    async def recv_event(self) -> VoiceEvent:
        import websockets

        try:
            raw = await self._ws.recv()
        except websockets.exceptions.ConnectionClosed as e:
            raise ProviderConnectionLost(str(e))

        msg = json.loads(raw)
        mtype = msg.get("type", "")

        if mtype == "response.audio.delta":
            return VoiceEvent(kind="audio", audio=base64.b64decode(msg.get("delta", "")))
        if mtype == "conversation.item.input_audio_transcription.completed":
            return VoiceEvent(kind="user_transcript", text=msg.get("transcript", ""))
        if mtype == "response.audio_transcript.delta":
            return VoiceEvent(kind="ai_text", text=msg.get("delta", ""))
        if mtype == "input_audio_buffer.speech_started":
            return VoiceEvent(kind="vad_user", speaking=True)
        if mtype == "input_audio_buffer.speech_stopped":
            return VoiceEvent(kind="vad_user", speaking=False)
        if mtype == "response.done":
            return VoiceEvent(kind="aria_done")
        # session.updated, response.created, keepalives, etc. — no user-visible event.
        return VoiceEvent(kind="aria_done")

    async def close(self) -> None:
        if self._ws is not None:
            try:
                await self._ws.close()
            except Exception:
                pass
            self._ws = None


# ── Engine selection ─────────────────────────────────────────────────────────

def select_voice_engine(profile: Optional[dict], force_free: bool = False) -> VoiceEngine:
    """Pick the engine for a call.

    Premium accounts get the configured premium engine; everyone else gets the
    free HF Space. `force_free` is used when a premium user has no minutes left
    (graceful downgrade instead of a dead call).
    """
    from config import settings

    tier = (profile or {}).get("tier") or "free"
    if tier == "premium" and not force_free:
        chosen = (getattr(settings, "premium_voice_engine", "gemini") or "gemini").lower()
        if chosen == "qwen":
            return QwenOmniEngine()
        return GeminiLiveEngine()
    return HFS2SEngine()
