import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, BookOpen, ChevronRight, ChevronLeft, MessageSquare, 
  ArrowLeft, Bookmark, Volume2, Share2
} from 'lucide-react'
import { bibleService, homeService } from '../services/api'

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
    className={`book-card ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
  >
    <div className="book-card-content">
      <h4>{book.name}</h4>
      <p>{book.chapters} chapters</p>
    </div>
  </button>
)

const VerseCard = ({ verse }) => {
  const [isSaved, setIsSaved] = useState(false)
  
  return (
    <div className="verse-card">
      <span className="verse-number">{verse.verse}</span>
      <p className="verse-text">{verse.text}</p>
      <div className="verse-actions">
        <button 
          className={`verse-action ${isSaved ? 'saved' : ''}`}
          onClick={() => setIsSaved(!isSaved)}
        >
          <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <button className="verse-action">
          <Share2 size={14} />
        </button>
        <button className="verse-action">
          <Volume2 size={14} />
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
      } catch (error) {
        console.error('Error fetching verse of the day:', error)
      }
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
          console.error('Error fetching verses:', error)
          setVerses([])
        }
      }
      fetchVerses()
    }
  }, [selectedBook, selectedChapter])

  // Track reading progress
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
        <header className="bible-header">
          <div className="bible-header-left">
            {view !== 'books' && (
              <button className="back-btn" onClick={goBack}>
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1><BookOpen size={22} /> Scripture</h1>
              {selectedBook ? (
                <p>{selectedBook.name} {selectedChapter > 0 && `• Chapter ${selectedChapter}`}</p>
              ) : (
                <p>Explore God's Word</p>
              )}
            </div>
          </div>
          
          {view === 'reading' && (
            <div className="reading-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${readingProgress}%` }} />
              </div>
              <span>{Math.round(readingProgress)}% read</span>
            </div>
          )}
        </header>

        {/* Search Bar */}
        {view === 'books' && (
          <div className="search-container">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search books of the Bible..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bible-content">
          {/* Books View */}
          {view === 'books' && (
            <div className="books-view">
              {/* Verse of the Day */}
              <div className="verse-of-day">
                <div className="vod-header">
                  <span>✨ Verse of the Day</span>
                </div>
                <blockquote>
                  "{verseOfDay.verse || 'Loading verse...'}"
                </blockquote>
                <cite>— {verseOfDay.reference || '...'}</cite>
              </div>

              {/* Books Grid */}
              <div className="testaments-container">
                {Object.entries(filteredBooks).map(([testament, books]) => (
                  <div key={testament} className="testament-section">
                    <h3 className="testament-title">{testament}</h3>
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
            <div className="chapters-view">
              <div className="selected-book-display">
                <div className="book-preview">
                  <span className="preview-icon">📖</span>
                </div>
                <div className="book-preview-info">
                  <h2>{selectedBook.name}</h2>
                  <p>{selectedBook.chapters} chapters</p>
                </div>
              </div>
              
              <div className="chapters-section">
                <h3>Select a Chapter</h3>
                <div className="chapter-grid">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`chapter-btn ${selectedChapter === i + 1 ? 'active' : ''}`}
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
            <div className="reading-view">
              <div 
                id="verses-container"
                className="verses-container"
                onMouseUp={handleTextSelection}
              >
                <div className="chapter-header">
                  <h2>Chapter {selectedChapter}</h2>
                  <span>{verses.length} verses</span>
                </div>
                
                {verses.map((verse) => (
                  <VerseCard 
                    key={verse.verse}
                    verse={verse}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="reading-nav">
                <button 
                  className="nav-chapter-btn"
                  disabled={selectedChapter <= 1}
                  onClick={() => setSelectedChapter(prev => prev - 1)}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <button 
                  className="nav-chapter-btn"
                  disabled={selectedChapter >= selectedBook.chapters}
                  onClick={() => setSelectedChapter(prev => prev + 1)}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>

              {showAISelector && (
                <div className="ai-discuss-popup">
                  <p>Discuss this verse with AI:</p>
                  <blockquote>"{selectedText.substring(0, 80)}..."</blockquote>
                  <div className="popup-actions">
                    <button className="btn btn-primary" onClick={discussWithAI}>
                      <MessageSquare size={16} />
                      Study with AI
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowAISelector(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .page-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease-out;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        /* Header */
        .bible-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .bible-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bible-header-left h1 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .bible-header-left h1 svg {
          color: #c9a227;
        }

        .bible-header-left p {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin: 0;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(201, 162, 39, 0.2);
        }

        /* Reading Progress */
        .reading-progress {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-bar {
          width: 100px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a227, #f4d03f);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .reading-progress span {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        /* Search */
        .search-container {
          margin-bottom: 1.5rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0.75rem 1.25rem;
          max-width: 500px;
        }

        .search-box svg {
          color: var(--text-muted);
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 1rem;
        }

        .search-box input::placeholder {
          color: var(--text-muted);
        }

        /* Books View */
        .books-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Verse of the Day */
        .verse-of-day {
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .vod-header {
          color: #c9a227;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .verse-of-day blockquote {
          color: var(--text);
          font-size: 1.1rem;
          font-style: italic;
          line-height: 1.7;
          margin: 0 0 0.75rem;
        }

        .verse-of-day cite {
          color: #c9a227;
          font-style: normal;
          font-weight: 500;
          font-size: 0.9rem;
        }

        /* Testaments */
        .testament-section {
          margin-bottom: 1.5rem;
        }

        .testament-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        /* Book Card */
        .book-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .book-card:hover {
          border-color: rgba(201, 162, 39, 0.5);
          background: rgba(201, 162, 39, 0.05);
        }

        .book-card.selected {
          border-color: #c9a227;
        }

        .book-card h4 {
          color: var(--text);
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
        }

        .book-card p {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin: 0;
        }

        /* Chapters View */
        .chapters-view {
          max-width: 600px;
          margin: 0 auto;
        }

        .selected-book-display {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          background: var(--bg-card);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .book-preview {
          width: 70px;
          height: 90px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-icon {
          font-size: 2rem;
        }

        .book-preview-info h2 {
          color: var(--text);
          font-size: 1.5rem;
          margin: 0 0 0.25rem;
        }

        .book-preview-info p {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.9rem;
        }

        .chapters-section h3 {
          color: var(--text);
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        /* Chapter Grid */
        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
          gap: 0.5rem;
        }

        .chapter-btn {
          aspect-ratio: 1;
          border-radius: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chapter-btn:hover {
          background: rgba(201, 162, 39, 0.2);
          border-color: #c9a227;
        }

        .chapter-btn.active {
          background: linear-gradient(135deg, #c9a227, #d97706);
          border-color: #c9a227;
        }

        /* Reading View */
        .reading-view {
          max-width: 800px;
          margin: 0 auto;
        }

        .verses-container {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 1.5rem;
          max-height: 65vh;
          overflow-y: auto;
          margin-bottom: 1rem;
        }

        .chapter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .chapter-header h2 {
          color: var(--text);
          font-size: 1.25rem;
          margin: 0;
        }

        .chapter-header span {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Verse Card */
        .verse-card {
          display: flex;
          gap: 0.75rem;
          padding: 0.875rem;
          margin-bottom: 0.25rem;
          border-radius: 10px;
          transition: background 0.2s;
        }

        .verse-card:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .verse-number {
          color: #c9a227;
          font-weight: 600;
          font-size: 0.8rem;
          min-width: 22px;
        }

        .verse-text {
          color: #e4e4e7;
          line-height: 1.7;
          margin: 0;
          flex: 1;
          font-size: 0.95rem;
        }

        .verse-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .verse-card:hover .verse-actions {
          opacity: 1;
        }

        .verse-action {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .verse-action:hover {
          background: rgba(201, 162, 39, 0.2);
          color: #c9a227;
        }

        .verse-action.saved {
          color: #c9a227;
        }

        /* Reading Nav */
        .reading-nav {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .nav-chapter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-chapter-btn:hover:not(:disabled) {
          background: rgba(201, 162, 39, 0.2);
          border-color: #c9a227;
        }

        .nav-chapter-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* AI Popup */
        .ai-discuss-popup {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 14px;
          padding: 1.25rem;
          max-width: 380px;
          z-index: 100;
        }

        .ai-discuss-popup p {
          color: var(--text);
          margin: 0 0 0.5rem;
          font-weight: 500;
        }

        .ai-discuss-popup blockquote {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: 0 0 1rem;
          font-style: italic;
        }

        .popup-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #c9a227, #d97706);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #d4a92c, #c9a227);
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bible-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .books-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .selected-book-display {
            flex-direction: column;
            text-align: center;
          }

          .chapter-grid {
            grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
          }
        }
      `}</style>
    </div>
  )
}

export default Bible
