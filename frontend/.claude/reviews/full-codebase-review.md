# Codebase Audit — Aria Frontend

**Reviewed**: 2026-06-11  
**Reviewer**: Senior Software Engineer (Claude)  
**Decision**: REQUEST CHANGES — several CRITICAL and HIGH issues must be resolved before this ships.

---

## Summary

The application is a faith-companion SPA built with React + Vite. The core architecture (lazy routing, error boundary, AuthProvider/Context split, WebSocket hook) is structurally sound. However, the codebase has critical security vulnerabilities around token storage and transmission, zero compliance with the project's own non-negotiable tooling standards (Axios, React Query, React Hook Form + Zod, TypeScript, named exports), and a test suite that only confirms modules can be imported rather than testing real behavior.

---

## Findings

---

### CRITICAL

#### C1 — Auth token exposed in WebSocket URL query string
**File**: `src/services/api.js:337`  
```js
return `${wsProtocol}//${wsHost}/ws/voice-call/${callId}?token=${token}`
```
Tokens in URL query strings are stored in server access logs, browser history, and the `Referrer` header when following external links. Anyone with access to server logs gets every active token.  
**Fix**: Send the token in the first WebSocket message after the connection opens (`{"type": "auth", "token": "..."}`) or use a short-lived ticket system (exchange token for a one-time ticket via HTTP, pass the ticket in the URL).

---

#### C2 — Auth token stored in `localStorage`
**Files**: `src/services/api.js:4`, `src/context/AuthProvider.jsx:60,113,139`  
`localStorage` is accessible to any JavaScript running on the page, including injected XSS scripts. The React security rules for this project explicitly prohibit this.  
**Fix**: Store the token in an `HttpOnly; Secure; SameSite=Strict` cookie. The server sets it; the client never reads it. The `axiosPrivate` interceptor pattern then simply sends the cookie automatically — no manual attachment needed.

---

#### C3 — User profile data cached in `localStorage`
**File**: `src/context/AuthProvider.jsx:26-30, 47-51`  
Full user objects (name, email, profile fields) are serialised to `localStorage` as `userCache` and `dashboardData`. Combined with C2 (XSS vector), this allows an attacker to exfiltrate PII.  
**Fix**: If client-side caching is needed, use React Query's in-memory cache. Never write user data to `localStorage`.

---

#### C4 — `.env` file not excluded from git
**File**: `.gitignore`  
The `.gitignore` only excludes `*.local`, which covers `.env.local` but NOT `.env`. A developer who creates a `.env` file with real credentials will accidentally commit it.  
**Fix**: Add `.env` and `.env.*` (except `.env.example`) to `.gitignore`.

---

### HIGH

#### H1 — `fetch` used everywhere instead of Axios
**File**: `src/services/api.js` (entire file)  
The project's CLAUDE.md explicitly states "Always use Axios — never use `fetch` directly" and mandates two Axios instances (`axiosBase`, `axiosPrivate`) with interceptors. The entire service layer uses native `fetch`.  
**Fix**: Rewrite `src/services/api.js` with `axiosBase` for unauthenticated calls and `axiosPrivate` with a request interceptor that attaches the auth token and a response interceptor that handles 401 → refresh → retry.

---

#### H2 — Forms use `useState` instead of React Hook Form + Zod
**Files**: `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/components/AuthModal.jsx`  
The project's CLAUDE.md states this is non-negotiable. No Zod schema exists for any form. There is no field-level validation beyond the browser's `required` attribute — no email format enforcement at the app level, no password minimum length UX feedback.  
**Fix**: Define Zod schemas in `src/schemas/auth.js`, wire through `useForm({ resolver: zodResolver(schema) })`, and display `formState.errors` per field.

---

#### H3 — `isAuthenticated` not reset on background auth refresh failure
**File**: `src/context/AuthProvider.jsx:75-86`  
When the cached user path is taken, `setIsAuthenticated(true)` is called immediately. If the background `getMe()` call then fails (expired token), the code calls `setShowAuthModal(true)` but never calls `setIsAuthenticated(false)`. The user remains in an authenticated-but-broken state: protected routes still render, but all API calls will 401.  
**Fix**: Add `setIsAuthenticated(false)` and `setUser(null)` to the background refresh failure handler.

---

#### H4 — `isMuted` stale closure in `ScriptProcessorNode`
**File**: `src/components/VoiceCall.jsx:145`  
```js
processorRef.current.onaudioprocess = (e) => {
    if (!isMuted) { ... }   // captures isMuted at setup time
```
`setupAudioProcessor()` is called once when the WebSocket opens. The `isMuted` value it closes over is the value from that render — toggling mute afterward has no effect because the processor callback never re-reads the current state.  
**Fix**: Store mute state in a `useRef` (`isMutedRef.current = isMuted`) and keep it synced via `useEffect`. Read `isMutedRef.current` inside the audio callback.

---

#### H5 — `useEffect` in VoiceCall missing `startCall`/`endCall` deps
**File**: `src/components/VoiceCall.jsx:60-67`  
```js
useEffect(() => {
    if (isOpen) { startCall() }   // startCall not in deps
    else { endCall() }
    return () => endCall()
}, [isOpen])
```
`startCall` and `endCall` are defined inside the component but absent from the dependency array. With React Strict Mode (enabled in `main.jsx`), the effect runs twice on mount; stale refs could produce double WebSocket connections.  
**Fix**: Wrap `startCall` and `endCall` in `useCallback` and include them in the effect's dependency array, or move them inside the effect.

---

#### H6 — `Home.jsx` makes a redundant `authService.getMe()` call
**File**: `src/pages/Home.jsx:139`  
```js
const userData = await authService.getMe()
```
`AuthProvider` already fetches and caches the current user. `Home.jsx` ignores the value from `useAuth()` and instead makes a fresh network request on every mount.  
**Fix**: Call `const { user } = useAuth()` and remove the direct `authService.getMe()` call.

---

#### H7 — `AppLayout` mobile menu never closes on route change
**File**: `src/components/AppLayout.jsx:20-22`  
```js
useEffect(() => {
    setMobileMenuOpen(false)
}, [])   // empty deps — runs once only
```
The comment says "Close mobile menu when route changes" but the empty dependency array means this fires once on mount. Navigating between routes leaves the drawer open.  
**Fix**: Import `useLocation` from `react-router-dom` and use `location.pathname` as the dependency.

---

#### H8 — `window.innerWidth` read synchronously during render
**Files**: `src/pages/Login.jsx:16`, `src/pages/Register.jsx:19`, `src/pages/Home.jsx:115`  
```js
const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024)
```
Accessing `window` directly in a `useState` initializer breaks in SSR and test environments. It also fires during React Strict Mode's double-invoke pass.  
**Fix**: Use a lazy initialiser: `useState(() => window.innerWidth <= 1024)`, or replace with a `useMediaQuery` hook backed by `window.matchMedia`.

---

#### H9 — `dashboardService.getDashboardData` silently swallows errors
**File**: `src/services/api.js:386-396`  
```js
} catch (e) {
    console.warn('...')
    return null
}
```
Callers receive `null` and never know whether data is missing or an error occurred. CLAUDE.md explicitly forbids silent error swallowing.  
**Fix**: Remove the inner `try/catch` and let errors propagate.

---

### MEDIUM

#### M1 — No TypeScript
The entire codebase is `.jsx`/`.js`. CLAUDE.md states "Use TypeScript by default." No `tsconfig.json` exists. Bugs that TypeScript would catch at compile time will only surface at runtime.

---

#### M2 — All components use `export default` instead of named exports
CLAUDE.md: "Always use named exports — never `export default` for components, hooks, utils, or stores." Every component, page, hook, and service is a default export. This makes "find all references" unreliable and refactoring harder.

---

#### M3 — No React Query — all data fetching via raw `useEffect` + `useState`
CLAUDE.md: non-negotiable. All page components fetch data manually with `useEffect`. This means no caching, no deduplication, no background revalidation, no built-in loading/error states, and no retry logic.

---

#### M4 — Inline styles dominate the entire UI
CLAUDE.md: "Use Tailwind CSS for styling — avoid inline styles or vanilla CSS files." `Login.jsx`, `Register.jsx`, `Home.jsx`, and `AIChat.jsx` are almost entirely inline-styled. This defeats design-system enforcement and makes theming brittle.

---

#### M5 — `console.log`/`console.error` throughout production code
**Files**: `useWebSocket.js:16,33`, `VoiceCall.jsx:114,125`, `AuthProvider.jsx:82,98,176`, `AIChat.jsx:33,58,104`, `Home.jsx:142`, `api.js:391`  
Raw console statements should not appear in production builds. Replace with a structured logger that can be silenced in production, or remove entirely where the error is already surfaced in the UI.

---

#### M6 — `Navbar.jsx` is dead code — never rendered
**File**: `src/components/Navbar.jsx`  
`Navbar` is never imported in `AppLayout.jsx` or anywhere else. Navigation is implemented directly in `AppLayout`. `Navbar.jsx` and `Navbar.test.jsx` are orphaned files.  
**Fix**: Delete both files.

---

#### M7 — `AuthModal.jsx` dialog ref/render race condition
**File**: `src/components/AuthModal.jsx:14-22`  
When `showAuthModal` is false the component returns `null`, so `dialogRef.current` is always `null`. When it flips to `true`, the component renders and the ref is set — but the `useEffect` for the previous render already ran with a null ref. The dialog never opens via `showModal()`.  
**Fix**: Either keep the dialog mounted but visually hidden (remove the early `return null`), or control visibility purely via CSS `open` attribute without the `useEffect`/`dialogRef`.

---

#### M8 — Streaming error recovery leaves a partial message in chat
**File**: `src/pages/AIChat.jsx:104-108`  
When the stream errors mid-response, the partially-typed assistant message stays in the array. The fallback is appended as a new entry, so users see both a truncated message and an error message simultaneously.  
**Fix**: In the catch block, use the tracked `assistantId` to replace the partial message content with the error text instead of pushing a new entry.

---

#### M9 — `Math.random()` in JSX causes waveform flicker
**File**: `src/components/VoiceCall.jsx:275`  
```js
height: `${Math.max(8, (isAriaSpeaking ? (Math.random() * 40 + 20) : 8))}px`
```
`Math.random()` called in JSX produces a new value on every render, flickering the waveform bars on any unrelated state update.  
**Fix**: Drive the animation from a `useRef` updated in a `requestAnimationFrame` loop, or use a CSS keyframe animation.

---

#### M10 — `Date.now() + Math.random()` used as message IDs
**Files**: `src/components/Chat.jsx:15`, `src/pages/AIChat.jsx:69,74`  
Low collision resistance. Use `crypto.randomUUID()` which is universally available in modern browsers.

---

#### M11 — User full name sent to external `ui-avatars.com`
**File**: `src/pages/Home.jsx:196`  
```js
src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name)}&background=random`}
```
The user's full name is sent to a third-party service in the URL. This is a GDPR data minimization concern.  
**Fix**: Render initials client-side via a small SVG or canvas element without external requests.

