/**
 * promptBuilder.js — v3
 *
 * Constructs structured AI prompts integrating:
 * - Temporal identity (PIRE layer: Past/Present/Future)
 * - 6-Angle identity framework (identityConfig)
 * - Alter ego / persona mask system (altEgoEngine)
 * - Full craft parameters (lyricsStyleEngine: rhetorical devices, humor, prosody, etc.)
 * - Existing: rhyme, flow, language, imagery, tension weights
 */

const { getTensionWeight }       = require('../engine/temporalParser');
const { buildCraftBlock }        = require('../engine/lyricsStyleEngine');
const { buildIdentityFrameBlock }= require('../engine/identityConfig');
const { buildAlterEgoBlock }     = require('../engine/altEgoEngine');
const { buildDualityBlock }      = require('../engine/dualityEngine');

const SYSTEM_PROMPT = `You are SCI — Structured Creative Intelligence — a disciplined AI songwriting engine.

You write ONE SECTION of a song at a time, exactly as instructed.

CORE RULES:
1. Write ONLY the requested section type. Never bleed into other sections.
2. Follow all craft parameters exactly as specified.
3. Match the persona's voice, tone, language, and perspective precisely.
4. Serve the GOAL of the section — every line must advance it.
5. Do NOT include section labels in your output (e.g., no "[VERSE 1]")
6. Do NOT explain, comment, or add meta-text — output lyrics only.
7. Keep line count within ±1 of the specified target.
8. The CORE MESSAGE is the spine — every section connects back to it.
9. Use the imagery style to ground writing in concrete, sensory detail.
10. If rhetorical devices are specified, deploy them with precision — not decoration.

PHILOSOPHY:
You do not generate songs. You excavate them from identity.
The user does not need to have lived a chaotic life to write an extraordinary song.
Every ordinary life, when examined through the 6 angles of identity
(who I was / could have been / am / can become / will be / might become),
contains the material for an extraordinary song.
Your job is to transform that material into structured music.

DUALITY PRINCIPLE:
Every truth the song states carries a shadow truth it refuses to state.
Every "I am" contains an "I am not".
Every "why" carries a "why not".
The most powerful songs hold both truths simultaneously — they do not resolve the tension,
they BECOME it. Write into the tension, not out of it.`;

function buildSectionPrompt(section, persona, message, style, previousSections = []) {
  let contextBlock = '';
  if (previousSections.length > 0) {
    contextBlock = '\n\n--- PREVIOUSLY WRITTEN SECTIONS ---\n';
    contextBlock += previousSections.map(s =>
      '[' + s.type.toUpperCase() + ' — ' + s.goal + ']\n' + s.lyrics
    ).join('\n\n');
    contextBlock += '\n--- END PREVIOUS SECTIONS ---';
  }

  const temporalBlock  = buildTemporalBlock(section, message);
  const identityBlock  = message.identityConfig
    ? buildIdentityFrameBlock(message.identityConfig, section.goal || section.type)
    : '';
  const craftConfig    = style.craftConfig || {};
  const craftBlock     = buildCraftBlock(craftConfig, section.type);
  const alterEgoBlock  = (message.identityConfig && message.identityConfig.activeAlterEgo)
    ? buildAlterEgoBlock(message.identityConfig.activeAlterEgo)
    : '';
  const dualityBlock   = message.dualityAnalysis
    ? buildDualityBlock(message.dualityAnalysis, section)
    : '';

  const tw = getTensionWeight(section.type);
  const tensionLabel = tw >= 0.8
    ? 'HIGH-TENSION — lean into contradiction, do NOT resolve'
    : tw >= 0.6
    ? 'MID-TENSION — explore, question, do not declare'
    : 'LOW-TENSION — establish, ground, set context';

  const userPrompt = `
SONG BRIEF
----------
Core Message: ${message.coreMessage}
Sub-Themes:   ${(message.subThemes || []).join(', ') || 'none'}

PERSONA
-------
Archetype:    ${persona.archetype}
Voice:        ${persona.voice}
Perspective:  ${persona.perspective} person
Tone:         ${persona.tone}
Energy:       ${persona.energy}
Emotions:     ${persona.primaryEmotion}${persona.secondaryEmotions && persona.secondaryEmotions.length ? ', ' + persona.secondaryEmotions.join(', ') : ''}

STYLE RULES
-----------
Rhyme Scheme:  ${style.rhymeScheme} — ${style.rhymeDescription}
Flow:          ${style.flowStyle}
Rawness:       ${style.rawnessDescriptor || 'honest and grounded'}
Language:      ${style.languageInstructions}
Imagery:       ${style.imageryStyle}
Core Devices:  ${(style.lyricalDevices || []).join(', ')}

SECTION TO WRITE
----------------
Type:          ${section.type.toUpperCase()}
Goal:          ${section.goal} — ${section.description}
Lines:         approximately ${section.lines}
Hook Style:    ${section.type === 'hook' ? style.hookStyle : 'N/A'}
Bridge Style:  ${section.type === 'bridge' ? style.bridgeStyle : 'N/A'}
Tension:       ${tensionLabel}
${temporalBlock}${identityBlock}${craftBlock}${alterEgoBlock}${dualityBlock}${contextBlock}

Now write ONLY this ${section.type.toUpperCase()} section. Lyrics only. No labels. No commentary.
`.trim();

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}

