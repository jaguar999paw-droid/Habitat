/**
 * JournalPage.jsx — SCI Identity Journal
 *
 * Tier 1: Rapid Capture — confrontational prompts + timed free-write + emotion tags
 * Tier 2: Synthesis — AI reads last 7 entries → returns Cockpit pre-fill
 *
 * Props:
 *   onContinue(preFill)  — passes synthesis result to App → Cockpit
 *   onSkip()             — skip directly to Cockpit with no pre-fill
 */
import { useState, useEffect, useRef } from 'react'
import styles from './JournalPage.module.css'
import SuggestiveEditor from '../components/SuggestiveEditor'

const STORAGE_KEY = 'sci_journal_entries'

const PROMPTS = [
  { q: 'Who are you NOT?',            sub: 'Rejection clarifies essence. Start with what you refuse to be.' },
  { q: 'What are you carrying?',      sub: 'Name the weight. Don\'t explain it yet — just name it.' },
  { q: 'When did you become this?',   sub: 'A moment, a year, an age. When did this version of you arrive?' },
  { q: 'Where does it hurt?',         sub: 'Not metaphorically. Actually. What part of you is tender right now?' },
  { q: 'Why is this yours to carry?', sub: 'Who gave it to you? Did you choose it, or was it chosen for you?' },
  { q: 'How do you defend yourself?', sub: 'What is the armor? The deflection? The performance?' },
  { q: 'What would you say if no one could hear?', sub: 'Write it. No one can hear this but the engine.' },
]

const EMOTION_TAGS = [
  { label: '🔥 Rage',      key: 'rage' },
  { label: '💔 Sadness',   key: 'sadness' },
  { label: '💪 Defiance',  key: 'defiance' },
  { label: '🌿 Peace',     key: 'peace' },
  { label: '❓ Confusion', key: 'confusion' },
  { label: '✨ Hope',      key: 'hope' },
  { label: '🖤 Shame',     key: 'shame' },
  { label: '🌊 Longing',   key: 'longing' },
]

