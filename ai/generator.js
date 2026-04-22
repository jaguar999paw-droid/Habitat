/**
 * generator.js
 * 
 * AI Layer — Section-by-section song generation using the Anthropic Claude API.
 * Uses structured prompts from promptBuilder.js — NO freeform generation.
 * 
 * Supports:
 * - Section-by-section generation (recommended)
 * - Single-pass full song generation (fallback)
 * - Provider abstraction (easy to swap to OpenAI)
 */

const { buildSectionPrompt, buildFullSongPrompt } = require('./promptBuilder');

// ─── Provider Abstraction ──────────────────────────────────────────────────────

/**
 * Call the Claude API (Anthropic)
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {string} apiKey 
 * @returns {Promise<string>}
 */
// Valid Claude model strings as of April 2026
const CLAUDE_MODELS = {
  'claude-haiku-4-5-20251001': 'Haiku 4.5   — fastest, cheapest, good for drafts',
  'claude-sonnet-4-6':         'Sonnet 4.6  — best balance of quality + cost (recommended)',
  'claude-opus-4-6':           'Opus 4.6    — highest quality, requires Pro API tier',
};
const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4-6';

async function callClaude(systemPrompt, userPrompt, apiKey, model) {
  // Validate API key before making request
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('API key is missing or invalid. Please enter a valid Anthropic API key on the Landing screen.');
  }
  
  const trimmedKey = apiKey.trim();
  if (trimmedKey.length < 20) {
    throw new Error('API key appears too short. Please verify you copied the full key from your Anthropic dashboard.');
  }

  const resolvedModel = model || DEFAULT_CLAUDE_MODEL;

  console.log(`[Claude] Calling ${resolvedModel} with API key: ${trimmedKey.substring(0, 8)}...`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         trimmedKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      resolvedModel,
      max_tokens: 2048,
      system:     systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    let err = {};
    let errorText = '';
    
    try {
      err = await response.json();
      errorText = JSON.stringify(err, null, 2);
    } catch (e) {
      errorText = await response.text();
    }

    console.error(`[Claude] API Error (${response.status}):`, errorText);

    const msg = err.error?.message || response.statusText || errorText;
    const type = err.error?.type || '';

    // Give actionable error messages
    if (response.status === 401 || type === 'authentication_error' || msg.includes('invalid api key') || msg.includes('401')) {
      throw new Error(`API Authentication Failed: Check your API key. If the key is correct, it may be expired or revoked. Visit https://console.anthropic.com/account/keys`);
    }
    if (response.status === 403 || type === 'permission_error' || msg.includes('access') || msg.includes('permission')) {
      throw new Error(`Access Denied: Your API key doesn't have permission to use "${resolvedModel}". Check your Anthropic account tier or try a different model.`);
    }
    if (response.status === 404 || msg.includes('not found')) {
      throw new Error(`Model "${resolvedModel}" not found. Try "claude-sonnet-4-6" or "claude-haiku-4-5-20251001" instead.`);
    }
    if (type === 'overloaded_error' || response.status === 529) {
      throw new Error('Anthropic API is temporarily overloaded. Wait a moment and try again.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. You are making requests too quickly. Wait a few seconds and try again.');
    }
    if (response.status === 500 || response.status === 502 || response.status === 503) {
      throw new Error(`Anthropic API server error (${response.status}). Try again in a moment.`);
    }
    throw new Error(`Claude API error (${response.status}): ${msg}`);
  }

  const data = await response.json();
  
  if (!data.content || data.content.length === 0) {
    throw new Error('Claude returned an empty response. Try regenerating the section.');
  }
  
  const text = data.content[0]?.text?.trim() || '';
  if (!text) {
    throw new Error('Claude returned a response with no text content. Try regenerating.');
  }
  
  console.log(`[Claude] Successfully generated ${text.length} characters`);
  return text;
}

/**
 * Call the OpenAI API (optional alternative)
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {string} apiKey 
 * @returns {Promise<string>}
 */
async function callOpenAI(systemPrompt, userPrompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:    'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens:  1024,
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenAI API error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

// ─── Core Generator ────────────────────────────────────────────────────────────

/**
 * Generate a single song section
 * @param {object} params
 * @returns {Promise<{ type, goal, lyrics }>}
 */
async function generateSection({ section, persona, message, style, previousSections = [], apiKey, provider = 'claude', model }) {
  const { systemPrompt, userPrompt } = buildSectionPrompt(section, persona, message, style, previousSections);

  let lyrics;
  if (provider === 'openai') {
    lyrics = await callOpenAI(systemPrompt, userPrompt, apiKey);
  } else {
    lyrics = await callClaude(systemPrompt, userPrompt, apiKey, model);
  }

  return {
    type:   section.type,
    goal:   section.goal,
    index:  section.index,
    lyrics,
  };
}

/**
 * Generate a complete song section-by-section
 * @param {object} params
 * @returns {Promise<Array<{ type, goal, lyrics }>>}
 */
async function generateFullSong({ structure, persona, message, style, apiKey, provider = 'claude', model, onProgress }) {
  const generatedSections = [];

  for (const section of structure.sections) {
    // Pass previously generated sections for narrative continuity
    const generated = await generateSection({
      section,
      persona,
      message,
      style,
      previousSections: generatedSections,
      apiKey,
      provider,
      model,
    });

    generatedSections.push(generated);

    // Optional progress callback for real-time UI updates
    if (typeof onProgress === 'function') {
      onProgress({
        completed: generatedSections.length,
        total:     structure.sections.length,
        latest:    generated,
      });
    }
  }

  return generatedSections;
}

/**
 * Format generated sections into a readable song string
 * @param {Array<{ type, goal, lyrics }>} sections 
 * @returns {string}
 */
function formatSong(sections) {
  return sections.map(s => {
    const label = `[${s.type.toUpperCase()}]`;
    return `${label}\n${s.lyrics}`;
  }).join('\n\n');
}

module.exports = { generateSection, generateFullSong, formatSong };
