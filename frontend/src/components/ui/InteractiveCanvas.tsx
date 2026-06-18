import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  targetAlpha: number
}

export const InteractiveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000, tx: -1000, ty: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    const particleCount = window.innerWidth < 768 ? 35 : 75

    // Initialize dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Helper to generate particle
    const createParticle = (x?: number, y?: number, forceVelocity = false): Particle => {
      const px = x ?? Math.random() * canvas.width
      const py = y ?? Math.random() * canvas.height
      return {
        x: px,
        y: py,
        vx: forceVelocity ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.35,
        vy: forceVelocity ? -Math.random() * 2 - 0.5 : -Math.random() * 0.5 - 0.2,
        size: Math.random() * 2.5 + 0.8,
        alpha: 0,
        targetAlpha: Math.random() * 0.3 + 0.15
      }
    }

    // Populate initial particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle())
    }

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.tx = e.clientX - rect.left
      mouseRef.current.ty = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseRef.current.tx = -1000
      mouseRef.current.ty = -1000
    }

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      
      // Spawn burst
      const burstCount = 8
      for (let i = 0; i < burstCount; i++) {
        if (particles.length > particleCount + 20) {
          particles.shift() // Keep maximum limit
        }
        particles.push(createParticle(clickX, clickY, true))
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    canvas.addEventListener('click', handleCanvasClick, { passive: true })

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse coordinates
      const mouse = mouseRef.current
      if (mouse.tx !== -1000) {
        if (mouse.x === -1000) {
          mouse.x = mouse.tx
          mouse.y = mouse.ty
        } else {
          mouse.x += (mouse.tx - mouse.x) * 0.1
          mouse.y += (mouse.ty - mouse.y) * 0.1
        }
      } else {
        mouse.x = -1000
        mouse.y = -1000
      }

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Drift
        p.y += p.vy
        p.x += p.vx

        // Wind sway
        p.vx += (Math.random() - 0.5) * 0.01

        // Fade in
        if (p.alpha < p.targetAlpha) {
          p.alpha += 0.008
        }

        // Repel from mouse
        if (mouse.x !== -1000) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const distance = Math.hypot(dx, dy)
          const forceRadius = 120

          if (distance < forceRadius) {
            const force = (forceRadius - distance) / forceRadius
            const angle = Math.atan2(dy, dx)
            p.x += Math.cos(angle) * force * 1.5
            p.y += Math.sin(angle) * force * 1.5
          }
        }

        // Loop screen
        if (p.y < -10) {
          particles[i] = createParticle(undefined, canvas.height + 10)
        }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10

        // Render
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        
        // Soft glowing golden color matching Aria's accent
        ctx.fillStyle = `rgba(245, 206, 77, ${p.alpha})`
        ctx.shadowBlur = p.size * 2
        ctx.shadowColor = 'rgba(245, 206, 77, 0.4)'
        ctx.fill()
      }

      ctx.shadowBlur = 0 // Reset shadow for efficiency
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleCanvasClick)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ mixBlendMode: 'screen', zIndex: 1 }}
    />
  )
}

export default InteractiveCanvas
