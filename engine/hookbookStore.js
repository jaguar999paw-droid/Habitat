'use strict';
/**
 * engine/hookbookStore.js
 * Persistent per-user hook book storage.
 * Schema-compatible with KOKI hook structure.
 * Stored at: ~/.habitat-sessions/hookbook.json
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const HOOKBOOK_FILE = path.join(os.homedir(), '.habitat-sessions', 'hookbook.json');

function load() {
  try {
    if (fs.existsSync(HOOKBOOK_FILE)) return JSON.parse(fs.readFileSync(HOOKBOOK_FILE, 'utf8'));
  } catch (e) { console.error('HookBook load error:', e.message); }
  return { hooks: [], snapshots: [] };
}

function save(store) {
  try {
    fs.mkdirSync(path.dirname(HOOKBOOK_FILE), { recursive: true });
    fs.writeFileSync(HOOKBOOK_FILE, JSON.stringify(store, null, 2));
  } catch (e) { console.error('HookBook save error:', e.message); }
}

let _store = load();

function getStore()       { return _store; }
function reloadStore()    { _store = load(); return _store; }

/**
 * Add extracted hooks to store (deduplication by text)
 * @param {Array<{text,confidence,features}>} hooks
 * @param {string} origin - 'journal' | 'generation' | 'manual'
 */
function addHooks(hooks, origin = 'journal') {
  const existing = new Set(_store.hooks.map(h => h.text.toLowerCase().trim()));
  let added = 0;
  for (const h of hooks) {
    const key = h.text.toLowerCase().trim();
    if (existing.has(key)) continue;
    existing.add(key);
    _store.hooks.push({
      id: 'hook_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      text:            h.text,
      origin,
      locked:          false,
      sentence_type:   h.features.sentence_type,
      temporal_stance: h.features.temporal_stance,
      pronoun_type:    h.features.pronoun_type,
      confidence:      h.confidence,
      created_at:      new Date().toISOString(),
    });
    added++;
  }
  if (added > 0) save(_store);
  return added;
}

/**
 * Get profile derived from all hooks in store
 */
function getProfile() {
  const { mapHooksToIdentity } = require('./hookIdentityMapper');
  return mapHooksToIdentity(_store.hooks.map(h => ({
    text: h.text,
    confidence: h.confidence || 0.5,
    features: {
      sentence_type:    h.sentence_type,
      temporal_stance:  h.temporal_stance,
      pronoun_type:     h.pronoun_type,
      emotional_weight: 0.5,
    },
  })));
}

module.exports = { getStore, reloadStore, addHooks, getProfile, save, HOOKBOOK_FILE };
