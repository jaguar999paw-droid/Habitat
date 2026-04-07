/**
 * identityConfig.js — SCI 6-Angle Identity Framework
 *
 * PAST-WHO:    I WAS (actual) / I COULD HAVE BEEN (alternative)
 * NOW-WHO:     I AM (actual)  / I CAN BECOME (alternative)
 * FUTURE-WHO:  I WILL BECOME (projected) / I MIGHT BECOME (alternative)
 *
 * Design principle: You don't need to have lived a chaotic life to be a songwriter.
 * Every ordinary life contains all 6 positions.
 * The song comes from examining which positions are in tension.
 */

const DEFAULT_IDENTITY_CONFIG = {
  past: {
    actual:      { description: 'Who I genuinely was', enabled: true, weight: 0.7,
      anchors: ['I was shaped by things I could not control','I made choices that made me','I had a version of myself I no longer recognise'] },
    alternative: { description: 'Who I could have been — the unlived version', enabled: false, weight: 0.3,
      anchors: ['There was another version of this story','I could have been someone entirely different','The road not taken still exists in me'] },
  },
  present: {
    actual:      { description: 'Who I genuinely am right now', enabled: true, weight: 1.0,
      anchors: ['I am the accumulation of everything that happened','I contain contradictions I have not resolved','I am still in the middle of becoming'] },
    alternative: { description: 'Who I could become — aspirational or feared', enabled: true, weight: 0.5,
      anchors: ['There is a better version of me I am working toward','There is a version of me I am afraid of becoming','I contain the seeds of who I could be'] },
  },
  future: {
    projected:   { description: 'Who I will become — committed trajectory', enabled: true, weight: 0.6,
      anchors: ['I am moving toward something','This is not where my story ends','The choices I make now build who I become'] },
    alternative: { description: 'Who I might become — uncertain or feared', enabled: false, weight: 0.2,
      anchors: ['I might end up somewhere I never intended','There are versions of my future that scare me','Possibility is both a gift and a threat'] },
  },
  activeTensions: ['past_actual_to_now_actual', 'now_actual_to_now_alternative'],
  markers:  { place: null, era: null, event: null, person: null, object: null },
  alterEgos: [],
  activeAlterEgo: null,
  controls: {
    contradiction: { enabled: true, decisiveness: 50 },
    change:        { enabled: true, direction: 'forward' },
    absolution:    { seeking: false, granted: false, from_whom: 'self' },
    attribution:   { internal: 60, external: 40 },
  },
};

const IDENTITY_SECTION_MAP = {
  verse_memory:             'past.actual',
  verse_introduce_conflict: 'present.actual',
  verse_expand_struggle:    'present.actual',
  verse_external_world:     'present.alternative',
  verse_address_listener:   'present.actual',
  hook_declaration:         'present.actual',
  hook_core_question:       'present.actual',
  pre_hook:                 'present.alternative',
  bridge_realization:       'future.projected',
  bridge_surrender:         'future.projected',
  spoken_word:              'present.actual',
  call_and_response:        'past.actual',
  outro_resolution:         'future.projected',
  intro:                    'past.actual',
};

function buildIdentityFrameBlock(identityConfig, sectionBlueprintKey) {
  const config  = Object.assign({}, DEFAULT_IDENTITY_CONFIG, identityConfig);
  const mapping = IDENTITY_SECTION_MAP[sectionBlueprintKey];
  if (!mapping) return '';

  const positions = Array.isArray(mapping) ? mapping : [mapping];
  const lines = ['\n--- IDENTITY FRAME ---'];

  positions.forEach(posPath => {
    const [timeLayer, variant] = posPath.split('.');
    const pos = config[timeLayer] && config[timeLayer][variant];
    if (!pos || !pos.enabled) return;

    const TIME_LABELS = { past: 'PAST-WHO', present: 'NOW-WHO', future: 'FUTURE-WHO' };
    lines.push('\n' + (TIME_LABELS[timeLayer] || timeLayer.toUpperCase()) + ' — ' + posPath.toUpperCase().replace('.', ' / '));
    lines.push('This section speaks from: ' + pos.description);
    if (pos.anchors && pos.anchors.length > 0) lines.push('Identity anchor: "' + pos.anchors[0] + '"');
  });

  const decis = (config.controls && config.controls.contradiction) ? config.controls.contradiction.decisiveness : 50;
  if (decis < 30)      lines.push('\nCONTRADICTION: High — speaker does not know who they are. Hold uncertainty. Do NOT resolve.');
  else if (decis > 70) lines.push('\nCONTRADICTION: Low — speaker is decisive and clear. Write with conviction. No hedging.');
  else                 lines.push('\nCONTRADICTION: Balanced — speaker acknowledges contradiction but is not destroyed by it.');

  const attr = config.controls && config.controls.attribution;
  if (attr) {
    if (attr.internal > 70)      lines.push('ATTRIBUTION: Internal — speaker takes full ownership.');
    else if (attr.external > 70) lines.push('ATTRIBUTION: External — speaker attributes to outside forces.');
    else                         lines.push('ATTRIBUTION: Shared — both personal and external factors acknowledged.');
  }

  const abs = config.controls && config.controls.absolution;
  if (abs && abs.seeking) lines.push('ABSOLUTION: Seeking absolution from ' + abs.from_whom + '. This is a song of reckoning.');

  const change = config.controls && config.controls.change;
  if (change && change.enabled) {
    const dirs = { forward: 'Growth — moving forward, becoming.', backward: 'Loss — moving backward, regressing.', circular: 'Pattern — what was will be again.' };
    if (dirs[change.direction]) lines.push('CHANGE: ' + dirs[change.direction]);
  }

  if (config.activeAlterEgo) {
    lines.push('\nACTIVE ALTER EGO: ' + config.activeAlterEgo.name);
    lines.push('This section is written THROUGH: ' + config.activeAlterEgo.description);
  }

  lines.push('--- END IDENTITY FRAME ---');
  return lines.join('\n') + '\n';
}

function getIdentityCompleteness(userInputs) {
  const text = Object.values(userInputs || {}).join(' ').toLowerCase();
  let score = 0;
  if (/i was|used to|before i|when i was|growing up/.test(text))             score++;
  if (/could have been|might have been|what if i/.test(text))                 score++;
  if (/i am|i'm|right now|today|i know|i stand/.test(text))                   score++;
  if (/i can become|i could be|working toward|afraid of becoming/.test(text)) score++;
  if (/i will|i'll|one day|going to become/.test(text))                       score++;
  if (/i might|i fear|maybe i'll|uncertain about/.test(text))                 score++;
  return { score, maxScore: 6, percentage: Math.round((score / 6) * 100) };
}

module.exports = { DEFAULT_IDENTITY_CONFIG, IDENTITY_SECTION_MAP, buildIdentityFrameBlock, getIdentityCompleteness };
