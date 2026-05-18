"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Play, Pause, RotateCcw, Volume2, Settings2, Coffee, BookOpen, 
  VolumeX, Music, Check, Sparkles, Sliders, ChevronDown, ChevronUp,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FocusPage() {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [mode, setMode] = useState<'focus' | 'short-break' | 'long-break'>('focus')

  // --- CUSTOMIZABLE DURATIONS (in minutes) ---
  const [focusDur, setFocusDur] = useState(25)
  const [shortBreakDur, setShortBreakDur] = useState(5)
  const [longBreakDur, setLongBreakDur] = useState(15)

  // --- TIMER SOUND SELECTIONS ---
  const [timerSound, setTimerSound] = useState<'digital' | 'classic' | 'chime' | 'lofi' | 'silent'>('chime')

  // --- PANELS OPEN STATE ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAmbientOpen, setIsAmbientOpen] = useState(false)

  // --- AMBIENT SOUND GENERATOR STATES ---
  const [activeAmbient, setActiveAmbient] = useState<'rain' | 'forest' | 'noise' | 'none'>('none')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const ambientNodesRef = useRef<{ source: AudioNode; gain: GainNode } | null>(null)

  // --- WEB AUDIO SYNTHESIZERS ---
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      audioCtxRef.current = new AudioContextClass()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // Synthesize beautiful notification alarms
  const playAlarmSound = (soundType: typeof timerSound) => {
    try {
      const ctx = getAudioContext()
      
      if (soundType === 'digital') {
        // Digital beeps (Beep Beep Beep)
        const playBeep = (delay: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(880, ctx.currentTime + delay)
          gain.gain.setValueAtTime(0, ctx.currentTime + delay)
          gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + delay)
          osc.stop(ctx.currentTime + delay + 0.2)
        }
        playBeep(0)
        playBeep(0.22)
        playBeep(0.44)
      } else if (soundType === 'classic') {
        // Classic mechanical school alarm bell
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(620, ctx.currentTime)
        
        const modulator = ctx.createOscillator()
        const modGain = ctx.createGain()
        modulator.frequency.value = 24 // Frequency vibration
        modGain.gain.value = 90
        
        modulator.connect(modGain)
        modGain.connect(osc.frequency)
        
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        modulator.start()
        osc.start()
        modulator.stop(ctx.currentTime + 1.2)
        osc.stop(ctx.currentTime + 1.2)
      } else if (soundType === 'chime') {
        // Soft Tibetan bowl resonance
        const playFreq = (freq: number, vol: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, ctx.currentTime)
          gain.gain.setValueAtTime(0, ctx.currentTime)
          gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.08)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 2.3)
        }
        playFreq(392, 0.22) // Solfeggio frequency
        playFreq(587.33, 0.08)
        playFreq(784, 0.04)
      } else if (soundType === 'lofi') {
        // Warm lofi keyboard ambient sweep
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(261.63, ctx.currentTime) // C4 note
        osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.7) // C5 sweep
        
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(150, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.5)
        
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6)
        
        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start()
        osc.stop(ctx.currentTime + 1.7)
      }
    } catch (e) {
      console.warn("Audio Context block:", e)
    }
  }

  // Synthesize running background ambient noise looping filters
  const startAmbientGenerator = (ambientType: 'rain' | 'forest' | 'noise') => {
    stopAmbientGenerator()
    try {
      const ctx = getAudioContext()
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      
      // Seed buffer with white/pink noise properties
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        if (ambientType === 'rain' || ambientType === 'forest') {
          // Filter to pink-brownish rumbling noise
          output[i] = (lastOut + (0.02 * white)) / 1.02
          lastOut = output[i]
          output[i] *= 3.5 // Rumbling amplification
        } else {
          output[i] = white * 0.15
        }
      }
      
      const noiseNode = ctx.createBufferSource()
      noiseNode.buffer = noiseBuffer
      noiseNode.loop = true
      
      const filter = ctx.createBiquadFilter()
      const gainNode = ctx.createGain()
      
      if (ambientType === 'rain') {
        // High frequency wash for rain raindrops sound
        filter.type = 'peaking'
        filter.frequency.value = 1000
        filter.Q.value = 1
        filter.gain.value = 4
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime)
      } else if (ambientType === 'forest') {
        // Whispering wind pine sound
        filter.type = 'bandpass'
        filter.frequency.value = 400
        filter.Q.value = 1.8
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
        
        // Modulate filter frequency slowly to sound like wind gusts
        const windLfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        windLfo.frequency.value = 0.12 // slow wind gust cycles
        lfoGain.gain.value = 180
        windLfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)
        windLfo.start()
      } else {
        // Deep pure focus white noise
        filter.type = 'lowpass'
        filter.frequency.value = 1200
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
      }
      
      noiseNode.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)
      noiseNode.start()
      
      ambientNodesRef.current = { source: noiseNode, gain: gainNode }
    } catch (e) {
      console.warn("Ambient sounds initialization skipped:", e)
    }
  }

  const stopAmbientGenerator = () => {
    if (ambientNodesRef.current) {
      try {
        const src = ambientNodesRef.current.source as AudioBufferSourceNode
        src.stop()
      } catch (e) {}
      ambientNodesRef.current = null
    }
  }

  useEffect(() => {
    return () => stopAmbientGenerator()
  }, [])

  // Handle ambient selections
  const handleToggleAmbient = (ambientType: typeof activeAmbient) => {
    if (activeAmbient === ambientType) {
      setActiveAmbient('none')
      stopAmbientGenerator()
    } else {
      setActiveAmbient(ambientType)
      if (ambientType !== 'none') {
        startAmbientGenerator(ambientType)
      } else {
        stopAmbientGenerator()
      }
    }
  }

  // --- INTERVAL CLOCK LOOP ---
  useEffect(() => {
    let interval: any = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      playAlarmSound(timerSound)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, timerSound])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  // --- DURATION UPDATERS ---
  const setTimerMode = (newMode: 'focus' | 'short-break' | 'long-break') => {
    setMode(newMode)
    setIsActive(false)
    if (newMode === 'focus') setTimeLeft(focusDur * 60)
    if (newMode === 'short-break') setTimeLeft(shortBreakDur * 60)
    if (newMode === 'long-break') setTimeLeft(longBreakDur * 60)
  }

  const applyCustomDurations = () => {
    setIsSettingsOpen(false)
    if (mode === 'focus') setTimeLeft(focusDur * 60)
    if (mode === 'short-break') setTimeLeft(shortBreakDur * 60)
    if (mode === 'long-break') setTimeLeft(longBreakDur * 60)
  }

  const toggleTimer = () => setIsActive(!isActive)
  
  const resetTimer = () => {
    setIsActive(false)
    setTimerMode(mode)
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[85vh] pb-10">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2 justify-center">
          <Clock className="h-7 w-7 text-brand-electric animate-pulse" />
          Focus & Productivity Timer
        </h1>
        <p className="text-gray-400 mt-1">Stay in the zone and accomplish your study goals.</p>
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        
        {/* Center Timer Card */}
        <Card premium className="w-full max-w-md bg-[#0a0a0b]/60 border-white/10 p-2 shadow-2xl">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">
            
            {/* mode toggles */}
            <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-full backdrop-blur-md w-full justify-between">
              <Button 
                variant={mode === 'focus' ? 'premium' : 'ghost'} 
                className={`flex-1 rounded-full text-xs sm:text-sm ${mode !== 'focus' ? 'text-gray-400' : ''}`}
                onClick={() => setTimerMode('focus')}
              >
                <BookOpen className="h-3.5 w-3.5 mr-1.5 hidden sm:inline-block" /> Focus
              </Button>
              <Button 
                variant={mode === 'short-break' ? 'secondary' : 'ghost'} 
                className={`flex-1 rounded-full text-xs sm:text-sm ${mode !== 'short-break' ? 'text-gray-400' : ''}`}
                onClick={() => setTimerMode('short-break')}
              >
                <Coffee className="h-3.5 w-3.5 mr-1.5 hidden sm:inline-block" /> Short Break
              </Button>
              <Button 
                variant={mode === 'long-break' ? 'secondary' : 'ghost'} 
                className={`flex-1 rounded-full text-xs sm:text-sm ${mode !== 'long-break' ? 'text-gray-400' : ''}`}
                onClick={() => setTimerMode('long-break')}
              >
                Long Break
              </Button>
            </div>

            {/* circular dial */}
            <div className="relative flex items-center justify-center w-64 h-64">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="128" 
                  cy="128" 
                  r="120" 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  fill="transparent" 
                  className={`${mode === 'focus' ? 'text-brand-electric' : 'text-emerald-500'} transition-all duration-1000 ease-linear`}
                  strokeDasharray="753.98"
                  strokeDashoffset={753.98 - (753.98 * (timeLeft / (mode === 'focus' ? focusDur*60 : mode === 'short-break' ? shortBreakDur*60 : longBreakDur*60)))}
                />
              </svg>
              <div className="absolute text-5xl font-black tracking-tighter text-white font-mono">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* controls buttons */}
            <div className="flex gap-4">
              {/* Play / Pause button */}
              <Button 
                variant={isActive ? "outline" : "premium"} 
                size="lg" 
                className="w-32 h-14 text-lg rounded-2xl bg-brand-electric shadow-lg shadow-brand-electric/15 hover:scale-105 transition-all" 
                onClick={toggleTimer}
              >
                {isActive ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 ml-1 text-white" />}
              </Button>

              {/* Pure Reset Sign (No surrounding box/background) */}
              <button 
                onClick={resetTimer}
                className="w-14 h-14 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Reset Timer"
              >
                <RotateCcw className="h-6 w-6" />
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Settings panel triggers */}
        <div className="flex items-center justify-center gap-6 shrink-0 mt-2">
          <Button 
            variant="ghost" 
            onClick={() => {
              setIsAmbientOpen(!isAmbientOpen)
              setIsSettingsOpen(false)
            }}
            className={`text-xs uppercase tracking-wider font-bold transition-all ${isAmbientOpen ? 'text-brand-purple' : 'text-gray-400 hover:text-white'}`}
          >
            <Volume2 className="h-4.5 w-4.5 mr-1.5" /> Ambient Sounds
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen)
              setIsAmbientOpen(false)
            }}
            className={`text-xs uppercase tracking-wider font-bold transition-all ${isSettingsOpen ? 'text-brand-electric' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings2 className="h-4.5 w-4.5 mr-1.5" /> Settings
          </Button>
        </div>

        {/* Expandable Drawers (Centered below card) */}
        <div className="w-full max-w-md space-y-4">
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Card premium className="bg-[#0a0a0b]/80 border-white/10 p-6">
                  <CardHeader className="p-0 pb-4 border-b border-white/5">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-brand-electric flex items-center gap-2">
                      <Sliders className="h-4 w-4" /> Timer Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 space-y-6">
                    {/* Durations */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Custom Durations (Min)</h4>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs font-semibold text-gray-300">Focus Session</span>
                          <input 
                            type="number" 
                            min="1" 
                            max="180"
                            value={focusDur}
                            onChange={(e) => setFocusDur(Math.max(1, parseInt(e.target.value) || 25))}
                            className="w-16 h-8 bg-black/40 border border-white/10 rounded-lg text-center text-xs font-bold text-white outline-none focus:border-brand-electric"
                          />
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs font-semibold text-gray-300">Short Break</span>
                          <input 
                            type="number" 
                            min="1" 
                            max="60"
                            value={shortBreakDur}
                            onChange={(e) => setShortBreakDur(Math.max(1, parseInt(e.target.value) || 5))}
                            className="w-16 h-8 bg-black/40 border border-white/10 rounded-lg text-center text-xs font-bold text-white outline-none focus:border-brand-electric"
                          />
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs font-semibold text-gray-300">Long Break</span>
                          <input 
                            type="number" 
                            min="1" 
                            max="120"
                            value={longBreakDur}
                            onChange={(e) => setLongBreakDur(Math.max(1, parseInt(e.target.value) || 15))}
                            className="w-16 h-8 bg-black/40 border border-white/10 rounded-lg text-center text-xs font-bold text-white outline-none focus:border-brand-electric"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Alarm Selection */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Timer Alarm Sound</h4>
                      <div className="space-y-1.5">
                        {[
                          { id: 'chime', name: 'Tibetan Chime 🧘' },
                          { id: 'digital', name: 'Digital Alert ⏰' },
                          { id: 'classic', name: 'School Bell 🔔' },
                          { id: 'lofi', name: 'Lofi Synth 🎵' },
                          { id: 'silent', name: 'Silent / Visual 🔕' }
                        ].map((sound) => (
                          <div 
                            key={sound.id}
                            onClick={() => {
                              setTimerSound(sound.id as any)
                              if (sound.id !== 'silent') playAlarmSound(sound.id as any)
                            }}
                            className={`flex justify-between items-center p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${timerSound === sound.id ? 'bg-brand-electric/10 border-brand-electric/50 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                          >
                            <span>{sound.name}</span>
                            {timerSound === sound.id ? (
                              <Check className="h-3.5 w-3.5 text-brand-electric" />
                            ) : (
                              <span className="text-[10px] text-gray-500 uppercase">Listen</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Button 
                      variant="premium" 
                      onClick={applyCustomDurations}
                      className="w-full h-9 text-xs font-bold uppercase tracking-wider rounded-xl bg-brand-electric shadow-lg shadow-brand-electric/10"
                    >
                      Apply & Save Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isAmbientOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Card premium className="bg-[#0a0a0b]/80 border-white/10 p-6">
                  <CardHeader className="p-0 pb-4 border-b border-white/5">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-brand-purple flex items-center gap-2">
                      <Music className="h-4 w-4" /> Ambient Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 space-y-4">
                    <p className="text-[10px] text-gray-400 leading-normal font-semibold">
                      Loop ambient white noise generated in real-time inside your browser to block external study distractions.
                    </p>

                    <div className="space-y-2">
                      {[
                        { id: 'rain', name: 'Rain Storm 🌧️' },
                        { id: 'forest', name: 'Deep Forest Wind 🌲' },
                        { id: 'noise', name: 'Deep White Noise 🔕' }
                      ].map((ambient) => (
                        <div 
                          key={ambient.id}
                          onClick={() => handleToggleAmbient(ambient.id as any)}
                          className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${activeAmbient === ambient.id ? 'bg-brand-purple/10 border-brand-purple/50 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          <span>{ambient.name}</span>
                          <span className={`text-[10px] font-bold uppercase ${activeAmbient === ambient.id ? 'text-brand-purple' : 'text-gray-500'}`}>
                            {activeAmbient === ambient.id ? 'Playing' : 'Play'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {activeAmbient !== 'none' && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleToggleAmbient('none')}
                        className="w-full h-8 border-red-500/25 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                      >
                        <VolumeX className="h-3.5 w-3.5 mr-1" /> Mute Ambient
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
