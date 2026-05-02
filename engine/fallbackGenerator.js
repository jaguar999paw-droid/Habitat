'use strict';
/**
 * engine/fallbackGenerator.js
 * Rule-based song generation — no API key required.
 * Used when no Claude/OpenAI key is available in /api/generate and /api/section.
 *
 * generateFallback({ persona, message, structure, style })
 *   → sections[] — same shape as AI generator output
 */

const TEMPLATES = require('./templates');

// ── Section type → template index mapping ────────────────────────────────────
const SECTION_TYPE_INDEX = {
  verse_1:    0,
  verse1:     0,
  verse:      0,
  pre_chorus: 1,
  prechorus:  1,
  chorus:     2,
  hook:       2,
  verse_2:    3,
  verse2:     3,
  bridge:     4,
  outro:      5,
  outro_hook: 5,
};

// ── Key builder ───────────────────────────────────────────────────────────────
function buildTemplateKey(persona, structure) {
  const archetype = (persona.archetype || 'Seeker')
    .toLowerCase()
    .replace(/\s+/g, '_');

  const conflictType = (structure.conflictType || structure.arc || 'rise')
    .toLowerCase()
    .replace(/\s+/g, '_');

  return `${archetype}_${conflictType}`;
}

// ── Vocabulary extractor ──────────────────────────────────────────────────────
function extractVocab(message, persona, style) {
  const archetype = persona.archetype || 'Seeker';

  return {
    EMOTION:   persona.primaryEmotion
               || persona.emotion
               || message.dominantEmotion
               || 'longing',
    CORE:      message.emotionalTruth
               || message.coreMessage
               || 'the truth I carry',
    CONFLICT:  message.socialConflict
               || message.conflict
               || 'what they made me believe',
    ARCHETYPE: archetype,
    SUBJECT:   (message.mainIdea || message.subject || 'who I am')
                 .split(' ').slice(0, 6).join(' '),
  };
}

// ── Template substitution ─────────────────────────────────────────────────────
function substituteVocab(text, vocab) {
  return Object.entries(vocab).reduce(
    (t, [k, v]) => t.replaceAll(`{{${k}}}`, v || k.toLowerCase()),
    text
  );
}

// ── Main generator ────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {object} params.persona    — archetype, primaryEmotion, etc.
 * @param {object} params.message    — mainIdea, emotionalTruth, socialConflict
 * @param {object} params.structure  — sections[], conflictType/arc
 * @param {object} [params.style]    — style hints (unused at this layer)
 * @returns {object[]} sections — [{ type, label, content, source:'fallback' }]
 */
function generateFallback({ persona = {}, message = {}, structure = {}, style = {} }) {
  const key      = buildTemplateKey(persona, structure);
  const template = TEMPLATES[key]
                || TEMPLATES['seeker_rise']
                || TEMPLATES[Object.keys(TEMPLATES)[0]];

  const vocab    = extractVocab(message, persona, style);
  const sections = (structure.sections || DEFAULT_SECTIONS).map((section, i) => {
    const sectionKey = (section.type || '').toLowerCase().replace(/\s+/g, '_');
    const tmplIdx    = SECTION_TYPE_INDEX[sectionKey] ?? Math.min(i, template.sections.length - 1);
    const raw        = template.sections[tmplIdx] || template.sections[template.sections.length - 1];

    return {
      type:    section.type  || `section_${i + 1}`,
      label:   section.label || section.type || `Section ${i + 1}`,
      content: substituteVocab(raw, vocab),
      source:  'fallback',
    };
  });

  return sections;
}

// ── Default section structure when none provided ──────────────────────────────
const DEFAULT_SECTIONS = [
  { type: 'verse_1',    label: 'Verse 1' },
  { type: 'chorus',     label: 'Chorus'  },
  { type: 'verse_2',    label: 'Verse 2' },
  { type: 'chorus',     label: 'Chorus'  },
  { type: 'bridge',     label: 'Bridge'  },
  { type: 'outro',      label: 'Outro'   },
];

// ── Section-level generator (for /api/section fallback) ──────────────────────

/**
 * @param {object} params
 * @param {string} params.sectionType  — 'verse_1' | 'chorus' | 'bridge' | etc.
 * @param {object} params.persona
 * @param {object} params.message
 * @param {object} [params.structure]
 * @returns {string} raw lyric content for that section
 */
function generateSectionFallback({ sectionType, persona = {}, message = {}, structure = {} }) {
  const key      = buildTemplateKey(persona, structure);
  const template = TEMPLATES[key]
                || TEMPLATES['seeker_rise']
                || TEMPLATES[Object.keys(TEMPLATES)[0]];

  const vocab    = extractVocab(message, persona, {});
  const sectionKey = (sectionType || 'verse').toLowerCase().replace(/\s+/g, '_');
  const tmplIdx  = SECTION_TYPE_INDEX[sectionKey] ?? 0;
  const raw      = template.sections[tmplIdx] || template.sections[0];

  return substituteVocab(raw, vocab);
}

// ── Format helper — same shape as AI formatSong output ───────────────────────
function formatSong(sections) {
  return sections
    .map(s => `[${s.label || s.type}]\n${s.content}`)
    .join('\n\n');
}

module.exports = { generateFallback, generateSectionFallback, formatSong };