function buildFullSongPrompt(structure, persona, message, style) {
  const sectionList = structure.sections.map(s =>
    'Section ' + s.index + ': ' + s.type.toUpperCase() + ' — Goal: ' + s.goal
  ).join('\n');

  const userPrompt = `
SONG BRIEF
----------
Core Message: ${message.coreMessage}

PERSONA
-------
Archetype: ${persona.archetype} | Voice: ${persona.voice}
Perspective: ${persona.perspective} person | Tone: ${persona.tone}

STYLE
-----
Rhyme: ${style.rhymeScheme} | Language: ${persona.languageMix}
Flow: ${style.flowStyle}
Rawness: ${style.rawnessDescriptor || 'honest'}

STRUCTURE
---------
${sectionList}

Write the complete song following this structure exactly.
Label each section: [VERSE 1], [HOOK], [BRIDGE], etc.
Lyrics only — no explanations.
`.trim();

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}

function buildTemporalBlock(section, message) {
  const tp = message.temporalProfile;
  if (!tp) return '';

  const lines = ['\n--- TEMPORAL IDENTITY CONTEXT ---'];

  if (section.type === 'verse' && section.goal === 'recall_origin') {
    lines.push('TEMPORAL LAYER: PAST — draw from who the speaker WAS.');
  } else if (section.type === 'hook' || section.type === 'pre-hook') {
    lines.push('TEMPORAL LAYER: PRESENT — this is the NOW. The unresolved truth.');
  } else if (section.type === 'bridge') {
    lines.push('TEMPORAL LAYER: FUTURE — show the turn. Who they are becoming.');
  } else if (section.type === 'outro') {
    lines.push('TEMPORAL LAYER: FUTURE PROJECTION — leave with the projected self. Open-ended.');
  }

  if (tp.logicalRelation) {
    const rel = tp.logicalRelation.relation;
    if (rel === 'CONTRADICTION') {
      lines.push('LOGICAL RELATION: CONTRADICTION (' + Math.round(tp.logicalRelation.confidence * 100) + '% confidence)');
      lines.push('Do NOT resolve this contradiction. Hold both truths simultaneously.');
    } else if (rel === 'CONTRARY') {
      lines.push('LOGICAL RELATION: CONTRARY — two states that cannot both be true. Write into the gap between them.');
    } else if (rel === 'SUBCONTRARY') {
      lines.push('LOGICAL RELATION: SUBCONTRARY — both things are true. Do NOT simplify. Let the paradox breathe.');
    }
  }

  if (tp.conflictScore != null) {
    const intensity = tp.conflictScore >= 0.7 ? 'EXTREME' : tp.conflictScore >= 0.4 ? 'HIGH' : 'MODERATE';
    lines.push('CONFLICT INTENSITY: ' + intensity + ' (' + Math.round(tp.conflictScore * 100) + '/100)');
    if (tp.conflictScore >= 0.7) lines.push('Language should be raw, compressed, urgent.');
  }

  lines.push('--- END TEMPORAL CONTEXT ---');
  return lines.join('\n') + '\n';
}

module.exports = { buildSectionPrompt, buildFullSongPrompt, SYSTEM_PROMPT };
