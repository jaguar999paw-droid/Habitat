# HABITAT — State of the App
## A Brief for the Research Agent
**From:** Claude (building partner)  
**To:** Research Agent  
**Date:** May 2026  
**Repo:** `jaguar999paw-droid/Habitat`  
**Location on disk:** `/home/kamau/Habitat`

---

## 1. What We Have Built

Habitat is a **scientific songwriting engine** — a full-stack application that treats the user's identity not as a mood board, but as a formal data structure that can be extracted, analyzed, and transformed into structured song drafts. It runs as three services: a Vite/React frontend on port 3000, an Express backend on 3001, and a Python/Flask ML service on 3002.

The central thesis is this: **every ordinary life, examined through 6 temporal angles, contains the material for an extraordinary song.** The engine's job is to excavate that material methodically — not to decorate it, not to beautify it prematurely, but to locate the structural tensions that make a song worth writing.

### What is working right now (verified, tested, in production)

**Backend — 14 live endpoints:**
- `GET  /api/health` — service status
- `POST /api/analyze` — master identity analysis pipeline
- `POST /api/generate` — full song generation (Claude/OpenAI or rule-based fallback)
- `POST /api/section` — single section regeneration
- `POST /api/save` — session persistence
- `GET  /api/sessions` — session history
- `POST /api/delta` — identity change between two sessions
- `POST /api/journal/entries` — save journal entry (persisted to disk)
- `GET  /api/journal/entries` — list entries
- `POST /api/journal/synthesize` — Claude-driven synthesis of journal themes
- `POST /api/journal/contradiction` — detect contradictions across entries
- `POST /api/hookbook/strategy` — hook architecture planning
- `POST /api/hookbook/reference-analysis` — analyze reference lyrics
- `POST /api/hookbook/coherence-batch` — score lyric coherence
- `GET/POST /api/identity/config` — get/set 6-angle identity config
- `POST /api/identity/6angle-profile` — generate radar profile
- `POST /api/identity/unbiased-assessment` — AI-scored identity assessment
- All `/api/hookbook/syllables|rhymes|stress|scheme|devices|grammar|synonyms|coherence|analyze` — ML proxy

**Engine layer (12 modules, all working):**
- `identityParser.js` — PIRE system: detects conflicts, emotions, temporal stance from freetext
- `identitySchema.js` — Canonical property schema: 5 layers (WHO / FEEL / HOW / WHEN / VOICE), 25+ properties, each typed, ranged, sourced, mapped to a UI control
- `identityConfig.js` — The 6-Angle Framework: PAST (actual / alternative), PRESENT (actual / alternative), FUTURE (projected / alternative)
- `personaBuilder.js` — Constructs the persona object from parsed identity
- `messageExtractor.js` — Derives core message, sub-themes, temporal profile from raw inputs
- `structurePlanner.js` — Maps identity tensions to song section blueprints
- `temporalParser.js` — PIRE tension weights per section
- `propertyTensionEngine.js` — Cross-property contradiction detection (7 named tension types)
- `styleMapper.js` — Maps schema properties to craft config
- `lyricsStyleEngine.js` — Full craft layer: 11 rhetorical devices, 8 humor types, 7 rhyme types, 5 meter types, diction, momentum, resolution, narrator morality
- `altEgoEngine.js` — Alter ego / persona mask system (6 built-in archetypes)
- `referenceAnalyzer.js` — Reference track analysis
- `fallbackGenerator.js` + `engine/templates/` — Rule-based generation when no API key

---

## 2. Foundational Theories and Philosophies

These are the load-bearing walls. Everything built should reinforce them or consciously challenge them.

### Theory 1: The 6-Angle Identity Framework

```
PAST-WHO:    I WAS (actual)       /   I COULD HAVE BEEN (alternative)
NOW-WHO:     I AM (actual)        /   I CAN BECOME (alternative)
FUTURE-WHO:  I WILL BE (projected)/   I MIGHT BECOME (alternative)
```

The **ordinary life fallacy** — the belief that dramatic suffering is required to write a meaningful song — is the enemy of this engine. A student who never left their hometown contains all 6 positions. The song does not come from choosing one position. It comes from the **tension between positions**.

### Theory 2: PIRE — Temporal Tension Architecture

Every song section has a natural tension weight on the Past/Intermediate/Resolution/Emergence arc:
- Past sections (verse_memory, intro): weight 0.3 — establish, ground
- Intermediate (verse conflicts, pre-hook): weight 0.6 — explore, question
- Hook: weight 0.8–1.0 — lean into contradiction, do NOT resolve
- Bridge/Emergence: weight 0.6–0.7 — transform, not conclude

A section that resolves what should still be in tension is a failed section regardless of how beautiful the individual lines are.

