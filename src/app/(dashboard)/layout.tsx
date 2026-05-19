"use client"
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { syncService } from '@/lib/syncService'

// Mouse-reactive premium interactive grid & particle wallpaper for Dashboard
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

    const particleCount = 35 // Slightly fewer for clean dashboard performance
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        color: i % 2 === 0 ? 'rgba(96, 165, 250, 0.18)' : 'rgba(167, 139, 250, 0.18)'
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

      // Cyber Grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)'
      ctx.lineWidth = 1
      const gridSize = 75
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
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 130) {
          const force = (130 - dist) / 130
          p.x += (dx / dist) * force * 2.0
          p.y += (dy / dist) * force * 2.0
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 5
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const lx = p.x - p2.x
          const ly = p.y - p2.y
          const lDist = Math.sqrt(lx * lx + ly * ly)
          if (lDist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.06 * (1 - lDist / 100)})`
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
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"
    />
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, setLastVisitedPath, resetData } = useStore()
  const [mounted, setMounted] = React.useState(false)
  const [checkingAuth, setCheckingAuth] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    async function validateAuth() {
      const sessionActive = sessionStorage.getItem('smart-study-session')
      
      if (!sessionActive || !user) {
        setUser(null)
        setCheckingAuth(false)
        router.push('/login')
        return
      }

      try {
        // 1. Verify active Supabase Auth session
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          // No active auth session found
          sessionStorage.removeItem('smart-study-session')
          setUser(null)
          resetData()
          setCheckingAuth(false)
          router.push('/login')
          return
        }

        // 2. Fetch corresponding app profile from Supabase profiles table
        const profile = await syncService.getUserProfileById(authUser.id)
        
        if (!profile) {
          // Profile row is missing
          await supabase.auth.signOut()
          sessionStorage.removeItem('smart-study-session')
          setUser(null)
          resetData()
          setCheckingAuth(false)
          alert("Access blocked: Profile not found. Please register/sign up first.")
          router.push('/login')
          return
        }

        // 3. Check for soft-deletion (is_deleted column protection)
        if (profile.is_deleted) {
          await supabase.auth.signOut()
          sessionStorage.removeItem('smart-study-session')
          setUser(null)
          resetData()
          setCheckingAuth(false)
          alert("Access blocked: This account has been deleted.")
          router.push('/login')
          return
        }

        // Validation successful! Safe to proceed.
        setLastVisitedPath(pathname)
        setCheckingAuth(false)
      } catch (err) {
        console.error("Auth validation error inside route guard:", err)
        setCheckingAuth(false)
      }
    }

    if (mounted) {
      validateAuth()
    }
  }, [mounted, user, pathname, router, setUser, setLastVisitedPath, resetData])

  if ((!user || checkingAuth) && mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col justify-center items-center">
        <div className="h-8 w-8 border-2 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 mt-4 font-semibold tracking-wide">Securing dashboard session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-brand-purple/30 relative overflow-hidden">
      
      {/* Dynamic Cyber Reactive Constellation Wallpaper Layer */}
      <InteractiveWallpaper />

      <div className="relative z-10">
        <Sidebar />
        <div className="flex flex-col md:pl-64">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 animate-fade-in relative z-20">
            {mounted ? children : (
              <div className="flex flex-col justify-center items-center py-32">
                <div className="h-8 w-8 border-2 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 mt-4 font-semibold tracking-wide">Restoring workspace...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
