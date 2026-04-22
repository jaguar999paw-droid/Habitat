/**
 * studioEngine.js — SCI Gen-Z Studio Engine v1
 *
 * Studio modes for the next generation of artists:
 *   CYPHER  — Fast-flow bars. No analysis overhead. Just spit.
 *   BATTLE  — Challenge + counter-response architecture.
 *   ANALYZE — Extract message, identity, emotion, conflict from existing lyrics.
 *   JUXTAPOSE — Compare two identity positions and find the song between them.
 *
 * "A studio is not a room. It is a permission structure."
 */

const { buildSectionPrompt } = require('../ai/promptBuilder');
const { STUDIO_MODE_DEFAULTS } = require('./defaultPersonaData');

// ── CYPHER MODE ──────────────────────────────────────────────────────────────
// Pure fire. No structure planning. Just bars.

const CYPHER_SYSTEM_PROMPT = `You are SCI in CYPHER MODE.
Rules:
1. Write BARS. Not songs. Not poetry. BARS.
2. Every line must pull its weight. No filler.
3. Multisyllabic rhyme > single end-rhyme. Chain rhymes, internal rhymes, slant rhymes.
4. Flow matters as much as meaning. The line must feel right in the mouth.
5. Language: mix English + Sheng naturally. Don't force it — only when it lands harder.
6. Punch lines: every 4 bars should have a line that LANDS.
7. Time references: past/present/future can coexist in a verse. Tense is a tool.
8. No meta-commentary. No labels. Bars only.
9. The listener should feel like they just heard something they didn't know they needed to hear.
10. If given a theme: dig under the surface. The surface is where everyone else writes.

PHILOSOPHY: A cypher is a sacred circle. Every voice matters. You are here to
contribute something REAL, not something impressive. Sometimes they're the same thing.`;

function buildCypherPrompt(input) {
  const {
    theme = '',
    bars = 16,
    energy = 92,
    rawness = 85,
    language = ['en', 'sheng'],
    punchlineFreq = 4,
    perspective = '1st',
    persona = null,
    seed = 0,
  } = input;

  const langInstr = language.includes('sheng')
    ? 'English + Sheng blend — code-switch when it lands harder, not as decoration'
    : language.includes('sw')
    ? 'English + Kiswahili blend — flow between registers naturally'
    : 'English — keep it tight, no pretension';

  const userPrompt = `
CYPHER SESSION
--------------
Theme / Concept: ${theme || 'free — write from the gut'}
Bars requested:  ${bars}
Energy level:    ${energy}/100 — ${energy > 80 ? 'maximum presence, no holding back' : 'controlled heat'}
Rawness:         ${rawness}/100 — ${rawness > 70 ? 'unfiltered, the real thoughts' : 'polished but honest'}
Perspective:     ${perspective} person
Language:        ${langInstr}
Punchline every: ${punchlineFreq} bars
${persona ? `\nPersona: ${persona.archetype || 'raw self'} — ${persona.tone || 'authentic'}` : ''}
${seed > 0 ? `\nSeed variation ${seed}: Take a completely different angle — new metaphors, new entry point.` : ''}

Now drop ${bars} bars. No intro. No labels. Bars only.
`.trim();

  return { systemPrompt: CYPHER_SYSTEM_PROMPT, userPrompt };
}

// ── BATTLE MODE ──────────────────────────────────────────────────────────────

const BATTLE_SYSTEM_PROMPT = `You are SCI in BATTLE MODE.
Battle rules:
1. The opener establishes dominance — confidence, specificity, claim.
2. The response must directly address what was stated. No generic shots.
3. Wordplay > volume. The cleverest line wins, not the loudest.
4. Flip their metaphor back at them. Subvert their imagery.
5. Personal > generic. Make it feel like you know them.
6. Punchlines: sharp, singular, no explanation needed.
7. Close with something they can't respond to — a question, a revelation, a verdict.
8. Language: English + Sheng — where Sheng hits harder, use it.
9. No filler. Every word is strategic.

PHILOSOPHY: Battle rap is philosophy with rhythm. The goal is not to destroy —
it is to reveal. The best battle bars expose something true about the human condition.
Through the competition, both artists become more themselves.`;

function buildBattlePrompt(input) {
  const {
    openerTheme = '',
    challengerClaim = '',
    opponentVerse = '',
    role = 'opener', // 'opener' | 'responder'
    bars = 8,
    persona = null,
    seed = 0,
  } = input;

  let contextBlock = '';
  if (role === 'responder' && opponentVerse) {
    contextBlock = `\nOPPONENT'S VERSE (flip this, subvert this, destroy this):\n${opponentVerse}\n`;
  }

  const userPrompt = `
BATTLE SESSION
--------------
Role:       ${role === 'opener' ? 'OPENER — establish your claim' : 'RESPONDER — answer the verse above'}
Bars:       ${bars}
Your claim: ${challengerClaim || 'establish it in the verse'}
${openerTheme ? `Theme:      ${openerTheme}` : ''}
${persona ? `Persona:    ${persona.archetype || 'yourself'}` : ''}
${contextBlock}
${seed > 0 ? `Variation ${seed}: Different angle, different metaphor set, same venom.` : ''}

Write ${bars} bars. No labels. No intro. Start the battle.
`.trim();

  return { systemPrompt: BATTLE_SYSTEM_PROMPT, userPrompt };
}