---

#### M12 — `setCachedUser`/`setCachedDashboard` silently ignore storage errors
**File**: `src/context/AuthProvider.jsx:28-30, 47-50`  
Empty `catch {}` blocks mean `localStorage` quota exceeded or private-browsing errors are silently lost, leading to repeated API calls.

---

#### M13 — Duplicate `useEffect` import in Login and Register
**Files**: `src/pages/Login.jsx:1,6`, `src/pages/Register.jsx:1,6`  
`useEffect` is imported twice in both files — once in the React destructure on line 1 and again as a separate import on line 6.

---

#### M14 — `setCachedDashboard` listed as `useCallback` dependency incorrectly
**File**: `src/context/AuthProvider.jsx:134,158`  
`setCachedDashboard` is a module-level plain function (not reactive state). Listing it as a `useCallback` dep serves no purpose and is misleading. Remove it.

---

### LOW

#### L1 — Unnecessary `import React` in modern Vite project
**Files**: `src/components/VoiceCall.jsx:1`, `src/main.jsx:1`  
The Vite JSX transform handles the React import automatically. Explicit `import React from 'react'` is not needed.

---

#### L2 — No 404 handler inside `/app` routes
**File**: `src/App.jsx`  
Authenticated users visiting an unknown `/app/*` path are silently redirected to `/app/home` instead of seeing a 404 page.

