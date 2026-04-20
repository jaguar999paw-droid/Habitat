/**
 * InferencePreview.jsx — Engine inference display after text submission
 *
 * Shows what the engine detected from free text. Each chip is clickable
 * to override the inferred value. This is the "Habitat episode metadata"
 * pattern: surface the agent's understanding of its own state, allow
 * human correction.
 *
 * v1.1: Real override modal instead of console.info.
 *   onOverride(property, newValue) is called when user confirms.
 */
import { useState } from 'react'
import styles from './InferencePreview.module.css'

const CONFIDENCE_LABEL = c => c >= 0.8 ? 'strong' : c >= 0.5 ? 'likely' : 'uncertain'
const CONFIDENCE_CLASS  = c => c >= 0.8 ? styles.strong : c >= 0.5 ? styles.likely : styles.uncertain

const RELATION_COLORS = {
  CONTRADICTION: '#ff3333',
  CONTRARY:      '#ff9900',
  SUBCONTRARY:   '#aa33ff',
  NEUTRAL:       '#666',
}

// ── Override field definitions ──────────────────────────────────────────────
// Each entry describes what the modal shows when that property is overridden.
const OVERRIDE_FIELDS = {
  primary_emotion: {
    label: 'Primary Emotion',
    type:  'select',
    options: ['anger','sadness','defiance','longing','pride','confusion','joy','vulnerability'],
  },
  archetype: {
    label: 'Conflict / Archetype',
    type:  'select',
    options: ['identity_rejection','external_judgment','transformation','stagnation','duality','isolation','ancestral_tension','place_identity'],
    display: v => v.replace(/_/g, ' '),
  },
  logical_relation: {
    label: 'Tension Type',
    type:  'select',
    options: ['CONTRADICTION','CONTRARY','SUBCONTRARY','NEUTRAL'],
  },
  language_mix: {
    label: 'Detected Language',
    type:  'select',
    options: ['English only','Sheng detected','Kiswahili detected','Sheng + Kiswahili'],
  },
  temporal_dominant: {
    label: 'Temporal Dominant Self',
    type:  'select',
    options: ['past','present','future'],
  },
}

