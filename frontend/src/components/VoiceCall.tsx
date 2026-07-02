// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Mic, PhoneOff, ShieldCheck, Headphones } from 'lucide-react'
import { voiceCallService } from '../services/api'
import './VoiceCall.css'

export const VoiceCall = ({ isOpen, onClose, mode = 'voiceCall' }) => {
    const [status, setStatus] = useState('initializing') // initializing, connecting, active, error
    const [transcript, setTranscript] = useState('')
    const [isUserSpeaking, setIsUserSpeaking] = useState(false)
    const [isAriaSpeaking, setIsAriaSpeaking] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [error, setError] = useState(null)
    const [volume, setVolume] = useState(0)

    // Refs that mirror state so async closures always read the latest value (H4, H5)
    const isMutedRef = useRef(false)
    const statusRef = useRef('initializing')

    const wsRef = useRef(null)
    const audioContextRef = useRef(null)
    const streamRef = useRef(null)
    const processorRef = useRef(null)
    const audioQueueRef = useRef([])
    const isPlayingRef = useRef(false)
    const currentSourceRef = useRef(null)
    const analyserRef = useRef(null)
    const animationFrameRef = useRef(null)

    // Keep refs in sync with state so closures always see the latest values
    useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
    useEffect(() => { statusRef.current = status }, [status])

    // Pre-computed so Math.random() doesn't run on every render (M9)
    const waveHeights = useMemo(
        () => Array.from({ length: 12 }, () => Math.random() * 40 + 20),
        []
    )

    // Status label mapping
    const statusLabel = useMemo(() => {
        if (status === 'connecting') return 'Establishing Spiritual Bridge'
        if (status === 'active') {
            if (isAriaSpeaking) return 'Aria is speaking'
            if (isUserSpeaking) return 'Listening to you'
            return 'Aria is listening'
        }
        if (status === 'error') return 'Connection Interrupted'
        return 'Initializing'
    }, [status, isAriaSpeaking, isUserSpeaking])

    const endCall = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        if (wsRef.current) wsRef.current.close()
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        if (audioContextRef.current) audioContextRef.current.close()
        if (currentSourceRef.current) {
            try { currentSourceRef.current.stop() } catch (e) { /* ignore */ }
        }

        wsRef.current = null
        streamRef.current = null
        audioContextRef.current = null
        analyserRef.current = null
        currentSourceRef.current = null
        setStatus('initializing')
        setTranscript('')
        setError(null)
        setVolume(0)
        setIsUserSpeaking(false)
        setIsAriaSpeaking(false)
    }

    useEffect(() => {
        if (isOpen) {
            startCall()
        } else {
            endCall()
        }
        return () => endCall()
    }, [isOpen])

    const startCall = async () => {
        try {
            setStatus('connecting')

            // 1. Create session
            const { session_id } = await voiceCallService.createCallSession(mode)

            // 2. Initialize Audio
            const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext
            // Capture at 16kHz — this is exactly what Pocket-S2S expects (Float32 16kHz mono)
            audioContextRef.current = new AudioCtx({ sampleRate: 16000 })
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                },
            })

            // Add Analyser for visualization
            analyserRef.current = audioContextRef.current.createAnalyser()
            analyserRef.current.fftSize = 256
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
            source.connect(analyserRef.current)

            // Start animation loop for volume
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

            // 3. Setup WebSocket
            const wsUrl = voiceCallService.getWebSocketUrl(session_id)
            wsRef.current = new WebSocket(wsUrl)

            wsRef.current.onopen = () => {
                setStatus('active')
                setupAudioProcessor()
            }

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data)
                handleWsMessage(data)
            }

            wsRef.current.onerror = (event) => {
                console.error('[VoiceCall] WebSocket error:', event)
                console.error('[VoiceCall] WS URL was:', wsRef.current?.url)
                statusRef.current = 'error'
                setError('Connection failed. Please try again.')
                setStatus('error')
            }

            wsRef.current.onclose = () => {
                if (statusRef.current !== 'error') setStatus('initializing')
            }

        } catch (err) {
            setError(err.message || 'Could not access microphone')
            setStatus('error')
        }
    }

    const setupAudioProcessor = () => {
        const context = audioContextRef.current
        const source = context.createMediaStreamSource(streamRef.current)

        // 4096 samples at 16kHz = ~256ms chunks — good balance of latency vs overhead
        processorRef.current = context.createScriptProcessor(4096, 1, 1)

        processorRef.current.onaudioprocess = (e) => {
            if (wsRef.current?.readyState === WebSocket.OPEN && !isMutedRef.current) {
                // Send Float32 PCM at 16kHz — exactly what Pocket-S2S expects
                // No conversion needed: Web Audio API gives us Float32 natively
                const float32 = e.inputBuffer.getChannelData(0)
                const bytes = new Uint8Array(float32.buffer)
                let binary = ''
                const CHUNK = 0x8000
                for (let i = 0; i < bytes.length; i += CHUNK) {
                    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
                }
                wsRef.current.send(JSON.stringify({ type: 'audio_input', audio: btoa(binary) }))
            }
        }

        source.connect(processorRef.current)
        const silentSink = context.createGain()
        silentSink.gain.value = 0
        processorRef.current.connect(silentSink)
        silentSink.connect(context.destination)
    }

    const clearAudioQueue = () => {
        audioQueueRef.current = []
        if (currentSourceRef.current) {
            try {
                currentSourceRef.current.stop()
            } catch (e) { /* ignore */ }
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

        // Playback buffer at 24kHz — matching Pocket-S2S output sample rate
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

        // S2S output is Int16 PCM at 24kHz — convert to Float32 for Web Audio playback
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
                setStatus('active')
                setTranscript('')
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
                // Reconnection notices from the backend (e.g. 'Reconnecting to Aria...')
                setTranscript(data.message || '')
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

VoiceCall.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.string
}