---

#### L3 — `ScriptProcessorNode` is deprecated
**File**: `src/components/VoiceCall.jsx:135`  
`createScriptProcessor` is deprecated in the Web Audio spec. The modern replacement is `AudioWorkletNode`. Browsers will eventually log deprecation warnings.

---

#### L4 — Inconsistent indentation in `VoiceCall.jsx`
**File**: `src/components/VoiceCall.jsx`  
The file uses 4-space indentation while the rest of the codebase uses 2 spaces.

---

#### L5 — Google/Apple OAuth buttons are non-functional UI
**Files**: `src/pages/Login.jsx:173-178`, `src/pages/Register.jsx:197-202`  
Both pages display Google and Apple sign-in buttons with no `onClick` handler, no `aria-label`, and no disabled state. They appear interactive but do nothing. Remove them or implement them.

---

## Test Quality Assessment

| Test File | What It Tests | Quality |
|---|---|---|
| `api.test.jsx` | That service exports exist and are functions | Smoke only — no behavior, no network |
| `Login.test.jsx` | Render, input change, password toggle | Missing: submit, error state, auth redirect |
| `Navbar.test.jsx` | Render, links, menu toggle | Tests a component that is never rendered |

**Coverage estimate**: < 5% behavioral coverage. No tests for `AuthProvider`, `useAuth`, `useWebSocket`, `VoiceCall`, `AIChat`, or any page-level data fetching. The `api.test.jsx` assertions only confirm `typeof fn === 'function'` — they make no assertions about actual service behavior.

