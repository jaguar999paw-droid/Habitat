/** ProgressBar.jsx — Step indicator */
import styles from './ProgressBar.module.css'

export default function ProgressBar({ steps, current }) {
  return (
    <nav className={styles.bar}>
      {steps.map((label, i) => (
        <div
          key={label}
          className={[
            styles.step,
            i <  current ? styles.done    : '',
            i === current ? styles.active : '',
          ].join(' ')}
        >
          <span className={styles.dot}>
            {i < current ? '✓' : i + 1}
          </span>
          <span className={styles.label}>{label}</span>
          {i < steps.length - 1 && <span className={styles.line} />}
        </div>
      ))}
    </nav>
  )
}
