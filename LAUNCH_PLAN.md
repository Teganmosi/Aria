# Aria — Launch Sprint Plan (Jul 29 → ~Sep 5, 2026)

## Context

Production hardening (Tier 0 + 1) is complete and committed (`8ab9d77`). The remaining work to public launch, agreed with the user: deploy first, then frontend polish, legal/consent, premium voice-call tier, then a single public launch (no separate beta — but a quiet soft launch to ~10 real people in Sprint 2). Native mobile app (Expo/React Native) follows as the next phase after launch; PWA work is dropped.

**Assumptions:** ~1-week sprints starting Thu Jul 29; roughly full-time pace (part-time → stretch each sprint ×1.5–2); solo developer + Claude. Dates shift as a block if a sprint overruns — scope flexes before dates do.

**Triage rule for the whole run:** every finding gets tagged *launch-blocking* or *backlog*. Only launch-blocking gets fixed before Sep. The backlog (Tier-2 items, main.py split, @ts-nocheck cleanup, dead code) is parked, not lost.

---

## Sprint 0 — Stabilize & Deploy (Jul 29 – Aug 1)

**Goal:** the current app live on Render at its real URL, every feature verified on desktop and phone browsers.

- [you] Rotate credentials: NVIDIA, OpenAI, YarnGPT, **Supabase service-role key**, Supabase DB password
- [you] Move project out of Google Drive sync (or exclude the folder)
- [you] Push the hardening commit; set Render env vars — `CORS_ORIGINS` = real frontend origin (server refuses `["*"]`), verify `SECRET_KEY` generated, fill all `sync:false` vars
- [both] Deploy backend + frontend; fix whatever the first deploy breaks (there's always something)
- [both] Smoke-test matrix on the live URL — register/login/OAuth, Bible study, emotional support, devotion, AI chat + streaming, TTS playback, voice call end-to-end, `/health` — on desktop, Android Chrome, iOS Safari
- [you, background] Create: Google AI Studio API key · Alibaba Cloud/DashScope account (Qwen spike — signup can be slow) · Paystack account in **test mode**

**Done when:** every feature works at the public URL on desktop + both phone platforms; `/health` → 200; no console/network errors on happy paths.

## Sprint 1 — Frontend Polish (Aug 3–9)

**Goal:** the app looks and feels launch-ready at every screen size.

- [me] QA pass: run the app, screenshot every page at desktop + 375px, produce a triaged checklist (launch-blocking / backlog)
- [both] Fix launch-blockers: picsum placeholders → real branded assets (some exist in `public/`), responsive breaks, broken loading/error/empty states
- [both] Landing page: copy pass, real images, clear register CTA, OG-preview check when shared
- [me] Cross-browser sanity (Chrome/Safari/Firefox) + Lighthouse pass on landing
- Backlog everything cosmetic-but-fine

**Done when:** checklist blockers closed; no broken layouts at 375px; zero placeholder content anywhere.

## Sprint 2 — Trust, Legal & Soft Launch (Aug 10–16)

**Goal:** legally launchable, consent tracked, and first real humans using it quietly.

- [me] Draft Privacy Policy + Terms tailored to Aria's real data flows: AI processors seeing conversation content, voice transcripts, special-category (religious/health) data, retention, deletion via memory-clear, disclaimers (not counseling/medical care; AI output can be inaccurate), content ownership
- [me] `/privacy` + `/terms` routes; Register checkbox (required, links both); footer links site-wide
- [me] Backend: `consents` table via the new migration runner; record user + doc version + timestamp at register; reject register without consent
- [you] Invite ~10 friends/church members to the live app; collect feedback
- [both] Triage feedback — crash-level and trust-eroding issues only, the rest to backlog
- [you, optional] If you want a lawyer's review of the docs, start it now so it doesn't gate launch

**Done when:** register requires and records consent; pages live; ≥5 external people have used the app; no unresolved crash-level feedback.

## Sprint 3 — Premium Core (Aug 17–23)

**Goal:** the good voice engine exists behind an adapter, tiers/wallet exist, the free cap is real.

- [me] Provider spike: Gemini Live vs Qwen3-Omni-Realtime — prototype both bridges (their WS protocols vs the current PCM relay), compare quality/latency/cost → pick a winner (loser becomes optional fallback)
- [me] Provider adapter in the voice WS path; the current HF-Space engine stays as the *free* engine
- [me] DB: `tier` on profiles, `wallets` (minutes balance), `transactions` (top-ups/deductions), `call_sessions` (per-call log with provider + duration + estimated cost)
- [me] Arm the free 2-min cap server-side (constant already exists, marked `TODO(premium-launch)`); premium gets extended limits; "free quality" labeling in the call UI
- [me] Tier-aware gating (`require_premium` dependency pattern); expose tier on `/auth/me` and in the frontend user object

**Done when:** an internal test account calls on the premium engine with noticeably better quality; a free account is hard-stopped at 2 min with an upgrade prompt; every call is logged with duration + cost estimate.

## Sprint 4 — Payments & Metering (Aug 24–30)

**Goal:** real money flows safely and minutes meter correctly.

- [me] Paystack: minute-pack pricing + top-up checkout, webhook endpoint (signature verification, idempotent), credit minutes on success, sane failure paths
- [me] Metering: per-call minute deduction at the marked-up rate, balance pre-check before call starts, graceful "out of minutes" mid-call handling, refund on provider failure
- [me] UI: pricing/upgrade page, wallet balance in nav + call UI, transaction history
- [both] End-to-end on test cards: buy → call → deduct → re-buy; edge cases — minutes run out mid-call, webhook replay (must not double-credit), failed provider call (must refund)
- [both] Decide the actual ₦/minute rate and pack sizes from spike cost data (markup baked in)

**Done when:** purchase→call→deduct loop works on test payments; replays don't double-credit; zero balance blocks premium calls cleanly; pricing numbers fixed.

## Sprint 5 — Hardening & Launch (Aug 31 – Sep 5)

**Goal:** ship it, and survive the first 48 hours.

- [both] Bug bash across all premium flows; a few concurrent calls as a load sanity check; Sentry alerts reviewed
- [me] Final env-var audit vs `.env.example`; verify DB backups are on; document the rollback path
- [you] Launch assets: screenshots/short demo, announcement copy, pick channels
- [you] **Launch** — public announcement
- [both] 48h watch: Sentry, logs, payment webhooks; hotfix capacity reserved
- [both] Retro + kickoff mobile-app planning (Phase 2)

**Pre-launch rename pass** (if the product name changes from Aria — undecided, driven by domain availability): choose the final name together with the domain — check `.com`/`.app`/`.ng` plus IG/X handles in one sitting before committing. The rename itself is a structured sweep: UI copy, OG/meta tags, Supabase email templates, the AI persona system prompts ("You are Aria…"), asset filenames, and the legal docs (bump to v1.1, re-consent not required for a name change). No rename work happens until the name is locked — legal pages currently say "the Aria team" as operator, which reads fine either way.

**Done when:** paying users can buy minutes and call; monitoring live; announcement out; no Sev-1 open.

---

## Cross-cutting

- **Ritual:** Monday check-in — review the sprint, adjust the next. Anything new discovered mid-sprint gets triaged (blocking vs backlog), not auto-added.
- **Top risks:** ① Qwen/DashScope account friction delays the spike → mitigated by Sprint-0 homework; Gemini is the safety net. ② Polish phase scope creep → triage rule is the guardrail. ③ iOS Safari voice-call quirks → real-device test in Sprint 0, not Sprint 5. ④ Paystack webhook subtleties → test mode + signature checks, never skip.
- **Carried backlog (post-launch):** Tier-2 list (main.py router split, structured logging/PII removal, per-user spend caps, ESLint TS, @ts-nocheck cleanup, tests beyond smoke, bundle splitting), then the React Native mobile app per the roadmap section below.

## Roadmap after premium: native mobile app

User decision (2026-07-28): ship as a **native mobile app** rather than a PWA. PWA items are dropped from the Tier-2 backlog (no manifest/service-worker work). Order: finish web features (premium tier) → launch → build the mobile app.

- **Stack direction:** Expo/React Native — reuses React + TS skills and shares API types/logic with the web frontend.
- **Backend is fully reusable:** REST API, voice WebSocket protocol (auth-first-message, base64 PCM, duration watchdog), and all premium/billing logic stay server-side and client-agnostic. Paystack and Supabase both have React Native SDKs.
- **Does not transfer:** the web audio pipeline (AudioWorklet) — the mobile app gets its own audio stack against the same WebSocket contract.
- **iOS payments constraint:** Apple requires IAP for digital goods sold in-app; the planned pattern is sell minutes on the web (Paystack) and let the app consume them — compliant, but needs careful store-compliance handling during the mobile phase.

---

## Sprint 3 technical design — premium voice tier (draft, pending greenlight)

### Database (migration `006_premium_tier.sql` + `_ensure_tables` parity)
- `profiles` + `tier TEXT DEFAULT 'free'` (follow the existing column-add pattern in `_ensure_tables`)
- `wallets`: `user_id` PK, `minutes_balance NUMERIC(10,2)`, `updated_at`
- `wallet_transactions`: id, user_id, `type` (topup/deduct/refund/bonus), `minutes NUMERIC(10,2)`, `amount_ngn INT NULL` (topups only), `provider_ref TEXT` (Paystack reference, unique), `call_session_id NULL`, description, created_at
- `call_sessions`: id, user_id, `tier_at_call`, `engine` (hf/gemini/qwen), started_at, ended_at, `duration_seconds INT`, `provider_cost_usd NUMERIC(12,6)`, `minutes_charged NUMERIC(10,2)`, status (completed/failed/refunded)

### Provider adapter
- Thin engine interface: `connect(system_prompt, voice)`, `send_audio(pcm16/float32)`, async event stream (`audio_out`, `transcript_user`, `transcript_ai`, `vad_speaking`, `usage`).
- Three implementations: `HFS2SEngine` (refactor of the current bridge, free tier), `GeminiLiveEngine`, `QwenOmniEngine`. `websocket_voice_call` selects by tier + `settings.premium_voice_engine`; audio format conversion lives inside each engine, WS contract to the browser stays unchanged (mobile app reuses it).
- Spike (Sprint 3 days 1–3): both new engines prototyped behind one call; pick on quality/latency/cost; loser stays as fallback.

### Metering & charging
- Duration from **server timestamps**, never client-reported. Provider cost from engine `usage` events where available, else duration × per-minute cost constant (kept in settings, tunable without code).
- On call end: single DB transaction — write `call_sessions`, deduct minutes (`wallet_transactions`), update `wallets`. Provider failure → `status=failed`, no charge; partial failure → refund row.
- Premium user with empty balance → falls back to the free HF engine + top-up prompt (the call still works).
- Rate + packs are settings (`PREMIUM_RATE_PER_MINUTE_NGN`, pack list) — pricing numbers decided in Sprint 4 from spike cost data.

### Paystack
- `POST /billing/initialize {pack_id}` → Paystack initialize with `metadata {user_id, pack_id}` → returns `authorization_url` + reference.
- Callback endpoint: server-side `GET transaction/verify/{ref}`, **idempotent by reference** (unique `provider_ref`), credits minutes, records transaction. Return-URL handler re-verifies for instant UX.
- `GET /billing/wallet` → balance + recent transactions. Secret: `PAYSTACK_SECRET_KEY` (test mode first).

### Frontend
- Upgrade page (packs + Paystack), wallet balance in nav + call screen, "Free quality · 2-min sessions — Upgrade" banner on the free-tier call overlay (the `time_warning` UI already exists), tier surfaced on `/auth/me` and `voice-session` response.
- Legal docs already describe minute packs + refund policy (Terms §5), so no doc re-release needed at premium launch.
