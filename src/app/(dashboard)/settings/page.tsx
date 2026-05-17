"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Shield, Bell, Save } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { user, setUser, resetData } = useStore()
  
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setUser({ name, email })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to completely wipe all your data? This cannot be undone.")) {
      resetData()
      setUser(null)
      router.push('/')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and personal details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <Button variant="secondary" className="w-full justify-start bg-white/10 text-white">
            <User className="mr-2 h-4 w-4" /> Profile Details
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400">
            <Shield className="mr-2 h-4 w-4" /> Security
          </Button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card premium>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-11"
                />
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                <Button variant="premium" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
                {saved && <span className="text-sm text-emerald-500 animate-pulse">Changes saved successfully!</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-500 text-lg">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="border-red-500/50 text-red-500 hover:bg-red-500/20 hover:text-red-400"
              >
                Delete Account & Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
