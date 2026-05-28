# SCI Songwriting Engine — Habitat Upgrade Progress

## Branch: `v2-cockpit-ml`  ·  Current version: Cockpit v4

---

## What is the Habitat Upgrade?

Refactoring from a flat questionnaire into a **staged, phase-aware identity
construction interface** — mirroring Habitat-Lab's pattern: surface inferences,
allow human correction, maintain a live schema-validated property bag.

---

## 4-Phase Flow

```
Phase 1: SPEAK  → free text + word counts + health check → POST /api/analyze
Phase 2: FEEL   → InferencePreview + re-analyze button + EmotionGrid
Phase 3: KNOW   → IdentitySliders (mixing board) + IdentityRadar (live hex)
Phase 4: CRAFT  → Archetype + AlterEgo + Energy + Language + Rhyme → IGNITE
```

### onDone() payload
```js
{
  mainIdea, emotionalTruth, socialConflict, referenceText,
  overrides: {
    rawness, energyValue, rhymeScheme, perspective, languageMix,
    archetype, subThemes, primaryEmotion, secondaryEmotions,
    identitySliders: { rawness, decisiveness, attribution, vulnerability_level },
    alterEgo,
    identityConfig: { activeAlterEgo }
  },
  analyzed: <raw /api/analyze response>
}
```

---

## Completed — All Sessions

| Session | Work |
|---|---|
| N-2 | Engine layer: identitySchema, propertyTensionEngine, altEgoEngine, identityConfig |
| N-1 | Frontend components: EmotionGrid, IdentitySliders, InferencePreview |
| N   | IdentityRadar (hex SVG), Cockpit v3 (4-phase tab flow) |
| N+1 | Override modal (InferencePreview), radar dot tooltips, Phase 2→parser injection, PERSIST_KEY migration, mobile CSS |
| N+2 | **Full green/lime cockpit overhaul (Cockpit v4)** — see below |

---

## Session N+2 — Complete

### UI: Green/Lime Instrument Cockpit
Full CSS rewrite with a dark `#0a120a` background, `#a8ff3a` lime primary accent,
`#39d353` green secondary, magenta for emotion, amber for tension.

Key design tokens:
- `--lime` `#a8ff3a` — primary CTA, panel labels, radar
- `--lime-dim` `#6bba1c` — subdued accent, borders on hover
- `--lime-glow` — subtle fill for active states
- `--green` `#39d353` — secondary signals, meters
- `--magenta` `#dd44ff` — emotion accents
- Phase tabs: bottom-border `--lime` + glowing dot indicator on active
- IGNITE button: shimmer sweep animation on hover + `ignitePulse` when firing

### New features delivered

| Feature | Detail |
|---|---|
| **Word count indicators** | Live `Nw` badge under each Phase 1 textarea; total word count in Phase tab |
| **Health indicator** | `GET /api/health` on mount — green dot (engine+ML ok), amber (engine only), red (engine down) |
| **Re-analyze button** | Phase 2 — replays `POST /api/analyze` with accumulated `inferenceOverrides`; badge shows count of active overrides |
| **Alter-ego picker** | Phase 4 CRAFT — 7 options (None, Confessor, Witness, Trickster, Preacher, Ghost, Street Philosopher); wired into `onDone()` as `alterEgo` + `identityConfig.activeAlterEgo` |
| **Endpoint tester** | Fixed bottom-right panel — tests all 5 endpoints (`/health`, `/analyze`, `/generate`\*, `/sessions`, `/delta`) with live status chips (✓ 200 42ms / ✗ ERR) |
| **PERSIST_KEY migration** | Clears both `sci_cockpit_v2` and `sci_cockpit_v3` on mount |
| **Phase done indicators** | Completed phase tabs show `✓` in the number badge |
| **Analyze status row** | After successful analysis: shows emotion/conflict count + ML vs rule-based |

\* `/generate` skipped in tester (requires live API key)

### Override data flow (complete)
```
User clicks chip in InferencePreview
  → OverrideModal (select valid value)
  → onConfirm(property, newValue)
  → Cockpit.handleOverride → setInferenceOverrides
  → mirrors to local state (primaryEmotion / analyzed.temporalProfile)
  → Re-analyze button → POST /api/analyze with inferenceOverrides
  → server.js → parseIdentity(answers, inferenceOverrides)
  → parser: overridden property promoted, confidence = 1.0
  → InferencePreview re-renders with updated detections
```

---

## Still To Do (future enhancements)

- [ ] Override modal — keyboard nav (Tab/Enter/Esc)
- [ ] Radar dot tooltip — touch/tap support on mobile
- [ ] `/api/section` regeneration UI in song display page
- [ ] Session history browser (use `GET /api/sessions` + `POST /api/delta`)
- [ ] Phase 1 — drag-to-reorder sub-themes
- [ ] `POST /api/save` — auto-save after IGNITE

---

## Engine Layer Reference

| File | Version | Purpose |
|---|---|---|
| `engine/identityParser.js` | v2.1 | Async parse + `userOverrides` arg |
| `engine/identitySchema.js` | v1   | Property schema, validation, defaults |
| `engine/propertyTensionEngine.js` | v1 | Cross-property tension detection |
| `engine/altEgoEngine.js` | v1 | 6 built-in persona masks |
| `engine/identityConfig.js` | v1 | 6-angle identity framework |
| `engine/lyricsStyleEngine.js` | v3 | Craft layer: rhetorical devices, prosody, humor |
| `engine/styleMapper.js` | v3 | Maps persona → style config |
| `backend/server.js` | v3.1 | 6 routes, inferenceOverrides wired |

