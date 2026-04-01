/**
 * structurePlanner.js
 * 
 * Dynamically generates a song structure (section plan) based on:
 * - Conflict type
 * - Emotional intensity
 * - Number of sub-themes
 * - Energy level of the persona
 * 
 * Output: an ordered array of section objects with type and goal.
 */

/**
 * Section blueprints library
 * Each blueprint defines a section type + purpose + description
 */
const SECTION_BLUEPRINTS = {
  verse_introduce_conflict: {
    type: 'verse',
    goal: 'introduce_conflict',
    description: 'Set the scene. Introduce who is speaking and what tension exists.',
    lines: 8,
  },
  verse_expand_struggle: {
    type: 'verse',
    goal: 'expand_internal_struggle',
    description: 'Go deeper into the internal world. Show contradictions.',
    lines: 8,
  },
  verse_external_world: {
    type: 'verse',
    goal: 'describe_external_pressure',
    description: 'Show how the outside world sees or judges the speaker.',
    lines: 8,
  },
  verse_memory: {
    type: 'verse',
    goal: 'recall_origin',
    description: 'Reference a formative memory or moment of identity formation.',
    lines: 6,
  },
  hook_core_question: {
    type: 'hook',
    goal: 'express_core_question',
    description: 'Repeat the emotional core. The unanswered question or declaration.',
    lines: 4,
  },
  hook_declaration: {
    type: 'hook',
    goal: 'declare_identity',
    description: 'A bold, repeatable statement of who the speaker is.',
    lines: 4,
  },
  pre_hook: {
    type: 'pre-hook',
    goal: 'build_tension_before_hook',
    description: 'A 2-bar transition that escalates into the hook.',
    lines: 2,
  },
  bridge_realization: {
    type: 'bridge',
    goal: 'realization',
    description: 'A shift in perspective — the speaker sees something differently.',
    lines: 6,
  },
  bridge_surrender: {
    type: 'bridge',
    goal: 'surrender_or_acceptance',
    description: 'The speaker stops fighting and accepts a truth.',
    lines: 6,
  },
  outro_resolution: {
    type: 'outro',
    goal: 'resolution_or_open_end',
    description: 'Leave the listener with the final emotional impression.',
    lines: 4,
  },
  intro: {
    type: 'intro',
    goal: 'establish_atmosphere',
    description: 'Set the sonic/emotional tone before lyrics begin.',
    lines: 2,
  },
};

/**
 * Preset structure templates by conflict type
 */
const STRUCTURE_TEMPLATES = {
  identity_rejection: [
    'verse_introduce_conflict',
    'hook_declaration',
    'verse_expand_struggle',
    'hook_declaration',
    'bridge_realization',
    'hook_declaration',
  ],
  external_judgment: [
    'verse_introduce_conflict',
    'pre_hook',
    'hook_core_question',
    'verse_external_world',
    'pre_hook',
    'hook_core_question',
    'bridge_realization',
    'hook_core_question',
  ],
  transformation: [
    'verse_memory',
    'hook_declaration',
    'verse_introduce_conflict',
    'hook_declaration',
    'bridge_surrender',
    'outro_resolution',
  ],
  stagnation: [
    'verse_introduce_conflict',
    'hook_core_question',
    'verse_expand_struggle',
    'hook_core_question',
    'bridge_realization',
    'hook_declaration',
  ],
  duality: [
    'verse_introduce_conflict',
    'verse_external_world',
    'hook_core_question',
    'verse_expand_struggle',
    'hook_core_question',
    'bridge_realization',
    'outro_resolution',
  ],
  isolation: [
    'intro',
    'verse_introduce_conflict',
    'hook_core_question',
    'verse_expand_struggle',
    'bridge_surrender',
    'outro_resolution',
  ],
  ancestral_tension: [
    'verse_memory',
    'hook_declaration',
    'verse_introduce_conflict',
    'hook_declaration',
    'bridge_realization',
    'hook_declaration',
  ],
  place_identity: [
    'verse_introduce_conflict',
    'hook_declaration',
    'verse_external_world',
    'hook_declaration',
    'bridge_realization',
    'outro_resolution',
  ],
};

// Default structure when no conflict is identified
const DEFAULT_STRUCTURE = [
  'verse_introduce_conflict',
  'hook_core_question',
  'verse_expand_struggle',
  'hook_core_question',
  'bridge_realization',
  'hook_core_question',
];

/**
 * Plan the song structure
 * @param {object} persona - from personaBuilder
 * @param {object} message - from messageExtractor
 * @returns {Array<object>} - ordered section plan
 */
function planStructure(persona, message) {
  const conflictType = persona.dominantConflict;
  const templateKeys = STRUCTURE_TEMPLATES[conflictType] || DEFAULT_STRUCTURE;

  // Build the section plan
  const plan = templateKeys.map((key, index) => {
    const blueprint = SECTION_BLUEPRINTS[key];
    return {
      index:        index + 1,
      type:         blueprint.type,
      goal:         blueprint.goal,
      description:  blueprint.description,
      lines:        blueprint.lines,
      tone:         persona.tone,
      perspective:  persona.perspective,
      energy:       persona.energy,
      languageMix:  persona.languageMix,
    };
  });

  return {
    sections:      plan,
    totalSections: plan.length,
    conflictType:  conflictType || 'general',
    coreMessage:   message.coreMessage,
  };
}

module.exports = { planStructure, SECTION_BLUEPRINTS, STRUCTURE_TEMPLATES };