### Theory 3: Identity as a Formal Property Schema

The user's identity is a **typed data structure** with 25+ properties across 5 layers. Each property has a `source` designation: `user` (explicit), `inferred` (NLP-derived), or `computed` (calculated). Explicit user choices always win over inferences.

The schema covers: decisiveness, attribution, change direction, absolution-seeking, primary/secondary emotions, vulnerability, rawness, rhyme type, diction level, 11 rhetorical devices, 8 humor types, meter, momentum, resolution state, narrator morality, language mix (EN/SW/Sheng), perspective, archetype, energy, alter ego.

### Theory 4: Cross-Property Tension as Song Architecture

The most interesting songs emerge from **contradictions within the identity itself**, not from dramatic external events.

Seven named tension types are detected by `propertyTensionEngine.js`:
- `CERTAIN_AND_DIVIDED` — high decisiveness + mid attribution
- `RAW_AND_POLISHED` — high rawness + elevated diction (wants to confess in formal language)
- `PROUD_AND_EXPOSED` — pride emotion + high vulnerability
- `FORWARD_STUCK` — wants growth + detected stagnation conflict
- `RIGHTEOUS_GREY` — claims moral authority + assigns blame externally
- `ABSOLUTION_DEFIANT` — seeks forgiveness through defiance (delivers apology as attack)
- `PAST_HEAVY_FUTURE` — past has enormous weight + stated forward direction

Each tension maps to a section blueprint and a craft suggestion. `RIGHTEOUS_GREY` is not a problem to fix — it is the exact generative energy that should drive the architecture.

### Theory 5: Alter Ego as Creative Amplifier, Not Substitute

The alter ego system supports up to 3 masks layered over the base identity. The philosophical constraint: **the alter ego is a lens, not a persona replacement.** It modifies the craft config. It does not change who the song is about. The Ghost, the Trickster, the Confessor are all the same person — just choosing different angles of exposure.

### Theory 6: The Hook Book as Identity Signal

Our developing theory — and where we want your deepest engagement: **the hooks a songwriter gravitates toward reveal their identity as clearly as their journal entries.** Vocabulary era (Gen Z, vintage, academic, folk), default figures of speech, instinctive sentence types — these are fingerprints. A songwriter who reaches for imperative hooks ("Stand up. Get up.") has a different temporal dominant and attribution profile than one who reaches for interrogative hooks ("Where did I go?"). The Hook Book should extract these signals and feed them back into the identity vector.

### Theory 7: The Journal as Identity Excavation, Not Therapy

The journal in Habitat is not a feelings tracker. It is a **structured identity extraction surface.** We are not asking "how do you feel?" We are asking "who are you as demonstrated by how you write when nobody is watching?" The AI reads for linguistic fingerprinting, value pillar extraction, and hook candidate surfacing — not for emotional support.

Two modes:
- **Daily Log** (high concrete detail, low metaphor) — temporal anchoring, intent/outcome tracking
- **Dream Journal** (high metaphor, high abstraction) — emotional truth, value pillar extraction

---

## 3. What We Are Currently Building

In priority order:
1. **Frontend component consolidation** — KnobSlider canonization, EmotionGrid multiSelect, PersonaLiveBar replacement of PersonaCard, IdentityRadar bug fixes
2. **Four chart components** — EmotionTimeline, TraitDistribution, LanguageMixChart, CoherenceScoreMeter (all using recharts)
3. **CockpitV5** — Collapsing the 7-step linear wizard into a single 4-zone page (Journal / Hook Strategy / Identity Config / Visual Feedback). The current sequential flow misrepresents identity formation, which is parallel and recursive.
4. **Metrics engine** — `engine/metrics.js` with proper `scoreAuthenticity`, `scoreConsistency`, `scoreDepth`, `scoreNuance` functions
5. **ML service modules** — populating `ml-service/modules/hook_book/`, `journal/`, `identity/` with real NLP pipelines (schemas already written)

---

## 4. Future Directions

### Identity Delta / Longitudinal Tracking
`/api/delta` exists but is underused. The interesting future is tracking **identity drift over time** — not just "what changed between sessions" but "what is the drift vector of this songwriter's identity?" Are they moving toward more vulnerability? Is their temporal dominant shifting from past to present? Journal persistence (added May 2026) makes this possible for the first time.

### Duality Philosophy Engine
We have cross-property tension detection but not a **duality recognition system** — an engine that says "this person is simultaneously X and not-X in a generatively productive way, and that contradiction IS the song." The current tension engine is a primitive version. The full version would recognize that the tension is not a UI warning — it is the engine's main event.

