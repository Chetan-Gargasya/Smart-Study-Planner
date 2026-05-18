"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Clock, CalendarDays, BookOpen, GraduationCap, Calculator, BarChart3, Target, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Focus Timer', href: '/focus', icon: Clock },
  { name: 'Notes', href: '/notes', icon: BookOpen },
  { name: 'Attendance', href: '/attendance', icon: GraduationCap },
  { name: 'CGPA Calc', href: '/cgpa', icon: Calculator },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser, resetData } = useStore()

  const handleLogout = () => {
    setUser(null)
    resetData()
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-[#0a0a0b]/80 backdrop-blur-xl hidden md:block">
      <div className="flex h-full flex-col px-4 py-6">
        <Link href="/" className="mb-8 flex items-center px-2 cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-electric via-brand-purple to-pink-500 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#0a0a0b]">
              <svg width="20" height="20" className="h-5 w-5 text-brand-electric animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M7 11.5V14a5 5 0 0 0 10 0v-2.5" />
                <path d="M12 22V12" className="text-brand-purple" />
              </svg>
            </div>
          </div>
          <span className="ml-3 text-lg font-bold text-white tracking-tight">Smart Study</span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive ? "text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/5"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("mr-3 h-5 w-5 z-10", isActive ? "text-brand-electric" : "text-gray-500 group-hover:text-gray-300")} />
                  <span className="z-10">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6">
          {user && (
            <Link href="/settings">
              <div className="flex items-center gap-3 px-3 py-2.5 mb-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-premium-gradient flex items-center justify-center text-sm font-bold text-white shadow-[0_0_10px_rgba(139,92,246,0.3)] shrink-0">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-brand-electric transition-colors">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </Link>
          )}
          <button onClick={handleLogout} className="group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="mr-3 h-5 w-5 text-gray-500 group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
