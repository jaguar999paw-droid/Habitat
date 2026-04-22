/**
 * defaultPersonaData.js — SCI Default Persona Configurations v1
 *
 * Rich, culturally grounded defaults for the identity engine.
 * Designed for Gen-Z artists in East Africa and beyond.
 *
 * Philosophy: A blank canvas is not neutral. It is terrifying.
 * Pre-loading the canvas with living archetypes gives the artist
 * something to push AGAINST — which is where the song begins.
 *
 * "Mtu ni watu" — A person is people. Identity is always relational.
 */

// ── Gen-Z Artist Archetypes ─────────────────────────────────────────────────
const GENZ_ARCHETYPES = [
  {
    id:          'the_architect',
    label:       'The Architect',
    description: 'Builds worlds with words. Every bar is a blueprint.',
    emoji:       '🏗',
    defaultEnergy:    72,
    defaultRawness:   45,
    defaultEmotion:   'pride',
    defaultConflict:  'transformation',
    defaultLanguage:  ['en'],
    defaultAlterEgo:  'the_witness',
    soulAnchor:  'I build what others said couldn\'t be built.',
    shadowSelf:  'The architect who builds prisons, not bridges.',
    spiritualNote: 'Every structure carries the spirit of its maker.',
  },
  {
    id:          'the_street_oracle',
    label:       'The Street Oracle',
    description: 'Sees the truth others walk past every day.',
    emoji:       '👁',
    defaultEnergy:    65,
    defaultRawness:   80,
    defaultEmotion:   'defiance',
    defaultConflict:  'place_identity',
    defaultLanguage:  ['en', 'sheng'],
    defaultAlterEgo:  'the_street_philosopher',
    soulAnchor:  'The mtaa taught me what no classroom could.',
    shadowSelf:  'The prophet no one listens to.',
    spiritualNote: 'Truth doesn\'t need a platform. It just needs a voice.',
  },
  {
    id:          'the_healer',
    label:       'The Healer',
    description: 'Converts personal pain into collective medicine.',
    emoji:       '🌱',
    defaultEnergy:    48,
    defaultRawness:   65,
    defaultEmotion:   'vulnerability',
    defaultConflict:  'ancestral_tension',
    defaultLanguage:  ['en', 'sw'],
    defaultAlterEgo:  'the_confessor',
    soulAnchor:  'My wounds are maps for others who are lost.',
    shadowSelf:  'The wounded healer who never heals themselves.',
    spiritualNote: 'Healing is not fixing. It is bearing witness.',
  },
  {
    id:          'the_cypher_king',
    label:       'The Cypher King',
    description: 'Lives for the circle. Every bar is a battle and a gift.',
    emoji:       '🔥',
    defaultEnergy:    92,
    defaultRawness:   88,
    defaultEmotion:   'defiance',
    defaultConflict:  'external_judgment',
    defaultLanguage:  ['en', 'sheng'],
    defaultAlterEgo:  'the_trickster',
    soulAnchor:  'I came to spit what they\'re scared to say.',
    shadowSelf:  'The battle rapper who forgot what they were fighting for.',
    spiritualNote: 'The cipher is a sacred circle. Every voice matters.',
  },
  {
    id:          'the_time_traveller',
    label:       'The Time Traveller',
    description: 'Moves between past, present, and becoming with ease.',
    emoji:       '⏳',
    defaultEnergy:    58,
    defaultRawness:   55,
    defaultEmotion:   'longing',
    defaultConflict:  'transformation',
    defaultLanguage:  ['en'],
    defaultAlterEgo:  'the_ghost',
    soulAnchor:  'I carry my past but I am not buried by it.',
    shadowSelf:  'The one who lives so far in the past they never arrive.',
    spiritualNote: 'Time is not linear. You are all your selves at once.',
  },
  {
    id:          'the_code_switcher',
    label:       'The Code Switcher',
    description: 'Moves between worlds like water. English, Sheng, silence.',
    emoji:       '🔀',
    defaultEnergy:    68,
    defaultRawness:   60,
    defaultEmotion:   'pride',
    defaultConflict:  'duality',
    defaultLanguage:  ['en', 'sw', 'sheng'],
    defaultAlterEgo:  'none',
    soulAnchor:  'I am fluent in every version of myself.',
    shadowSelf:  'The one who belongs nowhere because they fit everywhere.',
    spiritualNote: 'To speak many tongues is to carry many ancestors.',
  },
];

