import { useState, useEffect } from 'react'
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
  Tag,
  X,
  ChevronRight,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react'
import { notesService } from '../services/api'
import { AnimatedBackground } from './LandingPage'

const NoteCard = ({ note, onEdit, onDelete, onUnlock }) => {
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
      case 'bible': return <BookOpen size={14} />
      case 'companion': return <MessageSquare size={14} />
      case 'devotion': return <Clock size={14} />
      default: return <FileText size={14} />
    }
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.75rem',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        position: 'relative',
        opacity: note.is_locked ? 0.9 : 1
      }}
      onClick={() => note.is_locked ? onUnlock(note) : onEdit(note)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-solid)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em' }}>
          {getSourceIcon(note.source_type)}
          {note.source_type.toUpperCase()}
          {note.is_locked && <Lock size={12} style={{ marginLeft: '0.2rem' }} />}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
        {note.is_locked ? 'Locked Insight' : note.title}
      </h3>

      <p style={{
        fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
      }}>
        {note.is_locked ? '••••••••••••••••••••••••' : note.content}
      </p>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {note.tags?.slice(0, 2).map((t, i) => (
            <span key={i} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>#{t}</span>
          ))}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(note.created_at)}</span>
      </div>
    </div>
  )
}

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source_type: 'general',
    source_reference: '',
    tags: [],
    is_locked: false,
    password: ''
  })

  const [promptLock, setPromptLock] = useState(null)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [unlockError, setUnlockError] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    let filtered = notes
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (filterSource) {
      filtered = filtered.filter(n => n.source_type === filterSource)
    }
    setFilteredNotes(filtered)
  }, [notes, searchQuery, filterSource])

  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      const data = await notesService.getNotes()
      setNotes(data)
    } catch (e) { console.error(e) } finally { setIsLoading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const dataToSave = { ...formData }
      // If we're updating and not changing password, don't send empty password
      if (editingNote && !dataToSave.password) {
        delete dataToSave.password
      }

      if (editingNote) {
        await notesService.updateNote(editingNote.id, dataToSave)
      } else {
        await notesService.createNote(dataToSave)
      }
      setShowEditor(false)
      setEditingNote(null)
      setFormData({ title: '', content: '', source_type: 'general', source_reference: '', tags: [], is_locked: false, password: '' })
      fetchNotes()
    } catch (e) { console.error(e) }
  }

  const handleUnlock = async (e) => {
    e.preventDefault()
    try {
      setUnlockError('')
      const fullNote = await notesService.unlockNote(promptLock.id, unlockPassword)
      setEditingNote(fullNote)
      setFormData(fullNote)
      setPromptLock(null)
      setUnlockPassword('')
      setShowEditor(true)
    } catch (e) {
      setUnlockError('Incorrect password or PIN')
      console.error(e)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this insight forever?')) {
      await notesService.deleteNote(id)
      fetchNotes()
    }
  }

  return (
    <div style={{ minHeight: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AnimatedBackground />

      {/* Header Area */}
      <header style={{ padding: '2.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '0.25rem' }}>Your Journal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Insights, prayers, and reflections from your journey.</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setFormData({ title: '', content: '', source_type: 'general', source_reference: '', tags: [], is_locked: false, password: '' }); setShowEditor(true); }}
          style={{ background: 'var(--brand-solid)', color: 'var(--bg-main)', padding: '0.8rem 2rem', borderRadius: '3rem', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-main)' }}
        >
          <Plus size={18} />
          NEW ENTRY
        </button>
      </header>

      {/* Constraints & Filters */}
      <div style={{ padding: '0 3rem', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', zIndex: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search your reflections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
          />
        </div>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Sources</option>
          <option value="bible">Bible</option>
          <option value="companion">AI Sanctuary</option>
          <option value="devotion">Devotions</option>
          <option value="general">Personal</option>
        </select>
      </div>

      {/* Notes Grid */}
      <div style={{ flex: 1, padding: '0 3rem 4rem', overflowY: 'auto', zIndex: 10 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>Preparing your journal...</div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '8rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
            <p>Your journal is waiting for its first entry.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredNotes.map(n => (
              <NoteCard
                key={n.id}
                note={n}
                onEdit={(note) => { setEditingNote(note); setFormData(note); setShowEditor(true); }}
                onDelete={handleDelete}
                onUnlock={(note) => setPromptLock(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Journal Editor Modal */}
      {showEditor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', background: 'var(--bg-main)', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>{editingNote ? 'Refine Entry' : 'New Journal Entry'}</h2>
              <button onClick={() => setShowEditor(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '2.5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>TITLE OF REFLECTION</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What is the Word today?"
                  required
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', fontSize: '1.5rem', color: 'var(--text-main)', outline: 'none', fontWeight: 500, paddingBottom: '0.5rem' }}
                  className="font-serif"
                />
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1rem' }}>JOURNAL CONTENT</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your heart here..."
                  required
                  rows={8}
                  style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', fontSize: '1.1rem', color: 'var(--text-main)', outline: 'none', lineHeight: 1.6, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ENTRY SOURCE</label>
                  <select
                    value={formData.source_type}
                    onChange={e => setFormData({ ...formData, source_type: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="general">Personal Journey</option>
                    <option value="bible">Bible Verse Insight</option>
                    <option value="companion">AI Reflection</option>
                    <option value="devotion">Daily Devotion</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TAGS (comma separated)</label>
                  <input
                    type="text"
                    placeholder="peace, joy, grace"
                    value={formData.tags.join(', ')}
                    onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formData.is_locked ? '1.5rem' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: formData.is_locked ? 'var(--brand-solid)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: formData.is_locked ? 'var(--bg-main)' : 'var(--text-muted)', transition: 'all 0.3s ease' }}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Lock this note</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protect with a private password or PIN</p>
                    </div>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, is_locked: !formData.is_locked })}
                    style={{ width: '48px', height: '24px', borderRadius: '12px', background: formData.is_locked ? 'var(--brand-solid)' : 'var(--border-color)', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: formData.is_locked ? '27px' : '3px', transition: 'all 0.3s ease' }} />
                  </div>
                </div>

                {formData.is_locked && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SET PASSWORD / PIN</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="password"
                        placeholder="Enter secret code..."
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '3.5rem' }}>
                <button
                  type="submit"
                  style={{ width: '100%', background: 'var(--brand-solid)', color: 'var(--bg-main)', padding: '1.25rem', borderRadius: '12px', border: 'none', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                >
                  {editingNote ? 'SAVE REFLECTION' : 'CLOSE JOURNAL ENTRY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {promptLock && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-main)', borderRadius: '24px', padding: '2.5rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--brand-solid)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Lock size={32} />
            </div>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Locked Insight</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>This reflection is protected. Please enter your password or PIN to view.</p>

            <form onSubmit={handleUnlock}>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Secret code..."
                  autoFocus
                  value={unlockPassword}
                  onChange={e => setUnlockPassword(e.target.value)}
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '1.1rem' }}
                />
              </div>

              {unlockError && <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>{unlockError}</p>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setPromptLock(null); setUnlockPassword(''); setUnlockError(''); }}
                  style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--brand-solid)', color: 'var(--bg-main)', fontWeight: 700, cursor: 'pointer' }}
                >
                  UNLOCK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes