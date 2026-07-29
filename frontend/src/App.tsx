import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/auth-store'
import { ErrorBoundary } from './components/ErrorBoundary'

// Public Pages - Eager loaded for fast initial render
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsOfService } from './pages/TermsOfService'

// Protected App Layout - Eager loaded
import { AppLayout } from './components/AppLayout'

// Lazy loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Teaser = lazy(() => import('./pages/Teaser'))
const Home = lazy(() => import('./pages/Home'))
const AIChat = lazy(() => import('./pages/AIChat'))
const Bible = lazy(() => import('./pages/Bible'))
const BibleStudy = lazy(() => import('./pages/BibleStudy'))
const EmotionalSupport = lazy(() => import('./pages/EmotionalSupport'))
const Devotion = lazy(() => import('./pages/Devotion'))
const Profile = lazy(() => import('./pages/Profile'))
const Notes = lazy(() => import('./pages/Notes'))
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'))

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-[var(--bg-main)] flex flex-col items-center justify-center gap-10 z-50">
    {/* Wordmark */}
    <div className="flex flex-col items-center gap-3">
      <span
        className="font-serif"
        style={{
          fontStyle: 'italic',
          fontSize: '3.5rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        Aria
      </span>
      <span
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}
      >
        Your Sanctuary
      </span>
    </div>

    {/* Pill progress bar */}
    <div
      className="relative overflow-hidden rounded-full"
      style={{ width: '120px', height: '3px', background: 'var(--border-color)' }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: '40%',
          background: 'var(--brand-accent)',
          animation: 'aria-slide 1.4s cubic-bezier(0.4,0,0.6,1) infinite',
        }}
      />
    </div>

    <style>{`
      @keyframes aria-slide {
        0%   { transform: translateX(-100%); }
        50%  { transform: translateX(250%); }
        100% { transform: translateX(250%); }
      }
    `}</style>
  </div>
)

const LazyLoad = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
)

const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
)

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/app/home" replace />
  return <>{children}</>
}

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[var(--bg-main)] px-6 text-center">
    <span
      className="font-serif"
      style={{ fontStyle: 'italic', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}
    >
      Page not found
    </span>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: 1.65, margin: 0 }}>
      The page you're looking for doesn't exist or has moved. Let's get you back to still waters.
    </p>
    <Link
      to="/"
      style={{
        padding: '0.8rem 2.25rem',
        borderRadius: '3rem',
        background: 'var(--brand-solid)',
        color: 'var(--bg-main)',
        fontWeight: 600,
        fontSize: '0.9rem',
        textDecoration: 'none',
      }}
    >
      Return Home
    </Link>
  </div>
)

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      {/* Toaster lives outside the boundary so error-triggered toasts survive a catch */}
      <Toaster position="top-right" richColors closeButton />
      <ErrorBoundary showReset>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><LazyLoad><PageTransition><LandingPage /></PageTransition></LazyLoad></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><PageTransition><Login /></PageTransition></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><PageTransition><Register /></PageTransition></PublicRoute>} />
            {/* Password recovery — deliberately NOT wrapped in PublicRoute: signed-in
                users must also be able to open reset links */}
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
            <Route path="/teaser" element={<LazyLoad><Teaser /></LazyLoad>} />

          {/* Protected App Routes */}
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<LazyLoad><Home /></LazyLoad>} />
            <Route path="ai-chat" element={<LazyLoad><AIChat /></LazyLoad>} />
            <Route path="bible" element={<LazyLoad><Bible /></LazyLoad>} />
            <Route path="bible-study" element={<LazyLoad><BibleStudy /></LazyLoad>} />
            <Route path="emotional-support" element={<LazyLoad><EmotionalSupport /></LazyLoad>} />
            <Route path="devotion" element={<LazyLoad><Devotion /></LazyLoad>} />
            <Route path="notes" element={<LazyLoad><Notes /></LazyLoad>} />
            <Route path="activity" element={<LazyLoad><ActivityHistory /></LazyLoad>} />
            <Route path="profile" element={<LazyLoad><Profile /></LazyLoad>} />
          </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </ErrorBoundary>
    </>
  )
}

export default App