// ── Override modal ─────────────────────────────────────────────────────────
function OverrideModal({ property, currentLabel, onConfirm, onCancel }) {
  const field = OVERRIDE_FIELDS[property]
  const [selected, setSelected] = useState(currentLabel || field?.options?.[0] || '')

  if (!field) return null

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>OVERRIDE DETECTED VALUE</span>
          <button className={styles.modalClose} onClick={onCancel}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalLabel}>{field.label}</p>
          <div className={styles.modalOptions}>
            {field.options.map(opt => (
              <button
                key={opt}
                className={[
                  styles.modalOpt,
                  selected === opt ? styles.modalOptActive : '',
                ].join(' ')}
                onClick={() => setSelected(opt)}
              >
                {field.display ? field.display(opt) : opt}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancel} onClick={onCancel}>Cancel</button>
          <button
            className={styles.modalConfirm}
            onClick={() => onConfirm(property, selected)}
          >
            Apply Override
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function InferencePreview({
  parsed,
  propertyConfidence = {},
  tensionSummary,
  onOverride,       // (property: string, newValue: string) => void
}) {
  const [expanded,      setExpanded]      = useState(false)
  const [overrideModal, setOverrideModal] = useState(null) // { property, currentLabel }

  if (!parsed) return null

  const { emotions, conflicts, traits, languageMix, temporalProfile } = parsed
  const relation       = temporalProfile?.logicalRelation?.relation || 'NEUTRAL'
  const conflictPct    = Math.round((temporalProfile?.conflictScore || 0) * 100)
  const primaryEmotion = emotions?.[0]
  const primaryConflict = conflicts?.[0]

  function requestOverride(property, currentLabel) {
    setOverrideModal({ property, currentLabel })
  }

  function confirmOverride(property, newValue) {
    onOverride?.(property, newValue)
    setOverrideModal(null)
  }

  return (
    <>
      <div className={styles.preview}>
        <div className={styles.header} onClick={() => setExpanded(e => !e)}>
          <span className={styles.title}>ENGINE DETECTED</span>
          <span className={styles.toggle}>{expanded ? '▲' : '▼'}</span>
        </div>

        <div className={styles.chips}>
          {primaryEmotion && (
            <Chip
              label={`${primaryEmotion.emotion} (${Math.round(primaryEmotion.intensity * 100)}%)`}
              category="EMOTION"
              confidence={propertyConfidence.primary_emotion}
              onOverride={() => requestOverride('primary_emotion', primaryEmotion.emotion)}
            />
          )}
          {primaryConflict && (
            <Chip
              label={primaryConflict.type.replace(/_/g, ' ')}
              category="CONFLICT"
              confidence={propertyConfidence.dominant_conflict}
              onOverride={() => requestOverride('archetype', primaryConflict.type)}
            />
          )}
          <Chip
            label={relation}
            category="TENSION"
            confidence={temporalProfile?.logicalRelation?.confidence}
            color={RELATION_COLORS[relation]}
            onOverride={() => requestOverride('logical_relation', relation)}
          />
          <Chip
            label={`${conflictPct}% tension`}
            category="SCORE"
            confidence={0.9}
            onOverride={null}
          />
          {languageMix?.sheng && (
            <Chip
              label="Sheng detected"
              category="LANG"
              confidence={0.9}
              onOverride={() => requestOverride('language_mix', 'Sheng detected')}
            />
          )}
          {languageMix?.kiswahili && (
            <Chip
              label="Kiswahili detected"
              category="LANG"
              confidence={0.8}
              onOverride={() => requestOverride('language_mix', 'Kiswahili detected')}
            />
          )}
          {temporalProfile?.temporal?.dominant && (
            <Chip
              label={`${temporalProfile.temporal.dominant} self dominant`}
              category="TIME"
              confidence={propertyConfidence.temporal_dominant}
              onOverride={() => requestOverride('temporal_dominant', temporalProfile.temporal.dominant)}
            />
          )}
        </div>

        {expanded && (
          <div className={styles.detail}>
            {traits?.length > 0 && (
              <div className={styles.row}>
                <span className={styles.dk}>Traits</span>
                <span className={styles.dv}>{traits.join(' · ')}</span>
              </div>
            )}
            {emotions?.slice(1, 3).length > 0 && (
              <div className={styles.row}>
                <span className={styles.dk}>Secondary emotions</span>
                <span className={styles.dv}>{emotions.slice(1, 3).map(e => e.emotion).join(' · ')}</span>
              </div>
            )}
            {tensionSummary && tensionSummary !== 'No cross-property tensions detected' && (
              <div className={styles.row}>
                <span className={styles.dk}>Property tensions</span>
                <span className={[styles.dv, styles.tension].join(' ')}>{tensionSummary}</span>
              </div>
            )}
            {temporalProfile?.temporalSummary && (
              <div className={styles.row}>
                <span className={styles.dk}>Temporal</span>
                <span className={styles.dv}>{temporalProfile.temporalSummary}</span>
              </div>
            )}
            <p className={styles.overrideHint}>Tap any chip above to override a detected value</p>
          </div>
        )}
      </div>

      {/* Override modal — rendered outside the preview box so it's not clipped */}
      {overrideModal && (
        <OverrideModal
          property={overrideModal.property}
          currentLabel={overrideModal.currentLabel}
          onConfirm={confirmOverride}
          onCancel={() => setOverrideModal(null)}
        />
      )}
    </>
  )
}

function Chip({ label, category, confidence, color, onOverride }) {
  return (
    <button
      className={[styles.chip, onOverride ? styles.clickable : ''].join(' ')}
      style={color ? { borderColor: color, color } : {}}
      onClick={onOverride || undefined}
      title={
        onOverride
          ? `Click to override · Confidence: ${confidence != null ? CONFIDENCE_LABEL(confidence) : 'n/a'}`
          : undefined
      }
    >
      <span className={styles.cat}>{category}</span>
      <span className={styles.val}>{label}</span>
      {confidence != null && (
        <span className={[styles.conf, CONFIDENCE_CLASS(confidence)].join(' ')} />
      )}
      {onOverride && <span className={styles.editIcon}>✎</span>}
    </button>
  )
}
