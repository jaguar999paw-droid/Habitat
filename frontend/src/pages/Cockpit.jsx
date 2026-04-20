/**
 * Cockpit.jsx — v3  Four-phase identity input flow
 *
 * Phase 1 — SPEAK   Free-text: core message, emotional truth, social conflict
 *                   → POST /api/analyze → engine inference
 * Phase 2 — FEEL    EmotionGrid: confirm / correct primary + secondary emotions
 * Phase 3 — KNOW    IdentitySliders + InferencePreview: mix your identity dimensions
 *                   IdentityRadar: live 6-angle hexagonal output
 * Phase 4 — CRAFT   HOW: archetype, language, rhyme, energy, rawness → IGNITE
 *
 * Preserves all v2 state shape and onDone() contract.
 * Auto-saves to localStorage every 2s.
 */
import { useState, useEffect, useCallback } from 'react'
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

const PERSIST_KEY  = 'sci_cockpit_v3'
const BACKEND      = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// ── Default state ──────────────────────────────────────────────────────────────
function defaultState() {
  return {
    // Phase 1 — SPEAK
    mainIdea:       '',
    emotionalTruth: '',
    socialConflict: '',
    referenceText:  '',
    subThemes:      [],

    // Phase 2 — FEEL
    primaryEmotion:    null,
    secondaryEmotions: [],

    // Phase 3 — KNOW (identity sliders)
    identitySliders: {
      rawness:           50,
      decisiveness:      50,
      attribution:       50,
      vulnerability_level: 50,
    },

    // Phase 4 — CRAFT / HOW
    archetype:   null,
    energy:      60,
    rawness:     50,
    rhymeScheme: 'ABAB',
    perspective: '1st',
    languageMix: ['en'],
  }
}

// ── Derive radar values from analysis + sliders ────────────────────────────────
function buildRadarValues(parsed, sliders) {
  if (!parsed) {
    // neutral baseline
    return { pastActual: 50, pastAlt: 50, presentActual: 50, presentAlt: 50, futureProjected: 50, futureAlt: 50 }
  }
  const tp = parsed.temporalProfile || {}
  const t  = tp.temporal || {}
  const cs = Math.round((tp.conflictScore || 0) * 100)

  // Map temporal weights → radar axes
  const pastW    = Math.round((t.past    || 0.33) * 100)
  const presentW = Math.round((t.present || 0.33) * 100)
  const futureW  = Math.round((t.future  || 0.33) * 100)

  // Attribution drives the split between actual / shadow selves
  const attr = sliders.attribution ?? 50
  const cert = sliders.decisiveness ?? 50

  return {
    pastActual:      Math.round(pastW * (attr / 100)),
    pastAlt:         Math.round(pastW * (1 - attr / 100)),
    presentActual:   Math.round(presentW * (cert / 100)),
    presentAlt:      Math.round(presentW * (1 - cert / 100)),
    futureProjected: Math.round(futureW * ((100 - cs) / 100)),
    futureAlt:       Math.round(futureW * (cs / 100)),
  }
}

function rawLabel(v) {
  if (v < 30) return 'polished'
  if (v < 60) return 'honest'
  return 'unfiltered'
}

