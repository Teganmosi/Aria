import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, BookOpen, ChevronRight, ChevronLeft, MessageSquare,
  ArrowLeft, Bookmark, Volume2, Share2, Sparkles
} from 'lucide-react'
import { bibleService, homeService } from '../services/api'
import { AnimatedBackground } from './LandingPage'

// Bible structure - 66 books
const BIBLE_BOOKS = {
  'Old Testament': [
    { name: 'Genesis', chapters: 50 },
    { name: 'Exodus', chapters: 40 },
    { name: 'Leviticus', chapters: 27 },
    { name: 'Numbers', chapters: 36 },
    { name: 'Deuteronomy', chapters: 34 },
    { name: 'Joshua', chapters: 24 },
    { name: 'Judges', chapters: 21 },
    { name: 'Ruth', chapters: 4 },
    { name: '1 Samuel', chapters: 31 },
    { name: '2 Samuel', chapters: 24 },
    { name: '1 Kings', chapters: 22 },
    { name: '2 Kings', chapters: 25 },
    { name: '1 Chronicles', chapters: 29 },
    { name: '2 Chronicles', chapters: 36 },
    { name: 'Ezra', chapters: 10 },
    { name: 'Nehemiah', chapters: 13 },
    { name: 'Esther', chapters: 10 },
    { name: 'Job', chapters: 42 },
    { name: 'Psalms', chapters: 150 },
    { name: 'Proverbs', chapters: 31 },
    { name: 'Ecclesiastes', chapters: 12 },
    { name: 'Song of Solomon', chapters: 8 },
    { name: 'Isaiah', chapters: 66 },
    { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 },
    { name: 'Ezekiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 },
    { name: 'Hosea', chapters: 14 },
    { name: 'Joel', chapters: 3 },
    { name: 'Amos', chapters: 9 },
    { name: 'Obadiah', chapters: 1 },
    { name: 'Jonah', chapters: 4 },
    { name: 'Micah', chapters: 7 },
    { name: 'Nahum', chapters: 3 },
    { name: 'Habakkuk', chapters: 3 },
    { name: 'Zephaniah', chapters: 3 },
    { name: 'Haggai', chapters: 2 },
    { name: 'Zechariah', chapters: 14 },
    { name: 'Malachi', chapters: 4 }
  ],
  'New Testament': [
    { name: 'Matthew', chapters: 28 },
    { name: 'Mark', chapters: 16 },
    { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 },
    { name: 'Acts', chapters: 28 },
    { name: 'Romans', chapters: 16 },
    { name: '1 Corinthians', chapters: 16 },
    { name: '2 Corinthians', chapters: 13 },
    { name: 'Galatians', chapters: 6 },
    { name: 'Ephesians', chapters: 6 },
    { name: 'Philippians', chapters: 4 },
    { name: 'Colossians', chapters: 4 },
    { name: '1 Thessalonians', chapters: 5 },
    { name: '2 Thessalonians', chapters: 3 },
    { name: '1 Timothy', chapters: 6 },
    { name: '2 Timothy', chapters: 4 },
    { name: 'Titus', chapters: 3 },
    { name: 'Philemon', chapters: 1 },
    { name: 'Hebrews', chapters: 13 },
    { name: 'James', chapters: 5 },
    { name: '1 Peter', chapters: 5 },
    { name: '2 Peter', chapters: 3 },
    { name: '1 John', chapters: 5 },
    { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 },
    { name: 'Jude', chapters: 1 },
    { name: 'Revelation', chapters: 22 }
  ]
}

const BookCard = ({ book, isSelected, onClick }) => (
  <button
    className={`book-card glass-panel ${isSelected ? 'active' : ''}`}
    onClick={onClick}
  >
    <div className="book-card-content">
      <h4 className="font-serif">{book.name}</h4>
      <p>{book.chapters} chapters</p>
    </div>
  </button>
)

const VerseCard = ({ verse }) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech is not supported in your browser.')
      return
    }

    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(verse.text)
    utterance.rate = 0.9
    
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }

  return (
    <div className="verse-card">
      <span className="verse-number">{verse.verse || verse.number}</span>
      <p className="verse-text font-serif">{verse.text}</p>
      <div className="verse-actions">
        <button
          className={`verse-action ${isSaved ? 'saved' : ''}`}
          onClick={() => setIsSaved(!isSaved)}
        >
          <Bookmark size={16} fill={isSaved ? 'var(--brand-accent)' : 'none'} />
        </button>
        <button className="verse-action">
          <Share2 size={16} />
        </button>
        <button 
          className={`verse-action ${isPlaying ? 'saved' : ''}`}
          onClick={handlePlayAudio}
          title={isPlaying ? "Stop playing" : "Listen to verse"}
          style={isPlaying ? { color: 'var(--brand-accent)', borderColor: 'var(--brand-accent)' } : {}}
        >
          <Volume2 size={16} />
        </button>
      </div>
    </div>
  )
}

