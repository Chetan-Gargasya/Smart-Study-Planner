"use client"
import React from 'react'
import { motion, Variants } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Clock, CheckCircle2, BookOpen, ChevronRight, ListTodo, Circle } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/store/useStore'

export default function Dashboard() {
  const { user, tasks, stats, attendanceRecords, toggleTaskTopicCompleted } = useStore()
  
  // Calculate completed tasks dynamically
  const completedTasksCount = tasks.filter(t => t.status === 'done').length

  // Calculate dynamic average attendance
  const totalAttended = attendanceRecords.reduce((acc, curr) => acc + curr.attended, 0)
  const totalSessions = attendanceRecords.reduce((acc, curr) => acc + curr.total, 0)
  const avgAttendance = totalSessions === 0 ? 0 : Math.round((totalAttended / totalSessions) * 100)

  // Get top 5 tasks
  const recentTasks = tasks.slice(0, 5)

  // Get first in-progress task for "Current Progress" widget
  const currentProgressTask = tasks.find(t => t.status === 'in-progress')

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
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {user?.name || 'Student'}</h1>
          <p className="text-gray-400 mt-1">Here is your academic overview for today.</p>
        </div>
      </div>

      {/* Grid Stats cards */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card premium className="h-full border-brand-electric/20 bg-brand-electric/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Current Progress</CardTitle>
              <Clock className="h-4 w-4 text-brand-electric animate-pulse" />
            </CardHeader>
            <CardContent>
              {currentProgressTask ? (
                <div className="space-y-3">
                  <div className="text-base font-bold text-white truncate max-w-full" title={currentProgressTask.title}>
                    {currentProgressTask.title}
                  </div>
                  
                  {/* Interactive Checklist subtopics */}
                  {currentProgressTask.topics && currentProgressTask.topics.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                      {currentProgressTask.topics.map((topic) => (
                        <div 
                          key={topic.title}
                          onClick={() => toggleTaskTopicCompleted(currentProgressTask.id, topic.title)}
                          className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white/5 transition-all text-xs font-semibold"
                        >
                          {topic.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-brand-electric shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-gray-600 shrink-0 opacity-40" />
                          )}
                          <span className={`truncate ${topic.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                            {topic.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500 font-semibold italic">No sub-topics added. Set up in Tasks page.</p>
                  )}

                  {/* Dynamically calculated progress bar */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                      <span>COMPLETION</span>
                      <span className="text-white">
                        {currentProgressTask.topics && currentProgressTask.topics.length > 0 
                          ? `${Math.round((currentProgressTask.topics.filter(t => t.completed).length / currentProgressTask.topics.length) * 100)}%` 
                          : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-brand-electric h-1.5 rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${currentProgressTask.topics && currentProgressTask.topics.length > 0 
                            ? (currentProgressTask.topics.filter(t => t.completed).length / currentProgressTask.topics.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-base font-bold text-gray-500">No Active Tasks</div>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1">
                    <Link href="/tasks" className="text-brand-electric hover:underline">Start a task in workspace →</Link>
                  </p>
                </div>
              )}
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
              <p className="text-xs text-gray-500 mt-2 font-semibold">
                {tasks.filter(t => t.status !== 'done').length} remaining to finish
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
      </motion.div>

      {/* Full-width Tasks section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card premium className="w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-brand-electric" />
              <CardTitle className="text-lg">Recent Tasks & Assignments</CardTitle>
            </div>
            <Link href="/tasks" className="text-sm text-brand-blue hover:underline flex items-center gap-1 font-semibold transition-colors">
              View all tasks <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  No tasks recorded yet. Create them inside your Tasks workspace to start tracking!
                </div>
              ) : (
                recentTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Read-only static visual indicator */}
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                        task.status === 'done' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'border-white/10 text-gray-600'
                      }`}>
                        {task.status === 'done' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Circle className="h-3 w-3 opacity-20" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        task.status === 'done' 
                          ? 'line-through text-gray-500' 
                          : 'text-white'
                      }`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                            task.priority === 'high' 
                              ? 'border-red-500/30 text-red-400 bg-red-500/5' 
                              : task.priority === 'medium'
                                ? 'border-orange-500/30 text-orange-400 bg-orange-500/5'
                                : 'border-blue-500/30 text-blue-400 bg-blue-500/5'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      )}
                      {task.status === 'done' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider">Completed</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-white/5 border border-white/5">In Progress</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
