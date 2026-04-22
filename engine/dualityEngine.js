/**
 * dualityEngine.js — SCI Duality Reasoning Layer v1
 *
 * Philosophy: Every truth carries its own shadow.
 * To know what something IS, you must know what it IS NOT.
 * To know WHY, you must know WHY NOT.
 * To know WHO you are, you must sit with who you are refusing to be.
 *
 * Draws from:
 *   - Hegel: Thesis / Antithesis / Synthesis (the dialectic)
 *   - Sartre: You are defined by what you choose NOT to be
 *   - Jungian shadow: The unlived life lives beneath the stated one
 *   - Buddhist duality: Form and emptiness co-arise
 *   - Square of Opposition: Contradiction / Contrary / Subcontrary / Subalternation
 *   - Nairobi street philosophy: "Mtu ni watu" — but who is the mtu that stands AGAINST?
 *
 * Core function: Given a "what", produce its negation shadow.
 * Given a "why", surface its "why not".
 * Every answer in SCI is a duality — the stated and the unstated.
 */

// ── Duality question generators ─────────────────────────────────────────────

const DUALITY_QUESTIONS = {
  coreMessage: {
    what:    'If this song could say ONE thing — what would it be?',
    whatNot: 'What is this song REFUSING to say? What truth is it protecting you from?',
    why:     'Why does this need to be said NOW?',
    whyNot:  'Why has it NOT been said until now? What has been in the way?',
  },
  emotionalTruth: {
    what:    'The emotion you haven\'t said out loud. The 2am feeling.',
    whatNot: 'The emotion you are PERFORMING instead. The face you show.',
    why:     'Why does this feeling have power over you?',
    whyNot:  'Why won\'t you let yourself simply feel the opposite?',
  },
  socialConflict: {
    what:    'What does the world get wrong about you?',
    whatNot: 'What does the world get RIGHT — that you wish it didn\'t?',
    why:     'Why does their misunderstanding matter?',
    whyNot:  'Why haven\'t you corrected it? What does being misunderstood protect?',
  },
  identity: {
    what:    'Who are you in this song?',
    whatNot: 'Who are you REFUSING to be in this song?',
    why:     'Why claim this identity?',
    whyNot:  'Why abandon the other identity? What did it cost you?',
  },
};

// ── Logical relation types ───────────────────────────────────────────────────

const LOGICAL_RELATIONS = {
  CONTRADICTION: {
    label:       'CONTRADICTION',
    description: 'A and NOT-A. Both cannot be true AND both cannot be false.',
    tension:     1.0,
    instruction: 'Do NOT resolve. Hold both truths simultaneously. This IS the song.',
    example:     '"I am strong" ↔ "I am terrified" — only one can be true, but both ARE true.',
    color:       'magenta',
    symbol:      '⊥',
  },
  CONTRARY: {
    label:       'CONTRARY',
    description: 'A and B: both cannot be true, but both can be false. The gap between them IS the story.',
    tension:     0.75,
    instruction: 'Write into the gap. The song lives in the space between both being false.',
    example:     '"I am completely free" ↔ "I am completely trapped" — neither is fully true.',
    color:       'amber',
    symbol:      '⌂',
  },
  SUBCONTRARY: {
    label:       'SUBCONTRARY',
    description: 'A and B: both can be true, but both cannot be false. At least one IS true.',
    tension:     0.5,
    instruction: 'Both truths exist. Do NOT simplify. Let the paradox breathe.',
    example:     '"Sometimes I love this life" ↔ "Sometimes I hate this life" — both are real.',
    color:       'teal',
    symbol:      '≈',
  },
  SUBALTERNATION: {
    label:       'SUBALTERNATION',
    description: 'The general truth implies the specific. Descent from claim to wound.',
    tension:     0.4,
    instruction: 'Move from the universal to the specific. What does this claim cost in flesh and bone?',
    example:     '"People never listen" → "You never listened to me that night".',
    color:       'blue',
    symbol:      '↘',
  },
};

// ── Shadow word map ──────────────────────────────────────────────────────────
// Given a concept, return its philosophical negation / shadow

