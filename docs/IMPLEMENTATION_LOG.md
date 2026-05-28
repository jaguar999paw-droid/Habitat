# HABITAT — Complete Audit, Implementation Plan & Progress Log
> **Generated:** 2026-05-06 by Claude (live MCP audit of `/home/kamau/Habitat`)
> **Status:** Active development session — this document is the live source of truth

---

## 1. What is Actually Implemented vs. Documented-Only

### ✅ Fully Implemented & Working

| Layer | Component | Status |
|---|---|---|
| Backend | 14 core API routes + 9 hookbook ML proxies + /api/hookbook/suggest | ✅ Running on :3001 |
| Engine | 12 JS modules (identityParser, personaBuilder, structurePlanner, etc.) | ✅ All functional |
| Engine | metrics.js — scoreAuthenticity/Consistency/Depth/Nuance | ✅ Functions exist |
| ML Service | Flask on :3002 — /ml/analyze, /ml/embed, /ml/health | ✅ (was offline, restarted) |
| ML Service | hookbook_service.py — syllables, rhymes, stress, devices, grammar | ✅ Working |
| ML Service | suggest_engine.py — real-time NLP warns/alerts/spectrum/textMagic | ✅ NEW (this session) |
| ML Service | language_model.py — EN/SW/Sheng detection | ✅ Working |
| Frontend | Landing, JournalPage, CockpitV5, CockpitPreview, Generator, SongDisplay | ✅ Pages exist |
| Frontend | 20 components (KnobSlider, HookField, PersonaLiveBar, EmotionGrid, etc.) | ✅ Components exist |
| Frontend | SuggestiveEditor — NLP writing assistant with focus/zen mode | ✅ NEW (this session) |
| Journal routes | POST /api/journal/entries|synthesize|contradiction | ✅ Working |
| HookBook routes | strategy, reference-analysis, coherence-batch, hooks CRUD | ✅ Working |
| Identity routes | config, 6angle-profile, unbiased-assessment | ✅ Working |
| Persistence | ~/.habitat-sessions/ flat JSON (journal, hookbook, identity, sessions) | ✅ Working |

---

### ❌ Documented but NOT Implemented (Priority List)

#### P1 — Critical (app cannot function properly without these)

| # | Feature | Location | Gap |
|---|---|---|---|
| 1 | **CockpitV5 handleProceed bug** | `CockpitV5.jsx` | `handleProceed` was missing — FIXED this session |
| 2 | **Journal synthesize accepts raw text** | `journalRoutes.js` | Always needed entryIds — FIXED this session |
| 3 | **Profile response unwrap** | `CockpitV5.jsx` | Returns `{success, profile}` but code read flat — FIXED |
| 4 | **hookbook_service.py f-string syntax** | `hookbook_service.py:71` | Python 3.10 f-string bug — FIXED this session |

#### P2 — High Value (core product features)

| # | Feature | Documented In | What's Missing |
|---|---|---|---|
| 5 | **SSE streaming for section generation** | STATUS.md Priority 4 | `/api/section/stream` — server-sent events for live lyric typing effect |
| 6 | **Song Library (localStorage)** | STATUS.md Priority 5 | `SongLibrary` component — list/save/load sessions from localStorage |
| 7 | **Duality Engine wiring** | HABITAT_AGENT_BRIEF.md §Future, DUALITY_PHILOSOPHY.md | CONTRADICTION/CONTRARY/SUBCONTRARY logic exists in temporalParser but NOT fed into section prompts as a generative force |
| 8 | **HookBook→Identity fingerprint** | HABITAT_AGENT_BRIEF.md §Theory 6 | Hook corpus analysis → identity vector feedback loop. hookbookStore exists, identity endpoint exists, but they're not connected |
| 9 | **BPM suggestion** | STATUS.md Priority 6 | Map energy → BPM range in SongDisplay |

#### P3 — ML Modules (empty stubs)

