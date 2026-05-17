"use client"
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { useStore } from '@/store/useStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setLastVisitedPath } = useStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted) {
      if (!user) {
        router.push('/login')
      } else {
        setLastVisitedPath(pathname)
      }
    }
  }, [user, pathname, router, setLastVisitedPath, mounted])

  // Avoid hydrations/flickers by rendering loading screen or empty page until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col justify-center items-center">
        <div className="h-10 w-10 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 font-medium animate-pulse">Restoring your workspace...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-brand-purple/30">
      <Sidebar />
      <div className="flex flex-col md:pl-64">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