const SHADOW_MAP = {
  // Emotions → their shadow
  'anger':       'numbness',
  'sadness':     'forced joy',
  'defiance':    'compliance',
  'longing':     'detachment',
  'pride':       'shame',
  'confusion':   'false certainty',
  'joy':         'hollowness',
  'vulnerability': 'armor',
  'love':        'self-abandonment',
  'fear':        'recklessness',
  'grief':       'pretending it doesn\'t hurt',
  'rage':        'silence',
  // Archetypes → their shadow
  'The Defiant':     'The Obedient',
  'The Misunderstood': 'The Seen',
  'The Transformer': 'The Frozen',
  'The Seeker':      'The Settler',
  'The Bridge Walker': 'The Purist',
  'The Lone Voice':  'The Crowd',
  'The Heir':        'The Orphan',
  'The Grounded':    'The Uprooted',
  'The Observer':    'The Participant',
  // Identity states
  'introspective':   'performing extroversion',
  'assertive':       'suppressing doubt',
  'spiritual':       'spiritual bypassing',
  'streetwise':      'performing toughness',
  'wounded':         'pretending wholeness',
};

// ── Core duality analysis ────────────────────────────────────────────────────

/**
 * Analyze the duality structure of user inputs.
 * Returns: stated positions, shadow positions, logical relation, synthesis suggestion.
 */
function analyzeDuality(userInputs, parsedIdentity) {
  const { mainIdea, emotionalTruth, socialConflict } = userInputs;
  const fullText = [mainIdea, emotionalTruth, socialConflict].filter(Boolean).join(' ');

  // Detect stated positions
  const stated = {
    message:   mainIdea || '',
    emotion:   emotionalTruth || '',
    conflict:  socialConflict || '',
  };

  // Derive shadow positions
  const shadow = {
    message:   deriveShadow(mainIdea, 'message'),
    emotion:   deriveShadow(emotionalTruth, 'emotion'),
    conflict:  deriveShadow(socialConflict, 'conflict'),
  };

  // Detect logical relation between stated and shadow
  const logicalRelation = detectLogicalRelation(stated, shadow, parsedIdentity);

  // Generate synthesis — the song that emerges from the tension
  const synthesis = buildSynthesis(stated, shadow, logicalRelation);

  // Generate duality prompts for the UI
  const uiPrompts = {
    coreMessage:    DUALITY_QUESTIONS.coreMessage,
    emotionalTruth: DUALITY_QUESTIONS.emotionalTruth,
    socialConflict: DUALITY_QUESTIONS.socialConflict,
    identity:       DUALITY_QUESTIONS.identity,
  };

  // Archetype shadow
  const archetypeShadow = parsedIdentity?.persona?.archetype
    ? SHADOW_MAP[parsedIdentity.persona.archetype] || 'the unlived version'
    : null;

  return {
    stated,
    shadow,
    logicalRelation,
    synthesis,
    uiPrompts,
    archetypeShadow,
    dualityScore:  logicalRelation.tension,
    songIsIn:      getSongLocation(logicalRelation),
  };
}

function deriveShadow(text, type) {
  if (!text || text.trim().length < 3) return null;
  const lower = text.toLowerCase();

  // Check direct shadow map
  for (const [concept, shadow] of Object.entries(SHADOW_MAP)) {
    if (lower.includes(concept.toLowerCase())) return shadow;
  }

  // Generate linguistic negation shadow
  if (type === 'emotion') {
    if (/strong|power|confident/.test(lower)) return 'the terror beneath the strength';
    if (/happy|joy|good/.test(lower)) return 'what you\'re suppressing to stay here';
    if (/sad|hurt|broken/.test(lower)) return 'the part of you that refuses to break';
    if (/alone|isolated/.test(lower)) return 'the connections you\'re pushing away';
    return 'the feeling you perform instead';
  }
  if (type === 'conflict') {
    if (/they|people|world/.test(lower)) return 'what they\'re getting RIGHT about you';
    if (/misunderstood/.test(lower)) return 'how you misunderstand yourself';
    return 'the version of this story where you are wrong';
  }
  if (type === 'message') {
    if (/love/.test(lower)) return 'the cost of that love';
    if (/free|freedom/.test(lower)) return 'what you\'ve abandoned to be free';
    if (/survive|survival/.test(lower)) return 'what you\'ve lost by surviving';
    return 'what this claim costs you to make';
  }
  return 'the unlived version of this';
}

