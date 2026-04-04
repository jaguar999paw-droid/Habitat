const { getTensionWeight } = require('../engine/temporalParser');

/**
 * promptBuilder.js
 * 
 * Constructs structured prompts for the AI layer.
 * Each section gets its own focused prompt — preventing freeform generation.
 * 
 * Prompt strategy based on SONG_QUESTIONAIRE.md WH-questions and SCI philosophy.
 */

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a structured songwriting engine called SCI (Structured Creative Intelligence).

Your role is to write ONE SECTION of a song at a time, exactly as instructed.

RULES YOU MUST FOLLOW:
1. Write ONLY the requested section (verse / hook / bridge / pre-hook / intro / outro)
2. Follow the specified rhyme scheme exactly
3. Match the persona's voice, tone, and perspective
4. Use the language blend as instructed (English / Kiswahili / Sheng)
5. Serve the stated GOAL of the section — don't drift
6. Do NOT include section labels (e.g., don't write "Verse 1:" in the lyrics)
7. Do NOT explain your choices or add commentary — only output the lyrics
8. Keep line count close to the specified number (±1 line is acceptable)
9. Use the imagery style to ground the writing in concrete, sensory language
10. The core message is the spine — every section must connect back to it

You are not a general-purpose writer. You are a disciplined songwriting intelligence.`;

// ─── Section Prompt Builder ────────────────────────────────────────────────────

/**
 * Build a full prompt for one section
 * @param {object} section - from structurePlanner output
 * @param {object} persona - from personaBuilder
 * @param {object} message - from messageExtractor
 * @param {object} style   - from styleMapper
 * @param {Array}  previousSections - array of { type, goal, lyrics } for context
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
function buildSectionPrompt(section, persona, message, style, previousSections = []) {
  // Build context block from previously generated sections
  let contextBlock = '';
  if (previousSections.length > 0) {
    contextBlock = '\n\n--- PREVIOUSLY WRITTEN SECTIONS (for continuity) ---\n';
    contextBlock += previousSections.map(s =>
      `[${s.type.toUpperCase()} — ${s.goal}]\n${s.lyrics}`
    ).join('\n\n');
    contextBlock += '\n--- END OF PREVIOUS SECTIONS ---';
  }

  // Inject temporal context if available
  const temporalBlock = buildTemporalBlock(section, message)

  const userPrompt = `
SONG BRIEF
----------
Core Message: ${message.coreMessage}
Sub-Themes: ${(message.subThemes || []).join(', ') || 'none'}

PERSONA
-------
Archetype:    ${persona.archetype}
Voice:        ${persona.voice}
Perspective:  ${persona.perspective} person
Tone:         ${persona.tone}
Energy:       ${persona.energy}
Emotions:     ${persona.primaryEmotion}${persona.secondaryEmotions.length ? ', ' + persona.secondaryEmotions.join(', ') : ''}

STYLE RULES
-----------
Rhyme Scheme: ${style.rhymeScheme} — ${style.rhymeDescription}
Flow:         ${style.flowStyle}
Language:     ${style.languageInstructions}
Imagery:      ${style.imageryStyle}
Devices:      ${style.lyricalDevices.join(', ')}

SECTION TO WRITE
----------------
Type:            ${section.type.toUpperCase()}
Goal:            ${section.goal} — ${section.description}
Line Count:      approximately ${section.lines} lines
Hook Style:      ${section.type === 'hook' ? style.hookStyle : 'N/A'}
Bridge Style:    ${section.type === 'bridge' ? style.bridgeStyle : 'N/A'}
Tension Weight:  ${Math.round(getTensionWeight(section.type) * 100)}% — this section is ${getTensionWeight(section.type) >= 0.8 ? 'HIGH-TENSION: lean into contradiction, do not resolve it' : getTensionWeight(section.type) >= 0.6 ? 'MID-TENSION: explore, not declare' : 'LOW-TENSION: establish and ground'}
${temporalBlock}${contextBlock}

Now write ONLY this ${section.type.toUpperCase()} section. Output lyrics only. No labels, no commentary.
`.trim();

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}

/**
 * Build a full song prompt for a single-pass generation (simpler use case)
 */
function buildFullSongPrompt(structure, persona, message, style) {
  const sectionList = structure.sections.map(s =>
    `Section ${s.index}: ${s.type.toUpperCase()} — Goal: ${s.goal}`
  ).join('\n');

  // Inject temporal context if available
  const temporalBlock = buildTemporalBlock(section, message)

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

STRUCTURE
---------
${sectionList}

Write the complete song following this structure exactly. 
Label each section clearly (e.g., [VERSE 1], [HOOK], [BRIDGE]).
Lyrics only — no explanations.
`.trim();

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}


