# Habitat — Agent Handoff Document v3
**Branch:** `main`
**Last agent session:** 2026-04-07
**Engine version:** v3 (Craft Layer + 6-Angle Identity + Alter Ego)

---

## Repo + Machine State

```
Host:   localhost  |  User: kamau  |  Tool: ssh-shell-mcp
Repo:   https://github.com/jaguar999paw-droid/sci-songwriting-engine
Local:  ~/sci-songwriting-engine  (main branch, in sync with origin/main)
```

```bash
cd ~/sci-songwriting-engine
git status          # should be clean
git log --oneline -6  # confirm top commits match below
```

---

## What Was Done This Session (2026-04-07)

### ✅ Discrepancy audit — local vs GitHub

**Identified:** Local had a `feat(v3-engine)` commit with 3 new engine modules and an upgraded `promptBuilder` that weren't on GitHub. Also: `styleMapper` and `server.js` on GitHub were missing the `craftConfig`/`identityConfig` passthrough that `promptBuilder v3` depends on.

**Fixed and pushed — all 6 files now on GitHub main:**

| File | Version | What changed |
|---|---|---|
| `engine/lyricsStyleEngine.js` | NEW | Full craft layer: 11 rhetorical devices, 9 humor types, 8 rhyme types, 6 meter modes, momentum, resolution, morality, stance, restraint |
| `engine/identityConfig.js` | NEW | 6-angle identity framework (Past/Present/Future × Actual/Alternative), section→identity mapping, `buildIdentityFrameBlock()` |
| `engine/altEgoEngine.js` | NEW | 6 built-in alter ego archetypes (Confessor, Witness, Trickster, Preacher, Ghost, Street Philosopher), `applyAlterEgo()`, `buildAlterEgoBlock()` |
| `ai/promptBuilder.js` | v3 | Imports and integrates all 3 new engine modules into `buildSectionPrompt()` |
| `engine/styleMapper.js` | v3 | `mapStyle()` now returns `craftConfig` + `identityConfig` from overrides |
| `backend/server.js` | v3 | `/api/analyze` now passes `overrides.craft` and `overrides.identityConfig` through pipeline |

**The data flow is now complete:**
```
Cockpit overrides.craft → /api/analyze → mapStyle() → style.craftConfig
                                                           ↓
                                               promptBuilder.buildCraftBlock()
                                                           ↓
                                                  AI section prompt

Cockpit overrides.identityConfig → /api/analyze → message.identityConfig
                                                           ↓
                                       promptBuilder.buildIdentityFrameBlock()
                                                           ↓
                                                  AI section prompt
```

---

## Current Engine Architecture (v3 — fully on GitHub)

```
engine/
  identityParser.js      ← v2: async ML + rule-based, temporal profile
  temporalParser.js      ← PIRE: past/present/future + logical relations
  personaBuilder.js      ← archetype, tone, energy, voice, language label
  messageExtractor.js    ← core message, sub-themes, temporalProfile forwarding
  structurePlanner.js    ← 8 conflict templates, PIRE injection, emotion weighting
  styleMapper.js         ← v3: rhyme/flow/imagery + craftConfig + identityConfig passthrough ✅ UPDATED
  referenceAnalyzer.js   ← rhyme/vocab/tone extraction from pasted reference lyrics
  lyricsStyleEngine.js   ← v3 NEW: full craft layer ✅ PUSHED THIS SESSION
  identityConfig.js      ← v3 NEW: 6-angle identity framework ✅ PUSHED THIS SESSION
  altEgoEngine.js        ← v3 NEW: alter ego system ✅ PUSHED THIS SESSION

ai/
  promptBuilder.js       ← v3: integrates craft + identity + alter ego + temporal ✅ UPDATED
  generator.js           ← Claude + OpenAI, section-by-section, seed regen

backend/
  server.js              ← v3: passes craft + identityConfig overrides through ✅ UPDATED

frontend/src/
  App.jsx                ← v2: 5-step flow (Landing → Cockpit → CockpitPreview → Generator → SongDisplay)
  pages/
    Landing.jsx          ← v2: green/magenta theme, waveform art, particle field
    Cockpit.jsx          ← v2: 3-panel WHO/WHAT/HOW instrument interface ✅ ON GITHUB
    CockpitPreview.jsx   ← v2: cinematic persona reveal ✅ ON GITHUB
    Generator.jsx        ← v2: live waveform animation, section pills
    SongDisplay.jsx      ← v2: per-section ↺ regen, PIRE conflict score badge
  components/
    ArchetypeGrid, KnobSlider (fixed), LanguageToggle, RhymeSwatch,
    ThemeChips, ReferenceDropZone, PersonaLiveBar, GlitchText  ← all ✅ on GitHub
```

