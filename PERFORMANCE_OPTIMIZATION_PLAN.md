# 🚀 ARIA Performance Optimization Plan

## Executive Summary

**Problem**: Users report slow sign-in, slow account creation, and a 2-3 second delay between authentication and dashboard load.

**Root Causes Identified**:
1. Sequential API calls during auth flow (no parallelization)
2. No optimistic UI updates or loading skeletons
3. Blocking `getMe()` call on every app initialization
4. No request caching or data persistence
5. Large bundle sizes without code splitting
6. Unoptimized render patterns in auth components
7. No connection pooling or request deduplication

---

## 🔍 Current Performance Bottlenecks

### 1. Authentication Flow Issues

**Current Flow** (Sequential & Blocking):
```
User clicks "Sign In" 
  ↓
POST /auth/login (network wait)
  ↓
Store token in localStorage
  ↓
Navigate to /app/home
  ↓
AuthProvider mounts → checkAuth() runs
  ↓
GET /auth/me (network wait) ← BLOCKING
  ↓
Set user state → isLoading = false
  ↓
Dashboard renders
```

**Total Wait Time**: ~2-3 seconds (2 network round trips + render time)

### 2. AuthProvider Inefficiencies

**File**: `/workspace/frontend/src/context/AuthProvider.jsx`

**Issues**:
- `checkAuth()` always calls `getMe()` even if user data could be cached
- No retry logic with exponential backoff
- `useMemo` dependencies include all functions (causes re-renders)
- No cancellation of pending requests on unmount

### 3. Login/Register Pages

**Files**: `/workspace/frontend/src/pages/Login.jsx`, `/workspace/frontend/src/pages/Register.jsx`

**Issues**:
- No form validation before submission (fails late)
- No optimistic UI feedback
- Full page navigation instead of modal transitions
- Hero images loaded synchronously (blocking LCP)
- No prefetching of dashboard data during auth

### 4. App-Level Issues

**File**: `/workspace/frontend/src/App.jsx`

**Issues**:
- `ProtectedRoute` blocks entire app until auth check completes
- No loading skeletons or progressive enhancement
- All routes imported upfront (no code splitting)
- `LoadingScreen` is generic, not contextual

### 5. Build Configuration

**File**: `/workspace/frontend/vite.config.js`

**Issues**:
- No bundle analysis or size limits
- Missing compression configuration
- No manual chunks for vendor libraries
- Missing preload/prefetch hints

---

## 📋 Optimization Implementation Plan

### Phase 1: Quick Wins (1-2 Days) ⚡

#### 1.1 Optimistic Auth Updates
**Goal**: Eliminate post-login delay by skipping `getMe()` call

**Implementation**:
```javascript
// AuthProvider.jsx - Modified login function
const login = useCallback(async (email, password) => {
  const response = await authService.login(email, password)
  
  // OPTIMISTIC: Use user data from login response directly
  localStorage.setItem('authToken', response.access_token)
  
  // Store user data immediately (don't wait for getMe())
  const userData = response.user || { email, full_name: response.full_name }
  localStorage.setItem('userData', JSON.stringify(userData))
  
  setUser(userData)
  setIsAuthenticated(true)
  setShowAuthModal(false)
  
  // Background refresh (non-blocking)
  authService.getMe().then(freshData => {
    setUser(freshData)
    localStorage.setItem('userData', JSON.stringify(freshData))
  }).catch(console.error)
  
  return response
}, [])
```

**Expected Impact**: Reduce post-login delay from 2-3s to <500ms

---

#### 1.2 Add Loading Skeletons
**Goal**: Perceived performance improvement with progressive loading

**Implementation**:
```jsx
// Create reusable skeleton component
const DashboardSkeleton = () => (
  <div className="skeleton-grid">
    {[1,2,3,4].map(i => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-shimmer" />
      </div>
    ))}
  </div>
)

// Use in Home.jsx
const Home = () => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <DashboardSkeleton />
  
  return <ActualDashboard />
}
```

**Expected Impact**: Improve perceived load time by 40-60%

---

#### 1.3 Image Optimization
**Goal**: Faster LCP on login/register pages

