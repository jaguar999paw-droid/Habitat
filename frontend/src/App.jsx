/**
 * App.jsx — v2 Root application component
 *
 * Flow:
 *   Step 0: Landing
 *   Step 1: Identity Discovery
 *             v1: Questionnaire.jsx   @deprecated
 *             v2: Cockpit.jsx         ← TODO: build this (see docs/AGENT_PROMPT_V2.md)
 *   Step 2: Persona Review
 *             v1: PersonaReview.jsx   @deprecated
 *             v2: CockpitPreview.jsx  ← TODO: build this
 *   Step 3: Song Generation (Generator.jsx — unchanged)
 *   Step 4: Song Display (SongDisplay.jsx — v2 with per-section regen)
 *
 * NOTE: Cockpit.jsx and CockpitPreview.jsx are the next agent's primary task.
 * Until they exist, this file falls back to the v1 Questionnaire flow.
 * Once built, replace the v1 imports below with the v2 cockpit components.
 */
import { useState } from 'react'
import Landing       from './pages/Landing'
// v1 (deprecated — kept until Cockpit.jsx is complete)
import Questionnaire from './pages/Questionnaire'
import PersonaReview from './pages/PersonaReview'
// v2 (TODO — uncomment once Cockpit.jsx and CockpitPreview.jsx are created)
// import Cockpit        from './pages/Cockpit'
// import CockpitPreview from './pages/CockpitPreview'
import Generator     from './pages/Generator'
import SongDisplay   from './pages/SongDisplay'
import ProgressBar   from './components/ProgressBar'
import styles        from './App.module.css'

const STEPS = ['Discover', 'Persona', 'Generate', 'Song']

export default function App() {
  const [step,     setStep]     = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [analysis, setAnalysis] = useState(null)
  const [song,     setSong]     = useState(null)
  const [apiKey,   setApiKey]   = useState(localStorage.getItem('sci_api_key') || '')
  const [provider, setProvider] = useState(localStorage.getItem('sci_provider') || 'claude')

  function saveApiKey(key) {
    setApiKey(key)
    localStorage.setItem('sci_api_key', key)
  }

  function saveProvider(p) {
    setProvider(p)
    localStorage.setItem('sci_provider', p)
  }

  function handleAnswersDone(submittedAnswers) {
    setAnswers(submittedAnswers)
    setStep(2)
  }

  function handleAnalysisDone(data) {
    setAnalysis(data)
    setStep(3)
  }

  function handleSongDone(data) {
    setSong(data)
    setStep(4)
  }

  function restart() {
    setStep(1); setAnswers({}); setAnalysis(null); setSong(null)
  }

  return (
    <div className={styles.app}>
      {step > 0 && step < 4 && (
        <ProgressBar steps={STEPS} current={step - 1} />
      )}

      {step === 0 && (
        <Landing
          onStart={() => setStep(1)}
          apiKey={apiKey}
          onSaveApiKey={saveApiKey}
          provider={provider}
          onSetProvider={saveProvider}
        />
      )}
      {step === 1 && (
        /* TODO v2: replace with <Cockpit onDone={handleAnswersDone} /> */
        <Questionnaire onDone={handleAnswersDone} />
      )}
      {step === 2 && (
        /* TODO v2: replace with <CockpitPreview answers={answers} onAnalysis={handleAnalysisDone} /> */
        <PersonaReview
          answers={answers}
          onAnalysis={handleAnalysisDone}
        />
      )}
      {step === 3 && analysis && (
        <Generator
          analysis={analysis}
          apiKey={apiKey}
          provider={provider}
          onDone={handleSongDone}
        />
      )}
      {step === 4 && song && (
        <SongDisplay
          song={song}
          analysis={analysis}
          onRestart={restart}
        />
      )}
    </div>
  )
}
