/** PersonaCard.jsx — Displays the generated persona in a visual card */
import styles from './PersonaCard.module.css'

const ARCHETYPE_EMOJI = {
  'The Defiant':       '⚡',
  'The Misunderstood': '🌊',
  'The Transformer':   '🔥',
  'The Seeker':        '🔍',
  'The Bridge Walker': '🌉',
  'The Lone Voice':    '🎤',
  'The Heir':          '👑',
  'The Grounded':      '🌍',
  'The Observer':      '👁',
}

export default function PersonaCard({ persona, message }) {
  const emoji = ARCHETYPE_EMOJI[persona.archetype] || '🎵'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.emoji}>{emoji}</span>
        <div>
          <div className={styles.archetype}>{persona.archetype}</div>
          <div className={styles.voice}>{persona.voice}</div>
        </div>
      </div>

      <div className={styles.message}>
        <span className={styles.messageLabel}>Core Message</span>
        <p className={styles.messageText}>"{message.coreMessage}"</p>
      </div>

      <div className={styles.grid}>
        <Chip label="Tone"        value={persona.tone} />
        <Chip label="Energy"      value={persona.energy} />
        <Chip label="Perspective" value={`${persona.perspective} person`} />
        <Chip label="Language"    value={persona.languageMix} />
      </div>

      {persona.allConflicts?.length > 0 && (
        <div className={styles.conflicts}>
          <span className={styles.conflictsLabel}>Detected Conflicts</span>
          <div className={styles.tags}>
            {persona.allConflicts.map(c => (
              <span key={c} className={styles.tag}>{c.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}

      {persona.traits?.length > 0 && (
        <div className={styles.conflicts}>
          <span className={styles.conflictsLabel}>Personality Traits</span>
          <div className={styles.tags}>
            {persona.traits.map(t => (
              <span key={t} className={`${styles.tag} ${styles.traitTag}`}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ label, value }) {
  return (
    <div className={styles.chip}>
      <span className={styles.chipLabel}>{label}</span>
      <span className={styles.chipValue}>{value}</span>
    </div>
  )
}
