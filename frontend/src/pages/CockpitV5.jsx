/**
 * CockpitV5.jsx — Unified 4-zone identity mapping cockpit
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────┐
 *   │  Zone 1: Journal (left col, top)                      │
 *   │  Zone 2: Hook Strategy / HookField (right col, top)   │
 *   ├──────────────────────────────────────────────────────┤
 *   │  Zone 3: Identity Config (left col, bottom)           │
 *   │  Zone 4: Visual Feedback (right col, bottom)          │
 *   ├──────────────────────────────────────────────────────┤
 *   │  PersonaLiveBar (full width, pinned bottom)           │
 *   └──────────────────────────────────────────────────────┘
 *
 * Data flow:
 *   Journal entry → extract hooks (auto) → hookbook profile → identity drift
 *   Persona sliders + identity config → live preview
 *   Charts show emotion timeline, trait distribution, language mix, coherence
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import PersonaLiveBar from '../components/PersonaLiveBar'
import KnobSlider from '../components/KnobSlider'
import EmotionGrid from '../components/EmotionGrid'
import IdentityRadar from '../components/IdentityRadar'
import HookField from '../components/HookField'
import EmotionTimeline from '../components/EmotionTimeline'
import TraitDistribution from '../components/TraitDistribution'
import LanguageMixChart from '../components/LanguageMixChart'
import CoherenceScoreMeter from '../components/CoherenceScoreMeter'
import styles from './CockpitV5.module.css'
import SuggestiveEditor from '../components/SuggestiveEditor'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// ── Default state ──────────────────────────────────────────────────────────────
function defaultState() {
  return {
    journalEntry: '',
    emotions: [],
    hooks: [],
    identityProfile: null,
    knobSliders: {
      rawness: 50,
      decisiveness: 50,
      attribution: 50,
      vulnerability_level: 50,
    },
    archetype: null,
    primaryEmotion: null,
    languageMix: ['en'],
    energy: 60,
    coherenceScore: 0,
  }
}

const EMOTION_TAGS = [
  { label: '🔥 Rage', key: 'rage' },
  { label: '💔 Sadness', key: 'sadness' },
  { label: '💪 Defiance', key: 'defiance' },
  { label: '🌿 Peace', key: 'peace' },
  { label: '❓ Confusion', key: 'confusion' },
  { label: '✨ Hope', key: 'hope' },
  { label: '🖤 Shame', key: 'shame' },
  { label: '🌊 Longing', key: 'longing' },
]

export default function CockpitV5({ preFill = null, onDone = () => {} }) {
  const [state, setState] = useState(() => defaultState())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Apply preFill from JournalPage synthesis on mount
  useEffect(() => {
    if (preFill) {
      setState(s => ({ ...s, ...preFill }))
    }
  }, []) // eslint-disable-line

  // ── Zone 1: Journal capture and synthesis ──────────────────────────────────
  const handleJournalChange = (e) => {
    setState(s => ({ ...s, journalEntry: e.target.value }))
  }

  const handleEmotionToggle = (key) => {
    setState(s => ({
      ...s,
      emotions: s.emotions.includes(key)
        ? s.emotions.filter(e => e !== key)
        : [...s.emotions, key],
    }))
  }

  const synthesizeJournal = useCallback(async () => {
    if (!state.journalEntry.trim()) {
      setError('Please write a journal entry first')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND}/api/journal/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: state.journalEntry,
          emotions: state.emotions,
        }),
      })

      if (!res.ok) throw new Error(`Synthesis failed: ${res.status}`)

      const data = await res.json()

      // Update state with extracted hooks and refresh profile
      if (data.extractedHooks) {
        setState(s => ({ ...s, hooks: data.extractedHooks }))
      }

      // Fetch updated identity profile
      const profileRes = await fetch(`${BACKEND}/api/hookbook/profile`)
      if (profileRes.ok) {
        const { profile: _p } = await profileRes.json(); const profile = _p || {}
        setState(s => ({
          ...s,
          identityProfile: profile,
          archetype: profile.dominantArchetype || s.archetype,
          primaryEmotion: profile.dominantEmotion || s.primaryEmotion,
        }))
      }
    } catch (err) {
      setError(err.message)
      console.error('Synthesis error:', err)
    } finally {
      setLoading(false)
    }
  }, [state.journalEntry, state.emotions])

  // ── Zone 3: Identity slider updates ────────────────────────────────────────
  const handleSliderChange = (key, value) => {
    setState(s => ({
      ...s,
      knobSliders: { ...s.knobSliders, [key]: value },
    }))
  }

  // ── Load initial data ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/hookbook/profile`)
        if (res.ok) {
          const profile = await res.json()
          setState(s => ({
            ...s,
            identityProfile: profile,
            archetype: profile.dominantArchetype || s.archetype,
            primaryEmotion: profile.dominantEmotion || s.primaryEmotion,
          }))
        }
      } catch (err) {
        console.error('Failed to load identity profile:', err)
      }
    }
    loadInitialData()
  }, [])


  // ── Proceed to generation ─────────────────────────────────────────────────
  function handleProceed() {
    const answers = {
      whoAreYouNot:   state.journalEntry || '',
      emotionalTruth: state.emotions.length
        ? state.emotions.join(', ')
        : (state.primaryEmotion || 'personal truth'),
      socialConflict: '',
      mainIdea:       state.identityProfile?.mainIdea || '',
      referenceText:  '',
      overrides: {
        rawness:        state.knobSliders.rawness,
        energyValue:    state.energy,
        archetype:      state.archetype,
        primaryEmotion: state.primaryEmotion,
        languageMix:    state.languageMix,
        decisiveness:   state.knobSliders.decisiveness,
        attribution:    state.knobSliders.attribution,
        vulnerability_level: state.knobSliders.vulnerability_level,
      },
    }
    onDone(answers)
  }

  return (
    <div className={styles.cockpitV5}>

      {/* ── Instrument Rail ── */}
      <div className={styles.cockpitRail}>
        <span className={styles.cockpitTitle}>HABITAT</span>
        <div className={styles.cockpitStatus}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Identity Mapping Active</span>
        </div>
      </div>

      {/* ── 4-Zone Grid ── */}
      <div className={styles.gridContainer}>

        {/* Zone 1 — JOURNAL */}
        <div className={styles.zone1}>
          <div className={styles.zoneHeader}>
            <span className={styles.zoneLabel}>Journal</span>
            <span className={styles.zoneBadge}>Input Surface</span>
          </div>
          <div className={styles.zoneBody}>
            <SuggestiveEditor
              value={state.journalEntry}
              onChange={(v) => setState(s => ({ ...s, journalEntry: v }))}
              placeholder="Write here. Reflect on who you are, what you're carrying, what hurts..."
              rows={7}
              showSpectrum={true}
              showMirror={true}
              showNextLines={true}
              focusable={true}
            />
            <div className={styles.emotionTags}>
              {EMOTION_TAGS.map(tag => (
                <button
                  key={tag.key}
                  className={`${styles.emotionTag} ${state.emotions.includes(tag.key) ? styles.selected : ''}`}
                  onClick={() => handleEmotionToggle(tag.key)}
                >{tag.label}</button>
              ))}
            </div>
            <button className={styles.synthesizeBtn} onClick={synthesizeJournal} disabled={loading}>
              {loading ? '⏳ Synthesizing...' : '⊕ Extract Identity'}
            </button>
            {error && <div className={styles.error}>{error}</div>}
          </div>
        </div>

        {/* Zone 2 — HOOK FIELD */}
        <div className={styles.zone2}>
          <div className={styles.zoneHeader}>
            <span className={styles.zoneLabel}>Hook Field</span>
            <span className={styles.zoneBadge}>Reservoir</span>
          </div>
          <div className={styles.zoneBody}>
            <HookField mode="reservoir" hooks={state.hooks} onHooksChange={(h) => setState(s => ({ ...s, hooks: h }))} />
          </div>
        </div>

        {/* Zone 3 — IDENTITY CONFIG */}
        <div className={styles.zone3}>
          <div className={styles.zoneHeader}>
            <span className={styles.zoneLabel}>Identity Config</span>
            <span className={styles.zoneBadge}>Mixer</span>
          </div>
          <div className={styles.zoneBody}>
            <div className={styles.slidersGrid}>
              <KnobSlider label="Rawness"       value={state.knobSliders.rawness}             onChange={(v) => handleSliderChange('rawness', v)} />
              <KnobSlider label="Decisiveness"  value={state.knobSliders.decisiveness}        onChange={(v) => handleSliderChange('decisiveness', v)} />
              <KnobSlider label="Attribution"   value={state.knobSliders.attribution}         onChange={(v) => handleSliderChange('attribution', v)} />
              <KnobSlider label="Vulnerability" value={state.knobSliders.vulnerability_level} onChange={(v) => handleSliderChange('vulnerability_level', v)} />
            </div>
            <div className={styles.radarContainer}>
              <IdentityRadar sliders={state.knobSliders} archetype={state.archetype} />
            </div>
          </div>
        </div>

        {/* Zone 4 — FEEDBACK */}
        <div className={styles.zone4}>
          <div className={styles.zoneHeader}>
            <span className={styles.zoneLabel}>Feedback</span>
            <span className={styles.zoneBadge}>Oscilloscope</span>
          </div>
          <div className={styles.zoneBody}>
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}><EmotionTimeline /></div>
              <div className={styles.chartCard}><TraitDistribution traits={state.identityProfile?.traits || []} /></div>
              <div className={styles.chartCard}><LanguageMixChart mix={state.languageMix} /></div>
              <div className={styles.chartCard}><CoherenceScoreMeter score={state.coherenceScore} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Proceed bar ── */}
      <div className={styles.proceedBar}>
        <span className={styles.proceedHint}>Identity locked — ready to generate</span>
        <button className={styles.proceedBtn} onClick={handleProceed}>Generate Song →</button>
      </div>

      {/* ── Persona Live Bar ── */}
      <PersonaLiveBar
        archetype={state.archetype}
        dominantEmotion={state.primaryEmotion}
        languageMix={state.languageMix}
        energy={state.energy}
        rawness={state.knobSliders.rawness}
      />
    </div>
  )
}
