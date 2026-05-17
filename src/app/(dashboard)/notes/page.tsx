"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Book, FileText, Search } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function NotesPage() {
  const { notes, addNote, updateNote } = useStore()
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddNote = () => {
    if (!newTitle.trim()) return
    const id = Date.now().toString()
    addNote({
      id,
      title: newTitle,
      content: '',
      updatedAt: new Date()
    })
    setNewTitle('')
    setActiveNote(id)
  }

  const activeNoteData = notes.find(n => n.id === activeNote)

  return (
    <div className="max-w-7xl mx-auto flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar for Notes */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Notes</h1>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="New note title..." 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          />
          <Button variant="premium" size="icon" onClick={handleAddNote}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {notes.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">No notes yet. Create one!</div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id} 
                onClick={() => setActiveNote(note.id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors border ${activeNote === note.id ? 'bg-brand-purple/20 border-brand-purple text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-2 font-medium mb-1">
                  <FileText className="h-4 w-4" /> {note.title}
                </div>
                <div className="text-xs opacity-50 truncate">
                  {note.content || 'Empty note...'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-[#0a0a0b]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col">
        {activeNoteData ? (
          <>
            <input 
              type="text"
              value={activeNoteData.title}
              className="bg-transparent border-none text-3xl font-bold text-white outline-none mb-4"
              readOnly
            />
            <div className="text-xs text-gray-500 mb-6 border-b border-white/10 pb-4">
              Last updated: {mounted ? new Date(activeNoteData.updatedAt).toLocaleString() : ''}
            </div>
            <textarea
              className="flex-1 bg-transparent border-none text-gray-300 outline-none resize-none custom-scrollbar"
              placeholder="Start typing your notes here..."
              value={activeNoteData.content}
              onChange={(e) => updateNote(activeNoteData.id, e.target.value)}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Book className="h-16 w-16 mb-4 opacity-20" />
            <p>Select a note or create a new one to start writing.</p>
          </div>
        )}
      </div>
    </div>
  )
}
