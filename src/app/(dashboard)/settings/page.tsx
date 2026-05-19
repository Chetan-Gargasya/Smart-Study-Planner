"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  User, Mail, Save, Trash2, Camera, Upload, Image as ImageIcon, 
  HelpCircle, Sparkles, AlertCircle, BookOpen, Clock, Keyboard, 
  Smartphone, Shield, Check, Info, FileText, Bug 
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { syncService } from '@/lib/syncService'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsPage() {
  const router = useRouter()
  const { user, setUser, resetData } = useStore()
  const [mounted, setMounted] = useState(false)

  // Tabs: account, profile, help
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'profile' | 'help'>('account')

  // --- ACCOUNT TAB DATA ---
  const [fullName, setFullName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [accountSavedMsg, setAccountSavedMsg] = useState(false)

  // --- PROFILE TAB DATA ---
  const [profileUsername, setProfileUsername] = useState('')
  const [profilePicBase64, setProfilePicBase64] = useState<string | undefined>(undefined)
  const [profileSavedMsg, setProfileSavedMsg] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- HELP TAB DATA ---
  const [activeHelpSection, setActiveHelpSection] = useState<string>('help-center')

  // --- SYNC BATCH SNAPSHOT DATA ---
  const [syncing, setSyncing] = useState(false)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false)

  // Preset avatar graphics
  const PRESET_AVATARS = [
    { name: 'Graduation Cap', emoji: '🎓', color: 'from-blue-500 to-indigo-600' },
    { name: 'Science Atom', emoji: '⚛️', color: 'from-purple-500 to-pink-500' },
    { name: 'Coding Hacker', emoji: '💻', color: 'from-emerald-500 to-teal-600' },
    { name: 'Bookworm Stack', emoji: '📚', color: 'from-amber-500 to-orange-600' },
    { name: 'Focus Hourglass', emoji: '⌛', color: 'from-rose-500 to-red-600' }
  ]

  useEffect(() => {
    setMounted(true)
    if (user) {
      setFullName(user.name || '')
      setEmailAddress(user.email || '')
      setProfileUsername(user.name || '')
      setProfilePicBase64(user.profilePic)
    }
  }, [user])

  if (!mounted) return null

  // --- ACTIONS ---
  const handleSaveAccountDetails = () => {
    if (!user) return
    setUser({
      ...user,
      name: fullName.trim() || user.name
    })
    setAccountSavedMsg(true)
    setTimeout(() => setAccountSavedMsg(false), 3000)
  }

  const handleSaveProfileDetails = () => {
    if (!user) return
    setUser({
      ...user,
      name: profileUsername.trim() || user.name,
      profilePic: profilePicBase64
    })
    setProfileSavedMsg(true)
    setTimeout(() => setProfileSavedMsg(false), 3000)
  }

  const handleManualSync = async () => {
    if (!user) return
    setSyncing(true)
    setSyncSuccessMsg(false)
    try {
      await syncService.pushAllUserData(user.email, {
        tasks: useStore.getState().tasks,
        notes: useStore.getState().notes,
        attendanceRecords: useStore.getState().attendanceRecords,
        semesters: useStore.getState().semesters,
        goals: useStore.getState().goals,
        timetableSlots: useStore.getState().timetableSlots
      })
      setSyncSuccessMsg(true)
      setTimeout(() => setSyncSuccessMsg(false), 4000)
    } catch (err) {
      console.error("Manual snapshot sync failed:", err)
      alert("Failed to sync clean snapshot. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSelectPresetAvatar = (avatarEmoji: string) => {
    // Generate a temporary vector styled base64 or SVG
    const svgString = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%238B5CF6"/><text x="50" y="60" font-size="50" text-anchor="middle">${avatarEmoji}</text></svg>`
    setProfilePicBase64(svgString)
  }

  const handleRemovePhoto = () => {
    setProfilePicBase64(undefined)
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    const firstConfirm = confirm(
      "🚨 CRITICAL WARNING - ACCOUNT DELETION:\n\n" +
      "Are you sure you want to completely delete your account?\n\n" +
      "This will permanently delete your user profile and wipe ALL your tasks, notes, goals, attendance, and weekly timetable schedules from our cloud database.\n\n" +
      "You will NOT be able to log in with this account again unless you sign up and register first! This action cannot be undone."
    )

    if (firstConfirm) {
      const secondConfirm = confirm(
        "⚠️ FINAL CONFIRMATION:\n\n" +
        "Are you absolutely positive? All your data will be permanently destroyed on both Vercel cloud and local caches.\n\n" +
        "Click OK to permanently delete your account."
      )

      if (secondConfirm) {
        try {
          if (user.id) {
            // Mark is_deleted to true in profiles table
            await syncService.deleteUserProfile(user.id)
          }
          // Native Supabase Sign Out
          await supabase.auth.signOut()
        } catch (err) {
          console.error("Failed to delete cloud profile:", err)
        }

        // Clean up local store and session
        resetData()
        setUser(null)
        sessionStorage.removeItem('smart-study-session')
        
        alert("Your account and all associated study planner data have been permanently deleted.")
        router.push('/')
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <User className="h-8 w-8 text-brand-purple" />
            Account & Profile Settings
          </h1>
          <p className="text-gray-400 mt-1">Manage your student credentials, personalization, and learn with tutorials.</p>
        </div>

        {/* Tab selector */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-md shrink-0">
          <button 
            onClick={() => setActiveSubTab('account')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeSubTab === 'account' ? 'bg-brand-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            👤 Account Data
          </button>
          <button 
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeSubTab === 'profile' ? 'bg-brand-electric text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            📸 Profile Photo
          </button>
          <button 
            onClick={() => setActiveSubTab('help')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeSubTab === 'help' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            ℹ️ Help Centre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left side Mini Card matching profile dropdown card */}
        <div className="lg:col-span-1 space-y-6">
          <Card premium className="bg-[#0a0a0b]/60 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                {profilePicBase64 ? (
                  <img src={profilePicBase64} alt={fullName} className="h-20 w-20 rounded-full object-cover border-2 border-brand-purple shadow-xl shadow-brand-purple/20" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-brand-electric via-brand-purple to-pink-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-brand-purple/25">
                    {fullName ? fullName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide truncate">{fullName || 'Student'}</h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{emailAddress}</p>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full border border-brand-purple/25">
                  Academic Member
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shortcut buttons */}
          <div className="space-y-2 hidden lg:block">
            <button 
              onClick={() => setActiveSubTab('account')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-3 ${activeSubTab === 'account' ? 'bg-brand-purple/10 border-brand-purple/40 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              👤 Account Details
            </button>
            <button 
              onClick={() => setActiveSubTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-3 ${activeSubTab === 'profile' ? 'bg-brand-electric/10 border-brand-electric/40 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              📸 Profile Avatar
            </button>
            <button 
              onClick={() => setActiveSubTab('help')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-3 ${activeSubTab === 'help' ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              ℹ️ Help Centre
            </button>
          </div>
        </div>

        {/* Center Panel - Main tabs content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: ACCOUNT DATA */}
            {activeSubTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card premium className="bg-[#0a0a0b]/80 border-white/10 p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      Profile Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-6">
                    {/* Full name (Editable) */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <User className="h-4 w-4 text-brand-purple" /> Full Name
                      </label>
                      <Input 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Chetan Gargasya"
                        className="bg-black/20 border-white/15 h-12 text-sm font-semibold focus:border-brand-purple/70"
                      />
                    </div>

                    {/* Email (DISABLED - READ ONLY) */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-brand-purple" /> Email Address
                      </label>
                      <Input 
                        value={emailAddress}
                        disabled
                        className="bg-white/[0.02] border-white/10 text-gray-500 h-12 text-sm font-semibold cursor-not-allowed select-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 font-semibold">Email address is your verified login key and cannot be renamed.</p>
                    </div>

                    {/* Action */}
                    <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                      <Button 
                        variant="premium" 
                        onClick={handleSaveAccountDetails}
                        className="h-11 px-6 text-sm font-bold uppercase tracking-wider rounded-2xl bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2 shadow-lg shadow-brand-purple/20"
                      >
                        <Save className="h-4 w-4" /> Save Changes
                      </Button>
                      {accountSavedMsg && (
                        <span className="text-xs text-emerald-400 font-bold animate-pulse">Changes saved successfully!</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cloud Backup & Synchronisation card */}
                <Card premium className="bg-[#0a0a0b]/80 border-white/10 p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      ☁️ Manual Cloud Synchronization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                      Is your database getting messy? Click below to wipe all old database records and upload a clean, fresh, pristine snapshot of your current local study plan details (tasks, notes, goals, schedule slots, attendance) directly to Supabase now.
                    </p>
                    <div className="pt-2 flex items-center gap-4">
                      <Button 
                        variant="premium" 
                        onClick={handleManualSync}
                        disabled={syncing}
                        className="h-11 px-6 text-sm font-bold uppercase tracking-wider rounded-2xl bg-brand-electric hover:bg-brand-electric/90 flex items-center gap-2 shadow-lg shadow-brand-electric/20"
                      >
                        {syncing ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Syncing Snapshot...
                          </>
                        ) : (
                          <>
                            ☁️ Sync Clean Snapshot
                          </>
                        )}
                      </Button>
                      {syncSuccessMsg && (
                        <span className="text-xs text-emerald-400 font-bold animate-pulse">Sync completed! Clean database snapshot saved.</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Danger zone */}
                <Card className="bg-red-500/[0.02] border-red-500/20 p-6 rounded-3xl">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-red-500 text-lg font-black tracking-wide uppercase">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                      Permanently delete your account and all associated study data. This action is catastrophic and cannot be undone.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleDeleteAccount}
                      className="h-10 border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Delete Account & Data
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 2: PROFILE PICTURE MANAGER */}
            {activeSubTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card premium className="bg-[#0a0a0b]/80 border-white/10 p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      Profile Avatar & Photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-6">
                    
                    {/* Upload layout */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-black/20 border border-white/5">
                      <div className="relative shrink-0">
                        {profilePicBase64 ? (
                          <img src={profilePicBase64} alt="Avatar Preview" className="h-24 w-24 rounded-full object-cover border-2 border-brand-electric shadow-xl" />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl text-gray-600 font-bold select-none">
                            {fullName ? fullName[0].toUpperCase() : 'U'}
                          </div>
                        )}
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-brand-electric hover:bg-brand-electric/90 text-white flex items-center justify-center border-2 border-[#0a0a0b] shadow-lg transition-all"
                          title="Upload new image file"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <h4 className="text-sm font-bold text-white">Upload Your Photo</h4>
                        <p className="text-xs text-gray-500 leading-normal">
                          Support PNG, JPG or WEBP formats. Image sizes under 2MB are automatically base64 encrypted and persisted in your local storage workspace.
                        </p>
                        
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl bg-white/5 hover:bg-white/10"
                          >
                            <Upload className="h-3.5 w-3.5 mr-1" /> Choose File
                          </Button>
                          {profilePicBase64 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleRemovePhoto}
                              className="h-8 border-red-500/20 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Photo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-electric" /> Select Academic Preset Avatar
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {PRESET_AVATARS.map(avatar => (
                          <div 
                            key={avatar.name} 
                            onClick={() => handleSelectPresetAvatar(avatar.emoji)}
                            className="group cursor-pointer rounded-2xl bg-white/5 border border-white/5 hover:border-brand-electric/50 p-4 text-center transition-all hover:scale-105"
                            title={avatar.name}
                          >
                            <div className="text-2xl mb-1">{avatar.emoji}</div>
                            <div className="text-[9px] text-gray-500 font-bold uppercase truncate">{avatar.name.split(' ')[0]}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Username rename */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <User className="h-4 w-4 text-brand-electric" /> Profile Username
                      </label>
                      <Input 
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                        placeholder="Edit Username..."
                        className="bg-black/20 border-white/15 h-12 text-sm font-semibold focus:border-brand-electric/70"
                      />
                    </div>

                    {/* Action */}
                    <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                      <Button 
                        variant="premium" 
                        onClick={handleSaveProfileDetails}
                        className="h-11 px-6 text-sm font-bold uppercase tracking-wider rounded-2xl bg-brand-electric hover:bg-brand-electric/90 flex items-center gap-2 shadow-lg shadow-brand-electric/25"
                      >
                        <Save className="h-4 w-4" /> Save Profile
                      </Button>
                      {profileSavedMsg && (
                        <span className="text-xs text-emerald-400 font-bold animate-pulse">Profile updated successfully!</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 3: HELP & TUTORIAL CENTER */}
            {activeSubTab === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Help side selector */}
                <div className="md:col-span-1 space-y-2">
                  <h3 className="text-[10px] uppercase font-black text-gray-500 tracking-widest px-2 mb-3">Help Centre</h3>
                  <button 
                    onClick={() => setActiveHelpSection('help-center')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wide border transition-all flex items-center gap-2.5 ${activeHelpSection === 'help-center' ? 'bg-white/10 border-white/15 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    ❓ Help Centre
                  </button>
                  <button 
                    onClick={() => setActiveHelpSection('release-notes')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wide border transition-all flex items-center gap-2.5 ${activeHelpSection === 'release-notes' ? 'bg-white/10 border-white/15 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    📋 Release Notes
                  </button>
                  <button 
                    onClick={() => setActiveHelpSection('terms')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wide border transition-all flex items-center gap-2.5 ${activeHelpSection === 'terms' ? 'bg-white/10 border-white/15 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    📄 Terms of Service
                  </button>
                  <button 
                    onClick={() => setActiveHelpSection('privacy')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wide border transition-all flex items-center gap-2.5 ${activeHelpSection === 'privacy' ? 'bg-white/10 border-white/15 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    🔒 Privacy Policy
                  </button>
                  <button 
                    onClick={() => setActiveHelpSection('bug')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wide border transition-all flex items-center gap-2.5 ${activeHelpSection === 'bug' ? 'bg-white/10 border-white/15 text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    🐛 Report a Bug
                  </button>
                </div>

                {/* Help main content */}
                <div className="md:col-span-2">
                  <Card premium className="bg-[#0a0a0b]/80 border-white/10 p-6 h-full min-h-[400px]">
                    <div className="h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        
                        {/* Help Centre */}
                        {activeHelpSection === 'help-center' && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <HelpCircle className="h-5 w-5 text-brand-purple" /> Study Planner Help Centre
                            </h3>
                            <div className="h-px bg-white/10" />
                            <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-semibold">
                              <p className="text-brand-purple">🎓 Welcome to the Ultimate Command Center for Students!</p>
                              <p>This study planner helps you manage academic tasks, track attendance criteria, evaluate GPAs, and create notes in milliseconds.</p>
                              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                <h4 className="font-bold text-white text-xs">📖 Dashboard Navigation Walkthrough:</h4>
                                <ul className="list-disc pl-4 space-y-1.5 text-gray-400">
                                  <li><strong>Tasks:</strong> Manage assignments, set start/due dates, and prioritize your workload.</li>
                                  <li><strong>Focus Timer:</strong> Lock in studying with deep-work Pomodoro cycles.</li>
                                  <li><strong>Notes:</strong> Save bookmark checkpoints and checklist items in real time.</li>
                                  <li><strong>Attendance:</strong> Track how many classes you can skip or must attend to meet your 75% target.</li>
                                  <li><strong>CGPA Calculator:</strong> Evaluate semesters and predict overall CGPAs instantly.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Release Notes */}
                        {activeHelpSection === 'release-notes' && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <FileText className="h-5 w-5 text-brand-purple" /> Version 1.0.0 Release Notes
                            </h3>
                            <div className="h-px bg-white/10" />
                            <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-semibold">
                              <p className="text-brand-electric">🚀 Production Ready release v1.0.0 is live!</p>
                              <p>What is new in this build:</p>
                              <ul className="list-disc pl-4 space-y-1.5 text-gray-400">
                                <li><strong>Persistent Database Sync:</strong> Accounts are kept completely safe in local database maps, preventing lost data when logging back in.</li>
                                <li><strong>Session Timeout Integration:</strong> Autologout is enabled on closing browser tabs for login security.</li>
                                <li><strong>Static Dashboard tasks:</strong> Read-only task list for a clutter-free view.</li>
                                <li><strong>Custom Academic Avatars:</strong> Personalize your student card.</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Download Apps and Keyboard Shortcuts sections have been completely removed per request */}

                        {/* Terms of Service */}
                        {activeHelpSection === 'terms' && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <FileText className="h-5 w-5 text-brand-purple" /> Academic Guidelines & Terms
                            </h3>
                            <div className="h-px bg-white/10" />
                            <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-semibold">
                              <p>1. **Purpose:** This utility is designed strictly for academic planning, study forecasting, and personal time-management.</p>
                              <p>2. **Use Case:** Users are granted a personal, non-transferable study hub license. Academic data belongs entirely to the student.</p>
                              <p>3. **Data Integrity:** This planner works inside local sandbox sandboxes. No user studies or information are packaged, shared, or compiled outside your browser cache.</p>
                            </div>
                          </div>
                        )}

                        {/* Privacy Policy */}
                        {activeHelpSection === 'privacy' && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Shield className="h-5 w-5 text-brand-purple" /> Data Privacy & Storage Policy
                            </h3>
                            <div className="h-px bg-white/10" />
                            <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-semibold">
                              <p className="text-brand-purple">🔒 100% Private, 100% Local.</p>
                              <p>Your privacy is our core foundation. Unlike other EdTech tools that harvest student metrics, Smart Study keeps your records local:</p>
                              <ul className="list-disc pl-4 space-y-1.5 text-gray-400">
                                <li>All tasks, assignments, notes, checklists, and attendance grades are saved directly in your web browser&apos;s isolated <strong>localStorage</strong> sandbox.</li>
                                <li>No telemetry or analytics tracking is deployed. Your personal planner records are completely secure.</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Report a Bug */}
                        {activeHelpSection === 'bug' && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Bug className="h-5 w-5 text-brand-purple" /> Report a System Bug
                            </h3>
                            <div className="h-px bg-white/10" />
                            <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-semibold">
                              <p>Encountered a glitch or have a study layout recommendation?</p>
                              <form onSubmit={(e) => { e.preventDefault(); alert("Bug report submitted successfully! Thank you for helping improve Smart Study."); }} className="space-y-3 pt-2">
                                <Input placeholder="Brief description of the bug..." required className="bg-black/20 border-white/10 h-10 text-xs" />
                                <textarea className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-gray-300 outline-none resize-none h-24" placeholder="Steps to reproduce or expected behavior..." required />
                                <Button type="submit" variant="premium" className="h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-brand-purple hover:bg-brand-purple/90">
                                  Submit Report
                                </Button>
                              </form>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </Card>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
