
<p align="center">
  <img src="https://raw.githubusercontent.com/jaguar999paw-droid/sci-songwriting-engine/main/assets/habitat-ui.png" alt="Habitat UI" width="100%" />
</p>

<h1 align="center">Habitat</h1>
<p align="center"><em>Identity-mapped AI songwriting. Not generation — excavation.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/Python-3.10-blue?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Claude%20%7C%20GPT--4o-supported-ff00aa?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-00ff88?style=flat-square" />
</p>

---

> *"A song is not written. It is excavated — from the sediment of who you are, what you carry, and what you refuse to become."*

**Habitat** is a full-stack AI songwriting engine that doesn't ask you what you want to write. It asks who you are, listens to the contradiction between your truth and your shadow, and reasons its way into a song that could only ever belong to you.

This is not a lyric generator. It is a **structured identity reasoning pipeline** — 15 pure-JavaScript engine modules, a Python ML microservice, and a cinematic React cockpit, working in concert to turn personal identity into music that earns its existence.

---

## Why Habitat Is Different

Most AI songwriting tools accept a prompt and return generic verses. Habitat does the opposite: it **interrogates your identity first**, builds a structured persona from the answers, derives a core message with emotional sub-themes, plans a conflict-aware song structure, and only then generates — section by section, with every prompt anchored to who you said you are.

The output isn't a song that sounds like you. It is a song that **is** you.

---

## The Pipeline

```
You (raw, unfiltered) ──► Identity Interrogation
                                    │
                    ┌───────────────▼───────────────┐
                    │   15 Engine Modules (pure JS)  │
                    │   • Identity Parser (ML+rules) │
                    │   • Duality Engine (shadow/not) │
                    │   • Temporal Parser (PIRE)     │
                    │   • Persona Builder             │
                    │   • Message Extractor          │
                    │   • Structure Planner (8 types)│
                    │   • Style Mapper + Craft Layer │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   Prompt Builder (v3)          │
                    │   Section-by-section prompts  │
                    │   anchored to your persona    │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   AI Generation               │
                    │   Claude (Anthropic) or       │
                    │   GPT-4o (OpenAI)             │
                    └───────────────┬───────────────┘
                                    │
                              Your Song ✓
```

---

## Feature Map

### Identity Excavation

| Feature | What It Does |
|---|---|
| **CockpitHub** | Non-sequential multi-panel input interface — fill in any order, all visible at once |
| **WH-Question Framework** | Who, What, When, Where, Why, How — 10 identity categories mapped to music |
| **Duality Mode** | Enter your truth AND your shadow (What vs What-Not) — the engine reasons on both simultaneously |
| **Square of Opposition** | Classical logic applied: CONTRADICTION / CONTRARY / SUBCONTRARY / SUBALTERNATION — tension type drives structure |
| **Identity Radar** | Hexagonal 6-angle identity profile visualized in real time as you type |
| **Live Persona Bar** | Persistent top bar showing archetype, dominant emotion, language mix — updates every 500ms |

### Persona Intelligence

| Feature | What It Does |
|---|---|
| **8 Conflict Archetypes** | The Defiant, The Wounded, The Seeker, The Witness, The Trickster, The Confessor, The Street Philosopher, The Ghost |
| **ML Emotion Detection** | sentence-transformers (`paraphrase-MiniLM-L6-v2`) — semantic emotion detection vs 8 anchors |
| **Trait Scoring** | Poetic / Streetwise / Spiritual / Wounded — 0–100 sliders feed the voice register |
| **PIRE Temporal Layer** | Past / Identity / Resonance / Emergence — classifies your temporal self (who you were, are, refusing, becoming) |
| **Alter Ego Engine** | 6 built-in persona masks (Confessor, Witness, Trickster, Preacher, Ghost, Street Philosopher) |
| **6-Angle Identity Config** | Past/Present/Future × Actual/Alternative — full timeline identity framework |

### Hook Book (Lyric Intelligence)

| Endpoint | Intelligence |
|---|---|
| `POST /api/hookbook/syllables` | Word-by-word syllable count via CMU Pronunciation Dictionary |
| `POST /api/hookbook/rhymes` | Perfect rhymes + near/slant rhymes from phoneme analysis |
| `POST /api/hookbook/stress` | Stress pattern per line: `/` (strong), `+` (secondary), `U` (weak) |
| `POST /api/hookbook/scheme` | Auto-detect end rhyme scheme (AABB / ABAB / ABCB etc.) |
| `POST /api/hookbook/devices` | Alliteration, assonance, anaphora, epistrophe detection |
| `POST /api/hookbook/grammar` | Artistic-mode grammar — knows the difference between intentional vernacular and actual errors |
| `POST /api/hookbook/synonyms` | Songwriting-tuned synonyms optimized for singability and stress |
| `POST /api/hookbook/coherence` | 0–100 verse coherence score with specific improvement notes |
| `POST /api/hookbook/analyze` | Full analysis in one call — all of the above |

