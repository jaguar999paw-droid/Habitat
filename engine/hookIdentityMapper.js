'use strict';
/**
 * engine/hookIdentityMapper.js
 * Infers identity traits from the user's hook corpus.
 * All derived signals are source:'inferred' — NEVER overrides source:'user'.
 *
 * Used by: identityParser.js (merged into parseIdentity output)
 */

/**
 * @param {Array<{text, confidence, features}>} hooks — from hookExtractor
 * @returns {object} hookDerivedTraits
 */
function mapHooksToIdentity(hooks) {
  if (!hooks || hooks.length === 0) return _emptyProfile();

  const total = hooks.length;

  // ── Dominant sentence type ─────────────────────────────────────────────
  const typeCounts = {};
  hooks.forEach(h => {
    const t = h.features.sentence_type || 'declarative';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const dominant_sentence_type = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'declarative';

  // ── Pronoun bias ───────────────────────────────────────────────────────
  const pronounCounts = { I: 0, You: 0, We: 0 };
  hooks.forEach(h => { pronounCounts[h.features.pronoun_type || 'I']++; });
  const pronoun_bias = Object.entries(pronounCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'I';

  // ── Temporal bias ──────────────────────────────────────────────────────
  const tempCounts = { past: 0, present: 0, future: 0 };
  hooks.forEach(h => { tempCounts[h.features.temporal_stance || 'present']++; });
  const temporal_bias = Object.entries(tempCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'present';

  // ── Decisiveness (imperative density) ─────────────────────────────────
  const imperativeCount = hooks.filter(h => h.features.sentence_type === 'imperative').length;
  const decisiveness = Math.round((imperativeCount / total) * 100);

  // ── Internal conflict (interrogative density) ──────────────────────────
  const interrogativeCount = hooks.filter(h => h.features.sentence_type === 'interrogative').length;
  const internal_conflict = Math.round((interrogativeCount / total) * 100);

  // ── Average emotional weight ───────────────────────────────────────────
  const avg_emotional_weight = Math.round(
    hooks.reduce((sum, h) => sum + (h.features.emotional_weight || 0), 0) / total * 100
  ) / 100;

  // ── Rhetorical density (imperative + interrogative combined) ──────────
  const rhetorical_density = Math.round(((imperativeCount + interrogativeCount) / total) * 100);

  return {
    dominant_sentence_type,
    pronoun_bias,
    temporal_bias,
    decisiveness,
    internal_conflict,
    avg_emotional_weight,
    rhetorical_density,
    hook_count: total,
    source: 'inferred',
  };
}

function _emptyProfile() {
  return {
    dominant_sentence_type: null,
    pronoun_bias: null,
    temporal_bias: null,
    decisiveness: 0,
    internal_conflict: 0,
    avg_emotional_weight: 0,
    rhetorical_density: 0,
    hook_count: 0,
    source: 'inferred',
  };
}

module.exports = { mapHooksToIdentity };
