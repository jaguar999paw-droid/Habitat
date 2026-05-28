'use strict';
/**
 * engine/hookExtractor.js
 * Extracts candidate hook lines from raw journal text.
 * Zero ML dependencies — pure JS heuristics.
 *
 * Used by: /api/journal/synthesize (auto-feeds Hook Book after synthesis)
 *
 * Output shape per hook:
 *   { text, confidence, features: { sentence_type, emotional_weight, repetition_score } }
 */

const { detectEmotions } = require('./identityParser');

// ── Sentence type classifier ───────────────────────────────────────────────
const SENTENCE_TYPES = {
  declarative:  /^[^?!]+[.]?$/,
  interrogative:/\?/,
  imperative:   /^(don'?t|never|always|stop|let|be|hold|run|rise|stand|fight|come|go|see)\b/i,
  exclamatory:  /!/,
};

function classifySentenceType(line) {
  if (SENTENCE_TYPES.exclamatory.test(line))   return 'exclamatory';
  if (SENTENCE_TYPES.interrogative.test(line)) return 'interrogative';
  if (SENTENCE_TYPES.imperative.test(line))    return 'imperative';
  return 'declarative';
}

// ── Temporal stance detector ───────────────────────────────────────────────
function detectTemporalStance(line) {
  const l = line.toLowerCase();
  if (/(was|were|had|used to|before i|when i was|back then)/i.test(l)) return 'past';
  if (/(will|going to|one day|someday|i'll become)/i.test(l))           return 'future';
  return 'present';
}

// ── Pronoun type ───────────────────────────────────────────────────────────
function detectPronounType(line) {
  const l = line.toLowerCase();
  const first  = (l.match(/\b(i|me|my|mine|myself)\b/g)  || []).length;
  const second = (l.match(/\b(you|your|yours|yourself)\b/g) || []).length;
  const plural  = (l.match(/\b(we|us|our|ours|ourselves|they|them|their)\b/g) || []).length;
  if (first  >= second && first  >= plural) return 'I';
  if (second >= first  && second >= plural) return 'You';
  return 'We';
}

// ── Emotional weight (reuse identityParser signal) ─────────────────────────
function computeEmotionalWeight(line) {
  const emotions = detectEmotions(line);
  if (!emotions.length) return 0;
  return Math.min(emotions.reduce((sum, e) => sum + e.intensity, 0), 1.0);
}

// ── Repetition score — how hook-like is this line across the full text ─────
function computeRepetitionScore(line, allLines) {
  const normalized = line.trim().toLowerCase();
  if (!normalized) return 0;
  const words = normalized.split(/\s+/);
  let hits = 0;
  for (const other of allLines) {
    if (other.trim().toLowerCase() === normalized) continue; // skip self
    const otherWords = other.toLowerCase().split(/\s+/);
    // Count shared bigrams
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + ' ' + words[i + 1];
      if (other.toLowerCase().includes(bigram)) hits++;
    }
  }
  return Math.min(hits / Math.max(words.length, 1), 1.0);
}

// ── Length filter ──────────────────────────────────────────────────────────
function isHookLength(line) {
  const wc = line.trim().split(/\s+/).length;
  return wc >= 3 && wc <= 14;
}

// ── Confidence scorer ──────────────────────────────────────────────────────
function computeConfidence(emotionalWeight, repetitionScore, sentenceType, wordCount) {
  let score = 0;
  score += emotionalWeight * 0.45;
  score += repetitionScore * 0.25;
  if (sentenceType === 'imperative' || sentenceType === 'exclamatory') score += 0.20;
  else if (sentenceType === 'interrogative') score += 0.10;
  else score += 0.05;
  // Prefer 4-10 word lines
  if (wordCount >= 4 && wordCount <= 10) score += 0.10;
  return Math.min(Math.max(score, 0.0), 1.0);
}

// ── Main extractor ─────────────────────────────────────────────────────────
/**
 * @param {string} text — raw journal or lyric text
 * @returns {Array<{text, confidence, features}>}
 */
function extractHooks(text) {
  if (!text || typeof text !== 'string') return [];

  // Split into lines, filter empties
  const lines = text
    .split(/[.\n!?]+/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && isHookLength(l));

  return lines
    .map(line => {
      const sentenceType    = classifySentenceType(line);
      const emotionalWeight = computeEmotionalWeight(line);
      const repetitionScore = computeRepetitionScore(line, lines);
      const wordCount       = line.split(/\s+/).length;
      const confidence      = computeConfidence(emotionalWeight, repetitionScore, sentenceType, wordCount);

      return {
        text: line,
        confidence: Math.round(confidence * 100) / 100,
        features: {
          sentence_type:    sentenceType,
          emotional_weight: Math.round(emotionalWeight * 100) / 100,
          repetition_score: Math.round(repetitionScore * 100) / 100,
          temporal_stance:  detectTemporalStance(line),
          pronoun_type:     detectPronounType(line),
          word_count:       wordCount,
        },
      };
    })
    .filter(h => h.confidence > 0.05)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20); // cap at 20 candidates
}

module.exports = { extractHooks };