/**
 * Build a temporal context block to inject into the AI prompt.
 * Only included if temporal data is available on the message object.
 */
function buildTemporalBlock(section, message) {
  const tp = message.temporalProfile
  if (!tp) return ''

  const lines = ['\n--- TEMPORAL IDENTITY CONTEXT ---']

  // Tell the AI which time layer this section should draw from
  if (section.type === 'verse' && section.goal === 'recall_origin') {
    lines.push('TEMPORAL LAYER FOR THIS SECTION: PAST')
    lines.push('Draw from who the speaker WAS — formative moments, old wounds, earlier version of self.')
  } else if (section.type === 'hook' || section.type === 'pre-hook') {
    lines.push('TEMPORAL LAYER FOR THIS SECTION: PRESENT')
    lines.push('This is the NOW. The unresolved contradiction. The thing that cannot be unsaid.')
  } else if (section.type === 'bridge') {
    const hasFuture = tp.temporal?.counts?.future > 0
    lines.push(`TEMPORAL LAYER FOR THIS SECTION: ${hasFuture ? 'FUTURE' : 'PRESENT → FUTURE'}`)
    lines.push('The bridge is where transformation lives. Show the shift — who they are becoming.')
  } else if (section.type === 'outro') {
    lines.push('TEMPORAL LAYER FOR THIS SECTION: FUTURE PROJECTION')
    lines.push('Leave the listener with the projected self — desired or feared. Open-ended.')
  }

  // Logical relation instruction
  if (tp.logicalRelation) {
    const rel = tp.logicalRelation.relation
    if (rel === 'CONTRADICTION') {
      lines.push(`LOGICAL RELATION: CONTRADICTION (${Math.round(tp.logicalRelation.confidence * 100)}% confidence)`)
      lines.push('The speaker's identity contains a direct contradiction. Do NOT resolve it. Hold both truths simultaneously.')
    } else if (rel === 'CONTRARY') {
      lines.push('LOGICAL RELATION: CONTRARY — two states that cannot both be true.')
      lines.push('The speaker is caught between two poles with no middle ground yet found. Write into the gap.')
    } else if (rel === 'SUBCONTRARY') {
      lines.push('LOGICAL RELATION: SUBCONTRARY — both things are true at once. This is the complexity.')
      lines.push('Do NOT simplify. Allow the paradox to breathe. Both truths belong here.')
    }
  }

  // Conflict score
  if (tp.conflictScore != null) {
    const intensity = tp.conflictScore >= 0.7 ? 'EXTREME' : tp.conflictScore >= 0.4 ? 'HIGH' : 'MODERATE'
    lines.push(`CONFLICT INTENSITY: ${intensity} (${Math.round(tp.conflictScore * 100)}/100)`)
    if (tp.conflictScore >= 0.7) {
      lines.push('Identity conflict is extreme. The language should reflect this — raw, compressed, urgent.')
    }
  }

  lines.push('--- END TEMPORAL CONTEXT ---')
  return lines.join('\n') + '\n'
}

module.exports = { buildSectionPrompt, buildFullSongPrompt, SYSTEM_PROMPT };