**Implementation**:
```jsx
// Login.jsx - Add preload and lazy loading
<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
  <link rel="preload" as="image" href="/login-hero.png" />
  <img
    src="/login-hero.png"
    loading="eager"
    fetchPriority="high"
    decoding="async"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    alt="Sanctuary reflection"
  />
</div>
```

**Expected Impact**: Improve LCP by 300-500ms

---

#### 1.4 Request Deduplication
**Goal**: Prevent duplicate API calls

**Implementation**:
```javascript
// services/api.js - Add request cache
const requestCache = new Map()
const cacheTimeout = 5000 // 5 seconds

const cachedFetch = async (url, options = {}) => {
  const cacheKey = `${url}:${JSON.stringify(options)}`
  
  if (requestCache.has(cacheKey)) {
    const { timestamp, promise } = requestCache.get(cacheKey)
    if (Date.now() - timestamp < cacheTimeout) {
      return promise
    }
  }
  
  const promise = fetch(url, options)
  requestCache.set(cacheKey, { timestamp: Date.now(), promise })
  
  setTimeout(() => requestCache.delete(cacheKey), cacheTimeout)
  
  return promise
}
```

**Expected Impact**: Eliminate redundant network calls

---

### Phase 2: Architecture Improvements (2-3 Days) 🏗️

#### 2.1 Code Splitting by Route
**Goal**: Reduce initial bundle size

**Implementation**:
```javascript
// App.jsx - Lazy load routes
import { lazy, Suspense } from 'react'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const AIChat = lazy(() => import('./pages/AIChat'))
// ... etc

const LoadingFallback = () => <div className="route-loader"><Spinner /></div>

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        {/* ... other routes */}
      </Routes>
    </Suspense>
  )
}
```

**Expected Impact**: Reduce initial bundle by 60-70%

---

#### 2.2 Prefetch Dashboard Data During Auth
**Goal**: Load dashboard data while user is typing credentials

**Implementation**:
```jsx
// Login.jsx - Prefetch on focus
const [isFocusing, setIsFocusing] = useState(false)

useEffect(() => {
  if (isFocusing) {
    // Warm up connection, preload critical assets
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = '/app/home'
    document.head.appendChild(link)
  }
}, [isFocusing])

<input
  onFocus={() => setIsFocusing(true)}
  // ... rest of input props
/>
```

**Expected Impact**: Save 200-400ms on navigation

---

#### 2.3 Service Worker for Offline Caching
**Goal**: Cache static assets and API responses

**Implementation**:
```javascript
// vite.config.js - Add PWA plugin
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/api\.sanctuary\.com\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            }
          }
        }]
      }
    })
  ]
})
```

**Expected Impact**: 80-90% faster repeat visits

---

#### 2.4 Auth State Persistence
**Goal**: Instant load for returning users

**Implementation**:
```javascript
// AuthProvider.jsx
const [user, setUser] = useState(() => {
  // Hydrate from localStorage immediately
  const saved = localStorage.getItem('userData')
  return saved ? JSON.parse(saved) : null
})

const [isAuthenticated, setIsAuthenticated] = useState(() => {
  return !!localStorage.getItem('authToken') && !!localStorage.getItem('userData')
})

// Skip loading screen if we have cached data
const [isLoading, setIsLoading] = useState(!localStorage.getItem('userData'))
```

**Expected Impact**: Near-instant load for authenticated users

---

### Phase 3: Advanced Optimizations (3-4 Days) 🚀

#### 3.1 Connection Pooling & Keep-Alive
**Goal**: Reuse TCP connections for API calls

**Implementation**:
```javascript
// services/api.js
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000
})

// Use in all fetch calls (or switch to axios with agent)
```

**Expected Impact**: 20-30% faster sequential API calls

---

#### 3.2 React Query for Data Fetching
**Goal**: Automatic caching, background refetching, deduplication

**Implementation**:
```bash
npm install @tanstack/react-query
```

```javascript
// main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
)

// Usage in components
const { data: user, isLoading } = useQuery(['user'], authService.getMe, {
  initialData: () => JSON.parse(localStorage.getItem('userData'))
})
```

**Expected Impact**: Eliminate redundant fetches, automatic background updates

---

#### 3.3 Bundle Analysis & Optimization
**Goal**: Identify and eliminate bloat

