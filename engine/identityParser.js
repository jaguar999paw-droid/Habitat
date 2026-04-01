/**
 * identityParser.js
 * 
 * Extracts identity traits, emotional states, and conflicts from raw user text.
 * Uses keyword matching, sentiment signals, and structural pattern detection.
 * Based on the WH-Question songwriting framework (SONG_QUESTIONAIRE.md).
 */

// Emotional tone keyword banks
const EMOTION_BANKS = {
  anger:       ['angry', 'rage', 'furious', 'hate', 'mad', 'resent', 'bitter', 'frustrated'],
  sadness:     ['sad', 'hurt', 'lost', 'broken', 'empty', 'lonely', 'cry', 'tears', 'grief'],
  defiance:    ['refuse', 'fight', 'resist', 'stand', 'defy', 'rebel', 'push back', 'won\'t'],
  longing:     ['miss', 'wish', 'want', 'dream', 'hope', 'someday', 'used to', 'remember'],
  pride:       ['proud', 'strong', 'earned', 'built', 'real', 'authentic', 'hustle', 'grind'],
  confusion:   ['why', 'don\'t understand', 'lost', 'unsure', 'confused', 'what if', 'maybe'],
  joy:         ['happy', 'love', 'light', 'free', 'alive', 'grateful', 'bless', 'celebrate'],
  vulnerability: ['scared', 'afraid', 'exposed', 'weak', 'need', 'help', 'please', 'alone'],
};

// Conflict archetype patterns
const CONFLICT_PATTERNS = [
  { pattern: /i am not|i\'m not|never been|don\'t define me/i,  type: 'identity_rejection' },
  { pattern: /they (said|think|told|called)|people (say|think|see)/i, type: 'external_judgment' },
  { pattern: /used to|no longer|changed|before i|i was once/i,   type: 'transformation' },
  { pattern: /stuck|trapped|can\'t escape|loop|cycle|same/i,     type: 'stagnation' },
  { pattern: /between|torn|both|neither|two worlds/i,            type: 'duality' },
  { pattern: /alone|no one|nobody|by myself/i,                   type: 'isolation' },
  { pattern: /mother|father|family|home|roots|blood/i,           type: 'ancestral_tension' },
  { pattern: /streets|nairobi|hood|mtaa|ghetto|environment/i,    type: 'place_identity' },
];

// Trait keywords mapped to persona archetypes
const TRAIT_SIGNALS = {
  introspective: ['think', 'feel', 'wonder', 'reflect', 'question', 'inside', 'deep'],
  assertive:     ['will', 'must', 'always', 'never', 'know', 'certain', 'fact'],
  spiritual:     ['god', 'faith', 'prayer', 'bless', 'universe', 'purpose', 'divine'],
  streetwise:    ['game', 'hustle', 'real', 'streets', 'sheng', 'mtaa', 'manze', 'buda'],
  poetic:        ['like', 'as if', 'imagine', 'picture', 'see', 'feel like', 'sounds like'],
  wounded:       ['hurt', 'scar', 'damage', 'break', 'fall', 'fail', 'wrong'],
};

/**
 * Detects emotions present in text
 * @param {string} text 
 * @returns {Array<{emotion: string, intensity: number}>}
 */
function detectEmotions(text) {
  const lower = text.toLowerCase();
  const detected = [];

  for (const [emotion, keywords] of Object.entries(EMOTION_BANKS)) {
    let hits = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) hits++;
    }
    if (hits > 0) {
      detected.push({ emotion, intensity: Math.min(hits / keywords.length * 3, 1) });
    }
  }

  // Sort by intensity descending
  return detected.sort((a, b) => b.intensity - a.intensity);
}

/**
 * Detects identity conflicts from user input
 * @param {string} text 
 * @returns {Array<{type: string, excerpt: string}>}
 */
function detectConflicts(text) {
  const conflicts = [];
  for (const { pattern, type } of CONFLICT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      conflicts.push({ type, excerpt: match[0] });
    }
  }
  return conflicts;
}

/**
 * Extracts personality traits from text
 * @param {string} text 
 * @returns {Array<string>}
 */
function extractTraits(text) {
  const lower = text.toLowerCase();
  const traits = [];
  for (const [trait, signals] of Object.entries(TRAIT_SIGNALS)) {
    const matches = signals.filter(s => lower.includes(s));
    if (matches.length >= 2) traits.push(trait);
  }
  return traits;
}

/**
 * Detects language mixing signals (Sheng/Kiswahili/English)
 * @param {string} text 
 * @returns {{ sheng: boolean, kiswahili: boolean, english: boolean }}
 */
function detectLanguageMix(text) {
  const shengWords   = ['manze', 'buda', 'niaje', 'wapi', 'poa', 'sema', 'fiti', 'mtaa', 'ghetto', 'dame', 'chali'];
  const swahiliWords = ['mimi', 'wewe', 'yeye', 'sisi', 'wao', 'nini', 'kweli', 'lakini', 'maisha', 'nguvu', 'roho'];
  const lower = text.toLowerCase();
  return {
    sheng:     shengWords.some(w   => lower.includes(w)),
    kiswahili: swahiliWords.some(w => lower.includes(w)),
    english:   true, // base assumption
  };
}

/**
 * Master parse function — combines all analysis
 * @param {object} userInputs - keyed answers from the questionnaire
 * @returns {object} parsedIdentity
 */
function parseIdentity(userInputs) {
  const fullText = Object.values(userInputs).join(' ');

  return {
    rawInputs:    userInputs,
    emotions:     detectEmotions(fullText),
    conflicts:    detectConflicts(fullText),
    traits:       extractTraits(fullText),
    languageMix:  detectLanguageMix(fullText),
    wordCount:    fullText.split(/\s+/).length,
    timestamp:    new Date().toISOString(),
  };
}

module.exports = { parseIdentity, detectEmotions, detectConflicts, extractTraits, detectLanguageMix };
