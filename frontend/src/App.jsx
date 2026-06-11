import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary'

// Public Pages - Eager loaded for fast initial render
import Login from './pages/Login'
import Register from './pages/Register'

// Protected App Layout - Eager loaded
import AppLayout from './components/AppLayout'

// Lazy loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Home = lazy(() => import('./pages/Home'))
const AIChat = lazy(() => import('./pages/AIChat'))
const Bible = lazy(() => import('./pages/Bible'))
const BibleStudy = lazy(() => import('./pages/BibleStudy'))
const EmotionalSupport = lazy(() => import('./pages/EmotionalSupport'))
const Devotion = lazy(() => import('./pages/Devotion'))
const Profile = lazy(() => import('./pages/Profile'))
const Notes = lazy(() => import('./pages/Notes'))
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'))

// Loading Component with skeleton
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner large"></div>
    <p>Loading Aria...</p>
  </div>
)

// Suspense wrapper for lazy components
const LazyLoad = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
)

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Public Route Component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/app/home" replace />
  return children
}

function App() {
  return (
    <ErrorBoundary showReset>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LazyLoad><LandingPage /></LazyLoad></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
