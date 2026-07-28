// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from 'react'
import { Mic, PhoneOff, ShieldCheck, Headphones } from 'lucide-react'
import { voiceCallService } from '../services/api'
import { getAccessToken } from '../api/axios'
import './VoiceCall.css'

// Reconnection policy for transient network drops.
const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_BASE_DELAY_MS = 1000

const float32BufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const CHUNK = 0x8000
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
    }
    return btoa(binary)
}

export const VoiceCall = ({ isOpen, onClose, mode = 'voiceCall' }) => {
    const [status, setStatus] = useState('initializing') // initializing, connecting, active, reconnecting, error
    const [transcript, setTranscript] = useState('')
    const [isUserSpeaking, setIsUserSpeaking] = useState(false)
    const [isAriaSpeaking, setIsAriaSpeaking] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [error, setError] = useState(null)
    const [volume, setVolume] = useState(0)
    const [timeWarning, setTimeWarning] = useState(null) // minutes remaining, from server

    // Refs that mirror state so async closures always read the latest value
    const isMutedRef = useRef(false)
    const statusRef = useRef('initializing')
    const userEndedRef = useRef(false)
    const hasStartedRef = useRef(false)
    const reconnectAttemptsRef = useRef(0)
    const reconnectTimerRef = useRef(null)
    const sessionIdRef = useRef(null)

    const wsRef = useRef(null)
    const audioContextRef = useRef(null)
    const streamRef = useRef(null)
    const workletNodeRef = useRef(null)
    const sourceNodeRef = useRef(null)
    const silentSinkRef = useRef(null)
    const analyserRef = useRef(null)
    const animationFrameRef = useRef(null)
    const audioQueueRef = useRef([])
    const isPlayingRef = useRef(false)
    const currentSourceRef = useRef(null)

    useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
    useEffect(() => { statusRef.current = status }, [status])

    const waveHeights = useMemo(
        () => Array.from({ length: 12 }, () => Math.random() * 40 + 20),
        []
    )

    const statusLabel = useMemo(() => {
        if (status === 'connecting') return 'Establishing Spiritual Bridge'
        if (status === 'reconnecting') return 'Reconnecting…'
        if (status === 'active') {
            if (isAriaSpeaking) return 'Aria is speaking'
            if (isUserSpeaking) return 'Listening to you'
            return 'Aria is listening'
        }
        if (status === 'error') return 'Connection Interrupted'
        return 'Initializing'
    }, [status, isAriaSpeaking, isUserSpeaking])

    // ── Teardown ──────────────────────────────────────────────────────────────
    const endCall = () => {
        userEndedRef.current = true
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current)
            reconnectTimerRef.current = null
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

        if (wsRef.current) {
            try { wsRef.current.close(1000, 'Call ended') } catch (e) { /* ignore */ }
        }
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())

        // Fully dismantle the audio graph — leaving nodes connected leaks them
        // for the lifetime of the AudioContext.
        const context = audioContextRef.current
        if (workletNodeRef.current) {
            try { workletNodeRef.current.disconnect() } catch (e) { /* ignore */ }
            workletNodeRef.current.port.onmessage = null
        }
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.disconnect() } catch (e) { /* ignore */ }
        }
        if (silentSinkRef.current) {
            try { silentSinkRef.current.disconnect() } catch (e) { /* ignore */ }
        }
        if (analyserRef.current) {
            try { analyserRef.current.disconnect() } catch (e) { /* ignore */ }
        }
        if (currentSourceRef.current) {
            try { currentSourceRef.current.stop() } catch (e) { /* ignore */ }
        }
        if (context) {
            context.close().catch(() => { /* already closed */ })
        }

        wsRef.current = null
        streamRef.current = null
        audioContextRef.current = null
        workletNodeRef.current = null
        sourceNodeRef.current = null
        silentSinkRef.current = null
        analyserRef.current = null
        currentSourceRef.current = null
        audioQueueRef.current = []
        isPlayingRef.current = false

        setStatus('initializing')
        setTranscript('')
        setError(null)
        setVolume(0)
        setTimeWarning(null)
        setIsUserSpeaking(false)
        setIsAriaSpeaking(false)
    }

    useEffect(() => {
        if (isOpen) {
            userEndedRef.current = false
            hasStartedRef.current = false
            reconnectAttemptsRef.current = 0
            startCall()
        } else {
            endCall()
        }
        return () => endCall()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    // ── Audio setup (AudioWorklet, runs on the audio thread) ──────────────────
    const setupAudio = async () => {
        const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext
        // Capture at 16kHz — exactly what the S2S pipeline expects (Float32 mono).
        const context = new AudioCtx({ sampleRate: 16000 })
        audioContextRef.current = context

        streamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1,
            },
        })

        // One source node, shared by the analyser and the capture worklet.
        const source = context.createMediaStreamSource(streamRef.current)
        sourceNodeRef.current = source

        analyserRef.current = context.createAnalyser()
        analyserRef.current.fftSize = 256
        source.connect(analyserRef.current)

        await context.audioWorklet.addModule('/pcm-capture-processor.js')
        const workletNode = new AudioWorkletNode(context, 'pcm-capture-processor')
        workletNode.port.onmessage = (e) => {
            const ws = wsRef.current
            if (ws?.readyState === WebSocket.OPEN && !isMutedRef.current && e.data?.audio) {
                ws.send(JSON.stringify({
                    type: 'audio_input',
                    audio: float32BufferToBase64(e.data.audio),
                }))
            }
        }
        source.connect(workletNode)
        // An AudioWorkletNode only keeps processing while connected to the graph;
        // route it through a muted gain node.
        const silentSink = context.createGain()
        silentSink.gain.value = 0
        workletNode.connect(silentSink)
        silentSink.connect(context.destination)
        workletNodeRef.current = workletNode
        silentSinkRef.current = silentSink

        // Volume visualization loop
        const updateVolume = () => {
            if (analyserRef.current) {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
                analyserRef.current.getByteFrequencyData(dataArray)
                const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length
                setVolume(average)
            }
            animationFrameRef.current = requestAnimationFrame(updateVolume)
        }
        updateVolume()
    }

    // ── WebSocket ─────────────────────────────────────────────────────────────
    const connectWebSocket = (sessionId) => {
        const wsUrl = voiceCallService.getWebSocketUrl(sessionId)
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            // Auth token travels as the first message, never in the URL.
            ws.send(JSON.stringify({ type: 'auth', token: getAccessToken() || '' }))
            reconnectAttemptsRef.current = 0
            if (statusRef.current !== 'active') {
                setStatus(hasStartedRef.current ? 'reconnecting' : 'connecting')
            }
        }

        ws.onmessage = (event) => {
            let data
            try {
                data = JSON.parse(event.data)
            } catch {
                console.error('[VoiceCall] received non-JSON WebSocket message')
                return
            }
            handleWsMessage(data)
        }

        ws.onerror = () => {
            console.error('[VoiceCall] WebSocket error')
        }

        ws.onclose = (event) => {
            if (userEndedRef.current) return
            // Auth failures and policy rejects are fatal — retrying won't help.
            if (event.code === 4001 || event.code === 4003 || event.code === 1008) {
                setError(event.reason || 'Connection rejected. Please try again.')
                setStatus('error')
                return
            }
            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current)
                reconnectAttemptsRef.current += 1
                setStatus('reconnecting')
                reconnectTimerRef.current = setTimeout(() => connectWebSocket(sessionId), delay)
            } else {
                setError('Connection lost. Please try again.')
                setStatus('error')
            }
        }
    }

    const startCall = async () => {
        try {
            setStatus('connecting')
            setError(null)
            const { session_id } = await voiceCallService.createCallSession(mode)
            sessionIdRef.current = session_id
            await setupAudio()
            connectWebSocket(session_id)
        } catch (err) {
            console.error('[VoiceCall] start failed:', err)
            if (err?.name === 'NotAllowedError') {
                setError('Microphone access was denied. Please allow it and try again.')
            } else {
                setError(err?.message || 'Could not start the call')
            }
            setStatus('error')
        }
    }

    // ── Playback (Int16 24kHz PCM from S2S) ───────────────────────────────────
    const clearAudioQueue = () => {
        audioQueueRef.current = []
        if (currentSourceRef.current) {
            try { currentSourceRef.current.stop() } catch (e) { /* ignore */ }
            currentSourceRef.current = null
        }
        isPlayingRef.current = false
    }

    const playNextInQueue = () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false
            currentSourceRef.current = null
            return
        }

        isPlayingRef.current = true
        const chunk = audioQueueRef.current.shift()
        const context = audioContextRef.current
        if (!context) return

        const buffer = context.createBuffer(1, chunk.length, 24000)
        buffer.getChannelData(0).set(chunk)

        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.onended = playNextInQueue
        currentSourceRef.current = source
        source.start()
    }

    const queueAudioResponse = (base64Audio) => {
        const binary = atob(base64Audio)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }

        // S2S output is Int16 PCM at 24kHz — convert to Float32 for Web Audio playback.
        const pcm16 = new Int16Array(bytes.buffer)
        const float32 = new Float32Array(pcm16.length)
        for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768
        }

        audioQueueRef.current.push(float32)
        if (!isPlayingRef.current) {
            playNextInQueue()
        }
    }

    const handleWsMessage = (data) => {
        switch (data.type) {
            case 'conversation_started':
                hasStartedRef.current = true
                setStatus('active')
                setError(null)
                break
            case 'audio_output':
                queueAudioResponse(data.audio)
                break
            case 'transcript':
                setTranscript(prev => prev + ' ' + data.text)
                break
            case 'user_speaking':
                setIsUserSpeaking(data.speaking)
                if (data.speaking) {
                    clearAudioQueue()
                }
                break
            case 'aria_speaking':
                setIsAriaSpeaking(data.speaking)
                break
            case 'status':
                setTranscript(data.message || '')
                break
            case 'time_warning':
                setTimeWarning(data.minutes_remaining ?? null)
                break
            case 'call_ending':
                setError(data.message || 'Call ended')
                onClose()
                break
            case 'error':
                setError(data.message)
                setStatus('error')
                break
            default:
                break
        }
    }

    if (!isOpen) return null

    return (
        <div className="voice-call-overlay">
            <div className="voice-call-bg">
                <div className="voice-call-stars"></div>
                <div className="voice-call-orb orb-gold"></div>
                <div className="voice-call-orb orb-blue"></div>
                <div className="voice-call-orb orb-purple"></div>
            </div>

            <div className={`avatar-container ${status === 'active' ? 'active' : ''} ${isAriaSpeaking ? 'speaking' : ''}`}>
                <div className="avatar-glow"></div>
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>

                <div className="avatar-image-wrapper">
                    <div className={`pulsing-orb ${isAriaSpeaking ? 'aria-speaking' : ''} ${isUserSpeaking ? 'user-speaking' : ''}`}>
                        <div className="orb-layer layer-1"></div>
                        <div className="orb-layer layer-2"></div>
                        <div className="orb-layer layer-3"></div>
                    </div>
                </div>
            </div>

            <div className="voice-call-info">
                <span className="status-label">{statusLabel}</span>
                <h2 className="call-title">Aria</h2>

                <div className="waveform-container">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className={`wave-bar ${(isUserSpeaking || isAriaSpeaking) ? 'speaking' : ''}`}
                            style={{
                                height: `${Math.max(8, (isUserSpeaking ? volume : (isAriaSpeaking ? waveHeights[i] : 8)))}px`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        ></div>
                    ))}
                </div>

                <div className="transcript-panel">
                    {error ? (
                        <span style={{ color: '#ef4444' }}>{error}</span>
                    ) : (
                        transcript || (status === 'connecting' ? 'Preparing the sanctuary...' : 'I am here, listening...')
                    )}
                </div>

                {timeWarning !== null && !error && (
                    <div style={{ color: '#f59e0b', marginTop: '8px', fontSize: '0.9rem' }}>
                        ⏳ {timeWarning} minute{timeWarning === 1 ? '' : 's'} remaining on this call
                    </div>
                )}
            </div>

            <div className="controls-bar">
                <button
                    className={`control-btn btn-mute ${isMuted ? 'muted' : ''}`}
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <Mic size={24} strokeWidth={2.5} /> : <Mic size={24} />}
                </button>

                <button
                    className="control-btn btn-end"
                    onClick={onClose}
                    title="End Call"
                >
                    <PhoneOff size={32} />
                </button>

                <button
                    className="control-btn btn-mute"
                    style={{ opacity: 0.6 }}
                    title="Settings"
                >
                    <Headphones size={24} />
                </button>
            </div>

            <div className="encryption-text">
                <ShieldCheck size={14} className="sparkle-icon" />
                <span>End-to-end encrypted spiritual guidance</span>
            </div>
        </div>
    )
}
