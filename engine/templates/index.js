'use strict';
/**
 * engine/templates/index.js
 * Exports all fallback templates keyed by archetype_conflict.
 * Keys: '<archetype>_<conflict>' — both lowercased, spaces → underscores.
 */

const defiant_rise           = require('./defiant_rise');
const defiant_surrender      = require('./defiant_surrender');
const wounded_rise           = require('./wounded_rise');
const wounded_surrender      = require('./wounded_surrender');
const seeker_rise            = require('./seeker_rise');
const seeker_transformation  = require('./seeker_transformation');

const TEMPLATES = {
  defiant_rise,
  defiant_surrender,
  wounded_rise,
  wounded_surrender,
  seeker_rise,
  seeker_transformation,

  // Aliases — cover archetypes not explicitly templated by mapping to closest match
  sage_rise:              seeker_rise,
  sage_transformation:    seeker_transformation,
  witness_surrender:      wounded_surrender,
  witness_rise:           wounded_rise,
  ghost_surrender:        wounded_surrender,
  ghost_rise:             wounded_rise,
  trickster_rise:         defiant_rise,
  trickster_transformation: seeker_transformation,
  confessor_surrender:    wounded_surrender,
  street_philosopher_rise: seeker_rise,
  street_philosopher_transformation: seeker_transformation,
};

module.exports = TEMPLATES;