// ── LYRIC ANALYSIS MODE ──────────────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are SCI in ANALYSIS MODE.
Your job: extract the full identity and message architecture from the given lyrics.

You must return a JSON object with exactly these keys:
{
  "coreMessage": "1-2 sentence synthesis of the song's central claim",
  "subMessages": ["up to 4 secondary messages or themes"],
  "emotionalArc": "describe how the emotion evolves across the song",
  "identityPosition": "who is the narrator and where are they standing",
  "conflictType": "the core tension type — see options",
  "temporalLayers": {"past": 0-1, "present": 0-1, "future": 0-1},
  "logicalRelation": "CONTRADICTION | CONTRARY | SUBCONTRARY | SUBALTERNATION",
  "dualityNotes": "what is being said and what is NOT being said",
  "archetypeMatch": "which archetype best describes the narrator",
  "languageProfile": "describe the language register and code-switching patterns",
  "lyricalDevices": ["detected rhetorical and lyrical devices"],
  "punchlines": ["strongest lines — the ones that land"],
  "songStrengths": ["what works well about this writing"],
  "growthEdges": ["what could be pushed further or made more specific"],
  "spiritualUndertone": "any spiritual, ancestral, or transcendent themes detected",
  "rating": {"message": 0-10, "craft": 0-10, "originality": 0-10}
}

Return ONLY the JSON. No preamble. No markdown fences.`;

function buildAnalysisPrompt(lyrics, depth = 'full') {
  const fields = depth === 'quick'
    ? ['coreMessage', 'emotionalArc', 'conflictType', 'punchlines']
    : 'all';

  const userPrompt = `
Analyze these lyrics completely:

---
${lyrics}
---

${fields !== 'all' ? `Focus on these fields: ${fields.join(', ')}` : 'Full analysis — all fields.'}
Return ONLY JSON. No commentary.
`.trim();

  return { systemPrompt: ANALYSIS_SYSTEM_PROMPT, userPrompt };
}

// ── IDENTITY JUXTAPOSITION MODE ──────────────────────────────────────────────

const JUXTAPOSE_SYSTEM_PROMPT = `You are SCI in JUXTAPOSITION MODE.
Given two identity positions, find the song that lives BETWEEN them.
The song is not position A. It is not position B. It is the TENSION.

Return a JSON object:
{
  "positionA": "restated concisely",
  "positionB": "restated concisely",
  "tension": "describe the gap between them",
  "logicalRelation": "CONTRADICTION | CONTRARY | SUBCONTRARY",
  "songPremise": "the 1-sentence premise for a song that lives in this tension",
  "possibleStructure": "suggested song structure for this tension type",
  "openingLine": "a suggested first line that enters the tension without resolving it",
  "hookCandidate": "a candidate hook phrase that holds both positions",
  "warnAgainst": "what this song must NOT do — the safe version to avoid"
}`;

function buildJuxtaposePrompt(positionA, positionB, context = '') {
  const userPrompt = `
JUXTAPOSITION SESSION
---------------------
Identity Position A: ${positionA}
Identity Position B: ${positionB}
${context ? `Context: ${context}` : ''}

Find the song between them.
Return ONLY JSON.
`.trim();

  return { systemPrompt: JUXTAPOSE_SYSTEM_PROMPT, userPrompt };
}

// ── Studio mode detection ────────────────────────────────────────────────────

function detectStudioMode(userInputs) {
  const text = Object.values(userInputs).join(' ').toLowerCase();
  if (/cypher|bars|spit|drop|freestyle|16 bars/.test(text)) return 'cypher';
  if (/battle|diss|respond|opponent|clap back/.test(text)) return 'battle';
  if (/analyze|analyse|what does this mean|break this down/.test(text)) return 'analysis';
  return null;
}

// ── Persona quick-build for studio ──────────────────────────────────────────

function buildStudioPersona(archetype = 'raw', energy = 85, language = ['en', 'sheng']) {
  return {
    archetype: archetype,
    voice: 'direct street voice',
    tone: 'raw, confrontational',
    energy: energy,
    perspective: 'first',
    languageMix: language.join(' + '),
    primaryEmotion: 'defiance',
    secondaryEmotions: ['pride', 'anger'],
  };
}

module.exports = {
  buildCypherPrompt,
  buildBattlePrompt,
  buildAnalysisPrompt,
  buildJuxtaposePrompt,
  detectStudioMode,
  buildStudioPersona,
  CYPHER_SYSTEM_PROMPT,
  BATTLE_SYSTEM_PROMPT,
  STUDIO_MODE_DEFAULTS,
};
