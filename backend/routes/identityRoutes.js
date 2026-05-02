/**
 * identityRoutes.js — Habitat Identity Configuration API
 * 
 * Endpoints for identity configuration, metrics, and unbiased assessment.
 * Core identity configuration management for the Cockpit interface.
 * 
 * Part of Layer 5 (API & Persistence) in Architecture v4.
 */

const express = require('express');
const router = express.Router();

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const IDENTITY_FILE = path.join(os.homedir(), '.habitat-sessions', 'identity.json');

function loadIdentityStore() {
  try {
    if (fs.existsSync(IDENTITY_FILE)) {
      return JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));
    }
  } catch (e) { console.error('Identity load error:', e.message); }
  return {};
}

function saveIdentityStore() {
  try {
    fs.mkdirSync(path.dirname(IDENTITY_FILE), { recursive: true });
    fs.writeFileSync(IDENTITY_FILE, JSON.stringify(identityConfigStore, null, 2));
  } catch (e) { console.error('Identity persist error:', e.message); }
}


// ──────────────────────────────────────────────────────────────────────────────
// Storage (in-memory for now, extends ~/.habitat-sessions/)
// ──────────────────────────────────────────────────────────────────────────────

let identityConfigStore = loadIdentityStore();  // persisted to ~/.habitat-sessions/identity.json

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const VALID_ARCHETYPES = [
  'Defiant',
  'Wounded',
  'Seeker',
  'Witness',
  'Trickster',
  'Confessor',
  'Street Philosopher',
  'Ghost',
];

const VALID_ALTER_EGOS = [
  'none',
  'the_confessor',
  'the_witness',
  'the_trickster',
  'the_preacher',
  'the_ghost',
  'the_street_philosopher',
];

const VALID_PERSPECTIVES = ['1st', '2nd', '3rd'];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Validate identity config structure
 */
