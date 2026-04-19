/**
 * Landing.jsx — v2.1  Hero screen
 *
 * Art direction:
 * - Floating musical/identity symbol particle field (pure CSS, no canvas)
 * - Animated scanline sweep
 * - Staggered fade-up entrance for each content block
 * - Typewriter pipeline diagram
 * - Bebas Neue ENTER → button (green → magenta ignite)
 * - Glitch effect on logo mark on mount
 */
import { useState, useEffect } from 'react'
import GlitchText from '../components/GlitchText'
import styles from './Landing.module.css'

const PARTICLES = [
  '♩','♪','♫','♬','◈','⬡','△','⌬','◇','⟨','⟩',
  '∅','∞','∆','Σ','Ψ','Ω','λ','φ','π','≠','≡',
  '∩','∪','⊕','⊗','⋮','⋯','∴','∵',
]

// Generate stable random positions at module load time
const PARTICLE_DATA = Array.from({ length: 32 }, (_, i) => ({
  symbol: PARTICLES[i % PARTICLES.length],
  left:   `${(i * 3.2 + 1.5) % 98}%`,
  top:    `${(i * 4.7 + 2.3) % 96}%`,
  delay:  `${(i * 0.47) % 6}s`,
  dur:    `${6 + (i % 5) * 1.4}s`,
  size:   `${11 + (i % 4) * 3}px`,
}))

const PIPELINE = ['Identity', 'Persona', 'Message', 'Structure', 'Song']

export default function Landing({ onStart, apiKey, onSaveApiKey, provider, onSetProvider }) {
  const [keyInput,  setKeyInput]  = useState(apiKey)
  const [showKey,   setShowKey]   = useState(false)
  const [igniting,  setIgniting]  = useState(false)
  const [pipeIdx,   setPipeIdx]   = useState(0)

  // Pipeline typewriter reveal
  useEffect(() => {
    if (pipeIdx >= PIPELINE.length) return
    const t = setTimeout(() => setPipeIdx(i => i + 1), 280 + pipeIdx * 60)
    return () => clearTimeout(t)
  }, [pipeIdx])

  function handleSave(v) {
    const k = (v ?? keyInput).trim()
    setKeyInput(k)
    onSaveApiKey(k)
  }

  function handleStart() {
    if (!keyInput.trim() || igniting) return
    setIgniting(true)
    setTimeout(() => onStart(), 900)
  }

  return (
    <div className={styles.page}>

      {/* ── Particle field ────────────────────────────────────────────────── */}
      <div className={styles.particles} aria-hidden="true">
        {PARTICLE_DATA.map((p, i) => (
          <span
            key={i}
            className={styles.particle}
            style={{
              left: p.left, top: p.top,
              animationDelay: p.delay,
              animationDuration: p.dur,
              fontSize: p.size,
            }}
          >
            {p.symbol}
          </span>
        ))}
      </div>

      {/* ── Scanline sweep ────────────────────────────────────────────────── */}
      <div className={styles.scanline} aria-hidden="true" />

      {/* ── Ambient glows ─────────────────────────────────────────────────── */}
      <div className={styles.glow1} aria-hidden="true" />
      <div className={styles.glow2} aria-hidden="true" />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className={styles.content}>

        {/* Logo */}
        <div className={styles.logo} style={{ animationDelay: '0s' }}>
          <GlitchText text="◈" as="span" className={styles.logoMark} loop />
          <span className={styles.logoText}>Habitat</span>
        </div>

        {/* Headline */}
        <div className={styles.headline} style={{ animationDelay: '0.15s' }}>
          <h1 className={styles.titleLine1}>Structured Creative</h1>
          <GlitchText text="INTELLIGENCE" as="h1" className={styles.titleLine2} loop />
        </div>

        {/* Tagline */}
        <p className={styles.tagline} style={{ animationDelay: '0.3s' }}>
          Songs are not generated.<br />
          <em>They are excavated from identity.</em>
        </p>

        {/* Pipeline typewriter */}
        <div className={styles.pipeline} style={{ animationDelay: '0.45s' }}>
          {PIPELINE.map((step, i) => (
            <span
              key={step}
              className={[styles.pipeItem, i < pipeIdx ? styles.pipeVisible : ''].join(' ')}
            >
              <span className={styles.pipeStep}>{step}</span>
              {i < PIPELINE.length - 1 && (
                <span className={[styles.pipeArrow, i < pipeIdx - 1 ? styles.arrowLit : ''].join(' ')}>→</span>
              )}
            </span>
          ))}
        </div>

        {/* API Setup */}
        <div className={styles.apiBox} style={{ animationDelay: '0.6s' }}>

          {/* Provider selector */}
          <div className={styles.providerRow}>
            {[
              { id: 'claude',  label: '◆ Claude',    sub: 'Anthropic' },
              { id: 'openai',  label: '◇ GPT-4o',   sub: 'OpenAI' },
            ].map(p => (
              <button
                key={p.id}
                className={[styles.providerBtn, provider === p.id ? styles.providerActive : ''].join(' ')}
                onClick={() => onSetProvider(p.id)}
              >
                <span className={styles.providerLabel}>{p.label}</span>
                <span className={styles.providerSub}>{p.sub}</span>
              </button>
            ))}
          </div>

          {/* Key input */}
          <div className={styles.keySection}>
            <label className={styles.keyLabel}>
              {provider === 'claude' ? 'ANTHROPIC API KEY' : 'OPENAI API KEY'}
            </label>
            <div className={styles.keyRow}>
              <input
                className={styles.keyInput}
                type={showKey ? 'text' : 'password'}
                placeholder={provider === 'claude' ? 'sk-ant-api03-...' : 'sk-...'}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onBlur={() => handleSave()}
              />
              <button
                className={styles.eyeBtn}
                onClick={() => setShowKey(s => !s)}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? '◉' : '○'}
              </button>
            </div>
            <p className={styles.keyNote}>Stored locally in your browser only — never transmitted to our servers.</p>
          </div>
        </div>

        {/* Enter button */}
        <button
          className={[styles.enterBtn, igniting ? styles.igniting : ''].join(' ')}
          onClick={handleStart}
          disabled={!keyInput.trim()}
          style={{ animationDelay: '0.75s' }}
        >
          {igniting ? 'LOADING ENGINE...' : 'ENTER → EXCAVATE IDENTITY'}
        </button>

        {!keyInput.trim() && (
          <p className={styles.keyWarning}>↑ API key required to proceed</p>
        )}

        {/* Bottom waveform art */}
        <div className={styles.waveform} aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className={styles.waveBar} style={{
              animationName: `wave${(i % 5) + 1}`,
              animationDelay: `${i * 0.07}s`,
            }} />
          ))}
        </div>

      </div>
    </div>
  )
}
