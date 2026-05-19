"use client"
import { supabase } from "@/lib/supabase";
import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { ArrowRight, GraduationCap } from "lucide-react"
import { useStore } from "@/store/useStore"

// Mouse-reactive premium interactive grid & particle wallpaper
const InteractiveWallpaper = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }> = []

    // Create custom nodes
    const particleCount = 45
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: i % 2 === 0 ? 'rgba(96, 165, 250, 0.25)' : 'rgba(167, 139, 250, 0.25)'
      })
    }

    let mouse = { x: -1000, y: -1000 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw faint cyber grid backdrop
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)'
      ctx.lineWidth = 1
      const gridSize = 65
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      particles.forEach((p, idx) => {
        // Apply physics
        p.x += p.vx
        p.y += p.vy

        // bounce bounds
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Mouse repelling physics
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 130) {
          const force = (130 - dist) / 130
          p.x += (dx / dist) * force * 2.2
          p.y += (dy / dist) * force * 2.2
        }

        // Render node
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 6
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0

        // Constellation links
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const lx = p.x - p2.x
          const ly = p.y - p2.y
          const lDist = Math.sqrt(lx * lx + ly * ly)
          if (lDist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.08 * (1 - lDist / 100)})`
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  )
}

export default function LandingPage() {
  const router = useRouter()
  const { user, setUser } = useStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const sessionActive = sessionStorage.getItem('smart-study-session')
    if (!sessionActive && useStore.getState().user) {
      setUser(null)
    }
    setMounted(true)
  }, [setUser])

  return (
    <div className="min-h-screen text-white overflow-hidden selection:bg-brand-purple/30 bg-[#0a0a0b] relative">

      {/* Dynamic Constellation Grid Interactive Wallpaper */}
      <InteractiveWallpaper />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0b]/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-electric via-brand-purple to-pink-500 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#0a0a0b]">
                <svg width="20" height="20" className="h-5 w-5 text-brand-electric animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M7 11.5V14a5 5 0 0 0 10 0v-2.5" />
                  <path d="M12 22V12" className="text-brand-purple" />
                </svg>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight">Smart Study</span>
          </div>
          <div className="flex items-center gap-4">
            {mounted && user ? (
              <>
                <span className="text-xs text-gray-400 hidden sm:inline-block">
                  Signed in as <strong className="text-white">{user.name || user.email.split('@')[0]}</strong>
                </span>
                <Link href="/dashboard">
                  <Button variant="premium">Go to Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="premium">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 flex flex-col items-center justify-center min-h-screen text-center px-4">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-electric/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-purple/15 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-brand-electric animate-pulse"></span>
            The Ultimate Command Center for Students
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Master your studies with <br className="hidden sm:block" />
            <span className="bg-premium-gradient bg-clip-text text-transparent">AI-powered</span> precision.
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 italic mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            "The beautiful thing about learning is that no one can take it away from you."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {mounted && user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="premium" size="lg" className="w-full text-base">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="premium" size="lg" className="w-full text-base">
                  Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

      </main>
    </div>
  )
}
