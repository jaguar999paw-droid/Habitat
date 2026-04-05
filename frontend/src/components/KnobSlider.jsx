/** KnobSlider.jsx — Rotary knob-style range input (fixed overlay positioning) */
import styles from './KnobSlider.module.css'

export default function KnobSlider({ label, value, onChange, min = 0, max = 100, unit = '' }) {
  const pct = (value - min) / (max - min)
  // Map 0-1 → -135deg to +135deg
  const deg = -135 + pct * 270

  return (
    <div className={styles.knob}>
      {/* Dial wrapper — positions visual + input together */}
      <div className={styles.dialWrapper}>
        <div className={styles.dial} style={{ '--deg': `${deg}deg` }}>
          <div className={styles.marker} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={styles.slider}
          aria-label={label}
        />
      </div>
      <div className={styles.readout}>
        <span className={styles.val}>{value}{unit}</span>
        <span className={styles.lbl}>{label}</span>
      </div>
    </div>
  )
}
