/**
 * Cockpit.jsx — v4  Professional green/lime instrument cockpit
 *
 * Phase 1 — SPEAK   Free-text → POST /api/analyze
 *   + word count on each textarea
 *   + backend health indicator
 * Phase 2 — FEEL    EmotionGrid + InferencePreview
 *   + re-analyze button that replays /api/analyze with current inferenceOverrides
 * Phase 3 — KNOW    IdentitySliders + IdentityRadar (live)
 * Phase 4 — CRAFT   Archetype, alter-ego, energy, language, rhyme → IGNITE
 *
 * + EndpointTester panel (bottom-right) — tests all 5 API endpoints live
 * + PERSIST_KEY v2 migration on mount
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
import InferencePreview  from '../components/InferencePreview'
import IdentityRadar     from '../components/IdentityRadar'
import styles            from './Cockpit.module.css'

const PERSIST_KEY = 'sci_cockpit_v4'
const BACKEND     = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

const ALTER_EGO_OPTIONS = [
  { value: 'none',               label: 'None (raw self)' },
  { value: 'the_confessor',      label: 'The Confessor' },
  { value: 'the_witness',        label: 'The Witness' },
  { value: 'the_trickster',      label: 'The Trickster' },
  { value: 'the_preacher',       label: 'The Preacher' },
  { value: 'the_ghost',          label: 'The Ghost' },
  { value: 'the_street_philosopher', label: 'Street Philosopher' },
]

// ── Default state ──────────────────────────────────────────────────────────────
function defaultState() {
  return {
    mainIdea: '', emotionalTruth: '', socialConflict: '', referenceText: '',
    subThemes: [],
    primaryEmotion: null, secondaryEmotions: [],
    identitySliders: { rawness: 50, decisiveness: 50, attribution: 50, vulnerability_level: 50 },
    archetype: null, alterEgo: 'none',
    energy: 60, rhymeScheme: 'ABAB', perspective: '1st', languageMix: ['en'],
  }
}

function buildRadarValues(parsed, sliders) {
  if (!parsed) return { pastActual:50, pastAlt:50, presentActual:50, presentAlt:50, futureProjected:50, futureAlt:50 }
  const tp = parsed.temporalProfile || {}
  const t  = tp.temporal || {}
  const cs = Math.round((tp.conflictScore || 0) * 100)
  const pastW    = Math.round((t.past    || 0.33) * 100)
  const presentW = Math.round((t.present || 0.33) * 100)
  const futureW  = Math.round((t.future  || 0.33) * 100)
  const attr = sliders.attribution   ?? 50
  const cert = sliders.decisiveness  ?? 50
  return {
    pastActual:      Math.round(pastW    * (attr / 100)),
    pastAlt:         Math.round(pastW    * (1 - attr / 100)),
    presentActual:   Math.round(presentW * (cert / 100)),
    presentAlt:      Math.round(presentW * (1 - cert / 100)),
    futureProjected: Math.round(futureW  * ((100 - cs) / 100)),
    futureAlt:       Math.round(futureW  * (cs / 100)),
  }
}

function rawLabel(v) {
  return v < 30 ? 'polished' : v < 60 ? 'honest' : 'unfiltered'
}

function wordCount(str) {
  return str.trim() ? str.trim().split(/\s+/).length : 0
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT TESTER
// ═══════════════════════════════════════════════════════════════════════════════
const ENDPOINTS = [
  { id: 'health',   method: 'GET',  path: '/api/health',   label: 'GET  /health',   body: null },
  { id: 'analyze',  method: 'POST', path: '/api/analyze',  label: 'POST /analyze',
    body: { answers: { mainIdea: 'test', emotionalTruth: 'defiant', socialConflict: '' }, overrides: {}, inferenceOverrides: {} } },
  { id: 'generate', method: 'POST', path: '/api/generate', label: 'POST /generate', body: null }, // skipped without apiKey
  { id: 'sessions', method: 'GET',  path: '/api/sessions', label: 'GET  /sessions', body: null },
  { id: 'delta',    method: 'POST', path: '/api/delta',    label: 'POST /delta',
    body: { currentParsed: { emotions: [], conflicts: [], temporalProfile: {} }, sessionId: null } },
]

function EndpointTester() {
  const [open,    setOpen]    = useState(false)
  const [results, setResults] = useState({})
  const [running, setRunning] = useState(false)

  async function runAll() {
    setRunning(true)
    const next = {}
    for (const ep of ENDPOINTS) {
      if (!ep.body && ep.method === 'POST') {
        next[ep.id] = { status: 'skipped', ms: '-', note: 'requires apiKey' }
        continue
      }
      const t0 = Date.now()
      try {
        const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } }
        if (ep.body) opts.body = JSON.stringify(ep.body)
        const res  = await fetch(`${BACKEND}${ep.path}`, opts)
        const ms   = Date.now() - t0
        const data = await res.json().catch(() => ({}))
        next[ep.id] = { status: res.ok ? 'ok' : 'fail', code: res.status, ms, note: data.error || '' }
      } catch (err) {
        next[ep.id] = { status: 'fail', ms: Date.now() - t0, note: err.message }
      }
    }
    setResults(next)
    setRunning(false)
  }

  const statusClass = s =>
    s === 'ok' ? styles.testOk : s === 'fail' ? styles.testFail : styles.testPending

  return (
    <div className={styles.testPanel}>
      <div className={styles.testPanelHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.testPanelTitle}>⬡ ENDPOINT TESTER</span>
        <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{open ? '▼' : '▲'}</span>
      </div>
      {open && (
        <div className={styles.testPanelBody}>
          <button className={styles.testRunBtn} onClick={runAll} disabled={running}>
            {running ? 'RUNNING...' : 'RUN ALL TESTS'}
          </button>
          {ENDPOINTS.map(ep => {
            const r = results[ep.id]
            return (
              <div key={ep.id} className={styles.testRow}>
                <span className={styles.testEndpoint}>{ep.label}</span>
                {r ? (
                  <span className={`${styles.testStatus} ${statusClass(r.status)}`}>
                    {r.status === 'ok' ? `✓ ${r.code} ${r.ms}ms` :
                     r.status === 'skipped' ? 'SKIP' :
                     `✗ ${r.code || 'ERR'}`}
                  </span>
                ) : (
                  <span className={`${styles.testStatus} ${styles.testPending}`}>IDLE</span>
                )}
              </div>
            )
          })}
          {Object.values(results).some(r => r?.note) && (
            <div style={{ fontSize: 8.5, color: 'var(--text-3)', padding: '4px 2px', wordBreak: 'break-word' }}>
              {ENDPOINTS.map(ep => results[ep.id]?.note ? `${ep.id}: ${results[ep.id].note}` : null).filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORD COUNT DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════
function WordCount({ text }) {
  const n = wordCount(text)
  return (
    <div className={styles.wordCountRow}>
      <span className={`${styles.wordCount} ${n > 0 ? styles.wordCountActive : ''}`}>
        {n > 0 ? `${n}w` : ''}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════
function HealthIndicator() {
  const [health, setHealth] = useState(null) // 'ok' | 'warn' | 'down' | null

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const res = await fetch(`${BACKEND}/api/health`, { signal: AbortSignal.timeout(1500) })
        if (cancelled) return
        const data = await res.json()
        setHealth(data.status === 'ok' ? (data.mlService === 'ok' ? 'ok' : 'warn') : 'down')
      } catch {
        if (!cancelled) setHealth('down')
      }
    }
    check()
    return () => { cancelled = true }
  }, [])

  if (health === null) return null
  const label = health === 'ok' ? 'Engine online · ML online' :
                health === 'warn' ? 'Engine online · ML offline' : 'Engine offline'
  return (
    <div className={styles.healthRow}>
      <span className={`${styles.healthDot} ${health === 'ok' ? styles.healthOk : health === 'warn' ? styles.healthWarn : styles.healthDown}`} />
      <span>{label}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COCKPIT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Cockpit({ onDone, preFill }) {
  const [phase, setPhase] = useState(1)
  const [s, setS] = useState(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY)
      return saved ? { ...defaultState(), ...JSON.parse(saved) } : defaultState()
    } catch { return defaultState() }
  })
  const [analyzing,         setAnalyzing]         = useState(false)
  const [inferenceOverrides, setInferenceOverrides] = useState({})
  const [analyzed,          setAnalyzed]          = useState(null)
  const [analyzeError,      setAnalyzeError]      = useState(null)
  const [igniting,          setIgniting]          = useState(false)

  // Auto-save
  useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem(PERSIST_KEY, JSON.stringify(s)) } catch {} }, 2000)
    return () => clearTimeout(id)
  }, [s])

  // Pre-fill from Journal/HookWorksheet synthesis
  useEffect(() => {
    if (!preFill) return
    setS(prev => ({
      ...prev,
      mainIdea:      preFill.mainIdea      || prev.mainIdea,
      emotionalTruth:preFill.emotionalTruth|| prev.emotionalTruth,
      socialConflict:preFill.socialConflict|| prev.socialConflict,
    }))
  }, [preFill])

  // Migrate stale keys
  useEffect(() => {
    try { localStorage.removeItem('sci_cockpit_v2'); localStorage.removeItem('sci_cockpit_v3') } catch {}
  }, [])

  const upd = useCallback((patch) => setS(prev => ({ ...prev, ...patch })), [])

  // ── Analyze ───────────────────────────────────────────────────────────────
  async function runAnalyze() {
    if (analyzing) return
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const res = await fetch(`${BACKEND}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: { mainIdea: s.mainIdea, emotionalTruth: s.emotionalTruth, socialConflict: s.socialConflict, referenceText: s.referenceText },
          inferenceOverrides,
        }),
      })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      setAnalyzed(data)
      const inf = data.parsed?.emotions?.[0]?.emotion
      if (inf && !s.primaryEmotion) upd({ primaryEmotion: inf })
      return data
    } catch (err) {
      setAnalyzeError(err.message || 'Analysis failed — continue manually')
      return null
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleAnalyze() {
    const data = await runAnalyze()
    if (data !== undefined) setPhase(2)
  }

  async function handleReAnalyze() {
    await runAnalyze()
    // stay on Phase 2 — just refresh the InferencePreview
  }

  // ── Override handler ──────────────────────────────────────────────────────
  function handleOverride(property, newValue) {
    setInferenceOverrides(prev => ({ ...prev, [property]: newValue }))
    if (property === 'primary_emotion' && newValue) upd({ primaryEmotion: newValue })
    if (property === 'temporal_dominant') {
      setAnalyzed(prev => {
        if (!prev?.parsed?.temporalProfile?.temporal) return prev
        return { ...prev, parsed: { ...prev.parsed, temporalProfile: { ...prev.parsed.temporalProfile, temporal: { ...prev.parsed.temporalProfile.temporal, dominant: newValue } } } }
      })
    }
  }

  // ── Ignite ────────────────────────────────────────────────────────────────
  function handleIgnite() {
    if (igniting) return
    setIgniting(true)
    setTimeout(() => {
      onDone({
        mainIdea: s.mainIdea, emotionalTruth: s.emotionalTruth,
        socialConflict: s.socialConflict, referenceText: s.referenceText,
        overrides: {
          // ── Direct overrides (server normalizes '1st'→'first' etc.) ──────────
          rawness:          s.identitySliders.rawness,
          energyValue:      s.energy,
          rhymeScheme:      s.rhymeScheme,
          perspective:      s.perspective,         // '1st'|'2nd'|'3rd' — server normalizes
          languageMix:      s.languageMix,         // ['en','sw','sheng'] array — server maps
          archetype:        s.archetype,            // 'The Defiant' etc. or null
          subThemes:        s.subThemes,
          primaryEmotion:   s.primaryEmotion,
          secondaryEmotions:s.secondaryEmotions,
          alterEgo:         s.alterEgo,
          identityConfig:   { activeAlterEgo: s.alterEgo },
          identitySliders:  s.identitySliders,
          // ── Craft object: maps Phase 4 settings → styleMapper craftConfig ────
          craft: {
            rawness:           s.identitySliders.rawness,
            vulnerabilityModifier: s.identitySliders.vulnerability_level,
            decisiveness:      s.identitySliders.decisiveness,
            attribution:       s.identitySliders.attribution,
            rhetoricalDevices: [],  // populated when craft controls added
            dictionLevel:      'natural',
            meter:             'free',
            momentum:          'sustain',
            resolution:        'ambiguous',
            narratorMorality:  'morally_grey',
            humorType:         'none',
            humorIntensity:    0,
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

  const PHASES = [
    { n: 1, label: 'SPEAK' },
    { n: 2, label: 'FEEL'  },
    { n: 3, label: 'KNOW'  },
    { n: 4, label: 'CRAFT' },
  ]

  // total words typed
  const totalWords = wordCount(s.mainIdea) + wordCount(s.emotionalTruth) + wordCount(s.socialConflict)

  return (
    <>
      {/* ── LIVE BAR ── */}
      <PersonaLiveBar
        archetype={s.archetype}
        dominantEmotion={dominantEmotion}
        languageMix={s.languageMix}
        energy={s.energy}
        rawness={s.identitySliders.rawness}
      />

      {/* ── PHASE TABS ── */}
      <div className={styles.phaseNav}>
        {PHASES.map(p => (
          <button
            key={p.n}
            className={[
              styles.phaseTab,
              phase === p.n ? styles.phaseTabActive : '',
              phase > p.n   ? styles.phaseTabDone   : '',
              p.n > phase && !canAnalyze ? styles.phaseTabLocked : '',
            ].join(' ')}
            onClick={() => { if (p.n <= phase || canAnalyze) setPhase(p.n) }}
          >
            <span className={styles.phaseN}>{phase > p.n ? '✓' : p.n}</span>
            {p.label}
            {p.n === 1 && totalWords > 0 && (
              <span className={styles.wordBadge}>{totalWords}w</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.phaseBody}>

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 1: SPEAK
        ══════════════════════════════════════════════════════════════════ */}
        {phase === 1 && (
          <div className={styles.speakPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>SPEAK</span>
              <span className={styles.panelSub}>What needs to be said?</span>
            </div>

            <HealthIndicator />

            <FieldBlock label="CORE MESSAGE" required>
              <textarea
                className={styles.textarea}
                placeholder={"If this song could say ONE thing — what would it be?\n\nStrip everything. What is the spine?"}
                value={s.mainIdea}
                onChange={e => upd({ mainIdea: e.target.value })}
                rows={4}
              />
              <WordCount text={s.mainIdea} />
            </FieldBlock>

            <FieldBlock label="EMOTIONAL TRUTH" required>
              <textarea
                className={[styles.textarea, styles.textareaMagenta].join(' ')}
                placeholder="The emotion you haven't said out loud. The 2am feeling."
                value={s.emotionalTruth}
                onChange={e => upd({ emotionalTruth: e.target.value })}
                rows={3}
              />
              <WordCount text={s.emotionalTruth} />
            </FieldBlock>

            <FieldBlock label="SOCIAL CONFLICT">
              <textarea
                className={styles.textarea}
                placeholder="What does the world get wrong about you?"
                value={s.socialConflict}
                onChange={e => upd({ socialConflict: e.target.value })}
                rows={3}
              />
              <WordCount text={s.socialConflict} />
            </FieldBlock>

            <FieldBlock label="SUB-THEMES">
              <ThemeChips value={s.subThemes} onChange={t => upd({ subThemes: t })} />
            </FieldBlock>

            <FieldBlock label="REFERENCE TEXT">
              <ReferenceDropZone value={s.referenceText} onChange={t => upd({ referenceText: t })} />
            </FieldBlock>

            <div className={styles.phaseCta}>
              <button
                className={[styles.ctaBtn, analyzing ? styles.ctaBtnBusy : ''].join(' ')}
                onClick={handleAnalyze}
                disabled={!canAnalyze || analyzing}
              >
                {analyzing ? 'ANALYZING...' : 'ANALYZE → FEEL'}
              </button>
              {!canAnalyze && <p className={styles.ctaHint}>Fill in core message or emotional truth to proceed</p>}
              {analyzeError && <p className={styles.ctaError}>{analyzeError}</p>}
              {analyzed && (
                <div className={styles.analyzeStatus}>
                  ✓ Analyzed · {analyzed.parsed?.emotions?.length || 0} emotions · {analyzed.parsed?.conflicts?.length || 0} conflicts
                  {analyzed.mlUsed ? ' · ML' : ' · rule-based'}
                </div>
              )}
              {canAnalyze && (
                <button className={styles.skipBtn} onClick={() => setPhase(2)}>skip analysis →</button>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 2: FEEL
        ══════════════════════════════════════════════════════════════════ */}
        {phase === 2 && (
          <div className={styles.feelPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>FEEL</span>
              <span className={styles.panelSub}>What is the dominant emotional state?</span>
            </div>

            {analyzed && (
              <>
                <InferencePreview
                  parsed={analyzed.parsed}
                  propertyConfidence={analyzed.propertyConfidence || {}}
                  tensionSummary={analyzed.tensionSummary}
                  onOverride={handleOverride}
                />
                <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className={styles.reAnalyzeBtn}
                    onClick={handleReAnalyze}
                    disabled={analyzing}
                  >
                    {analyzing ? 'RE-ANALYZING...' : '↺ RE-ANALYZE WITH OVERRIDES'}
                  </button>
                  {Object.keys(inferenceOverrides).length > 0 && (
                    <span style={{ fontSize: 9, color: 'var(--lime-dim)' }}>
                      {Object.keys(inferenceOverrides).length} override{Object.keys(inferenceOverrides).length > 1 ? 's' : ''} active
                    </span>
                  )}
                </div>
              </>
            )}

            <FieldBlock label="PRIMARY + SECONDARY EMOTIONS">
              <EmotionGrid
                primary={s.primaryEmotion}
                secondary={s.secondaryEmotions}
                onChange={({ primary, secondary }) => upd({ primaryEmotion: primary, secondaryEmotions: secondary })}
              />
            </FieldBlock>

            <div className={styles.phaseNav2}>
              <button className={styles.backBtn} onClick={() => setPhase(1)}>← SPEAK</button>
              <button className={styles.ctaBtn} onClick={() => setPhase(3)}>KNOW →</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 3: KNOW
        ══════════════════════════════════════════════════════════════════ */}
        {phase === 3 && (
          <div className={styles.knowPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>KNOW</span>
              <span className={styles.panelSub}>Mix your identity — who are you in this song?</span>
            </div>

            <div className={styles.knowGrid}>
              <div>
                <FieldBlock label="IDENTITY MIXING BOARD">
                  <IdentitySliders values={s.identitySliders} onChange={vals => upd({ identitySliders: vals })} />
                </FieldBlock>
              </div>
              <div>
                <FieldBlock label="IDENTITY RADAR">
                  <IdentityRadar values={radarValues} label={dominantEmotion} size={270} />
                </FieldBlock>
              </div>
            </div>

            <div className={styles.phaseNav2}>
              <button className={styles.backBtn} onClick={() => setPhase(2)}>← FEEL</button>
              <button className={styles.ctaBtn} onClick={() => setPhase(4)}>CRAFT →</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PHASE 4: CRAFT
        ══════════════════════════════════════════════════════════════════ */}
        {phase === 4 && (
          <div className={styles.craftPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>CRAFT</span>
              <span className={styles.panelSub}>Shape the sound and voice</span>
            </div>

            <div className={styles.craftGrid}>

              {/* Col 1 — identity voice */}
              <div>
                <FieldBlock label="ARCHETYPE">
                  <ArchetypeGrid value={s.archetype} onChange={a => upd({ archetype: a })} />
                  {!s.archetype && <p className={styles.autoNote}>↑ leave blank to auto-detect</p>}
                </FieldBlock>

                <FieldBlock label="ALTER EGO">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {ALTER_EGO_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        className={[styles.pill, s.alterEgo === o.value ? styles.pillActive : ''].join(' ')}
                        style={{ flex: 'none', fontSize: 9 }}
                        onClick={() => upd({ alterEgo: o.value })}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </FieldBlock>
              </div>

              {/* Col 2 — craft controls */}
              <div>
                <FieldBlock label="ENERGY / RAWNESS">
                  <div className={styles.knobs}>
                    <KnobSlider label="Energy"  value={s.energy} onChange={v => upd({ energy: v })} />
                    <KnobSlider label="Rawness" value={s.identitySliders.rawness}
                      onChange={v => upd({ identitySliders: { ...s.identitySliders, rawness: v } })} />
                  </div>
                </FieldBlock>

                <FieldBlock label="LANGUAGE MIX">
                  <LanguageToggle value={s.languageMix} onChange={l => upd({ languageMix: l })} />
                </FieldBlock>

                <FieldBlock label="PERSPECTIVE">
                  <div className={styles.pills}>
                    {['1st','2nd','3rd'].map(p => (
                      <button
                        key={p}
                        className={[styles.pill, s.perspective === p ? styles.pillActive : ''].join(' ')}
                        onClick={() => upd({ perspective: p })}
                      >
                        {p} person
                      </button>
                    ))}
                  </div>
                </FieldBlock>

                <FieldBlock label="RHYME SCHEME">
                  <RhymeSwatch value={s.rhymeScheme} onChange={r => upd({ rhymeScheme: r })} />
                </FieldBlock>
              </div>

              {/* Col 3 — config summary + mini radar */}
              <div>
                <div className={styles.previewBox}>
                  <div className={styles.previewLabel}>CURRENT CONFIG</div>
                  <ConfigLine k="Energy"   v={`${s.energy}/100`} />
                  <ConfigLine k="Rawness"  v={`${s.identitySliders.rawness}/100 — ${rawLabel(s.identitySliders.rawness)}`} />
                  <ConfigLine k="Voice"    v={`${s.perspective} person`} />
                  <ConfigLine k="Rhyme"    v={s.rhymeScheme} />
                  <ConfigLine k="Langs"    v={s.languageMix.map(l => l.toUpperCase()).join(' + ')} />
                  {s.archetype     && <ConfigLine k="Arch"    v={s.archetype} />}
                  {s.alterEgo !== 'none' && <ConfigLine k="Alter"   v={s.alterEgo.replace(/_/g, ' ')} />}
                  {s.primaryEmotion && <ConfigLine k="Emotion" v={s.primaryEmotion} />}
                  <ConfigLine k="Certain"  v={`${s.identitySliders.decisiveness}/100`} />
                  <ConfigLine k="Fault"    v={`${s.identitySliders.attribution}/100`} />
                  {Object.keys(inferenceOverrides).length > 0 && (
                    <ConfigLine k="Overrides" v={`${Object.keys(inferenceOverrides).length} applied`} />
                  )}
                </div>

                <div className={styles.radarMini}>
                  <IdentityRadar values={radarValues} label={dominantEmotion} size={190} animate={false} />
                </div>
              </div>
            </div>

            <div className={styles.phaseNav2}>
              <button className={styles.backBtn} onClick={() => setPhase(3)}>← KNOW</button>
              <button
                className={[styles.igniteBtn, igniting ? styles.igniting : ''].join(' ')}
                onClick={handleIgnite}
                disabled={!canIgnite}
              >
                {igniting ? 'BUILDING PERSONA...' : 'IGNITE →'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── ENDPOINT TESTER (bottom-right corner) ── */}
      <EndpointTester />
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function FieldBlock({ label, required, children }) {
  return (
    <div className={styles.fieldBlock}>
      <div className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.fieldRequired}>*</span>}
      </div>
      {children}
    </div>
  )
}

function ConfigLine({ k, v }) {
  return (
    <div className={styles.configLine}>
      <span className={styles.configKey}>{k}</span>
      <span className={styles.configVal}>{v}</span>
    </div>
  )
}
