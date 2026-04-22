/**
 * CockpitHub.jsx — SCI v3 Unified Non-Sequential Cockpit
 *
 * Philosophy:
 *   - All input zones visible simultaneously. No forced sequence.
 *   - Optional panels (Hook Book, Journal, Manual Config, Studio) open as drawers.
 *   - Duality mode: every field has a shadow "what not" counterpart.
 *   - The interface is a studio, not a questionnaire.
 *   - Spiritual micro-copy scattered throughout — the engine knows it's excavating souls.
 *
 * Architecture:
 *   LEFT     — Optional panel toggles + active panel drawer
 *   CENTER   — Core input zone + craft controls (always visible)
 *   RIGHT    — Live persona preview + identity radar (collapsible)
 *   BOTTOM   — Session status + IGNITE
 *
 * Replaces: Cockpit.jsx (4-phase sequential flow)
 * Panels replace: JournalPage.jsx, HookWorksheet.jsx
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import PersonaLiveBar    from '../components/PersonaLiveBar'
import ArchetypeGrid     from '../components/ArchetypeGrid'
import KnobSlider        from '../components/KnobSlider'
import LanguageToggle    from '../components/LanguageToggle'
import RhymeSwatch       from '../components/RhymeSwatch'
import ThemeChips        from '../components/ThemeChips'
import ReferenceDropZone from '../components/ReferenceDropZone'
import EmotionGrid       from '../components/EmotionGrid'
import IdentitySliders   from '../components/IdentitySliders'
import IdentityRadar     from '../components/IdentityRadar'
import InferencePreview  from '../components/InferencePreview'
import DualityInput      from '../components/DualityInput'
import styles            from './CockpitHub.module.css'

const PERSIST_KEY = 'sci_cockpit_hub_v1'
const BACKEND     = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// ── Spiritual/philosophical micro-copy ──────────────────────────────────────
const SPIRIT_PROMPTS = [
  'The song you haven\'t written yet already exists. You\'re just finding it.',
  'What you refuse to say is the most important thing in this song.',
  'The wound you\'re circling is the song\'s center.',
  'Your ordinary life contains extraordinary material. Trust it.',
  'Every contradiction you hold is a song waiting to be born.',
  'What would you write if no one was going to hear it?',
  'The duality is not a problem. It IS the song.',
  'Mtu ni watu — your identity is relational. Who is missing from this story?',
  'The ancestors speak through artists willing to be honest.',
  'What version of yourself are you writing FROM?',
]

const ALTER_EGO_OPTIONS = [
  { value: 'none',               label: 'None (raw self)' },
  { value: 'the_confessor',      label: 'The Confessor' },
  { value: 'the_witness',        label: 'The Witness' },
  { value: 'the_trickster',      label: 'The Trickster' },
  { value: 'the_preacher',       label: 'The Preacher' },
  { value: 'the_ghost',          label: 'The Ghost' },
  { value: 'the_street_philosopher', label: 'Street Philosopher' },
  { value: 'the_oracle',         label: 'The Oracle' },
]

// ── Optional panel definitions ────────────────────────────────────────────────
const PANELS = [
  { id: 'hookbook',   label: 'Hook Book',    icon: '◈', desc: 'Drafts · Rhyme · Word work · Borrowed lines' },
  { id: 'journal',    label: 'Journal',      icon: '◉', desc: 'Persona · Message · Poetry · Questionnaire' },
  { id: 'studio',     label: 'Studio',       icon: '▶', desc: 'Cypher · Battle · Lyric analysis · Juxtapose' },
  { id: 'manualcfg',  label: 'Config',       icon: '⚙', desc: 'PIRE · Duality · Identity deep-config' },
]

// ── Default state ─────────────────────────────────────────────────────────────
function defaultState() {
  return {
    // Core inputs
    mainIdea:       '', mainIdeaShadow:       '',
    emotionalTruth: '', emotionalTruthShadow: '',
    socialConflict: '', socialConflictShadow: '',
    referenceText:  '',
    subThemes:      [],
    // Emotions
    primaryEmotion:    null,
    secondaryEmotions: [],
    // Identity sliders
    identitySliders: { rawness: 55, decisiveness: 45, attribution: 55, vulnerability_level: 50 },
    // Craft
    archetype: null, alterEgo: 'none',
    energy: 65, rhymeScheme: 'ABAB', perspective: '1st', languageMix: ['en'],
    // Hook Book
    hookBookEntries: [], roughDraft: '', borrowedLine: '', rhymeNotes: '',
    // Journal
    journalEntries: [], currentJournalEntry: '',
    // Studio
    studioMode: null, // 'cypher' | 'battle' | 'analyze' | 'juxtapose'
    cipherTheme: '', cipherBars: 16,
    battleClaim: '', battleOpponentVerse: '', battleRole: 'opener',
    analysisLyrics: '',
    juxtaposeA: '', juxtaposeB: '',
    // Duality
    dualityMode: false,
    // Spiritual
    spiritualPromptIdx: 0,
  }
}

function buildRadarValues(parsed, sliders) {
  if (!parsed) return { pastActual:50,pastAlt:50,presentActual:50,presentAlt:50,futureProjected:50,futureAlt:50 }
  const tp = parsed.temporalProfile || {}
  const t  = tp.temporal || {}
  const cs = Math.round((tp.conflictScore || 0) * 100)
  const pw = Math.round((t.past    || 0.33) * 100)
  const ew = Math.round((t.present || 0.33) * 100)
  const fw = Math.round((t.future  || 0.33) * 100)
  const attr = sliders.attribution  ?? 50
  const cert = sliders.decisiveness ?? 50
  return {
    pastActual:      Math.round(pw * (attr / 100)),
    pastAlt:         Math.round(pw * (1 - attr / 100)),
    presentActual:   Math.round(ew * (cert / 100)),
    presentAlt:      Math.round(ew * (1 - cert / 100)),
    futureProjected: Math.round(fw * ((100 - cs) / 100)),
    futureAlt:       Math.round(fw * (cs / 100)),
  }
}

function wc(str) { return str.trim() ? str.trim().split(/\s+/).length : 0 }

// ── Health indicator ──────────────────────────────────────────────────────────
function HealthDot() {
  const [health, setHealth] = useState(null)
  useEffect(() => {
    fetch(`${BACKEND}/api/health`, { signal: AbortSignal.timeout(1500) })
      .then(r => r.json())
      .then(d => setHealth(d.status === 'ok' ? (d.mlService === 'ok' ? 'ok' : 'warn') : 'down'))
      .catch(() => setHealth('down'))
  }, [])
  if (!health) return null
  return (
    <span className={[styles.healthDot, styles['health_' + health]].join(' ')}
      title={health === 'ok' ? 'Engine + ML online' : health === 'warn' ? 'Engine online · ML offline' : 'Engine offline'} />
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// PANEL: HOOK BOOK
// ═════════════════════════════════════════════════════════════════════════════
function HookBookPanel({ s, upd }) {
  const [tab, setTab] = useState('draft') // draft | rhyme | borrowed | notes

  return (
    <div className={styles.panelContent}>
      <div className={styles.panelMeta}>All syntactical, grammatical, rough work — your creative lab</div>
      <div className={styles.miniTabs}>
        {['draft','rhyme','borrowed','notes'].map(t => (
          <button key={t} className={[styles.miniTab, tab === t ? styles.miniTabActive : ''].join(' ')} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'draft' && (
        <div className={styles.panelSection}>
          <div className={styles.fieldLabel}>ROUGH DRAFT</div>
          <textarea className={styles.panelTextarea} rows={8}
            placeholder="Dump everything here. Unformed ideas, half-lines, phrases that feel right before they're right. This is sacred space — no judgment."
            value={s.roughDraft} onChange={e => upd({ roughDraft: e.target.value })} />
          <div className={styles.wc}>{wc(s.roughDraft)}w</div>
        </div>
      )}
      {tab === 'rhyme' && (
        <div className={styles.panelSection}>
          <div className={styles.fieldLabel}>RHYME PSYCHOLOGY</div>
          <textarea className={styles.panelTextarea} rows={6}
            placeholder="Word clusters, near-rhymes, multi-syllabic chains, internal rhyme patterns. Map the sound before you build the meaning."
            value={s.rhymeNotes} onChange={e => upd({ rhymeNotes: e.target.value })} />
          <div className={styles.fieldLabel} style={{marginTop:12}}>RHYME SCHEME IDEAS</div>
          <RhymeSwatch value={s.rhymeScheme} onChange={r => upd({ rhymeScheme: r })} />
        </div>
      )}
      {tab === 'borrowed' && (
        <div className={styles.panelSection}>
          <div className={styles.fieldLabel}>BORROWED LINE / REFERENCE</div>
          <textarea className={styles.panelTextarea} rows={4}
            placeholder="A line from another song that FEELS like what you're trying to say. A quote. A bar that lives rent-free. Borrow to understand, then build your own."
            value={s.borrowedLine} onChange={e => upd({ borrowedLine: e.target.value })} />
          <div className={styles.fieldLabel} style={{marginTop:12}}>REFERENCE LYRICS</div>
          <ReferenceDropZone value={s.referenceText} onChange={t => upd({ referenceText: t })} />
        </div>
      )}
      {tab === 'notes' && (
        <div className={styles.panelSection}>
          <div className={styles.fieldLabel}>HOOK BOOK ENTRIES</div>
          <textarea className={styles.panelTextarea} rows={8}
            placeholder="Hook candidates. Title candidates. That one phrase that's been stuck in your head for three days. Everything worth keeping."
            value={s.hookBookEntries.join('\n')}
            onChange={e => upd({ hookBookEntries: e.target.value.split('\n') })} />
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// PANEL: JOURNAL
// ═════════════════════════════════════════════════════════════════════════════
const JOURNAL_PROMPTS = [
  { id: 'origin',   q: 'Where did this begin? Not today — the actual beginning.' },
  { id: 'wound',    q: 'What hurt you in a way that didn\'t go away?' },
  { id: 'power',    q: 'What do you know that they don\'t?' },
  { id: 'secret',   q: 'What truth do you hold that you haven\'t said out loud yet?' },
  { id: 'refusal',  q: 'What are you refusing to become, even now?' },
  { id: 'becoming', q: 'Who are you in the middle of becoming?' },
  { id: 'genz',     q: 'What\'s the thought you\'re scared to post?' },
  { id: 'era',      q: 'What era of your life are you still not over?' },
  { id: 'vibe',     q: 'Describe the vibe you\'re building — without naming a genre.' },
]

function JournalPanel({ s, upd, apiKey, provider }) {
  const [activePrompt, setActivePrompt] = useState(null)
  const [synthesizing, setSynthesizing] = useState(false)
  const [synthesis, setSynthesis] = useState(null)

  async function synthesize() {
    if (!s.journalEntries.length && !s.currentJournalEntry.trim()) return
    setSynthesizing(true)
    const entries = [
      ...s.journalEntries,
      ...(s.currentJournalEntry.trim() ? [{ text: s.currentJournalEntry, emotions: [] }] : []),
    ]
    try {
      const r = await fetch(`${BACKEND}/api/journal/synthesize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, apiKey, provider }),
      })
      const d = await r.json()
      setSynthesis(d)
    } catch (e) { console.warn('Synthesis failed:', e) }
    setSynthesizing(false)
  }

  function applyToMain() {
    if (!synthesis) return
    upd({
      mainIdea:       synthesis.mainIdea       || '',
      emotionalTruth: synthesis.emotionalTruth  || '',
      socialConflict: synthesis.socialConflict  || '',
      primaryEmotion: synthesis.dominantEmotion || null,
      subThemes:      synthesis.subThemes       || [],
    })
    setSynthesis(null)
  }

  function saveEntry() {
    if (!s.currentJournalEntry.trim()) return
    upd({
      journalEntries: [...s.journalEntries, { text: s.currentJournalEntry, emotions: [], ts: Date.now() }],
      currentJournalEntry: '',
    })
  }

  return (
    <div className={styles.panelContent}>
      <div className={styles.panelMeta}>Message · Tone · Persona exploration · Identity archaeology</div>
      <div className={styles.journalPrompts}>
        {JOURNAL_PROMPTS.map(p => (
          <button key={p.id}
            className={[styles.journalPromptBtn, activePrompt === p.id ? styles.journalPromptActive : ''].join(' ')}
            onClick={() => {
              setActivePrompt(p.id === activePrompt ? null : p.id)
              if (p.id !== activePrompt) upd({ currentJournalEntry: p.q + '\n\n' })
            }}>
            {p.q.slice(0, 42)}…
          </button>
        ))}
      </div>
      <textarea className={styles.panelTextarea} rows={7}
        placeholder="Write freely. This is your excavation space. The engine will synthesize when you're ready."
        value={s.currentJournalEntry}
        onChange={e => upd({ currentJournalEntry: e.target.value })} />
      <div className={styles.journalActions}>
        <button className={styles.smallBtn} onClick={saveEntry}>+ Save Entry</button>
        {s.journalEntries.length > 0 && (
          <span className={styles.entryCount}>{s.journalEntries.length} entr{s.journalEntries.length > 1 ? 'ies' : 'y'} saved</span>
        )}
        <button className={[styles.smallBtn, styles.smallBtnPrimary, synthesizing ? styles.busy : ''].join(' ')}
          onClick={synthesize} disabled={synthesizing || (!s.journalEntries.length && !s.currentJournalEntry.trim())}>
          {synthesizing ? 'SYNTHESIZING...' : apiKey ? 'AI SYNTHESIZE →' : 'SYNTHESIZE (rule-based) →'}
        </button>
      </div>
      {synthesis && (
        <div className={styles.synthesisResult}>
          <div className={styles.synthesisTitle}>◈ SYNTHESIS</div>
          <div className={styles.synthesisRow}><b>Core:</b> {synthesis.mainIdea}</div>
          <div className={styles.synthesisRow}><b>Emotion:</b> {synthesis.dominantEmotion}</div>
          {synthesis.socialConflict && <div className={styles.synthesisRow}><b>Conflict:</b> {synthesis.socialConflict}</div>}
          {synthesis.hookSuggestion && <div className={styles.synthesisRow}><b>Hook idea:</b> {synthesis.hookSuggestion}</div>}
          <button className={[styles.smallBtn, styles.smallBtnPrimary].join(' ')} onClick={applyToMain}>
            ↑ Apply to Main Input
          </button>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// PANEL: STUDIO (Gen-Z)
// ═════════════════════════════════════════════════════════════════════════════
function StudioPanel({ s, upd, apiKey, provider, model }) {
  const [activeMode, setActiveMode] = useState('cypher')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const MODES = [
    { id: 'cypher',    label: '🔥 Cypher',    desc: 'Drop bars. Fast. No overhead.' },
    { id: 'battle',    label: '⚔ Battle',     desc: 'Opener or responder. 8 bars.' },
    { id: 'analyze',   label: '🔬 Analyze',   desc: 'Break down existing lyrics.' },
    { id: 'juxtapose', label: '⊥ Juxtapose', desc: 'Two identities. Find the song.' },
  ]

  async function run() {
    if (!apiKey) { setError('API key required for Studio mode'); return }
    setGenerating(true); setError(null); setResult(null)
    try {
      let endpoint = '/api/studio/cypher', body = {}
      if (activeMode === 'cypher') {
        endpoint = '/api/studio/cypher'
        body = { theme: s.cipherTheme, bars: s.cipherBars, energy: s.energy, rawness: s.identitySliders.rawness, language: s.languageMix, apiKey, provider, model }
      } else if (activeMode === 'battle') {
        endpoint = '/api/studio/battle'
        body = { role: s.battleRole, challengerClaim: s.battleClaim, opponentVerse: s.battleOpponentVerse, bars: 8, apiKey, provider, model }
      } else if (activeMode === 'analyze') {
        endpoint = '/api/studio/analyze-lyrics'
        body = { lyrics: s.analysisLyrics, depth: 'full', apiKey, provider, model }
      } else if (activeMode === 'juxtapose') {
        endpoint = '/api/studio/juxtapose'
        body = { positionA: s.juxtaposeA, positionB: s.juxtaposeB, apiKey, provider, model }
      }
      const r = await fetch(`${BACKEND}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setResult(d)
    } catch (e) { setError(e.message) }
    setGenerating(false)
  }

  return (
    <div className={styles.panelContent}>
      <div className={styles.panelMeta}>Gen-Z studio practice · Cyphers · Battles · Lyric analysis · Identity juxtaposition</div>
      <div className={styles.studioModeTabs}>
        {MODES.map(m => (
          <button key={m.id} className={[styles.studioModeTab, activeMode === m.id ? styles.studioModeTabActive : ''].join(' ')}
            onClick={() => { setActiveMode(m.id); setResult(null) }}>
            {m.label}
          </button>
        ))}
      </div>

      {activeMode === 'cypher' && (
        <div className={styles.studioForm}>
          <div className={styles.fieldLabel}>THEME / CONCEPT (optional)</div>
          <input className={styles.studioInput} placeholder="Leave blank for free freestyle" value={s.cipherTheme} onChange={e => upd({ cipherTheme: e.target.value })} />
          <div className={styles.studioRow}>
            <div><div className={styles.fieldLabel}>BARS</div>
              <select className={styles.studioSelect} value={s.cipherBars} onChange={e => upd({ cipherBars: +e.target.value })}>
                {[8,12,16,24,32].map(n => <option key={n} value={n}>{n} bars</option>)}
              </select>
            </div>
            <div><div className={styles.fieldLabel}>LANGUAGE</div>
              <LanguageToggle value={s.languageMix} onChange={l => upd({ languageMix: l })} />
            </div>
          </div>
        </div>
      )}

      {activeMode === 'battle' && (
        <div className={styles.studioForm}>
          <div className={styles.studioRow}>
            {['opener','responder'].map(r => (
              <button key={r} className={[styles.pill, s.battleRole === r ? styles.pillActive : ''].join(' ')} onClick={() => upd({ battleRole: r })}>
                {r}
              </button>
            ))}
          </div>
          <div className={styles.fieldLabel}>YOUR CLAIM</div>
          <input className={styles.studioInput} placeholder="What are you claiming? 8 words max." value={s.battleClaim} onChange={e => upd({ battleClaim: e.target.value })} />
          {s.battleRole === 'responder' && (
            <>
              <div className={styles.fieldLabel}>OPPONENT'S VERSE</div>
              <textarea className={styles.panelTextarea} rows={4} placeholder="Paste their verse here. You will respond to this." value={s.battleOpponentVerse} onChange={e => upd({ battleOpponentVerse: e.target.value })} />
            </>
          )}
        </div>
      )}

      {activeMode === 'analyze' && (
        <div className={styles.studioForm}>
          <div className={styles.fieldLabel}>LYRICS TO ANALYZE</div>
          <textarea className={styles.panelTextarea} rows={8} placeholder="Paste any lyrics here — your own or someone else's." value={s.analysisLyrics} onChange={e => upd({ analysisLyrics: e.target.value })} />
        </div>
      )}

      {activeMode === 'juxtapose' && (
        <div className={styles.studioForm}>
          <div className={styles.fieldLabel}>IDENTITY POSITION A</div>
          <input className={styles.studioInput} placeholder='e.g. "I am the hardest worker in the room"' value={s.juxtaposeA} onChange={e => upd({ juxtaposeA: e.target.value })} />
          <div className={styles.fieldLabel}>IDENTITY POSITION B</div>
          <input className={styles.studioInput} placeholder='e.g. "I am exhausted and I don\'t know why"' value={s.juxtaposeB} onChange={e => upd({ juxtaposeB: e.target.value })} />
          <div className={styles.dualityNote}>⊥ The song lives between these two positions.</div>
        </div>
      )}

      <button className={[styles.studioRunBtn, generating ? styles.busy : ''].join(' ')} onClick={run} disabled={generating || !apiKey}>
        {generating ? 'GENERATING...' : `RUN ${activeMode.toUpperCase()} →`}
      </button>
      {error && <div className={styles.studioError}>{error}</div>}

      {result && (
        <div className={styles.studioResult}>
          {result.bars && <pre className={styles.lyricsOutput}>{result.bars}</pre>}
          {result.verse && <pre className={styles.lyricsOutput}>{result.verse}</pre>}
          {result.analysis && (
            <div className={styles.analysisResult}>
              {result.analysis.coreMessage && <><b>Core:</b> {result.analysis.coreMessage}<br/></>}
              {result.analysis.emotionalArc && <><b>Arc:</b> {result.analysis.emotionalArc}<br/></>}
              {result.analysis.logicalRelation && <><b>Relation:</b> {result.analysis.logicalRelation}<br/></>}
              {result.analysis.punchlines?.length > 0 && <><b>Punchlines:</b> {result.analysis.punchlines.join(' · ')}<br/></>}
              {result.analysis.spiritualUndertone && <><b>Spiritual:</b> {result.analysis.spiritualUndertone}</>}
            </div>
          )}
          {result.juxtapose && (
            <div className={styles.analysisResult}>
              <b>Tension:</b> {result.juxtapose.tension}<br/>
              <b>Premise:</b> {result.juxtapose.songPremise}<br/>
              <b>Hook candidate:</b> {result.juxtapose.hookCandidate}<br/>
              <b>Opening line:</b> {result.juxtapose.openingLine}<br/>
              <b>Avoid:</b> {result.juxtapose.warnAgainst}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// PANEL: MANUAL CONFIG (PIRE + Duality + Identity deep)
// ═════════════════════════════════════════════════════════════════════════════
function ManualConfigPanel({ s, upd }) {
  return (
    <div className={styles.panelContent}>
      <div className={styles.panelMeta}>Personal technical persona shaping · PIRE · Duality controls · Identity deep-config</div>

      <div className={styles.fieldLabel}>IDENTITY MIXING BOARD</div>
      <IdentitySliders values={s.identitySliders} onChange={vals => upd({ identitySliders: vals })} />

      <div className={styles.configDivider} />

      <div className={styles.fieldLabel}>ALTER EGO</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {ALTER_EGO_OPTIONS.map(o => (
          <button key={o.value}
            className={[styles.pill, s.alterEgo === o.value ? styles.pillActive : ''].join(' ')}
            onClick={() => upd({ alterEgo: o.value })}>
            {o.label}
          </button>
        ))}
      </div>

      <div className={styles.configDivider} />

      <div className={styles.fieldLabel}>DUALITY MODE</div>
      <label className={styles.toggleRow}>
        <input type="checkbox" checked={s.dualityMode} onChange={e => upd({ dualityMode: e.target.checked })} />
        <span>{s.dualityMode ? '⊥ Shadow fields active — every answer has its negation' : 'Off — single input fields'}</span>
      </label>

      <div className={styles.configDivider} />

      <div className={styles.fieldLabel}>PERSPECTIVE</div>
      <div className={styles.pills}>
        {['1st','2nd','3rd'].map(p => (
          <button key={p} className={[styles.pill, s.perspective === p ? styles.pillActive : ''].join(' ')} onClick={() => upd({ perspective: p })}>
            {p} person
          </button>
        ))}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COCKPIT HUB
// ═════════════════════════════════════════════════════════════════════════════
export default function CockpitHub({ onDone, preFill, apiKey, provider, model }) {
  const [s, setS] = useState(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY)
      return saved ? { ...defaultState(), ...JSON.parse(saved) } : defaultState()
    } catch { return defaultState() }
  })
  const [activePanel,       setActivePanel]       = useState(null) // null | 'hookbook' | 'journal' | 'studio' | 'manualcfg'
  const [analyzing,         setAnalyzing]         = useState(false)
  const [analyzed,          setAnalyzed]          = useState(null)
  const [inferenceOverrides, setInferenceOverrides] = useState({})
  const [analyzeError,      setAnalyzeError]      = useState(null)
  const [igniting,          setIgniting]          = useState(false)
  const [spiritIdx,         setSpiritIdx]         = useState(() => Math.floor(Math.random() * SPIRIT_PROMPTS.length))

  // Auto-save
  useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem(PERSIST_KEY, JSON.stringify(s)) } catch {} }, 1500)
    return () => clearTimeout(id)
  }, [s])

  // Rotate spiritual prompts every 45 seconds
  useEffect(() => {
    const id = setInterval(() => setSpiritIdx(i => (i + 1) % SPIRIT_PROMPTS.length), 45000)
    return () => clearInterval(id)
  }, [])

  // Pre-fill from upstream
  useEffect(() => {
    if (!preFill) return
    setS(prev => ({
      ...prev,
      mainIdea:      preFill.mainIdea       || prev.mainIdea,
      emotionalTruth:preFill.emotionalTruth || prev.emotionalTruth,
      socialConflict:preFill.socialConflict || prev.socialConflict,
    }))
  }, [preFill])

  const upd = useCallback((patch) => setS(prev => ({ ...prev, ...patch })), [])

  // Analyze
  async function runAnalyze() {
    if (analyzing) return
    setAnalyzing(true); setAnalyzeError(null)
    try {
      const res = await fetch(`${BACKEND}/api/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: { mainIdea: s.mainIdea, emotionalTruth: s.emotionalTruth, socialConflict: s.socialConflict, referenceText: s.referenceText },
          inferenceOverrides,
        }),
      })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      setAnalyzed(data)
      if (data.parsed?.emotions?.[0]?.emotion && !s.primaryEmotion) upd({ primaryEmotion: data.parsed.emotions[0].emotion })
      return data
    } catch (err) { setAnalyzeError(err.message); return null }
    finally { setAnalyzing(false) }
  }

  function handleIgnite() {
    if (igniting) return
    setIgniting(true)
    setTimeout(() => {
      onDone({
        mainIdea: s.mainIdea, emotionalTruth: s.emotionalTruth,
        socialConflict: s.socialConflict, referenceText: s.referenceText,
        // Include shadow fields for duality layer
        mainIdeaShadow: s.mainIdeaShadow, emotionalTruthShadow: s.emotionalTruthShadow,
        socialConflictShadow: s.socialConflictShadow,
        overrides: {
          rawness:          s.identitySliders.rawness,
          energyValue:      s.energy,
          rhymeScheme:      s.rhymeScheme,
          perspective:      s.perspective,
          languageMix:      s.languageMix,
          archetype:        s.archetype,
          subThemes:        s.subThemes,
          primaryEmotion:   s.primaryEmotion,
          secondaryEmotions:s.secondaryEmotions,
          alterEgo:         s.alterEgo,
          identityConfig:   { activeAlterEgo: s.alterEgo },
          identitySliders:  s.identitySliders,
          craft: {
            rawness:               s.identitySliders.rawness,
            vulnerabilityModifier: s.identitySliders.vulnerability_level,
            decisiveness:          s.identitySliders.decisiveness,
            attribution:           s.identitySliders.attribution,
            rhetoricalDevices:     [],
            dictionLevel:          'natural',
            meter:                 'free',
            momentum:              'sustain',
            resolution:            'ambiguous',
            narratorMorality:      'morally_grey',
            humorType:             'none',
            humorIntensity:        0,
          },
        },
        analyzed: analyzed || null,
      })
    }, 700)
  }

  const radarValues    = buildRadarValues(analyzed?.parsed, s.identitySliders)
  const dominantEmotion = s.primaryEmotion || analyzed?.parsed?.emotions?.[0]?.emotion || 'determination'
  const canAnalyze     = s.mainIdea.trim().length > 4 || s.emotionalTruth.trim().length > 4
  const canIgnite      = canAnalyze
  const totalWords     = wc(s.mainIdea) + wc(s.emotionalTruth) + wc(s.socialConflict)

  return (
    <div className={styles.hub}>
      {/* ── LIVE BAR ── */}
      <PersonaLiveBar
        archetype={s.archetype}
        dominantEmotion={dominantEmotion}
        languageMix={s.languageMix}
        energy={s.energy}
        rawness={s.identitySliders.rawness}
      />

      {/* ── SPIRIT TICKER ── */}
      <div className={styles.spiritTicker}>
        <span className={styles.spiritGlyph}>◈</span>
        <span className={styles.spiritText}>{SPIRIT_PROMPTS[spiritIdx]}</span>
        <HealthDot />
      </div>

      {/* ── MAIN GRID ── */}
      <div className={styles.mainGrid}>

        {/* ── LEFT RAIL — optional panel toggles ── */}
        <div className={styles.leftRail}>
          <div className={styles.panelToggleGroup}>
            {PANELS.map(p => (
              <button
                key={p.id}
                className={[styles.panelToggleBtn, activePanel === p.id ? styles.panelToggleBtnActive : ''].join(' ')}
                onClick={() => setActivePanel(activePanel === p.id ? null : p.id)}
                title={p.desc}>
                <span className={styles.panelIcon}>{p.icon}</span>
                <span className={styles.panelToggleLabel}>{p.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.leftRailHint}>
            Click any panel to expand it
          </div>
        </div>

        {/* ── OPTIONAL PANEL DRAWER ── */}
        {activePanel && (
          <div className={styles.panelDrawer}>
            <div className={styles.panelDrawerHeader}>
              <span className={styles.panelDrawerTitle}>
                {PANELS.find(p => p.id === activePanel)?.icon} {PANELS.find(p => p.id === activePanel)?.label}
              </span>
              <button className={styles.panelCloseBtn} onClick={() => setActivePanel(null)}>×</button>
            </div>
            {activePanel === 'hookbook' && <HookBookPanel s={s} upd={upd} />}
            {activePanel === 'journal'  && <JournalPanel  s={s} upd={upd} apiKey={apiKey} provider={provider} />}
            {activePanel === 'studio'   && <StudioPanel   s={s} upd={upd} apiKey={apiKey} provider={provider} model={model} />}
            {activePanel === 'manualcfg'&& <ManualConfigPanel s={s} upd={upd} />}
          </div>
        )}

        {/* ── CENTER — core input zone ── */}
        <div className={styles.centerZone}>

          <div className={styles.zoneSectionHeader}>
            <span className={styles.zoneLabel}>INPUT</span>
            <span className={styles.zoneSub}>What needs to be said?</span>
            {totalWords > 0 && <span className={styles.totalWords}>{totalWords}w total</span>}
            <button
              className={[styles.dualityToggleBtn, s.dualityMode ? styles.dualityToggleBtnActive : ''].join(' ')}
              onClick={() => upd({ dualityMode: !s.dualityMode })}
              title="Toggle duality mode — reveal what each field is NOT">
              {s.dualityMode ? '⊥ dual ON' : '⊥ dual'}
            </button>
          </div>

          <DualityInput
            label="CORE MESSAGE" required
            value={s.mainIdea}        shadowValue={s.mainIdeaShadow}
            onChange={v => upd({ mainIdea: v })}
            onShadowChange={v => upd({ mainIdeaShadow: v })}
            showShadow={s.dualityMode}
            placeholder={"If this song could say ONE thing — what would it be?\n\nStrip everything. What is the spine?"}
            shadowPlaceholder="What is this song REFUSING to say? The protected truth."
            rows={4}
          />

          <DualityInput
            label="EMOTIONAL TRUTH" required
            value={s.emotionalTruth}        shadowValue={s.emotionalTruthShadow}
            onChange={v => upd({ emotionalTruth: v })}
            onShadowChange={v => upd({ emotionalTruthShadow: v })}
            showShadow={s.dualityMode}
            placeholder="The emotion you haven't said out loud. The 2am feeling."
            shadowPlaceholder="The emotion you're PERFORMING instead. The face you show."
            accentColor="magenta"
            rows={3}
          />

          <DualityInput
            label="SOCIAL CONFLICT"
            value={s.socialConflict}        shadowValue={s.socialConflictShadow}
            onChange={v => upd({ socialConflict: v })}
            onShadowChange={v => upd({ socialConflictShadow: v })}
            showShadow={s.dualityMode}
            placeholder="What does the world get wrong about you?"
            shadowPlaceholder="What does the world get RIGHT — that you wish it didn't?"
            rows={3}
          />

          <div className={styles.subGrid}>
            <div>
              <div className={styles.fieldLabel}>SUB-THEMES</div>
              <ThemeChips value={s.subThemes} onChange={t => upd({ subThemes: t })} />
            </div>
          </div>

          {/* ── CRAFT STRIP (always visible) ── */}
          <div className={styles.craftStrip}>
            <div className={styles.craftStripHeader}>
              <span className={styles.zoneLabel}>CRAFT</span>
              <span className={styles.zoneSub}>Shape the voice</span>
            </div>
            <div className={styles.craftRow}>
              <div className={styles.craftCell}>
                <div className={styles.fieldLabel}>ARCHETYPE</div>
                <ArchetypeGrid value={s.archetype} onChange={a => upd({ archetype: a })} compact />
              </div>
              <div className={styles.craftCell}>
                <div className={styles.fieldLabel}>ENERGY / RAWNESS</div>
                <div className={styles.knobs}>
                  <KnobSlider label="Energy"  value={s.energy} onChange={v => upd({ energy: v })} />
                  <KnobSlider label="Rawness" value={s.identitySliders.rawness}
                    onChange={v => upd({ identitySliders: { ...s.identitySliders, rawness: v } })} />
                </div>
              </div>
              <div className={styles.craftCell}>
                <div className={styles.fieldLabel}>RHYME SCHEME</div>
                <RhymeSwatch value={s.rhymeScheme} onChange={r => upd({ rhymeScheme: r })} />
              </div>
              <div className={styles.craftCell}>
                <div className={styles.fieldLabel}>LANGUAGE</div>
                <LanguageToggle value={s.languageMix} onChange={l => upd({ languageMix: l })} />
              </div>
            </div>
          </div>

          {/* ── EMOTIONS (inline, compact) ── */}
          <div className={styles.emotionRow}>
            <div className={styles.fieldLabel}>EMOTIONAL REGISTER</div>
            <EmotionGrid
              primary={s.primaryEmotion}
              secondary={s.secondaryEmotions}
              onChange={({ primary, secondary }) => upd({ primaryEmotion: primary, secondaryEmotions: secondary })}
            />
          </div>

          {/* ── Analysis results (inline) ── */}
          {analyzed && (
            <div className={styles.analysisInline}>
              <InferencePreview
                parsed={analyzed.parsed}
                propertyConfidence={analyzed.propertyConfidence || {}}
                tensionSummary={analyzed.tensionSummary}
                onOverride={(prop, val) => {
                  setInferenceOverrides(prev => ({ ...prev, [prop]: val }))
                  if (prop === 'primary_emotion' && val) upd({ primaryEmotion: val })
                }}
              />
            </div>
          )}

        </div>

        {/* ── RIGHT RAIL — live persona ── */}
        <div className={styles.rightRail}>
          <div className={styles.zoneSectionHeader}>
            <span className={styles.zoneLabel}>PERSONA</span>
          </div>

          <div className={styles.radarWrap}>
            <IdentityRadar values={radarValues} label={dominantEmotion} size={200} />
          </div>

          <div className={styles.configSummary}>
            {[
              ['Energy',   `${s.energy}/100`],
              ['Rawness',  `${s.identitySliders.rawness}/100`],
              ['Voice',    `${s.perspective} person`],
              ['Rhyme',    s.rhymeScheme],
              ['Lang',     s.languageMix.map(l => l.toUpperCase()).join('+')],
              s.archetype ? ['Arch',  s.archetype] : null,
              s.alterEgo !== 'none' ? ['Alter', s.alterEgo.replace(/_/g,' ')] : null,
              s.primaryEmotion ? ['Emotion', s.primaryEmotion] : null,
            ].filter(Boolean).map(([k,v]) => (
              <div key={k} className={styles.cfgLine}>
                <span className={styles.cfgKey}>{k}</span>
                <span className={styles.cfgVal}>{v}</span>
              </div>
            ))}
            {analyzed && (
              <div className={styles.cfgLine}>
                <span className={styles.cfgKey}>ML</span>
                <span className={[styles.cfgVal, styles.cfgValOk].join(' ')}>{analyzed.mlUsed ? 'active' : 'rule-based'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className={styles.bottomBar}>
        <button
          className={[styles.analyzeBtn, analyzing ? styles.busy : ''].join(' ')}
          onClick={runAnalyze} disabled={!canAnalyze || analyzing}>
          {analyzing ? 'ANALYZING...' : analyzed ? '↺ RE-ANALYZE' : 'ANALYZE'}
        </button>
        {analyzeError && <span className={styles.analyzeError}>{analyzeError}</span>}
        {analyzed && (
          <span className={styles.analyzeStatus}>
            ✓ {analyzed.parsed?.emotions?.length || 0}em · {analyzed.parsed?.conflicts?.length || 0}con {analyzed.mlUsed ? '· ML' : ''}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          className={[styles.igniteBtn, igniting ? styles.igniting : ''].join(' ')}
          onClick={handleIgnite} disabled={!canIgnite || igniting}>
          {igniting ? 'BUILDING PERSONA...' : 'IGNITE →'}
        </button>
      </div>
    </div>
  )
}
