# HABITAT ARCHITECTURE v4 — CLEAN SEPARATION OF CONCERNS

**Date**: May 1, 2026  
**Status**: Blueprint  
**Scope**: Formalize layer boundaries and data flow

---

## The 5-Layer Model

```
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1: USER INTENT CAPTURE                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Journal UI (Component)  → POST /api/journal/entries             │ │
│ │ Hook Book UI            → POST /api/hookbook/strategy          │ │
│ │ Identity Config UI      → POST /api/identity/config            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Responsibility: Accept raw user input (structured)                   │
│ Output: { text, emotions, hookTypes, archetype, sliders, ... }      │
│ CONSTRAINT: No processing, no I/O, no logic                          │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 2: ENGINE (Pure JavaScript, No I/O)                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ identityParser.js       → parseIdentity(answers, overrides)     │ │
│ │ personaBuilder.js       → buildPersona(parsed)                  │ │
│ │ messageExtractor.js     → extractMessage(persona)               │ │
│ │ structurePlanner.js     → planStructure(message, conflict)      │ │
│ │ styleMapper.js          → mapStyle(persona, overrides)          │ │
│ │ temporalParser.js       → parseTemporalIdentity(text)           │ │
│ │ propertyTensionEngine.js→ detectPropertyTensions(persona)       │ │
│ │ dualityEngine.js        → analyzeDuality(what, whatNot)         │ │
│ │ referenceAnalyzer.js    → analyzeReference(lyrics)              │ │
│ │ fallbackGenerator.js    → generateWithoutAI(persona, style)    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Responsibility: Pure signal processing (no external calls)           │
│ Input: Structured user intent                                        │
│ Output: Persona, message, structure, style (deterministic)           │
│ CONSTRAINT: No API calls, no I/O, no network requests                │
│ INVARIANT: Same input → always same output                           │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 3: ML SERVICE (Python, Optional Acceleration, ~500ms timeout)  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ /ml/analyze             → emotionModel, conflictModel           │ │
│ │ /ml/embed               → traitModel                            │ │
│ │ /ml/language-detect     → languageModel                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Responsibility: Fast semantic analysis (can fail gracefully)        │
│ Input: Text samples                                                  │
│ Output: Scores, classifications, embeddings                         │
│ CONSTRAINT: 500ms timeout (fallback to rule-based if slow)           │
│ INVARIANT: Failures are non-blocking                                 │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 4: AI GENERATION (Claude/OpenAI OR Rule-Based Fallback)       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ promptBuilder.js        → buildPrompt(persona, message, section)│ │
│ │ generator.js            → generateWithAI(...) OR fallback        │ │
│ │ fallbackGenerator.js    → generateWithoutAI(...) [rule-based]   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Responsibility: Produce song text (AI or rule-based)                │
│ Input: Persona, message, section type, style rules                  │
│ Output: Lyrics (string)                                             │
│ CONSTRAINT: API key optional (fallback always works)                 │
│ INVARIANT: Always produces output (AI → fallback)                    │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 5: API & PERSISTENCE (Express, Port 3001)                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ /api/health             → Health check                          │ │
│ │ /api/journal/*          → Journal CRUD + synthesis              │ │
│ │ /api/hookbook/*         → Hook Book analysis + strategy         │ │
│ │ /api/identity/*         → Identity config + metrics             │ │
│ │ /api/generate           → Full song generation                  │ │
│ │ /api/section            → Single section generation             │ │
│ │ /api/studio/*           → Studio modes                          │ │
│ │ /api/sessions           → Session management                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Responsibility: HTTP interface + storage orchestration              │
│ Input: HTTP requests                                                │
│ Output: JSON responses + persisted state                            │
│ CONSTRAINT: No business logic, orchestration only                    │
│ INVARIANT: Stateless (all state in storage or request)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DATA FLOW RULES

### Rule 1: No Backward Calls
```
❌ FORBIDDEN:
   promptBuilder.js → identityParser.js (framework logic calling engine)
   generator.js → analyzeReference() (AI layer depending on engine helpers)

✓ ALLOWED:
   /api/analyze → identityParser.js (route calls engine)
   promptBuilder.js → mapStyle() (same layer function)
   generator.js → /ml/analyze (layer calls next layer down)
