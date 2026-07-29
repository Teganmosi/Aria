import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** Red confirm button for destructive actions */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Aria-styled confirmation dialog — replaces native browser confirm(), which is
 * jarring, unthemeable, and increasingly blocked on mobile. Closes on Escape
 * and backdrop click; focus lands on Cancel so Enter doesn't confirm by accident.
 */
export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <style>{`
        .confirm-overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center; padding: 1.5rem;
          background: rgba(6,14,26,0.62); backdrop-filter: blur(6px);
          animation: confirm-fade 0.2s ease-out both;
        }
        .confirm-card {
          width: 100%; max-width: 400px;
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-radius: 28px; box-shadow: var(--shadow-main), 0 40px 80px rgba(6,14,26,0.35);
          padding: 2.25rem 2rem 2rem;
          animation: confirm-rise 0.24s cubic-bezier(0.16,1,0.3,1) both;
        }
        .confirm-btn { transition: opacity 0.15s, transform 0.15s; }
        .confirm-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        @keyframes confirm-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes confirm-rise {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        className="confirm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          className="font-serif"
          style={{ fontStyle: 'italic', fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.75rem', lineHeight: 1.15, margin: '0 0 0.75rem' }}
        >
          {title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.95rem', margin: '0 0 1.75rem' }}>
          {description}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="confirm-btn"
            style={{
              flex: 1, padding: '0.85rem', borderRadius: '2rem',
              border: '1px solid var(--border-color)', background: 'transparent',
              color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="confirm-btn"
            style={{
              flex: 1, padding: '0.85rem', borderRadius: '2rem', border: 'none',
              background: danger ? '#ef4444' : 'var(--brand-solid)',
              color: danger ? '#ffffff' : 'var(--bg-main)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
