/**
 * messageExtractor.js
 * 
 * Derives the core message and sub-themes from user answers and parsed identity.
 * The core message is the "spine" of the song — the one truth the song will express.
 * Sub-themes provide depth for verses and bridge sections.
 */

// Question-to-theme mapping
// Based on SONG_QUESTIONAIRE.md WH-question categories
const THEME_QUESTION_MAP = {
  coreMessage:    ['what is the main idea', 'what are you saying', 'summarize', 'main point'],
  selfImage:      ['who are you', 'who speaks', 'i am', 'describe yourself'],
  rejection:      ['who are you not', 'what you are not', 'don\'t call me', 'not'],
  desire:         ['what do you want', 'wish', 'hope', 'dream of'],
  conflict:       ['what is the problem', 'struggle', 'fight', 'pain', 'hard'],
  society:        ['what do people say', 'they think', 'world', 'society'],
  transformation: ['how have you changed', 'used to', 'no longer', 'now i'],
  love:           ['love', 'heart', 'relationship', 'person', 'together'],
  place:          ['where', 'nairobi', 'mtaa', 'home', 'environment', 'streets'],
};

// Conflict type → default core message templates
const CONFLICT_MESSAGE_TEMPLATES = {
  identity_rejection:  'I am defining myself on my own terms, not yours.',
  external_judgment:   'The way you see me is not who I am.',
  transformation:      'I have changed, and I am learning to live with that.',
  stagnation:          'I am searching for a way out of this cycle.',
  duality:             'I live between two worlds and belong to both.',
  isolation:           'I am alone, but I am choosing to speak anyway.',
  ancestral_tension:   'I carry what came before me, but I walk my own path.',
  place_identity:      'Where I come from shaped me, but does not own me.',
};

/**
 * Extract the most message-rich answer from user inputs
 * @param {object} rawInputs 
 * @returns {string}
 */
function findAnchorAnswer(rawInputs) {
  // Look for answers to identity/message questions specifically
  const keys = ['whoAreYouNot', 'coreMessage', 'emotionalTruth', 'socialConflict', 'mainIdea'];
  for (const key of keys) {
    if (rawInputs[key] && rawInputs[key].trim().length > 10) {
      return rawInputs[key];
    }
  }
  // Fallback: longest answer
  return Object.values(rawInputs)
    .filter(v => typeof v === 'string')
    .sort((a, b) => b.length - a.length)[0] || '';
}

/**
 * Detect sub-themes from combined text
 * @param {string} text 
 * @returns {Array<string>}
 */
function extractSubThemes(text) {
  const lower = text.toLowerCase();
  const themes = [];

  for (const [theme, signals] of Object.entries(THEME_QUESTION_MAP)) {
    if (signals.some(s => lower.includes(s))) {
      themes.push(theme);
    }
  }

  return [...new Set(themes)]; // deduplicate
}

/**
 * Build a concise core message from identity data
 * @param {object} parsedIdentity 
 * @returns {string}
 */
function buildCoreMessage(parsedIdentity) {
  const { conflicts, rawInputs } = parsedIdentity;

  // If user gave explicit main idea, use it
  const explicit = rawInputs.mainIdea || rawInputs.coreMessage;
  if (explicit && explicit.trim().length > 8) {
    return explicit.trim();
  }

  // Derive from primary conflict
  const primaryConflict = conflicts.length > 0 ? conflicts[0].type : null;
  if (primaryConflict && CONFLICT_MESSAGE_TEMPLATES[primaryConflict]) {
    return CONFLICT_MESSAGE_TEMPLATES[primaryConflict];
  }

  // Generic fallback
  const anchor = findAnchorAnswer(rawInputs);
  if (anchor.length > 0) {
    const firstSentence = anchor.split(/[.!?]/)[0].trim();
    return firstSentence.length > 10 ? firstSentence : anchor.substring(0, 80);
  }

  return 'A voice finding its truth in the noise.';
}

/**
 * Master extractor
 * @param {object} parsedIdentity 
 * @returns {{ coreMessage: string, subThemes: Array<string> }}
 */
function extractMessage(parsedIdentity) {
  const fullText = Object.values(parsedIdentity.rawInputs).join(' ');

  return {
    coreMessage: buildCoreMessage(parsedIdentity),
    subThemes:   extractSubThemes(fullText),
  };
}

module.exports = { extractMessage, extractSubThemes, buildCoreMessage };
