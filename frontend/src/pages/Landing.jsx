/** Landing.jsx — Hero screen with API key setup */
import { useState } from 'react'
import styles from './Landing.module.css'

export default function Landing({ onStart, apiKey, onSaveApiKey, provider, onSetProvider }) {
  const [keyInput, setKeyInput] = useState(apiKey)
  const [showKey,  setShowKey]  = useState(false)

  function handleSave() {
    onSaveApiKey(keyInput.trim())
  }

  return (
    <div className={styles.page}>
      {/* Ambient background glows */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.content}>
        {/* Logo mark */}
        <div className={styles.logoMark}>
          <span className={styles.logoIcon}>◈</span>
        </div>

        <h1 className={styles.title}>
          Structured Creative<br />
          <span className={styles.accent}>Intelligence</span>
        </h1>
        <p className={styles.subtitle}>
          An AI songwriting engine that discovers who you are<br />
          and transforms identity into structured music.
        </p>

        {/* Pipeline diagram */}
        <div className={styles.pipeline}>
          {['Identity', 'Persona', 'Message', 'Structure', 'Song'].map((step, i, arr) => (
            <span key={step} className={styles.pipeItem}>
              <span className={styles.pipeStep}>{step}</span>
              {i < arr.length - 1 && <span className={styles.pipeArrow}>→</span>}
            </span>
          ))}
        </div>

        {/* API Setup */}
        <div className={styles.apiBox}>
          <label className={styles.apiLabel}>AI Provider</label>
          <div className={styles.providerToggle}>
            {['claude', 'openai'].map(p => (
              <button
                key={p}
                className={[styles.providerBtn, provider === p ? styles.providerActive : ''].join(' ')}
                onClick={() => onSetProvider(p)}
              >
                {p === 'claude' ? '◆ Claude (Anthropic)' : '◇ GPT-4o (OpenAI)'}
              </button>
            ))}
          </div>

          <label className={styles.apiLabel} style={{ marginTop: 12 }}>
            {provider === 'claude' ? 'Anthropic API Key' : 'OpenAI API Key'}
          </label>
          <div className={styles.keyRow}>
            <input
              className={styles.keyInput}
              type={showKey ? 'text' : 'password'}
              placeholder={provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onBlur={handleSave}
            />
            <button className={styles.eyeBtn} onClick={() => setShowKey(!showKey)}>
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          <p className={styles.apiNote}>
            Key is stored in your browser only. Never sent to our servers.
          </p>
        </div>

        <button
          className={styles.startBtn}
          onClick={onStart}
          disabled={!keyInput.trim()}
        >
          Begin Identity Discovery →
        </button>

        {!keyInput.trim() && (
          <p className={styles.keyWarning}>Enter an API key above to continue</p>
        )}
      </div>
    </div>
  )
}