// ── Main component ──────────────────────────────────────────────────────────────
export default function Cockpit({ onDone }) {
  const [phase, setPhase]     = useState(1)          // 1–4
  const [s, setS]             = useState(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY)
      return saved ? { ...defaultState(), ...JSON.parse(saved) } : defaultState()
    } catch { return defaultState() }
  })
  const [analyzing, setAnalyzing]   = useState(false)
  // Corrections the user made in Phase 2 via InferencePreview override modal
  const [inferenceOverrides, setInferenceOverrides] = useState({})
  const [analyzed,  setAnalyzed]    = useState(null)   // raw /api/analyze response
  const [analyzeError, setAnalyzeError] = useState(null)
  const [igniting,  setIgniting]    = useState(false)

  // Auto-save
  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem(PERSIST_KEY, JSON.stringify(s)) } catch {}
    }, 2000)
    return () => clearTimeout(id)
  }, [s])

  // PERSIST_KEY migration: clear stale v2 key on first load
  useEffect(() => {
    try { localStorage.removeItem('sci_cockpit_v2') } catch {}
  }, [])

  const upd = useCallback((patch) => setS(prev => ({ ...prev, ...patch })), [])

  // ── Phase 1 → 2: analyze text ─────────────────────────────────────────────
  async function handleAnalyze() {
    if (analyzing) return
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const res = await fetch(`${BACKEND}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: {
            mainIdea:       s.mainIdea,
            emotionalTruth: s.emotionalTruth,
            socialConflict: s.socialConflict,
            referenceText:  s.referenceText,
          },
          inferenceOverrides,
        }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setAnalyzed(data)

      // Pre-fill emotion from inference if user hasn't set one
      const inferredEmotion = data.parsed?.emotions?.[0]?.emotion
      if (inferredEmotion && !s.primaryEmotion) {
        upd({ primaryEmotion: inferredEmotion })
      }

      setPhase(2)
    } catch (err) {
      setAnalyzeError(err.message || 'Analysis failed. Continue manually.')
      setPhase(2)   // let user proceed even if backend is down
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Phase 4: ignite ────────────────────────────────────────────────────────
  function handleIgnite() {
    if (igniting) return
    setIgniting(true)
    setTimeout(() => {
      onDone({
        mainIdea:       s.mainIdea,
        emotionalTruth: s.emotionalTruth,
        socialConflict: s.socialConflict,
        referenceText:  s.referenceText,
        overrides: {
          rawness:           s.identitySliders.rawness,
          energyValue:       s.energy,
          rhymeScheme:       s.rhymeScheme,
          perspective:       s.perspective,
          languageMix:       s.languageMix,
          archetype:         s.archetype,
          subThemes:         s.subThemes,
          primaryEmotion:    s.primaryEmotion,
          secondaryEmotions: s.secondaryEmotions,
          identitySliders:   s.identitySliders,
        },
        // also pass the analyzed result so downstream can skip re-analysis
        analyzed: analyzed || null,
      })
    }, 700)
  }

  // Called by InferencePreview when the user confirms an override in the modal.
  // Merges into inferenceOverrides — sent to /api/analyze on the next call.
  // Also immediately updates local state where a direct UI mapping exists.
  function handleOverride(property, newValue) {
    setInferenceOverrides(prev => ({ ...prev, [property]: newValue }))
    // Mirror into local state where the UI already has a matching field
    if (property === 'primary_emotion' && newValue) {
      upd({ primaryEmotion: newValue })
    }
    if (property === 'temporal_dominant') {
      // Re-trigger analyze with the correction baked in so the radar updates
      setAnalyzed(prev => {
        if (!prev?.parsed?.temporalProfile?.temporal) return prev
        return {
          ...prev,
          parsed: {
            ...prev.parsed,
            temporalProfile: {
              ...prev.parsed.temporalProfile,
              temporal: { ...prev.parsed.temporalProfile.temporal, dominant: newValue }
            }
          }
        }
      })
    }
  }

  const radarValues = buildRadarValues(analyzed?.parsed, s.identitySliders)
  const dominantEmotion = s.primaryEmotion
    || analyzed?.parsed?.emotions?.[0]?.emotion
    || 'determination'

  const canAnalyze = s.mainIdea.trim().length > 4 || s.emotionalTruth.trim().length > 4
  const canIgnite  = canAnalyze

  // ── Phase indicators ────────────────────────────────────────────────────────
  const PHASES = [
    { n: 1, label: 'SPEAK' },
    { n: 2, label: 'FEEL'  },
    { n: 3, label: 'KNOW'  },
    { n: 4, label: 'CRAFT' },
  ]

  return (
    <>
      <PersonaLiveBar
        archetype={s.archetype}
        dominantEmotion={dominantEmotion}
        languageMix={s.languageMix}
        energy={s.energy}
        rawness={s.identitySliders.rawness}
      />

      {/* Phase nav */}
      <div className={styles.phaseNav}>
        {PHASES.map(p => (
          <button
            key={p.n}
            className={[
              styles.phaseTab,
              phase === p.n ? styles.phaseTabActive : '',
              p.n > phase && !canAnalyze ? styles.phaseTabLocked : '',
            ].join(' ')}
            onClick={() => { if (p.n <= phase || canAnalyze) setPhase(p.n) }}
          >
            <span className={styles.phaseN}>{p.n}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.phaseBody}>

        {/* ── PHASE 1: SPEAK ──────────────────────────────────────────────── */}
        {phase === 1 && (
          <div className={styles.speakPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>SPEAK</span>
              <span className={styles.panelSub}>What needs to be said?</span>
            </div>

            <FieldBlock label="CORE MESSAGE *">
              <textarea
                className={styles.textarea}
                placeholder={"If this song could say ONE thing — what would it be?\n\nStrip everything. What is the spine?"}
                value={s.mainIdea}
                onChange={e => upd({ mainIdea: e.target.value })}
                rows={4}
              />
            </FieldBlock>

            <FieldBlock label="EMOTIONAL TRUTH *">
              <textarea
                className={[styles.textarea, styles.textareaMagenta].join(' ')}
                placeholder="The emotion you haven't said out loud. The 2am feeling."
                value={s.emotionalTruth}
                onChange={e => upd({ emotionalTruth: e.target.value })}
                rows={3}
              />
            </FieldBlock>

            <FieldBlock label="SOCIAL CONFLICT">
              <textarea
                className={styles.textarea}
                placeholder="What does the world get wrong about you?"
                value={s.socialConflict}
                onChange={e => upd({ socialConflict: e.target.value })}
                rows={3}
              />
            </FieldBlock>

            <FieldBlock label="SUB-THEMES">
              <ThemeChips value={s.subThemes} onChange={t => upd({ subThemes: t })} />
            </FieldBlock>

            <FieldBlock label="REFERENCE TEXT">
              <ReferenceDropZone
                value={s.referenceText}
                onChange={t => upd({ referenceText: t })}
              />
            </FieldBlock>

            <div className={styles.phaseCta}>
              <button
                className={[styles.ctaBtn, analyzing ? styles.ctaBtnBusy : ''].join(' ')}
                onClick={handleAnalyze}
                disabled={!canAnalyze || analyzing}
              >
                {analyzing ? 'ANALYZING...' : 'ANALYZE → FEEL'}
              </button>
              {!canAnalyze && (
                <p className={styles.ctaHint}>Fill in at least core message or emotional truth</p>
              )}
              {analyzeError && (
                <p className={styles.ctaError}>{analyzeError}</p>
              )}
              {canAnalyze && (
                <button className={styles.skipBtn} onClick={() => setPhase(2)}>
                  skip analysis →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── PHASE 2: FEEL ────────────────────────────────────────────────── */}
        {phase === 2 && (
          <div className={styles.feelPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>FEEL</span>
              <span className={styles.panelSub}>What is the dominant emotional state?</span>
            </div>

            {analyzed && (
              <InferencePreview
                parsed={analyzed.parsed}
                propertyConfidence={analyzed.propertyConfidence || {}}
                tensionSummary={analyzed.tensionSummary}
                onOverride={handleOverride}
              />
            )}

            <FieldBlock label="PRIMARY + SECONDARY EMOTIONS">
              <EmotionGrid
                primary={s.primaryEmotion}
                secondary={s.secondaryEmotions}
                onChange={({ primary, secondary }) =>
                  upd({ primaryEmotion: primary, secondaryEmotions: secondary })
                }
              />
            </FieldBlock>

            <div className={styles.phaseNav2}>
              <button className={styles.backBtn} onClick={() => setPhase(1)}>← SPEAK</button>
              <button className={styles.ctaBtn} onClick={() => setPhase(3)}>KNOW →</button>
            </div>
          </div>
        )}

        {/* ── PHASE 3: KNOW ────────────────────────────────────────────────── */}
        {phase === 3 && (
          <div className={styles.knowPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>KNOW</span>
              <span className={styles.panelSub}>Mix your identity — who are you in this song?</span>
            </div>

            <div className={styles.knowGrid}>
              <div className={styles.knowLeft}>
                <FieldBlock label="IDENTITY MIXING BOARD">
                  <IdentitySliders
                    values={s.identitySliders}
                    onChange={vals => upd({ identitySliders: vals })}
                  />
                </FieldBlock>
              </div>

              <div className={styles.knowRight}>
                <FieldBlock label="IDENTITY RADAR">
                  <IdentityRadar
                    values={radarValues}
                    label={dominantEmotion}
                    size={260}
                  />
                </FieldBlock>
              </div>
            </div>

            <div className={styles.phaseNav2}>
              <button className={styles.backBtn} onClick={() => setPhase(2)}>← FEEL</button>
              <button className={styles.ctaBtn} onClick={() => setPhase(4)}>CRAFT →</button>
            </div>
          </div>
        )}

        {/* ── PHASE 4: CRAFT ───────────────────────────────────────────────── */}
        {phase === 4 && (
          <div className={styles.craftPhase}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>CRAFT</span>
              <span className={styles.panelSub}>Shape the sound and voice</span>
            </div>

            <div className={styles.craftGrid}>
              <div className={styles.craftCol}>
                <FieldBlock label="ARCHETYPE">
                  <ArchetypeGrid value={s.archetype} onChange={a => upd({ archetype: a })} />
                  {!s.archetype && (
                    <p className={styles.autoNote}>↑ leave blank to auto-detect</p>
                  )}
                </FieldBlock>

                <FieldBlock label="ENERGY / RAWNESS">
                  <div className={styles.knobs}>
                    <KnobSlider label="Energy"  value={s.energy} onChange={v => upd({ energy: v })} />
                    <KnobSlider label="Rawness" value={s.identitySliders.rawness}
                      onChange={v => upd({ identitySliders: { ...s.identitySliders, rawness: v } })} />
                  </div>
                </FieldBlock>
              </div>

              <div className={styles.craftCol}>
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

              <div className={styles.craftCol}>
                <div className={styles.previewBox}>
                  <div className={styles.previewLabel}>CURRENT CONFIG</div>
                  <ConfigLine k="Energy"   v={`${s.energy}/100`} />
                  <ConfigLine k="Rawness"  v={`${s.identitySliders.rawness}/100 — ${rawLabel(s.identitySliders.rawness)}`} />
                  <ConfigLine k="Voice"    v={`${s.perspective} person`} />
                  <ConfigLine k="Rhyme"    v={s.rhymeScheme} />
                  <ConfigLine k="Langs"    v={s.languageMix.map(l => l.toUpperCase()).join(' + ')} />
                  {s.archetype && <ConfigLine k="Arch"   v={s.archetype} />}
                  {s.primaryEmotion && <ConfigLine k="Emotion" v={s.primaryEmotion} />}
                  <ConfigLine k="Certainty" v={`${s.identitySliders.decisiveness}/100`} />
                  <ConfigLine k="Fault"     v={`${s.identitySliders.attribution}/100`} />
                </div>

                <div className={styles.radarMini}>
                  <IdentityRadar values={radarValues} label={dominantEmotion} size={180} animate={false} />
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
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function FieldBlock({ label, children }) {
  return (
    <div className={styles.fieldBlock}>
      <div className={styles.fieldLabel}>{label}</div>
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
