"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Calculator, Plus, Trash2, RotateCcw, GraduationCap, BookOpen, Percent, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SemesterInput {
  id: string;
  name: string;
  sgpa: string;
  credits: string;
}

interface CourseInput {
  id: string;
  name: string;
  credits: string;
  gradePoints: string;
}

export default function CGPAPage() {
  // Navigation tabs: cgpa (semester-wise) or sgpa (course-wise)
  const [activeTab, setActiveTab] = useState<'cgpa' | 'sgpa'>('cgpa')

    // --- CGPA CALCULATOR STATE ---
  const [semesters, setSemesters] = useState<SemesterInput[]>([])
  const [calculatedCgpa, setCalculatedCgpa] = useState<number | null>(null)

    // --- SGPA CALCULATOR STATE ---
  const [courses, setCourses] = useState<CourseInput[]>([])
  const [calculatedSgpa, setCalculatedSgpa] = useState<number | null>(null)

  // New Course Inputs
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseCredits, setNewCourseCredits] = useState('')
  const [newCourseGrade, setNewCourseGrade] = useState('10')

  // --- CGPA ACTIONS ---
  const handleAddSemester = () => {
    const nextNumber = semesters.length + 1
    setSemesters([
      ...semesters,
      {
        id: Date.now().toString(),
        name: `SEMESTER ${nextNumber}`,
        sgpa: '',
        credits: ''
      }
    ])
  }

  const handleDeleteSemester = (id: string) => {
    const filtered = semesters.filter(sem => sem.id !== id)
    // Rename remaining semesters sequentially to keep format beautiful
    const renamed = filtered.map((sem, idx) => ({
      ...sem,
      name: `SEMESTER ${idx + 1}`
    }))
    setSemesters(renamed)
  }

  const handleUpdateSemester = (id: string, field: 'sgpa' | 'credits', value: string) => {
    setSemesters(
      semesters.map(sem => (sem.id === id ? { ...sem, [field]: value } : sem))
    )
  }

  const handleResetSemesters = () => {
    setSemesters([])
    setCalculatedCgpa(null)
  }

  const handleCalculateCgpa = () => {
    let totalPoints = 0
    let totalCredits = 0
    let hasValidData = false

    semesters.forEach(sem => {
      const sgpaVal = parseFloat(sem.sgpa)
      const credVal = parseFloat(sem.credits)

      if (!isNaN(sgpaVal) && !isNaN(credVal) && credVal > 0) {
        totalPoints += sgpaVal * credVal
        totalCredits += credVal
        hasValidData = true
      }
    })

    if (hasValidData && totalCredits > 0) {
      const result = parseFloat((totalPoints / totalCredits).toFixed(2))
      setCalculatedCgpa(result)
    } else {
      alert("Please fill in valid SGPA and Credits for your semesters.")
    }
  }

  // --- SGPA ACTIONS ---
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourseCredits || isNaN(parseFloat(newCourseCredits)) || parseFloat(newCourseCredits) <= 0) {
      alert("Please enter a valid number of credits.")
      return
    }
    
    setCourses([
      ...courses,
      {
        id: Date.now().toString(),
        name: newCourseName.trim() || `Course ${courses.length + 1}`,
        credits: newCourseCredits,
        gradePoints: newCourseGrade
      }
    ])
    setNewCourseName('')
    setNewCourseCredits('')
    setNewCourseGrade('10')
  }

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id))
  }

  const handleResetSGPA = () => {
    setCourses([])
    setCalculatedSgpa(null)
  }

  const handleCalculateSgpa = () => {
    let totalPoints = 0
    let totalCredits = 0
    let hasValidData = false

    courses.forEach(c => {
      const credVal = parseFloat(c.credits)
      const gpVal = parseFloat(c.gradePoints)

      if (!isNaN(credVal) && !isNaN(gpVal) && credVal > 0) {
        totalPoints += gpVal * credVal
        totalCredits += credVal
        hasValidData = true
      }
    })

    if (hasValidData && totalCredits > 0) {
      const result = parseFloat((totalPoints / totalCredits).toFixed(2))
      setCalculatedSgpa(result)
    } else {
      alert("Please enter valid courses with credits and grade points.")
    }
  }

  const addSgpaToCgpa = () => {
    if (calculatedSgpa === null) return
    const nextNumber = semesters.length + 1
    // Calculate total credits of active SGPA setup
    const totalCredits = courses.reduce((acc, c) => acc + (parseFloat(c.credits) || 0), 0)
    
    setSemesters([
      ...semesters,
      {
        id: Date.now().toString(),
        name: `SEMESTER ${nextNumber}`,
        sgpa: calculatedSgpa.toString(),
        credits: totalCredits > 0 ? totalCredits.toString() : '20'
      }
    ])
    setActiveTab('cgpa')
    // Smooth scroll down to view semester card list
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Calculator className="h-8 w-8 text-brand-electric" />
            GPA & CGPA Calculator
          </h1>
          <p className="text-gray-400 mt-1">Calculate your academic performance and forecast targets.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('cgpa')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'cgpa' ? 'bg-brand-electric text-white shadow-lg shadow-brand-electric/25' : 'text-gray-400 hover:text-white'}`}
          >
            <Calculator className="h-4 w-4" /> Cumulative CGPA
          </button>
          <button 
            onClick={() => setActiveTab('sgpa')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'sgpa' ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/25' : 'text-gray-400 hover:text-white'}`}
          >
            <BookOpen className="h-4 w-4" /> Semester SGPA
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cgpa' ? (
          <motion.div
            key="cgpa"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Semesters Input Cards List */}
            <div className="space-y-4">
              {semesters.length === 0 ? (
                <Card className="border-dashed border-white/15 bg-transparent py-12">
                  <CardContent className="flex flex-col items-center justify-center text-gray-500 gap-2">
                    <Calculator className="h-10 w-10 opacity-30 text-brand-electric" />
                    <p className="text-sm font-semibold text-white">No Semesters Added</p>
                    <p className="text-xs text-gray-400">Click &quot;Add Semester&quot; below to start calculating your cumulative CGPA.</p>
                  </CardContent>
                </Card>
              ) : (
                semesters.map((sem, index) => (
                  <Card key={sem.id} className="border-white/10 bg-[#0a0a0b]/60 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-electric opacity-70" />
                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-electric bg-brand-electric/10 px-2 py-0.5 rounded border border-brand-electric/20">Sem Weightage</span>
                        <h2 className="text-2xl font-black text-white mt-2 tracking-wide uppercase">{sem.name}</h2>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SGPA (0-10)</label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="7.50" 
                            value={sem.sgpa}
                            onChange={(e) => handleUpdateSemester(sem.id, 'sgpa', e.target.value)}
                            className="bg-black/20 h-10 w-full md:w-32 border-white/15 font-semibold text-white text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Credits</label>
                          <Input 
                            type="number" 
                            step="0.5" 
                            placeholder="20" 
                            value={sem.credits}
                            onChange={(e) => handleUpdateSemester(sem.id, 'credits', e.target.value)}
                            className="bg-black/20 h-10 w-full md:w-32 border-white/15 font-semibold text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleDeleteSemester(sem.id)}
                        className="h-8 w-8 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all self-end md:self-center"
                        title="Delete Semester"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleAddSemester}
                className="h-11 border-white/10 hover:bg-white/5 font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4 text-brand-electric" /> Add Semester
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetSemesters}
                className="h-11 border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Reset Semesters
              </Button>
            </div>

            {/* Calculate Button */}
            <Button 
              variant="premium" 
              onClick={handleCalculateCgpa}
              className="w-full h-12 text-sm font-bold uppercase tracking-wider rounded-2xl shadow-xl shadow-brand-electric/15"
            >
              CALCULATE CGPA
            </Button>

            {/* CALCULATED RESULT PANEL */}
            {calculatedCgpa !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a0a0b]/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-electric to-transparent opacity-50" />
                
                <h3 className="text-xs uppercase tracking-widest font-black text-brand-electric mb-6 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin-slow" /> Calculated Result
                </h3>

                <div className="space-y-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your CGPA</span>
                  <div className="text-7xl font-black text-white tracking-tight leading-none">
                    {calculatedCgpa.toFixed(2)}
                  </div>
                  
                  <div className="h-px bg-white/10 my-6" />

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Converted Percentage (2021/2022 Scheme)</span>
                    <div className="text-4xl font-extrabold text-brand-electric mt-1 tracking-tight">
                      {(calculatedCgpa * 10).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="sgpa"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Quick SGPA Course Entry Form */}
            <Card premium className="border-brand-purple/20 bg-brand-purple/5 backdrop-blur-md">
              <CardContent className="p-6">
                <form onSubmit={handleAddCourse} className="flex flex-col lg:flex-row items-end gap-4 w-full">
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Course / Subject Name</label>
                    <Input 
                      placeholder="e.g. Applied Mathematics, Physics Lab..." 
                      value={newCourseName} 
                      onChange={(e) => setNewCourseName(e.target.value)}
                      required
                      className="bg-black/20 border-white/10 h-10 text-sm font-semibold"
                    />
                  </div>

                  <div className="w-full lg:w-44 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Credits</label>
                    <Input 
                      type="number" 
                      step="0.5" 
                      placeholder="e.g. 4, 3, 1.5" 
                      value={newCourseCredits} 
                      onChange={(e) => setNewCourseCredits(e.target.value)}
                      required
                      className="bg-black/20 border-white/10 h-10 text-sm font-semibold"
                    />
                  </div>

                  <div className="w-full lg:w-56 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Grade (Grade Points)</label>
                    <select 
                      value={newCourseGrade}
                      onChange={(e) => setNewCourseGrade(e.target.value)}
                      className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-gray-300 font-semibold focus:outline-none focus:border-brand-purple/60 transition-colors"
                    >
                      <option value="10" className="bg-[#0e0e11]">O / S (Outstanding - 10)</option>
                      <option value="9" className="bg-[#0e0e11]">A+ / A (Excellent - 9)</option>
                      <option value="8" className="bg-[#0e0e11]">B+ / B (Very Good - 8)</option>
                      <option value="7" className="bg-[#0e0e11]">C+ / C (Good - 7)</option>
                      <option value="6" className="bg-[#0e0e11]">D (Above Average - 6)</option>
                      <option value="5" className="bg-[#0e0e11]">E (Pass - 5)</option>
                      <option value="0" className="bg-[#0e0e11]">F / I (Fail / Absent - 0)</option>
                    </select>
                  </div>

                  <Button type="submit" variant="premium" className="w-full lg:w-auto h-10 px-6 font-bold text-xs uppercase tracking-wider shrink-0 bg-brand-purple hover:bg-brand-purple/80">
                    <Plus className="h-4 w-4 mr-1.5" /> Add Course
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Courses List Table */}
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0a0a0b]/80 backdrop-blur-xl shadow-2xl">
              {courses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30 text-brand-purple" />
                  <p className="text-sm font-semibold text-white">No courses added for this SGPA evaluation.</p>
                  <p className="text-xs text-gray-400 mt-1">Add courses using the panel above to evaluate your SGPA.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-6">Course Name</th>
                      <th className="py-3 px-6 text-center">Credits</th>
                      <th className="py-3 px-6 text-center">Grade Points</th>
                      <th className="py-3 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.01] transition-colors text-sm text-gray-200">
                        <td className="py-4 px-6 font-semibold text-white">{course.name}</td>
                        <td className="py-4 px-6 text-center font-bold text-gray-300">{course.credits}</td>
                        <td className="py-4 px-6 text-center font-bold text-brand-purple">{course.gradePoints}/10</td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white inline-flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SGPA Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleCalculateSgpa}
                className="h-11 border-brand-purple/20 bg-brand-purple/5 hover:bg-brand-purple/10 text-brand-purple font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
              >
                CALCULATE SGPA
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetSGPA}
                className="h-11 border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> RESET LIST
              </Button>
            </div>

            {/* CALCULATED SGPA RESULT PANEL */}
            {calculatedSgpa !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a0a0b]/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-purple to-transparent opacity-50" />
                
                <h3 className="text-xs uppercase tracking-widest font-black text-brand-purple mb-6 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin-slow" /> Calculated Result
                </h3>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Calculated SGPA</span>
                    <div className="text-7xl font-black text-white tracking-tight leading-none">
                      {calculatedSgpa.toFixed(2)}
                    </div>
                  </div>

                  <Button 
                    variant="premium" 
                    onClick={addSgpaToCgpa}
                    className="h-12 px-6 text-sm font-bold uppercase tracking-wider rounded-2xl bg-brand-purple hover:bg-brand-purple/90 shrink-0 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Save SGPA to Cumulative CGPA
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
