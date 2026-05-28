/**
 * SuggestiveEditor.jsx — NLP-powered smart writing area
 *
 * Features:
 *   • Live NLP feedback (debounced 650ms) via /api/hookbook/suggest
 *   • WARN cards  — syllable variance, missing rhymes, short lines (amber/red, animated pop-in)
 *   • ALERT cards — alliteration, anaphora, rhyme scheme (green, animated pop-in)
 *   • Emotion Spectrum — 5-axis animated bars (energy/darkness/vulnerability/defiance/hope)
 *   • Text Magic — decorated mirror div showing rhyme groups + alliteration highlights
 *   • Focus Mode — fullscreen Zen overlay (⛶ toggle / ESC to exit)
 *   • Next-line suggestions panel
 *
 * Props:
 *   value        {string}   — current text
 *   onChange     {fn}       — (newValue) => void
 *   placeholder  {string}   — textarea placeholder
 *   label        {string}   — header label (optional)
 *   apiBase      {string}   — backend base URL (default: http://localhost:3001/api)
 *   rows         {number}   — textarea rows (default: 10)
 *   showSpectrum {boolean}  — show emotion spectrum bars (default: true)
 *   showMirror   {boolean}  — show decorated text mirror (default: true)
 *   showNextLines {boolean} — show next-line suggestions (default: true)
 *   className    {string}   — extra wrapper class
 *   focusable    {boolean}  — enable focus/enlarge mode (default: true)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './SuggestiveEditor.module.css'

const DEFAULT_API = 'http://localhost:3001/api'

const SPECTRUM_LABELS = {
  energy:        { label: 'ENERGY',        color: '#ff4444' },
  defiance:      { label: 'DEFIANCE',      color: '#ff8800' },
  darkness:      { label: 'DARKNESS',      color: '#8844ff' },
  vulnerability: { label: 'VULNERABILITY', color: '#44aaff' },
  hope:          { label: 'HOPE',          color: '#00ff88' },
}

const MAGIC_STYLES = {
  'underline-magenta': { borderBottom: '2px solid #ff00aa', color: '#ff66cc' },
  'underline-cyan':    { borderBottom: '2px solid #00ccff', color: '#66ddff' },
  'underline-amber':   { borderBottom: '2px solid #ffaa00', color: '#ffcc44' },
  'underline-green':   { borderBottom: '2px solid #00ff88', color: '#66ffaa' },
  'underline-blue':    { borderBottom: '2px solid #4488ff', color: '#88aaff' },
  'bold-green':        { fontWeight: '700', color: '#00ff88', textShadow: '0 0 6px #00ff8844' },
}

// ── Decorate lines with textMagic annotations ─────────────────────────────────
function decorateLine(line, lineIdx, textMagic) {
  const anns = (textMagic || [])
    .filter(t => t.lineIndex === lineIdx)
    .sort((a, b) => a.start - b.start)

  if (!anns.length) return <span key={lineIdx}>{line}</span>

  const spans = []
  let pos = 0
  for (const ann of anns) {
    if (ann.start > pos) {
      spans.push(<span key={`p-${pos}`}>{line.slice(pos, ann.start)}</span>)
    }
    const end = Math.min(ann.end, line.length)
    spans.push(
      <span
        key={`a-${ann.start}`}
        style={MAGIC_STYLES[ann.style] || {}}
        title={`${ann.type}${ann.group ? ` (${ann.group})` : ''}`}
      >
        {line.slice(ann.start, end)}
      </span>
    )
    pos = end
  }
  if (pos < line.length) spans.push(<span key={`t-${pos}`}>{line.slice(pos)}</span>)
  return <span key={lineIdx}>{spans}</span>
}

// ── Card badge components ─────────────────────────────────────────────────────
function WarnCard({ warn, onDismiss }) {
  const sev = warn.severity
  const cls = sev === 'high' ? styles.cardHigh : sev === 'medium' ? styles.cardMedium : styles.cardLow
  return (
    <div className={`${styles.card} ${cls}`}>
      <span className={styles.cardIcon}>
        {sev === 'high' ? '⚠' : sev === 'medium' ? '△' : '◦'}
      </span>
      <span className={styles.cardText}>{warn.message}</span>
      <button className={styles.cardX} onClick={onDismiss}>×</button>
    </div>
  )
}

function AlertCard({ alert, onDismiss }) {
  return (
    <div className={`${styles.card} ${styles.cardAlert}`}>
      <span className={styles.cardIcon}>✦</span>
      <span className={styles.cardText}>{alert.message}</span>
      <button className={styles.cardX} onClick={onDismiss}>×</button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SuggestiveEditor({
  value = '',
  onChange,
  placeholder = 'Write your lyrics here...',
  label,
  apiBase = DEFAULT_API,
  rows = 10,
  showSpectrum = true,
  showMirror = true,
  showNextLines = true,
  className = '',
  focusable = true,
}) {
  const [nlp,          setNlp]          = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [dismissedW,   setDismissedW]   = useState(new Set())
  const [dismissedA,   setDismissedA]   = useState(new Set())
  const [focused,      setFocused]      = useState(false)
  const [magicOn,      setMagicOn]      = useState(true)
  const [spectrumOn,   setSpectrumOn]   = useState(showSpectrum)
  const debounceRef    = useRef(null)
  const textareaRef    = useRef(null)

  // ── NLP fetch (debounced) ─────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (text) => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length === 0) { setNlp(null); return }
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/hookbook/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, text }),
      })
      if (res.ok) {
        const data = await res.json()
        setNlp(data)
        setDismissedW(new Set())
        setDismissedA(new Set())
      }
    } catch { /* ML offline — silent */ }
    finally { setLoading(false) }
  }, [apiBase])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 650)
    return () => clearTimeout(debounceRef.current)
  }, [value, fetchSuggestions])

  // ── ESC to exit focus ────────────────────────────────────────────────────
  useEffect(() => {
    if (!focused) return
    const h = (e) => { if (e.key === 'Escape') setFocused(false) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [focused])

  // Focus on textarea when entering focus mode
  useEffect(() => {
    if (focused && textareaRef.current) textareaRef.current.focus()
  }, [focused])

  // ── Render helpers ───────────────────────────────────────────────────────
  const lines        = value.split('\n')
  const textMagic    = nlp?.textMagic || []
  const warns        = (nlp?.warns  || []).filter((_, i) => !dismissedW.has(i))
  const alerts       = (nlp?.alerts || []).filter((_, i) => !dismissedA.has(i))
  const spectrum     = nlp?.spectrum || {}
  const nextLines    = nlp?.nextLines || []

  const toolbar = (
    <div className={styles.toolbar}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.toolbarRight}>
        {loading && <span className={styles.spinner} title="Analyzing..." />}
        <button
          className={`${styles.toolBtn} ${magicOn ? styles.active : ''}`}
          onClick={() => setMagicOn(v => !v)}
          title="Toggle text magic decorations"
        >✦ magic</button>
        {showSpectrum && (
          <button
            className={`${styles.toolBtn} ${spectrumOn ? styles.active : ''}`}
            onClick={() => setSpectrumOn(v => !v)}
            title="Toggle emotion spectrum"
          >≋ spectrum</button>
        )}
        {focusable && (
          <button
            className={`${styles.toolBtn} ${styles.focusBtn}`}
            onClick={() => setFocused(true)}
            title="Enter focus / Zen mode (ESC to exit)"
          >⛶ focus</button>
        )}
      </div>
    </div>
  )

  const editorBody = (isFocus = false) => (
    <div className={`${styles.editorWrap} ${isFocus ? styles.editorFocus : ''}`}>
      <textarea
        ref={isFocus ? textareaRef : undefined}
        className={styles.textarea}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={isFocus ? 22 : rows}
        spellCheck={false}
      />

      {/* Text Magic Mirror */}
      {magicOn && showMirror && textMagic.length > 0 && (
        <div className={styles.mirror} aria-hidden="true">
          {lines.map((line, i) => (
            <div key={i} className={styles.mirrorLine}>
              {decorateLine(line, i, textMagic)}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const feedback = (isFocus = false) => (
    <div className={`${styles.feedback} ${isFocus ? styles.feedbackFocus : ''}`}>

      {/* WARN cards */}
      {warns.length > 0 && (
        <div className={styles.cardGroup}>
          {warns.map((w, i) => (
            <WarnCard key={i} warn={w} onDismiss={() => setDismissedW(s => new Set([...s, i]))} />
          ))}
        </div>
      )}

      {/* ALERT cards */}
      {alerts.length > 0 && (
        <div className={styles.cardGroup}>
          {alerts.map((a, i) => (
            <AlertCard key={i} alert={a} onDismiss={() => setDismissedA(s => new Set([...s, i]))} />
          ))}
        </div>
      )}

      {/* Emotion Spectrum */}
      {spectrumOn && Object.keys(spectrum).length > 0 && (
        <div className={styles.spectrum}>
          <div className={styles.spectrumLabel}>EMOTION SPECTRUM</div>
          {Object.entries(SPECTRUM_LABELS).map(([key, { label: lbl, color }]) => (
            <div key={key} className={styles.spectrumRow}>
              <span className={styles.spectrumKey} style={{ color }}>{lbl}</span>
              <div className={styles.spectrumTrack}>
                <div
                  className={styles.spectrumBar}
                  style={{
                    width: `${spectrum[key] || 0}%`,
                    background: color,
                    boxShadow: `0 0 6px ${color}66`,
                  }}
                />
              </div>
              <span className={styles.spectrumVal}>{spectrum[key] || 0}</span>
            </div>
          ))}
        </div>
      )}

      {/* Next-line suggestions */}
      {showNextLines && nextLines.length > 0 && (
        <div className={styles.nextLines}>
          <div className={styles.nextLinesLabel}>↳ CONTINUE WITH</div>
          {nextLines.map((line, i) => (
            <button
              key={i}
              className={styles.nextLine}
              onClick={() => {
                const newVal = value.trimEnd() + '\n' + line
                onChange?.(newVal)
              }}
              title="Click to append this line"
            >
              {line}
            </button>
          ))}
        </div>
      )}

      {/* Syllable counts inline */}
      {nlp?.syllables && nlp.syllables.length > 0 && (
        <div className={styles.syllables}>
          <div className={styles.syllablesLabel}>SYLLABLES</div>
          {nlp.syllables.map((row, i) => (
            <div key={i} className={styles.sylRow}>
              <span className={styles.sylCount}>{row.total}</span>
              <span className={styles.sylLine}>{row.line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Focus mode overlay ───────────────────────────────────────────────────
  if (focused) {
    return (
      <>
        {/* Normal position — invisible placeholder */}
        <div className={`${styles.wrapper} ${className}`} style={{ visibility: 'hidden', pointerEvents: 'none' }}>
          {toolbar}
          {editorBody()}
        </div>

        {/* Fullscreen overlay */}
        <div className={styles.overlay}>
          <div className={styles.overlayInner}>
            <div className={styles.overlayHeader}>
              {label && <span className={styles.overlayLabel}>{label}</span>}
              <span className={styles.overlayHint}>ESC to exit focus</span>
              <button className={styles.closeOverlay} onClick={() => setFocused(false)}>✕ exit focus</button>
            </div>

            <div className={styles.overlayBody}>
              <div className={styles.overlayLeft}>
                {editorBody(true)}
              </div>
              <div className={styles.overlayRight}>
                {feedback(true)}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Normal (inline) mode ─────────────────────────────────────────────────
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {toolbar}
      <div className={styles.body}>
        <div className={styles.editorCol}>
          {editorBody()}
        </div>
        <div className={styles.feedbackCol}>
          {feedback()}
        </div>
      </div>
    </div>
  )
}
