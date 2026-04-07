/**
 * server.js — SCI Songwriting Engine Backend v3
 *
 * Routes:
 *   POST /api/analyze     → Parse identity (ML-enhanced, rule-based fallback)
 *   POST /api/generate    → Generate full song
 *   POST /api/section     → Generate / regenerate a single section
 *   POST /api/save        → Save session to ~/.sci-sessions/[timestamp].json
 *   GET  /api/sessions    → List saved sessions
 *   GET  /api/health      → Health check (includes ML service status)
 *
 * v3 changes:
 *   - /api/analyze now passes craft + identityConfig from overrides
 *     through to mapStyle() → promptBuilder (craft layer + 6-angle identity)
 *   - message.identityConfig is set from overrides so promptBuilder can access it
 *   - version bumped to 3.0.0
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const os      = require('os');

const { parseIdentity }    = require('../engine/identityParser');
const { buildPersona }     = require('../engine/personaBuilder');
const { extractMessage }   = require('../engine/messageExtractor');
const { planStructure }    = require('../engine/structurePlanner');
const { mapStyle }         = require('../engine/styleMapper');
const { analyzeReference } = require('../engine/referenceAnalyzer');

const { generateFullSong, generateSection, formatSong } = require('../ai/generator');

const app  = express();
const PORT = process.env.PORT || 3001;

const SESSIONS_DIR = path.join(os.homedir(), '.sci-sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let mlStatus = 'unavailable';
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 400);
    const r = await fetch('http://localhost:3002/ml/health', { signal: controller.signal });
    if (r.ok) mlStatus = (await r.json()).status;
  } catch { /* ML offline */ }
  res.json({ status: 'ok', version: '3.0.0', engine: 'SCI Songwriting Engine', mlService: mlStatus });
});

// ── Analyze Identity ──────────────────────────────────────────────────────────
/**
 * POST /api/analyze
 * Body: {
 *   answers: { whoAreYouNot, emotionalTruth, socialConflict, mainIdea, referenceText },
 *   overrides?: {
 *     rawness: 0-100,
 *     rhymeScheme: 'AABB'|'ABAB'|...,
 *     energyValue: 0-100,
 *     craft: { rhetoricalDevices, humorType, humorIntensity, rhymeType, meter,
 *              dictionLevel, grammarIntentionality, momentum, resolution,
 *              narratorMorality, stance, themeSensitivity, restraint, ... },
 *     identityConfig: { past, present, future, controls, alterEgos, activeAlterEgo }
 *   }
 * }
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { answers, overrides = {} } = req.body;
    if (!answers || Object.keys(answers).length === 0)
      return res.status(400).json({ error: 'No answers provided.' });

    const referenceProfile = answers.referenceText
      ? analyzeReference(answers.referenceText)
      : { hasReference: false };

    const parsed      = await parseIdentity(answers);
    parsed.overrides  = overrides;

    const persona = buildPersona(parsed);
    if (overrides.energyValue !== undefined) persona.energyValue = overrides.energyValue;

    const message   = extractMessage(parsed);

    // v3: inject identityConfig into message so promptBuilder can access it
    if (overrides.identityConfig) message.identityConfig = overrides.identityConfig;

    const structure = planStructure(persona, message);

    // v3: pass craft + identityConfig overrides into mapStyle → style.craftConfig / style.identityConfig
    const style = mapStyle(persona, {
      rawness:        overrides.rawness,
      rhymeScheme:    overrides.rhymeScheme || referenceProfile.rhymeScheme,
      craft:          overrides.craft          || {},
      identityConfig: overrides.identityConfig || null,
    });

    res.json({
      success: true,
      parsed, persona, message, structure, style,
      referenceProfile,
      mlUsed:       parsed.mlUsed,
      mlConfidence: parsed.mlConfidence,
    });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Generate Full Song ────────────────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  try {
    const { persona, message, structure, style, apiKey, provider = 'claude' } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'API key is required.' });

    const sections  = await generateFullSong({ structure, persona, message, style, apiKey, provider });
    const formatted = formatSong(sections);

    res.json({
      success: true, sections, song: formatted,
      metadata: { archetype: persona.archetype, coreMessage: message.coreMessage, structure: structure.conflictType, language: persona.languageMix },
    });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Generate / Regenerate Single Section ─────────────────────────────────────
app.post('/api/section', async (req, res) => {
  try {
    const { section, persona, message, style, previousSections = [], apiKey, provider = 'claude', seed = 0 } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'API key is required.' });

    const styleWithSeed = seed > 0
      ? { ...style, seedHint: `Variation ${seed} — use a different angle, metaphor, or opening line.` }
      : style;

    const generated = await generateSection({ section, persona, message, style: styleWithSeed, previousSections, apiKey, provider });
    res.json({ success: true, section: generated });
  } catch (err) {
    console.error('Section generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Save Session ──────────────────────────────────────────────────────────────
app.post('/api/save', (req, res) => {
  try {
    const timestamp = Date.now();
    const filepath  = path.join(SESSIONS_DIR, `session-${timestamp}.json`);
    fs.writeFileSync(filepath, JSON.stringify({ ...req.body, savedAt: new Date().toISOString(), id: timestamp }, null, 2));
    res.json({ success: true, id: timestamp, filename: `session-${timestamp}.json`, path: filepath });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── List Sessions ─────────────────────────────────────────────────────────────
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.json')).sort().reverse().slice(0, 50)
      .map(f => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf8'));
          return { id: data.id, savedAt: data.savedAt, archetype: data.metadata?.archetype, coreMessage: data.metadata?.coreMessage, filename: f };
        } catch { return { filename: f, error: 'parse error' }; }
      });
    res.json({ success: true, sessions, count: sessions.length });
  } catch (err) {
    console.error('Sessions list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎵 SCI Songwriting Engine v3 — http://localhost:${PORT}`);
  console.log(`   Craft layer: lyricsStyleEngine + identityConfig + altEgoEngine`);
  console.log(`   ML Service:  http://localhost:3002`);
  console.log(`   Sessions:    ${SESSIONS_DIR}\n`);
});
