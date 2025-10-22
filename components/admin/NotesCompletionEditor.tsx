'use client'

import { useState } from 'react'
import AdvancedTextEditor from './AdvancedTextEditor'

interface NoteItem {
  id: string
  content: string
  hasBlank: boolean
  blankAnswer?: string
  blankPosition?: number
}

interface NotesCompletionEditorProps {
  title: string
  instructions: string
  notes: NoteItem[]
  onTitleChange: (title: string) => void
  onInstructionsChange: (instructions: string) => void
  onNotesChange: (notes: NoteItem[]) => void
}

export default function NotesCompletionEditor({
  title,
  instructions,
  notes,
  onTitleChange,
  onInstructionsChange,
  onNotesChange
}: NotesCompletionEditorProps) {
  const [activeNote, setActiveNote] = useState<string | null>(null)

  const addNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      content: '',
      hasBlank: false
    }
    onNotesChange([...notes, newNote])
  }

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    onNotesChange(
      notes.map(note => 
        note.id === id ? { ...note, ...updates } : note
      )
    )
  }

  const removeNote = (id: string) => {
    onNotesChange(notes.filter(note => note.id !== id))
  }

  const toggleBlank = (id: string) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      updateNote(id, { 
        hasBlank: !note.hasBlank,
        blankAnswer: !note.hasBlank ? '' : undefined
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Title and Instructions */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the title for the notes completion..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <AdvancedTextEditor
            data={instructions}
            onChange={onInstructionsChange}
            placeholder="Enter instructions for the notes completion..."
          />
        </div>
      </div>

      {/* Notes Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Notes</h3>
          <button
            onClick={addNote}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Note
          </button>
        </div>

        <div className="space-y-3">
          {notes.map((note, index) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Note {index + 1}</span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={note.hasBlank}
                      onChange={() => toggleBlank(note.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Has blank</span>
                  </label>
                </div>
                <button
                  onClick={() => removeNote(note.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note Content
                  </label>
                  <AdvancedTextEditor
                    data={note.content}
                    onChange={(data) => updateNote(note.id, { content: data })}
                    placeholder="Enter the note content..."
                  />
                </div>

                {note.hasBlank && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blank Answer
                    </label>
                    <input
                      type="text"
                      value={note.blankAnswer || ''}
                      onChange={(e) => updateNote(note.id, { blankAnswer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter the correct answer for this blank..."
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-bold text-center mb-6 uppercase tracking-wide">
            {title || 'Untitled Notes'}
          </h4>
          
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div key={note.id} className="flex items-center space-x-2">
                <span className="text-sm">- {note.content}</span>
                {note.hasBlank && (
                  <input
                    type="text"
                    disabled
                    className="w-24 h-8 border border-gray-300 rounded px-2 text-sm bg-gray-100"
                    placeholder={`${index + 1}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
