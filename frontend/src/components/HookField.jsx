/**
 * HookField.jsx — Hook management and display component
 *
 * Modes:
 *   - reservoir (default): fast input, no scoring, no analysis visible
 *   - extraction: journal + generation auto-feed hooks; no interruption
 *   - insight: show soft tags (sentence_type, temporal_stance)
 *
 * Props:
 *   mode?: 'reservoir' | 'extraction' | 'insight' (default: 'reservoir')
 *   hooks?: Array of hook objects
 *   onHooksChange?: (hooks) => void
 */
import { useState, useEffect } from 'react'
import styles from './HookField.module.css'

const API = 'http://localhost:3001/api/hookbook'

const TAGS = {
  sentence_type: 'Sentence Type',
  temporal_stance: 'Temporal Stance',
  emotional_weight: 'Emotional Weight',
  pronoun_type: 'Pronoun Type',
  repetition_score: 'Repetition',
}

export default function HookField({ mode = 'reservoir', hooks = [], onHooksChange = () => {} }) {
  const [localHooks, setLocalHooks] = useState(hooks)
  const [newHookText, setNewHookText] = useState('')
  const [loading, setLoading] = useState(false)
  const [lockStates, setLockStates] = useState({}) // { hookId: boolean }

  // Load hooks from API on mount
  useEffect(() => {
    const loadHooks = async () => {
      try {
        const res = await fetch(`${API}/hooks`)
        if (res.ok) {
          const data = await res.json()
          const loadedHooks = data.hooks || []
          setLocalHooks(loadedHooks)
          onHooksChange(loadedHooks)

          // Initialize lock states
          const states = {}
          loadedHooks.forEach(h => {
            states[h.id] = h.state === 'LOCKED'
          })
          setLockStates(states)
        }
      } catch (err) {
        console.error('Failed to load hooks:', err)
      }
    }
    loadHooks()
  }, [onHooksChange])

  // Add new hook
  const handleAddHook = async () => {
    if (!newHookText.trim()) return

    const newHook = {
      id: `hook_${Date.now()}`,
      text: newHookText,
      state: 'LIQUID',
      timestamp: Date.now(),
      metadata: {
        sentence_type: 'statement',
        temporal_stance: 'present',
        emotional_weight: 5,
        pronoun_type: 'first',
        repetition_score: 0,
      },
    }

    setLocalHooks(prev => {
      const updated = [...prev, newHook]
      onHooksChange(updated)
      return updated
    })

    setNewHookText('')
  }

  // Toggle lock state
  const handleToggleLock = async (hookId) => {
    try {
      const newState = lockStates[hookId] ? 'LIQUID' : 'LOCKED'
      const res = await fetch(`${API}/hooks/${hookId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState }),
      })

      if (res.ok) {
        setLockStates(prev => ({
          ...prev,
          [hookId]: newState === 'LOCKED',
        }))
      }
    } catch (err) {
      console.error('Failed to toggle lock:', err)
    }
  }

  // Remove hook
  const handleRemoveHook = (hookId) => {
    const updated = localHooks.filter(h => h.id !== hookId)
    setLocalHooks(updated)
    onHooksChange(updated)
    const newStates = { ...lockStates }
    delete newStates[hookId]
    setLockStates(newStates)
  }

  return (
    <div className={`${styles.hookField} ${styles[mode]}`}>
      {/* Input area (always visible in reservoir and insight modes) */}
      {(mode === 'reservoir' || mode === 'insight') && (
        <div className={styles.inputArea}>
          <textarea
            className={styles.hookInput}
            placeholder="Add a hook or lyric idea..."
            value={newHookText}
            onChange={(e) => setNewHookText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleAddHook()
              }
            }}
          />
          <button
            className={styles.addBtn}
            onClick={handleAddHook}
            disabled={!newHookText.trim()}
          >
            + Add
          </button>
        </div>
      )}

      {/* Hooks list */}
      <div className={styles.hooksList}>
        {localHooks.length === 0 ? (
          <div className={styles.emptyState}>
            {mode === 'extraction'
              ? 'Journal synthesis will populate hooks here...'
              : 'No hooks yet. Add one to start building your sound.'}
          </div>
        ) : (
          localHooks.map(hook => {
            const isLocked = lockStates[hook.id]
            return (
              <div
                key={hook.id}
                className={`${styles.hookCard} ${isLocked ? styles.locked : styles.liquid}`}
              >
                <div className={styles.hookHeader}>
                  <div className={styles.hookState}>
                    {isLocked ? '🔒 LOCKED' : '💧 LIQUID'}
                  </div>
                  <button
                    className={styles.lockBtn}
                    onClick={() => handleToggleLock(hook.id)}
                    title={isLocked ? 'Unlock to edit' : 'Lock to protect'}
                  >
                    {isLocked ? '🔒' : '🔓'}
                  </button>
                </div>

                <div className={styles.hookText}>{hook.text}</div>

                {/* Soft tags in insight mode */}
                {mode === 'insight' && hook.metadata && (
                  <div className={styles.metadataTags}>
                    {hook.metadata.sentence_type && (
                      <span className={styles.tag}>
                        {TAGS.sentence_type}: {hook.metadata.sentence_type}
                      </span>
                    )}
                    {hook.metadata.temporal_stance && (
                      <span className={styles.tag}>
                        {TAGS.temporal_stance}: {hook.metadata.temporal_stance}
                      </span>
                    )}
                  </div>
                )}

                {!isLocked && mode !== 'extraction' && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleRemoveHook(hook.id)}
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
