/**
 * hookbookRoutes.js — Habitat Hook Book API  
 * 
 * Endpoints for hook strategy analysis and validation.
 * Existing endpoints (syllables, rhymes, stress, scheme, devices, etc.) continue.
 * New endpoints added here: strategy, validation, coherence-batch
 * 
 * Part of Layer 5 (API & Persistence) in Architecture v4.
 */

const express = require('express');
const router = express.Router();

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const HOOK_TYPES = [
  'repetition',
  'call_response',
  'question_answer',
  'paradox',
  'ascending',
  'fragmented',
];

const PEAK_LOCATIONS = [
  'verse_1',
  'pre_chorus',
  'chorus',
  'bridge',
  'outro',
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Simple rhyme scheme detection
 */
function detectRhymeScheme(lines) {
  if (!lines || lines.length === 0) return 'FREE';
  
  const getLastWord = (line) => line.trim().split(/\s+/).pop().toLowerCase();
  const phonetically = (word) => word.slice(-2);  // Simplified: last 2 chars
  
  const schemes = lines.map(line => phonetically(getLastWord(line)));
  
  // Check patterns
  if (schemes.slice(0, 2).every(s => s === schemes[0]) && 
      schemes.slice(2, 4).every((s, i) => s === schemes[2])) {
    return 'AABB';
  }
  
  if (schemes[0] === schemes[2] && schemes[1] === schemes[3]) {
    return 'ABAB';
  }
  
  if (schemes.every(s => s === schemes[0])) {
    return 'AAAA';
  }
  
  return 'FREE';
}

/**
 * Detect literary devices (simple heuristics)
 */
function detectDevices(lines) {
  const text = lines.join(' ').toLowerCase();
  const devices = {};
  
  // Alliteration: repeated first sounds
  const words = text.match(/\b\w+\b/g) || [];
  const firstLetters = words.map(w => w[0]);
  for (let i = 0; i < firstLetters.length - 1; i++) {
    if (firstLetters[i] === firstLetters[i + 1]) {
      devices.alliteration = (devices.alliteration || 0) + 1;
    }
  }
  
  // Assonance: repeated vowel sounds
  const vowelSequences = text.match(/[aeiou]+/g) || [];
  if (vowelSequences.length > 2) {
    devices.assonance = Math.floor(vowelSequences.length / 3);
  }
  
  // Anaphora: lines starting with same word
  const lineStarts = lines.map(l => l.trim().split(/\s+/)[0].toLowerCase());
  for (let i = 0; i < lineStarts.length - 1; i++) {
    if (lineStarts[i] === lineStarts[i + 1]) {
      devices.anaphora = (devices.anaphora || 0) + 1;
    }
  }
  
  // Epistrophe: lines ending with same word
  const lineEnds = lines.map(l => l.trim().split(/\s+/).pop().toLowerCase());
  for (let i = 0; i < lineEnds.length - 1; i++) {
    if (lineEnds[i] === lineEnds[i + 1]) {
      devices.epistrophe = (devices.epistrophe || 0) + 1;
    }
  }
  
  return Object.fromEntries(Object.entries(devices).filter(([, v]) => v > 0));
}

/**
 * Tone profile from reference lyrics
 */
function analyzeToneProfile(lyrics) {
  const text = lyrics.toLowerCase();
  
  const aggression = (
    (text.match(/\b(fight|crush|break|destroy|kill|attack|war|battle|rage|force)\b/g) || []).length * 20
  );
  
  const vulnerability = (
    (text.match(/\b(hurt|pain|cry|break|lost|alone|empty|weak|scared|fragile)\b/g) || []).length * 15
  );
  
  const wisdom = (
    (text.match(/\b(know|understand|learn|grow|realize|wise|truth|peace|accept|forgive)\b/g) || []).length * 12
  );
  
  const playfulness = (
    (text.match(/\b(play|laugh|smile|fun|dance|joy|light|sweet|cute|silly)\b/g) || []).length * 10
  );
  
  return {
    aggression: Math.min(100, aggression),
    vulnerability: Math.min(100, vulnerability),
    wisdom: Math.min(100, wisdom),
    playfulness: Math.min(100, playfulness),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/hookbook/strategy
 * Validate and analyze hook strategy
 */
router.post('/strategy', (req, res) => {
  try {
    const { hookTypes, wordCount, peakLocation, references, emotion } = req.body;
    
    const errors = [];
    if (!hookTypes || !Array.isArray(hookTypes) || hookTypes.length === 0) {
      errors.push('hookTypes must be a non-empty array');
    }
    if (!wordCount || wordCount < 2 || wordCount > 12) {
      errors.push('wordCount must be between 2 and 12');
    }
    if (!peakLocation || !PEAK_LOCATIONS.includes(peakLocation)) {
      errors.push(`peakLocation must be one of: ${PEAK_LOCATIONS.join(', ')}`);
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }
    
    // Analyze feasibility
    let intensity = 'medium';
    if (hookTypes.includes('repetition') || hookTypes.includes('ascending')) {
      intensity = 'high';
    } else if (hookTypes.includes('paradox') || hookTypes.includes('fragmented')) {
      intensity = 'challenging';
    }
    
    const rhymeIntensity = wordCount > 8 ? 'dense' : wordCount > 5 ? 'internal' : 'consonant';
    
    const notes = [];
    if (hookTypes.includes('paradox')) {
      notes.push('Paradoxical hooks require strong emotional grounding — ensure your journal entries support this');
    }
    if (wordCount < 4) {
      notes.push('Very short hooks (< 4 words) are powerful but risky — test them with fresh ears');
    }
    if (peakLocation === 'verse_1') {
      notes.push('Early peaks demand immediate authenticity — no warm-up');
    }
    
    res.json({
      strategy: {
        themes: hookTypes,
        intensity,
        peakTiming: peakLocation,
        rhymeIntensity,
      },
      validation: {
        feasibility: intensity === 'high' ? 'high' : intensity === 'medium' ? 'medium' : 'challenging',
        notes,
      },
      rhymeSchemeRecommendation: rhymeIntensity === 'dense' ? 'AABB' : 'ABAB',
      suggestions: [
        'Test your hook with 2-3 trusted listeners before generation',
        'Consider your reference lyrics for rhythmic inspiration',
        `Peak location (${peakLocation}) should build naturally from earlier sections`,
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Strategy analysis failed', message: err.message });
  }
});

/**
 * POST /api/hookbook/reference-analysis (enhanced version)
 * Analyze reference lyrics for style DNA
 */
router.post('/reference-analysis', (req, res) => {
  try {
    const { lyrics, artist, title } = req.body;
    
    if (!lyrics || typeof lyrics !== 'string') {
      return res.status(400).json({ error: 'lyrics must be a non-empty string' });
    }
    
    const lines = lyrics.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      return res.status(400).json({ error: 'Please provide at least 2 lines of lyrics' });
    }
    
    const scheme = detectRhymeScheme(lines);
    const devices = detectDevices(lines);
    const toneProfile = analyzeToneProfile(lyrics);
    
    // Rhyme style DNA
    const monosyllabicWords = (lyrics.match(/\b[aeiou]?[^aeiou]*[aeiou][^aeiou]?\b/g) || []).length;
    const totalWords = (lyrics.match(/\b\w+\b/g) || []).length;
    
    res.json({
      scheme,
      devices: {
        alliteration: devices.alliteration || 0,
        assonance: devices.assonance || 0,
        anaphora: devices.anaphora || 0,
        epistrophe: devices.epistrophe || 0,
      },
      toneProfile,
      rhymeStyleDNA: {
        monosyllabic: Math.round((monosyllabicWords / totalWords) * 100),
        complexity: scheme === 'FREE' ? 30 : scheme === 'ABAB' ? 50 : 70,
        density: lines.length > 6 ? 80 : lines.length > 3 ? 50 : 30,
      },
      styleKeywords: [
        toneProfile.aggression > 50 ? 'aggressive' : null,
        toneProfile.vulnerability > 50 ? 'vulnerable' : null,
        toneProfile.wisdom > 50 ? 'wise' : null,
        toneProfile.playfulness > 50 ? 'playful' : null,
      ].filter(Boolean),
      metadata: {
        artist: artist || 'Unknown',
        title: title || 'Unknown',
        lineCount: lines.length,
        wordCount: totalWords,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Reference analysis failed', message: err.message });
  }
});

/**
 * POST /api/hookbook/coherence-batch
 * Score overall song coherence
 */
router.post('/coherence-batch', (req, res) => {
  try {
    const { verses } = req.body;
    
    if (!Array.isArray(verses)) {
      return res.status(400).json({ error: 'verses must be an array' });
    }
    
    // Simple coherence scoring
    const scores = verses.map((verse, idx) => {
      const lines = verse.text.split('\n').filter(l => l.trim());
      const wordCount = verse.text.split(/\s+/).length;
      
      // Metrics
      const hasRhyme = detectRhymeScheme(lines) !== 'FREE' ? 30 : 0;
      const hasDevices = Object.keys(detectDevices(lines)).length > 0 ? 20 : 0;
      const isLengthyEnough = wordCount > 30 ? 30 : wordCount > 15 ? 15 : 0;
      const hasEmotionalLanguage = /(feel|felt|feel|heart|soul|break|fly|rise|fall)/i.test(verse.text) ? 20 : 0;
      
      const score = Math.min(100, hasRhyme + hasDevices + isLengthyEnough + hasEmotionalLanguage);
      
      return {
        section: verse.section || `Section ${idx + 1}`,
        score,
        status: score > 70 ? 'strong' : score > 50 ? 'good' : 'needs_work',
        suggestions: [
          score < 50 ? 'Consider adding more emotional vocabulary' : null,
          score < 60 ? 'Try introducing more literary devices (rhyme, alliteration)' : null,
          score < 40 ? 'This section feels thin — expand with more vivid imagery' : null,
        ].filter(Boolean),
      };
    });
    
    const overallScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
    
    res.json({
      overallCoherence: overallScore,
      perVerse: scores,
      summary: {
        status: overallScore > 70 ? 'cohesive' : overallScore > 50 ? 'developing' : 'needs_work',
        strengths: [],
        improvements: overallScore < 60 ? ['Add more emotional depth', 'Increase literary device usage'] : [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Coherence analysis failed', message: err.message });
  }
});

module.exports = router;

