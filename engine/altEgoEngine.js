/**
 * altEgoEngine.js — Alter Ego & Multiple Personality System
 *
 * Allows the user to create up to 3 persona MASKS that layer over the base identity.
 * An alter ego is not a different person — it is a different LENS through which
 * the same person chooses to express themselves.
 *
 * Design principle: The base identity is always the root.
 * Alter egos are creative amplifiers, not substitutes.
 */

const BUILT_IN_ALTER_EGO_ARCHETYPES = [
  {
    id: 'the_confessor', name: 'The Confessor', tagline: 'Nothing is hidden here',
    description: 'The version of you that says everything you normally hold back. Maximum vulnerability, no filter.',
    voice: 'first-person, raw, direct confessional',
    toneMods: { rawness: 85, humorType: 'none', dictionLevel: 'natural', grammarIntentionality: 'intentional_breaks' },
    rhetoricalBias: ['parallelism', 'anaphora'],
  },
  {
    id: 'the_witness', name: 'The Witness', tagline: 'I watched myself from across the room',
    description: 'The version of you that steps outside yourself and narrates with detached clarity.',
    voice: 'third-person or distant first-person, journalistic precision',
    toneMods: { stance: 'objective', dictionLevel: 'natural', grammarIntentionality: 'strict' },
    rhetoricalBias: ['synecdoche', 'chiasmus'],
  },
  {
    id: 'the_trickster', name: 'The Trickster', tagline: 'I laugh because it hurts',
    description: 'The version that uses humor as a weapon and a shield. Wit over tears.',
    voice: 'first-person, irreverent, sharp',
    toneMods: { humorType: 'sarcasm', humorIntensity: 65, dictionLevel: 'mixed', doubleNegatives: 'use' },
    rhetoricalBias: ['antimetabole', 'polyptoton'],
  },
  {
    id: 'the_preacher', name: 'The Preacher', tagline: 'This is what I know to be true',
    description: 'The version that speaks with absolute conviction and moral authority.',
    voice: 'declarative, second-person challenges, prophetic register',
    toneMods: { narratorMorality: 'righteous', dictionLevel: 'elevated', convoFillers: 'prohibit' },
    rhetoricalBias: ['anaphora', 'epistrophe', 'parallelism'],
  },
  {
    id: 'the_ghost', name: 'The Ghost', tagline: 'Speaking from somewhere between',
    description: 'The version that speaks from the past, or as the person who no longer exists. Elegiac, retrospective.',
    voice: 'past-tense, reflective, distant — as if narrating from beyond the moment',
    toneMods: { humorType: 'none', dictionLevel: 'poetic', stance: 'subjective', resolution: 'ambiguous' },
    rhetoricalBias: ['anadiplosis', 'assonance', 'tautology'],
  },
  {
    id: 'the_street_philosopher', name: 'The Street Philosopher', tagline: 'Big truths in small words',
    description: 'The version that finds universal meaning in concrete, everyday details. Grounded wisdom.',
    voice: 'colloquial but deep — the wisdom of lived experience',
    toneMods: { dictionLevel: 'street', grammarIntentionality: 'dialectal', convoFillers: 'allow', stance: 'subjective' },
    rhetoricalBias: ['synecdoche', 'alliteration', 'parallelism'],
  },
];

function createAlterEgo({ name, tagline, description, voice, toneMods = {}, rhetoricalBias = [] }) {
  return {
    id: 'custom_' + name.toLowerCase().replace(/\s+/g, '_'),
    name, tagline, description, voice, toneMods, rhetoricalBias, isCustom: true,
  };
}

/**
 * Apply alter ego modifications to the base craft config.
 * Alter ego MODIFIES the craft config — it does not replace it.
 */
function applyAlterEgo(baseCraftConfig = {}, alterEgo) {
  if (!alterEgo) return baseCraftConfig;
  const merged = { ...baseCraftConfig };
  if (alterEgo.toneMods) Object.assign(merged, alterEgo.toneMods);
  const baseDevices = baseCraftConfig.rhetoricalDevices || [];
  const egoDevices  = alterEgo.rhetoricalBias || [];
  merged.rhetoricalDevices = [...new Set([...baseDevices, ...egoDevices])].slice(0, 4);
  return merged;
}

function buildAlterEgoBlock(alterEgo) {
  if (!alterEgo) return '';
  const lines = ['\n--- ALTER EGO ACTIVE ---'];
  lines.push('PERSONA MASK: ' + alterEgo.name);
  lines.push('Tagline: "' + alterEgo.tagline + '"');
  lines.push('Description: ' + alterEgo.description);
  lines.push('Voice register: ' + alterEgo.voice);
  lines.push('');
  lines.push('Write this section AS THIS PERSONA — not a different person, but a different lens of expression.');
  lines.push('The underlying identity and emotional truth remain the same. The VOICE changes.');
  lines.push('--- END ALTER EGO ---');
  return lines.join('\n') + '\n';
}

module.exports = { BUILT_IN_ALTER_EGO_ARCHETYPES, createAlterEgo, applyAlterEgo, buildAlterEgoBlock };
