import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Bookmark,
  BookOpen,
  MessageSquare,
  Clock,
  Tag
} from 'lucide-react'
import { notesService } from '../services/api'

// Simple animated background
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 8,
        y: (e.clientY / window.innerHeight - 0.5) * 8
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="page-bg">
      <div className="bg-orb" style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }} />
    </div>
  )
}

const NoteCard = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSourceIcon = (sourceType) => {
    switch (sourceType) {
      case 'bible':
        return <BookOpen size={16} />
      case 'companion':
        return <MessageSquare size={16} />
      case 'devotion':
        return <Clock size={16} />
      case 'general':
        return <FileText size={16} />
      default:
        return <FileText size={16} />
    }
  }

  const getSourceColor = (sourceType) => {
    switch (sourceType) {
      case 'bible':
        return '#8b5cf6'
      case 'companion':
        return '#10b981'
      case 'devotion':
        return '#f59e0b'
      case 'general':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="note-card">
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button
            className="note-action"
            onClick={() => onEdit(note)}
            title="Edit note"
          >
            <Edit size={16} />
          </button>
          <button
            className="note-action note-action-delete"
            onClick={() => onDelete(note.id)}
            title="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="note-meta">
        <div
          className="note-source"
          style={{ color: getSourceColor(note.source_type) }}
        >
          {getSourceIcon(note.source_type)}
          <span>{note.source_type.charAt(0).toUpperCase() + note.source_type.slice(1)}</span>
        </div>
        {note.source_reference && (
          <div className="note-reference">
            <Bookmark size={14} />
            <span>{note.source_reference}</span>
          </div>
        )}
        <div className="note-date">
          <Clock size={14} />
          <span>{formatDate(note.created_at)}</span>
        </div>
      </div>

      <div className="note-content">
        {note.content.length > 150
          ? `${note.content.substring(0, 150)}...`
          : note.content
        }
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, index) => (
            <span key={index} className="note-tag">
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const Notes = () => {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source_type: 'general',
    source_reference: '',
    tags: []
  })

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchQuery, filterSource])

  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      const data = await notesService.getNotes()
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by source type
    if (filterSource) {
      filtered = filtered.filter(note => note.source_type === filterSource)
    }

    setFilteredNotes(filtered)
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    try {
      const newNote = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== '')
      }
      await notesService.createNote(newNote)
      setFormData({
        title: '',
        content: '',
        source_type: 'companion',
        source_reference: '',
        tags: []
      })
      setShowCreateForm(false)
      fetchNotes()
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleEditNote = async (e) => {
    e.preventDefault()
    try {
      const updatedNote = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== '')
      }
      await notesService.updateNote(editingNote.id, updatedNote)
      setEditingNote(null)
      setFormData({
        title: '',
        content: '',
        source_type: 'companion',
        source_reference: '',
        tags: []
      })
      fetchNotes()
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesService.deleteNote(noteId)
        fetchNotes()
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }
  }

  const startEdit = (note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      source_type: note.source_type,
      source_reference: note.source_reference || '',
      tags: note.tags || []
    })
  }

  const cancelEdit = () => {
    setEditingNote(null)
      setFormData({
        title: '',
        content: '',
        source_type: 'general',
        source_reference: '',
        tags: []
      })
  }

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }))
  }

  const updateTag = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }))
  }

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="page-container">
      <AnimatedBackground />

      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <FileText size={32} />
            </div>
            <div>
              <h1>My Notes</h1>
              <p>Capture insights from your spiritual journey</p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            New Note
          </button>
        </div>

        {/* Search and Filters */}
        <div className="notes-controls">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-bar">
            <Filter size={18} />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="">All Notes</option>
              <option value="bible">Bible</option>
              <option value="companion">AI Companion</option>
              <option value="devotion">Devotion</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingNote) && (
          <div className="note-form-overlay">
            <div className="note-form-card">
              <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
              <form onSubmit={editingNote ? handleEditNote : handleCreateNote}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reference (optional)</label>
                  <input
                    type="text"
                    value={formData.source_reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, source_reference: e.target.value }))}
                    placeholder="e.g., John 3:16, Psalm 23"
                  />
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="tag-input-group">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="Add tag..."
                        />
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="remove-tag"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addTag} className="add-tag">
                      <Plus size={14} />
                      Add Tag
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={editingNote ? cancelEdit : () => setShowCreateForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No notes found</h3>
            <p>
              {notes.length === 0
                ? "You haven't created any notes yet. Start capturing your spiritual insights!"
                : "No notes match your current search or filter."
              }
            </p>
            {notes.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus size={18} />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={startEdit}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notes