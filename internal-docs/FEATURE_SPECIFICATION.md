# SCI Songwriting Engine — Complete Feature Specification
**Compiled**: April 23, 2026  
**Status**: Documented from entire documentation set  
**Purpose**: Master reference for all implemented and planned features, endpoints, components, and systems

---

## TABLE OF CONTENTS
1. [API Endpoints](#api-endpoints)
2. [Frontend Pages & Components](#frontend-pages--components)
3. [Backend / Engine Modules](#backend--engine-modules)
4. [Python ML Service Endpoints](#python-ml-service-endpoints)
5. [Studio Modes & Features](#studio-modes--features)
6. [Hook Book Features](#hook-book-features)
7. [Journalling Features](#journalling-features)
8. [System Architecture & Layers](#system-architecture--layers)
9. [Data Models & Schemas](#data-models--schemas)
10. [Configuration & Overrides](#configuration--overrides)

---

## API ENDPOINTS

### Core Health & Status
- `GET /api/health` — Service health check, includes ML service status
  - Returns: `{ status, version, mlStatus }`

### Identity Analysis
- `POST /api/analyze` — Full identity parsing, persona building, structure planning
  - Input: `{ answers: { whoAreYouNot, mainIdea, emotionalTruth, socialConflict, referenceText }, overrides: {...} }`
  - Returns: `{ parsed: {...}, persona: {...}, structure: {...}, message: {...}, mlUsed, mlConfidence, semanticProfile }`
  - Supports ML service fallback (timeout: 500ms)

### Song Generation
- `POST /api/generate` — Generate complete song end-to-end (all sections)
  - Input: Full analysis data + metadata
  - Returns: Complete song with all sections

- `POST /api/section` — Generate or regenerate single song section
  - Input: `{ sectionIndex, sectionType, context, seed }`
  - Supports per-section regeneration with seed parameter for variance
  - Returns: Generated section lyrics

### Session Management
- `POST /api/save` — Save complete session to disk
  - Input: `{ metadata, answers, overrides, generatedSong, timestamp }`
  - Returns: `{ sessionId, location, timestamp }`
  - Saves to: `~/.sci-sessions/session-[timestamp].json`

- `GET /api/sessions` — List saved sessions (last 50 entries)
  - Returns: Array of session metadata with timestamps

- `POST /api/delta` — Compare session deltas (version control for sessions)

### Duality Analysis
- `POST /api/duality` — Analyze duality/shadow relationship in identity
  - Input: `{ mainIdea, shadow, emotionalTruth, shadowEmotion }`
  - Returns: `{ dualityType, squareRelation, tension, songPremise }`
  - Logical relations: CONTRADICTION, CONTRARY, SUBCONTRARY, SUBALTERNATION

### Studio Endpoints (Gen-Z Practice Modes)

#### Cypher Mode
- `POST /api/studio/cypher` — Fast-flow bar generation
  - Input: `{ theme, barCount, language, energy }`
  - Returns: Generated N-bar freestyle (8, 12, 16, 24, or 32 bars)

#### Battle Mode
- `POST /api/studio/battle` — Challenge opener or response bars
  - Input: `{ role: 'opener'|'responder', opponentBars, myPreviousBars, language }`
  - Returns: Generated battle verse

#### Lyric Analysis
- `POST /api/studio/analyze-lyrics` — Full identity + message extraction from any lyrics
  - Input: `{ lyrics }`
  - Returns: `{ coreMessage, subMessages, emotionalArc, identity, conflict, duality, punchlines, ratings: { message, craft, originality }, spiritualUndertones }`

#### Identity Juxtaposition
- `POST /api/studio/juxtapose` — Find song premise between two identity positions
  - Input: `{ positionA, positionB }`
  - Returns: `{ tension, logicalRelation, songPremise, suggestedStructure, openingLine, hookCandidate, mustNotDo }`

### Hook Book Routes
- `POST /api/hookbook/syllables` — Count syllables in text
- `POST /api/hookbook/rhymes` — Generate rhyme suggestions
- `POST /api/hookbook/stress` — Analyze stress pattern and meter
- `POST /api/hookbook/scheme` — Detect rhyme scheme (AABB/ABAB/AAAA/FREE/INTERNAL)
- `POST /api/hookbook/devices` — Identify literary devices (anaphora, assonance, etc.)
- `POST /api/hookbook/grammar` — Grammar intelligence and corrections
- `POST /api/hookbook/synonyms` — Songwriting synonyms (semantic-aware with register)
- `POST /api/hookbook/coherence` — Verse coherence score
- `POST /api/hookbook/analyze` — Full Hook Book analysis (all above combined)

### Journal Routes
- `POST /api/journal/synthesize` — Weekly synthesis from last 7 journal entries
  - Returns: `{ synthesizedTruth, keyThemes, temporalProfile, emotionTrajectory, archetypeDrift, subThemeExtraction }`

---

## FRONTEND PAGES & COMPONENTS

### Pages
| Page | File | Purpose | Status |
|------|------|---------|--------|
| **Landing** | `Landing.jsx` | API key setup, provider selection (Claude/OpenAI), hero statement | ✅ Exists |
| **CockpitHub** | `CockpitHub.jsx` ⭐ | Unified non-sequential cockpit with optional panels, duality mode toggle | ✅ v3 NEW |
| **Cockpit (Legacy)** | `Cockpit.jsx` | 4-phase sequential flow (SPEAK→FEEL→KNOW→CRAFT) | Legacy, replaced by CockpitHub |
| **CockpitPreview** | `CockpitPreview.jsx` | Cinematic persona reveal (archetype name, core message, structure) | ✅ Exists |
| **Generator** | `Generator.jsx` | Section-by-section generation with live streaming | ✅ Exists |
| **SongDisplay** | `SongDisplay.jsx` | Final song display, per-section regenerate (↻), HookBook drawer, export | ✅ Exists |
| **Questionnaire** | `Questionnaire.jsx` | 7-step identity interrogation (deprecated in v3, but still functional) | 📝 Legacy |
| **PersonaReview** | `PersonaReview.jsx` | Persona visualization (deprecated in v3, replaced by CockpitPreview) | 📝 Legacy |

### Core Components

#### Input Widgets & UI Elements
| Component | File | Purpose |
|-----------|------|---------|
| **ArchetypeGrid** | `ArchetypeGrid.jsx` + CSS | 8-card visual archetype picker (single-select), green border on selected |
| **LanguageToggle** | `LanguageToggle.jsx` + CSS | EN/SW/SH language mix (3 independent toggles) |
| **KnobSlider** | `KnobSlider.jsx` + CSS | Range slider with CSS rotation animation for dials |
| **RhymeSwatch** | `RhymeSwatch.jsx` + CSS | 5 rhyme scheme buttons (AABB, ABAB, FREE, AAAA, INTERNAL) |
| **ThemeChips** | `ThemeChips.jsx` + CSS | Multi-select theme/context chips (Place, Love, Transformation, Society, Roots, Duality) |
| **ReferenceDropZone** | `ReferenceDropZone.jsx` + CSS | Textarea for pasting reference lyrics with keyword preview |
| **DualityInput** | `DualityInput.jsx` + CSS | Dual text field (What ↔ What-Not) for shadow reasoning |

#### Display & Visualization
| Component | File | Purpose |
|-----------|------|---------|
| **PersonaCard** | `PersonaCard.jsx` + CSS | Display persona: archetype, emotions, voice profile |
| **PersonaLiveBar** | `PersonaLiveBar.jsx` + CSS | Top fixed bar: archetype emoji + name + dominant emotion + language mix (updates 500ms) |
| **IdentityRadar** | `IdentityRadar.jsx` + CSS | Hexagonal SVG radar showing 6-angle identity profile (Past/Present/Future, etc.) |
| **IdentitySliders** | `IdentitySliders.jsx` + CSS | "Mixing board" with 4–6 sliders for identity properties |
| **InferencePreview** | `InferencePreview.jsx` + CSS | Shows parsed identity with override modal, detections with confidence |
| **EmotionGrid** | `EmotionGrid.jsx` + CSS | Visual emotion picker/display with emotion chips |
| **ProgressBar** | `ProgressBar.jsx` + CSS | Progress indicator for multi-step flows |
| **StructurePlan** | `StructurePlan.jsx` + CSS | Song structure visualization (sections, flow, conflict mapping) |
| **GlitchText** | `GlitchText.jsx` + CSS | Artistic glitch animation text (used in hero/titles) |

#### Optional Panels (within CockpitHub)
| Panel | File | Purpose |
|-------|------|---------|
| **Hook Book Panel** | Integrated in CockpitHub | Reference analysis, hook template picker, emotional peak locator, rhyme swatch |
| **Journal Panel** | Integrated in CockpitHub | Rapid capture, emotion tags, reference detection, weekly synthesis |
| **Studio Panel** | Integrated in CockpitHub | Cypher, battle, analyze, juxtapose modes |
| **Manual Config Panel** | Integrated in CockpitHub | PIRE, duality, identity sliders deep-config |

### Modal Components
- **OverrideModal** — Allows user to override inferred properties with custom values
  - Used in: InferencePreview after analysis
  - Keyboard nav: Tab/Enter/Esc (partially implemented)

---

## BACKEND / ENGINE MODULES

### Engine Layer (Pure JavaScript, Rule-Based + ML-Ready)

| Module | File | Key Exports | Purpose |
|--------|------|-------------|---------|
| **Identity Parser** | `identityParser.js` | `parseIdentity(answers, overrides)`, `parseIdentitySync(answers)` | Async ML + rule-based emotion/conflict/trait detection |
| **Persona Builder** | `personaBuilder.js` | `buildPersona(parsedIdentity)`, `ARCHETYPE_MAP` | Construct persona from parsed identity (8+ archetypes) |
| **Message Extractor** | `messageExtractor.js` | `extractMessage(parsedIdentity)` | Extract core message + sub-themes |
| **Structure Planner** | `structurePlanner.js` | `planStructure(message, persona)`, `applyEmotionWeighting()` | Dynamic structure planning from conflict type, 8 templates |
| **Style Mapper** | `styleMapper.js` | `mapStyle(persona, overrides)` | Maps persona to rhyme scheme, flow, language, imagery, rawness |
| **Reference Analyzer** | `referenceAnalyzer.js` | `analyzeReference(text)` | Extract rhyme scheme, vocabulary level, tonal register from lyrics |
| **Temporal Parser** | `temporalParser.js` | `parseTemporalIdentity(answers)` | PIRE layer: past/present/future + logical relations |
| **Identity Config** | `identityConfig.js` | `buildIdentityFrameBlock()` | 6-Angle identity framework |
| **Alt Ego Engine** | `altEgoEngine.js` | `buildAlterEgoBlock()`, `ALTER_EGO_OPTIONS` | Persona masks (Confessor, Witness, Trickster, Preacher, Ghost, Street Philosopher) |
| **Property Tension Engine** | `propertyTensionEngine.js` | `detectPropertyTensions()` | Cross-property tension detection |
| **Duality Engine** ⭐ | `dualityEngine.js` | `analyzeDuality()`, `buildDualityBlock()`, `DUALITY_SHADOW_MAP` | What vs What-Not reasoning, Square of Opposition |
| **Studio Engine** ⭐ | `studioEngine.js` | `buildCypherPrompt()`, `buildBattlePrompt()`, `buildAnalysisPrompt()`, `buildJuxtaposePrompt()` | Gen-Z studio mode prompt builders |
| **Default Persona Data** ⭐ | `defaultPersonaData.js` | `GENZ_ARCHETYPES`, `RICH_DEFAULT_IDENTITY_CONFIG`, `SPIRITUAL_ANCHORS` | Rich defaults, Gen-Z archetypes, questionnaire generator |
| **Lyrics Style Engine** | `lyricsStyleEngine.js` | Rhetorical devices, prosody, humor analysis | Craft layer analysis |
| **Identity Schema** | `identitySchema.js` | `PROPERTY_SCHEMA`, validation, defaults | Property schema definition, validation |

### AI Integration Layer

| Module | File | Key Exports | Purpose |
|--------|------|-------------|---------|
| **Prompt Builder** | `ai/promptBuilder.js` | `buildSectionPrompt(section, context)` | Constructs structured per-section prompts with duality layer, system philosophy |
| **Generator** | `ai/generator.js` | `generateSection(prompt, apiKey, provider)`, `callClaude()`, `callOpenAI()` | Provider abstraction (Claude/OpenAI), section-by-section generation + context passing |

### Backend Server

| File | Port | Key Features |
|------|------|-------------|
| **server.js** | 3001 | Express server, 6+ core routes + studio routes + hook book routes, ML integration |

---

## PYTHON ML SERVICE ENDPOINTS

### Base URL
`http://localhost:3002`

### Core ML Endpoints

| Endpoint | Method | Input | Output | Purpose |
|----------|--------|-------|--------|---------|
| `/ml/health` | GET | — | `{ status, model, loaded }` | Health check |
| `/ml/analyze` | POST | `{ text }` | `{ emotions, conflicts, traits, languageMix, confidence }` | Full semantic analysis |
| `/ml/embed` | POST | `{ texts: [string] }` | `{ embeddings: [[float]] }` | Get embeddings for texts |

### Model Architecture
- **Embedding Model**: `sentence-transformers/paraphrase-MiniLM-L6-v2` (80MB, CPU-friendly)
- **Approach**: Cosine similarity vs semantic anchors (emotion, conflict, trait, language)
- **RAM**: Optimized for 3.8GB constraint
- **Fallback**: 500ms timeout, graceful degradation to rule-based

### Emotion Detection Model
- `emotion_model.py`
- Detects: anger, sadness, defiance, longing, pride, confusion, joy, vulnerability
- Method: Semantic anchors + cosine similarity

### Conflict Classification Model
- `conflict_model.py`
- Classifies: identity_rejection, social_boundary, possession, authority, autonomy, belonging, belonging_with_cost, existential
- Method: Same sentence-transformer approach

### Trait Scoring Model
- `trait_model.py`
- Scores: poetic, streetwise, spiritual, wounded, decisiveness, vulnerability
- Output: 0.0–1.0 per trait

### Language Detection Model
- `language_model.py`
- Detects: English, Kiswahili, Sheng
- Method: `langdetect` + custom 44-word Sheng lexicon (≥3 hits = Sheng detected)

### Hook Book Service
- `hookbook_service.py`
- Provides: syllable counting, rhyme suggestions, stress patterns, literary device detection
- Integrated as Hook Book API endpoints in backend

---

## STUDIO MODES & FEATURES

### 1. Cypher Mode (Fast-Flow Bar Generation)
**Endpoint**: `POST /api/studio/cypher`
**Input**: `{ theme, barCount (8/12/16/24/32), language, energy }`
**Output**: Generated N-bar freestyle
**Philosophy**: Low-analysis, high-velocity creative warm-up
**Key**: No structure planning, just bars
**Use Cases**:
- Warming up before session
- Testing a concept
- Breaking writer's block
- Practicing flow + rhyme

### 2. Battle Mode (Challenge & Response)
**Endpoint**: `POST /api/studio/battle`
**Input**: `{ role: 'opener'|'responder', opponentBars, myPreviousBars, language }`
**Output**: Generated battle verse (opener or response)
**Roles**:
  - **Opener**: First to speak, establish claim, set terms
  - **Responder**: Receive verse, flip metaphor, subvert imagery, close unanswerable
**Philosophy**: Battle rap is philosophy with rhythm
**Use Cases**:
- Battle prep + practice
- Call-and-response songwriting
- Confrontational verse writing
- Identity juxtaposition through conflict

### 3. Lyric Analysis (Song Forensics)
**Endpoint**: `POST /api/studio/analyze-lyrics`
**Input**: `{ lyrics }`
**Output**:
  - Core message + sub-messages
  - Emotional arc (beginning→middle→end)
  - Identity position of narrator
  - Conflict type + temporal layers
  - Logical relation (CONTRADICTION/CONTRARY/SUBCONTRARY)
  - Duality: What IS said vs what is NOT said
  - Punchlines + strongest lines
  - Song strengths + growth edges
  - Spiritual/ancestral undertones
  - Ratings: message (0–10), craft (0–10), originality (0–10)
**Philosophy**: You can't improve what you can't see
**Use Cases**:
- Understanding your own song (not what you think it says, what it *actually* says)
- Studying other artists' work
- Message extraction + identity excavation
- Identifying punchlines + impact moments

### 4. Identity Juxtaposition (Concept Finding)
**Endpoint**: `POST /api/studio/juxtapose`
**Input**: `{ positionA, positionB }`
**Output**:
  - Tension between positions (0.0–1.0)
  - Logical relation: CONTRADICTION, CONTRARY, SUBCONTRARY, or SUBALTERNATION
  - One-sentence song premise
  - Suggested structure
  - Opening line (enters tension without resolving)
  - Hook candidate (holds both positions)
  - What the song must NOT do (safe version to avoid)
**Philosophy**: The song lives in the tension, not the resolution
**Use Cases**:
- Torn between two self-definitions
- Identity change songs (who I was → who I am)
- Concept mapping before full session
- Finding premise when lost

---

## HOOK BOOK FEATURES

### Hook Book Phases

#### Phase 1: Hook Ideation (Pre-Cockpit)
**Features**:
- Reference lyrics paste (3–5 favorites)
- `referenceAnalyzer` detection: rhyme scheme, vocabulary level, tonal register
- Hook skeleton picker (templates: Repetition, Call-Response, Question-Answer, Paradox, List)
- Emotion peak locator ("Where should this song break your heart?")
- Rhyme swatch selector (user picks preferred rhyme style)
- Archetype voice check (Does the hook sound like this persona?)

#### Phase 2: Hook Embedding (Inside CockpitHub)
**Features**:
- Hook theme chips (Repetition, Ascending, Paradox, Call-Response, Fragmented)
- Hook word count slider (3–12 words)
- Emotional peak placement pills (Verse-2, Pre-Chorus, Chorus, Bridge)
- Reference echo checkbox (echo specific artist's rhyme style)
- Rhyme intensity toggle (Dense/Internal vs Consonant/External)

#### Phase 3: Hook Validation (Post-Generate)
**Features**:
- Hook strength meter (Does it appear ≥3x? Musically consistent?)
- Emotional integrity check (Feels like it came from core wound?)
- Reference fidelity (Does rhyme scheme match reference artist?)
- Arch integrity (Emotional peak placement honored?)
- Memorability score (Phonetic repetition, vowel patterns, semantic resonance)
- Per-section regeneration with seed parameter
- Hook validation report + regeneration option

### Hook Types (Mapped to Archetypes)

#### Defiant Hook
- **Archetype**: Rebel, Warrior, Dissident
- **Core**: "I refuse. I will not be silenced."
- **Structure**: `I [verb of resistance] [negation]`
- **Example**: "I will not apologize for existing"
- **Rhyme Style**: Internal, aggressive (monosyllabic consonants)
- **Placement**: Early (Verse 1)
- **Peak**: Consonant cluster/plosive (harsh sounds reinforce defiance)

#### Vulnerable Hook
- **Archetype**: Healer, Sage, Romantic
- **Core**: "I am undone. I admit the truth."
- **Structure**: `I [confession] [feeling]`
- **Example**: "I still reach for you in the dark"
- **Rhyme Style**: Assonance (vowel echoes), legato flow
- **Placement**: Mid-song (bridge or pre-chorus)
- **Peak**: Vowel or PAUSE (emptiness mirrors exposure)

#### Wisdom Hook
- **Archetype**: Oracle, Mentor, Sage
- **Core**: "Here is what I learned. Here is what I offer."
- **Structure**: `[Metaphor] teaches us [insight]`
- **Example**: "The river knows it must move or die"
- **Rhyme Style**: Compound/literary (polysyllabic, classical)
- **Placement**: Chorus or outro (earned authority)
- **Peak**: Key word (noun, verb, not article)

#### Call-Response Hook
- **Use**: Dialogue/tension structure
- **Pattern**: Question → Answer or Statement → Counter-statement

#### Paradox Hook
- **Use**: Hold two truths simultaneously
- **Pattern**: Both statements true, but seemingly contradictory

#### Question-Answer Hook
- **Use**: Inquiry structure toward truth
- **Pattern**: Question posed → explored → answered (or left open)

### Hook Book Worksheet
**User fills before entering Cockpit**, includes:
1. Favorite lyrics reference (3+ excerpts)
2. Hook archetype selection
3. Hook skeleton choice (repetition/call-response/ascending/etc.)
4. Emotional peak timing
5. Hook rough draft (1–2 sentences)

---

## JOURNALLING FEATURES

### Overview
Journalling is **structured identity excavation** through confrontational prompts. It is the engine's primary data source.

### Journalling Principles

#### Confrontational Questions (Identity Interrogation)
- "Who are you NOT?" — Rejection clarifies essence
- "What are you carrying?" — Emotional payload discovery
- "When did you become this?" — Temporal origins
- "Where does it hurt?" — Emotional geography
- "Why is this yours to carry?" — Meaning extraction
- "How do you defend it?" — Identity armor

### Tier 1: Rapid Capture (Real-Time Stream)

**Features**:
| Feature | How It Works | Engine Input |
|---------|-------------|--------------|
| **Free-write timer** | Timed 5–15 min prompts; auto-save every 30s | Raw text → `parseIdentity()` |
| **Emotion breadcrumbs** | Click emoji/keyword while writing to tag feelings in-stream | Emotion signal → weighting |
| **Reference detection** | Paste a lyric; auto-detect rhyme + tone | `referenceAnalyzer.js` input |
| **Word count health** | "Your truth meter: 342 words in this session" | Signal when entry is ripe |
| **Voice-to-text** | Speak answers; engine transcribes + analyzes | Raw speech → identity signals |
| **localStorage persistence** | Auto-save with timestamp + emotion tags | Session recovery |

### Tier 2: Structured Analysis (Weekly Reflection)

**Features**:
| Feature | How It Works | Engine Integration |
|---------|-------------|------------------|
| **Weekly synthesis** | AI reads last 7 entries + summarizes key tensions | Feeds identity config layers |
| **Temporal classifier (PIRE)** | Entries auto-tagged: Past/Present/Future | `temporalParser.js` conflict detection |
| **Contradiction detector** | Highlights logical gaps in statements | `propertyTensionEngine` feeds structure |
| **Emotion trajectory** | Graph last 30 days: anger↑ sadness↓ hope→ | Energy + rawness overrides |
| **Archetype drift** | "You've moved from [Rebel] to [Sage]" | Persona recommendation |
| **Sub-theme extraction** | "Society, Roots, Transformation appear 8x this week" | `message.subThemes` seeding |

### Journal Integration Points

#### Entry Point 1: Direct Cockpit Injection
```
Journal entry + weekly synthesis
  ↓
Cockpit opens with pre-populated fields:
  - emotionalTruth: "Synthesized from 7 entries"
  - subThemes: [auto-detected]
  - identityConfig: { past, present, future }
  ↓
User refines/ignites → /api/analyze → /api/generate
```

#### Entry Point 2: Reference Chain
```
Journal mentions lyric → referenceAnalyzer detects
  ↓
Rhyme scheme + vocabulary + tone extracted
  ↓
styleMapper uses as anchor
  ↓
Generated song echoes same structural DNA
```

#### Entry Point 3: Tension-Driven Structure
```
Temporal parser detects journal arc:
  Past: "I was swallowed by shame"
  Present: "I'm learning to breathe"
  Future: "I will speak my truth"
  ↓
Conflict type → TRANSFORMATION
  ↓
Structure includes bridge_transformation + call_and_response
  ↓
Song structure mirrors journal evolution
```

### Identity Knowledge Acquisition (6-Layer Model)

**What the Journal + Engine reveal**:

1. **Emotional Baseline** — Which emotions dominate? How do they shift? What triggers intensity?
2. **Core Conflict** — What contradictions appear repeatedly? What belief systems clash?
3. **Identity Archetypes** — Which persona emerges? How do you code-switch?
4. **Communication DNA** — Vocabulary register, metaphor patterns, grammar, literary references
5. **Temporal Strata** — Past (wound), Present (acute struggle), Future (claimed vision)
6. **Language Mix** — Code-switching patterns (EN ↔ SW ↔ SH), emotional contexts

### Journal Implementation Roadmap

**MVP (Week 1–2)**:
- [ ] `JournalEntry.jsx` — Free-write form with 5–15 min timer
- [ ] localStorage persistence with timestamp + emotion tags
- [ ] `POST /api/journal/synthesize` — Reads last 7 entries, returns summary
- [ ] Route in CockpitHub — "Start here: Journal Entry" tab

**Phase 2 (Week 3–4)**:
- [ ] Emotion breadcrumbs — Click-to-tag during writing
- [ ] Temporal classifier — Auto-detect past/present/future language
- [ ] Reference detection — Paste lyrics, auto-analyze rhyme + tone
- [ ] Journal → Cockpit prepopulation — Next injects synthesis

**Phase 3 (Week 5–6)**:
- [ ] Weekly trends screen — Graph emotion trajectory, archetype drift
- [ ] Contradiction detector — Flag logical tensions
- [ ] Voice-to-text option — Accessibility + authenticity
- [ ] Export journal — PDF with synthesis + identity profile

---

## SYSTEM ARCHITECTURE & LAYERS

### Layer 1: Engine (Pure JavaScript, Rule-Based + ML-Ready)
**Location**: `/engine/`  
**Dependencies**: None (or minimal)  
**Purpose**: Signal extraction, persona construction, structure planning

**Key Characteristics**:
- Async with ML fallback
- Rule-based defaults for reliability
- Modular, single-responsibility modules
- No side effects (pure functions where possible)

**Module Organization**:
```
engine/
├── identityParser.js          (async parse + rule-based fallback)
├── personaBuilder.js          (persona construction, 8+ archetypes)
├── messageExtractor.js        (message + sub-themes)
├── structurePlanner.js        (structure planning, 8 conflict templates)
├── styleMapper.js             (style rules from persona)
├── referenceAnalyzer.js       (lyric analysis)
├── temporalParser.js          (PIRE: past/present/future)
├── identityConfig.js          (6-angle identity framework)
├── altEgoEngine.js            (persona masks)
├── propertyTensionEngine.js   (contradiction detection)
├── dualityEngine.js           (duality reasoning, Square of Opposition)
├── studioEngine.js            (studio mode prompt builders)
├── defaultPersonaData.js      (rich defaults, Gen-Z archetypes)
├── lyricsStyleEngine.js       (craft layer analysis)
└── identitySchema.js          (property schemas, validation)
```

### Layer 2: ML Microservice (Python Flask, Optional, Port 3002)
**Location**: `/ml-service/`  
**Language**: Python 3.10+  
**Purpose**: Semantic analysis, fallback to rule-based if down

**Modules**:
```
ml-service/
├── app.py                     (Flask server, port 3002)
├── emotion_model.py           (cosine similarity vs anchors)
├── conflict_model.py          (conflict classification)
├── trait_model.py             (trait scoring)
├── language_model.py          (EN/SW/Sheng detection)
├── hookbook_service.py        (syllables, rhymes, etc.)
├── requirements.txt           (dependencies)
└── startup.sh                 (boot script)
```

**Model**: `paraphrase-MiniLM-L6-v2` (80MB, CPU-friendly)

### Layer 3: AI Layer (Claude/OpenAI Abstraction)
**Location**: `/ai/`  
**Purpose**: Section-by-section generation with structured prompts

**Modules**:
```
ai/
├── promptBuilder.js           (per-section prompts, duality injection)
└── generator.js               (provider abstraction, context passing)
```

**Provider Support**:
- Claude (Anthropic) — primary
- OpenAI (GPT-4o) — alternate
- Extensible architecture for new providers

### Layer 4: Backend API (Express.js, Port 3001)
**Location**: `/backend/`  
**Language**: Node.js 24+  
**Purpose**: REST API, route handling, ML proxy

**Key Files**:
- `server.js` — All routes + ML integration
- `package.json` — Dependencies + dev scripts

**Route Categories**:
1. Core (6 routes): health, analyze, generate, section, save, sessions
2. Studio (4 routes): cypher, battle, analyze-lyrics, juxtapose
3. Hook Book (8 routes): syllables, rhymes, stress, scheme, devices, grammar, synonyms, coherence, analyze
4. Duality (1 route): duality analysis
5. Journal (1 route): synthesize

### Layer 5: Frontend (React/Vite, Port 3000)
**Location**: `/frontend/`  
**Language**: JavaScript / JSX  
**CSS**: CSS Modules + global.css (design tokens)

**Structure**:
```
frontend/src/
├── pages/
│   ├── Landing.jsx
│   ├── CockpitHub.jsx         (v3: unified non-sequential cockpit)
│   ├── CockpitPreview.jsx
│   ├── Generator.jsx
│   └── SongDisplay.jsx
├── components/
│   ├── [Input Widgets]        (ArchetypeGrid, KnobSlider, etc.)
│   ├── [Displays]             (PersonaCard, IdentityRadar, etc.)
│   └── [Panels]               (optional panels within CockpitHub)
├── hooks/
├── styles/
│   ├── global.css             (design tokens: green/magenta/B&W)
│   └── [module.css files]
└── App.jsx
```

---

## DATA MODELS & SCHEMAS

### Parsed Identity Output
```js
{
  whoAreYouNot:      string,       // rejections
  mainIdea:          string,       // core claim
  emotionalTruth:    string,       // primary feeling
  socialConflict:    string,       // external tension
  
  // Engine detection
  emotions:          [{ emotion, confidence }],
  conflicts:         [{ type, confidence }],
  traits:            { feature: score },
  languageMix:       ['en', 'sw', 'sh'],
  
  // ML data (when available)
  mlUsed:            boolean,
  mlConfidence:      0.0–1.0,
  semanticProfile:   { emotionVector, conflictProbs, traitScores },
  
  // Temporal analysis
  temporalProfile:   { past, present, future },
  logicalRelation:   'CONTRADICTION'|'CONTRARY'|etc,
  
  // References
  referenceText:     string,
  refAnalysis:       { rhymeScheme, vocabularyLevel, tone }
}
```

### Persona Output
```js
{
  archetype:         string,       // 8+ types
  voice:             string,       // vocal quality
  tone:              string,       // emotional tone
  energy:            number,       // 0–100
  perspective:       '1st'|'2nd'|'3rd',
  emotionalProfile:  { primary, secondary, shadow },
  languageMix:       ['en', 'sw', 'sh'],
  
  // Overrides from cockpit
  rawness:           number,       // 0–100: polished → unfiltered
  alterEgo:          string,       // Confessor, Witness, etc.
}
```

### Message Output
```js
{
  coreMessage:       string,       // main claim
  subThemes:         [string],     // supporting ideas
  temporalArc:       { past, present, future },
  logicalFallacies:  [string],     // if detected
  dualityType:       string,       // CONTRADICTION, etc.
}
```

### Song Structure Output
```js
{
  conflictType:      string,       // 8 types
  sections:          [
    {
      index:         number,
      type:          string,       // verse, hook, bridge, etc.
      goal:          string,       // narrative purpose
      emotionalPeak: boolean,
      temporalMarker: string,
    }
  ],
  hookPlacement:     number|array, // section index(es)
  emotionalArc:      [number],     // intensity per section
}
```

### Style Output
```js
{
  rhymeScheme:       string,       // AABB, ABAB, FREE, AAAA, INTERNAL
  flowStyle:         string,       // fast/medium/slow
  languageBlending:  string,       // instruction for code-switching
  imageryDomain:     string,       // violence, nature, intimacy, etc.
  
  // Rawness layer
  proseDensity:      'polished'|'honest'|'unfiltered',
  dictionLevel:      'elevated'|'street'|'mixed'|'neutral',
}
```

### Duality Analysis Output
```js
{
  mainPosition:      string,
  shadowPosition:    string,
  logicalRelation:   'CONTRADICTION'|'CONTRARY'|'SUBCONTRARY'|'SUBALTERNATION',
  tension:           0.0–1.0,      // how acute is the difference?
  songLocation:      string,       // where the song lives (what relation implies)
  squareOfOpposition: { /* all 4 terms */ },
}
```

### Session Output
```js
{
  sessionId:         string,       // timestamp-based
  timestamp:         number,       // Unix timestamp
  answers:           { /* full input */ },
  overrides:         { /* user cockpit choices */ },
  analyzed:          { /* parseIdentity output */ },
  persona:           { /* buildPersona output */ },
  structure:         { /* planStructure output */ },
  message:           { /* extractMessage output */ },
  generatedSong:     {
    sections:        [{ type, lyrics }],
    fullLyrics:      string,
    metadata:        { /* song info */ },
  },
}
```

---

## CONFIGURATION & OVERRIDES

### Cockpit Override Fields (Sent to `/api/analyze`)

All cockpit selections flow into an `overrides` object for `/api/analyze`:

```js
{
  // From identity rejection checkboxes
  whoAreYouNot:      string,       // joined rejections

  // From core text fields
  mainIdea:          string,
  emotionalTruth:    string,
  socialConflict:    string,
  referenceText:     string,       // from reference drop-zone

  // From style knobs + toggles (RIGHT PANEL)
  overrides: {
    rawness:         number,       // 0–100
    energyValue:     number,       // 0–100
    rhymeScheme:     string,       // AABB|ABAB|FREE|AAAA|INTERNAL
    perspective:     string,       // '1st'|'2nd'|'3rd'
    languageMix:     ['en'|'sw'|'sh'],
    
    // From LEFT PANEL
    traitWeights:    { poetic: 0–100, streetwise: 0–100, spiritual: 0–100, wounded: 0–100 },
    archetype:       string|null,  // null = auto-detect
    
    // From CENTRE PANEL
    subThemes:       [string],     // Place, Love, Transformation, Society, Roots, Duality
    
    // From Phase 4 (CRAFT)
    alterEgo:        string,       // Confessor, Witness, Trickster, etc.
    
    // Duality (if toggled)
    shadowMainIdea:  string,
    shadowEmotionalTruth: string,
  },
}
```

### Inference Overrides (Post-Analysis)
After `/api/analyze`, user can override inferred properties in `InferencePreview`:

```js
{
  primaryEmotion:    string,       // from detector → user selects
  secondaryEmotions: [string],     // from detector → user selects
  conflictType:      string,       // from detector → user selects
  archetype:         string,       // from detector → user selects
  // ... etc
}
```

Re-analysis called with these overrides, confidence = 1.0 for overridden properties.

---

## FEATURE COMPLETENESS MATRIX

### Status Legend
- ✅ **Implemented** — Code exists, tested
- 🔄 **In Progress** — Partial implementation
- 📝 **Planned** — Documented, not implemented
- ❌ **Not Planned** — Out of scope

### Core System
| Feature | Status | Notes |
|---------|--------|-------|
| Identity parsing (async ML + fallback) | ✅ | With ML microservice |
| Persona building (8+ archetypes) | ✅ | Extensible `ARCHETYPE_MAP` |
| Message extraction | ✅ | Core message + sub-themes |
| Structure planning (8 templates) | ✅ | Dynamic from conflict type |
| Style mapping | ✅ | Rhyme, flow, language, imagery |
| Section-by-section generation | ✅ | Claude/OpenAI support |
| Session persistence | ✅ | `~/.sci-sessions/` |
| ML fallback (500ms timeout) | ✅ | Graceful degradation |

### UI/Frontend
| Feature | Status | Notes |
|---------|--------|-------|
| Landing page (API key setup) | ✅ | |
| CockpitHub (unified cockpit) | ✅ | v3 NEW, non-sequential |
| Optional panels (Hook/Journal/Studio/Config) | 📝 | Designed, integration in progress |
| CockpitPreview (persona reveal) | ✅ | Cinematic display |
| Generator (section-by-section) | ✅ | Live streaming UI |
| SongDisplay (final song + export) | ✅ | Per-section regenerate |
| Duality mode toggle | ✅ | Shadow fields optional |
| ArchetypeGrid component | ✅ | 8 cards, visual selection |
| LanguageToggle component | ✅ | EN/SW/SH independent toggles |
| KnobSlider component | ✅ | CSS-animated dials |
| RhymeSwatch component | ✅ | 5 visual scheme buttons |
| PersonaLiveBar (live updates) | ✅ | 500ms refresh |
| IdentityRadar (hex visualization) | ✅ | 6-angle profile display |
| InferencePreview (with overrides) | ✅ | Override modal support |
| EmotionGrid component | ✅ | Visual emotion picker |
| ProgressBar component | ✅ | Multi-step flow indicator |

### API Endpoints
| Feature | Status | Notes |
|---------|--------|-------|
| GET /api/health | ✅ | With ML status probe |
| POST /api/analyze | ✅ | With overrides + ML integration |
| POST /api/generate | ✅ | Full song generation |
| POST /api/section | ✅ | With seed parameter |
| POST /api/save | ✅ | Session persistence |
| GET /api/sessions | ✅ | List last 50 |
| POST /api/duality | ✅ | Duality analysis |
| POST /api/studio/cypher | ✅ | Fast-flow bars |
| POST /api/studio/battle | ✅ | Opener/responder |
| POST /api/studio/analyze-lyrics | ✅ | Song forensics |
| POST /api/studio/juxtapose | ✅ | Concept finder |
| POST /api/hookbook/* (8 routes) | 📝 | Designed, implementation planned |
| POST /api/journal/synthesize | ✅ | Weekly synthesis |

### Studio Modes
| Feature | Status | Notes |
|---------|--------|-------|
| Cypher mode | ✅ | Fast bar generation |
| Battle mode | ✅ | Opener/responder |
| Lyric analysis | ✅ | Message extraction + duality |
| Identity juxtaposition | ✅ | Concept generation |

### Hook Book
| Feature | Status | Notes |
|---------|--------|-------|
| Hook ideation (reference analysis) | ✅ | Reference analyzer engine |
| Hook embedding (Cockpit fields) | 📝 | Hook theme chips planned |
| Hook validation (post-generate) | 📝 | Strength meter planned |
| Hook templates (5 types) | ✅ | Designed in documentation |
| Per-section regeneration | ✅ | With seed parameter |

### Journalling
| Feature | Status | Notes |
|---------|--------|-------|
| Free-write timer (Tier 1) | 📝 | MVP planned |
| Emotion breadcrumbs | 📝 | Phase 2 planned |
| Reference detection | 📝 | Phase 2 planned |
| Weekly synthesis (Tier 2) | ✅ | API endpoint exists |
| Temporal classification (PIRE) | ✅ | Engine layer complete |
| Contradiction detector | 📝 | Phase 3 planned |
| Emotion trajectory graphs | 📝 | Phase 3 planned |
| Archetype drift detection | 📝 | Phase 3 planned |
| Journal → Cockpit prepopulation | 📝 | Phase 2 planned |

### Duality & Philosophy
| Feature | Status | Notes |
|---------|--------|-------|
| Duality engine (Square of Opposition) | ✅ | Full logic implemented |
| What vs What-Not input | ✅ | DualityInput component |
| Shadow mapping (philosophical) | ✅ | 30+ concept pairs mapped |
| Duality injection into prompts | ✅ | System prompt + per-section |

### Design/Theme
| Feature | Status | Notes |
|---------|--------|-------|
| Green/magenta/B&W color system | ✅ | CSS tokens defined |
| Bebas Neue typography | ✅ | Large labels, display text |
| Space Grotesk (body) | ✅ | Default font |
| Space Mono (monospace) | ✅ | Tech/value display |
| CRT scanline texture | ✅ | 1px, 2% opacity |
| Glitch text animation | ✅ | GlitchText component |
| Decorative symbols (◈◆▸⬡✦░▓) | ✅ | CSS pseudo-elements |
| Knob rotation animation | ✅ | CSS transform |
| Input glow (green/magenta) | ✅ | box-shadow on focus |

---

## IMPLEMENTATION NOTES

### Backend Startup
```bash
cd ~/sci-songwriting-engine
bash START.sh
```
- Launches ML service (port 3002)
- Launches backend (port 3001)
- Launches frontend (port 3000)
- Auto health checks

### Testing
```bash
bash TEST_ENDPOINTS.sh
```
- Tests all 6 core endpoints
- 6/6 expected to pass

### Extensibility

#### Add New Archetype
Edit: `engine/personaBuilder.js` → `ARCHETYPE_MAP`

#### Add New Language
Edit: `engine/styleMapper.js` → `LANGUAGE_BLEND_INSTRUCTIONS`
Edit: `engine/identityParser.js` → language detection lexicon

#### Add New Structure Template
Edit: `engine/structurePlanner.js` → `STRUCTURE_TEMPLATES`

#### Add New Hook Type
Edit: `engine/studioEngine.js` or documentation as feature request

#### Add New Studio Mode
1. Add prompt builder to `engine/studioEngine.js`
2. Add route to `backend/server.js`
3. Add UI panel to `CockpitHub.jsx` (optional panels)

#### Add New AI Provider
Edit: `ai/generator.js` → add provider function + branch logic

---

## PERFORMANCE & CONSTRAINTS

### Design Constraints
- **RAM**: Optimized for 3.8GB (ML model: 80MB paraphrase-MiniLM)
- **Latency**: ML timeout 500ms (graceful fallback)
- **Storage**: Sessions in `~/.sci-sessions/` (local only)
- **UI State**: localStorage-based, no Redux at current scale

### Scalability Notes
- Engine layer is pure JS (no external deps) → trivial to scale
- Backend is Express (standard scaling patterns apply)
- ML service is Flask (single inference, not real-time streaming yet)
- Frontend is Vite (modern bundling, tree-shaking)

### Future Optimization
- [ ] SSE streaming on `/api/section` (planned in STATUS.md)
- [ ] Song library with localStorage (planned)
- [ ] Beat BPM suggestion (planned)
- [ ] Voice-to-text journalling (phase 3)
- [ ] Batch generation (variations)

---

## REFERENCES

### Documentation Files
- `README.md` — Project overview
- `QUICK_REFERENCE.md` — Quick start
- `COMPLETION_SUMMARY.md` — Full feature summary
- `docs/ARCHITECTURE_V3.md` — Current architecture
- `docs/STATUS.md` — Project status + priority queue
- `docs/JOURNALLING_FEATURES.md` — Journalling spec
- `docs/HOOK_BOOK_SONGWRITING.md` — Hook Book spec
- `docs/DUALITY_PHILOSOPHY.md` — Duality framework
- `docs/STUDIO_GUIDE.md` — Studio modes guide
- `docs/ideology.md` — Design philosophy
- `docs/contribution.md` — Contribution guidelines

### Code Files
- `backend/server.js` — All API routes
- `engine/*.js` — Rule-based intelligence
- `ai/*.js` — AI provider abstraction
- `ml-service/*.py` — Semantic analysis
- `frontend/src/pages/*.jsx` — Page components
- `frontend/src/components/*.jsx` — UI components
- `frontend/src/styles/global.css` — Design tokens

---

**Compiled**: April 23, 2026  
**Specification Version**: Complete  
**Status**: Ready for development + implementation verification

This document represents the authoritative specification against which actual implementation can be compared.
