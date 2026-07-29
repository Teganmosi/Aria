# HANDOFF — Aria (state as of July 29, 2026)

> Read this first. Then read the sprint plan at
> `C:\Users\Mosijobin Alabi\.claude\plans\so-now-that-i-magical-ritchie.md`
> (sprint schedule, premium technical design, mobile roadmap).
> If you are Claude Code, you can copy this file to `CLAUDE.md`.

## 1. What this is

Aria is a Christian AI spiritual companion: AI chat, Bible study, emotional support,
daily devotions, journals/notes, and a **realtime voice call** feature. Web app now,
native mobile app (React Native/Expo) planned as the phase after launch.

**Owner context:** solo founder in Nigeria. Launch sequence agreed: production
hardening (done) → frontend polish (done) → legal/consent (done, one placeholder
pending) → **premium voice tier (in progress)** → public launch → mobile app.

## 2. Stack & deployment

- **Backend:** FastAPI, one monolith `main.py` (~3,200 lines), Python 3.11. No ORM —
  raw SQL via the `Database` singleton in `database.py` (psycopg2 ThreadedConnectionPool;
  schema lives in `Database._ensure_tables` + versioned SQL in `supabase/migrations/`,
  applied by `Database._apply_pending_migrations`). Auth in `auth.py`: Supabase Auth for
  credentials → local JWTs (PyJWT) + opaque refresh tokens in DB.