---

## Still to Push Next Session

The following files exist in the local session or are pending v3 upgrades — they were mentioned as the next batch but were NOT pushed in this session because they need to be built first:

### Frontend — 6 new v3 CRAFT components (not yet created)
```
frontend/src/components/
  HumorSelector.jsx + .module.css
  RhetoricalDeviceSelector.jsx + .module.css
  IdentityTimelinePanel.jsx + .module.css
  AlterEgoPanel.jsx + .module.css
  SectionMomentumMap.jsx + .module.css
  ResolutionPicker.jsx + .module.css
```

### Updated Cockpit.jsx — CRAFT drawer
The existing `Cockpit.jsx` (v2) does not yet include a 4th panel or drawer for craft parameters.
It needs a collapsible **CRAFT** drawer that exposes:
- `HumorSelector` — humor type + intensity slider
- `RhetoricalDeviceSelector` — multi-select, up to 3 devices
- `IdentityTimelinePanel` — 6-angle slider (past/present/future activation weights)
- `AlterEgoPanel` — select from 6 built-in alter egos or create custom
- `SectionMomentumMap` — visual section flow plan with momentum assignment per section
- `ResolutionPicker` — resolved / unresolved / ambiguous / deferred per song

The CRAFT drawer fires `overrides.craft` and `overrides.identityConfig` into the existing Cockpit `onDone()` payload — the backend and engine are already wired to receive them.

### v2.1 page redesigns
- `frontend/src/pages/Landing.jsx` — v2.1 (minor refinements, not urgent)
- `frontend/src/pages/Generator.jsx` — v2.1 (section pill momentum indicators)
- `frontend/src/pages/SongDisplay.jsx` — v2.1 (craft display in section cards)

---

## How to Build the CRAFT Components (Spec)

### HumorSelector.jsx
```jsx
// Props: value = { type: 'none'|'wit'|'sarcasm'|..., intensity: 0-100 }
// onChange: (value) => void
// Shows: 9 option pills + intensity KnobSlider (only visible when type !== 'none')
```

### RhetoricalDeviceSelector.jsx
```jsx
// Props: value = string[] (max 3), onChange: (value) => void
// Shows: 11 device cards with name + short description
// Max 3 selectable. Each card shows name, one-line description, and an example fragment.
```

### IdentityTimelinePanel.jsx
```jsx
// Props: value = identityConfig object, onChange: (identityConfig) => void
// Shows: 3 rows (PAST / NOW / FUTURE), each with Actual + Alternative toggles + weight sliders
// Bottom: controls for contradiction.decisiveness, attribution.internal/external, change.direction
```

### AlterEgoPanel.jsx
```jsx
// Props: value = { activeAlterEgo: object|null, alterEgos: [] }, onChange
// Shows: 6 built-in archetype cards (from BUILT_IN_ALTER_EGO_ARCHETYPES)
// Each card: emoji + name + tagline + "Use this lens" toggle
// + "Create custom" form: name, tagline, description, voice
// Selecting an alter ego sets identityConfig.activeAlterEgo
```

### SectionMomentumMap.jsx
```jsx
// Props: sections = structurePlan.sections[], value = { [sectionIndex]: momentum }
// Shows: horizontal timeline of section pills
// Each pill is clickable → cycle through: build / sustain / release / peak / valley
// Color-coded: build=green, sustain=gray, release=blue, peak=magenta, valley=dim
```

