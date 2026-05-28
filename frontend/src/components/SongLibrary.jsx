/**
 * SongLibrary.jsx — Persistent song session browser
 *
 * Displays songs saved via /api/save, fetched from /api/sessions.
 * Shows archetype, core message, section count, date.
 * Allows clicking a session to view or continue from it.
 *
 * Props:
 *   onClose   {fn}  — close handler
 *   onRestore {fn}  — (sessionData) => void — restore a session
 */
import { useState, useEffect } from 'react'
import styles from './SongLibrary.module.css'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

const ARCHETYPE_EMOJI = {
  'The Defiant':       '⚡', 'The Misunderstood': '🌊',
  'The Transformer':   '🔥', 'The Seeker':        '🔍',
  'The Bridge Walker': '🌈', 'The Lone Voice':    '🎤',
  'The Heir':          '👑', 'The Grounded':      '🌍',
  'The Observer':      '👁',  Defiant: '⚡', Wounded: '💧',
  Seeker: '🔍', Witness: '👁', Trickster: '🎭', Confessor: '🕯',
}

function formatDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SongLibrary({ onClose, onRestore }) {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [preview,  setPreview]  = useState(null)

  useEffect(() => {
    fetch(`${BACKEND}/api/sessions`)
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>SONG LIBRARY</span>
            <span className={styles.count}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Session list */}
          <div className={styles.list}>
            {loading && <div className={styles.state}>Loading sessions…</div>}
            {error   && <div className={styles.state}>⚠ {error}</div>}
            {!loading && !error && sessions.length === 0 && (
              <div className={styles.state}>No saved sessions yet. Generate a song and it'll appear here.</div>
            )}
            {sessions.map(s => (
              <button
                key={s.id || s.filename}
                className={`${styles.card} ${preview?.id === s.id ? styles.active : ''}`}
                onClick={() => setPreview(s)}
              >
                <span className={styles.cardEmoji}>
                  {ARCHETYPE_EMOJI[s.archetype] || '◈'}
                </span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardArchetype}>{s.archetype || 'Unknown Archetype'}</span>
                  <span className={styles.cardMessage}>{s.coreMessage || '—'}</span>
                  <span className={styles.cardDate}>{formatDate(s.savedAt)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Preview panel */}
          <div className={styles.preview}>
            {!preview ? (
              <div className={styles.previewEmpty}>
                Select a session to preview
              </div>
            ) : (
              <div className={styles.previewContent}>
                <div className={styles.previewArchetype}>
                  {ARCHETYPE_EMOJI[preview.archetype] || '◈'} {preview.archetype}
                </div>
                {preview.coreMessage && (
                  <p className={styles.previewMsg}>"{preview.coreMessage}"</p>
                )}
                <p className={styles.previewDate}>{formatDate(preview.savedAt)}</p>
                <button
                  className={styles.restoreBtn}
                  onClick={() => { onRestore?.(preview); onClose() }}
                >
                  View Full Session →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
