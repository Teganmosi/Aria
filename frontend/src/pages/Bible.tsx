// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, BookOpen, ChevronRight, ChevronLeft, MessageSquare,
  ArrowLeft, Bookmark, Volume2, Share2, Sparkles, X, Check,
  PlayCircle, StopCircle, SkipForward, SkipBack, Settings2
} from 'lucide-react'
import { bibleService, homeService, ttsService } from '../services/api'
import { AnimatedBackground } from '../components/ui/SharedComponents'

const BIBLE_BOOKS = {
  'Old Testament': [
    { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 }, { name: 'Leviticus', chapters: 27 },
    { name: 'Numbers', chapters: 36 }, { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
    { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
    { name: '2 Samuel', chapters: 24 }, { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
    { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 }, { name: 'Ezra', chapters: 10 },
    { name: 'Nehemiah', chapters: 13 }, { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
    { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 }, { name: 'Ecclesiastes', chapters: 12 },
    { name: 'Song of Solomon', chapters: 8 }, { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
    { name: 'Hosea', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
    { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 }, { name: 'Micah', chapters: 7 },
    { name: 'Nahum', chapters: 3 }, { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
    { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 }, { name: 'Malachi', chapters: 4 }
  ],
  'New Testament': [
    { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 }, { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
    { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 }, { name: 'Galatians', chapters: 6 },
    { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
    { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 }, { name: '1 Timothy', chapters: 6 },
    { name: '2 Timothy', chapters: 4 }, { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
    { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 }, { name: '1 Peter', chapters: 5 },
    { name: '2 Peter', chapters: 3 }, { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 }, { name: 'Revelation', chapters: 22 }
  ]
}

const SAVED_KEY = 'aria_saved_verses'
const VOICE_KEY = 'aria_tts_voice'

const YARNGPT_VOICES = [
  { name: 'Idera', desc: 'Melodic, gentle' },
  { name: 'Emma', desc: 'Authoritative, deep' },
  { name: 'Zainab', desc: 'Soothing, gentle' },
  { name: 'Osagie', desc: 'Smooth, calm' },
  { name: 'Wura', desc: 'Young, sweet' },
  { name: 'Jude', desc: 'Warm, confident' },
  { name: 'Chinenye', desc: 'Engaging, warm' },
  { name: 'Tayo', desc: 'Upbeat, energetic' },
  { name: 'Regina', desc: 'Mature, warm' },
  { name: 'Femi', desc: 'Rich, reassuring' },
  { name: 'Adaora', desc: 'Warm, engaging' },
  { name: 'Umar', desc: 'Calm, smooth' },
  { name: 'Mary', desc: 'Energetic, youthful' },
  { name: 'Nonso', desc: 'Bold, resonant' },
  { name: 'Remi', desc: 'Melodious, warm' },
  { name: 'Adam', desc: 'Deep, clear' }
]

const getSavedVerses = (): string[] => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') } catch { return [] }
}

const toggleSavedVerse = (ref: string): boolean => {
  const saved = getSavedVerses()
  const idx = saved.indexOf(ref)
  const next = idx === -1 ? [...saved, ref] : saved.filter((_, i) => i !== idx)
  localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  return idx === -1
}

const BookCard = ({ book, isSelected, onClick }) => (
  <button className={`book-card glass-panel ${isSelected ? 'active' : ''}`} onClick={onClick}>
    <div className="book-card-content">
      <h4 className="font-serif">{book.name}</h4>
      <p>{book.chapters} chapters</p>
    </div>
  </button>
)

const VerseCard = ({ verse, bookName, chapterNum, isActiveReading, chapterPlaying, verseId, isPlaying, onPlayToggle }) => {
  const ref = `${bookName} ${chapterNum}:${verse.verse || verse.number}`
  const [isSaved, setIsSaved] = useState(() => getSavedVerses().includes(ref))
  const [shareToast, setShareToast] = useState(false)

  const handleBookmark = useCallback(() => {
    const next = toggleSavedVerse(ref)
    setIsSaved(next)
  }, [ref])

  const handleShare = useCallback(async () => {
    const text = `"${verse.text}" — ${ref}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Aria — Scripture', text }) } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2000)
      } catch { /* clipboard blocked */ }
    }
  }, [verse.text, ref])

  return (
    <div
      id={verseId}
      className={`verse-card ${isActiveReading ? 'verse-card--active' : ''}`}
    >
      <div className="verse-content-wrapper">
        <span className={`verse-number ${isActiveReading ? 'verse-number--active' : ''}`}>
          {verse.verse || verse.number}
        </span>
        <p className="verse-text font-serif">{verse.text}</p>
      </div>
      <div className="verse-actions">
        <button
          className={`verse-action ${isSaved ? 'saved' : ''}`}
          onClick={handleBookmark}
          title={isSaved ? 'Remove bookmark' : 'Bookmark verse'}
        >
          <Bookmark size={16} fill={isSaved ? 'var(--brand-accent)' : 'none'} />
        </button>
        <button className="verse-action" onClick={handleShare} title="Share verse">
          {shareToast ? <Check size={16} color="var(--brand-accent)" /> : <Share2 size={16} />}
        </button>
        {!chapterPlaying && (
          <button
            className={`verse-action ${isPlaying ? 'saved' : ''}`}
            onClick={onPlayToggle}
            title={isPlaying ? 'Stop playing' : 'Listen to verse'}
            style={isPlaying ? { color: 'var(--brand-accent)', borderColor: 'var(--brand-accent)' } : {}}
          >
            <Volume2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export const Bible = () => {
  const navigate = useNavigate()
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [pickerSearch, setPickerSearch] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showAISelector, setShowAISelector] = useState(false)
  const [verses, setVerses] = useState([])
  const [isLoadingVerses, setIsLoadingVerses] = useState(false)
  const [versesError, setVersesError] = useState('')
  const [view, setView] = useState('books')
  const [readingProgress, setReadingProgress] = useState(0)
  const [verseOfDay, setVerseOfDay] = useState({ verse: '', reference: '' })
  const [showBookOverlay, setShowBookOverlay] = useState(false)
  const [showChapterOverlay, setShowChapterOverlay] = useState(false)
  const [chapterPlaying, setChapterPlaying] = useState(false)
  const [activeVerseIdx, setActiveVerseIdx] = useState<number | null>(null)
  const [currentlyPlayingVerseIdx, setCurrentlyPlayingVerseIdx] = useState<number | null>(null)
  const chapterPlayingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => localStorage.getItem(VOICE_KEY) || 'Idera')
  const [showVoicePicker, setShowVoicePicker] = useState(false)

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setCurrentlyPlayingVerseIdx(null)
    setChapterPlaying(false)
    setActiveVerseIdx(null)
    chapterPlayingRef.current = false
  }, [])

  const playVerseAudio = useCallback(async (idx: number, isChapterPlayback = false) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    
    if (idx >= verses.length) {
      stopAudio()
      return
    }
    
    if (isChapterPlayback) {
      setActiveVerseIdx(idx)
      const el = document.getElementById(`verse-row-${idx}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      setCurrentlyPlayingVerseIdx(idx)
    }
    
    try {
      const voice = selectedVoiceName || 'Idera'
      const url = await ttsService.getSpeechUrl(verses[idx].text, voice)

      // Pre-fetch next verse's audio in background to allow browser caching
      if (isChapterPlayback && idx + 1 < verses.length) {
        ttsService
          .getSpeechUrl(verses[idx + 1].text, voice)
          .then((nextUrl) => fetch(nextUrl))
          .catch(() => {})
      }

      const audio = new Audio(url)
      audioRef.current = audio
      
      audio.onended = () => {
        if (isChapterPlayback && chapterPlayingRef.current) {
          playVerseAudio(idx + 1, true)
        } else {
          stopAudio()
        }
      }
      
      audio.onerror = () => {
        stopAudio()
      }
      
      await audio.play()
    } catch (err) {
      console.error("TTS playback error:", err)
      stopAudio()
    }
  }, [verses, selectedVoiceName, stopAudio])

  const handlePlayToggle = useCallback((idx: number) => {
    if (currentlyPlayingVerseIdx === idx) {
      stopAudio()
    } else {
      playVerseAudio(idx, false)
    }
  }, [currentlyPlayingVerseIdx, playVerseAudio, stopAudio])

  const handleSelectVoice = useCallback((name: string) => {
    setSelectedVoiceName(name)
    localStorage.setItem(VOICE_KEY, name)
    setShowVoicePicker(false)
  }, [])

  const startChapterPlayback = useCallback(() => {
    if (verses.length === 0) return
    chapterPlayingRef.current = true
    setChapterPlaying(true)
    playVerseAudio(0, true)
  }, [verses, playVerseAudio])

  const stopChapterPlayback = useCallback(() => {
    stopAudio()
  }, [stopAudio])

  const skipVerse = useCallback((direction: 1 | -1) => {
    setActiveVerseIdx(prev => {
      const next = (prev ?? 0) + direction
      if (next < 0 || next >= verses.length) return prev
      chapterPlayingRef.current = true
      playVerseAudio(next, true)
      return next
    })
  }, [verses.length, playVerseAudio])

  // Stop playback when verses change (chapter or book changed)
  useEffect(() => {
    stopAudio()
  }, [verses, stopAudio])

  // Stop on unmount
  useEffect(() => () => {
    stopAudio()
  }, [stopAudio])

  useEffect(() => {
    const fetchVerseOfDay = async () => {
      try {
        const data = await homeService.getHomeData()
        if (data.verse_of_day) setVerseOfDay(data.verse_of_day)
      } catch { }
    }
    fetchVerseOfDay()
  }, [])

  useEffect(() => {
    if (selectedBook) {
      const fetchVerses = async () => {
        setIsLoadingVerses(true)
        setVersesError('')
        try {
          const response = await bibleService.getChapter(selectedBook.name, selectedChapter)
          if (response.verses && response.verses.length > 0) {
            setVerses(response.verses)
            setReadingProgress(0)
            const container = document.getElementById('verses-container')
            if (container) container.scrollTop = 0
          } else {
            setVersesError('No verses found for this chapter.')
          }
        } catch {
          setVersesError('Could not load this chapter. Please try again.')
        } finally {
          setIsLoadingVerses(false)
        }
      }
      fetchVerses()
    }
  }, [selectedBook, selectedChapter])

  useEffect(() => {
    if (verses.length > 0) {
      const handleScroll = () => {
        const element = document.getElementById('verses-container')
        if (element) {
          const progress = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100
          setReadingProgress(Math.min(progress, 100))
        }
      }
      const container = document.getElementById('verses-container')
      container?.addEventListener('scroll', handleScroll)
      return () => container?.removeEventListener('scroll', handleScroll)
    }
  }, [verses])

  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection.toString().trim()
    if (text) { setSelectedText(text); setShowAISelector(true) }
  }

  const discussWithAI = () => {
    navigate('/app/bible-study', { state: { book: selectedBook?.name, chapter: selectedChapter, selectedText } })
  }

  const handleBookSelect = (book) => { setSelectedBook(book); setSelectedChapter(1); setView('chapters') }
  const handleChapterSelect = (chapter) => { setSelectedChapter(chapter); setView('reading') }

  const handleOverlayBookSelect = (book) => {
    setSelectedBook(book)
    setSelectedChapter(1)
    setShowBookOverlay(false)
    setShowChapterOverlay(true)
    setPickerSearch('')
  }

  const handleOverlayChapterSelect = (chapter) => {
    setSelectedChapter(chapter)
    setShowChapterOverlay(false)
  }

  const goBack = () => {
    if (view === 'reading') { setView('chapters') }
    else if (view === 'chapters') { setView('books'); setSelectedBook(null) }
  }

  const filteredBooks = Object.entries(BIBLE_BOOKS).reduce((acc, [testament, books]) => {
    const filtered = books.filter(book => book.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (filtered.length > 0) acc[testament] = filtered
    return acc
  }, {})

  const filteredPickerBooks = Object.entries(BIBLE_BOOKS).reduce((acc, [testament, books]) => {
    const filtered = books.filter(book => book.name.toLowerCase().includes(pickerSearch.toLowerCase()))
    if (filtered.length > 0) acc[testament] = filtered
    return acc
  }, {})

  const getAllBooks = () => [...BIBLE_BOOKS['Old Testament'], ...BIBLE_BOOKS['New Testament']]

  const handleNextChapter = () => {
    if (selectedChapter < selectedBook.chapters) { setSelectedChapter(prev => prev + 1) }
    else {
      const allBooks = getAllBooks()
      const currentIndex = allBooks.findIndex(b => b.name === selectedBook.name)
      if (currentIndex < allBooks.length - 1) { const next = allBooks[currentIndex + 1]; setSelectedBook(next); setSelectedChapter(1) }
    }
  }

  const handlePrevChapter = () => {
    if (selectedChapter > 1) { setSelectedChapter(prev => prev - 1) }
    else {
      const allBooks = getAllBooks()
      const currentIndex = allBooks.findIndex(b => b.name === selectedBook.name)
      if (currentIndex > 0) { const prev = allBooks[currentIndex - 1]; setSelectedBook(prev); setSelectedChapter(prev.chapters) }
    }
  }

  return (
    <div className="page-container">
      <AnimatedBackground />

      {showVoicePicker && (
        <div className="picker-overlay" onClick={() => setShowVoicePicker(false)}>
          <div className="picker-modal picker-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="picker-header">
              <h3 className="font-serif">Reading Voice</h3>
              <button className="picker-close" onClick={() => setShowVoicePicker(false)}><X size={20} /></button>
            </div>
              <div className="voice-list">
                {YARNGPT_VOICES.map(voice => (
                  <button
                    key={voice.name}
                    className={`voice-item ${selectedVoiceName === voice.name ? 'active' : ''}`}
                    onClick={() => handleSelectVoice(voice.name)}
                  >
                    <div className="voice-item-info">
                      <span className="voice-name">{voice.name}</span>
                      <span className="voice-lang">{voice.desc}</span>
                    </div>
                    {selectedVoiceName === voice.name && <Check size={16} color="var(--brand-accent)" />}
                  </button>
                ))}
              </div>
          </div>
        </div>
      )}

      {showBookOverlay && (
        <div className="picker-overlay" onClick={() => setShowBookOverlay(false)}>
          <div className="picker-modal" onClick={e => e.stopPropagation()}>
            <div className="picker-header">
              <h3 className="font-serif">Choose a Book</h3>
              <button className="picker-close" onClick={() => setShowBookOverlay(false)}><X size={20} /></button>
            </div>
            <div className="picker-search">
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search books..."
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="picker-books-scroll">
              {Object.entries(filteredPickerBooks).map(([testament, books]) => (
                <div key={testament} className="picker-testament">
                  <p className="picker-testament-label">{testament}</p>
                  <div className="picker-books-grid">
                    {books.map(book => (
                      <button
                        key={book.name}
                        className={`picker-book-btn ${selectedBook?.name === book.name ? 'active' : ''}`}
                        onClick={() => handleOverlayBookSelect(book)}
                      >
                        {book.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showChapterOverlay && selectedBook && (
        <div className="picker-overlay" onClick={() => setShowChapterOverlay(false)}>
          <div className="picker-modal picker-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="picker-header">
              <h3 className="font-serif">{selectedBook.name} — Chapter</h3>
              <button className="picker-close" onClick={() => setShowChapterOverlay(false)}><X size={20} /></button>
            </div>
            <div className="picker-chapter-grid">
              {Array.from({ length: selectedBook.chapters }, (_, i) => (
                <button
                  key={i + 1}
                  className={`chapter-btn glass-panel ${selectedChapter === i + 1 ? 'active' : ''}`}
                  onClick={() => handleOverlayChapterSelect(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="page-content">
        <header className="bible-header glass-panel">
          <div className="bible-header-left">
            {view !== 'books' && (
              <button className="back-btn" onClick={goBack}>
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-start gap-3">
              <BookOpen size={24} color="var(--brand-accent)" className="mt-1.5 flex-shrink-0" />
              <div className="flex flex-col">
                <h1 className="font-serif m-0" style={{ fontSize: '1.75rem', lineHeight: '1.2' }}>The Sanctuary Library</h1>
                <p className="text-[var(--text-secondary)]" style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                  {selectedBook
                    ? (
                      view === 'reading'
                        ? (
                          <span className="inline-flex items-center gap-1 flex-wrap">
                            <button className="passage-nav-btn" onClick={() => { setShowChapterOverlay(false); setShowBookOverlay(true) }}>
                              {selectedBook.name}
                            </button>
                            <span style={{ opacity: 0.4 }}>•</span>
                            <button className="passage-nav-btn" onClick={() => { setShowBookOverlay(false); setShowChapterOverlay(true) }}>
                              Chapter {selectedChapter}
                            </button>
                          </span>
                        )
                        : `${selectedBook.name} • Chapter ${selectedChapter}`
                    )
                    : "Explore God's Word in quiet reflection"
                  }
                </p>
              </div>
            </div>
          </div>

          {view === 'reading' && (
            <div className="reading-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${readingProgress}%` }} />
              </div>
              <span className="font-serif" style={{ fontStyle: 'italic' }}>{Math.round(readingProgress)}% reflected</span>
            </div>
          )}
        </header>

        <div className="main-bible-layout">
          {view === 'books' && (
            <div className="books-view">
              <div className="verse-of-day glass-panel">
                <div className="vod-header">
                  <Sparkles size={18} color="var(--brand-accent)" />
                  <span className="font-serif">Daily Reflection</span>
                </div>
                <blockquote className="font-serif">
                  "{verseOfDay.verse || 'The Word of the Lord endures forever.'}"
                </blockquote>
                <cite className="font-serif">— {verseOfDay.reference || 'Aria'}</cite>
              </div>

              <div className="search-container glass-panel">
                <Search size={20} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="testaments-layout">
                {Object.entries(filteredBooks).map(([testament, books]) => (
                  <div key={testament} className="testament-section">
                    <h3 className="testament-title font-serif">{testament}</h3>
                    <div className="books-grid">
                      {books.map((book) => (
                        <BookCard
                          key={book.name}
                          book={book}
                          isSelected={selectedBook?.name === book.name}
                          onClick={() => handleBookSelect(book)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'chapters' && selectedBook && (
            <div className="chapters-container">
              <div className="chapter-hero glass-panel">
                <div className="hero-icon font-serif">📖</div>
                <div>
                  <h2 className="font-serif m-0" style={{ fontSize: '2.5rem' }}>{selectedBook.name}</h2>
                  <p className="text-[var(--text-secondary)]" style={{ fontSize: '1.1rem' }}>{selectedBook.chapters} Chapters to explore</p>
                </div>
              </div>

              <div className="chapters-grid-container glass-panel">
                <h3 className="font-serif" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Select a Chapter</h3>
                <div className="chapter-grid">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`chapter-btn glass-panel ${selectedChapter === i + 1 ? 'active' : ''}`}
                      onClick={() => handleChapterSelect(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'reading' && selectedBook && (
            <div className="reading-layout">
              <div id="verses-container" className="verses-scroll glass-panel" onMouseUp={handleTextSelection}>
                <div className="reading-header">
                  <h2 className="font-serif">Chapter {selectedChapter}</h2>
                  <p>{isLoadingVerses ? 'Loading...' : `${verses.length} VERSES`}</p>
                  {!isLoadingVerses && verses.length > 0 && (
                    <div className="reading-controls">
                      {chapterPlaying ? (
                        <button className="play-chapter-btn playing" onClick={stopChapterPlayback}>
                          <StopCircle size={18} />
                          Stop Reading
                        </button>
                      ) : (
                        <button className="play-chapter-btn" onClick={startChapterPlayback}>
                          <PlayCircle size={18} />
                          Listen to Chapter
                        </button>
                      )}
                      <button
                        className="voice-settings-btn"
                        onClick={() => setShowVoicePicker(true)}
                        title="Change reading voice"
                      >
                        <Settings2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {isLoadingVerses ? (
                  <div className="verses-loading">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="verse-skeleton">
                        <div className="skeleton-num" />
                        <div className="skeleton-lines">
                          <div className="skeleton-line" style={{ width: `${70 + (i % 3) * 10}%` }} />
                          <div className="skeleton-line" style={{ width: `${50 + (i % 4) * 8}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : versesError ? (
                  <div className="verses-error">
                    <BookOpen size={40} color="var(--text-muted)" />
                    <p>{versesError}</p>
                    <button className="study-btn" style={{ maxWidth: 200 }} onClick={() => {
                      setVersesError('')
                      setSelectedBook({ ...selectedBook })
                    }}>
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="verses-content">
                    {verses.map((verse, idx) => (
                      <VerseCard
                        key={verse.verse}
                        verse={verse}
                        bookName={selectedBook.name}
                        chapterNum={selectedChapter}
                        verseId={`verse-row-${idx}`}
                        isActiveReading={chapterPlaying && activeVerseIdx === idx}
                        chapterPlaying={chapterPlaying}
                        isPlaying={currentlyPlayingVerseIdx === idx}
                        onPlayToggle={() => handlePlayToggle(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {chapterPlaying && activeVerseIdx !== null && verses[activeVerseIdx] && (
                <div className="now-playing-bar glass-panel">
                  <div className="np-left">
                    <div className="np-pulse-ring" />
                    <div className="np-info">
                      <span className="np-label">Now Reading</span>
                      <span className="np-verse font-serif">
                        {selectedBook.name} {selectedChapter}:{verses[activeVerseIdx].verse || activeVerseIdx + 1}
                      </span>
                    </div>
                  </div>
                  <div className="np-controls">
                    <button className="np-btn" onClick={() => skipVerse(-1)} title="Previous verse" disabled={activeVerseIdx === 0}>
                      <SkipBack size={16} />
                    </button>
                    <button className="np-btn np-stop" onClick={stopChapterPlayback} title="Stop">
                      <StopCircle size={20} />
                    </button>
                    <button className="np-btn" onClick={() => skipVerse(1)} title="Next verse" disabled={activeVerseIdx >= verses.length - 1}>
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="reading-footer-nav glass-panel">
                <button className="nav-btn" onClick={handlePrevChapter} disabled={selectedBook.name === 'Genesis' && selectedChapter === 1}>
                  <ChevronLeft size={20} />
                  <span>Previous</span>
                </button>

                <button className="passage-pill" onClick={() => { setShowBookOverlay(true); setShowChapterOverlay(false) }}>
                  <BookOpen size={14} />
                  <span>{selectedBook.name} {selectedChapter}</span>
                </button>

                <button className="nav-btn" onClick={handleNextChapter} disabled={selectedBook.name === 'Revelation' && selectedChapter === 22}>
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>

              {showAISelector && (
                <div className="ai-insight-popup glass-panel">
                  <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                    <Sparkles size={20} color="var(--brand-accent)" />
                    <span className="font-serif font-semibold">Spiritual Insight</span>
                  </div>
                  <blockquote className="font-serif">"{selectedText.substring(0, 100)}..."</blockquote>
                  <div className="popup-actions">
                    <button className="study-btn" onClick={discussWithAI}>
                      <MessageSquare size={16} />
                      Reflect with Aria
                    </button>
                    <button className="cancel-btn" onClick={() => setShowAISelector(false)}>
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        <style>{`
        .page-container { min-height: 100vh; background: var(--bg-main); position: relative; color: var(--text-main); transition: all 0.4s ease; }
        .page-content { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; position: relative; z-index: 10; }
        @media (max-width: 640px) {
          .page-content { padding: 1rem 1.25rem; }
          .bible-header { flex-direction: column; gap: 1rem; padding: 1.25rem !important; border-radius: 16px !important; }
          .bible-header-left { width: 100%; }
          .reading-progress { width: 100%; }
          .verse-of-day { padding: 2rem 1.5rem !important; border-radius: 24px !important; }
          .verse-of-day blockquote { font-size: 1.4rem !important; line-height: 1.4; }
          .verse-of-day cite { font-size: 0.95rem !important; }
          .search-container { padding: 0.875rem 1.25rem !important; border-radius: 100px !important; }
          .search-container input { font-size: 1rem !important; }
          .testament-title { font-size: 1.4rem !important; }
          .chapter-hero { flex-direction: column; text-align: center; padding: 2rem 1.5rem !important; gap: 1rem; }
          .hero-icon { font-size: 3rem !important; }
          .chapter-hero h2 { font-size: 1.75rem !important; }
          .chapters-grid-container { padding: 1.5rem !important; border-radius: 20px !important; }
        }
        .bible-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-radius: 24px; margin-bottom: 2rem; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--border-color); }
        .bible-header-left { display: flex; align-items: center; gap: 1.5rem; }
        .back-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .back-btn:hover { background: var(--bg-hover); transform: translateX(-3px); }
        .passage-nav-btn { background: none; border: none; color: var(--brand-accent); font-size: 0.9rem; font-weight: 600; cursor: pointer; padding: 0.15rem 0.5rem; border-radius: 6px; transition: background 0.15s; text-decoration: underline; text-underline-offset: 3px; text-decoration-style: dotted; }
        .passage-nav-btn:hover { background: var(--bg-hover); text-decoration: none; }
        .passage-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 100px; color: var(--text-main); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .passage-pill:hover { background: var(--bg-hover); border-color: var(--brand-accent); color: var(--brand-accent); }
        .books-view { display: flex; flex-direction: column; gap: 2rem; }
        .verse-of-day { padding: 2.5rem; border-radius: 32px; text-align: center; background: var(--gradient-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-main); }
        .vod-header { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.85rem; color: var(--text-muted); }
        .verse-of-day blockquote { font-size: 2rem; line-height: 1.4; margin: 0 0 1.5rem; color: var(--text-main); }
        .verse-of-day cite { font-size: 1.1rem; font-style: normal; color: var(--brand-accent); font-weight: 600; }
        .search-container { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.75rem; border-radius: 100px; max-width: 600px; margin: 0 auto; background: var(--input-bg); border: 1px solid var(--border-color); }
        .search-container input { flex: 1; background: none; border: none; outline: none; color: var(--text-main); font-size: 1.1rem; }
        .testament-section { margin-bottom: 3rem; }
        .testament-title { font-size: 1.75rem; margin-bottom: 1.5rem; padding-left: 0.5rem; color: var(--text-main); }
        .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
        @media (max-width: 640px) { .books-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; } .book-card { padding: 1.25rem; } .book-card h4 { font-size: 0.95rem; } }
        .book-card { padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-color); text-align: left; cursor: pointer; transition: all 0.2s; background: var(--bg-card); color: var(--text-main); }
        .book-card:hover { background: var(--bg-hover); border-color: var(--brand-accent); transform: translateY(-2px); }
        .book-card.active { background: var(--brand-solid); color: var(--text-inverse); border-color: var(--brand-solid); }
        .book-card h4 { margin: 0; font-size: 1.1rem; } .book-card p { margin: 0.25rem 0 0; font-size: 0.85rem; opacity: 0.7; }
        .chapters-container { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
        .chapter-hero { display: flex; align-items: center; gap: 2rem; padding: 3rem; border-radius: 32px; background: var(--gradient-card); border: 1px solid var(--border-color); }
        .hero-icon { font-size: 4rem; }
        .chapters-grid-container { padding: 2.5rem; border-radius: 32px; background: var(--bg-card); border: 1px solid var(--border-color); }
        .chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 0.75rem; }
        @media (max-width: 640px) { .chapter-grid { grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); gap: 0.5rem; } .chapter-btn { font-size: 0.95rem; border-radius: 12px; } }
        .chapter-btn { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 600; border-radius: 16px; cursor: pointer; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-main); transition: all 0.2s; }
        .chapter-btn:hover { background: var(--bg-hover); border-color: var(--brand-accent); }
        .chapter-btn.active { background: var(--brand-solid); color: var(--text-inverse); border-color: var(--brand-solid); }
        .reading-layout { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
        .verses-scroll { padding: 3rem; border-radius: 32px; min-height: 60vh; background: var(--bg-card); border: 1px solid var(--border-color); }
        @media (max-width: 640px) {
          .verses-scroll { padding: 1.5rem; border-radius: 20px; min-height: auto; }
          .verse-card { gap: 0.75rem; padding: 1rem !important; flex-direction: column; align-items: flex-start; }
          .verse-text { font-size: 1.05rem; line-height: 1.6; }
          .verse-number { font-size: 0.8rem; min-width: 20px; }
          .verse-actions { align-self: flex-end; opacity: 1 !important; margin-top: 0.25rem; }
          .reading-header h2 { font-size: 1.75rem !important; }
          .reading-footer-nav {
            width: calc(100% - 2rem) !important;
            bottom: 1rem !important;
            padding: 0.6rem 1rem !important;
            border-radius: 100px !important;
            flex-wrap: nowrap !important;
            gap: 0.5rem;
          }
          .passage-pill { font-size: 0.8rem; padding: 0.5rem 0.875rem; }
          .now-playing-bar {
            width: calc(100% - 2rem) !important;
            bottom: 5rem !important;
            padding: 0.75rem 1rem !important;
            border-radius: 16px !important;
          }
          .np-info { max-width: 150px; }
        }
        .reading-header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border-color); }
        .reading-header h2 { font-size: 2.5rem; margin-bottom: 0.5rem; } .reading-header p { color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem; }
        
        .verse-card { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; padding: 1.25rem; border-radius: 16px; transition: all 0.2s; border: 1px solid transparent; }
        .verse-card:hover { background: var(--bg-hover); border-color: var(--border-subtle); }
        .verse-content-wrapper { display: flex; gap: 1rem; flex: 1; align-items: flex-start; }
        .verse-number { font-size: 0.9rem; font-weight: 700; color: var(--brand-accent); min-width: 24px; padding-top: 0.25rem; }
        .verse-text { font-size: 1.2rem; line-height: 1.7; flex: 1; color: var(--text-main); }
        .verse-actions { display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; flex-shrink: 0; }
        .verse-card:hover .verse-actions { opacity: 1; }
        @media (hover: none) { .verse-actions { opacity: 1; } }
        .verse-action { width: 36px; height: 36px; border-radius: 50%; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .verse-action:hover { color: var(--brand-accent); background: var(--bg-card); border-color: var(--brand-accent); }
        .verse-action.saved { color: var(--brand-accent); border-color: var(--brand-accent); background: var(--bg-card); }
        
        .verses-content { display: flex; flex-direction: column; gap: 0.5rem; padding-bottom: 10rem; }
        
        .reading-footer-nav {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 3rem);
          max-width: 600px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.25rem;
          border-radius: 100px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          gap: 0.5rem;
          z-index: 180;
          box-shadow: var(--shadow-main);
        }
        .nav-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 0.75rem; background: none; border: none; color: var(--text-main); font-size: 0.95rem; font-weight: 600; cursor: pointer; border-radius: 100px; transition: all 0.2s; }
        .nav-btn:hover:not(:disabled) { background: var(--bg-hover); } .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        
        .now-playing-bar {
          position: fixed;
          bottom: 6rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 3rem);
          max-width: 600px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.25rem;
          border-radius: 20px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--brand-accent);
          gap: 1rem;
          z-index: 190;
          box-shadow: var(--shadow-main);
          animation: slideUp 0.25s ease-out;
        }
        
        .np-left { display: flex; align-items: center; gap: 0.875rem; min-width: 0; }
        .np-pulse-ring { width: 14px; height: 14px; border-radius: 50%; background: var(--brand-accent); flex-shrink: 0; animation: np-pulse 1.4s ease-in-out infinite; }
        @keyframes np-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(var(--brand-accent-rgb, 212,175,55), 0.5); } 50% { box-shadow: 0 0 0 6px rgba(var(--brand-accent-rgb, 212,175,55), 0); } }
        .np-info { display: flex; flex-direction: column; min-width: 0; }
        .np-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        .np-verse { font-size: 0.95rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .np-controls { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .np-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .np-btn:hover:not(:disabled) { color: var(--brand-accent); border-color: var(--brand-accent); background: var(--bg-hover); }
        .np-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .np-stop { color: var(--brand-accent); border-color: var(--brand-accent); width: 40px; height: 40px; }
        .np-stop:hover { background: rgba(var(--brand-accent-rgb, 212,175,55), 0.15) !important; }
        
        .ai-insight-popup { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); width: 450px; max-width: calc(100vw - 2rem); padding: 2rem; border-radius: 24px; z-index: 250; background: var(--bg-card); border: 1px solid var(--brand-accent); box-shadow: var(--shadow-main); animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .ai-insight-popup blockquote { font-style: italic; color: var(--text-secondary); margin-bottom: 2rem; font-size: 1rem; }
        .popup-actions { display: flex; gap: 1rem; }
        .study-btn { flex: 1; padding: 0.875rem; background: var(--brand-solid); color: var(--text-inverse); border: none; border-radius: 100px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .study-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cancel-btn { padding: 0.875rem 1.5rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 100px; color: var(--text-main); font-weight: 600; cursor: pointer; }
        
        .verses-loading { display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem 0; }
        .verse-skeleton { display: flex; gap: 1.5rem; padding: 1.25rem; border-radius: 16px; }
        .skeleton-num { width: 24px; height: 18px; border-radius: 6px; background: var(--border-color); flex-shrink: 0; margin-top: 4px; animation: shimmer 1.4s infinite; }
        .skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-line { height: 16px; border-radius: 6px; background: var(--border-color); animation: shimmer 1.4s infinite; }
        .skeleton-line:last-child { animation-delay: 0.2s; }
        @keyframes shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
        .verses-error { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 5rem 2rem; color: var(--text-muted); text-align: center; }
        .verses-error p { font-size: 1.05rem; margin: 0; }
        
        .picker-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .picker-modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 28px; width: 100%; max-width: 640px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; animation: scaleIn 0.2s ease; box-shadow: 0 24px 60px rgba(0,0,0,0.4); }
        .picker-modal--sm { max-width: 480px; }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .picker-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 1.75rem 1rem; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .picker-header h3 { margin: 0; font-size: 1.25rem; }
        .picker-close { width: 36px; height: 36px; border-radius: 50%; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .picker-close:hover { background: var(--bg-hover); color: var(--text-main); }
        .picker-search { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.75rem; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .picker-search input { flex: 1; background: none; border: none; outline: none; color: var(--text-main); font-size: 1rem; }
        
        .picker-books-scroll { overflow-y: auto; padding: 1rem 1.75rem 1.75rem; flex: 1; }
        @media (max-width: 640px) {
          .picker-books-scroll { padding: 1rem !important; }
        }
        
        .picker-testament { margin-bottom: 1.5rem; }
        .picker-testament-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 700; margin: 0 0 0.75rem; }
        
        .picker-books-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        @media (max-width: 640px) {
          .picker-books-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .picker-book-btn { font-size: 0.8rem !important; padding: 0.5rem 0.75rem !important; }
        }
        .picker-book-btn { padding: 0.625rem 0.875rem; border-radius: 12px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.9rem; font-weight: 500; cursor: pointer; text-align: left; transition: all 0.15s; }
        .picker-book-btn:hover { background: var(--bg-hover); border-color: var(--brand-accent); color: var(--brand-accent); }
        .picker-book-btn.active { background: var(--brand-solid); border-color: var(--brand-solid); color: var(--text-inverse); }
        .picker-chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 0.6rem; padding: 1.25rem 1.75rem 1.75rem; overflow-y: auto; }
        
        .play-chapter-btn { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 0.625rem 1.25rem; border-radius: 100px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .play-chapter-btn:hover { border-color: var(--brand-accent); color: var(--brand-accent); background: var(--bg-hover); }
        .play-chapter-btn.playing { background: rgba(var(--brand-accent-rgb, 212,175,55), 0.12); border-color: var(--brand-accent); color: var(--brand-accent); }
        
        .reading-controls { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1rem; }
        .voice-settings-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .voice-settings-btn:hover { color: var(--brand-accent); border-color: var(--brand-accent); background: var(--bg-hover); }
        
        .voice-empty { padding: 2rem 1.75rem; color: var(--text-muted); font-size: 0.95rem; text-align: center; }
        .voice-list { overflow-y: auto; max-height: 420px; padding: 0.75rem 0.75rem 1rem; }
        .voice-group-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 700; padding: 0.75rem 0.75rem 0.4rem; margin: 0; }
        .voice-item { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; border-radius: 12px; background: none; border: 1px solid transparent; color: var(--text-main); cursor: pointer; text-align: left; transition: all 0.15s; }
        .voice-item:hover { background: var(--bg-hover); border-color: var(--border-color); }
        .voice-item.active { background: rgba(var(--brand-accent-rgb, 212,175,55), 0.08); border-color: rgba(var(--brand-accent-rgb, 212,175,55), 0.3); }
        .voice-item-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .voice-name { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .voice-lang { font-size: 0.75rem; color: var(--text-muted); }
      `}</style>
    </div>
  )
}

export default Bible
