"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Plus, Book, FileText, Trash2, 
  Clock, Search, BookOpen, ChevronDown, ChevronRight, GraduationCap, FolderOpen, FolderPlus 
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotesPage() {
  const { notes, addNote, editNote, deleteNote } = useStore()
  const [activeNote, setActiveNote] = useState<string | null>(null)
  
  // Custom local state for tracking dynamically created subjects (starts completely empty - no General Study!)
  const [subjects, setSubjects] = useState<string[]>([])
  
  // Creation States
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newTopicTitlesBySubject, setNewTopicTitlesBySubject] = useState<Record<string, string>>({})

  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  // Sync subjects list with actual folderIds from notes on store load
  useEffect(() => {
    setMounted(true)
    const folderIdsFromNotes = notes.map(n => n.folderId).filter(Boolean) as string[]
    const uniqueCombined = Array.from(new Set([...subjects, ...folderIdsFromNotes]))
    setSubjects(uniqueCombined)
  }, [notes])

  // Select first note automatically if none is selected
  useEffect(() => {
    if (notes.length > 0 && !activeNote) {
      setActiveNote(notes[0].id)
      const parentFolder = notes[0].folderId
      if (parentFolder) {
        setExpandedSubjects(prev => ({ ...prev, [parentFolder]: true }))
      }
    }
  }, [notes, activeNote])

  // Add Subject Folder first!
  const handleAddSubject = () => {
    const name = newSubjectName.trim()
    if (!name) {
      alert("Please type a Subject name!")
      return
    }

    if (subjects.includes(name)) {
      alert("This Subject folder already exists!")
      return
    }

    // Add to local subjects list
    setSubjects(prev => [...prev, name])
    setNewSubjectName('')
    
    // Auto-expand newly created Subject folder
    setExpandedSubjects(prev => ({ ...prev, [name]: true }))
  };

  // Add Topic nested directly under specific Subject folder!
  const handleAddTopicToSubject = (subjectName: string) => {
    const topicTitle = (newTopicTitlesBySubject[subjectName] || '').trim()
    if (!topicTitle) {
      alert("Please type a Topic name!")
      return
    }

    const id = Date.now().toString()

    // Add note topic to store
    addNote({
      id,
      title: topicTitle,
      content: '', // Write notes below topic in full-width editor
      description: '',
      folderId: subjectName, // Link with subject folder
      subNotes: [],
      savepoints: [],
      updatedAt: new Date()
    })

    // Clear specific input field
    setNewTopicTitlesBySubject(prev => ({ ...prev, [subjectName]: '' }))

    // Select the topic immediately in editor
    setActiveNote(id)
  }

  // Delete Subject folder and all its topics
  const handleDeleteSubject = (subjectName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${subjectName}" and all of its study topics?`)) {
      const notesInSubject = notes.filter(n => n.folderId === subjectName)
      notesInSubject.forEach(n => deleteNote(n.id))
      setSubjects(prev => prev.filter(s => s !== subjectName))
      
      if (activeNoteData && activeNoteData.folderId === subjectName) {
        const remaining = notes.filter(n => n.folderId !== subjectName)
        setActiveNote(remaining.length > 0 ? remaining[0].id : null)
      }
    }
  }

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this study note topic?")) {
      deleteNote(id)
      if (activeNote === id) {
        setActiveNote(notes.length > 1 ? notes.find(n => n.id !== id)?.id || null : null)
      }
    }
  }

  const activeNoteData = notes.find(n => n.id === activeNote)

  // Toggle Subject accordion collapse state
  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }))
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 overflow-hidden relative z-10">
      
      {/* Sidebar for Subjects & Topics */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 h-1/2 lg:h-full overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Book className="h-6 w-6 text-brand-purple" />
            Study Desk
          </h1>
          <span className="text-[10px] font-bold bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded-full border border-brand-purple/30">
            {notes.length} Topic{notes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Branded Search Input - with high-visibility notes logo inside! */}
        <div className="relative shrink-0">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
            <GraduationCap className="h-4.5 w-4.5 text-violet-400 drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]" />
          </div>
          <Input 
            placeholder="Search all notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 h-10 text-xs rounded-xl focus:border-brand-purple/50 focus:ring-0 w-full"
          />
        </div>

        {/* STEP 1: Add Subject Folder Console */}
        <div className="flex gap-1.5 shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl p-2.5">
          <Input 
            placeholder="Add subject (e.g. Physics)..." 
            value={newSubjectName} 
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
            className="bg-black/35 h-9 text-xs border-white/10 rounded-xl focus:border-brand-purple/50 focus:ring-0 flex-1"
          />
          <Button 
            variant="premium" 
            onClick={handleAddSubject} 
            className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center bg-brand-purple shadow-md"
            title="Create Subject Folder"
          >
            <span className="text-xl font-black text-white leading-none mt-[-2px]">+</span>
          </Button>
        </div>
        
        {/* Accordion List of Subjects and Nested Topics */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar pb-6">
          {subjects.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <FolderOpen className="h-8 w-8 mx-auto text-gray-600 mb-2" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">No subjects added yet</p>
              <p className="text-[10px] text-gray-600 mt-1">Create a Subject folder above to begin!</p>
            </div>
          ) : (
            subjects.map(subject => {
              const subjectNotes = filteredNotes.filter(n => n.folderId === subject)
              const isExpanded = !!expandedSubjects[subject]

              return (
                <div key={subject} className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
                  
                  {/* Subject Folder Header */}
                  <div 
                    onClick={() => toggleSubject(subject)}
                    className="flex items-center justify-between p-3.5 cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="h-4 w-4 text-brand-purple shrink-0" />
                      <span className="text-xs font-extrabold text-white truncate uppercase tracking-wider">{subject}</span>
                      <span className="text-[10px] text-gray-500 font-bold">({subjectNotes.length})</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleDeleteSubject(subject, e)}
                        className="h-6 w-6 rounded-lg hover:bg-red-500/15 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors"
                        title="Delete Subject Category"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* STEP 2: Topics Drawer & Topic Adder nested inside the folder! */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/5 bg-[#0a0a0b]/40 px-3 py-2.5 space-y-2"
                      >
                        {/* Topic List */}
                        {subjectNotes.length === 0 ? (
                          <p className="text-[10px] text-gray-500 text-center py-2 italic font-semibold">No topics added under this subject.</p>
                        ) : (
                          subjectNotes.map(note => (
                            <div 
                              key={note.id}
                              onClick={() => setActiveNote(note.id)}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-2 group relative ${
                                activeNote === note.id 
                                  ? 'bg-brand-purple/10 border-brand-purple/40 text-white font-bold shadow-md' 
                                  : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className={`h-3.5 w-3.5 shrink-0 ${activeNote === note.id ? 'text-brand-purple' : 'text-gray-500'}`} />
                                <span className="text-xs truncate font-medium">{note.title}</span>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteNote(note.id, e)}
                                className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 flex items-center justify-center transition-all shrink-0"
                                title="Delete Topic"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))
                        )}

                        {/* Nested "Add Topic" Console inside Subject folder drawer */}
                        <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-white/5">
                          <Input 
                            placeholder="Add topic (e.g. Thermodynamics)..."
                            value={newTopicTitlesBySubject[subject] || ''}
                            onChange={(e) => setNewTopicTitlesBySubject(prev => ({ ...prev, [subject]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopicToSubject(subject)}
                            className="bg-black/40 h-8 text-[11px] border-white/5 rounded-lg w-full focus:border-brand-purple/40 focus:ring-0"
                          />
                          <button 
                            onClick={() => handleAddTopicToSubject(subject)}
                            className="h-8 w-8 shrink-0 bg-brand-purple/20 hover:bg-brand-purple text-brand-purple hover:text-white rounded-lg flex items-center justify-center transition-all"
                            title="Add Topic to Subject"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              )
            })
          )}
        </div>
      </div>

      {/* STEP 3: Below Topics Write the Notes (Full-Width distraction-free Editor) */}
      <div className="flex-1 bg-[#0a0a0b]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-6 overflow-hidden h-1/2 lg:h-full">
        {activeNoteData ? (
          /* Note Editor Area */
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto lg:overflow-hidden h-full pr-1">
            <div className="space-y-1">
              {/* Note Title Input */}
              <input 
                type="text"
                value={activeNoteData.title}
                onChange={(e) => editNote(activeNoteData.id, { title: e.target.value })}
                className="bg-transparent border-none text-2xl lg:text-3xl font-black text-white outline-none w-full tracking-tight focus:ring-0 focus:outline-none"
                placeholder="Note Title"
              />
              
              {/* Note Description Input */}
              <input 
                type="text"
                value={activeNoteData.description || ''}
                onChange={(e) => editNote(activeNoteData.id, { description: e.target.value })}
                className="bg-transparent border-none text-xs font-semibold text-gray-400 outline-none w-full focus:ring-0 focus:outline-none pb-2 border-b border-white/5"
                placeholder="✍️ Brief description, summary, or study focus..."
              />
            </div>

            <div className="text-[10px] text-gray-500 flex items-center gap-1 font-bold">
              <Clock className="h-3 w-3 text-brand-purple" />
              Last updated: {mounted ? new Date(activeNoteData.updatedAt).toLocaleString() : ''}
            </div>

            {/* Main Note Textarea Content */}
            <textarea
              className="flex-1 w-full bg-black/10 border border-white/5 rounded-2xl p-4 text-sm text-gray-300 outline-none resize-none focus:border-brand-purple/35 transition-colors custom-scrollbar"
              placeholder="Start writing your study notes here..."
              value={activeNoteData.content}
              onChange={(e) => editNote(activeNoteData.id, { content: e.target.value })}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 py-16">
            <Book className="h-16 w-16 mb-2 opacity-20 text-brand-purple animate-bounce" />
            <h3 className="font-bold text-white text-base">No Active Notes Loaded</h3>
            <p className="text-xs max-w-xs text-center text-gray-400 leading-normal font-semibold">
              Create a Subject folder first, add a Topic under that subject folder, and select it to start writing notes below!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
