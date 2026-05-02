/**
 * journalRoutes.js — Habitat Journal API
 * 
 * Endpoints for journal entry management and synthesis.
 * Part of Layer 5 (API & Persistence) in Architecture v4.
 * 
 * Routes:
 *   POST /api/journal/entries         — Save a journal entry
 *   GET  /api/journal/entries         — List entries with pagination
 *   POST /api/journal/synthesize      — Synthesize entries → Cockpit prefill
 *   POST /api/journal/contradiction   — Detect logical contradictions
 */

const express = require('express');
const router = express.Router();

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const JOURNAL_FILE = path.join(os.homedir(), '.habitat-sessions', 'journal.json');

function loadJournalStore() {
  try {
    if (fs.existsSync(JOURNAL_FILE)) {
      return JSON.parse(fs.readFileSync(JOURNAL_FILE, 'utf8'));
    }
  } catch (e) { console.error('Journal load error:', e.message); }
  return {};
}

function saveJournalStore() {
  try {
    fs.mkdirSync(path.dirname(JOURNAL_FILE), { recursive: true });
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(journalStore, null, 2));
  } catch (e) { console.error('Journal persist error:', e.message); }
}


/**
 * Storage: Entries stored in memory + filesystem
 * (Extends ~/.habitat-sessions/ schema)
 */
let journalStore = loadJournalStore();  // persisted to ~/.habitat-sessions/journal.json

// ──────────────────────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────────────────────

const VALID_EMOTIONS = ['rage', 'sadness', 'defiance', 'peace', 'confusion', 'hope', 'shame', 'longing'];
const VALID_PROMPTS = [
  'Who are you NOT?',
  'What are you carrying?',
  'When did you become this?',
  'Where does it hurt?',
  'Why is this yours to carry?',
  'How do you defend yourself?',
  'What would you say if no one could hear?',
];