```

### Rule 2: Layer Transitions Have Contracts
```
LAYER 2 INPUT CONTRACT (Engine):
{
  answers: { whoAreYouNot, emotionalTruth, socialConflict, mainIdea, referenceText },
  overrides: { rawness, rhymeScheme, archetype, sliders, craft, ... },
  inferenceOverrides: { ... }
}

LAYER 2 OUTPUT CONTRACT (Engine):
{
  persona: { archetype, emotion, traits, voice, language, ... },
  message: { coreMessage, subThemes, temporalProfile, ... },
  structure: { sections: [...], conflictType, tension, ... },
  style: { rhymeScheme, devices, meter, diction, ... }
}

LAYER 4 INPUT CONTRACT (AI Generation):
{
  prompt: string,
  persona: {...},
  section: { type, number, guidance },
  style: {...}
}

LAYER 4 OUTPUT CONTRACT (AI Generation):
{
  lyrics: string,
  source: 'claude' | 'openai' | 'fallback',
  quality: 0-100
}
```

### Rule 3: Error Handling Per Layer

**Layer 2 (Engine)**: Never fails
```javascript
if (failed_to_parse) return fallback_persona
```

**Layer 3 (ML)**: Fails gracefully
```javascript
try { const result = await ml_call(500ms_timeout); return result; }
catch { return rule_based_fallback(); }
```

**Layer 4 (AI)**: Fails with fallback
```javascript
if (!api_key) return fallback_generator(persona, style);
try { return await claude_generate(...); }
catch { return fallback_generator(persona, style); }
```

**Layer 5 (API)**: Propagates errors clearly
```javascript
res.status(error.code).json({ error: error.message, fallback: true })
```

---

## ENDPOINT INTERFACE CONTRACTS

### Journal Endpoints

#### POST /api/journal/entries
```javascript
REQUEST:
{
  text: string (required, min 10 chars),
  emotions: string[] (required, each in EMOTION_TAGS),
  promptIdx: number (required, 0-6),
  timestamp: number (optional, defaults to Date.now())
}

RESPONSE:
{
  entryId: uuid,
  stored: boolean,
  metadata: {
    wordCount: number,
    emotionCount: number,
    languageDetected: 'en'|'sw'|'sh',
    temporalMarkers: { past, present, future } (0-1 each)
  }
}

ERROR:
{ error: string, code: 400|500 }
```

#### GET /api/journal/entries?limit=30&skip=0
```javascript
REQUEST: Query parameters (optional)

RESPONSE:
{
  entries: [
    {
      entryId: uuid,
      text: string,
      emotions: string[],
      timestamp: number,
      metadata: {...},
      synthesis: { coctkpitPrefill, archetypeRecommendation, temporalProfile, ... }
    }
  ],
  total: number,
  limit: number,
  skip: number
}
```

#### POST /api/journal/synthesize
```javascript
REQUEST:
{
  entryIds: string[] (optional, defaults to last 7),
  forceRefresh: boolean (optional)
}

RESPONSE:
{
  cockpitPrefill: {
    mainIdea: string,
    emotionalTruth: string,
    socialConflict: string,
    subThemes: string[],
    primaryEmotion: string,
    secondaryEmotions: string[]
  },
  archetypeRecommendation: string,
  temporalProfile: { past: 0-1, present: 0-1, future: 0-1 },
  contradictions: [
    {
      entryIds: [uuid, uuid],
      claim1: string,
      claim2: string,
      type: 'contradiction'|'contrary'|'subcontrary',
      resolution: string (suggestion)
    }
  ],
  emotionTrajectory: {
    last7Days: [{ date, dominantEmotions, score }],
    trend: 'rising'|'falling'|'stable'|'volatile'
  }
}

ERROR:
{ error: string, code: 400|500 }
```

---

### Hook Book Endpoints

#### POST /api/hookbook/strategy
```javascript
REQUEST:
{
  hookTypes: string[] (required, each in HOOK_TYPES),
  wordCount: number (2-12, required),
  peakLocation: string (required, one of PEAK_LOCATIONS),
  references: [{ lyrics, artist? }],
  emotion: string (optional)
}

