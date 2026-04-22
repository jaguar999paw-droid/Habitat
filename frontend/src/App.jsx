/**
 * App.jsx — v3 Root application component
 *
 * Flow (v3 — non-sequential):
 *   Step 0: Landing        — API key setup, provider selection
 *   Step 1: CockpitHub     — Unified input + optional panels (Hook Book, Journal, Studio, Config)
 *   Step 2: CockpitPreview — Cinematic persona reveal
 *   Step 3: Generator      — Section-by-section AI generation
 *   Step 4: SongDisplay    — Final song + HookBookPanel drawer
 *
 * v3 changes:
 *   - JournalPage and HookWorksheet are now OPTIONAL PANELS inside CockpitHub
 *   - CockpitHub replaces the 4-phase sequential Cockpit
 *   - Studio mode (cypher/battle/analyze/juxtapose) is a panel inside CockpitHub
 *   - Duality mode toggle lives inside CockpitHub
 *   - No forced sequence — all panels accessible from CockpitHub simultaneously
 */
import { useState } from 'react'
import Landing        from './pages/Landing'
import CockpitHub     from './pages/CockpitHub'
import CockpitPreview from './pages/CockpitPreview'
import Generator      from './pages/Generator'
import SongDisplay    from './pages/SongDisplay'
import styles         from './App.module.css'

export default function App() {
  const [step,     setStep]     = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [analysis, setAnalysis] = useState(null)
  const [song,     setSong]     = useState(null)
  const [apiKey,   setApiKey]   = useState(localStorage.getItem('sci_api_key')   || '')
  const [provider, setProvider] = useState(localStorage.getItem('sci_provider')  || 'claude')
  const [model,    setModel]    = useState(localStorage.getItem('sci_model')      || 'claude-sonnet-4-6')

  function saveApiKey(key)  { setApiKey(key);    localStorage.setItem('sci_api_key',  key) }
  function saveProvider(p)  { setProvider(p);    localStorage.setItem('sci_provider', p)   }
  function saveModel(m)     { setModel(m);        localStorage.setItem('sci_model',    m)   }

  function handleHubDone(submittedAnswers) {
    setAnswers(submittedAnswers)
    setStep(2) // → CockpitPreview
  }
  function handleAnalysisDone(data) { setAnalysis(data); setStep(3) }
  function handleSongDone(data)     { setSong(data);     setStep(4) }

  function restart() {
    setStep(1)
    setAnswers({}); setAnalysis(null); setSong(null)
  }

  return (
    <div className={styles.app}>
      {step === 0 && (
        <Landing
          onStart={() => setStep(1)}
          apiKey={apiKey}   onSaveApiKey={saveApiKey}
          provider={provider} onSetProvider={saveProvider}
          model={model}     onSetModel={saveModel}
        />
      )}
      {step === 1 && (
        <CockpitHub
          onDone={handleHubDone}
          preFill={null}
          apiKey={apiKey}
          provider={provider}
          model={model}
        />
      )}
      {step === 2 && (
        <CockpitPreview answers={answers} onAnalysis={handleAnalysisDone} />
      )}
      {step === 3 && analysis && (
        <Generator
          analysis={analysis}
          apiKey={apiKey}
          provider={provider}
          model={model}
          onDone={handleSongDone}
        />
      )}
      {step === 4 && song && (
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