| # | File | Current State | Should Contain |
|---|---|---|---|
| 10 | `ml-service/modules/hook_book/__init__.py` | **EMPTY** | Hook identity fingerprinting NLP (instinctive sentence type classifier, hook corpus → temporal stance + attribution profile) |
| 11 | `ml-service/modules/journal/__init__.py` | **EMPTY** | Daily log vs dream journal classifier, value pillar extractor |
| 12 | `ml-service/modules/identity/__init__.py` | **EMPTY** | Drift vector computation, longitudinal identity tracking |

#### P4 — UI System Issues (this session's primary focus)

| # | Problem | Files Affected | Fix |
|---|---|---|---|
| 13 | **CSS token inconsistency** — modules use hardcoded `#22dd77`, `Courier New`, `#0a0e27` instead of global CSS vars | CockpitV5.module.css, HookBookPanel.module.css, SuggestiveEditor.module.css | Rewrite all CSS to use `var(--green)`, `var(--font-mono)`, `var(--bg)`, `var(--surface*)` |
| 14 | **CockpitV5 visual design** — generic grid layout, inconsistent zone hierarchy, no depth/atmosphere | CockpitV5.module.css, CockpitV5.jsx | Full redesign: instrument panel aesthetic, proper depth, typography hierarchy |
| 15 | **SuggestiveEditor styling** — hardcoded colors, doesn't feel native to the app | SuggestiveEditor.module.css | Rebuild with proper token usage |
| 16 | **HookBookPanel panel** — doesn't use global tokens, looks detached from app theme | HookBookPanel.module.css | Rebuild |
| 17 | **JournalPage textarea replaced** but writeArea CSS class becomes orphaned | JournalPage.module.css | Audit and clean up orphaned styles |

#### P5 — Polish & Architecture

| # | Feature | Notes |
|---|---|---|
| 18 | Multi-language UI (Kiswahili/Sheng prompts) | STATUS.md Priority 7 — Cockpit questions in Swahili/Sheng based on language mix |
| 19 | Identity Delta visualization | /api/delta exists, never surfaced in UI |
| 20 | Push to GitHub (sync gap) | STATUS.md Priority 1 — 8+ commits local-only |

---

## 2. UI Design Reasoning

### The Core Problem
The app has a well-designed token system in `styles/global.css`:
- Color vars: `--green`, `--magenta`, `--bg`, `--surface`, `--surface2/3/4`, `--border`, `--text-muted`
- Font vars: `--font-sans` (Space Grotesk), `--font-mono` (Space Mono), `--font-display` (Bebas Neue)
- Shadow vars, glow vars, radius vars

