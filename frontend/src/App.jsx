/**
 * App.jsx — v2.3 Root application component
 *
 * Flow:
 *   Step 0: Landing           — API key setup, provider selection
 *   Step 1: JournalPage       — Identity excavation (timed prompts + synthesis)  [SKIP available]
 *   Step 2: CockpitV5         — Unified 4-zone: Journal / Hooks / Identity / Charts
 *   Step 3: CockpitPreview    — Cinematic persona reveal
 *   Step 4: Generator         — Section-by-section AI generation
 *   Step 5: SongDisplay       — Final song + HookBookPanel drawer
 *
 *   (HookWorksheet and old Cockpit archived — superseded by CockpitV5)
 */
import { useState } from 'react'
import Landing        from './pages/Landing'
import JournalPage    from './pages/JournalPage'
import HookWorksheet  from './pages/HookWorksheet'
import Cockpit        from './pages/Cockpit'
import CockpitPreview from './pages/CockpitPreview'
import Generator      from './pages/Generator'
import SongDisplay    from './pages/SongDisplay'
import CockpitV5      from './pages/CockpitV5'
import styles         from './App.module.css'

export default function App() {
  const [step,          setStep]          = useState(0)
  const [answers,       setAnswers]       = useState({})
  const [analysis,      setAnalysis]      = useState(null)
  const [song,          setSong]          = useState(null)
  const [apiKey,        setApiKey]        = useState(localStorage.getItem('sci_api_key') || '')
  const [provider,      setProvider]      = useState(localStorage.getItem('sci_provider') || 'claude')
  const [model,         setModel]         = useState(localStorage.getItem('sci_model') || 'claude-sonnet-4-6')
  const [journalFill,   setJournalFill]   = useState(null)   // from JournalPage synthesis
  const [hookOverrides, setHookOverrides] = useState(null)   // from HookWorksheet

  // Merge journal synthesis + hook overrides into a unified preFill for Cockpit
  const cockpitPreFill = journalFill
    ? { ...journalFill, hookOverrides }
    : hookOverrides
      ? { hookOverrides }
      : null

  function saveApiKey(key) {
    setApiKey(key); localStorage.setItem('sci_api_key', key)
  }
  function saveProvider(p) {
    setProvider(p); localStorage.setItem('sci_provider', p)
  }
  function saveModel(m) {
    setModel(m); localStorage.setItem('sci_model', m)
  }

  // ── Step handlers ───────────────────────────────────────────────────────
  function handleJournalContinue(fill) {
    setJournalFill(fill)
    setStep(2) // → CockpitV5
  }
  function handleJournalSkip() {
    setStep(2) // → CockpitV5
  }

  // CockpitV5 emits {answers, persona} when user is ready to generate
  function handleCockpitV5Done(submittedAnswers) {
    setAnswers(submittedAnswers)
    setStep(3) // → CockpitPreview
  }
  function handleAnswersDone(submittedAnswers) {
    setAnswers(submittedAnswers)
    setStep(3) // → CockpitPreview (legacy shim)
  }
  function handleAnalysisDone(data) {
    setAnalysis(data); setStep(4)
  }
  function handleSongDone(data) {
    setSong(data); setStep(5)
  }

  function restart() {
    setStep(1)
    setAnswers({}); setAnalysis(null); setSong(null)
    setJournalFill(null); setHookOverrides(null)
  }

  return (
    <div className={styles.app}>
      {step === 0 && (
        <Landing
          onStart={() => setStep(1)}
          apiKey={apiKey}
          onSaveApiKey={saveApiKey}
          provider={provider}
          onSetProvider={saveProvider}
          model={model}
          onSetModel={saveModel}
        />
      )}
      {step === 1 && (
        <JournalPage
          onContinue={handleJournalContinue}
          onSkip={handleJournalSkip}
        />
      )}
      {step === 2 && (
        <CockpitV5
          preFill={cockpitPreFill}
          onDone={handleCockpitV5Done}
        />
      )}
      {step === 3 && (
        <CockpitPreview answers={answers} onAnalysis={handleAnalysisDone} />
      )}
      {step === 4 && analysis && (
        <Generator
          analysis={analysis}
          apiKey={apiKey}
          provider={provider}
          model={model}
          onDone={handleSongDone}
        />
      )}
      {step === 5 && song && (
        <SongDisplay
          song={song}
          analysis={analysis}
          model={model}
          onRestart={restart}
        />
      )}
    </div>
  )
}
