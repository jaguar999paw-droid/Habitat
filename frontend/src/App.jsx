/**
 * App.jsx — Root application component
 * Manages the multi-step SCI songwriting flow:
 *   Step 0: Landing
 *   Step 1: Identity Discovery (Questionnaire)
 *   Step 2: Persona + Analysis Review
 *   Step 3: Song Generation
 *   Step 4: Song Display
 */
import { useState } from 'react'
import Landing       from './pages/Landing'
import Questionnaire from './pages/Questionnaire'
import PersonaReview from './pages/PersonaReview'
import Generator     from './pages/Generator'
import SongDisplay   from './pages/SongDisplay'
import ProgressBar   from './components/ProgressBar'
import styles        from './App.module.css'

const STEPS = ['Discover', 'Persona', 'Generate', 'Song']

export default function App() {
  const [step,     setStep]     = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [analysis, setAnalysis] = useState(null)   // { persona, message, structure, style }
  const [song,     setSong]     = useState(null)    // { sections, song, metadata }
  const [apiKey,   setApiKey]   = useState(localStorage.getItem('sci_api_key') || '')
  const [provider, setProvider] = useState('claude')

  function saveApiKey(key) {
    setApiKey(key)
    localStorage.setItem('sci_api_key', key)
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
          onSetProvider={setProvider}
        />
      )}
      {step === 1 && (
        <Questionnaire onDone={handleAnswersDone} />
      )}
      {step === 2 && (
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