const DURATIONS = [5, 10, 15]

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveEntries(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-30))) } catch {}
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function JournalPage({ onContinue, onSkip }) {
  const [entries,      setEntries]      = useState(() => loadEntries())
  const [text,         setText]         = useState('')
  const [emotions,     setEmotions]     = useState([])
  const [promptIdx,    setPromptIdx]    = useState(() => Math.floor(Math.random() * PROMPTS.length))
  const [duration,     setDuration]     = useState(10)
  const [timerSecs,    setTimerSecs]    = useState(null)   // null = not started
  const [timerRunning, setTimerRunning] = useState(false)
  const [view,         setView]         = useState('write') // 'write' | 'history'
  const [synthesizing, setSynthesizing] = useState(false)
  const [synthResult,  setSynthResult]  = useState(null)
  const [saved,        setSaved]        = useState(false)
  const intervalRef = useRef(null)
  const textareaRef = useRef(null)
  const [focusMode, setFocusMode] = useState(false)

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerRunning) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) { clearInterval(intervalRef.current); setTimerRunning(false); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [timerRunning])

  function startTimer() {
    setTimerSecs(duration * 60)
    setTimerRunning(true)
    setSaved(false)
    textareaRef.current?.focus()
  }

  function toggleEmotion(key) {
    setEmotions(prev => prev.includes(key) ? prev.filter(e => e !== key) : [...prev, key])
  }

  function saveEntry() {
    if (!text.trim()) return
    const entry = { text: text.trim(), emotions, timestamp: Date.now(), promptIdx }
    const updated = [...entries, entry]
    setEntries(updated)
    saveEntries(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function synthesize() {
    const toSend = entries.length ? entries : [{ text: text.trim(), emotions, timestamp: Date.now(), promptIdx }]
    if (!toSend.some(e => e.text?.trim())) return

    setSynthesizing(true)
    setSynthResult(null)
    try {
      const apiKey  = localStorage.getItem('sci_api_key') || ''
      const provider = localStorage.getItem('sci_provider') || 'claude'
      const res = await fetch('http://localhost:3001/api/journal/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: toSend, apiKey, provider }),
      })
      const data = await res.json()
      setSynthResult(data)
    } catch (e) {
      setSynthResult({ error: 'Synthesis failed — backend running?' })
    }
    setSynthesizing(false)
  }

  function nextPrompt() {
    setPromptIdx(i => (i + 1) % PROMPTS.length)
    setText('')
    setEmotions([])
    setTimerSecs(null)
    setTimerRunning(false)
    setSaved(false)
    setSynthResult(null)
  }

  const prompt = PROMPTS[promptIdx]
  const mins = timerSecs !== null ? Math.floor(timerSecs / 60) : duration
  const secs = timerSecs !== null ? timerSecs % 60 : 0
  const timerDone = timerSecs === 0

  return (
    <div className={styles.page}>
      <div className={styles.layout}>

        {/* ── Left rail: nav + history ─────────────────────────────────── */}
        <div className={styles.rail}>
          <div className={styles.railHeader}>
            <span className={styles.railTitle}>JOURNAL</span>
            <span className={styles.railSub}>{entries.length} entr{entries.length === 1 ? 'y' : 'ies'}</span>
          </div>

          <div className={styles.railTabs}>
            <button className={[styles.railTab, view === 'write'   ? styles.railTabActive : ''].join(' ')} onClick={() => setView('write')}>Write</button>
            <button className={[styles.railTab, view === 'history' ? styles.railTabActive : ''].join(' ')} onClick={() => setView('history')}>History</button>
          </div>

          {view === 'history' && (
            <div className={styles.historyList}>
              {entries.length === 0 && <p className={styles.emptyNote}>No entries yet.</p>}
              {[...entries].reverse().slice(0, 10).map((e, i) => (
                <div key={i} className={styles.historyCard}>
                  <p className={styles.historyDate}>{formatDate(e.timestamp)}</p>
                  <p className={styles.historyPrompt}>{PROMPTS[e.promptIdx]?.q}</p>
                  <p className={styles.historyText}>{e.text.slice(0, 120)}{e.text.length > 120 ? '…' : ''}</p>
                  {e.emotions?.length > 0 && (
                    <div className={styles.historyEmotions}>
                      {e.emotions.map(em => <span key={em} className={styles.historyEmoTag}>{EMOTION_TAGS.find(t => t.key === em)?.label || em}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skip / continue actions */}
          <div className={styles.railActions}>
            <button className={styles.skipBtn} onClick={onSkip}>Skip Journal →</button>
          </div>
        </div>

        {/* ── Main write area ──────────────────────────────────────────── */}
        {view === 'write' && (
          <div className={styles.main}>

            {/* Prompt */}
            <div className={styles.promptCard}>
              <span className={styles.promptNum}>{promptIdx + 1} / {PROMPTS.length}</span>
              <h2 className={styles.promptQ}>{prompt.q}</h2>
              <p className={styles.promptSub}>{prompt.sub}</p>
              <button className={styles.nextPromptBtn} onClick={nextPrompt}>↻ Different prompt</button>
            </div>

            {/* Timer controls */}
            <div className={styles.timerRow}>
              <div className={styles.durationPills}>
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    className={[styles.durPill, duration === d ? styles.durActive : ''].join(' ')}
                    onClick={() => { setDuration(d); setTimerSecs(null); setTimerRunning(false) }}
                    disabled={timerRunning}
                  >{d} min</button>
                ))}
              </div>

              {timerSecs === null ? (
                <button className={styles.startBtn} onClick={startTimer}>▶ Start Timer</button>
              ) : (
                <div className={[styles.timerDisplay, timerDone ? styles.timerDone : timerSecs < 60 ? styles.timerLow : ''].join(' ')}>
                  {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
                  {timerDone && <span className={styles.timerDoneLabel}> ✓ TIME</span>}
                </div>
              )}
            </div>

            {/* Emotion tags */}
            <div className={styles.emotionRow}>
              <span className={styles.emotionLabel}>TAG WHILE WRITING →</span>
              {EMOTION_TAGS.map(t => (
                <button
                  key={t.key}
                  className={[styles.emoTag, emotions.includes(t.key) ? styles.emoTagActive : ''].join(' ')}
                  onClick={() => toggleEmotion(t.key)}
                >{t.label}</button>
              ))}
            </div>

            {/* Write area — NLP-powered suggestive editor */}
            <SuggestiveEditor
              value={text}
              onChange={setText}
              placeholder="Start writing. Don't edit. Don't judge. Just let it out..."
              label="JOURNAL ENTRY"
              rows={10}
              showSpectrum={true}
              showMirror={true}
              showNextLines={true}
              focusable={true}
            />

            <div className={styles.writeFooter}>
              <span className={styles.wordCount}>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>

              <div className={styles.writeActions}>
                <button
                  className={[styles.saveBtn, saved ? styles.saveDone : ''].join(' ')}
                  onClick={saveEntry}
                  disabled={!text.trim()}
                >
                  {saved ? '✓ Saved' : '⬡ Save Entry'}
                </button>

                <button
                  className={styles.synthBtn}
                  onClick={synthesize}
                  disabled={synthesizing || (!text.trim() && entries.length === 0)}
                >
                  {synthesizing ? '◌ Synthesizing…' : `⊕ Synthesize${entries.length > 0 ? ` (${Math.min(entries.length, 7)} entries)` : ''}`}
                </button>
              </div>
            </div>

            {/* Synthesis result */}
            {synthResult && !synthResult.error && (
              <div className={styles.synthCard}>
                <div className={styles.synthHeader}>
                  <span className={styles.synthTitle}>◈ IDENTITY SYNTHESIS</span>
                  <span className={styles.synthMeta}>{synthResult.method === 'ai' ? '✦ AI' : '◎ Rule-based'} · {synthResult.entryCount} entr{synthResult.entryCount === 1 ? 'y' : 'ies'}</span>
                </div>

                <div className={styles.synthGrid}>
                  <div className={styles.synthField}>
                    <span className={styles.synthFieldLabel}>ARCHETYPE</span>
                    <span className={styles.synthArchetype}>{synthResult.archetype}</span>
                  </div>
                  <div className={styles.synthField}>
                    <span className={styles.synthFieldLabel}>DOMINANT EMOTION</span>
                    <span className={styles.synthEmotion}>{synthResult.dominantEmotion}</span>
                  </div>
                </div>

                {synthResult.mainIdea && (
                  <div className={styles.synthSection}>
                    <span className={styles.synthFieldLabel}>MAIN IDEA →</span>
                    <p className={styles.synthText}>{synthResult.mainIdea}</p>
                  </div>
                )}
                {synthResult.emotionalTruth && (
                  <div className={styles.synthSection}>
                    <span className={styles.synthFieldLabel}>EMOTIONAL TRUTH →</span>
                    <p className={styles.synthText}>{synthResult.emotionalTruth}</p>
                  </div>
                )}
                {synthResult.socialConflict && (
                  <div className={styles.synthSection}>
                    <span className={styles.synthFieldLabel}>SOCIAL CONFLICT →</span>
                    <p className={styles.synthText}>{synthResult.socialConflict}</p>
                  </div>
                )}
                {synthResult.hookSuggestion && (
                  <div className={styles.synthSection}>
                    <span className={styles.synthFieldLabel}>HOOK CANDIDATE →</span>
                    <p className={[styles.synthText, styles.synthHook].join(' ')}>"{synthResult.hookSuggestion}"</p>
                  </div>
                )}
                {synthResult.subThemes?.length > 0 && (
                  <div className={styles.synthSection}>
                    <span className={styles.synthFieldLabel}>SUB-THEMES</span>
                    <div className={styles.synthThemes}>
                      {synthResult.subThemes.map((t, i) => <span key={i} className={styles.synthThemeChip}>{t}</span>)}
                    </div>
                  </div>
                )}

                <button
                  className={styles.loadCockpitBtn}
                  onClick={() => onContinue(synthResult)}
                >
                  Load into Cockpit → Continue
                </button>
              </div>
            )}

            {synthResult?.error && (
              <p className={styles.synthErr}>{synthResult.error}</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
