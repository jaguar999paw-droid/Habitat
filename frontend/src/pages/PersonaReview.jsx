/** @deprecated — replaced by CockpitPreview.jsx in v2. Do not route here. */
/**
 * PersonaReview.jsx
 * Sends answers to /api/analyze, displays persona + structure, then proceeds to generation.
 */
import { useState, useEffect } from 'react'
import PersonaCard   from '../components/PersonaCard'
import StructurePlan from '../components/StructurePlan'
import styles        from './PersonaReview.module.css'

export default function PersonaReview({ answers, onAnalysis }) {
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [data,    setData]    = useState(null)

  useEffect(() => {
    async function analyze() {
      try {
        const res = await fetch('/api/analyze', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ answers }),
        })
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    analyze()
  }, [answers])

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Parsing your identity…</p>
    </div>
  )

  if (error) return (
    <div className={styles.error}>
      <p>⚠ Could not reach the engine server.</p>
      <p className={styles.errorNote}>Make sure the backend is running: <code>cd backend && npm start</code></p>
      <p className={styles.errorDetail}>{error}</p>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Persona</h2>
          <p className={styles.subtitle}>
            The engine has read your answers and built a creative identity.
            Review before generating your song.
          </p>
        </div>

        <PersonaCard   persona={data.persona} message={data.message} />
        <StructurePlan structure={data.structure} />

        {/* Style preview */}
        <div className={styles.styleBox}>
          <div className={styles.styleTitle}>Song Style</div>
          <div className={styles.styleGrid}>
            <StyleChip label="Rhyme" value={data.style.rhymeScheme} />
            <StyleChip label="Flow"  value={data.style.flowStyle.split('—')[0].trim()} />
            <StyleChip label="Hook"  value={data.style.hookStyle} />
            <StyleChip label="Devices" value={data.style.lyricalDevices.join(', ')} />
          </div>
        </div>

        <button
          className={styles.generateBtn}
          onClick={() => onAnalysis(data)}
        >
          Generate My Song →
        </button>
      </div>
    </div>
  )
}

function StyleChip({ label, value }) {
  return (
    <div className={styles.styleChip}>
      <span className={styles.styleLabel}>{label}</span>
      <span className={styles.styleValue}>{value}</span>
    </div>
  )
}