// ── Default identity config (rich, not blank) ───────────────────────────────
const RICH_DEFAULT_IDENTITY_CONFIG = {
  past: {
    actual: {
      description: 'The version of you that made you possible',
      enabled:     true,
      weight:      0.7,
      anchors: [
        'I survived something that was supposed to break me',
        'There was a version of me who didn\'t know this yet',
        'I am the answer to questions my past self hadn\'t learned to ask',
      ],
    },
    alternative: {
      description: 'The road not taken — still alive in you',
      enabled:     false,
      weight:      0.3,
      anchors: [
        'I could have become someone entirely different',
        'There is a version of this story where I chose differently',
        'The shadow of who I could have been still walks beside me',
      ],
    },
  },
  present: {
    actual: {
      description: 'Who you genuinely are right now — contradictions and all',
      enabled:     true,
      weight:      1.0,
      anchors: [
        'I contain things I haven\'t resolved and I\'m done pretending otherwise',
        'I am not what happened to me — but I am shaped by it',
        'I hold my contradictions without apology',
      ],
    },
    alternative: {
      description: 'The next version of you — both desired and feared',
      enabled:     true,
      weight:      0.5,
      anchors: [
        'I am becoming something I can\'t fully see yet',
        'There is a version of me I\'m working toward — and one I\'m working away from',
        'Change is not loss. It is addition.',
      ],
    },
  },
  future: {
    projected: {
      description: 'The self you\'re committed to becoming',
      enabled:     true,
      weight:      0.6,
      anchors: [
        'Every choice I make now is a vote for who I become',
        'I am not where my story ends',
        'The version of me who made it through is already watching',
      ],
    },
    alternative: {
      description: 'The feared or uncertain future — the possibility you don\'t speak',
      enabled:     true,
      weight:      0.35,
      anchors: [
        'There are versions of my future that frighten me',
        'I might end up somewhere I never intended',
        'The fear of becoming what I\'ve fought against is real',
      ],
    },
  },
  activeTensions: ['past_actual_to_now_actual', 'now_actual_to_future_projected'],
  markers:  { place: null, era: null, event: null, person: null, object: null },
  alterEgos: [],
  activeAlterEgo: null,
  controls: {
    contradiction: { enabled: true, decisiveness: 45 }, // slightly uncertain by default
    change:        { enabled: true, direction: 'forward' },
    absolution:    { seeking: false, granted: false, from_whom: 'self' },
    attribution:   { internal: 55, external: 45 },
    temporalFocus: { past: 25, present: 55, future: 20 }, // weighted toward now
  },
  // Spiritual/philosophical layer
  spirit: {
    enabled: false,
    tradition: null, // 'african', 'buddhist', 'abrahamic', 'stoic', 'none'
    anchors: [
      'I am connected to something larger than this moment',
      'My story is part of a longer story',
    ],
  },
};

// ── Default craft config (opinionated, not blank) ───────────────────────────
const RICH_DEFAULT_CRAFT = {
  rawness:            55,  // honest but not chaotic
  energy:             65,  // present and engaged
  rhymeScheme:        'ABAB',
  perspective:        '1st',
  languageMix:        ['en'],
  rhetoricalDevices:  ['metaphor', 'anaphora'],
  humorType:          'none',
  humorIntensity:     0,
  dictionLevel:       'natural',
  grammarIntentionality: 'standard', // standard | bending | broken
  meter:              'free',
  momentum:           'sustain',
  resolution:         'ambiguous',
  narratorMorality:   'morally_grey',
  restraint:          50,  // half-open by default
  // Duality defaults
  dualityMode:        'light', // light | full | spiritual
  showShadowFields:   false,
  contradictionMode:  'hold',
};

