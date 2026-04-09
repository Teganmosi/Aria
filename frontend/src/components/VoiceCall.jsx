import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Mic, PhoneOff, Sparkles, Volume2, ShieldCheck, Headphones } from 'lucide-react'
import { voiceCallService } from '../services/api'
import './VoiceCall.css'

const VoiceCall = ({ isOpen, onClose, mode = 'voiceCall' }) => {
    const [status, setStatus] = useState('initializing') // initializing, connecting, active, error
    const [transcript, setTranscript] = useState('')
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [error, setError] = useState(null)
    const [volume, setVolume] = useState(0)

    const wsRef = useRef(null)
    const audioContextRef = useRef(null)
    const streamRef = useRef(null)
    const processorRef = useRef(null)
    const audioQueueRef = useRef([])
    const isPlayingRef = useRef(false)
    const analyserRef = useRef(null)
    const animationFrameRef = useRef(null)

    // Status label mapping
    const statusLabel = useMemo(() => {
        if (status === 'connecting') return 'Establishing Spiritual Bridge'
        if (status === 'active') return isSpeaking ? 'Aria is speaking' : 'Listening with care'
        if (status === 'error') return 'Connection Interrupted'
        return 'Initializing'
    }, [status, isSpeaking])

    const endCall = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        if (wsRef.current) wsRef.current.close()
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        if (audioContextRef.current) audioContextRef.current.close()

        wsRef.current = null
        streamRef.current = null
        audioContextRef.current = null
        analyserRef.current = null
        setStatus('initializing')
        setTranscript('')
        setError(null)
        setVolume(0)
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
            audioContextRef.current = new AudioCtx({ sampleRate: 24000 })
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })

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

            wsRef.current.onerror = (err) => {
                console.error('WS Error:', err)
                setError('Connection failed. Please try again.')
                setStatus('error')
            }

            wsRef.current.onclose = () => {
                if (status !== 'error') setStatus('initializing')
            }

        } catch (err) {
            console.error('Failed to start call:', err)
            setError(err.message || 'Could not access microphone')
            setStatus('error')
        }
    }

    const setupAudioProcessor = () => {
        const context = audioContextRef.current
        const source = context.createMediaStreamSource(streamRef.current)

        // Using ScriptProcessorNode as per legacy fallback strategy
        processorRef.current = context.createScriptProcessor(4096, 1, 1)

        processorRef.current.onaudioprocess = (e) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const inputData = e.inputBuffer.getChannelData(0)
                const pcm16 = new Int16Array(inputData.length)
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]))
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
                }
                if (!isMuted) {
                    const base64Arr = new Uint8Array(pcm16.buffer)
                    const base64 = btoa(String.fromCodePoint(...base64Arr))
                    wsRef.current.send(JSON.stringify({ type: 'audio_input', audio: base64 }))
                }
            }
        }

        source.connect(processorRef.current)
        processorRef.current.connect(context.destination)
    }

    const clearAudioQueue = () => {
        audioQueueRef.current = []
    }

    const playNextInQueue = () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false
            return
        }

        isPlayingRef.current = true
        const chunk = audioQueueRef.current.shift()
        const context = audioContextRef.current

        const buffer = context.createBuffer(1, chunk.length, 24000)
        buffer.getChannelData(0).set(chunk)

        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.onended = playNextInQueue
        source.start()
    }

    const queueAudioResponse = (base64Audio) => {
        const binary = atob(base64Audio)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.codePointAt(i)
        }

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
                setIsSpeaking(data.speaking)
                if (data.speaking) {
                    clearAudioQueue()
                }
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

            <div className={`avatar-container ${status === 'active' ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}>
                <div className="avatar-glow"></div>
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
                
                <div className="avatar-image-wrapper">
                    <img
                        src="/aria_avatar.png"
                        alt="Aria"
                        className={`avatar-image ${status !== 'active' ? 'inactive' : ''}`}
                    />
                </div>
            </div>

            <div className="voice-call-info">
                <span className="status-label">{statusLabel}</span>
                <h2 className="call-title">Aria</h2>

                <div className="waveform-container">
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`wave-bar ${isSpeaking ? 'speaking' : ''}`}
                            style={{ 
                                height: `${Math.max(8, (isSpeaking || volume > 10) ? (Math.random() * volume + 10) : 8)}px`,
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

export default VoiceCall