### Language-Native Generation for Sheng/Swahili
The `language_mix` property exists and is passed to the prompt, but we have no phonetic or lexical models for Swahili or Sheng. A songwriter writing in Sheng has different phonetic affordances, different slang shelf-life concerns, different codeswitching dynamics that the current English-only craft layer cannot handle.

### Real-Time Phonetic Analysis in the Editor
The schema has rhyme type, meter, and rhetorical devices — all passed to the AI. But we cannot yet tell the user in real time: "this line scans iambic but your hook is trochaic — they won't sit on the same beat." The ML endpoints for syllables and stress exist but aren't wired to a live editor experience.

---

## 5. What I Want Your Agent's Help With

### On the Hook Book — your primary interest

Please come in with everything you have. Our open questions:

**On architecture:** Should the Hook Book be a **separate surface** (a place you deliberately go to write hooks) or an **always-on extraction layer** (hooks surface automatically from journal entries and generation output)? We've built both pathways. Which produces more authentic material? Is there a third model?

**On the Hook-Identity fingerprint:** Is there published songwriting theory or NLP research that formalizes the relationship between instinctive hook structure and personality/identity? The Nashville hook taxonomy (title hooks, question hooks, statement hooks) feels too market-oriented for our purposes.

**On the Reservoir vs. the Rating:** The original analog Hook Book works partly because it's non-judgmental — you write the stupid 3am half-idea and it sits there unscored. Does adding a `cliche_score` and `originality_percentile` to every entry undermine the creative safety of the reservoir? How do you score without intimidating? Is there a UI pattern that shows scores without making them feel like grades?

**On the Rhyme Pocket:** We want to implement "find phrases that fit the rhythmic pocket of this hook." But we believe the pocket is identity-dependent — a songwriter with a trochaic-dominant catalog has a different pocket than one who writes free verse. How do you parameterize a rhyme/meter search with the identity vector? What's the right API shape?

**On small-corpus NLP:** What approaches work for detecting rhetorical default patterns from 10-30 hook entries? We can't run 50k-sample statistical methods. The user might have 8 entries.

**On the rhyme graph:** Is there a workable model representing hooks as nodes connected by phonetic proximity — a structure that would let us recommend "this hook from 3 months ago is a near-rhyme bridge to this one you wrote yesterday"?

### On CockpitV5 UX
What patterns from complex creative tools (DAWs, screenwriting software, non-linear editors) handle the balance between full-complexity display and paralysis prevention? The user's identity is genuinely multi-dimensional. A UI that simplifies it too much produces shallow songs. A UI that exposes it all at once produces panic.

### On the Metrics Engine
What is the right psycholinguistic framework for assessing lyrical identity from text? What does "authenticity" mean in a way that's computable at small scale (10-50 entries)?

### On Swahili/Sheng NLP
What open-source resources exist for Swahili phonology and Sheng vocabulary that could run on a modest Ubuntu machine without a 16GB model?

---

## 6. The Output I Need From Your Agent

After synthesizing all of the above, please produce a **single structured build prompt** in this format:

```
HABITAT WEEK BUILD BRIEF — [Date]

## This week's thesis
[One sentence on what conceptual shift this week's work represents]

## Integrate
[2-3 things that exist separately and should be wired together — specific file/API names]

## Change
[2-3 things that exist but should work differently — with a specific alternative proposed]

## Replace
[1-2 things that should be deleted and rebuilt from scratch — with reason]

## Rethink
[1-2 assumptions in the current architecture that may be wrong — with alternative hypothesis]

## Rewire
[Specific backend/frontend data flows that need rerouting — with before/after]

## Hook Book — your insights
[Everything your research and thinking has to say about the Hook Book identity capture layer.
Unfiltered. Theoretical frameworks, build suggestions, architectural proposals, open questions,
references, whatever you've got. This is the section I'm most interested in.]

## Build prompt for Claude
[A single, dense, technically specific prompt that Claude can execute immediately.
Reference actual file names, function names, endpoint names from the codebase above.
Written as if speaking directly to Claude, who has live SSH access to dizaster and knows
the full codebase. Specific enough to start working without clarifying questions.]
```

---

## Technical Constraints

- **Stack:** Node.js 20 (CommonJS only — no ESM), React/Vite, Python/Flask, CSS Modules
- **Machine:** Ubuntu 24.04, username `kamau`, hostname `dizaster`
- **Persistence:** `~/.habitat-sessions/` flat file JSON — no database in Phase 1-2
- **ML service optional** — all backend logic must degrade gracefully without it
- **No breaking changes to `/api/analyze` contract**
- **`recharts`** available in frontend for all chart work
- **`transformers` + `spaCy`** available in Python for NLP work

---

*Written by Claude from live inspection of `/home/kamau/Habitat`, May 2026.*  
*An honest accounting of what exists and a genuine invitation to think together about what should.*
