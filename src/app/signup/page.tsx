"use client"
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const { user, setUser, resetData } = useStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    setUser(null)
    resetData()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanedEmail = email.trim().toLowerCase().replace(/\s+/g, '.');

    const isValidDomain = cleanedEmail.endsWith('.edu.in') || 
                          cleanedEmail.endsWith('.ac.in') || 
                          cleanedEmail.endsWith('@gmail.com');

    if (!isValidDomain) {
      setError('Only university email addresses (.edu.in, .ac.in) or Gmail (@gmail.com) are allowed.');
      setLoading(false);
      return;
    }

    const registeredUsers = useStore.getState().registeredUsers;
    const isAlreadyRegistered = registeredUsers.some(u => u.email.toLowerCase() === cleanedEmail);

    if (isAlreadyRegistered) {
      setError('An account with this email already exists.');
      setLoading(false);
      return;
    }

    // Call store local signup procedure
    useStore.getState().registerUser({
      name,
      email: cleanedEmail,
      password // stored securely locally
    });

    setLoading(false)
    alert("Account created successfully! You can now log in.")
    router.push('/login')
  }

  // Already logged in blocker screen
  if (mounted && user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 selection:bg-brand-purple/30 relative overflow-hidden">
        {/* Background glow elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />

        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group z-10">
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <GraduationCap className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <span className="font-medium text-gray-400 group-hover:text-white transition-colors">Back to home</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
            
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-8 w-8" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Already Logged In</h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              You are currently signed in as <strong className="text-white font-semibold">{user.email}</strong>. <br />
              Please log out first if you wish to create a new account.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/dashboard" className="w-full">
                <Button variant="premium" className="w-full h-11 text-sm font-semibold">
                  Go to Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-11 text-sm font-semibold border-white/10 hover:bg-red-500/10 hover:text-red-400"
                onClick={handleLogout}
              >
                Sign Out / Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 selection:bg-brand-purple/30 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-electric/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group z-10">
        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <GraduationCap className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <span className="font-medium text-gray-400 group-hover:text-white transition-colors">Back to home</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-purple to-transparent opacity-50" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create an account</h1>
            <p className="text-gray-400">Join the ultimate student command center</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <Input type="text" placeholder="Alex Carter" value={name} onChange={(e) => setName(e.target.value)} required className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <Input type="email" placeholder="alex@university.edu" value={email} onChange={(e) => setEmail(e.target.value.replace(/\s+/g, '.'))} required className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
            </div>

            <Button variant="premium" type="submit" disabled={loading} className="w-full h-12 text-base mt-4">
              {loading ? 'Creating Account...' : 'Get Started'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:text-brand-electric transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
