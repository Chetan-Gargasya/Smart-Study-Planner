"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Target } from 'lucide-react'

import { useStore } from '@/store/useStore'

export default function AnalyticsPage() {
  const { weeklyData, stats } = useStore()
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Study Analytics</h1>
          <p className="text-gray-400 mt-1">Deep dive into your productivity metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card premium className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Study Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card premium>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.studyHours === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">No study data recorded yet.</div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Data Structures</span>
                    <span className="text-gray-400">12 hours</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-brand-electric h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Operating Systems</span>
                    <span className="text-gray-400">8 hours</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-brand-purple h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Database Management</span>
                    <span className="text-gray-400">6.5 hours</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card premium>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-brand-neon" /> Focus Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="relative flex items-center justify-center w-48 h-48 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <circle 
                  cx="96" cy="96" r="88" 
                  stroke="url(#gradient)" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="552.92"
                  strokeDashoffset="138.23" 
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-bold text-white">{stats.studyHours > 0 ? '85' : '0'}</span>
                <span className="text-sm text-gray-400">{stats.studyHours > 0 ? 'Excellent' : 'No Data'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center max-w-[200px]">
              You were highly focused during <span className="text-white">{stats.studyHours > 0 ? '85%' : '0%'}</span> of your study sessions this week.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
