import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Mic, PhoneOff, Sparkles, Volume2 } from 'lucide-react'
import { voiceCallService } from '../services/api'

const VoiceCall = ({ isOpen, onClose, mode = 'voiceCall' }) => {
    const [status, setStatus] = useState('initializing') // initializing, connecting, active, error
    const [transcript, setTranscript] = useState('')
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [error, setError] = useState(null)

    const wsRef = useRef(null)
    const audioContextRef = useRef(null)
    const streamRef = useRef(null)
    const processorRef = useRef(null)
    const audioQueueRef = useRef([])
    const isPlayingRef = useRef(false)

    // Status title mapping for flattened logic
    const statusTitle = useMemo(() => {
        if (status === 'connecting') return 'Connecting to Aria...'
        if (status === 'error') return 'Sanctuary Interrupted'
        return 'Real-time Presence'
    }, [status])

    const endCall = () => {
        if (wsRef.current) wsRef.current.close()
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        if (audioContextRef.current) audioContextRef.current.close()

        wsRef.current = null
        streamRef.current = null
        audioContextRef.current = null
        setStatus('initializing')
        setTranscript('')
        setError(null)
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

            // 3. Setup WebSocket
            const wsUrl = voiceCallService.getWebSocketUrl(session_id)
            wsRef.current = new WebSocket(wsUrl)

            wsRef.current.onopen = () => {
                setStatus('connecting')
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
                // Convert Float32 to Int16
                const pcm16 = new Int16Array(inputData.length)
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]))
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
                }
                // Encode to base64 and send
                const base64Arr = new Uint8Array(pcm16.buffer)
                const base64 = btoa(String.fromCodePoint(...base64Arr))
                wsRef.current.send(JSON.stringify({ type: 'audio_input', audio: base64 }))
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
                setTranscript('Aria is listening...')
                break
            case 'audio_output':
                queueAudioResponse(data.audio)
                break
            case 'transcript':
                setTranscript(prev => prev + data.text)
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
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10, 10, 12, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', textAlign: 'center'
        }}>
            <AnimatedPulsingCircle active={status === 'active'} speaking={isSpeaking} />

            <div style={{ maxWidth: '600px', width: '100%', marginTop: '3rem' }}>
                <h2 className="font-serif" style={{ color: 'var(--text-main)', fontSize: '2rem', marginBottom: '1rem' }}>
                    {statusTitle}
                </h2>

                <div style={{
                    minHeight: '120px', padding: '1.5rem', borderRadius: '24px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic'
                }}>
                    {error || transcript || (status === 'connecting' ? 'Preparing the spiritual bridge...' : 'Aria is listening...')}
                </div>
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', gap: '2rem' }}>
                <button
                    onClick={onClose}
                    style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: '#ef4444',
                        border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)', transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                    <PhoneOff size={32} />
                </button>
            </div>

            <div style={{ position: 'absolute', bottom: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                SACRED VOICE CHANNEL ENCRYPTED
            </div>
        </div>
    )
}

VoiceCall.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.string
}

const AnimatedPulsingCircle = ({ active, speaking }) => {
    return (
        <div style={{ position: 'relative' }}>
            {/* Outer Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '300px', height: '300px', borderRadius: '50%',
                background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)',
                opacity: active ? 0.3 : 0.1, transition: 'opacity 1s ease'
            }}></div>

            {/* Main Circle */}
            <div style={{
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'var(--bg-card)', border: '2px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1, boxShadow: active ? '0 0 50px rgba(139, 92, 246, 0.2)' : 'none'
            }}>
                <div style={{
                    width: speaking ? '100px' : '80px', height: speaking ? '100px' : '80px',
                    background: 'var(--brand-solid)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    {speaking ? <Volume2 size={40} /> : <Mic size={40} />}
                </div>
            </div>

            {/* Ripple Rings */}
            {active && [1, 2, 3].map(i => (
                <div key={i} className="ripple" style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '200px', height: '200px', borderRadius: '50%',
                    border: '1px solid var(--brand-solid)', opacity: 0.5,
                    animation: `ripple 3s infinite ${i}s`
                }}></div>
            ))}

            <style>{`
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>
        </div>
    )
}

AnimatedPulsingCircle.propTypes = {
    active: PropTypes.bool.isRequired,
    speaking: PropTypes.bool.isRequired
}

export default VoiceCall