RESPONSE:
{
  strategy: {
    themes: string[],
    intensity: 'low'|'medium'|'high',
    peakTiming: string,
    rhymeIntensity: 'dense'|'internal'|'consonant'|'external'
  },
  validation: {
    feasibility: 'high'|'medium'|'challenging',
    notes: string[]
  },
  rhymeSchemeRecommendation: string,
  suggestions: string[]
}
```

#### POST /api/hookbook/reference-analysis
```javascript
REQUEST:
{
  lyrics: string (required, 2+ lines),
  artist?: string,
  title?: string
}

RESPONSE:
{
  scheme: string (e.g., 'AABB', 'ABAB', 'FREE'),
  devices: {
    alliteration: number[],
    assonance: number[],
    anaphora: number[],
    epistrophe: number[],
    [... other devices]
  },
  toneProfile: {
    aggression: 0-100,
    vulnerability: 0-100,
    wisdom: 0-100,
    playfulness: 0-100
  },
  rhymeStyleDNA: {
    monosyllabic: 0-100,
    complexity: 0-100,
    density: 0-100
  },
  styleKeywords: string[]
}
```

---

### Identity Endpoints

#### POST /api/identity/config
```javascript
REQUEST:
{
  archetype: string,
  sliders: { rawness, decisiveness, attribution, vulnerability_level },
  alterEgo: string,
  perspective: '1st'|'2nd'|'3rd',
  languageMix: { en: 0-100, sw: 0-100, sh: 0-100 },
  dualityMode: boolean,
  dualityInput?: { what: string, whatNot: string }
}

RESPONSE:
{
  validated: boolean,
  radarValues: { pastActual, pastAlt, presentActual, presentAlt, futureProjected, futureAlt },
  cachedPersona: { archetype, emotion, traits, voice, ... },
  suggestions: string[]
}
```

#### POST /api/identity/unbiased-assessment
```javascript
REQUEST:
{
  journalEntries: [{ text, emotions }],
  hookData: { references: [], hookTypes: [], wordCount },
  userSliders: { rawness, decisiveness, attribution, vulnerability_level }
}

RESPONSE:
{
  scorecard: {
    authenticity: 0-100,
    consistency: 0-100,
    depth: 0-100,
    nuance: 0-100
  },
  bias: {
    selfFlattery: 'none'|'low'|'medium'|'high',
    shadowDenial: 'none'|'low'|'medium'|'high',
    narrativeStability: 'coherent'|'evolving'|'contradictory'
  },
  recommendations: [
    {
      category: 'authenticity'|'consistency'|'depth'|'nuance',
      issue: string,
      suggestion: string,
      priority: 'high'|'medium'|'low'
    }
  ]
}
```

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Week 1): Foundation
- [x] Directory rename to Habitat
- [ ] Formalize Layer 2 (Engine) module interfaces (JSDoc comments)
- [ ] Create `/backend/layers/` directory structure
- [ ] Add input validation middleware

### Phase 2 (Week 2): Intent Endpoints
- [ ] Implement `/api/journal/*` routes
- [ ] Implement `/api/hookbook/*` routes
- [ ] Implement `/api/identity/*` routes
- [ ] Add persistence layer (sessions with enhanced schema)

### Phase 3 (Week 3): Generation Fallback
- [ ] Implement `engine/fallbackGenerator.js` with 24 templates
- [ ] Update `ai/generator.js` to use fallback when no API key
- [ ] Test E2E without Claude/OpenAI

### Phase 4 (Week 4): Metrics & Frontend
- [ ] Add identity metrics to backend
- [ ] Build CockpitV5 unified interface
- [ ] Add chart components (EmotionTimeline, TraitDistribution, etc.)
- [ ] Integration testing

---

## CHECKLIST: SEPARATION OF CONCERNS

- [ ] **Layer 2 Modules**: All 10 engine modules have `@param` + `@return` JSDoc
- [ ] **No Imports Up**: Engine modules never import from AI or API layers
- [ ] **Contract Enforcement**: /api routes validate inputs against contract
- [ ] **Error Boundaries**: Each layer has fallback (ML → rule-based, AI → fallback gen)
- [ ] **State Immutability**: No module modifies input objects
- [ ] **Testing**: Each layer has unit tests independent of other layers
- [ ] **Documentation**: ARCHITECTURE_V4.md is source of truth
- [ ] **API Versioning**: All routes prefixed `/api/v4/` (allows future breaking changes)

