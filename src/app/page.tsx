"use client"
import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { GraduationCap, ArrowRight } from "lucide-react"
import { useStore } from "@/store/useStore"

export default function LandingPage() {
  const router = useRouter()
  const { user } = useStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen text-white overflow-hidden selection:bg-brand-purple/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0b]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-premium-gradient flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-electric/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />

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
          
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Notion, Todoist, Google Calendar, and Pomodoro — all combined into one beautifully designed, Apple-level smooth ecosystem.
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
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
              View Features
            </Button>
          </div>
        </motion.div>

      </main>
    </div>
  )
}