function detectLogicalRelation(stated, shadow, parsedIdentity) {
  // Use temporal parser's existing relation if available
  const existing = parsedIdentity?.temporalProfile?.logicalRelation;
  if (existing && existing.confidence >= 0.6) {
    return {
      ...LOGICAL_RELATIONS[existing.relation],
      confidence: existing.confidence,
      source: 'temporal_parser',
    };
  }

  // Detect from content patterns
  const fullStated = Object.values(stated).join(' ').toLowerCase();
  const fullShadow  = Object.values(shadow).filter(Boolean).join(' ').toLowerCase();

  // Strong contradiction signals
  if (/but i also|at the same time|yet i still|both/.test(fullStated)) {
    return { ...LOGICAL_RELATIONS.CONTRADICTION, confidence: 0.8, source: 'content_pattern' };
  }
  if (/sometimes|other times|depends/.test(fullStated)) {
    return { ...LOGICAL_RELATIONS.SUBCONTRARY, confidence: 0.75, source: 'content_pattern' };
  }
  if (/not (really|sure|certain)|almost|partially/.test(fullStated)) {
    return { ...LOGICAL_RELATIONS.CONTRARY, confidence: 0.7, source: 'content_pattern' };
  }

  // Default: CONTRARY (most songwriting-rich)
  return { ...LOGICAL_RELATIONS.CONTRARY, confidence: 0.5, source: 'default' };
}

function buildSynthesis(stated, shadow, logicalRelation) {
  const { label } = logicalRelation;
  if (label === 'CONTRADICTION') {
    return `The song IS the contradiction. Do not explain it. Do not resolve it. Let the listener hold both truths and feel the weight of being unable to choose.`;
  }
  if (label === 'CONTRARY') {
    return `The song lives in the gap. Neither the stated truth nor its shadow is fully correct — the real truth is somewhere in the dark between them.`;
  }
  if (label === 'SUBCONTRARY') {
    return `Both truths are real. The song's power comes from affirming both without apology. This is not confusion — this is the complexity of being alive.`;
  }
  return `The song descends from the general claim into specific, personal, embodied truth. Move from "people never listen" to "you never listened that night."`;
}

function getSongLocation(relation) {
  const map = {
    CONTRADICTION: 'in the unresolved tension between both truths',
    CONTRARY:      'in the gap where neither extreme is true',
    SUBCONTRARY:   'in the fullness of holding both realities',
    SUBALTERNATION:'in the descent from abstract to embodied',
  };
  return map[relation.label] || 'in the space between what is said and what is not';
}

// ── Prompt injection for duality reasoning ───────────────────────────────────

function buildDualityBlock(dualityAnalysis, section) {
  if (!dualityAnalysis) return '';
  const { stated, shadow, logicalRelation, synthesis, songIsIn } = dualityAnalysis;

  const lines = ['\n--- DUALITY LAYER ---'];
  lines.push(`LOGICAL RELATION: ${logicalRelation.label} ${logicalRelation.symbol || ''}`);
  lines.push(`What the song IS: ${stated.message || '(not stated)'}`);
  if (shadow.message) lines.push(`What the song IS NOT saying: ${shadow.message}`);
  if (stated.emotion) lines.push(`Stated emotion: ${stated.emotion}`);
  if (shadow.emotion) lines.push(`Shadow emotion (the unperformed truth): ${shadow.emotion}`);
  lines.push(`The song lives: ${songIsIn}`);
  lines.push(`SYNTHESIS INSTRUCTION: ${synthesis}`);
  lines.push('--- END DUALITY LAYER ---');
  return lines.join('\n') + '\n';
}

// ── UI Question API ──────────────────────────────────────────────────────────

function getDualityQuestions(field) {
  return DUALITY_QUESTIONS[field] || null;
}

function getAllDualityPrompts() {
  return DUALITY_QUESTIONS;
}

function getLogicalRelations() {
  return LOGICAL_RELATIONS;
}

// ── Engine-learning: default question postures for new users ─────────────────

const DEFAULT_DUALITY_POSTURE = {
  showShadowFields:  false, // progressive disclosure — shadow fields hidden by default
  dualityDepth:      'light', // 'light' | 'full' | 'spiritual'
  contradictionMode: 'hold', // 'hold' | 'resolve' | 'transcend'
  shadowPrompting:   true,   // suggest shadow prompts when input is too certain
};

module.exports = {
  analyzeDuality,
  buildDualityBlock,
  getDualityQuestions,
  getAllDualityPrompts,
  getLogicalRelations,
  SHADOW_MAP,
  LOGICAL_RELATIONS,
  DUALITY_QUESTIONS,
  DEFAULT_DUALITY_POSTURE,
};
