import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LEGAL } from '../legal-config'

/**
 * Renders the support contact — the real address once set in legal-config.ts,
 * otherwise an honest fallback line (never a raw placeholder).
 */
export const LegalContact = () =>
  LEGAL.contactEmail ? (
    <strong>{LEGAL.contactEmail}</strong>
  ) : (
    <em>our support contact — being finalized alongside our company registration</em>
  )

interface LegalPageProps {
  title: string
  lastUpdated: string
  version: string
  children: ReactNode
}

/**
 * Shared layout for legal documents (Privacy Policy, Terms of Service).
 * Quiet, readable, on-brand — legal pages should feel like part of the sanctuary,
 * not a pasted-in template.
 */
export const LegalPage = ({ title, lastUpdated, version, children }: LegalPageProps) => (
  <div className="min-h-screen bg-[var(--bg-main)]" style={{ color: 'var(--text-main)' }}>
    <header
      className="flex items-center justify-between"
      style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 1.5rem 0' }}
    >
      <Link
        to="/"
        className="font-serif"
        style={{ fontStyle: 'italic', fontSize: '1.75rem', fontWeight: 700, color: 'var(--brand-solid)', textDecoration: 'none' }}
      >
        Aria
      </Link>
      <Link
        to="/"
        style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
      >
        ← Back to Aria
      </Link>
    </header>

    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      <p
        style={{
          fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem',
        }}
      >
        Legal · Version {version}
      </p>
      <h1
        className="font-serif"
        style={{ fontStyle: 'italic', fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', lineHeight: 1.1, margin: '0 0 0.75rem' }}
      >
        {title}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '3rem' }}>
        Last updated {lastUpdated}
      </p>

      <div className="legal-prose">{children}</div>

      <style>{`
        .legal-prose h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          margin: 3rem 0 1rem;
          color: var(--text-main);
        }
        .legal-prose h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 2rem 0 0.75rem;
          color: var(--text-main);
        }
        .legal-prose p, .legal-prose li {
          color: var(--text-secondary);
          line-height: 1.85;
          font-size: 0.975rem;
          margin: 0 0 1.1rem;
        }
        .legal-prose ul { padding-left: 1.4rem; margin: 0 0 1.1rem; }
        .legal-prose strong { color: var(--text-main); }
        .legal-prose .legal-note {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-left: 3px solid var(--brand-accent);
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          margin: 1.75rem 0;
        }
        .legal-prose .legal-note p { margin: 0; }
      `}</style>
    </main>
  </div>
)

export default LegalPage