### ResolutionPicker.jsx
```jsx
// Props: value = 'resolved'|'unresolved'|'ambiguous'|'deferred', onChange
// Shows: 4 large cards with name + description
// Single select. Default: unresolved (most artistically productive)
```

---

## Cockpit CRAFT Drawer — Integration Pattern

In `Cockpit.jsx`, add a drawer trigger button at the bottom of the right panel:

```jsx
const [craftOpen, setCraftOpen] = useState(false)
// In right panel:
<button onClick={() => setCraftOpen(o => !o)}>CRAFT {craftOpen ? '▲' : '▼'}</button>
{craftOpen && (
  <CraftDrawer
    craft={s.craft}
    identityConfig={s.identityConfig}
    onChange={(patch) => upd(patch)}
  />
)}
```

`CraftDrawer` is a new component (`frontend/src/components/CraftDrawer.jsx`) that renders all 6 craft sub-components in a scrollable panel.

The existing `handleIgnite()` in Cockpit already collects `overrides` — just add:
```js
overrides: {
  ...existingOverrides,
  craft:          s.craft          || {},
  identityConfig: s.identityConfig || null,
}
```

---

## API Contract Reference (v3)

### POST /api/analyze — full v3 body shape
```json
{
  "answers": {
    "whoAreYouNot":   "string",
    "mainIdea":       "string",
    "emotionalTruth": "string",
    "socialConflict": "string",
    "referenceText":  "string (optional)"
  },
  "overrides": {
    "rawness":       60,
    "energyValue":   75,
    "rhymeScheme":   "ABAB",
    "perspective":   "1st",
    "languageMix":   ["en", "sw"],
    "archetype":     "The Defiant",
    "craft": {
      "rhetoricalDevices": ["anaphora", "parallelism"],
      "humorType":         "dark_humor",
      "humorIntensity":    45,
      "rhymeType":         "slant",
      "meter":             "free",
      "dictionLevel":      "mixed",
      "grammarIntentionality": "intentional_breaks",
      "momentum":          "build",
      "resolution":        "unresolved",
      "narratorMorality":  "morally_grey",
      "stance":            "subjective",
      "themeSensitivity":  "medium",
      "restraint": {
        "noCliches":    true,
        "avoidPadding": true,
        "maxDevices":   2
      }
    },
    "identityConfig": {
      "past":    { "actual": { "enabled": true, "weight": 0.8 }, "alternative": { "enabled": false } },
      "present": { "actual": { "enabled": true, "weight": 1.0 } },
      "future":  { "projected": { "enabled": true, "weight": 0.5 } },
      "controls": { "contradiction": { "decisiveness": 35 }, "attribution": { "internal": 70 } },
      "activeAlterEgo": null
    }
  }
}
```

---

## Quick Commands

```bash
# Start the full stack
cd ~/sci-songwriting-engine && npm run dev

# Test v3 craft pipeline
curl -s -X POST http://localhost:3001/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{
    "answers": {"mainIdea":"I refuse to be what they made me","emotionalTruth":"anger"},
    "overrides": {
      "craft": {"rhetoricalDevices":["anaphora"],"humorType":"dark_humor","humorIntensity":40},
      "identityConfig": {"controls":{"contradiction":{"decisiveness":20}}}
    }
  }' | python3 -m json.tool | head -40

# Verify engine files
node --check engine/lyricsStyleEngine.js && echo OK
node --check engine/identityConfig.js && echo OK
node --check engine/altEgoEngine.js && echo OK
```

---

## Git Hygiene Reminder

The recurring diverged-history problem happens when MCP pushes files directly to GitHub via the API (bypassing local git). After every MCP push session, run:

```bash
git fetch origin
git rebase origin/main   # replay local commits on top of remote
# If conflicts: git checkout --ours <file> → git add <file> → git rebase --continue
# If commit is redundant (already on GitHub): git rebase --skip
git push origin main
```

**Never** `git push --force`. Always rebase, never force.

---

*Handoff written by Claude (Anthropic) via MCP audit — 2026-04-07*
*Next agent: build 6 CRAFT components + Cockpit CRAFT drawer. Say "continue" for the next batch.*
