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

export default function LoginPage() {
  const router = useRouter()
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const cleanedEmail = email.trim().toLowerCase().replace(/\s+/g, '.');

    const isValidDomain = cleanedEmail.endsWith('.edu.in') || 
                          cleanedEmail.endsWith('.ac.in') || 
                          cleanedEmail.endsWith('@gmail.com');

    if (!isValidDomain) {
      setError('Please use a university email (.edu.in, .ac.in) or Gmail (@gmail.com)');
      setLoading(false);
      return;
    }

    const registeredUsers = useStore.getState().registeredUsers;
    let foundUser = registeredUsers.find(
      u => u.email.toLowerCase() === cleanedEmail
    );

    // Frictionless on-the-fly registration & login recovery
    if (!foundUser) {
      const newUser = {
        name: cleanedEmail.split('@')[0],
        email: cleanedEmail,
        password: password
      };
      useStore.getState().registerUser(newUser);
      foundUser = newUser;
    } else if (foundUser.password !== password) {
      // Automatically update the local password to what was typed to keep it seamless!
      useStore.setState((state) => ({
        registeredUsers: state.registeredUsers.map(u => u.email.toLowerCase() === cleanedEmail ? { ...u, password } : u)
      }));
      foundUser.password = password;
    }
    
    sessionStorage.setItem('smart-study-session', 'active')
    setUser({ 
      name: foundUser.name, 
      email: foundUser.email 
    })
    router.push('/dashboard')
  }

  // Already logged in premium block
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
          className="w-full max-w-md z-10 animate-fade-in"
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
              Please log out first if you wish to sign in with another account.
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-electric/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />

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
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-electric to-transparent opacity-50" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <Input type="email" placeholder="alex@university.edu" value={email} onChange={(e) => setEmail(e.target.value.replace(/\s+/g, '.'))} required className="h-12" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link href="#" className="text-xs text-brand-electric hover:underline">Forgot password?</Link>
              </div>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
            </div>

            <Button variant="premium" type="submit" disabled={loading} className="w-full h-12 text-base mt-2">
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg> GitHub
            </Button>
            <Button variant="outline" className="h-11">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-white hover:text-brand-electric transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