function validateEntry(entry) {
  const errors = [];
  
  if (!entry.text || typeof entry.text !== 'string' || entry.text.trim().length < 10) {
    errors.push('Text must be at least 10 characters');
  }
  
  if (!Array.isArray(entry.emotions) || entry.emotions.length === 0) {
    errors.push('At least one emotion is required');
  } else {
    const invalid = entry.emotions.filter(e => !VALID_EMOTIONS.includes(e));
    if (invalid.length > 0) {
      errors.push(`Invalid emotions: ${invalid.join(', ')}`);
    }
  }
  
  if (entry.promptIdx !== undefined && (entry.promptIdx < 0 || entry.promptIdx > VALID_PROMPTS.length - 1)) {
    errors.push('Invalid prompt index');
  }
  
  return { valid: errors.length === 0, errors };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function generateUUID() {
  return 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function detectTemporalMarkers(text) {
  const lowerText = text.toLowerCase();
  
  // Simple heuristics for past/present/future
  const pastWords = /(was|were|had|did|used to|back then|before|when i was|years ago|childhood)/gi;
  const presentWords = /(am|is|are|do|does|right now|today|currently|now|these days)/gi;
  const futureWords = /(will|shall|going to|want to|hope to|dream of|imagine|someday)/gi;
  
  const pastMatches = (text.match(pastWords) || []).length;
  const presentMatches = (text.match(presentWords) || []).length;
  const futureMatches = (text.match(futureWords) || []).length;
  
  const total = pastMatches + presentMatches + futureMatches || 1;
  
  return {
    past: pastMatches / total,
    present: presentMatches / total,
    future: futureMatches / total,
  };
}

function buildMetadata(text, emotions) {
  const wordCount = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  
  return {
    wordCount,
    sentenceCount: sentences,
    emotionCount: emotions.length,
    temporalMarkers: detectTemporalMarkers(text),
    languageDetected: 'en',  // TODO: Add ML language detection
    timestamp: Date.now(),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/journal/entries
 * Save a journal entry
 */
router.post('/entries', (req, res) => {
  try {
    const { text, emotions, promptIdx, timestamp } = req.body;
    
    const validation = validateEntry({ text, emotions, promptIdx });
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }
    
    const entryId = generateUUID();
    const metadata = buildMetadata(text, emotions);
    
    const entry = {
      entryId,
      text: text.trim(),
      emotions,
      promptIdx: promptIdx !== undefined ? promptIdx : Math.floor(Math.random() * VALID_PROMPTS.length),
      timestamp: timestamp || Date.now(),
      metadata,
    };
    
    journalStore[entryId] = entry;
    saveJournalStore();
    
    res.json({
      entryId,
      stored: true,
      metadata,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save entry', message: err.message });
  }
});

/**
 * GET /api/journal/entries?limit=30&skip=0
 * List entries with pagination
 */
router.get('/entries', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const skip = parseInt(req.query.skip) || 0;
    
    const entries = Object.values(journalStore)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + limit);
    
    res.json({
      entries: entries.map(e => ({
        entryId: e.entryId,
        text: e.text,
        emotions: e.emotions,
        timestamp: e.timestamp,
        metadata: e.metadata,
      })),
      total: Object.keys(journalStore).length,
      limit,
      skip,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries', message: err.message });
  }
});

/**
 * POST /api/journal/synthesize
 * Synthesize entries into Cockpit prefill
 */
router.post('/synthesize', (req, res) => {
  try {
    const { entryIds, forceRefresh } = req.body;
    
    let entriesToSynthesize = [];
    if (entryIds && Array.isArray(entryIds)) {
      entriesToSynthesize = entryIds
        .map(id => journalStore[id])
        .filter(Boolean);
    } else {
      // Last 7 entries
      entriesToSynthesize = Object.values(journalStore)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 7);
    }
    
    if (entriesToSynthesize.length === 0) {
      return res.json({
        cockpitPrefill: {},
        archetypeRecommendation: null,
        temporalProfile: { past: 0.33, present: 0.33, future: 0.33 },
        contradictions: [],
        emotionTrajectory: { last7Days: [], trend: 'stable' },
      });
    }
    
    // Aggregate emotions
    const emotionFreq = {};
    entriesToSynthesize.forEach(e => {
      e.emotions.forEach(em => {
        emotionFreq[em] = (emotionFreq[em] || 0) + 1;
      });
    });
    
    const primaryEmotion = Object.entries(emotionFreq)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'sadness';
    const secondaryEmotions = Object.entries(emotionFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(1, 3)
      .map(([e]) => e);
    
    // Aggregate temporal markers
    const temporalMarkers = entriesToSynthesize
      .map(e => e.metadata.temporalMarkers)
      .reduce((acc, cur) => ({
        past: (acc.past || 0) + cur.past,
        present: (acc.present || 0) + cur.present,
        future: (acc.future || 0) + cur.future,
      }), { past: 0, present: 0, future: 0 });
    
    const count = entriesToSynthesize.length;
    const temporalProfile = {
      past: temporalMarkers.past / count,
      present: temporalMarkers.present / count,
      future: temporalMarkers.future / count,
    };
    
    // Extract themes (simple keyword extraction)
    const allText = entriesToSynthesize.map(e => e.text).join(' ').toLowerCase();
    const subThemes = [];
    if (allText.includes('strength') || allText.includes('power') || allText.includes('strong')) {
      subThemes.push('Strength');
    }
    if (allText.includes('family') || allText.includes('belong')) {
      subThemes.push('Belonging');
    }
    if (allText.includes('transform') || allText.includes('change') || allText.includes('growth')) {
      subThemes.push('Transformation');
    }
    if (allText.includes('resist') || allText.includes('defian') || allText.includes('refuse')) {
      subThemes.push('Resistance');
    }
    if (allText.includes('freedom') || allText.includes('free') || allText.includes('liberat')) {
      subThemes.push('Freedom');
    }
    
    // Recommend archetype based on emotions
    const archetype = primaryEmotion === 'rage' || primaryEmotion === 'defiance'
      ? 'Defiant'
      : primaryEmotion === 'sadness' || primaryEmotion === 'shame'
        ? 'Wounded'
        : primaryEmotion === 'peace' || primaryEmotion === 'hope'
          ? 'Sage'
          : 'Seeker';
    
    res.json({
      cockpitPrefill: {
        mainIdea: `Theme emerging from your recent entries: ${subThemes.join(', ') || 'Personal growth'}`,
        emotionalTruth: `Your primary emotional landscape: ${primaryEmotion}`,
        socialConflict: `You\'ve been exploring how you relate to ${subThemes.length > 0 ? subThemes[0].toLowerCase() : 'identity'}`,
        subThemes,
        primaryEmotion,
        secondaryEmotions,
      },
      archetypeRecommendation: archetype,
      temporalProfile,
      contradictions: [],  // TODO: Implement contradiction detection
      emotionTrajectory: {
        last7Days: entriesToSynthesize.map(e => ({
          date: new Date(e.timestamp).toISOString().split('T')[0],
          dominantEmotions: e.emotions,
          score: e.metadata.emotionCount,
        })),
        trend: 'stable',  // TODO: Calculate trend
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Synthesis failed', message: err.message });
  }
});

/**
 * POST /api/journal/contradiction
 * Detect logical contradictions
 */
router.post('/contradiction', (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'entries must be an array' });
    }
    
    const contradictions = [];
    
    // Simple contradiction detection: conflicting language
    const hasStrength = entries.some(e => /strong|power|tough/.test(e.toLowerCase()));
    const hasWeakness = entries.some(e => /weak|fragile|vulnerable|broken/.test(e.toLowerCase()));
    
    if (hasStrength && hasWeakness) {
      contradictions.push({
        type: 'contradiction',
        claim1: 'Expresses strength and power',
        claim2: 'Expresses vulnerability and fragility',
        resolution: 'These are not mutually exclusive — strength often comes from acknowledging what\'s fragile.',
      });
    }
    
    res.json({ contradictions });
  } catch (err) {
    res.status(500).json({ error: 'Contradiction detection failed', message: err.message });
  }
});

module.exports = router;

