"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, GraduationCap, Check, X, Calendar, Clock, Trash2, BookOpen, AlertCircle, Sparkles, Edit2, Save } from 'lucide-react'
import { useStore, TimetableSlot } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AttendancePage() {
  const { 
    attendanceRecords, 
    timetableSlots, 
    addTimetableSlot, 
    deleteTimetableSlot, 
    updateAttendance,
    deleteAttendanceRecord,
    editAttendanceRecord,
    addAttendanceRecord
  } = useStore()

  // Tab State
  const [activeTab, setActiveTab] = useState<'tracker' | 'timetable'>('tracker')
  
  // Timetable Form State
  const [subject, setSubject] = useState('')
  const [day, setDay] = useState<typeof DAYS_OF_WEEK[number]>('Monday')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [formError, setFormError] = useState('')

  // Manual Add Subject State (All Tracked Subjects Section)
  const [manualSubject, setManualSubject] = useState('')

  // Edit Inline Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubjectName, setEditSubjectName] = useState('')
  const [editAttended, setEditAttended] = useState(0)
  const [editTotal, setEditTotal] = useState(0)
  const [editTarget, setEditTarget] = useState(75)

  // Start Editing Action
  const startEditing = (record: typeof attendanceRecords[number]) => {
    setEditingId(record.id)
    setEditSubjectName(record.subject)
    setEditAttended(record.attended)
    setEditTotal(record.total)
    setEditTarget(record.target)
  }

  // Save Edits Action
  const handleSaveEdit = (id: string) => {
    if (!editSubjectName.trim()) return
    if (editAttended < 0 || editTotal < 0) return
    if (editAttended > editTotal) {
      alert("Attended classes cannot exceed total classes!")
      return
    }

    editAttendanceRecord(id, {
      subject: editSubjectName.trim(),
      attended: editAttended,
      total: editTotal,
      target: editTarget
    })
    setEditingId(null)
  }

  // Add a slot to the weekly timetable
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    if (!subject.trim()) {
      setFormError('Subject name is required')
      return
    }

    if (startTime >= endTime) {
      setFormError('Start time must be before end time')
      return
    }

    const newSlot: TimetableSlot = {
      id: Date.now().toString(),
      subject: subject.trim(),
      day,
      startTime,
      endTime
    }

    addTimetableSlot(newSlot)
    setSubject('')
    setFormError('')
  }

  // Handle Manual Subject Add
  const handleAddManualSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualSubject.trim()) return

    const hasRecord = attendanceRecords.some(r => r.subject.toLowerCase() === manualSubject.trim().toLowerCase())
    if (hasRecord) {
      alert('This subject is already being tracked!')
      return
    }

    addAttendanceRecord({
      id: Date.now().toString(),
      subject: manualSubject.trim(),
      attended: 0,
      total: 0,
      target: 75
    })
    setManualSubject('')
  }

  // Get current day name (e.g. "Monday")
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todayIndex = new Date().getDay()
    const dayName = days[todayIndex]
    return DAYS_OF_WEEK.includes(dayName as any) ? (dayName as typeof DAYS_OF_WEEK[number]) : 'Monday'
  }

  const currentDayName = getCurrentDay()

  // Filter slots for today
  const todaySlots = timetableSlots
    .filter(slot => slot.day === currentDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Prepare Grid Timetable Data
  const slotsByDay = DAYS_OF_WEEK.map(d => {
    return timetableSlots
      .filter(slot => slot.day === d)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  // Determine maximum periods scheduled on any day to determine row count
  const maxRowsCount = Math.max(...slotsByDay.map(slots => slots.length), 3)

  // Calculate Overall Stats
  const totalAttended = attendanceRecords.reduce((acc, curr) => acc + curr.attended, 0)
  const totalSessions = attendanceRecords.reduce((acc, curr) => acc + curr.total, 0)
  const overallPercentage = totalSessions === 0 ? 0 : Math.round((totalAttended / totalSessions) * 100)
  const isOverallDanger = overallPercentage < 75 && totalSessions > 0

  // Calculate attendance suggestions
  const getAttendanceSuggestion = () => {
    if (totalSessions === 0) return "Create your weekly timetable and mark classes to calculate statistics!"
    if (overallPercentage >= 75) {
      const safeAbsents = Math.floor((totalAttended - 0.75 * totalSessions) / 0.75)
      return safeAbsents > 0 
        ? `Great job! You are above 75%. You can safely miss up to ${safeAbsents} more class${safeAbsents > 1 ? 'es' : ''}.` 
        : "You are currently meeting the 75% target! Stay consistent."
    } else {
      const requiredPresents = Math.ceil((0.75 * totalSessions - totalAttended) / 0.25)
      return `Warning! You need to attend the next ${requiredPresents} class${requiredPresents > 1 ? 'es' : ''} straight to reach 75% average attendance.`
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-brand-electric" />
            Attendance & Schedule Tracker
          </h1>
          <p className="text-gray-400 mt-1">Manage your weekly schedule and maintain your target attendance.</p>
        </div>

        {/* Premium Tab Switcher */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'tracker' ? 'bg-brand-electric text-white shadow-lg shadow-brand-electric/25' : 'text-gray-400 hover:text-white'}`}
          >
            <BookOpen className="h-4 w-4" /> Attendance Tracker
          </button>
          <button 
            onClick={() => setActiveTab('timetable')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'timetable' ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/25' : 'text-gray-400 hover:text-white'}`}
          >
            <Calendar className="h-4 w-4" /> Weekly Timetable
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tracker' ? (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* SECTION 1: Day Wise Attendance Marker */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-electric" />
                    Today's Schedule (Day-wise Marker)
                  </h3>
                  <p className="text-xs text-gray-400">Only showing subjects scheduled for today ({currentDayName})</p>
                </div>
                {todaySlots.length > 0 && (
                  <span className="text-xs font-semibold bg-brand-electric/20 text-brand-electric px-3 py-1 rounded-full border border-brand-electric/30 mt-2 sm:mt-0 w-max">
                    {todaySlots.length} Subject{todaySlots.length > 1 ? 's' : ''} Today
                  </span>
                )}
              </div>

              <Card premium className="border-brand-electric/20 bg-brand-electric/5 backdrop-blur-md">
                <CardContent className="p-6">
                  {todaySlots.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30 text-brand-electric" />
                      <p className="text-sm font-medium text-gray-300">No classes scheduled for today.</p>
                      <p className="text-xs text-gray-500 mt-1">Populate your weekly planner in the **Weekly Timetable** tab to automate your daily schedule marker!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {todaySlots.map(slot => {
                        const record = attendanceRecords.find(r => r.subject.toLowerCase() === slot.subject.toLowerCase())
                        return (
                          <div key={slot.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-brand-electric/40 transition-all group">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white group-hover:text-brand-electric transition-colors">{slot.subject}</h4>
                                <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1 font-medium">
                                  <Clock className="h-3 w-3" /> {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              {record && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Current: {record.total === 0 ? '0%' : `${Math.round((record.attended / record.total) * 100)}%`} ({record.attended}/{record.total})
                                </p>
                              )}
                            </div>
                            
                            {record && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-500/40 text-xs"
                                  onClick={() => updateAttendance(record.id, record.attended + 1, record.total + 1)}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" /> Present
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/40 text-xs"
                                  onClick={() => updateAttendance(record.id, record.attended, record.total + 1)}
                                >
                                  <X className="h-3.5 w-3.5 mr-1" /> Absent
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* SECTION 2: All Tracked Subjects */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand-purple" />
                    All Tracked Subjects
                  </h3>
                  <p className="text-xs text-gray-400">View and edit your course attendance records</p>
                </div>
              </div>

              {attendanceRecords.length === 0 ? (
                <Card className="border-dashed border-white/20 bg-transparent py-16">
                  <CardContent className="flex flex-col items-center justify-center text-gray-500 gap-4">
                    <GraduationCap className="h-16 w-16 opacity-20 text-brand-purple" />
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">No subjects added</p>
                      <p className="text-sm max-w-sm mx-auto mt-1">Map out your scheduled classes in the **Weekly Timetable** tab to automatically generate subjects here!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attendanceRecords.map(record => {
                    const percentage = record.total === 0 ? 0 : Math.round((record.attended / record.total) * 100)
                    const isDanger = percentage < record.target && record.total > 0
                    const isEditing = editingId === record.id

                    // Calculate subject-wise consecutive attendance math
                    const subjectAttended = record.attended
                    const subjectTotal = record.total
                    const subjectPercentage = subjectTotal === 0 ? 0 : Math.round((subjectAttended / subjectTotal) * 100)
                    
                    let subjectAdvice = ""
                    let subjectAdviceStyle = ""
                    if (subjectTotal > 0) {
                      if (subjectPercentage < record.target) {
                        const targetFraction = record.target / 100
                        const req = Math.ceil((targetFraction * subjectTotal - subjectAttended) / (1 - targetFraction))
                        if (req > 0) {
                          subjectAdvice = `Attend next ${req} class${req > 1 ? 'es' : ''} straight`
                          subjectAdviceStyle = "text-red-400 font-semibold bg-red-500/10 border border-red-500/15 py-1 px-2.5 rounded-xl text-center text-[11px] mt-2 block"
                        }
                      } else {
                        const safe = Math.floor((100 * subjectAttended - record.target * subjectTotal) / record.target)
                        if (safe > 0) {
                          subjectAdvice = `Can safely miss ${safe} class${safe > 1 ? 'es' : ''}`
                          subjectAdviceStyle = "text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/15 py-1 px-2.5 rounded-xl text-center text-[11px] mt-2 block"
                        } else {
                          subjectAdvice = "Cannot miss any class"
                          subjectAdviceStyle = "text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/15 py-1 px-2.5 rounded-xl text-center text-[11px] mt-2 block"
                        }
                      }
                    }

                    return (
                      <Card key={record.id} premium className="relative overflow-hidden group">
                        {isEditing ? (
                          // Card Edit Mode
                          <CardContent className="p-5 space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Subject Name</label>
                              <Input 
                                value={editSubjectName}
                                onChange={(e) => setEditSubjectName(e.target.value)}
                                className="bg-black/20"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Attended</label>
                                <Input 
                                  type="number"
                                  min="0"
                                  value={editAttended}
                                  onChange={(e) => setEditAttended(Math.max(0, parseInt(e.target.value) || 0))}
                                  className="bg-black/20"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Classes</label>
                                <Input 
                                  type="number"
                                  min="0"
                                  value={editTotal}
                                  onChange={(e) => setEditTotal(Math.max(0, parseInt(e.target.value) || 0))}
                                  className="bg-black/20"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Target Threshold (%)</label>
                              <Input 
                                type="number"
                                min="0"
                                max="100"
                                value={editTarget}
                                onChange={(e) => setEditTarget(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                                className="bg-black/20"
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button 
                                className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 h-9"
                                onClick={() => handleSaveEdit(record.id)}
                              >
                                <Save className="h-4 w-4 mr-1.5" /> Save
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-9"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        ) : (
                          // Normal Card Mode
                          <>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg text-white font-bold max-w-[140px] truncate" title={record.subject}>
                                    {record.subject}
                                  </CardTitle>
                                  <p className="text-xs text-gray-400 mt-0.5">Target: {record.target}%</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col items-end">
                                    <span className={`text-2xl font-black ${isDanger ? 'text-red-500' : 'text-emerald-500'}`}>
                                      {record.total === 0 ? 'N/A' : `${percentage}%`}
                                    </span>
                                  </div>

                                  {/* Edit/Delete Icons */}
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => startEditing(record)}
                                      className="h-7 w-7 bg-white/5 hover:bg-brand-purple/20 hover:text-brand-purple rounded-lg border border-white/5 flex items-center justify-center text-gray-400 transition-all"
                                      title="Edit Record"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${record.subject}?`)) {
                                          deleteAttendanceRecord(record.id)
                                        }
                                      }}
                                      className="h-7 w-7 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-lg border border-white/5 flex items-center justify-center text-gray-400 transition-all"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Progress bar */}
                              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-brand-neon'}`} 
                                  style={{ width: `${record.total === 0 ? 0 : Math.max(5, Math.min(100, percentage))}%` }}
                                animate-pulse={isDanger}
                                />
                              </div>

                              <div className="flex justify-between text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Attended: {record.attended}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-brand-electric" /> Total: {record.total}</span>
                              </div>

                              {subjectAdvice && (
                                <div className={subjectAdviceStyle}>
                                  {subjectAdvice}
                                </div>
                              )}

                              <div className="flex gap-2 pt-2 border-t border-white/5">
                                <Button 
                                  variant="outline" 
                                  className="flex-1 h-9 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30 text-xs font-semibold"
                                  onClick={() => updateAttendance(record.id, record.attended + 1, record.total + 1)}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1.5" /> Present
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 h-9 bg-red-500/5 text-red-500 hover:bg-red-500/15 hover:text-red-400 border-red-500/10 hover:border-red-500/30 text-xs font-semibold"
                                  onClick={() => updateAttendance(record.id, record.attended, record.total + 1)}
                                >
                                  <X className="h-3.5 w-3.5 mr-1.5" /> Absent
                                </Button>
                              </div>
                            </CardContent>
                          </>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Redesigned Bottom Overall Summary Card */}
            <Card className="border-brand-purple/20 bg-brand-purple/5 backdrop-blur-md relative overflow-hidden mt-8">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Sparkles className="h-36 w-36 text-brand-purple" />
              </div>
              <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left flex-1">
                  {/* Stylized Gauge Ring */}
                  <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                    <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-white/10" 
                        strokeWidth="8" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className={`${isOverallDanger ? 'text-red-500' : 'text-brand-purple'}`} 
                        strokeWidth="8" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * overallPercentage) / 100}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                    </svg>
                    <span className="text-3xl font-black text-white">{overallPercentage}%</span>
                  </div>

                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-xs uppercase font-bold tracking-widest text-brand-purple bg-brand-purple/10 px-2.5 py-0.5 rounded-lg border border-brand-purple/20">Overall Stats</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight">Overall Academic Average</h2>
                    
                    {totalSessions === 0 ? (
                      <p className="text-xs text-gray-400">Create your weekly timetable and mark attendance to see strategy indicators.</p>
                    ) : (
                      <div className="pt-1">
                        {overallPercentage >= 75 ? (
                          (() => {
                            const safeAbsents = Math.floor((4 * totalAttended - 3 * totalSessions) / 3)
                            return (
                              <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-2xl max-w-lg mx-auto sm:mx-0">
                                <span className="text-emerald-400 text-sm shrink-0">🎉</span>
                                <div className="text-left">
                                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Safe Zone Target Met</h4>
                                  <p className="text-xs text-gray-300 mt-1 leading-normal">
                                    {safeAbsents > 0 
                                      ? `You can safely miss up to ${safeAbsents} class${safeAbsents > 1 ? 'es' : ''} continuously without dropping below the 75% target.`
                                      : "You are currently meeting the 75% target, but have no safe margin. Missing any class will drop you below."}
                                  </p>
                                </div>
                              </div>
                            )
                          })()
                        ) : (
                          (() => {
                            const requiredPresents = Math.ceil((0.75 * totalSessions - totalAttended) / 0.25)
                            return (
                              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-2xl max-w-lg mx-auto sm:mx-0">
                                <span className="text-red-400 text-sm shrink-0">⚠️</span>
                                <div className="text-left">
                                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Below 75% Criteria</h4>
                                  <p className="text-xs text-gray-300 mt-1 leading-normal">
                                    You must attend the next {requiredPresents} class{requiredPresents > 1 ? 'es' : ''} continuously to restore your 75% average attendance.
                                  </p>
                                </div>
                              </div>
                            )
                          })()
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end justify-center bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[180px] shrink-0 text-center md:text-right">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Breakdown Ratio</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-4xl font-black text-white">{totalAttended}</span>
                    <span className="text-xl text-gray-500 font-medium">/</span>
                    <span className="text-2xl text-gray-300 font-bold">{totalSessions}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1">Attended / Total Sessions</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="timetable"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Scheduler Form Inline / Top Card */}
            <Card premium className="border-brand-purple/20 bg-brand-purple/5 backdrop-blur-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-purple" />
                  Add Class to Weekly Timetable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSlot} className="flex flex-col lg:flex-row items-end gap-4 w-full">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Subject Name</label>
                    <Input 
                      placeholder="e.g. Basic Electrical Engineer, Chemistry LAB..." 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="bg-black/20"
                    />
                  </div>

                  <div className="w-full lg:w-48 space-y-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Day of Week</label>
                    <select 
                      value={day}
                      onChange={(e) => setDay(e.target.value as any)}
                      className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-brand-purple/60 transition-colors"
                    >
                      {DAYS_OF_WEEK.map(d => (
                        <option key={d} value={d} className="bg-[#0e0e11]">{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full lg:w-36 space-y-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Start Time</label>
                    <Input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="bg-black/20"
                    />
                  </div>

                  <div className="w-full lg:w-36 space-y-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">End Time</label>
                    <Input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="bg-black/20"
                    />
                  </div>

                  <Button type="submit" variant="premium" className="w-full lg:w-auto h-10 px-6 font-bold">
                    <Plus className="h-4 w-4 mr-2" /> Add Class
                  </Button>
                </form>
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl flex items-center gap-2 mt-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grid Weekly Planner Display (Perfect replica of requested image style) */}
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0a0a0b]/80 backdrop-blur-xl shadow-2xl">
              <table className="w-full min-w-[800px] border-collapse text-center">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    {SHORT_DAYS.map((dayName, idx) => (
                      <th 
                        key={dayName} 
                        className={`py-4 text-sm font-bold tracking-wider text-gray-300 border-r border-white/10 last:border-r-0 ${
                          DAYS_OF_WEEK[idx] === currentDayName ? 'text-brand-electric bg-brand-electric/5' : ''
                        }`}
                      >
                        {dayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxRowsCount }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.01] transition-colors">
                      {DAYS_OF_WEEK.map((dayName, colIndex) => {
                        const slot = slotsByDay[colIndex][rowIndex]
                        const isToday = dayName === currentDayName

                        return (
                          <td 
                            key={dayName} 
                            className={`p-3 border-r border-white/5 last:border-r-0 h-28 w-[14.28%] relative group transition-all ${
                              isToday ? 'bg-brand-electric/[0.02]' : ''
                            }`}
                          >
                            {slot ? (
                              <div className="h-full w-full rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col justify-between text-left group-hover:border-brand-purple/40 group-hover:bg-white/[0.08] transition-all relative overflow-hidden select-none">
                                <div className="absolute top-0 right-0 h-full w-1.5 bg-brand-purple" />
                                <div className="pr-4">
                                  <h4 className="font-bold text-white text-xs leading-tight tracking-wide line-clamp-2" title={slot.subject}>
                                    {slot.subject}
                                  </h4>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-[10px] text-gray-400 font-semibold bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 flex items-center gap-1 shrink-0">
                                    <Clock className="h-2.5 w-2.5 text-brand-purple" /> {slot.startTime} - {slot.endTime}
                                  </span>
                                  
                                  {/* Quick Delete Trash Icon */}
                                  <button 
                                    onClick={() => deleteTimetableSlot(slot.id)}
                                    className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
                                    title="Delete Session"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full w-full rounded-2xl border border-dashed border-white/5 flex items-center justify-center text-gray-600/30 text-xs">
                                —
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Tips */}
            <div className="flex items-center gap-3 bg-brand-purple/5 border border-brand-purple/20 p-4 rounded-2xl">
              <Sparkles className="h-5 w-5 text-brand-purple shrink-0" />
              <p className="text-xs text-gray-300">
                <strong>Schedule Tip:</strong> Populate your grid with class slots. The grid organizes your classes chronologically automatically for each day!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
