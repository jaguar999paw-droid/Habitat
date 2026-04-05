/**
 * GlitchText.jsx — CSS3 glitch effect wrapper
 *
 * Usage:
 *   <GlitchText text="THE DEFIANT" as="h1" className={styles.title} />
 *
 * Props:
 *   text     — the string to display + glitch
 *   as       — HTML tag (default: 'span')
 *   active   — boolean, trigger glitch manually (default: auto on hover)
 *   className
 */
import { useState, useEffect } from 'react'
import styles from './GlitchText.module.css'

export default function GlitchText({ text, as: Tag = 'span', className = '', active, loop = false }) {
  const [glitching, setGlitching] = useState(false)

  // Auto-glitch randomly when loop=true
  useEffect(() => {
    if (!loop) return
    const schedule = () => {
      const delay = 3000 + Math.random() * 5000
      return setTimeout(() => {
        setGlitching(true)
        setTimeout(() => { setGlitching(false); schedule() }, 400)
      }, delay)
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [loop])

  const isGlitching = active || glitching

  return (
    <Tag
      className={[styles.glitch, isGlitching ? styles.active : '', className].join(' ')}
      data-text={text}
      onMouseEnter={() => setGlitching(true)}
      onMouseLeave={() => setGlitching(false)}
    >
      {text}
    </Tag>
  )
}