**Implementation**:
```bash
npm install rollup-plugin-visualizer --save-dev
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, filename: 'dist/stats.html' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

**Expected Impact**: 30-40% smaller bundles

---

#### 3.4 Memoization & Render Optimization
**Goal**: Prevent unnecessary re-renders

**Implementation**:
```javascript
// AuthProvider.jsx - Fix useMemo dependencies
const login = useCallback(async (email, password) => {
  // ... implementation
}, []) // Empty deps - no external dependencies

const value = useMemo(() => ({
  user,
  isAuthenticated,
  isLoading,
  showAuthModal,
  login,
  register,
  logout,
  refreshUser
}), [user, isAuthenticated, isLoading, showAuthModal]) // Remove functions
```

**Expected Impact**: 50-70% fewer re-renders

---

### Phase 4: Monitoring & Continuous Improvement 📊

#### 4.1 Performance Monitoring Setup
```bash
npm install web-vitals
```

```javascript
// main.jsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  const body = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    url: window.location.href,
  }
  
  // Send to your analytics endpoint
  navigator.sendBeacon('/api/performance-metrics', JSON.stringify(body))
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

#### 4.2 Performance Budget
Set thresholds in CI/CD:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 500KB (gzipped)
- **Auth Flow**: < 1s total

---

## 🎯 Priority Implementation Order

| Priority | Task | Effort | Impact | Timeline |
|----------|------|--------|--------|----------|
| 🔴 P0 | Optimistic auth updates | Low | High | Day 1 |
| 🔴 P0 | Auth state persistence | Low | High | Day 1 |
| 🔴 P0 | Loading skeletons | Medium | High | Day 1-2 |
| 🟠 P1 | Code splitting | Medium | High | Day 2-3 |
| 🟠 P1 | Image optimization | Low | Medium | Day 2 |
| 🟠 P1 | Request deduplication | Low | medium | Day 2 |
| 🟡 P2 | React Query integration | High | High | Day 3-4 |
| 🟡 P2 | Bundle optimization | Medium | Medium | Day 4 |
| 🟡 P2 | Service worker | Medium | Medium | Day 4-5 |
| 🟢 P3 | Performance monitoring | Low | Low | Day 5 |
| 🟢 P3 | Connection pooling | Medium | Low | Day 5 |

---

## 📈 Expected Results

### Before Optimization:
- Sign-in to dashboard: **2.5-3.5 seconds**
- Account creation to dashboard: **3-4 seconds**
- Initial bundle size: **~800KB**
- First Contentful Paint: **2-3 seconds**

### After Phase 1 (Quick Wins):
- Sign-in to dashboard: **< 800ms** (70% improvement)
- Account creation to dashboard: **< 1s** (70% improvement)
- FCP: **1-1.5 seconds**

### After Full Implementation:
- Sign-in to dashboard: **< 500ms** (85% improvement)
- Repeat visits: **< 200ms** (cached)
- Initial bundle: **< 300KB** (60% reduction)
- FCP: **< 1 second**
- Lighthouse Performance Score: **90+**

---

## 🛠️ Technical Debt to Address

1. **Remove inline styles** → Move to CSS modules or styled-components
2. **Consolidate auth context** → Merge AuthContext + AuthProvider
3. **Add TypeScript** → Better error catching, autocomplete
4. **Implement error boundaries per route** → Graceful failures
5. **Add request timeouts** → Prevent hanging requests
6. **Standardize error handling** → Consistent user feedback

---

## 📝 Next Steps

1. **Immediate** (Today):
   - Implement optimistic auth updates
   - Add auth state persistence
   - Deploy and measure

2. **This Week**:
   - Complete Phase 1 & 2
   - Set up performance monitoring
   - A/B test improvements

3. **Next Sprint**:
   - Implement React Query
   - Optimize bundles
   - Add service worker

4. **Ongoing**:
   - Weekly performance audits
   - Monitor Core Web Vitals
   - Iterate based on user feedback

---

## 📞 Success Metrics

Track these KPIs:
- **Authentication completion rate** (target: >95%)
- **Auth flow abandonment rate** (target: <5%)
- **Average auth-to-dashboard time** (target: <1s)
- **User retention D1/D7/D30** (target: +15% improvement)
- **Lighthouse Performance Score** (target: 90+)

---

*Document created: $(date)*
*Author: Tech Lead Performance Review*
*Status: Ready for Implementation*