function validateIdentityConfig(config) {
  const errors = [];
  
  if (config.archetype && !VALID_ARCHETYPES.includes(config.archetype)) {
    errors.push(`archetype must be one of: ${VALID_ARCHETYPES.join(', ')}`);
  }
  
  if (config.sliders) {
    if (config.sliders.rawness !== undefined && (config.sliders.rawness < 0 || config.sliders.rawness > 100)) {
      errors.push('sliders.rawness must be 0-100');
    }
    if (config.sliders.decisiveness !== undefined && (config.sliders.decisiveness < 0 || config.sliders.decisiveness > 100)) {
      errors.push('sliders.decisiveness must be 0-100');
    }
    if (config.sliders.attribution !== undefined && (config.sliders.attribution < 0 || config.sliders.attribution > 100)) {
      errors.push('sliders.attribution must be 0-100');
    }
    if (config.sliders.vulnerability_level !== undefined && (config.sliders.vulnerability_level < 0 || config.sliders.vulnerability_level > 100)) {
      errors.push('sliders.vulnerability_level must be 0-100');
    }
  }
  
  if (config.alterEgo && !VALID_ALTER_EGOS.includes(config.alterEgo)) {
    errors.push(`alterEgo must be one of: ${VALID_ALTER_EGOS.join(', ')}`);
  }
  
  if (config.perspective && !VALID_PERSPECTIVES.includes(config.perspective)) {
    errors.push(`perspective must be one of: ${VALID_PERSPECTIVES.join(', ')}`);
  }
  
  if (config.languageMix) {
    const sum = (config.languageMix.en || 0) + (config.languageMix.sw || 0) + (config.languageMix.sh || 0);
    if (sum > 100) {
      errors.push('languageMix must sum to ≤ 100');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Build 6-angle radar values from config and temporal profile
 */
function buildRadarValues(config, temporalProfile = {}) {
  const tp = temporalProfile || {};
  const sliders = config.sliders || {};
  
  const attr = sliders.attribution ?? 50;
  const cert = sliders.decisiveness ?? 50;
  const cs = 50;  // conflict score (simplified)
  
  const past = tp.past ?? 0.33;
  const present = tp.present ?? 0.33;
  const future = tp.future ?? 0.34;
  
  return {
    pastActual: Math.round(past * (attr / 100) * 100),
    pastAlt: Math.round(past * (1 - attr / 100) * 100),
    presentActual: Math.round(present * (cert / 100) * 100),
    presentAlt: Math.round(present * (1 - cert / 100) * 100),
    futureProjected: Math.round(future * ((100 - cs) / 100) * 100),
    futureAlt: Math.round(future * (cs / 100) * 100),
  };
}

/**
 * Build cached persona from config
 */
function buildCachedPersona(config) {
  const sliders = config.sliders || {};
  const archetype = config.archetype || 'Seeker';
  
  // Simplified persona based on sliders
  const emotions = [];
  if (sliders.rawness > 70) emotions.push('intense');
  if (sliders.vulnerability_level > 60) emotions.push('vulnerable');
  if (sliders.decisiveness > 70) emotions.push('resolute');
  
  return {
    archetype,
    emotion: emotions[0] || 'thoughtful',
    traits: {
      rawness: sliders.rawness ?? 50,
      decisiveness: sliders.decisiveness ?? 50,
      attribution: sliders.attribution ?? 50,
      vulnerability: sliders.vulnerability_level ?? 50,
    },
    voice: sliders.rawness > 70 ? 'unfiltered' : sliders.rawness > 40 ? 'honest' : 'polished',
    language: config.languageMix || { en: 100, sw: 0, sh: 0 },
    alterEgo: config.alterEgo || 'none',
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/identity/config
 * Get current identity configuration
 */
router.get('/config', (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const config = identityConfigStore[userId] || {
      archetype: null,
      sliders: { rawness: 50, decisiveness: 50, attribution: 50, vulnerability_level: 50 },
      alterEgo: 'none',
      perspective: '1st',
      languageMix: { en: 100, sw: 0, sh: 0 },
      dualityMode: false,
    };
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config', message: err.message });
  }
});

/**
 * POST /api/identity/config
 * Update identity configuration
 */
router.post('/config', (req, res) => {
  try {
    const userId = req.body.userId || 'default';
    const config = req.body.config || {};
    
    // Validate
    const validation = validateIdentityConfig(config);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }
    
    // Merge with existing
    const updated = {
      ...identityConfigStore[userId],
      ...config,
      timestamp: Date.now(),
    };
    
    identityConfigStore[userId] = updated;
    saveIdentityStore();
    
    const radarValues = buildRadarValues(updated);
    const cachedPersona = buildCachedPersona(updated);
    
    res.json({
      validated: true,
      config: updated,
      radarValues,
      cachedPersona,
      suggestions: config.dualityMode ? [
        'Dual mode active: both "what" and "what NOT" will inform song generation',
        'Your shadow (what-not) will create depth and tension in the verses',
      ] : [],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update config', message: err.message });
  }
});

/**
 * POST /api/identity/6angle-profile
 * Get hexagonal radar values
 */
router.post('/6angle-profile', (req, res) => {
  try {
    const config = req.body.config || {};
    const temporalProfile = req.body.temporalProfile || {};
    
    const radarValues = buildRadarValues(config, temporalProfile);
    
    res.json({
      radarValues,
      axes: [
        { key: 'pastActual', label: 'Past · Real' },
        { key: 'pastAlt', label: 'Past · Shadow' },
        { key: 'presentActual', label: 'Now · Real' },
        { key: 'presentAlt', label: 'Now · Shadow' },
        { key: 'futureProjected', label: 'Future · Vision' },
        { key: 'futureAlt', label: 'Future · Fear' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to build radar', message: err.message });
  }
});

/**
 * POST /api/identity/unbiased-assessment
 * Score identity authenticity, consistency, depth, nuance
 */
router.post('/unbiased-assessment', (req, res) => {
  try {
    const { journalEntries, hookData, userSliders } = req.body;
    
    // Authenticity: Does journal match slider claims?
    let authenticity = 50;
    if (journalEntries && journalEntries.length > 0) {
      const journalEmotionalContent = journalEntries.join(' ').toLowerCase();
      const hasEmotionalLanguage = /hurt|pain|feel|struggle|strength|growth|transform/.test(journalEmotionalContent);
      authenticity = hasEmotionalLanguage ? 75 : 50;
    }
    
    // Consistency: Are claims repeated across entries?
    let consistency = 50;
    if (journalEntries && journalEntries.length > 2) {
      const keywords = {};
      journalEntries.forEach(entry => {
        const words = entry.toLowerCase().match(/\b\w{4,}\b/g) || [];
        words.forEach(w => {
          keywords[w] = (keywords[w] || 0) + 1;
        });
      });
      const repeatedWords = Object.values(keywords).filter(count => count > 1).length;
      consistency = repeatedWords > 5 ? 75 : repeatedWords > 2 ? 60 : 40;
    }
    
    // Depth: Is content specific vs. generic?
    let depth = 50;
    if (journalEntries && journalEntries.length > 0) {
      const totalWords = journalEntries.reduce((sum, e) => sum + e.split(/\s+/).length, 0);
      const avgWordsPerEntry = totalWords / journalEntries.length;
      depth = avgWordsPerEntry > 50 ? 75 : avgWordsPerEntry > 30 ? 60 : 40;
    }
    
    // Nuance: Is there complexity (duality, temporal range)?
    let nuance = 50;
    if (hookData && hookData.references && hookData.references.length > 1) {
      nuance += 15;
    }
    if (userSliders && userSliders.rawness !== userSliders.decisiveness) {
      nuance += 10;
    }
    nuance = Math.min(100, nuance);
    
    // Detect biases
    const bias = {
      selfFlattery: authenticity < 50 ? 'medium' : 'low',
      shadowDenial: userSliders.vulnerability_level < 30 ? 'high' : userSliders.vulnerability_level < 60 ? 'medium' : 'low',
      narrativeStability: consistency > 65 ? 'coherent' : consistency > 40 ? 'evolving' : 'contradictory',
    };
    
    // Recommendations
    const recommendations = [];
    if (authenticity < 60) {
      recommendations.push({
        category: 'authenticity',
        issue: 'Journal entries may lack emotional specificity',
        suggestion: 'Try the confrontational prompts with more vulnerable language',
        priority: 'high',
      });
    }
    if (consistency < 50) {
      recommendations.push({
        category: 'consistency',
        issue: 'Your entries seem to jump between different themes',
        suggestion: 'Consider tracking one theme across multiple entries',
        priority: 'medium',
      });
    }
    if (depth < 50) {
      recommendations.push({
        category: 'depth',
        issue: 'Entries are brief — more detail would help engine understanding',
        suggestion: 'Aim for 50+ words per entry; use the 10-15 min timer mode',
        priority: 'medium',
      });
    }
    if (nuance < 50) {
      recommendations.push({
        category: 'nuance',
        issue: 'Consider exploring your shadow (duality mode) and future vision',
        suggestion: 'Fill in more reference lyrics and use multiple hook types',
        priority: 'low',
      });
    }
    
    res.json({
      scorecard: {
        authenticity: Math.min(100, authenticity),
        consistency: Math.min(100, consistency),
        depth: Math.min(100, depth),
        nuance: Math.min(100, nuance),
      },
      bias,
      recommendations,
      overall: Math.round((authenticity + consistency + depth + nuance) / 4),
      status: Math.round((authenticity + consistency + depth + nuance) / 4) > 70
        ? 'strong_foundation'
        : 'developing',
    });
  } catch (err) {
    res.status(500).json({ error: 'Assessment failed', message: err.message });
  }
});

module.exports = router;