**Required**: Tests using React Testing Library with MSW for network mocking, covering at minimum: auth flow (login success/failure), protected route redirection, form validation, chat send/receive, and WebSocket message handling.

---

## Validation Results

| Check | Result | Notes |
|---|---|---|
| TypeScript check | Skipped | No TypeScript in project |
| Lint | Not run | `pnpm lint` available |
| Tests | Not run | `pnpm test:run` available |
| Build | Not run | `pnpm build` available |

---

## Files Reviewed

| File | Finding |
|---|---|
| `src/services/api.js` | C1, C2, H1, H9, M5 |
| `src/context/AuthProvider.jsx` | C2, C3, H3, M12, M14 |
| `src/context/AuthContext.jsx` | OK |
| `src/hooks/useAuth.js` | OK |
| `src/hooks/useWebSocket.js` | M5 |
| `src/App.jsx` | L2 |
| `src/main.jsx` | L1 |
| `src/components/AppLayout.jsx` | H7 |
| `src/components/Navbar.jsx` | M6 (dead code) |
| `src/components/AuthModal.jsx` | M7 |
| `src/components/Chat.jsx` | M10 |
| `src/components/ErrorBoundary.jsx` | OK |
| `src/components/VoiceCall.jsx` | C1, H4, H5, M9, L1, L3, L4 |
| `src/components/ui/SharedComponents.jsx` | OK |
| `src/pages/Login.jsx` | H2, H8, M2, M4, M13 |
| `src/pages/Register.jsx` | H2, H8, M2, M4, M13 |
| `src/pages/Home.jsx` | H6, H8, M3, M5, M11 |
| `src/pages/AIChat.jsx` | M3, M5, M8, M10 |
| `src/test/api.test.jsx` | Smoke tests only |
| `src/test/Login.test.jsx` | Partial coverage |
| `src/test/Navbar.test.jsx` | Tests dead component |
| `.gitignore` | C4 — missing `.env` exclusion |
| `vite.config.js` | OK |
| `package.json` | Missing Axios, React Query, Zod, RHF |

---

## Priority Fix Order

1. **C4** — Add `.env` to `.gitignore` immediately (30 seconds, do it now)
2. **C1** — Stop sending auth token in WebSocket URL
3. **C2 + C3** — Migrate token to HttpOnly cookie; remove user data from localStorage
4. **H3** — Fix `isAuthenticated` not reset on background auth failure
5. **H4** — Fix `isMuted` stale closure in audio processor
6. **H7** — Fix mobile menu not closing on route change
7. **H1** — Migrate to Axios instances with interceptors
8. **H2** — Migrate forms to React Hook Form + Zod
9. **M3** — Migrate data fetching to React Query
10. **M6** — Delete `Navbar.jsx` and `Navbar.test.jsx`
