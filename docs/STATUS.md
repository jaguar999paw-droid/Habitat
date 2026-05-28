# Habitat — Project Status
> **Last updated:** 2026-04-06 via MCP audit  
> **Branch surveyed:** `main` (GitHub) + local `HEAD` (5 commits ahead)  
> **Priority:** This document is the canonical reference for what is DONE, what is LOCAL-ONLY, and what is NEXT.

---

## ⚠️ SYNC GAP — Read First

Local machine is **8 commits ahead** of `origin/main`.  
Run this to close the gap:

```bash
cd ~/sci-songwriting-engine
git push origin main
```

Everything below marked `[LOCAL]` exists on disk but is NOT yet on GitHub.

---

## What Has Been Achieved

### Layer 1 — Engine (Pure JavaScript, No AI) ✅ PUSHED

| File | Status | What it does |
|---|---|---|
| `identityParser.js` | ✅ v2 on GitHub | Async ML + rule-based fallback, 44-word Sheng lexicon, temporal profile integration |
| `personaBuilder.js` | ✅ on GitHub | Archetype map, emotion→tone, trait→voice, language label builder |
| `messageExtractor.js` | ✅ v2 on GitHub | Core message derivation + temporalProfile forwarding |
| `structurePlanner.js` | ✅ v2 on GitHub | 8 conflict templates, emotion weighting, PIRE injection, 3 new section types |
| `styleMapper.js` | ✅ v2 on GitHub | Rawness field, cockpit overrides, INTERNAL rhyme added |
| `referenceAnalyzer.js` | ✅ NEW on GitHub | Rhyme/vocab/tone extraction from pasted reference lyrics |
| `temporalParser.js` | ✅ NEW on GitHub | PIRE — past/present/future classification + CONTRADICTION/CONTRARY/SUBCONTRARY logic |

### Layer 2 — AI Layer ✅ PUSHED (v1)

| File | Status | What it does |
|---|---|---|
| `ai/promptBuilder.js` | ✅ on GitHub | Section-level structured prompts with PIRE temporal context injection |
| `ai/generator.js` | ✅ on GitHub | Claude + OpenAI abstraction, section-by-section, seed-based regen |

### Layer 3 — Backend ⚠️ v2 LOCAL ONLY

| File | Status | What it does |
|---|---|---|
| `backend/server.js` | [LOCAL] v2 | Async /api/analyze with ML + overrides, /api/save, /api/sessions, seed regen |

> v1 is on GitHub. v2 has save/sessions routes and ML integration. **Push needed.**

### Layer 4 — Frontend ⚠️ MOSTLY LOCAL

**On GitHub (v1 pages):**
- `Landing.jsx` — hero screen with API key input
- `Questionnaire.jsx` — 7-step identity form (@deprecated in v2)
- `PersonaReview.jsx` — calls /api/analyze, shows persona (@deprecated in v2)
- `Generator.jsx` — section-by-section live generation
- `SongDisplay.jsx` — copy/download song
- `PersonaCard.jsx`, `StructurePlan.jsx`, `ProgressBar.jsx` — v1 components

**LOCAL ONLY (v2 — not yet pushed):**
- `App.jsx` v2 — new 5-step flow wired to Cockpit
- `pages/Cockpit.jsx` — 3-panel WHO/WHAT/HOW instrument interface
- `pages/CockpitPreview.jsx` — cinematic persona reveal sequence
- `pages/Landing.jsx` v2 — green/magenta theme, Bebas Neue, waveform art
- `pages/Generator.jsx` v2 — waveform animation, PIRE section pills
- `pages/SongDisplay.jsx` v2 — per-section ↻ regenerate, PIRE conflict score badge
- `components/ArchetypeGrid.jsx` — 8 archetype cards, single-select
- `components/KnobSlider.jsx` — rotary dial range input (BUG FIXED: inset:0 overlay)
- `components/LanguageToggle.jsx` — EN/SW/SH independent toggles
- `components/LanguageToggle.module.css`
- `components/RhymeSwatch.jsx` — 6 coloured rhyme scheme selectors
- `components/ThemeChips.jsx` — multi-select sub-theme chips
- `components/ReferenceDropZone.jsx` — paste reference lyrics, auto-detect rhyme/vocab
- `components/PersonaLiveBar.jsx` — fixed top bar, live persona snapshot
- `components/GlitchText.jsx` — CSS glitch effect (random loop + hover trigger)
- `styles/global.css` v2 — full green/magenta/B&W token system, all animations

### Layer 5 — ML Microservice [LOCAL ONLY]

