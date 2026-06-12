// @ts-nocheck
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
import { toast } from 'sonner'
import { notesService } from '../services/api'
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/use-notes'
import { AnimatedBackground } from '../components/ui/SharedComponents'

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
      className="glass-panel flex flex-col gap-4 cursor-pointer transition-all duration-300 ease-in-out border border-[var(--border-color)] bg-[var(--bg-card)] relative rounded-[20px]"
      style={{ padding: '1.75rem', opacity: note.is_locked ? 0.9 : 1 }}
      onClick={() => note.is_locked ? onUnlock(note) : onEdit(note)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-[var(--brand-solid)] font-extrabold tracking-widest" style={{ fontSize: '0.65rem' }}>
          {getSourceIcon(note.source_type)}
          {note.source_type.toUpperCase()}
          {note.is_locked && <Lock size={12} style={{ marginLeft: '0.2rem' }} />}
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="bg-transparent border-0 text-[var(--text-muted)] cursor-pointer"
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

      <div className="mt-auto flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
        <div className="flex gap-[0.4rem]">
          {note.tags?.slice(0, 2).map((t, i) => (
            <span key={i} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>#{t}</span>
          ))}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(note.created_at)}</span>
      </div>
    </div>
  )
}

export const Notes = () => {
  const { data: notes = [], isLoading } = useNotes()
  const [filteredNotes, setFilteredNotes] = useState<import('../types').Note[]>([])
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

  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

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

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const dataToSave = { ...formData }
      if (editingNote && !dataToSave.password) delete dataToSave.password

      if (editingNote) {
        await updateNote.mutateAsync({ id: editingNote.id, data: dataToSave })
      } else {
        await createNote.mutateAsync(dataToSave)
      }
      setShowEditor(false)
      setEditingNote(null)
      setFormData({ title: '', content: '', source_type: 'general', source_reference: '', tags: [], is_locked: false, password: '' })
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save note')
    }
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
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this insight forever?')) {
      try {
        await deleteNote.mutateAsync(id)
      } catch {
        toast.error('Could not delete the note. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-full relative flex flex-col overflow-hidden">
      <AnimatedBackground />

      {/* Header Area */}
      <header className="flex justify-between items-center z-10" style={{ padding: '2.5rem 3rem' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '0.25rem' }}>Your Journal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Insights, prayers, and reflections from your journey.</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setFormData({ title: '', content: '', source_type: 'general', source_reference: '', tags: [], is_locked: false, password: '' }); setShowEditor(true); }}
          className="bg-[var(--brand-solid)] text-[var(--bg-main)] rounded-[3rem] border-0 font-semibold cursor-pointer flex items-center gap-2 shadow-[var(--shadow-main)]"
          style={{ padding: '0.8rem 2rem' }}
        >
          <Plus size={18} />
          NEW ENTRY
        </button>
      </header>

      {/* Constraints & Filters */}
      <div className="flex gap-6 z-10" style={{ padding: '0 3rem', marginBottom: '2.5rem' }}>
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
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
      <div className="flex-1 overflow-y-auto z-10" style={{ padding: '0 3rem 4rem' }}>
        {isLoading ? (
          <div className="text-center mt-16 text-[var(--text-muted)]">Preparing your journal...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center mt-32 text-[var(--text-muted)]">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[10px] z-[100] flex items-center justify-center p-8">
          <div className="glass-panel w-full bg-[var(--bg-main)] rounded-[32px] overflow-hidden border border-[var(--border-color)] shadow-[var(--shadow-lg)]" style={{ maxWidth: '700px' }}>
            <div className="flex justify-between items-center border-b border-[var(--border-color)]" style={{ padding: '2rem 2.5rem' }}>
              <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>{editingNote ? 'Refine Entry' : 'New Journal Entry'}</h2>
              <button onClick={() => setShowEditor(false)} className="bg-transparent border-0 text-[var(--text-main)] cursor-pointer"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '2.5rem' }}>
              <div className="mb-8">
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

              <div className="mb-10">
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

              <div className="flex gap-6">
                <div className="flex-1">
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
                <div className="flex-1">
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

              <div className="mt-8 p-6 bg-[var(--input-bg)] rounded-[16px] border border-[var(--border-color)]">
                <div className="flex justify-between items-center" style={{ marginBottom: formData.is_locked ? '1.5rem' : 0 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-300 ease-in-out"
                      style={{
                        background: formData.is_locked ? 'var(--brand-solid)' : 'var(--bg-card)',
                        color: formData.is_locked ? 'var(--bg-main)' : 'var(--text-muted)'
                      }}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Lock this note</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protect with a private password or PIN</p>
                    </div>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, is_locked: !formData.is_locked })}
                    className="w-12 h-6 rounded-xl relative cursor-pointer transition-all duration-300 ease-in-out"
                    style={{ background: formData.is_locked ? 'var(--brand-solid)' : 'var(--border-color)' }}
                  >
                    <div className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all duration-300 ease-in-out"
                      style={{ left: formData.is_locked ? '27px' : '3px' }} />
                  </div>
                </div>

                {formData.is_locked && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SET PASSWORD / PIN</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
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

              <div className="mt-14">
                <button
                  type="submit"
                  className="w-full bg-[var(--brand-solid)] text-[var(--bg-main)] rounded-xl border-0 text-[1.1rem] font-bold cursor-pointer flex items-center justify-center gap-3"
                  style={{ padding: '1.25rem' }}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[15px] z-[200] flex items-center justify-center p-8">
          <div className="glass-panel w-full bg-[var(--bg-main)] rounded-[24px] border border-[var(--border-color)] text-center" style={{ maxWidth: '400px', padding: '2.5rem' }}>
            <div className="w-16 h-16 rounded-[20px] bg-[var(--brand-solid)] text-[var(--bg-main)] flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Locked Insight</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>This reflection is protected. Please enter your password or PIN to view.</p>

            <form onSubmit={handleUnlock}>
              <div className="relative mb-4">
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
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

              <div className="flex gap-4">
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
