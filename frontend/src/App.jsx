import { Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary'

// Public Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'

// Protected App Pages
import AppLayout from './components/AppLayout'
import Home from './pages/Home'
import AIChat from './pages/AIChat'
import Bible from './pages/Bible'
import BibleStudy from './pages/BibleStudy'
import EmotionalSupport from './pages/EmotionalSupport'
import Devotion from './pages/Devotion'
import Profile from './pages/Profile'
import Notes from './pages/Notes'

// Loading Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner large"></div>
    <p>Loading Aria...</p>
  </div>
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
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected App Routes */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="ai-chat" element={<AIChat />} />
        <Route path="bible" element={<Bible />} />
        <Route path="bible-study" element={<BibleStudy />} />
        <Route path="emotional-support" element={<EmotionalSupport />} />
        <Route path="devotion" element={<Devotion />} />
        <Route path="notes" element={<Notes />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  )
}

export default App
