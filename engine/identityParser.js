/**
 * identityParser.js — v2
 *
 * Extracts identity traits, emotional states, and conflicts from raw user text.
 * Uses keyword matching + semantic ML service (port 3002) with graceful fallback.
 *
 * v2 additions:
 *   - async parseIdentity() with ML integration (500ms timeout, rule-based fallback)
 *   - parseIdentitySync() for synchronous contexts
 *   - semanticProfile output field
 *   - mlConfidence / mlUsed flags
 *   - Expanded Sheng lexicon (44 words, ≥3 required for detection)
 *   - referenceText support via userInputs.referenceText
 */

// ── Keyword banks ────────────────────────────────────────────────────────────
const { parseTemporalIdentity } = require('./temporalParser');

const EMOTION_BANKS = {
  anger:         ['angry','rage','furious','hate','mad','resent','bitter','frustrated'],
  sadness:       ['sad','hurt','lost','broken','empty','lonely','cry','tears','grief'],
  defiance:      ['refuse','fight','resist','stand','defy','rebel','push back',"won't"],
  longing:       ['miss','wish','want','dream','hope','someday','used to','remember'],
  pride:         ['proud','strong','earned','built','real','authentic','hustle','grind'],
  confusion:     ['why',"don't understand",'lost','unsure','confused','what if','maybe'],
  joy:           ['happy','love','light','free','alive','grateful','bless','celebrate'],
  vulnerability: ['scared','afraid','exposed','weak','need','help','please','alone'],
};

