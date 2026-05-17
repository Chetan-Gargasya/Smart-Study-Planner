"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Calculator, Plus, GraduationCap } from 'lucide-react'
import { useStore } from '@/store/useStore'

const GRADE_POINTS: Record<string, number> = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0
}

export default function CGPAPage() {
  const { semesters, addSemester, addCourse } = useStore()
  const [newSemName, setNewSemName] = useState('')

  const handleAddSem = () => {
    if(!newSemName) return
    addSemester({ id: Date.now().toString(), name: newSemName, courses: [] })
    setNewSemName('')
  }

  // Calculate CGPA
  let totalCredits = 0
  let totalPoints = 0
  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      totalCredits += course.credits
      totalPoints += course.credits * (GRADE_POINTS[course.grade.toUpperCase()] || 0)
    })
  })
  const cgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-premium-gradient mb-2">{cgpa}</h1>
        <p className="text-gray-400 uppercase tracking-widest text-sm font-semibold">Cumulative Grade Point Average</p>
      </div>

      <div className="flex gap-2 mb-8">
        <Input placeholder="Semester Name (e.g. Fall 2024)" value={newSemName} onChange={e=>setNewSemName(e.target.value)} />
        <Button variant="premium" onClick={handleAddSem}><Plus className="h-4 w-4 mr-2"/> Add Semester</Button>
      </div>

      {semesters.length === 0 ? (
        <Card className="border-dashed border-white/20 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Calculator className="h-12 w-12 mb-4 opacity-20" />
            <p>No semesters added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {semesters.map(sem => (
            <SemesterCard key={sem.id} semester={sem} onAddCourse={(c: any) => addCourse(sem.id, c)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SemesterCard({ semester, onAddCourse }: any) {
  const [courseName, setCourseName] = useState('')
  const [credits, setCredits] = useState('')
  const [grade, setGrade] = useState('')

  const handleAdd = () => {
    if(courseName && credits && grade) {
      onAddCourse({ id: Date.now().toString(), name: courseName, credits: Number(credits), grade: grade.toUpperCase() })
      setCourseName(''); setCredits(''); setGrade('')
    }
  }

  let semCredits = 0
  let semPoints = 0
  semester.courses.forEach((c: any) => {
    semCredits += c.credits
    semPoints += c.credits * (GRADE_POINTS[c.grade] || 0)
  })
  const sgpa = semCredits === 0 ? 0 : (semPoints / semCredits).toFixed(2)

  return (
    <Card premium>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{semester.name}</CardTitle>
        <div className="text-brand-electric font-bold">SGPA: {sgpa}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {semester.courses.length > 0 && (
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-400 mb-2 border-b border-white/10 pb-2">
            <div className="col-span-2">Course Name</div>
            <div>Credits</div>
            <div>Grade</div>
          </div>
        )}
        {semester.courses.map((course: any) => (
          <div key={course.id} className="grid grid-cols-4 gap-4 text-sm text-white items-center">
            <div className="col-span-2">{course.name}</div>
            <div>{course.credits}</div>
            <div className="font-bold text-brand-purple">{course.grade}</div>
          </div>
        ))}

        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/5 mt-4">
          <Input className="col-span-2 h-9" placeholder="Course Name" value={courseName} onChange={e=>setCourseName(e.target.value)} />
          <Input type="number" className="h-9" placeholder="Credits" value={credits} onChange={e=>setCredits(e.target.value)} />
          <Input className="h-9 uppercase" placeholder="Grade (A, B+)" value={grade} onChange={e=>setGrade(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleAdd}>Add Course</Button>
      </CardContent>
    </Card>
  )
}
