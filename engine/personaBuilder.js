/**
 * personaBuilder.js
 * 
 * Builds a structured Persona object from parsed identity data.
 * The persona governs voice, tone, archetype, energy, and language mix
 * for all downstream prompt construction and song generation.
 */

// Archetype map: conflict type → primary archetype
const ARCHETYPE_MAP = {
  identity_rejection: 'The Defiant',
  external_judgment:  'The Misunderstood',
  transformation:     'The Transformer',
  stagnation:         'The Seeker',
  duality:            'The Bridge Walker',
  isolation:          'The Lone Voice',
  ancestral_tension:  'The Heir',
  place_identity:     'The Grounded',
};

// Fallback archetype when no conflict detected
const DEFAULT_ARCHETYPE = 'The Observer';

// Emotion → tone mapping
const EMOTION_TONE_MAP = {
  anger:         'raw, confrontational',
  sadness:       'melancholic, tender',
  defiance:      'bold, unapologetic',
  longing:       'wistful, searching',
  pride:         'confident, celebratory',
  confusion:     'uncertain, questioning',
  joy:           'uplifting, warm',
  vulnerability: 'intimate, exposed',
};

// Trait → voice descriptor
const TRAIT_VOICE_MAP = {
  introspective: 'reflective narrator',
  assertive:     'direct speaker',
  spiritual:     'prophetic voice',
  streetwise:    'authentic street voice',
  poetic:        'lyrical storyteller',
  wounded:       'confessional voice',
};

// Energy mapping from dominant emotion
const ENERGY_MAP = {
  anger:         'high',
  defiance:      'high',
  pride:         'high',
  sadness:       'low',
  vulnerability: 'low',
  confusion:     'medium',
  longing:       'medium',
  joy:           'medium-high',
};

/**
 * Determine perspective (1st/2nd/3rd person) from user inputs
 * Default: first person ("I") for most personal songwriting
 */
function derivePerspective(userInputs) {
  const text = Object.values(userInputs).join(' ').toLowerCase();
  if (/\byou\b|\byour\b/i.test(text) && !/\bi\b|\bmy\b/i.test(text)) return 'second';
  if (/\bhe\b|\bshe\b|\bthey\b/i.test(text) && !/\bi\b|\bmy\b/i.test(text)) return 'third';
  return 'first';
}

/**
 * Build language mix label from detection results
 */
function buildLanguageLabel(languageMix) {
  const parts = [];
  if (languageMix.english)   parts.push('English');
  if (languageMix.kiswahili) parts.push('Kiswahili');
  if (languageMix.sheng)     parts.push('Sheng');
  return parts.join(' + ') || 'English';
}

/**
 * Master persona builder
 * @param {object} parsedIdentity - output of identityParser.parseIdentity()
 * @returns {object} persona
 */
function buildPersona(parsedIdentity) {
  const { emotions, conflicts, traits, languageMix, rawInputs } = parsedIdentity;

  // Primary emotion (highest intensity)
  const primaryEmotion = emotions.length > 0 ? emotions[0].emotion : 'confusion';

  // Primary conflict type
  const primaryConflict = conflicts.length > 0 ? conflicts[0].type : null;

  // Archetype from conflict, fallback to default
  const archetype = ARCHETYPE_MAP[primaryConflict] || DEFAULT_ARCHETYPE;

  // Tone from dominant emotion
  const tone = EMOTION_TONE_MAP[primaryEmotion] || 'introspective, neutral';

  // Energy from emotion
  const energy = ENERGY_MAP[primaryEmotion] || 'medium';

  // Voice from first matching trait
  const voiceTrait = traits.find(t => TRAIT_VOICE_MAP[t]);
  const voice = voiceTrait ? TRAIT_VOICE_MAP[voiceTrait] : 'honest narrator';

  // Perspective
  const perspective = derivePerspective(rawInputs);

  // Language mix
  const languageLabel = buildLanguageLabel(languageMix);

  // Secondary emotions (for bridge/contrast)
  const secondaryEmotions = emotions.slice(1, 3).map(e => e.emotion);

  return {
    voice,
    archetype,
    tone,
    energy,
    perspective,
    languageMix: languageLabel,
    primaryEmotion,
    secondaryEmotions,
    dominantConflict: primaryConflict,
    allConflicts: conflicts.map(c => c.type),
    traits,
  };
}

module.exports = { buildPersona };
