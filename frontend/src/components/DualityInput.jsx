/**
 * DualityInput.jsx — What ↔ What-Not dual input field
 *
 * A duality-aware textarea that shows the stated truth alongside its shadow.
 * The shadow field is optional and toggleable.
 * Builds on the dualityEngine's philosophy: every answer has a question.
 */
import { useState } from 'react'
import styles from './DualityInput.module.css'

export default function DualityInput({
  label,
  required = false,
  value = '',
  shadowValue = '',
  onChange,
  onShadowChange,
  placeholder,
  shadowPlaceholder,
  showShadow = false,
  onToggleShadow,
  rows = 3,
  accentColor = 'lime', // 'lime' | 'magenta'
  hint = null,
  shadowHint = null,
}) {
  const wc = t => t.trim() ? t.trim().split(/\s+/).length : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
        {onToggleShadow && (
          <button
            className={[styles.shadowToggle, showShadow ? styles.shadowToggleActive : ''].join(' ')}
            onClick={onToggleShadow}
            title={showShadow ? 'Hide shadow field' : 'Reveal what this is NOT (duality mode)'}
          >
            {showShadow ? '⊥ dual' : '⊥'}
          </button>
        )}
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>

      <div className={[styles.fields, showShadow ? styles.fieldsDual : ''].join(' ')}>
        {/* STATED FIELD */}
        <div className={styles.fieldWrap}>
          {showShadow && <span className={styles.fieldTag}>WHAT IT IS</span>}
          <textarea
            className={[styles.textarea, accentColor === 'magenta' ? styles.textareaMagenta : ''].join(' ')}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={rows}
          />
          {wc(value) > 0 && (
            <span className={styles.wordCount}>{wc(value)}w</span>
          )}
        </div>

        {/* SHADOW FIELD — only when duality mode active */}
        {showShadow && (
          <div className={[styles.fieldWrap, styles.shadowField].join(' ')}>
            <span className={styles.fieldTag}>WHAT IT IS NOT</span>
            <textarea
              className={[styles.textarea, styles.textareaShadow].join(' ')}
              placeholder={shadowPlaceholder || `The shadow of "${label.toLowerCase()}" — what this refuses to be`}
              value={shadowValue}
              onChange={e => onShadowChange && onShadowChange(e.target.value)}
              rows={rows}
            />
            {shadowHint && <span className={styles.shadowHintText}>{shadowHint}</span>}
            {wc(shadowValue) > 0 && (
              <span className={styles.wordCount}>{wc(shadowValue)}w</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