// ── Studio mode defaults ─────────────────────────────────────────────────────
const STUDIO_MODE_DEFAULTS = {
  cypher: {
    energy:    95,
    rawness:   85,
    rhyme:     'AABB',
    lines:     16,
    tempo:     'fast',
    flow:      'triplet',
    barFormat: 'bars', // 4-bar, 8-bar, 16-bar
    language:  ['en', 'sheng'],
    goMode:    true, // no analysis, straight to generation
  },
  battle: {
    energy:    100,
    rawness:   90,
    rhyme:     'AABB',
    lines:     8,
    tempo:     'fast',
    flow:      'aggressive',
    punchline: true,
    language:  ['en', 'sheng'],
    structure: 'challenge-response',
  },
  analysis: {
    depth:     'full',
    extract:   ['message', 'identity', 'emotion', 'conflict', 'temporal', 'duality'],
    output:    'structured', // structured | narrative | both
  },
  juxtaposition: {
    identities:   2,
    tensions:     ['past_now', 'self_world', 'stated_shadow'],
    synthesis:    true,
    songOutput:   true,
  },
};

// ── Spiritual anchor library ──────────────────────────────────────────────────
const SPIRITUAL_ANCHORS = {
  universal: [
    'The song is a prayer spoken sideways',
    'There is a wound here that wants to become a window',
    'What you are carrying was not meant to be carried alone',
    'The music knows what the words can\'t say yet',
    'Every artist is a vessel — what is flowing through you?',
  ],
  african: [
    'Ubuntu: I am because we are. What does this song owe the community?',
    'The ancestors speak through the artist who is willing to be honest',
    'Memory is not nostalgia. It is lineage speaking.',
    'Harambee: what are you building together through this music?',
  ],
  eastern: [
    'The emptiness in the song is where the listener breathes',
    'Non-attachment: can you write this without needing it to be received a certain way?',
    'The river does not wonder if it\'s flowing. What does that teach you?',
  ],
  stoic: [
    'What about this can you not control? Write from there.',
    'Memento mori: this song exists because you are mortal. What does it need to leave behind?',
    'The obstacle is the song.',
  ],
};

// ── Questionnaire generator ──────────────────────────────────────────────────
function generatePersonaQuestions(mode = 'standard') {
  const banks = {
    standard: [
      { id: 'origin',     q: 'Where did this begin? Not today — the actual beginning.' },
      { id: 'wound',      q: 'What hurt you in a way that didn\'t go away?' },
      { id: 'power',      q: 'What do you know that they don\'t?' },
      { id: 'secret',     q: 'What truth do you hold that you haven\'t said out loud?' },
      { id: 'refusal',    q: 'What are you refusing to become, even now?' },
      { id: 'becoming',   q: 'Who are you in the middle of becoming?' },
    ],
    spiritual: [
      { id: 'calling',    q: 'What called you to this? Before the skill, before the practice — what pulled you?' },
      { id: 'offering',   q: 'If this song were a prayer, what would you be asking for?' },
      { id: 'lineage',    q: 'Whose voice lives in yours? Who made you possible?' },
      { id: 'surrender',  q: 'What would you need to let go of to sing this fully?' },
    ],
    genz: [
      { id: 'twitter',    q: 'What\'s the thought you\'re scared to post?' },
      { id: 'no_context', q: 'What\'s something from your life that nobody would understand without context?' },
      { id: 'era',        q: 'What era of your life are you still not over?' },
      { id: 'vibe',       q: 'What\'s the vibe you\'re trying to create? Describe it without naming a genre.' },
      { id: 'facts',      q: 'What fact about yourself do you lead with? What fact do you hide?' },
    ],
    cypher: [
      { id: 'claim',      q: 'What\'s your claim? State it in 8 words or less.' },
      { id: 'proof',      q: 'What\'s your proof? Not your credentials — your lived experience.' },
      { id: 'target',     q: 'Who are you addressing? Be specific — even if it\'s yourself.' },
      { id: 'punchline',  q: 'What\'s the line that ends the argument?' },
    ],
  };
  return banks[mode] || banks.standard;
}

module.exports = {
  GENZ_ARCHETYPES,
  RICH_DEFAULT_IDENTITY_CONFIG,
  RICH_DEFAULT_CRAFT,
  STUDIO_MODE_DEFAULTS,
  SPIRITUAL_ANCHORS,
  generatePersonaQuestions,
};
