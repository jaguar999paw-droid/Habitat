/**
 * HookBookPanel.jsx — Lyric analysis side drawer
 *
 * Tabs:
 *   ANALYZE  — full coherence + rhyme scheme + devices + syllables for any section
 *   RHYMES   — perfect + near rhymes lookup for any word
 *   SYNONYMS — songwriting synonym suggestions
 *   GRAMMAR  — grammar flag check for a section
 *
 * Props:
 *   open      {boolean}  — whether drawer is visible
 *   onClose   {fn}       — close handler
 *   sections  {Array}    — song sections [{type, lyrics}]
 */
import { useState } from 'react'
import styles from './HookBookPanel.module.css'

const API = 'http://localhost:3001/api/hookbook'

const TABS = ['ANALYZE', 'RHYMES', 'SYNONYMS', 'GRAMMAR']

// ── helpers ────────────────────────────────────────────────────────────────
async function post(endpoint, body) {
  const res = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

// ── sub-panels ──────────────────────────────────────────────────────────────

function AnalyzeTab({ sections }) {
  const [selIdx,   setSelIdx]   = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [err,      setErr]      = useState('')

  async function run() {
    const lyrics = sections[selIdx]?.lyrics
    if (!lyrics) return
    setLoading(true); setErr(''); setResult(null)
    try {
      const lines = lyrics.split('\n').filter(Boolean)
      const data  = await post('analyze', { lines })
      setResult(data)
    } catch (e) { setErr('Backend error — is the ML service running?') }
    finally { setLoading(false) }
  }

  const section = sections[selIdx]
  return (
    <div className={styles.tabBody}>
      <div className={styles.row}>
        <select
          className={styles.select}
          value={selIdx}
          onChange={e => { setSelIdx(+e.target.value); setResult(null) }}
        >
          {sections.map((s, i) => (
            <option key={i} value={i}>{s.type.toUpperCase()} {i + 1}</option>
          ))}
        </select>
        <button className={styles.runBtn} onClick={run} disabled={loading}>
          {loading ? '…' : '▶ Run'}
        </button>
      </div>

      {section && (
        <pre className={styles.lyricsPreview}>{section.lyrics}</pre>
      )}

      {err && <p className={styles.errMsg}>{err}</p>}

      {result && (
        <div className={styles.results}>

          {/* Coherence score */}
          {result.coherence && (
            <div className={styles.scoreCard}>
              <span className={styles.scoreLabel}>COHERENCE</span>
              <span
                className={styles.scoreBig}
                style={{ color: result.coherence.score >= 70 ? 'var(--green)' : result.coherence.score >= 45 ? 'var(--warning)' : 'var(--magenta)' }}
              >{result.coherence.score}/100</span>
              <ul className={styles.noteList}>
                {result.coherence.notes?.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}

          {/* Rhyme scheme */}
          {result.coherence?.scheme && (
            <div className={styles.pill}>
              <span className={styles.pillLabel}>RHYME SCHEME</span>
              <span className={styles.pillValue}>{result.coherence.scheme}</span>
            </div>
          )}

          {/* Devices */}
          {result.devices && (
            <div className={styles.devicesBlock}>
              <p className={styles.blockLabel}>LITERARY DEVICES</p>
              {Object.entries(result.devices).map(([device, hits]) =>
                hits?.length > 0 && (
                  <div key={device} className={styles.deviceRow}>
                    <span className={styles.deviceName}>{device}</span>
                    <span className={styles.deviceCount}>{hits.length}×</span>
                    <span className={styles.deviceDetail}>
                      {hits.map(h => h.words?.join(', ') || h.word || '').filter(Boolean).slice(0,3).join(' / ')}
                    </span>
                  </div>
                )
              )}
              {!Object.values(result.devices).some(v => v?.length > 0) && (
                <span className={styles.none}>None detected</span>
              )}
            </div>
          )}

          {/* Syllable counts */}
          {result.syllables && (
            <div className={styles.syllablesBlock}>
              <p className={styles.blockLabel}>SYLLABLES PER LINE</p>
              {result.syllables.map((row, i) => (
                <div key={i} className={styles.sylRow}>
                  <span className={styles.sylCount}>{row.total}</span>
                  <span className={styles.sylLine}>{row.line}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stress / meter */}
          {result.stress?.map && (
            <div className={styles.stressBlock}>
              <p className={styles.blockLabel}>STRESS / METER</p>
              {result.stress.map((row, i) => (
                <div key={i} className={styles.stressRow}>
                  <span className={styles.stressMeter}>{row.meter}</span>
                  <span className={styles.stressPattern}>{row.pattern}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RhymesTab() {
  const [word,     setWord]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [err,      setErr]      = useState('')

  async function run() {
    if (!word.trim()) return
    setLoading(true); setErr(''); setResult(null)
    try {
      const data = await post('rhymes', { word: word.trim() })
      setResult(data)
    } catch { setErr('Backend error') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.tabBody}>
      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="e.g. fire"
          value={word}
          onChange={e => setWord(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
        />
        <button className={styles.runBtn} onClick={run} disabled={loading || !word.trim()}>
          {loading ? '…' : '▶'}
        </button>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}

      {result && (
        <div className={styles.results}>
          <div className={styles.rhymeSection}>
            <p className={styles.blockLabel}>PERFECT RHYMES <span className={styles.cnt}>{result.perfect?.length || 0}</span></p>
            <div className={styles.swatchGrid}>
              {result.perfect?.length ? result.perfect.map((w,i) => (
                <span key={i} className={styles.swatchGreen}>{w}</span>
              )) : <span className={styles.none}>none found</span>}
            </div>
          </div>
          <div className={styles.rhymeSection}>
            <p className={styles.blockLabel}>NEAR RHYMES <span className={styles.cnt}>{result.near?.length || 0}</span></p>
            <div className={styles.swatchGrid}>
              {result.near?.length ? result.near.map((w,i) => (
                <span key={i} className={styles.swatchMagenta}>{w}</span>
              )) : <span className={styles.none}>none found</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SynonymsTab() {
  const [word,    setWord]    = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [err,     setErr]     = useState('')

  async function run() {
    if (!word.trim()) return
    setLoading(true); setErr(''); setResult(null)
    try {
      const data = await post('synonyms', { word: word.trim() })
      setResult(data)
    } catch { setErr('Backend error') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.tabBody}>
      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="e.g. love, pain, fire…"
          value={word}
          onChange={e => setWord(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
        />
        <button className={styles.runBtn} onClick={run} disabled={loading || !word.trim()}>
          {loading ? '…' : '▶'}
        </button>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}

      {result && (
        <div className={styles.results}>
          <p className={styles.blockLabel}>SONGWRITING SYNONYMS FOR <em>{word}</em></p>
          <div className={styles.swatchGrid}>
            {result.synonyms?.length ? result.synonyms.map((w, i) => (
              <span key={i} className={styles.swatchGreen}>{w}</span>
            )) : <span className={styles.none}>No synonyms in dictionary for that word. Try: love, pain, fire, hope, lost, run…</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function GrammarTab({ sections }) {
  const [selIdx,   setSelIdx]   = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [err,      setErr]      = useState('')

  async function run() {
    const lyrics = sections[selIdx]?.lyrics
    if (!lyrics) return
    setLoading(true); setErr(''); setResult(null)
    try {
      const data = await post('grammar', { text: lyrics, artistic_mode: true })
      setResult(data)
    } catch { setErr('Backend error') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.tabBody}>
      <div className={styles.row}>
        <select
          className={styles.select}
          value={selIdx}
          onChange={e => { setSelIdx(+e.target.value); setResult(null) }}
        >
          {sections.map((s, i) => (
            <option key={i} value={i}>{s.type.toUpperCase()} {i + 1}</option>
          ))}
        </select>
        <button className={styles.runBtn} onClick={run} disabled={loading}>
          {loading ? '…' : '▶ Run'}
        </button>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}

      {result && (
        <div className={styles.results}>

          <div className={[styles.pill, result.clean ? styles.pillOk : styles.pillWarn].join(' ')}>
            {result.clean ? '✓ CLEAN — no grammar issues' : `⚠ ${result.flags?.length} flag(s) found`}
          </div>

          {result.flags?.length > 0 && (
            <div className={styles.devicesBlock}>
              <p className={styles.blockLabel}>FLAGS</p>
              {result.flags.map((f, i) => (
                <div key={i} className={styles.flagRow}>
                  <span className={styles.flagCat}>[{f.category}]</span>
                  <span className={styles.flagLine}>{f.line}</span>
                  <span className={styles.flagIssue}>{f.issue}</span>
                </div>
              ))}
            </div>
          )}

          {result.intentional?.length > 0 && (
            <div className={styles.devicesBlock}>
              <p className={styles.blockLabel}>ARTISTIC CHOICES <span className={styles.cnt}>{result.intentional.length}</span></p>
              {result.intentional.map((n, i) => (
                <div key={i} className={styles.noteRow}>
                  <span className={styles.noteGreen}>✓</span>
                  <span className={styles.noteText}>{n.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main panel ──────────────────────────────────────────────────────────────
export default function HookBookPanel({ open, onClose, sections = [] }) {
  const [tab, setTab] = useState(0)

  return (
    <>
      {/* Backdrop */}
      {open && <div className={styles.backdrop} onClick={onClose} />}

      <div className={[styles.drawer, open ? styles.drawerOpen : ''].join(' ')}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>⊕ HOOKBOOK</span>
          <span className={styles.sub}>lyric intelligence</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button
              key={t}
              className={[styles.tab, tab === i ? styles.tabActive : ''].join(' ')}
              onClick={() => setTab(i)}
            >{t}</button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {tab === 0 && <AnalyzeTab  sections={sections} />}
          {tab === 1 && <RhymesTab />}
          {tab === 2 && <SynonymsTab />}
          {tab === 3 && <GrammarTab  sections={sections} />}
        </div>
      </div>
    </>
  )
}