### Studio Modes (Gen-Z Practice Environment)

| Mode | Purpose |
|---|---|
| **Cypher** | Fast 8–32 bar generation. No analysis. Raw bars, high energy. Writer's block killer. |
| **Battle** | Opener/responder architecture. Write challenges, craft responses, practice confrontation. |
| **Analysis** | Lyric forensics — paste any lyrics and get device detection, emotional profiling, structural breakdown |
| **Juxtapose** | Dual-position tension generation. Two conflicting stances, one song. |

### Journalling (Identity Knowledge Acquisition)

| Tier | What It Does |
|---|---|
| **Tier 1: Rapid Capture** | Timed 5–15 min free-write with auto-save every 30s, emotion breadcrumbs, reference detection |
| **Tier 2: AI Synthesis** | Journal entries synthesized into Cockpit pre-fill — `emotionalTruth`, `socialConflict` auto-populated |
| **Confrontational Prompts** | "Who are you NOT?" / "What are you carrying?" / "When did you become this?" — by design, not gentle |

### Craft Layer

| Control | Options |
|---|---|
| **Rhyme Type** | Perfect / Slant / Internal / AABB / ABAB / FREE / AAAA |
| **Rhetorical Devices** | 11 selectable: anaphora, chiasmus, zeugma, litotes, synecdoche, and more |
| **Humor Type** | None / Wit / Sarcasm / Dark humor / Absurdism / 5 more |
| **Meter Control** | Iambic / Trochaic / Anapestic / Dactylic / Free verse |
| **Diction Level** | Elevated / Mixed / Street |
| **Grammar Intentionality** | Standard / Intentional breaks / Vernacular |
| **Momentum** | Build / Sustain / Release / Peak / Valley — per section |
| **Resolution** | Resolved / Unresolved / Ambiguous / Deferred |
| **Narrator Morality** | Heroic / Morally grey / Antihero / Unreliable |

### Multilingual

Habitat treats language as identity — the engine doesn't code-switch randomly, it code-switches **authentically** based on who you said you are:
- English
- Kiswahili
- Sheng (44-word lexicon, ≥3 word detection threshold)
- Mixed blends with culturally grounded instructions per register

---

## Architecture

### 3-Tier Stack

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND — React 18 + Vite (port 3000)                    │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  Landing    │ │  CockpitHub  │ │  CockpitPreview      │ │
│  │  API setup  │ │  4 panels    │ │  Cinematic persona   │ │
│  │  provider   │ │  Duality mode│ │  reveal              │ │
│  └─────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌─────────────┐ ┌──────────────────────────────────────┐  │
│  │  Generator  │ │  SongDisplay + HookBookPanel drawer  │  │
│  │  Live stream│ │  Per-section regenerate + export     │  │
│  └─────────────┘ └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │ /api proxy
┌─────────────────────────────────────────────────────────────┐
│  BACKEND — Node.js 24 + Express (port 3001)                │
│  23 API endpoints · Session persistence · ML proxy         │
│                                                             │
│  Engine Modules (pure JS — no AI dependency):              │
│  identityParser  · personaBuilder · messageExtractor       │
│  structurePlanner · styleMapper · referenceAnalyzer        │
│  temporalParser  · identityConfig · altEgoEngine           │
│  lyricsStyleEngine · dualityEngine · studioEngine          │
│  propertyTensionEngine · defaultPersonaData                │
└─────────────────────────────────────────────────────────────┘
                              │ localhost:3002
