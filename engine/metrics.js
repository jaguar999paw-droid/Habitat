'use strict';
/**
 * engine/metrics.js
 * Richer scoring functions for /api/identity/unbiased-assessment.
 * All pure JS — no external deps.
 */

// Emotional lexicon for authenticity scoring
const EMOTIONAL_LEXICON = [
  'angry','rage','hurt','loss','broken','empty','lonely','grief','cry','tears',
  'refuse','fight','resist','defy','rebel','love','free','afraid','scared',
  'miss','wish','dream','hope','proud','strong','earned','built','confused',
  'why','lost','unsure','hate','bitter','resent','frustrated','sad','pain',
];

// Metaphor signals (abstraction markers)
const METAPHOR_SIGNALS = [
  'like a', 'as if', 'feels like', 'is a', 'are like', 'become a',
  'i am a', 'i was a', 'bleed', 'burn', 'carry', 'weight', 'shadow',
  'light', 'fire', 'storm', 'sea', 'rise', 'fall', 'crumble', 'bloom',
];

// Duality signals
const DUALITY_SIGNALS = [
  'but also', 'yet', 'however', 'at the same time', 'both', 'neither',
  'on one hand', 'torn', 'between', 'contradiction', 'strange that',
  'even though', 'despite', 'still', 'and yet',
];

/**
 * scoreAuthenticity — lexical uniqueness + contradiction density
 * @param {string[]} journalEntries
 * @returns {number} 0-100
 */
function scoreAuthenticity(journalEntries) {
  if (!journalEntries || journalEntries.length === 0) return 0;
  const text = journalEntries.join(' ').toLowerCase();
  const words = text.split(/\s+/);
  const unique = new Set(words).size;
  const lexicalUniqueness = Math.min(unique / Math.max(words.length, 1) * 100, 100);
  const emotionalHits = EMOTIONAL_LEXICON.filter(w => text.includes(w)).length;
  const emotionalDensity = Math.min(emotionalHits / EMOTIONAL_LEXICON.length * 100, 100);
  return Math.round(lexicalUniqueness * 0.4 + emotionalDensity * 0.6);
}

/**
 * scoreConsistency — TF-weighted recurring themes
 * @param {string[]} journalEntries
 * @returns {number} 0-100
 */
function scoreConsistency(journalEntries) {
  if (!journalEntries || journalEntries.length < 2) return 50;
  const wordFreq = {};
  journalEntries.forEach(entry => {
    entry.toLowerCase().split(/\s+/).forEach(w => {
      if (w.length > 4) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });
  const repeatingWords = Object.values(wordFreq).filter(c => c > 1).length;
  const totalUnique = Object.keys(wordFreq).length;
  return Math.round(Math.min(repeatingWords / Math.max(totalUnique, 1) * 200, 100));
}

/**
 * scoreDepth — avg word count + sentence complexity
 * @param {string[]} journalEntries
 * @returns {number} 0-100
 */
function scoreDepth(journalEntries) {
  if (!journalEntries || journalEntries.length === 0) return 0;
  const avgWords = journalEntries.reduce((sum, e) => sum + e.split(/\s+/).length, 0) / journalEntries.length;
  const metaphorHits = journalEntries.join(' ').toLowerCase();
  const metaphorCount = METAPHOR_SIGNALS.filter(m => metaphorHits.includes(m)).length;
  const wordDepth    = Math.min(avgWords / 50 * 60, 60);
  const metaphorScore = Math.min(metaphorCount / METAPHOR_SIGNALS.length * 40, 40);
  return Math.round(wordDepth + metaphorScore);
}

/**
 * scoreNuance — duality presence + conflicting signals
 * @param {string[]} journalEntries
 * @param {object} hookData
 * @param {object} userSliders
 * @returns {number} 0-100
 */
function scoreNuance(journalEntries, hookData = {}, userSliders = {}) {
  if (!journalEntries || journalEntries.length === 0) return 0;
  const text = journalEntries.join(' ').toLowerCase();
  const dualityHits = DUALITY_SIGNALS.filter(d => text.includes(d)).length;
  const dualityScore = Math.min(dualityHits / DUALITY_SIGNALS.length * 60, 60);
  // Reference diversity bonus
  const refCount = (hookData.references || []).length;
  const refScore  = Math.min(refCount * 5, 20);
  // Slider spread bonus — more diverse sliders = more nuance
  const sliderValues = Object.values(userSliders).filter(v => typeof v === 'number');
  const sliderSpread = sliderValues.length > 1
    ? (Math.max(...sliderValues) - Math.min(...sliderValues)) / 100 * 20
    : 0;
  return Math.round(dualityScore + refScore + sliderSpread);
}

module.exports = { scoreAuthenticity, scoreConsistency, scoreDepth, scoreNuance };
