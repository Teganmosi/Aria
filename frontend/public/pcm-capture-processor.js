/**
 * AudioWorklet processor for voice capture.
 *
 * Replaces the deprecated ScriptProcessorNode: runs on the audio rendering thread
 * (not the main thread), so capture stays glitch-free even when the UI is busy.
 * Accumulates 128-sample render quanta into ~4096-sample chunks (~256ms at 16kHz)
 * to match the chunk size the backend's S2S pipeline expects, then transfers the
 * Float32 buffer to the main thread.
 */
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.pending = []
    this.pendingLength = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (input && input.length > 0) {
      const channel = input[0]
      // Copy — the underlying buffer is reused across process() calls.
      this.pending.push(new Float32Array(channel))
      this.pendingLength += channel.length

      if (this.pendingLength >= 4096) {
        const merged = new Float32Array(this.pendingLength)
        let offset = 0
        for (const chunk of this.pending) {
          merged.set(chunk, offset)
          offset += chunk.length
        }
        this.pending = []
        this.pendingLength = 0
        // Transfer ownership of the ArrayBuffer (zero-copy).
        this.port.postMessage({ audio: merged.buffer }, [merged.buffer])
      }
    }
    return true
  }
}

registerProcessor('pcm-capture-processor', PcmCaptureProcessor)