But individual CSS modules bypass this system and use hardcoded values. This creates:
- Color drift: `#22dd77` vs `var(--green)` (#00ff88) — not the same green
- Font drift: `Courier New` vs `Space Mono`
- Background drift: `#0a0e27` vs `var(--bg)` (#040407)

### The Design Direction: "Cockpit Instrument Panel"
This is already the declared aesthetic (docs reference it). The execution should feel like:
- **Primary metaphor**: a music production instrument / modular synth panel
- **Not**: a generic SaaS dashboard or a terminal emulator
- **Zone identity**: each zone feels like a specific instrument — journal = recording input, hook field = track arranger, identity = mixer, feedback = oscilloscope
- **Depth**: subtle grid lines, glows around active elements, instrument panel bezels
- **Typography**: Bebas Neue for labels/headers (uppercase, tight tracking), Space Mono for values/counts, Space Grotesk for body text

---

## 3. Implementation Progress (This Session)

### Done ✅
- [x] Fixed CockpitV5 `handleProceed` missing function (ReferenceError crashed page 3+)
- [x] Fixed API profile response unwrap in CockpitV5 (`{success, profile}`)
- [x] Fixed `journalRoutes.js` synthesize to accept raw `{text, emotions}` directly
- [x] Fixed `hookbook_service.py` Python 3.10 f-string syntax error (line 71)
- [x] Built `suggest_engine.py` — real-time NLP: warns, alerts, spectrum, textMagic, nextLines
- [x] Added `/hookbook/suggest` route to `ml-service/app.py`
- [x] Added `/api/hookbook/suggest` proxy to `backend/server.js`
- [x] Built `SuggestiveEditor.jsx` + `SuggestiveEditor.module.css`
- [x] Wired SuggestiveEditor into JournalPage (replaces raw textarea)
- [x] Wired SuggestiveEditor into CockpitV5 Zone 1
- [x] Added WRITE tab to HookBookPanel with SuggestiveEditor
- [x] ML service + backend restarted

### In Progress 🔄
- [ ] CSS token system rebuild (CockpitV5, SuggestiveEditor, HookBookPanel)
- [ ] SSE streaming for section generation
- [ ] Song Library component
- [ ] Duality engine wiring

### Queued 📋
- [ ] BPM suggestion in SongDisplay
- [ ] ML modules (hook_book, journal, identity)
- [ ] HookBook → Identity fingerprint loop
- [ ] Identity Delta UI
- [ ] GitHub push

---

## 4. Architecture Decisions

### Decision: SuggestiveEditor as universal writing primitive
All writing surfaces in the app (Journal, HookBook Write, CockpitV5 Zone 1) now use `SuggestiveEditor`. This is the right call because:
1. Consistent NLP feedback everywhere
2. One place to improve the writing experience
3. Focus mode is available on every writing surface

### Decision: ML service is optional, not required
All hookbook endpoints have rule-based fallbacks in the backend itself (`hookbookRoutes.js`). When the ML service is offline, the proxy fails with 503 but the app still runs. The NLP suggest endpoint degrades silently in `SuggestiveEditor` (no feedback shown, no error displayed).

### Decision: journalRoutes.synthesize now accepts raw text
Previous architecture required: save entry → then synthesize with entryIds. CockpitV5 Zone 1 calls synthesize directly with raw text + emotions. The new patch auto-saves before synthesizing. This is the right call for the inline cockpit flow where the user hasn't explicitly "saved" yet.

---

## 5. I/O Contracts (Reference)

### SuggestiveEditor Props
```
value: string           — controlled textarea value
onChange: fn(str)       — text change callback
placeholder: string     — textarea placeholder
label: string           — zone header label
apiBase: string         — backend URL (default: http://localhost:3001/api)
rows: number            — textarea rows (default 10)
showSpectrum: boolean   — show 5-axis emotion bars
showMirror: boolean     — show rhyme/alliteration decorated text mirror
showNextLines: boolean  — show contextual next-line suggestions
focusable: boolean      — enable focus/zen mode button
```

### /api/hookbook/suggest POST
```
Request:  { lines: string[], text?: string }
Response: {
  warns:     [{type, severity, message}]
  alerts:    [{type, message, ...}]
  spectrum:  {energy, darkness, vulnerability, defiance, hope}  // 0–100
  textMagic: [{lineIndex, start, end, type, style, group?}]
  nextLines: string[]
  syllables: [{line, total}]
  scheme:    string  // e.g. "ABAB"
}
```

---

## 6. Open Questions

1. **Should the HookBook Write tab persist across sessions?** Currently the WriteTab in HookBookPanel uses local component state — cleared on drawer close. Should it auto-save to the hookbook store?

2. **When should duality tension surface in the UI?** The `propertyTensionEngine.js` detects RIGHTEOUS_GREY, ABSOLUTION_DEFIANT, etc. — but these are only used in the generation prompt. Should there be a visual indicator in CockpitV5 Zone 4 when a high-tension type is detected?

3. **Focus mode with feedback**: In focus mode, SuggestiveEditor shows the feedback panel on the right. On mobile, this stacks below. Is the mobile layout acceptable or should focus mode be editor-only on mobile?

4. **ML service persistence**: The ML service warm-up (sentence-transformers model load) takes ~10s. Should there be a splash/loading state in the app while ML initializes?
