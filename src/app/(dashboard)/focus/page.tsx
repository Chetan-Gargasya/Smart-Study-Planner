"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Play, Pause, RotateCcw, Volume2, Settings2, Coffee, BookOpen } from 'lucide-react'

export default function FocusPage() {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [mode, setMode] = useState<'focus' | 'short-break' | 'long-break'>('focus')

  useEffect(() => {
    let interval: any = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  const setTimerMode = (newMode: 'focus' | 'short-break' | 'long-break') => {
    setMode(newMode)
    setIsActive(false)
    if (newMode === 'focus') setTimeLeft(25 * 60)
    if (newMode === 'short-break') setTimeLeft(5 * 60)
    if (newMode === 'long-break') setTimeLeft(15 * 60)
  }

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTimerMode(mode)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Deep Focus</h1>
        <p className="text-gray-400">Stay in the zone and accomplish your goals.</p>
      </div>

      <Card premium className="w-full max-w-md bg-[#0a0a0b]/60 border-white/10 p-2">
        <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">
          <div className="flex gap-2 p-1 bg-white/5 rounded-full backdrop-blur-md w-full justify-between">
            <Button 
              variant={mode === 'focus' ? 'premium' : 'ghost'} 
              className={`flex-1 rounded-full ${mode !== 'focus' ? 'text-gray-400' : ''}`}
              onClick={() => setTimerMode('focus')}
            >
              <BookOpen className="h-4 w-4 mr-2 hidden sm:block" /> Focus
            </Button>
            <Button 
              variant={mode === 'short-break' ? 'secondary' : 'ghost'} 
              className={`flex-1 rounded-full ${mode !== 'short-break' ? 'text-gray-400' : ''}`}
              onClick={() => setTimerMode('short-break')}
            >
              <Coffee className="h-4 w-4 mr-2 hidden sm:block" /> Short Break
            </Button>
            <Button 
              variant={mode === 'long-break' ? 'secondary' : 'ghost'} 
              className={`flex-1 rounded-full ${mode !== 'long-break' ? 'text-gray-400' : ''}`}
              onClick={() => setTimerMode('long-break')}
            >
              Long Break
            </Button>
          </div>

          <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle 
                cx="128" cy="128" r="120" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
                className={`${mode === 'focus' ? 'text-brand-electric' : 'text-emerald-500'} transition-all duration-1000 ease-linear`}
                strokeDasharray="753.98"
                strokeDashoffset={753.98 - (753.98 * (timeLeft / (mode === 'focus' ? 25*60 : mode === 'short-break' ? 5*60 : 15*60)))}
              />
            </svg>
            <div className="absolute text-6xl font-bold tracking-tighter text-white">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant={isActive ? "outline" : "premium"} size="lg" className="w-32 h-14 text-lg rounded-2xl" onClick={toggleTimer}>
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button variant="outline" size="lg" className="w-14 h-14 rounded-2xl" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex items-center gap-6">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <Volume2 className="h-5 w-5 mr-2" /> Ambient Sounds
        </Button>
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <Settings2 className="h-5 w-5 mr-2" /> Settings
        </Button>
      </div>
    </div>
  )
}