┌─────────────────────────────────────────────────────────────┐
│  ML MICROSERVICE — Python 3.10 + Flask (port 3002)         │
│  paraphrase-MiniLM-L6-v2 (80MB, CPU-safe)                 │
│  Emotion · Conflict · Trait · Language detection           │
│  Hook Book: syllables · rhymes · stress · devices          │
│  Graceful fallback — engine works without ML               │
└─────────────────────────────────────────────────────────────┘
```

### Engine Modules

| Module | Role |
|---|---|
| `identityParser.js` | Async ML + rule-based fallback, 44-word Sheng lexicon |
| `personaBuilder.js` | 8 archetypes, emotion→tone, trait→voice, language label |
| `messageExtractor.js` | Core message derivation + temporal profile forwarding |
| `structurePlanner.js` | 8 conflict templates, emotion weighting, PIRE injection |
| `styleMapper.js` | Rhyme/flow/imagery + craftConfig + identityConfig passthrough |
| `referenceAnalyzer.js` | Rhyme scheme, vocabulary level, tonal register from pasted lyrics |
| `temporalParser.js` | PIRE layer — CONTRADICTION / CONTRARY / SUBCONTRARY logic |
| `identityConfig.js` | 6-angle identity framework, section→identity mapping |
| `altEgoEngine.js` | 6 built-in alter ego archetypes, `applyAlterEgo()` |
| `lyricsStyleEngine.js` | Full craft layer — 11 devices, 9 humor types, 8 rhyme types, 6 meters |
| `dualityEngine.js` | What vs What-Not reasoning, Square of Opposition |
| `studioEngine.js` | Cypher / Battle / Analysis / Juxtapose prompt builders |
| `propertyTensionEngine.js` | Cross-property tension detection |
| `defaultPersonaData.js` | Gen-Z archetypes and rich culturally grounded defaults |

### API Surface (23 Endpoints)

```
GET  /api/health              Service status + ML probe
POST /api/analyze             Full identity pipeline → persona + structure
POST /api/generate            Complete song (all sections)
POST /api/section             Single section generate/regenerate (with seed)
POST /api/save                Persist session to ~/.habitat-sessions/
GET  /api/sessions            List last 50 sessions
POST /api/duality             Duality analysis → Square of Opposition
POST /api/studio/cypher       Fast bar generation
POST /api/studio/battle       Challenge/response bars
POST /api/studio/analyze      Lyric forensics
POST /api/studio/juxtapose    Dual-position tension
POST /api/hookbook/syllables  Syllable breakdown per word/line
POST /api/hookbook/rhymes     Perfect + near/slant rhymes
POST /api/hookbook/stress     Stress pattern + meter classification
POST /api/hookbook/scheme     End rhyme scheme detection
POST /api/hookbook/devices    Literary device detection
POST /api/hookbook/grammar    Artistic-mode grammar intelligence
POST /api/hookbook/synonyms   Singability-tuned synonyms
POST /api/hookbook/coherence  Verse coherence score (0–100)
POST /api/hookbook/analyze    Full Hook Book analysis in one call
POST /api/test-claude         Claude API diagnostic with actionable errors
POST /api/journal/synthesize  Journal entries → Cockpit pre-fill
POST /api/delta               Session version comparison
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **API key** — Anthropic (`sk-ant-...`) or OpenAI (`sk-...`)

### One-Command Start
```bash
git clone https://github.com/jaguar999paw-droid/sci-songwriting-engine.git
cd sci-songwriting-engine
chmod +x START.sh && ./START.sh
```

The script installs all dependencies, starts the ML service (port 3002), backend (port 3001), and frontend (port 3000) in order, and waits for each to be healthy.

Open **http://localhost:3000**, enter your API key in the Landing screen, and begin.

### Manual Start (Three Terminals)
```bash
# Terminal 1 — ML Service
cd ml-service && pip3 install -r requirements.txt --break-system-packages && python3 app.py

# Terminal 2 — Backend
cd backend && npm install && npm start

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev
```

### Recommended Models

| Model | String | Best For |
|---|---|---|
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | Fast drafts, budget-conscious |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | Best balance — **recommended** |
| Claude Opus 4.6 | `claude-opus-4-6` | Maximum quality (Pro tier) |
| GPT-4o | `gpt-4o` | OpenAI alternative |

---

## Project Structure

