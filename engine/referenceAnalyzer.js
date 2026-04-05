/**
 * referenceAnalyzer.js — v2 (new module)
 *
 * Analyzes a pasted/dropped reference text (lyric, quote, or excerpt)
 * to extract: rhyme patterns, tonal register, and vocabulary level.
 * Output feeds into styleMapper to influence rhyme scheme and vocabulary.
 * Pure JS — no external dependencies.
 */

const ELEVATED_WORDS = ['transcend','ephemeral','luminous','ethereal','sovereign','reverie','soliloquy','melancholy','labyrinth','paradox','serendipity','genesis'];
const STREET_WORDS   = ['hustle','grind','real','squad','lit','drop','bars','flow','trap','manze','poa','fiti','buda','mtaa','sawa','noma','jaba'];

function extractEndWords(text) {
  return text.split(/\n/).map(l => l.trim()).filter(Boolean)
    .map(l => { const words = l.split(/\s+/); return words[words.length - 1]?.replace(/[^a-zA-Z]/g, '').toLowerCase(); })
    .filter(Boolean);
}

function detectRhymeScheme(endWords) {
  if (endWords.length < 4) return 'FREE';
  const rhyme = (a, b) => a && b && (a === b || a.slice(-3) === b.slice(-3) || a.slice(-2) === b.slice(-2));
  const [w0, w1, w2, w3] = endWords;
  if (rhyme(w0, w1) && rhyme(w2, w3)) return 'AABB';
  if (rhyme(w0, w2) && rhyme(w1, w3)) return 'ABAB';
  if (rhyme(w0, w1) && rhyme(w1, w2) && rhyme(w2, w3)) return 'AAAA';
  if (!rhyme(w0, w1) && !rhyme(w0, w2) && !rhyme(w0, w3)) return 'FREE';
  return 'ABCB';
}

function detectVocabularyLevel(text) {
  const lower = text.toLowerCase();
  const elevated = ELEVATED_WORDS.filter(w => lower.includes(w)).length;
  const street   = STREET_WORDS.filter(w => lower.includes(w)).length;
  if (elevated >= 3 && street < 2) return 'elevated';
  if (street >= 3 && elevated < 2) return 'street';
  if (elevated >= 2 && street >= 2) return 'mixed';
  return 'neutral';
}

function detectTone(text) {
  const lower = text.toLowerCase();
  const signals = {
    warm:        ['love','light','warmth','hope','smile','gentle','soft'],
    cold:        ['empty','silence','alone','cold','numb','hollow','grey'],
    aggressive:  ['fight','rage','burn','crash','force','raw','break'],
    melancholic: ['cry','miss','gone','lost','ache','fading','memory'],
  };
  const scores = {};
  for (const [tone, words] of Object.entries(signals)) {
    scores[tone] = words.filter(w => lower.includes(w)).length;
  }
  const top = Object.entries(scores).sort(([,a],[,b]) => b-a)[0];
  return top[1] > 0 ? top[0] : 'neutral';
}

function analyzeReference(referenceText) {
  if (!referenceText || referenceText.trim().length < 10) return { hasReference: false };

  const endWords        = extractEndWords(referenceText);
  const rhymeScheme     = detectRhymeScheme(endWords);
  const vocabularyLevel = detectVocabularyLevel(referenceText);
  const tone            = detectTone(referenceText);
  const lineCount       = referenceText.split('\n').filter(l => l.trim()).length;
  const avgLineLength   = Math.round(
    referenceText.split('\n').filter(l => l.trim())
      .reduce((sum, l) => sum + l.split(/\s+/).length, 0) / Math.max(lineCount, 1)
  );

  return {
    hasReference: true, rhymeScheme, vocabularyLevel, tone, lineCount, avgLineLength,
    endWords: endWords.slice(0, 8),
    styleInfluence: `Reference uses ${rhymeScheme} rhyme, ${vocabularyLevel} vocabulary, ${tone} tone — mirror this register`,
  };
}

module.exports = { analyzeReference, extractEndWords, detectRhymeScheme, detectVocabularyLevel, detectTone };