Python Flask service on port 3002:
- `ml-service/app.py` — /ml/analyze, /ml/embed, /ml/health
- `ml-service/emotion_model.py` — cosine similarity vs 8 emotion anchors
- `ml-service/conflict_model.py` — conflict archetype classification
- `ml-service/trait_model.py` — trait scoring
- `ml-service/language_model.py` — EN/SW + Sheng lexicon detection
- `ml-service/requirements.txt` — sentence-transformers, flask, scikit-learn
- `ml-service/startup.sh` — install + launch script

> All of this exists locally but is NOT in the public repo.

### Layer 6 — Docs ✅ PARTIALLY PUSHED

| File | Status |
|---|---|
| `docs/architecture.md` | ✅ on GitHub (v1) |
| `docs/ideology.md` | ✅ on GitHub |
| `docs/contribution.md` | ✅ on GitHub |
| `docs/AGENT_PROMPT_V2.md` | ✅ on GitHub (full v2 spec) |
| `docs/STATUS.md` | ✅ THIS FILE — just pushed |
| `docs/AGENT_HANDOFF_V2.md` | [LOCAL] — agent session log |

---

## What the Engine Can Do RIGHT NOW (on GitHub)

1. **Parse identity** from free-text answers — emotions, conflicts, traits, language mix
2. **Classify temporal layers** — past/present/future self detection
3. **Detect logical relations** — CONTRADICTION / CONTRARY / SUBCONTRARY / NEUTRAL
4. **Build a persona** — archetype (8 types), voice, tone, energy, language label
5. **Extract the core message** — from explicit input or inferred from conflict
6. **Plan song structure** — 8 conflict templates × emotion weighting × PIRE injection
7. **Map style** — rhyme scheme, rawness, flow, language blend, imagery, lyrical devices
8. **Analyze reference text** — detect rhyme pattern, vocabulary register, tonal temperature
9. **Build section prompts** — constrained AI prompts with temporal context per section
10. **Generate section-by-section** — Claude or OpenAI, with context passing between sections
11. **Regenerate with seed** — same section, different angle each time
12. **Format and return** — structured JSON sections + formatted song string

---

## The Way Forward — Priority Order

### 🔴 Priority 1 — Push the 48 local files NOW
```bash
cd ~/sci-songwriting-engine
git push origin main
```
This closes the 8-commit gap and makes the v2 Cockpit, all components, ML service, and backend v2 public.

### 🟠 Priority 2 — Fix the `App.jsx` import on GitHub main
GitHub's `App.jsx` still imports `Questionnaire` and `PersonaReview`.  
After the push, these are replaced by `Cockpit` and `CockpitPreview`.  
The local version already does this correctly.

### 🟡 Priority 3 — Update `docs/architecture.md` to v2
The architecture doc on GitHub still describes v1 flow. It needs:
- v2 pipeline diagram (Landing → Cockpit → CockpitPreview → Generator → SongDisplay)
- ML microservice section (port 3002, Python, sentence-transformers)
- PIRE layer explanation
- All new backend routes (/api/save, /api/sessions)
- New engine modules (temporalParser, referenceAnalyzer)

### 🟢 Priority 4 — SSE Streaming on `/api/section`
Currently `/api/section` waits for full completion before responding.  
Add Server-Sent Events to stream lyrics token-by-token to the frontend.  
This gives the "live typing" effect as each section is written.

Implementation:
```js
// backend/server.js — add streaming route
app.post('/api/section/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  // stream tokens via onProgress callback
})
```

### 🔵 Priority 5 — Song Library (localStorage)
Add a `SongLibrary` component that lists saved songs from `localStorage`.  
Each saved song stores: archetype, coreMessage, sections[], timestamp.  
Accessible from a library icon on the Landing page.

### 🟣 Priority 6 — Beat BPM Suggestion
`structurePlanner` already knows `energy` (high/medium-high/medium/low).  
Map this to a BPM range and display it in `SongDisplay`:
- high → 140–170 BPM
- medium-high → 110–139 BPM  
- medium → 80–109 BPM
- low → 60–79 BPM

### ⚪ Priority 7 — Multi-language Questionnaire UI
The engine already detects Sheng/Kiswahili.  
The Cockpit UI should also offer the questions in Kiswahili or Sheng,  
matched to the user's detected or selected language mix.

---

## File Count Summary

| Layer | On GitHub | Local Only | Total |
|---|---|---|---|
| Engine | 7 | 0 | 7 |
| AI Layer | 2 | 0 | 2 |
| Backend | 1 (v1) | 1 (v2) | 2 |
| Frontend pages | 5 (v1) | 5 (v2) | 10 |
| Frontend components | 3 (v1) | 12 (v2) | 15 |
| ML Service | 0 | 7 | 7 |
| Docs | 5 | 1 | 6 |
| Root config | 4 | 0 | 4 |
| **Total** | **27** | **26** | **53** |

---

*Generated by Claude (Anthropic) via MCP audit — 2026-04-06*
