"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { format, addMonths, subMonths, startOfWeek, addDays, isSameDay } from 'date-fns'
import { useStore } from '@/store/useStore'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { exams } = useStore()

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const startDate = startOfWeek(currentDate)
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Study Calendar</h1>
          <p className="text-gray-400 mt-1">Plan your weeks and never miss a deadline.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Today</Button>
          <Button variant="premium">
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        </div>
      </div>

      <Card premium className="border-white/5">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="hidden sm:flex bg-white/5 rounded-lg p-1">
            <Button variant="secondary" size="sm" className="rounded-md">Month</Button>
            <Button variant="ghost" size="sm" className="rounded-md text-gray-400">Week</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4 mb-4 text-center text-sm font-medium text-gray-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, idx) => {
              const isToday = isSameDay(day, new Date())
              return (
                <div 
                  key={idx} 
                  className={`min-h-[120px] rounded-xl border p-2 ${
                    isToday ? 'border-brand-electric bg-brand-electric/5' : 'border-white/5 bg-white/5 hover:bg-white/10'
                  } transition-colors`}
                >
                  <div className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
                    isToday ? 'bg-brand-electric text-white' : 'text-gray-300'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  {exams.filter(exam => isSameDay(new Date(exam.date), day)).map((exam, i) => (
                    <div key={i} className={`bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-xs p-1.5 rounded-md mb-1 truncate`}>
                      {exam.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card premium>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-brand-electric" /> Upcoming Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {exams.length === 0 ? (
               <div className="text-sm text-gray-500 py-4">No upcoming schedule.</div>
             ) : (
               exams.map(exam => (
                 <div key={exam.id} className="flex items-center gap-4 border-l-2 border-brand-electric pl-4 py-1">
                   <div className="text-sm font-bold w-16">{new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   <div>
                     <div className="text-white font-medium">{exam.title}</div>
                     <div className="text-xs text-gray-400 capitalize">{exam.priority} Priority</div>
                   </div>
                 </div>
               ))
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
