'use strict';
/**
 * engine/rhymeGraph.js
 * Lightweight phonetic rhyme graph for hooks.
 * Zero heavy NLP — heuristic ending-sound matching.
 */

// ── Simple phonetic normalizer ─────────────────────────────────────────────
const PHONETIC_MAP = [
  [/ight$/, 'ait'], [/ite$/, 'ait'], [/yte$/, 'ait'],
  [/ound$/, 'ownd'], [/own$/, 'own'], [/ow$/, 'oh'],
  [/ation$/, 'ayshun'], [/tion$/, 'shun'],
  [/ing$/, 'ing'], [/ang$/, 'ang'], [/ung$/, 'ung'],
  [/ell$/, 'el'], [/all$/, 'awl'], [/all$/, 'awl'],
  [/ine$/, 'ain'], [/ide$/, 'aid'], [/ive$/, 'aiv'],
  [/ove$/, 'uv'], [/ove$/, 'ohv'],
  [/eak$/, 'eek'], [/eek$/, 'eek'],
  [/ain$/, 'ain'], [/ane$/, 'ain'], [/ane$/, 'ain'],
  [/eer$/, 'eer'], [/ear$/, 'eer'], [/ere$/, 'eer'],
  [/ee$/, 'ee'], [/ea$/, 'ee'], [/ey$/, 'ee'],
];

function phoneticEnding(word, len = 3) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return '';
  for (const [re, sub] of PHONETIC_MAP) {
    if (re.test(w)) return sub;
  }
  return w.slice(-Math.min(len, w.length));
}

function stressPattern(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  const vowels = (w.match(/[aeiou]+/g) || []).length;
  return vowels <= 1 ? 'S' : vowels <= 2 ? 'SS' : 'SSS';
}

// ── Node builder ───────────────────────────────────────────────────────────
let _nextId = 1;
function buildNode(text) {
  const lastWord = text.trim().split(/\s+/).pop() || '';
  return {
    id:             _nextId++,
    text,
    phonetic_ending: phoneticEnding(lastWord),
    stress_pattern:  stressPattern(lastWord),
  };
}

// ── Graph operations ───────────────────────────────────────────────────────

/**
 * @param {Array<{id,text,phonetic_ending,stress_pattern}>} nodes
 * @param {number} hookId
 * @returns {Array<{id,text,score}>} near rhymes sorted by match quality
 */
function getNearRhymes(nodes, hookId) {
  const target = nodes.find(n => n.id === hookId);
  if (!target) return [];
  return nodes
    .filter(n => n.id !== hookId)
    .map(n => {
      // Perfect ending match = 1.0, partial = proportional
      const tLen = target.phonetic_ending.length;
      const nLen = n.phonetic_ending.length;
      const minLen = Math.min(tLen, nLen);
      let match = 0;
      for (let i = 1; i <= minLen; i++) {
        if (target.phonetic_ending.slice(-i) === n.phonetic_ending.slice(-i)) match = i / Math.max(tLen, nLen);
        else break;
      }
      return { ...n, score: Math.round(match * 100) / 100 };
    })
    .filter(n => n.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * @param {Array<{id,text,phonetic_ending,stress_pattern}>} nodes
 * @param {string} pattern - stress pattern like 'SS' or 'SSS'
 * @returns {Array} matching nodes
 */
function getRhythmicMatches(nodes, pattern) {
  return nodes.filter(n => n.stress_pattern === pattern);
}

module.exports = { buildNode, getNearRhymes, getRhythmicMatches, phoneticEnding, stressPattern };
