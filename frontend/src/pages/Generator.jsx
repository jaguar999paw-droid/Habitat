/**
 * Generator.jsx — v2.1
 * Real-time section-by-section generation with:
 * - v2 green/magenta color palette
 * - Animated waveform composing indicator
 * - Section lyrics appear with sectionPop animation
 * - Progress bar with green glow
 */
import { useState, useEffect, useRef } from 'react'
import styles from './Generator.module.css'

const SECTION_COLORS = {
  verse:              'var(--green-dim)',
  hook:               'var(--magenta)',
  'pre-hook':         'var(--warning)',
  bridge:             'var(--green)',
  intro:              'var(--grey-mid)',
  outro:              'var(--text-dim)',
  'spoken-word':      'var(--magenta-dim)',
  'call-and-response':'var(--green)',
}

export default function Generator({ analysis, apiKey, provider, model, onDone }) {
  const { persona, message, structure, style } = analysis
  const [sections,   setSections]   = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [status,     setStatus]     = useState('starting')
  const [error,      setError]      = useState(null)
  const previousRef = useRef([])
  const streamRef   = useRef(null)

  useEffect(() => { generateAll() }, [])

  // Auto-scroll to bottom as lyrics appear
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [sections])

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
            apiKey, provider, model,
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
    }, 1400)
  }

  const total    = structure.sections.length
  const progress = status === 'done' ? 100 : Math.round((sections.length / total) * 100)
  const curSection = structure.sections[currentIdx]

  return (
    <div className={styles.page}>
      <div className={styles.content}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.statusDot} data-status={status} />
          <div className={styles.headerText}>
            <h2 className={styles.title}>
              {status === 'done' ? 'SONG COMPLETE ✓' : 'COMPOSING…'}
            </h2>
            <p className={styles.subtitle}>
              {status === 'done'
                ? `${total} sections excavated`
                : `Section ${Math.min(currentIdx + 1, total)} of ${total} — ${curSection?.type?.toUpperCase()}`}
            </p>
          </div>

          {/* Waveform composing animation */}
          {status === 'generating' && (
            <div className={styles.waveform} aria-hidden="true">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className={styles.waveBar}
                  style={{ animationName: `wave${(i % 5) + 1}`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <span className={styles.progressPct}>{progress}%</span>
        </div>

        {/* Section pills */}
        <div className={styles.pills}>
          {structure.sections.map((s, i) => (
            <div
              key={i}
              className={[
                styles.pill,
                i < sections.length ? styles.pillDone : '',
                i === currentIdx && status === 'generating' ? styles.pillActive : '',
              ].join(' ')}
              style={{ '--c': SECTION_COLORS[s.type] || 'var(--green)' }}
            >
              {s.type}
            </div>
          ))}
        </div>

        {/* Live lyrics stream */}
        <div className={styles.lyricsStream} ref={streamRef}>
          {sections.map((section, i) => (
            <div
              key={i}
              className={styles.sectionBlock}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={styles.sectionLabel}
                style={{ '--c': SECTION_COLORS[section.type] || 'var(--green)' }}
              >
                <span className={styles.sectionDot} />
                {section.type.toUpperCase()}
                <span className={styles.sectionGoalTag}>
                  {section.goal?.replace(/_/g, ' ')}
                </span>
              </div>
              <pre className={styles.lyrics}>{section.lyrics}</pre>
            </div>
          ))}

          {status === 'generating' && (
            <div className={styles.writingIndicator}>
              <div className={styles.writingBars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={styles.writingBar}
                    style={{ animationName: `wave${(i % 5) + 1}`, animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
              <span className={styles.writingText}>writing {curSection?.type}…</span>
            </div>
          )}

          {sections.length === 0 && status === 'generating' && (
            <div className={styles.startingMsg}>
              <div className={styles.startingDot} />
              <span>Engine initializing…</span>
            </div>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            <strong>Generation failed:</strong> {error}
            <p className={styles.errorHint}>
              Verify your API key and that the backend is running on port 3001.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
