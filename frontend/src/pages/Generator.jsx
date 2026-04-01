/**
 * Generator.jsx
 * Real-time section-by-section song generation with live progress.
 * Calls /api/section for each section sequentially, updating UI as each arrives.
 */
import { useState, useEffect, useRef } from 'react'
import styles from './Generator.module.css'

const SECTION_COLORS = {
  verse: '#7c3aed', hook: '#f59e0b', 'pre-hook': '#f97316',
  bridge: '#10b981', intro: '#6b7280', outro: '#3b82f6',
}

export default function Generator({ analysis, apiKey, provider, onDone }) {
  const { persona, message, structure, style } = analysis
  const [sections,      setSections]      = useState([])
  const [currentIdx,    setCurrentIdx]    = useState(0)
  const [status,        setStatus]        = useState('starting')
  const [error,         setError]         = useState(null)
  const previousRef = useRef([])

  useEffect(() => {
    generateAll()
  }, [])

  async function generateAll() {
    setStatus('generating')
    const allSections = structure.sections
    const generated   = []

    for (let i = 0; i < allSections.length; i++) {
      setCurrentIdx(i)
      try {
        const res = await fetch('/api/section', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section:          allSections[i],
            persona, message, style,
            previousSections: previousRef.current,
            apiKey,
            provider,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        const data = await res.json()
        generated.push(data.section)
        previousRef.current = [...generated]
        setSections([...generated])
      } catch (err) {
        setError(err.message)
        setStatus('error')
        return
      }
    }

    setStatus('done')
    setTimeout(() => {
      onDone({
        sections: generated,
        song: generated.map(s => `[${s.type.toUpperCase()}]\n${s.lyrics}`).join('\n\n'),
        metadata: {
          archetype:   persona.archetype,
          coreMessage: message.coreMessage,
          language:    persona.languageMix,
          structure:   structure.conflictType,
        },
      })
    }, 1200)
  }

  const total    = structure.sections.length
  const progress = status === 'done' ? 100 : Math.round((sections.length / total) * 100)

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.statusDot} data-status={status} />
          <div>
            <h2 className={styles.title}>
              {status === 'done' ? 'Song Complete ✓' : 'Composing Your Song…'}
            </h2>
            <p className={styles.subtitle}>
              {status === 'done'
                ? `${total} sections generated`
                : `Writing section ${Math.min(currentIdx + 1, total)} of ${total} — ${structure.sections[currentIdx]?.type}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Section pills */}
        <div className={styles.pills}>
          {structure.sections.map((s, i) => (
            <div
              key={i}
              className={[
                styles.pill,
                i < sections.length  ? styles.pillDone    : '',
                i === currentIdx && status === 'generating' ? styles.pillActive : '',
              ].join(' ')}
              style={{ '--c': SECTION_COLORS[s.type] || '#7c3aed' }}
            >
              {s.type}
            </div>
          ))}
        </div>

        {/* Live lyrics stream */}
        <div className={styles.lyricsStream}>
          {sections.map((section, i) => (
            <div key={i} className={styles.sectionBlock}>
              <div className={styles.sectionLabel}
                style={{ color: SECTION_COLORS[section.type] || '#7c3aed' }}>
                ▸ {section.type.toUpperCase()}
              </div>
              <pre className={styles.lyrics}>{section.lyrics}</pre>
            </div>
          ))}

          {status === 'generating' && (
            <div className={styles.writingIndicator}>
              <span className={styles.writingDot} />
              <span className={styles.writingDot} />
              <span className={styles.writingDot} />
            </div>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            <strong>Generation failed:</strong> {error}
            <p className={styles.errorHint}>Check your API key and that the backend server is running.</p>
          </div>
        )}
      </div>
    </div>
  )
}
