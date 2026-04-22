/**
 * App.jsx — v2.2 Root application component
 *
 * Flow:
 *   Step 0: Landing           — API key setup, provider selection
 *   Step 1: JournalPage       — Identity excavation (timed prompts + synthesis)  [SKIP available]
 *   Step 2: HookWorksheet     — Pre-Cockpit hook planning (references + structure)[SKIP available]
 *   Step 3: Cockpit           — 4-phase spatial identity input (pre-filled from steps 1+2)
 *   Step 4: CockpitPreview    — Cinematic persona reveal
 *   Step 5: Generator         — Section-by-section AI generation
 *   Step 6: SongDisplay       — Final song + HookBookPanel drawer
 */
import { useState } from 'react'
import Landing        from './pages/Landing'
import JournalPage    from './pages/JournalPage'
import HookWorksheet  from './pages/HookWorksheet'
import Cockpit        from './pages/Cockpit'
import CockpitPreview from './pages/CockpitPreview'
import Generator      from './pages/Generator'
import SongDisplay    from './pages/SongDisplay'
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
    setStep(2) // → HookWorksheet
  }
  function handleJournalSkip() {
    setStep(2)
  }

  function handleHookContinue(overrides) {
    setHookOverrides(overrides)
    setStep(3) // → Cockpit
  }
  function handleHookSkip() {
    setStep(3)
  }

  function handleAnswersDone(submittedAnswers) {
    setAnswers(submittedAnswers)
    setStep(4) // → CockpitPreview
  }
  function handleAnalysisDone(data) {
    setAnalysis(data); setStep(5)
  }
  function handleSongDone(data) {
    setSong(data); setStep(6)
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
        <HookWorksheet
          preFill={journalFill}
          onContinue={handleHookContinue}
          onSkip={handleHookSkip}
        />
      )}
      {step === 3 && (
        <Cockpit
          onDone={handleAnswersDone}
          preFill={cockpitPreFill}
        />
      )}
      {step === 4 && (
        <CockpitPreview answers={answers} onAnalysis={handleAnalysisDone} />
      )}
      {step === 5 && analysis && (
        <Generator
          analysis={analysis}
          apiKey={apiKey}
          provider={provider}
          model={model}
          onDone={handleSongDone}
        />
      )}
      {step === 6 && song && (
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
