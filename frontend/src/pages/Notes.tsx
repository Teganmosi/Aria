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
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

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
      className="glass-panel flex flex-col gap-4 cursor-pointer transition-all duration-300 ease-in-out border border-[var(--border-color)] bg-[var(--bg-card)] relative rounded-[20px] note-card"
      style={{ opacity: note.is_locked ? 0.9 : 1 }}
      onClick={() => note.is_locked ? onUnlock(note) : onEdit(note)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-[var(--brand-solid)] font-extrabold tracking-widest note-source-badge">
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

      <h3 className="font-serif note-title">
        {note.is_locked ? 'Locked Insight' : note.title}
      </h3>

      <p className="note-excerpt">
        {note.is_locked ? '••••••••••••••••••••••••' : note.content}
      </p>

      <div className="mt-auto flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
        <div className="flex gap-[0.4rem]">
          {note.tags?.slice(0, 2).map((t, i) => (
            <span key={i} className="note-tag">#{t}</span>
          ))}
        </div>
        <span className="note-date">{formatDate(note.created_at)}</span>
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

  const [noteToDelete, setNoteToDelete] = useState(null)

  const handleDelete = (id) => setNoteToDelete(id)

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return
    try {
      await deleteNote.mutateAsync(noteToDelete)
      toast.success('Note deleted')
    } catch {
      toast.error('Could not delete the note. Please try again.')
    } finally {
      setNoteToDelete(null)
    }
  }

  return (
    <div className="notes-page-container min-h-full relative flex flex-col overflow-hidden">
      <AnimatedBackground />

      {/* Header Area */}
      <header className="notes-header z-10">
        <div>
          <h1 className="font-serif notes-header-title">Your Journal</h1>
          <p className="notes-header-subtitle">Insights, prayers, and reflections from your journey.</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setFormData({ title: '', content: '', source_type: 'general', source_reference: '', tags: [], is_locked: false, password: '' }); setShowEditor(true); }}
          className="new-entry-btn bg-[var(--brand-solid)] text-[var(--bg-main)] rounded-[3rem] border-0 font-semibold cursor-pointer flex items-center gap-2 shadow-[var(--shadow-main)]"
        >
          <Plus size={18} />
          NEW ENTRY
        </button>
      </header>

      {/* Constraints & Filters */}
      <div className="notes-filters z-10">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search your reflections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
        </div>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="filter-select"
        >
          <option value="">All Sources</option>
          <option value="bible">Bible</option>
          <option value="companion">AI Sanctuary</option>
          <option value="devotion">Devotions</option>
          <option value="general">Personal</option>
        </select>
      </div>

      <ConfirmDialog
        open={noteToDelete !== null}
        danger
        title="Delete this insight?"
        description="This removes the entry from your journal forever. This cannot be undone."
        confirmLabel="Delete Forever"
        onCancel={() => setNoteToDelete(null)}
        onConfirm={confirmDeleteNote}
      />

      {/* Notes Grid */}
      <div className="notes-grid-container flex-1 overflow-y-auto z-10">
        {isLoading ? (
          <div className="text-center mt-16 text-[var(--text-muted)]">Preparing your journal...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center mt-32 text-[var(--text-muted)]">
            <FileText size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2, display: 'block' }} />
            {searchQuery || filterSource ? (
              <p>No entries match your search. Try different words or clear the filters.</p>
            ) : (
              <p>Your journal is waiting for its first entry.</p>
            )}
          </div>
        ) : (
          <div className="notes-grid">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[10px] z-[100] flex items-center justify-center modal-overlay">
          <div className="glass-panel w-full bg-[var(--bg-main)] rounded-[32px] overflow-hidden border border-[var(--border-color)] shadow-[var(--shadow-lg)] editor-modal-container">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] modal-header">
              <h2 className="font-serif m-0" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{editingNote ? 'Refine Entry' : 'New Journal Entry'}</h2>
              <button onClick={() => setShowEditor(false)} className="bg-transparent border-0 text-[var(--text-main)] cursor-pointer"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="mb-8">
                <label className="field-label">TITLE OF REFLECTION</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What is the Word today?"
                  required
                  className="title-input font-serif"
                />
              </div>

              <div className="mb-10">
                <label className="field-label">JOURNAL CONTENT</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your heart here..."
                  required
                  rows={8}
                  className="content-textarea"
                />
              </div>

              <div className="form-row-flex">
                <div className="form-col-flex">
                  <label className="field-label">ENTRY SOURCE</label>
                  <select
                    value={formData.source_type}
                    onChange={e => setFormData({ ...formData, source_type: e.target.value })}
                    className="form-select"
                  >
                    <option value="general">Personal Journey</option>
                    <option value="bible">Bible Verse Insight</option>
                    <option value="companion">AI Reflection</option>
                    <option value="devotion">Daily Devotion</option>
                  </select>
                </div>
                <div className="form-col-flex">
                  <label className="field-label">TAGS (comma separated)</label>
                  <input
                    type="text"
                    placeholder="peace, joy, grace"
                    value={formData.tags.join(', ')}
                    onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="lock-section mt-8 p-6 bg-[var(--input-bg)] rounded-[16px] border border-[var(--border-color)]">
                <div className={`flex justify-between items-center ${formData.is_locked ? 'mb-6' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-300 ease-in-out lock-badge"
                      style={{
                        background: formData.is_locked ? 'var(--brand-solid)' : 'var(--bg-card)',
                        color: formData.is_locked ? 'var(--bg-main)' : 'var(--text-muted)'
                      }}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 className="lock-title">Lock this note</h4>
                      <p className="lock-subtitle">Protect with a private password or PIN</p>
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
                    <label className="field-label mt-4 display-block">SET PASSWORD / PIN</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="password"
                        placeholder="Enter secret code..."
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="password-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-14">
                <button
                  type="submit"
                  className="w-full bg-[var(--brand-solid)] text-[var(--bg-main)] rounded-xl border-0 text-[1.1rem] font-bold cursor-pointer flex items-center justify-center gap-3 submit-btn"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[15px] z-[200] flex items-center justify-center modal-overlay">
          <div className="glass-panel w-full bg-[var(--bg-main)] rounded-[24px] border border-[var(--border-color)] text-center unlock-modal-container">
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
                  className="unlock-input"
                />
              </div>

              {unlockError && <p className="unlock-error">{unlockError}</p>}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setPromptLock(null); setUnlockPassword(''); setUnlockError(''); }}
                  className="unlock-cancel-btn"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="unlock-confirm-btn"
                >
                  UNLOCK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .notes-page-container {
          background: var(--bg-main);
          color: var(--text-main);
        }
        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2.5rem 3rem;
        }
        .notes-header-title {
          font-size: 2.2rem;
          color: var(--text-main);
          font-weight: 500;
          margin: 0 0 0.25rem;
        }
        .notes-header-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }
        .new-entry-btn {
          padding: 0.8rem 2rem;
        }
        .notes-filters {
          display: flex;
          gap: 1.5rem;
          padding: 0 3rem;
          margin-bottom: 2.5rem;
        }
        .filter-search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-main);
          outline: none;
        }
        .filter-select {
          padding: 0.75rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-main);
          outline: none;
          cursor: pointer;
        }
        .notes-grid-container {
          padding: 0 3rem 4rem;
        }
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .note-card {
          padding: 1.75rem;
        }
        .note-title {
          font-size: 1.25rem;
          color: var(--text-main);
          margin: 0;
          line-height: 1.3;
        }
        .note-excerpt {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          margin: 0;
        }
        .note-tag {
          font-size: 0.65rem;
          color: var(--text-muted);
          background: var(--input-bg);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .note-date {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        
        /* Modal Styles */
        .modal-overlay {
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
          z-index: 100;
          padding: 2rem;
        }
        .editor-modal-container {
          max-width: 700px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          padding: 2rem 2.5rem;
        }
        .modal-form {
          padding: 2.5rem;
          overflow-y: auto;
          max-height: calc(90vh - 100px);
        }
        .field-label {
          display: block;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          font-weight: 800;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .title-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-color);
          font-size: 1.5rem;
          color: var(--text-main);
          outline: none;
          font-weight: 500;
          padding-bottom: 0.5rem;
        }
        .content-textarea {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
          font-size: 1.1rem;
          color: var(--text-main);
          outline: none;
          line-height: 1.6;
          resize: none;
        }
        .form-row-flex {
          display: flex;
          gap: 1.5rem;
        }
        .form-col-flex {
          flex: 1;
        }
        .form-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-main);
          outline: none;
        }
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-main);
          outline: none;
        }
        .lock-badge {
          background: var(--bg-card);
          color: var(--text-muted);
        }
        .lock-title {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-main);
        }
        .lock-subtitle {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .password-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          color: var(--text-main);
          outline: none;
        }
        .submit-btn {
          padding: 1.25rem;
        }
        .unlock-modal-container {
          max-width: 400px;
          padding: 2.5rem;
        }
        .unlock-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-main);
          outline: none;
          font-size: 1.1rem;
        }
        .unlock-error {
          color: #ff6b6b;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          margin-top: -0.5rem;
        }
        .unlock-cancel-btn {
          flex: 1;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-main);
          font-weight: 600;
          cursor: pointer;
        }
        .unlock-confirm-btn {
          flex: 2;
          padding: 1rem;
          border-radius: 12px;
          border: none;
          background: var(--brand-solid);
          color: var(--bg-main);
          font-weight: 700;
          cursor: pointer;
        }
        
        /* Mobile Breakpoints */
        @media (max-width: 768px) {
          .notes-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.25rem;
            padding: 1.5rem 1.25rem 1rem;
          }
          .notes-header-title {
            font-size: 1.75rem;
          }
          .notes-header-subtitle {
            font-size: 0.9rem;
          }
          .new-entry-btn {
            width: 100%;
            justify-content: center;
            padding: 0.75rem 1.5rem !important;
          }
          .notes-filters {
            flex-direction: column;
            gap: 0.75rem;
            padding: 0 1.25rem;
            margin-bottom: 1.5rem;
          }
          .filter-search-input {
            padding: 0.875rem 1rem 0.875rem 3rem !important;
          }
          .filter-select {
            padding: 0.875rem 2.5rem 0.875rem 1rem !important;
          }
          .notes-grid-container {
            padding: 0 1.25rem 2rem;
          }
          .notes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .note-card {
            padding: 1.25rem;
          }
          .note-title {
            font-size: 1.15rem;
          }
        }
        
        @media (max-width: 640px) {
          .modal-overlay {
            padding: 1rem;
          }
          .editor-modal-container {
            max-height: 95vh;
            border-radius: 24px;
          }
          .modal-header {
            padding: 1.25rem 1.5rem;
          }
          .modal-form {
            padding: 1.5rem;
            max-height: calc(95vh - 80px);
          }
          .form-row-flex {
            flex-direction: column;
            gap: 1rem;
          }
          .submit-btn {
            padding: 1rem;
            font-size: 1rem;
          }
          .unlock-modal-container {
            padding: 1.5rem;
            border-radius: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default Notes