const Bible = () => {
  const navigate = useNavigate()
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showAISelector, setShowAISelector] = useState(false)
  const [verses, setVerses] = useState([])
  const [view, setView] = useState('books')
  const [readingProgress, setReadingProgress] = useState(0)
  const [verseOfDay, setVerseOfDay] = useState({ verse: '', reference: '' })

  useEffect(() => {
    const fetchVerseOfDay = async () => {
      try {
        const data = await homeService.getHomeData()
        if (data.verse_of_day) {
          setVerseOfDay(data.verse_of_day)
        }
      } catch (error) { }
    }
    fetchVerseOfDay()
  }, [])

  useEffect(() => {
    if (selectedBook) {
      const fetchVerses = async () => {
        try {
          const response = await bibleService.getChapter(selectedBook.name, selectedChapter)
          if (response.verses) {
            setVerses(response.verses)
            setReadingProgress(0)
          }
        } catch (error) {
          setVerses([])
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
    if (text) {
      setSelectedText(text)
      setShowAISelector(true)
    }
  }

  const discussWithAI = () => {
    navigate('/app/bible-study', {
      state: {
        book: selectedBook?.name,
        chapter: selectedChapter,
        selectedText
      }
    })
  }

  const handleBookSelect = (book) => {
    setSelectedBook(book)
    setSelectedChapter(1)
    setView('chapters')
  }

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter)
    setView('reading')
  }

  const goBack = () => {
    if (view === 'reading') {
      setView('chapters')
    } else if (view === 'chapters') {
      setView('books')
      setSelectedBook(null)
    }
  }

  const filteredBooks = Object.entries(BIBLE_BOOKS).reduce((acc, [testament, books]) => {
    const filtered = books.filter(book =>
      book.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[testament] = filtered
    }
    return acc
  }, {})

  return (
    <div className="page-container">
      <AnimatedBackground />

      <div className="page-content">
        <header className="bible-header glass-panel">
          <div className="bible-header-left">
            {view !== 'books' && (
              <button className="back-btn" onClick={goBack}>
                <ArrowLeft size={20} />
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BookOpen size={24} color="var(--brand-accent)" />
                <h1 className="font-serif" style={{ margin: 0, fontSize: '1.75rem' }}>The Sanctuary Library</h1>
              </div>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {selectedBook ? `${selectedBook.name} • Chapter ${selectedChapter}` : "Explore God's Word in quiet reflection"}
              </p>
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

        {/* Main Content Area */}
        <div className="main-bible-layout">
          {/* Books View */}
          {view === 'books' && (
            <div className="books-view">
              {/* Featured Reflection - Verse of the Day */}
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

              {/* Search Bar */}
              <div className="search-container glass-panel">
                <Search size={20} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Books Grid */}
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

          {/* Chapters View */}
          {view === 'chapters' && selectedBook && (
            <div className="chapters-container">
              <div className="chapter-hero glass-panel">
                <div className="hero-icon font-serif">📖</div>
                <div>
                  <h2 className="font-serif" style={{ fontSize: '2.5rem', margin: 0 }}>{selectedBook.name}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{selectedBook.chapters} Chapters to explore</p>
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

          {/* Reading View */}
          {view === 'reading' && selectedBook && (
            <div className="reading-layout">
              <div
                id="verses-container"
                className="verses-scroll glass-panel"
                onMouseUp={handleTextSelection}
              >
                <div className="reading-header">
                  <h2 className="font-serif">Chapter {selectedChapter}</h2>
                  <p>{verses.length} Verses</p>
                </div>

                <div className="verses-content">
                  {verses.map((verse) => (
                    <VerseCard key={verse.verse} verse={verse} />
                  ))}
                </div>
              </div>

              {/* Reading Navigation */}
              <div className="reading-footer-nav glass-panel">
                <button
                  className="nav-btn"
                  disabled={selectedChapter <= 1}
                  onClick={() => setSelectedChapter(prev => prev - 1)}
                >
                  <ChevronLeft size={20} />
                  <span>Previous Chapter</span>
                </button>
                <div className="nav-divider"></div>
                <button
                  className="nav-btn"
                  disabled={selectedChapter >= selectedBook.chapters}
                  onClick={() => setSelectedChapter(prev => prev + 1)}
                >
                  <span>Next Chapter</span>
                  <ChevronRight size={20} />
                </button>
              </div>

              {showAISelector && (
                <div className="ai-insight-popup glass-panel">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Sparkles size={20} color="var(--brand-accent)" />
                    <span className="font-serif" style={{ fontWeight: 600 }}>Spiritual Insight</span>
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
        .page-container {
          min-height: 100vh;
          background: var(--bg-main);
          position: relative;
          color: var(--text-main);
          transition: all 0.4s ease;
        }

        .page-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          position: relative;
          z-index: 10;
        }

        /* Header */
        .bible-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-radius: 24px;
          margin-bottom: 2rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
        }

        .bible-header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .back-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: var(--bg-hover);
          transform: translateX(-3px);
        }

        /* Books View */
        .books-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .verse-of-day {
          padding: 2.5rem;
          border-radius: 32px;
          text-align: center;
          background: var(--gradient-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-main);
        }

        .vod-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .verse-of-day blockquote {
          font-size: 2rem;
          line-height: 1.4;
          margin: 0 0 1.5rem;
          color: var(--text-main);
        }

        .verse-of-day cite {
          font-size: 1.1rem;
          font-style: normal;
          color: var(--brand-accent);
          font-weight: 600;
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.75rem;
          border-radius: 100px;
          max-width: 600px;
          margin: 0 auto;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
        }

        .search-container input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-main);
          font-size: 1.1rem;
        }

        .testament-section {
          margin-bottom: 3rem;
        }

        .testament-title {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          padding-left: 0.5rem;
          color: var(--text-main);
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .book-card {
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-card);
          color: var(--text-main);
        }

        .book-card:hover {
          background: var(--bg-hover);
          border-color: var(--brand-accent);
          transform: translateY(-2px);
        }

        .book-card.active {
          background: var(--brand-solid);
          color: var(--text-inverse);
          border-color: var(--brand-solid);
        }
        
        .book-card h4 { margin: 0; font-size: 1.1rem; }
        .book-card p { margin: 0.25rem 0 0; font-size: 0.85rem; opacity: 0.7; }

        /* Chapters */
        .chapters-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .chapter-hero {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 3rem;
          border-radius: 32px;
          background: var(--gradient-card);
          border: 1px solid var(--border-color);
        }

        .hero-icon { font-size: 4rem; }

        .chapters-grid-container {
          padding: 2.5rem;
          border-radius: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
        }

        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
          gap: 0.75rem;
        }

        .chapter-btn {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 16px;
          cursor: pointer;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          transition: all 0.2s;
        }

        .chapter-btn:hover {
          background: var(--bg-hover);
          border-color: var(--brand-accent);
        }

        .chapter-btn.active {
          background: var(--brand-solid);
          color: var(--text-inverse);
          border-color: var(--brand-solid);
        }

        /* Reading View */
        .reading-layout {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .verses-scroll {
          padding: 3rem;
          border-radius: 32px;
          min-height: 60vh;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
        }

        .reading-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .reading-header h2 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .reading-header p { color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem; }

        .verse-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem;
          border-radius: 16px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .verse-card:hover {
          background: var(--bg-hover);
          border-color: var(--border-subtle);
        }

        .verse-number {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--brand-accent);
          min-width: 24px;
          padding-top: 0.25rem;
        }

        .verse-text {
          font-size: 1.2rem;
          line-height: 1.7;
          flex: 1;
          color: var(--text-main);
        }

        .verse-actions {
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .verse-card:hover .verse-actions { opacity: 1; }

        .verse-action {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .verse-action:hover { 
          color: var(--brand-accent); 
          background: var(--bg-card);
          border-color: var(--brand-accent);
        }

        .reading-footer-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-radius: 100px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
        }

        .nav-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 100px;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) { background: var(--bg-hover); }
        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .nav-divider { width: 1px; height: 30px; background: var(--border-color); }

        .ai-insight-popup {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 450px;
          padding: 2rem;
          border-radius: 24px;
          z-index: 100;
          background: var(--bg-card);
          border: 1px solid var(--brand-accent);
          box-shadow: var(--shadow-main);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        .ai-insight-popup blockquote {
          font-style: italic;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .popup-actions { display: flex; gap: 1rem; }

        .study-btn {
          flex: 1;
          padding: 0.875rem;
          background: var(--brand-solid);
          color: var(--text-inverse);
          border: none;
          border-radius: 100px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .study-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .cancel-btn {
          padding: 0.875rem 1.5rem;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: 100px;
          color: var(--text-main);
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default Bible