```
sci-songwriting-engine/
├── frontend/                    React 18 + Vite
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx          API key setup, provider, model selection
│       │   ├── CockpitHub.jsx       Unified non-sequential identity cockpit
│       │   ├── CockpitPreview.jsx   Cinematic persona reveal
│       │   ├── Generator.jsx        Live section-by-section generation
│       │   └── SongDisplay.jsx      Song + HookBook drawer + export
│       ├── components/
│       │   ├── HookBookPanel.jsx    4-tab lyric intelligence (Line/Verse/Rhymes/Forms)
│       │   ├── IdentityRadar.jsx    Hexagonal 6-angle persona visualization
│       │   ├── DualityInput.jsx     What vs What-Not shadow input
│       │   ├── KnobSlider.jsx       Rotary dial sliders (energy, rawness)
│       │   ├── ArchetypeGrid.jsx    8 archetype cards, single-select
│       │   ├── EmotionGrid.jsx      Emotion selection grid
│       │   ├── LanguageToggle.jsx   EN / SW / SH independent toggles
│       │   ├── RhymeSwatch.jsx      Visual rhyme scheme selector
│       │   ├── ThemeChips.jsx       Sub-theme multi-select chips
│       │   ├── PersonaLiveBar.jsx   Persistent identity preview bar
│       │   ├── InferencePreview.jsx Pre-analysis identity signal preview
│       │   └── GlitchText.jsx       CRT glitch display effect
│       └── styles/global.css        Green + magenta + B&W design system
│
├── backend/
│   └── server.js                Express API — 23 endpoints
│
├── engine/                      Pure JS — no AI dependency
│   ├── identityParser.js
│   ├── personaBuilder.js
│   ├── messageExtractor.js
│   ├── structurePlanner.js
│   ├── styleMapper.js
│   ├── referenceAnalyzer.js
│   ├── temporalParser.js
│   ├── identityConfig.js
│   ├── altEgoEngine.js
│   ├── lyricsStyleEngine.js
│   ├── dualityEngine.js
│   ├── studioEngine.js
│   ├── propertyTensionEngine.js
│   └── defaultPersonaData.js
│
├── ai/
│   ├── promptBuilder.js         Section-level structured prompts (v3)
│   └── generator.js             Claude / OpenAI abstraction + seed regen
│
└── ml-service/                  Python 3.10 + Flask
    ├── app.py                   12 ML endpoints
    ├── emotion_model.py         Semantic emotion detection
    ├── conflict_model.py        Conflict archetype classification
    ├── trait_model.py           Trait scoring
    ├── language_model.py        EN/SW + Sheng detection
    └── hookbook_service.py      Rhyme/syllable/device/grammar NLP
```

---

## How to Extend

| Goal | File |
|---|---|
| Add a persona archetype | `engine/personaBuilder.js` → `ARCHETYPE_MAP` + `engine/structurePlanner.js` → `STRUCTURE_TEMPLATES` |
| Add a language | `engine/styleMapper.js` → `LANGUAGE_BLEND_INSTRUCTIONS` + `engine/identityParser.js` → word lists |
| Add a song structure template | `engine/structurePlanner.js` → `SECTION_BLUEPRINTS` + `STRUCTURE_TEMPLATES` |
| Add a studio mode | `engine/studioEngine.js` → new prompt builder + `backend/server.js` → new route |
| Add an AI provider | `ai/generator.js` → `callYourProvider()` + branch in `generateSection()` |
| Add a craft device | `engine/lyricsStyleEngine.js` → extend `RHETORICAL_DEVICES` |
| Add an alter ego | `engine/altEgoEngine.js` → `BUILT_IN_ALTER_EGO_ARCHETYPES` |

---

## Adding a Repo Profile Image or UI Screenshot

To add a screenshot as shown at the top of this README:

1. Take a screenshot of your running UI at `http://localhost:3000`
2. Create an `assets/` folder in the repo root
3. Add the image as `assets/habitat-ui.png`
4. The `<img>` tag at the top of this README will render it automatically on GitHub

For the **repository social preview** (shown when the link is shared on Twitter/WhatsApp):
- GitHub → repo → **Settings** → **Social preview** → Upload image → Save

---

## Philosophy

Habitat is built on the belief that the most powerful songs emerge from the intersection of three forces:

**1. Precision of self-knowledge.** Vague identity produces vague music. Habitat confronts the artist with questions designed to surface emotional specificity — not "I'm sad" but "I am the version of myself that someone else needed me to be, and I'm tired."

**2. Structural intentionality.** Every section exists for a reason. The verse earns the chorus. The bridge earns the shift. The outro earns the silence. Habitat's 8 conflict-based structure templates ensure nothing is filler.

**3. Logical reasoning on contradiction.** The most powerful songs don't resolve tension — they hold it. Habitat's duality engine, grounded in the Square of Opposition from classical logic, ensures the AI never flattens a contradiction into a resolution the artist didn't earn.

The result is not a song that sounds like you. It is a song that **could only ever be you**.

---

## License

MIT © 2024–2026 — Build freely, credit generously.

---

<p align="center">
  <strong>Habitat</strong> · Identity-mapped AI songwriting<br/>
  <a href="https://github.com/jaguar999paw-droid/sci-songwriting-engine">github.com/jaguar999paw-droid/sci-songwriting-engine</a>
</p>