const CONFLICT_PATTERNS = [
  { pattern:/i am not|i'm not|never been|don't define me/i, type:'identity_rejection' },
  { pattern:/they (said|think|told|called)|people (say|think|see)/i, type:'external_judgment' },
  { pattern:/used to|no longer|changed|before i|i was once/i, type:'transformation' },
  { pattern:/stuck|trapped|can't escape|loop|cycle|same/i,    type:'stagnation' },
  { pattern:/between|torn|both|neither|two worlds/i,          type:'duality' },
  { pattern:/alone|no one|nobody|by myself/i,                 type:'isolation' },
  { pattern:/mother|father|family|home|roots|blood/i,         type:'ancestral_tension' },
  { pattern:/streets|nairobi|hood|mtaa|ghetto|environment/i,  type:'place_identity' },
];

const TRAIT_SIGNALS = {
  introspective:['think','feel','wonder','reflect','question','inside','deep'],
  assertive:    ['will','must','always','never','know','certain','fact'],
  spiritual:    ['god','faith','prayer','bless','universe','purpose','divine'],
  streetwise:   ['game','hustle','real','streets','sheng','mtaa','manze','buda'],
  poetic:       ['like','as if','imagine','picture','see','feel like','sounds like'],
  wounded:      ['hurt','scar','damage','break','fall','fail','wrong'],
};

// ── Expanded lexicons (v2) ───────────────────────────────────────────────────
const SHENG_WORDS = [
  'manze','buda','niaje','poa','sema','fiti','mtaa','chali','dame','kama',
  'sawa','maze','kitu','vipi','rada','mambo','boss','ghali','raha','noma',
  'jaba','mbaya','safi','cheza','ingia','toa','enda','kuja','ona','jua',
  'fanya','gari','pesa','kazi','nyumba','mtu','watu','siku','usiku',
  'asubuhi','jioni','nilikuwa','wapi','hapa',
];
const SWAHILI_WORDS = [
  'mimi','wewe','yeye','sisi','wao','nini','kweli','lakini',
  'maisha','nguvu','roho','pamoja','tafadhali','asante','pole',
];

// ── Rule-based helpers ───────────────────────────────────────────────────────
function detectEmotions(text) {
  const lower = text.toLowerCase();
  const out = [];
  for (const [emotion, kws] of Object.entries(EMOTION_BANKS)) {
    const hits = kws.filter(kw => lower.includes(kw)).length;
    if (hits > 0) out.push({ emotion, intensity: Math.min(hits / kws.length * 3, 1) });
  }
  return out.sort((a,b) => b.intensity - a.intensity);
}

function detectConflicts(text) {
  return CONFLICT_PATTERNS.reduce((acc, {pattern, type}) => {
    const m = text.match(pattern);
    if (m) acc.push({ type, excerpt: m[0] });
    return acc;
  }, []);
}

function extractTraits(text) {
  const lower = text.toLowerCase();
  return Object.entries(TRAIT_SIGNALS)
    .filter(([, sigs]) => sigs.filter(s => lower.includes(s)).length >= 2)
    .map(([trait]) => trait);
}

function detectLanguageMix(text) {
  const lower = text.toLowerCase();
  const shengHits = SHENG_WORDS.filter(w => lower.includes(w)).length;
  return {
    sheng:     shengHits >= 3,
    kiswahili: SWAHILI_WORDS.some(w => lower.includes(w)),
    english:   true,
    shengConfidence: shengHits,
  };
}

// ── ML integration ───────────────────────────────────────────────────────────
async function callMLService(text) {
  const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:3002';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 500);
  try {
    const res = await fetch(`${ML_URL}/ml/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok ? await res.json() : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ── Master parse (async, ML-aware) ──────────────────────────────────────────
async function parseIdentity(userInputs, userOverrides = {}) {
  const fullText = Object.values(userInputs).join(' ');

  const ruleEmotions  = detectEmotions(fullText);
  const ruleConflicts = detectConflicts(fullText);
  const ruleTraits    = extractTraits(fullText);
  const languageMix   = detectLanguageMix(fullText);

  let mlResult = null;
  try { mlResult = await callMLService(fullText); } catch { /**/ }

  const mlUsed       = !!mlResult;
  const mlConfidence = mlResult?.confidence || 0;
  const semanticProfile = mlResult ? {
    emotionVector:         mlResult.emotions  || [],
    conflictProbabilities: mlResult.conflicts || {},
    traitScores:           mlResult.traits    || {},
  } : null;

  const useMl = mlUsed && mlConfidence >= 0.4;

  const emotions  = (useMl && semanticProfile.emotionVector.length)
    ? semanticProfile.emotionVector : ruleEmotions;
  const conflicts = (useMl && Object.keys(semanticProfile.conflictProbabilities).length)
    ? Object.entries(semanticProfile.conflictProbabilities)
        .sort(([,a],[,b]) => b-a).slice(0,3).map(([type,score]) => ({type,score}))
    : ruleConflicts;
  const traits = (useMl && Object.keys(semanticProfile.traitScores).length)
    ? Object.entries(semanticProfile.traitScores).filter(([,s]) => s>0.4).map(([t]) => t)
    : ruleTraits;

  const temporalProfile = parseTemporalIdentity(userInputs, emotions, conflicts);

  // Per-property confidence scores (rule-based heuristics)
  const propertyConfidence = {
    primary_emotion:   emotions.length > 0 ? Math.min(emotions[0].intensity * 1.2, 1.0) : 0.1,
    secondary_emotions: emotions.length > 1 ? 0.7 : 0.2,
    dominant_conflict:  conflicts.length > 0 ? 0.8 : 0.1,
    language_mix:      languageMix.sheng ? 0.9 : (languageMix.kiswahili ? 0.8 : 0.6),
    temporal_dominant: temporalProfile?.temporal?.spread >= 2 ? 0.85 : 0.5,
    logical_relation:  temporalProfile?.logicalRelation?.confidence || 0.5,
    archetype:         conflicts.length > 0 ? 0.75 : 0.3,
    traits:            traits.length >= 2 ? 0.8 : 0.4,
  };


  // ── User overrides from Phase 2 (InferencePreview corrections) ────────────
  // Override fields: primary_emotion, archetype, logical_relation,
  //                  language_mix, temporal_dominant
  if (userOverrides.primary_emotion) {
    // Promote the overridden emotion to the front of the list
    const overrideEmo = { emotion: userOverrides.primary_emotion, intensity: 1.0, source: 'user_override' };
    const rest = emotions.filter(e => e.emotion !== userOverrides.primary_emotion);
    emotions.splice(0, emotions.length, overrideEmo, ...rest);
    propertyConfidence.primary_emotion = 1.0;
  }
  if (userOverrides.archetype) {
    const overrideConflict = { type: userOverrides.archetype, score: 1.0, source: 'user_override' };
    const rest = conflicts.filter(c => c.type !== userOverrides.archetype);
    conflicts.splice(0, conflicts.length, overrideConflict, ...rest);
    propertyConfidence.dominant_conflict = 1.0;
  }
  if (userOverrides.logical_relation && temporalProfile?.logicalRelation) {
    temporalProfile.logicalRelation.relation   = userOverrides.logical_relation;
    temporalProfile.logicalRelation.confidence = 1.0;
    propertyConfidence.logical_relation        = 1.0;
  }
  if (userOverrides.temporal_dominant && temporalProfile?.temporal) {
    temporalProfile.temporal.dominant = userOverrides.temporal_dominant;
    propertyConfidence.temporal_dominant = 1.0;
  }

  return {
    rawInputs: userInputs, emotions, conflicts, traits, languageMix,
    wordCount: fullText.split(/\s+/).length,
    timestamp: new Date().toISOString(),
    mlUsed, mlConfidence, semanticProfile,
    propertyConfidence,
    // PIRE temporal layer
    temporalProfile,
  };
}

// Synchronous fallback (rule-based only)
function parseIdentitySync(userInputs, userOverrides = {}) {
  const fullText = Object.values(userInputs).join(' ');
  const ruEm = detectEmotions(fullText);
  const ruCo = detectConflicts(fullText);
  const temporalProfile = parseTemporalIdentity(userInputs, ruEm, ruCo);
  // Apply user overrides (sync path)
  if (userOverrides.primary_emotion) {
    const ov = { emotion: userOverrides.primary_emotion, intensity: 1.0, source: 'user_override' };
    const rest = ruEm.filter(e => e.emotion !== userOverrides.primary_emotion);
    ruEm.splice(0, ruEm.length, ov, ...rest);
  }

  return {
    rawInputs: userInputs,
    emotions:  ruEm,
    conflicts: ruCo,
    traits:    extractTraits(fullText),
    languageMix: detectLanguageMix(fullText),
    wordCount: fullText.split(/\s+/).length,
    timestamp: new Date().toISOString(),
    mlUsed: false, mlConfidence: 0, semanticProfile: null,
    temporalProfile,
  };
}

module.exports = {
  parseIdentity, parseIdentitySync,
  detectEmotions, detectConflicts, extractTraits, detectLanguageMix,
};
