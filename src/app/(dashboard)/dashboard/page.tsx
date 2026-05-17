"use client"
import React from 'react'
import { motion, Variants } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Flame, Clock, Target, CheckCircle2, TrendingUp, BookOpen, ChevronRight } from 'lucide-react'

import { useStore } from '@/store/useStore'

export default function Dashboard() {
  const { user, tasks, exams, stats, updateTaskStatus, attendanceRecords } = useStore()
  
  // Calculate completed tasks dynamically
  const completedTasksCount = tasks.filter(t => t.status === 'done').length

  // Calculate dynamic average attendance
  const totalAttended = attendanceRecords.reduce((acc, curr) => acc + curr.attended, 0)
  const totalSessions = attendanceRecords.reduce((acc, curr) => acc + curr.total, 0)
  const avgAttendance = totalSessions === 0 ? 0 : Math.round((totalAttended / totalSessions) * 100)

  // Get top 3 tasks and exams
  const recentTasks = tasks.slice(0, 3)
  const upcomingExams = exams.slice(0, 3)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {user?.name || 'Student'}</h1>
          <p className="text-gray-400 mt-1">Here is your academic overview for today.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-white">{stats.streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-electric/10 border border-brand-electric/20 rounded-xl px-4 py-2 backdrop-blur-md">
            <Target className="h-5 w-5 text-brand-electric" />
            <span className="font-bold text-brand-electric">0% Goal</span>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card premium className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Study Hours</CardTitle>
              <Clock className="h-4 w-4 text-brand-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.studyHours}h</div>
              <p className="text-xs text-brand-neon mt-1 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" /> +0% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card premium className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Tasks Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{completedTasksCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {tasks.filter(t => t.status !== 'done').length} remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card premium className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg. Attendance</CardTitle>
              <BookOpen className="h-4 w-4 text-brand-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{avgAttendance}%</div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-3">
                <div className="bg-brand-purple h-1.5 rounded-full" style={{ width: `${avgAttendance}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full border-brand-electric/30 bg-brand-electric/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brand-electric">Current Focus</CardTitle>
              {tasks.some(t => t.status === 'in-progress') && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-electric opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-electric"></span>
                </span>
              )}
            </CardHeader>
            <CardContent>
              {tasks.some(t => t.status === 'in-progress') ? (
                <>
                  <div className="text-xl font-bold text-white mb-1 truncate">
                    {tasks.find(t => t.status === 'in-progress')?.title}
                  </div>
                  <p className="text-xs text-brand-electric/80">Currently working</p>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-gray-500 mb-1">Not Focused</div>
                  <p className="text-xs text-gray-600">Start a task to track</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card premium className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Tasks</CardTitle>
              <div className="text-sm text-brand-blue cursor-pointer hover:underline flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">No tasks yet. Create one to get started!</div>
                ) : (
                  recentTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${task.status === 'done' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'border-white/20 hover:border-emerald-500/55'}`}
                        >
                          {task.status === 'done' && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                        <span className={task.status === 'done' ? 'line-through text-gray-500 transition-all' : 'text-white transition-all'}>{task.title}</span>
                      </div>
                      {task.tags && task.tags.length > 0 && (
                        <Badge variant="outline">{task.tags[0]}</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card premium className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExams.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">No upcoming exams scheduled.</div>
                ) : (
                  upcomingExams.map(exam => (
                    <div key={exam.id} className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{exam.title}</h4>
                        <Badge variant={exam.priority === 'critical' ? 'destructive' : 'secondary'}>
                          {exam.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(exam.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
