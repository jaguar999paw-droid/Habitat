'use strict';
/**
 * engine/identityDrift.js
 * Computes identity drift between two identity snapshots.
 * Used by /api/save (store snapshot) and /api/identity/drift (compare).
 */

/**
 * @param {object} snapshotA - { timestamp, identity_vector }
 * @param {object} snapshotB - { timestamp, identity_vector }
 * @returns {object} drift report
 */
function computeDrift(snapshotA, snapshotB) {
  if (!snapshotA || !snapshotB) return { hasDrift: false, deltas: {}, summary: 'Insufficient data' };

  const va = snapshotA.identity_vector || {};
  const vb = snapshotB.identity_vector || {};
  const deltas = {};
  const allKeys = new Set([...Object.keys(va), ...Object.keys(vb)]);

  for (const key of allKeys) {
    const a = va[key];
    const b = vb[key];
    if (a === undefined || b === undefined) continue;

    if (typeof a === 'number' && typeof b === 'number') {
      const diff = Math.round((b - a) * 100) / 100;
      if (Math.abs(diff) >= 0.05) {
        deltas[key] = { from: a, to: b, diff, direction: diff > 0 ? 'up' : 'down' };
      }
    } else if (typeof a === 'string' && typeof b === 'string' && a !== b) {
      deltas[key] = { from: a, to: b };
    }
  }

  const hasDrift = Object.keys(deltas).length > 0;
  const elapsed_ms = (snapshotB.timestamp || 0) - (snapshotA.timestamp || 0);
  const elapsed_days = Math.round(elapsed_ms / (1000 * 60 * 60 * 24) * 10) / 10;

  const summary = hasDrift
    ? Object.entries(deltas).slice(0, 3).map(([k, v]) =>
        typeof v.diff === 'number'
          ? `${k}: ${v.diff > 0 ? '+' : ''}${v.diff}`
          : `${k}: ${v.from} → ${v.to}`
      ).join(' · ')
    : 'No significant drift detected';

  return { hasDrift, deltas, summary, elapsed_days, snapshotA_ts: snapshotA.timestamp, snapshotB_ts: snapshotB.timestamp };
}

/**
 * @param {Array<object>} snapshots - array of { timestamp, identity_vector }
 * @param {string} property - property key to trend
 * @returns {object} trend report
 */
function getTrend(snapshots, property) {
  if (!snapshots || snapshots.length < 2) return { trend: 'insufficient_data', values: [] };

  const values = snapshots
    .filter(s => s.identity_vector && s.identity_vector[property] !== undefined)
    .map(s => ({ ts: s.timestamp, value: s.identity_vector[property] }))
    .sort((a, b) => a.ts - b.ts);

  if (values.length < 2) return { trend: 'insufficient_data', values };

  const first = values[0].value;
  const last  = values[values.length - 1].value;

  let trend = 'stable';
  if (typeof first === 'number' && typeof last === 'number') {
    const net = last - first;
    if (net >  0.1) trend = 'increasing';
    if (net < -0.1) trend = 'decreasing';
  } else if (first !== last) {
    trend = 'changed';
  }

  return { property, trend, values, net_change: typeof first === 'number' ? Math.round((last - first) * 100) / 100 : null };
}

/**
 * Build an identity_vector from a parsed identity result.
 * Shape is flat numeric/string map — easy to diff.
 */
function buildIdentityVector(parsed, persona) {
  return {
    primary_emotion:  parsed?.emotions?.[0]?.emotion || null,
    emotion_intensity: parsed?.emotions?.[0]?.intensity || 0,
    dominant_conflict: parsed?.conflicts?.[0]?.type || null,
    archetype:         persona?.archetype || null,
    language_sheng:    parsed?.languageMix?.sheng ? 1 : 0,
    language_kiswahili: parsed?.languageMix?.kiswahili ? 1 : 0,
    temporal_dominant: parsed?.temporalProfile?.temporal?.dominant || null,
    conflict_score:    parsed?.temporalProfile?.conflictScore || 0,
    trait_count:       (parsed?.traits || []).length,
  };
}

module.exports = { computeDrift, getTrend, buildIdentityVector };
