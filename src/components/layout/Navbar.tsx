"use client"
import React from 'react'
import { Bell, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#0a0a0b]/80 px-6 backdrop-blur-xl">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Search tasks, notes, or schedules..." 
            className="pl-10 bg-white/5 border-white/10 rounded-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5 text-gray-400" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-electric"></span>
        </Button>
        <div className="h-8 w-8 rounded-full bg-premium-gradient p-[2px] cursor-pointer">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0a0b]">
            <User className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
