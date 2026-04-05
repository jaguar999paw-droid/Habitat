/**
 * styleMapper.js — v2
 *
 * Determines rhyme scheme, flow style, language blending, rawness level,
 * and lyrical devices for each song.
 *
 * v2 additions:
 *   - rawness field (0–100) → polished / honest / unfiltered descriptor
 *   - rhymeScheme can be overridden from cockpit picker
 *   - INTERNAL rhyme added to swatch list
 */

const RHYME_SCHEMES = {
  AABB:     { label:'AABB (Couplet)',     description:'Lines 1-2 rhyme, lines 3-4 rhyme. Clean and direct.' },
  ABAB:     { label:'ABAB (Alternating)', description:'Alternating rhyme. More complex, flowing.' },
  ABCB:     { label:'ABCB (Ballad)',      description:'Lines 2 and 4 rhyme. Narrative, storytelling feel.' },
  AAAA:     { label:'AAAA (Monorhyme)',   description:'All lines rhyme. Intense, hypnotic, drill/trap style.' },
  FREE:     { label:'Free Verse',         description:'No strict rhyme. Focus on imagery and truth.' },
  INTERNAL: { label:'Internal Rhyme',     description:'Rhymes within lines. Rap/hip-hop flow.' },
};

const ARCHETYPE_RHYME_MAP = {
  'The Defiant':       'AAAA',
  'The Misunderstood': 'ABCB',
  'The Transformer':   'ABAB',
  'The Seeker':        'FREE',
  'The Bridge Walker': 'ABAB',
  'The Lone Voice':    'ABCB',
  'The Heir':          'ABAB',
  'The Grounded':      'INTERNAL',
  'The Observer':      'FREE',
};

const ENERGY_FLOW_MAP = {
  high:          'fast, punchy bars — short lines, staccato delivery',
  'medium-high': 'mid-tempo flow — confident, with deliberate pauses',
  medium:        'conversational flow — natural speech rhythm',
  low:           'slow, stretched delivery — elongated vowels, breath between lines',
};

const LANGUAGE_BLEND_INSTRUCTIONS = {
  'English':                     'Write entirely in English. Vivid, expressive vocabulary.',
  'English + Kiswahili':         'Primarily English. Sprinkle Kiswahili for emotional depth and cultural authenticity (e.g., "roho", "nguvu", "maisha").',
  'English + Sheng':             'Primarily English. Use Sheng for street authenticity and character voice (e.g., "manze", "poa", "fiti").',
  'English + Kiswahili + Sheng': 'Blend all three. English for clarity, Kiswahili for depth, Sheng for street voice. Balance across sections.',
};

const IMAGERY_MAP = {
  anger:         'sharp imagery — fire, clashes, broken things, noise',
  sadness:       'soft imagery — water, fading light, empty spaces, silence',
  defiance:      'bold imagery — standing tall, unbreakable, storms, fists',
  longing:       'distant imagery — horizons, echoes, faded photos, smoke',
  pride:         'grounded imagery — roots, soil, earned scars, sunrise',
  confusion:     'fog imagery — mist, crossroads, half-open doors, static',
  joy:           'bright imagery — light, warmth, wide spaces, color',
  vulnerability: 'bare imagery — exposed skin, still water, naked truth',
};

/**
 * Rawness descriptor — maps 0–100 slider to prose instructions
 * @param {number} rawness - 0 (polished) to 100 (unfiltered)
 * @returns {string}
 */
function getRawnessDescriptor(rawness = 50) {
  if (rawness < 30)  return 'polished, metaphor-heavy, indirect imagery — say it beautifully, not bluntly';
  if (rawness <= 70) return 'honest and grounded — mix direct language with figurative imagery';
  return 'unfiltered and confessional — say it plain, blunt, vulnerable, no decoration';
}

/**
 * Map all style decisions
 * @param {object} persona - from personaBuilder
 * @param {object} [overrides] - optional cockpit overrides: { rhymeScheme, rawness }
 * @returns {object} styleMap
 */
function mapStyle(persona, overrides = {}) {
  const rhymeKey    = overrides.rhymeScheme || ARCHETYPE_RHYME_MAP[persona.archetype] || 'ABCB';
  const rhymeScheme = RHYME_SCHEMES[rhymeKey] || RHYME_SCHEMES.ABCB;
  const flowStyle   = ENERGY_FLOW_MAP[persona.energy] || ENERGY_FLOW_MAP.medium;
  const langInstr   = LANGUAGE_BLEND_INSTRUCTIONS[persona.languageMix] || LANGUAGE_BLEND_INSTRUCTIONS['English'];
  const imagery     = IMAGERY_MAP[persona.primaryEmotion] || 'universal imagery';
  const rawness     = overrides.rawness !== undefined ? overrides.rawness : 50;

  const devices = [];
  if (persona.traits?.includes('poetic'))        devices.push('extended metaphor');
  if (persona.traits?.includes('streetwise'))    devices.push('wordplay and double meanings');
  if (persona.traits?.includes('spiritual'))     devices.push('call-and-response patterns');
  if (persona.traits?.includes('introspective')) devices.push('rhetorical questions');
  if (devices.length === 0) devices.push('direct imagery');

  return {
    rhymeScheme:          rhymeScheme.label,
    rhymeDescription:     rhymeScheme.description,
    flowStyle,
    languageInstructions: langInstr,
    imageryStyle:         imagery,
    lyricalDevices:       devices,
    hookStyle:            persona.energy === 'high' ? 'repeatable chant' : 'melodic refrain',
    bridgeStyle:          'contrast — shift tone and imagery from main verses',
    rawness,
    rawnessDescriptor:    getRawnessDescriptor(rawness),
  };
}

module.exports = { mapStyle, getRawnessDescriptor, RHYME_SCHEMES, IMAGERY_MAP };
