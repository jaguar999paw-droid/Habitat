/** StructurePlan.jsx — Visualizes the planned song sections */
import styles from './StructurePlan.module.css'

const SECTION_COLORS = {
  verse:     '#7c3aed',
  hook:      '#f59e0b',
  'pre-hook':'#f97316',
  bridge:    '#10b981',
  intro:     '#6b7280',
  outro:     '#3b82f6',
}

export default function StructurePlan({ structure }) {
  return (
    <div className={styles.plan}>
      <div className={styles.header}>
        <h3 className={styles.title}>Song Structure</h3>
        <span className={styles.badge}>{structure.totalSections} sections</span>
      </div>
      <div className={styles.sections}>
        {structure.sections.map((section) => (
          <div key={section.index} className={styles.section}>
            <div
              className={styles.typeTag}
              style={{ '--color': SECTION_COLORS[section.type] || '#7c3aed' }}
            >
              {section.type.toUpperCase()}
            </div>
            <div className={styles.sectionInfo}>
              <div className={styles.goal}>{section.goal.replace(/_/g, ' ')}</div>
              <div className={styles.desc}>{section.description}</div>
            </div>
            <div className={styles.lines}>{section.lines}L</div>
          </div>
        ))}
      </div>
    </div>
  )
}