- **Frontend:** React 19 + Vite 7 + TypeScript in `frontend/`. `npm run typecheck`
  (tsc --noEmit) is part of `npm run build` and must stay green. 14 files still carry
  `@ts-nocheck` (known backlog — don't add more).
- **Data:** Supabase Postgres (us-west-2 pooler) + Supabase Auth; Upstash Redis
  (optional cache, `REDIS_ENABLED`); email verification is **disabled** in Supabase
  (deliberate — instant signup).
- **Deploy:** Render, **auto-deploys from branch `feat/devotion-canvas-and-auth-improvements`**
  (backend service `aria-backend-kjqw`, static frontend `aria-frontend-fjpa`). Pushing =
  deploying. Free tier → ~1 min cold starts. `render.yaml` is blueprint-managed; secrets
  set in the Render dashboard (`sync: false` vars).
- **Repo:** github.com/Teganmosi/Aria. ⚠️ The working copy lives in a **Google Drive
  sync folder**; `.env` contains live production secrets — never commit, print, or log
  secret values.

## 3. Architecture quick-map (voice + billing — the active work)

**Voice call flow** (`main.py: websocket_voice_call`, `/ws/voice-call/{call_id}`):
browser WS (auth via first message `{"type":"auth","token":...}`; `?token=` query param
is a legacy fallback) → `select_voice_engine(profile)` from `voice_engines.py` → engine
bridge → normalized `VoiceEvent`s back to the browser. Browser protocol: client sends
`{type:"audio_input", audio: base64 Float32 PCM 16kHz}`; server sends
`{type:"audio_output", audio: base64 PCM16 24kHz}` plus `transcript`, `user_speaking`,
`aria_speaking`, `status`, `time_warning`, `call_ending`, `error`. **All format
conversion lives inside engines — keep this contract stable (the mobile app reuses it).**

**Engines** (`voice_engines.py`):
- `HFS2SEngine` — free tier. Public HF Space `wss://teganmosi-realtime.hf.space/s2s`,
  no key, cold-start backoff built in. Works in production today.
- `GeminiLiveEngine` — premium candidate. Raw Gemini Live bidi-WS protocol (no SDK).
- `QwenOmniEngine` — premium candidate. DashScope OpenAI-Realtime-style protocol.
- ⚠️ Gemini/Qwen were **written from public docs and NOT yet verified against live
  APIs** — expect small event-shape adjustments when keys land. Contained to this file.
- Selection: `tier == "premium"` → `settings.premium_voice_engine` ("gemini"|"qwen");
  premium with empty wallet → graceful fallback to HF (call never dies); else HF.

**Metering (in the WS handler's `finally`):** duration from server monotonic timestamps;
premium engines charge `round(duration/60, 2)` minutes capped at available balance;
failed calls and <10s connects never charged; each call recorded in `call_sessions`
with provider cost estimate. Free calls: free.

**Billing** (`main.py` "Billing" section):
- Tables: `profiles.tier` ('free'|'premium'), `wallets` (minutes_balance),
  `wallet_transactions` (**unique `provider_ref` = Paystack idempotency key**,
  signed minutes), `call_sessions`. Migration: `supabase/migrations/006_premium_tier.sql`.
- Endpoints: `GET /api/v1/billing/packs`, `GET /api/v1/billing/wallet`,
  `POST /api/v1/billing/initialize` (Paystack hosted checkout),
  `GET /api/v1/billing/paystack/callback` (server-verified redirect → frontend),
  `POST /api/v1/billing/paystack/webhook` (HMAC-SHA512 verified).
- Crediting path `_verify_and_credit_paystack`: verifies with Paystack, re-checks
  amount vs pack, credits idempotently, **promotes user to premium on first purchase**.
- Pack pricing is **provisional** (60/180/500 min @ ₦2,500/6,000/14,000) — constants in
  `VOICE_MINUTE_PACKS`, to be finalized from real provider cost data.
- Free-tier 2-min cap: `_get_voice_call_limits` + `PREMIUM_LAUNCHED` flag in `main.py`
  (currently `False` → everyone gets 10 min; flip to `True` at launch so free users get
  2 min and premium gets 60 min).

## 4. Done (git history tells the story)

- `8ab9d77` — security hardening: leaked key removed, SECRET_KEY startup guard, TTS auth,
  CORS wildcard refused, rate limits, WS per-user cap + duration watchdog, PyJWT migration,
  security headers, real /health, graceful shutdown.
- `e37e3cd` — Sprint 1: QA audit fixed (21 of 25 blockers), password recovery flow
  (Supabase reset, both PKCE + implicit), Apple OAuth buttons removed, dead AuthModal
  deleted, 404 page, landing placeholders → real assets.
- `91371a6` — legal hotfix: all legal values live in `frontend/src/legal-config.ts`
  (operator, jurisdiction, version, contactEmail — **contactEmail is still ''**, pages
  render an honest fallback).
- User's commits `42705bf`/`39cbfe5` — consent system: Register checkbox (Zod + backend
  enforced), `consents` table (migration 005), consent recorded at signup/OAuth,
  `/privacy` + `/terms` pages (Nigeria jurisdiction, AI-provider transparency,
  not-a-counselor disclaimers, forward-looking billing terms).
- `ed7db34` — premium foundation: wallet/tier schema (migration 006), engine abstraction
  + 3 engines, engine-agnostic handler with metering.
- `04d46a7` — Paystack billing: packs/wallet/checkout/callback/webhook, idempotent
  crediting, premium promotion.

## 5. WHERE TO START — the next work, in order

### 5a. Premium frontend (next task, fully unblocked, ~spec below)
1. `frontend/src/services/api.ts`: add `billingService` — `getPacks()`, `getWallet()`,
   `initializeTopUp(packId)` hitting the endpoints above (use `axiosPrivate`).
2. **Call overlay** (`frontend/src/components/VoiceCall.tsx`):
   - `voiceCallService.createCallSession` response now includes `tier` — for `tier==="free"`,
     show a subtle badge: "Free quality · 2-min sessions" with an Upgrade link.
   - On `time_warning`: add an upgrade CTA to the existing warning UI.
   - On `call_ending` (reason `time_limit_reached`): end screen should upsell premium.
3. **Upgrade page** (new, e.g. `frontend/src/pages/Upgrade.tsx` + route in `App.tsx`,
   linked from badge/nav/profile): list packs from `GET /billing/packs`, purchase button
   → `POST /billing/initialize` → `window.location.href = authorization_url`
   (Paystack hosted checkout). Design it on-brand (see `LegalPage.tsx`/landing for the
   aesthetic: Playfair Display serif italics, brand-accent gold, deep navy).
4. **Wallet UI**: minutes balance in the nav or profile page from `GET /billing/wallet`
   + transaction history.
5. `Profile.tsx`: read `?topup=success|error` query param (the Paystack callback
   redirects there) → toast success ("X minutes added") or error.
6. Keep `npm run typecheck` green. Note: new pages should NOT use `@ts-nocheck`.

### 5b. Live verification (blocked on user-provided credentials)
- `GEMINI_API_KEY` → test `GeminiLiveEngine` end-to-end; adjust wire protocol to reality.
- `DASHSCOPE_API_KEY` → same for `QwenOmniEngine`; then the user picks the winner
  (`PREMIUM_VOICE_ENGINE` setting).
- `PAYSTACK_SECRET_KEY` (test mode) → full purchase loop: initialize → checkout →
  callback + webhook → wallet credited once (test replay idempotency). Also configure
  the webhook URL in the Paystack dashboard: `{PUBLIC_BACKEND_URL}/api/v1/billing/paystack/webhook`.
- Set `PUBLIC_BACKEND_URL` + `FRONTEND_URL` in Render env for the deployed services.

### 5c. Then: Sprint 4/5 and launch
Finalize ₦/minute pricing and packs from real cost data; flip `PREMIUM_LAUNCHED=True`;
bug bash; launch. Full detail in the plan file. Post-launch: React Native mobile app
(backend is fully reusable; sell minutes on web, consume in app — Apple IAP constraint).

## 6. Decisions already locked — do not re-litigate

- Payments: **Paystack**. Charging UX: **prepaid minutes wallet** — users buy minute
  packs; per-minute rate with markup baked in; **never show per-second/token pricing**.
- Provider: spike both Gemini + Qwen, pick after live comparison. Free engine stays HF Space.
- Free cap **2 min** (armed by `PREMIUM_LAUNCHED`), premium **60 min**.
- Empty premium balance → **fall back to free engine**, don't kill the call.
- Legal: Nigeria jurisdiction; operator currently "the Aria team" (pre-incorporation).
- No email verification at signup (Supabase setting, deliberate).
- Apple OAuth and PWA: dropped. Native mobile app is the post-launch phase.
- Product **name may change** (domain availability) — a rename pass is planned in
  Sprint 5; don't hardcode "Aria" into new user-facing copy more than necessary, and
  route legal strings through `frontend/src/legal-config.ts`.

## 7. Pending user actions (external, not code)

- Business email → set `LEGAL.contactEmail` in `frontend/src/legal-config.ts`.
- Google AI Studio API key · Alibaba DashScope account · Paystack test account
  (these gate all of 5b).
- Full device smoke test of the deployed app — **especially voice call on iOS Safari**
  (never been verified on a real iPhone).
- Git identity is a placeholder (`your-email@example.com`) — cosmetic.

## 8. Landmines & conventions

- `main.py` is a monolith; voice helpers `_connect_and_configure_s2s`,
  `_forward_frontend_to_s2s`, `_forward_s2s_to_frontend`, `_handle_s2s_*`, `_reconnect_s2s`,
  `_process_frontend_message` are **dead code** (superseded by `voice_engines.py`) —
  safe to delete as a cleanup task.
- `websockets==14.0` → connect kwarg is `additional_headers` (not `extra_headers`).
- DB changes: add DDL to `_ensure_tables` AND a new `supabase/migrations/00X_*.sql` file;
  column adds to existing tables use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in the
  guarded loop in `_ensure_tables`.
- pytest suite hits live Supabase (not hermetic); CI runs compile + typecheck only.
- FastAPI endpoints needing rate limits must accept `request: Request` (slowapi);
  limiter pattern: `@app.post(...)` then `@limiter.limit("N/minute")`.
- Frontend env: `VITE_API_URL`, `VITE_WS_URL` — production builds throw if missing (by design).
- Verify backend changes with: `python -m py_compile main.py database.py voice_engines.py`
  and an import smoke test with fake env vars (see commit history for the pattern);
  frontend with `npx tsc --noEmit`.
- Never commit `.env`; never paste real secrets into chat/logs.
