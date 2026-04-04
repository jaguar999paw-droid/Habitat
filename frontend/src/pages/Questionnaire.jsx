/** @deprecated — replaced by Cockpit.jsx in v2. Do not route here. */
/**
 * Questionnaire.jsx
 * Progressive, confrontational identity discovery.
 * Based on WH-Question songwriting framework from SONG_QUESTIONAIRE.md.
 * Questions reveal themselves one at a time for maximum reflection.
 */
import { useState } from 'react'
import styles from './Questionnaire.module.css'

// Questions ordered by depth — surface → core → shadow
const QUESTIONS = [
  {
    id:          'whoAreYouNot',
    category:    'Identity',
    prompt:      'Who are you NOT?',
    subtext:     'Not what society says. Not what your family calls you. What label, role, or box do you refuse?',
    placeholder: 'I am not someone who...',
    required:    true,
  },
  {
    id:          'emotionalTruth',
    category:    'Emotion',
    prompt:      'What emotion are you carrying right now that you haven\'t said out loud?',
    subtext:     'The one that shows up at 2am. The one beneath the explanation.',
    placeholder: 'Right now I feel...',
    required:    true,
  },
  {
    id:          'socialConflict',
    category:    'Conflict',
    prompt:      'What does the world get wrong about you?',
    subtext:     'What do people assume, misread, or project onto you? What judgment follows you?',
    placeholder: 'People think I am... but actually...',
    required:    true,
  },
  {
    id:          'mainIdea',
    category:    'Message',
    prompt:      'If this song could say ONE thing — what would it be?',
    subtext:     'Strip everything away. What is the core truth this song must carry?',
    placeholder: 'This song is saying...',
    required:    true,
  },
  {
    id:          'transformation',
    category:    'Change',
    prompt:      'What have you changed from? What are you becoming?',
    subtext:     'The before and the after. The shedding and the growing.',
    placeholder: 'I used to be... now I am...',
    required:    false,
  },
  {
    id:          'placeAndRoots',
    category:    'Roots',
    prompt:      'Where are you from — and does that place define you or haunt you?',
    subtext:     'Mtaa. Hood. Home. A moment. A family. What ground are you standing on?',
    placeholder: 'Where I come from...',
    required:    false,
  },
  {
    id:          'language',
    category:    'Voice',
    prompt:      'What language does your truth speak in?',
    subtext:     'English? Sheng? Kiswahili? A mix? How you speak tells us who you\'re speaking to.',
    placeholder: 'My truth sounds like... (feel free to write in Sheng/Swahili/English)',
    required:    false,
  },
]

export default function Questionnaire({ onDone }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers,    setAnswers]    = useState({})
  const [inputVal,   setInputVal]   = useState('')
  const [animating,  setAnimating]  = useState(false)

  const question     = QUESTIONS[currentIdx]
  const isLast       = currentIdx === QUESTIONS.length - 1
  const canSkip      = !question.required
  const canProceed   = inputVal.trim().length > 2 || canSkip

  function advance(skip = false) {
    if (animating) return
    setAnimating(true)

    const newAnswers = {
      ...answers,
      ...(skip || !inputVal.trim() ? {} : { [question.id]: inputVal.trim() }),
    }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (isLast) {
        onDone(newAnswers)
      } else {
        setCurrentIdx(i => i + 1)
        setInputVal('')
        setAnimating(false)
      }
    }, 300)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && e.metaKey) advance()
  }

  const progress = ((currentIdx) / QUESTIONS.length) * 100

  return (
    <div className={styles.page}>
      {/* Progress strip */}
      <div className={styles.progressStrip}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={[styles.card, animating ? styles.exiting : ''].join(' ')}>
        {/* Question number */}
        <div className={styles.meta}>
          <span className={styles.category}>{question.category}</span>
          <span className={styles.counter}>{currentIdx + 1} / {QUESTIONS.length}</span>
        </div>

        {/* Main question */}
        <h2 className={styles.prompt}>{question.prompt}</h2>
        <p className={styles.subtext}>{question.subtext}</p>

        {/* Text area */}
        <textarea
          className={styles.textarea}
          placeholder={question.placeholder}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          rows={4}
          autoFocus
        />

        <div className={styles.hint}>⌘ + Enter to continue</div>

        {/* Actions */}
        <div className={styles.actions}>
          {canSkip && (
            <button className={styles.skipBtn} onClick={() => advance(true)}>
              Skip →
            </button>
          )}
          <button
            className={styles.nextBtn}
            onClick={() => advance(false)}
            disabled={!canProceed && !canSkip}
          >
            {isLast ? 'Build My Persona →' : 'Next →'}
          </button>
        </div>

        {/* Previously answered preview */}
        {Object.keys(answers).length > 0 && (
          <div className={styles.answered}>
            {Object.entries(answers).slice(-2).map(([key, val]) => {
              const q = QUESTIONS.find(q => q.id === key)
              return (
                <div key={key} className={styles.answeredItem}>
                  <span className={styles.answeredQ}>{q?.category}:</span>
                  <span className={styles.answeredA}>
                    {val.length > 60 ? val.substring(0, 60) + '...' : val}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
