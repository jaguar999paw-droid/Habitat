# HABITAT MODERNIZATION PLAN
**Date**: May 1, 2026  
**Version**: 1.0  
**Status**: Planning Phase

---

## EXECUTIVE SUMMARY

Transform the sci-songwriting-engine into **Habitat** — a fully integrated, locally-executable identity-mapping songwriting engine with:
- **Zero paid API dependency** for local testing (fallback to rule-based generation)
- **Clean separation of concerns** (AI, ML, User Attributes, Engine, API)
- **Intent-driven endpoints** (Hook Book & Journal as primary identity sources)
- **Unified Cockpit interface** with visual elegance (animations, hexagons, charts)
- **Unbiased identity capture** (best practices for authentic user profiling)

---

## PHASE 1: ARCHITECTURE & INFRASTRUCTURE

### 1.1 Directory Rename & Reference Update
**Goal**: Formalize name as `Habitat` across all systems  
**Task**: Rename `/home/kamau/sci-songwriting-engine` → `/home/kamau/Habitat`  
**Affected Files**:
- `package.json` (name, scripts, paths)
- `README.md` (clone instructions, paths)
- `START.sh` (working directory references)
- `TEST_ENDPOINTS.sh` (working directory references)
- `frontend/src/pages/*.jsx` (imports, asset paths)
- `backend/server.js` (session storage paths)
- `ml-service/startup.sh` (working directory)
- All `.md` documentation (internal references)
- GitHub URLs in comments/docs → update to habitat references

**Status**: Pending

---

### 1.2 Separation of Concerns — Architecture Boundaries
**Goal**: Clean, independent module responsibilities  

#### Current Issues
```
❌ AI generation (generator.js) tightly coupled to specific prompt formats
❌ ML service (Python) not well-separated from identity parsing logic
❌ User input (Journal, HookWorksheet) creates intermediate state
❌ Engine modules don't have formalized interfaces
```

#### Solution: CLEAR BOUNDARIES
```
┌─────────────────────────────────────────────────────────┐
│ 1. USER INTENT LAYER                                    │
│   • Journal endpoint → emotional truth capture          │
│   • Hook Book endpoint → lyrical intent capture         │
│   • Identity Config endpoint → explicit attribute setup │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. ENGINE LAYER (Pure JS, No I/O)                       │
│   • identityParser.js → user input → raw signals        │
│   • personaBuilder.js → signals → structured persona    │
│   • messageExtractor.js → persona → core message        │
│   • structurePlanner.js → message → song structure      │
│   • styleMapper.js → persona + overrides → style rules  │
│   • temporalParser.js → PIRE classification             │
│   • propertyTensionEngine.js → conflict detection       │
│   • dualityEngine.js → what vs what-not reasoning       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. ML LAYER (Python, Optional Acceleration)             │
│   • emotion_model.py → semantic emotion scoring         │
│   • conflict_model.py → conflict classification         │
│   • trait_model.py → poetic/streetwise/spiritual        │
│   • language_model.py → EN/SW/Sheng detection           │
│   Interface: /ml/analyze (async, ~500ms timeout)        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. AI LAYER (Claude/OpenAI, Optional)                   │
│   • promptBuilder.js → assemble section prompts         │
│   • generator.js → call AI provider OR rule-based gen   │
│   Fallback: Rule-based generation (no API required)     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. API LAYER (Express, Port 3001)                       │
│   • /api/journal/* → Journal features                   │
│   • /api/hookbook/* → Hook Book features                │
│   • /api/identity/* → Identity config                   │
│   • /api/generate → Song generation                     │
│   • /api/studio/* → Studio modes                        │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:
- [x] Formalize interfaces for each module (add JSDoc comments)
- [ ] Create `backend/layers/` directory for explicit layer code
- [ ] Add validation middleware for layer boundaries
- [ ] Document valid data flow (no backward calls)

**Status**: Pending implementation

---

## PHASE 2: INTENT ENDPOINTS

### 2.1 Journal as Intent Endpoint
**Current State**: JournalPage.jsx is UI-only, synthesis happens client-side  
**Target State**: `/api/journal/` endpoints manage full journal lifecycle

#### New Endpoints
```
POST /api/journal/entries
  Input:  { text, emotions: string[], promptIdx, timestamp }
  Output: { entryId, processed, stored }
  Purpose: Save single journal entry with metadata

GET /api/journal/entries?limit=30&skip=0
  Output: [{ entryId, text, emotions, metadata, synthesis }]
  Purpose: Retrieve entry history with synthesis

POST /api/journal/synthesize
  Input:  { entryIds: string[] } or empty for last 7
  Output: {
    coctkpitPrefill: { mainIdea, emotionalTruth, socialConflict, subThemes, ... },
    archetypeRecommendation: string,
    temporalProfile: { past, present, future },
    contradictions: [{ claim1, claim2, type }],
    emotionTrajectory: { last7Days, trend }
  }
  Purpose: Synthesize entries → Cockpit pre-population

POST /api/journal/contradiction-detect
  Input:  { entries: string[] }
  Output: { contradictions: [{ type, claim1, claim2, resolution }] }
  Purpose: Detect logical tensions (engine for structure)
```

**Implementation File**: `backend/routes/journalRoutes.js`

**Status**: Pending

---

### 2.2 Hook Book as Intent Endpoint
**Current State**: HookWorksheet.jsx is UI-only, separate reference analysis  
**Target State**: `/api/hookbook/` fully manages hook strategy

#### New Endpoints (additions to existing)
```
POST /api/hookbook/strategy
  Input:  { hookTypes: string[], wordCount: 2-12, peakLocation, references: [] }
  Output: {
    strategy: { themes, intensity, peakTiming },
    validation: { feasibility, notes },
    rhymeSchemeRecommendation: string
  }
  Purpose: Validate hook strategy before generation

POST /api/hookbook/reference-analysis
  Input:  { lyrics: string, artist?, title? }
  Output: {
    scheme: string,
    devices: { alliteration, assonance, anaphora, ... },
    toneProfile: { aggression, vulnerability, wisdom },
    rhymeStyleDNA: { monosyllabic, complexity, density }
  }
  Purpose: Extract style from reference → engine input

POST /api/hookbook/coherence-batch
  Input:  { verses: [{ text, section }] }
  Output: { overallCoherence: 0-100, perVerse: [...], suggestions: [...] }
  Purpose: Full song coherence check post-generation
```

**Implementation File**: `backend/routes/hookbookRoutes.js`

**Status**: Pending

---

### 2.3 Identity Config as Intent Endpoint
**Current State**: Cockpit sliders, scattered across UI  
**Target State**: `/api/identity/` provides single source of truth

#### New Endpoints
```
GET /api/identity/config
  Output: { sliders: {...}, archetype, alterEgo, dualityMode, ... }
  Purpose: Current user identity configuration

POST /api/identity/config
  Input:  { sliders, archetype, alterEgo, perspective, languageMix, ... }
  Output: { validated, radarValues, cachedPersona, suggestions }
  Purpose: Update + validate identity configuration

POST /api/identity/6angle-profile
  Input:  { identity config }
  Output: { pastActual, pastAlt, presentActual, presentAlt, futureProjected, futureAlt }
  Purpose: Hexagonal radar values for visualization

POST /api/identity/unbiased-assessment
  Input:  { journalEntries, hookData, userSliders }
  Output: { 
    scorecard: { authenticity, consistency, depth, nuance },
    bias: { selfFlattery, shadowDenial, narrativeStability },
    recommendations: [...]
  }
  Purpose: Objective identity quality metrics
```

**Implementation File**: `backend/routes/identityRoutes.js`

**Status**: Pending

---

## PHASE 3: UNIFIED COCKPIT INTERFACE

### 3.1 Current Problems
```
❌ 6-step flow feels linear, not unified
❌ Journal + HookWorksheet are separate pages (context switching)
❌ Hexagonal radar (IdentityRadar.jsx) exists but isolated
❌ No real-time visual feedback on identity choices
❌ Persona sliders don't have live charts/graphs
```

### 3.2 Target: Cockpit v5 Unified Design
**Structure**: Single page, 4 concurrent input zones + visual feedback area

```
┌──────────────────────────────────────────────────────────────────┐
│  COCKPIT v5 — HABITAT UNIFIED IDENTITY INTERFACE                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ZONE 1: JOURNAL CAPTURE (LEFT)                                  │
│  ┌────────────────────────┐                                      │
│  │ [Quick Prompt]         │  ZONE 2: HOOK STRATEGY (RIGHT)      │
│  │ [Free-write area]      │  ┌──────────────────────┐            │
│  │ [Emotion breadcrumbs]  │  │ [Hook types]         │            │
│  │ [Save button]          │  │ [Reference slots]    │            │
│  └────────────────────────┘  │ [Peak location]      │            │
│                              │ [Hook phrase]        │            │
│  ZONE 3: IDENTITY CONFIG     │ [Analyze button]     │            │
│  (MIDDLE)                    └──────────────────────┘            │
│  ┌────────────────────────────────┐                              │
│  │ [Archetype selector]           │  ZONE 4: VISUAL FEEDBACK     │
│  │ [Emotion grid]                 │  (CENTER-RIGHT)              │
│  │ [Sliders: Rawness, etc]        │  ┌──────────────────────┐    │
│  │ [Language toggles]             │  │ Hexagon Radar        │    │
│  │ [Rhyme scheme buttons]         │  │ (6-angle identity)   │    │
│  │ [Alter-ego picker]             │  │                      │    │
│  │ [Duality toggle + input]       │  │ Charts:              │    │
│  │                                │  │ • Emotion timeline   │    │
│  └────────────────────────────────┘  │ • Trait distribution │    │
│                                       │ • Language mix       │    │
│                                       │ • Coherence score    │    │
│                                       └──────────────────────┘    │
│                                                                  │
│  BOTTOM: PERSONA LIVE BAR (always visible)                      │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Archetype: [display] | Emotion: [badge] | Language: [pills] │  │
│  │ Raw: [meter] | Decision: [meter] | Updated: [time ago]      │││
│  │ [← BACK] [CLEAR] [CONTINUE →]                                │││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Key Changes**:
1. All 4 input zones visible at once (no tabs/pagination)
2. Real-time hexagon + charts update as user types
3. Journal & Hook Book integrated (not separate pages)
4. Persona Live Bar shows current state + quick actions
5. Smooth animations on all visual updates

**Implementation**:
- [ ] Create `frontend/src/pages/CockpitV5.jsx` (new unified cockpit)
- [ ] Add real-time chart components: `EmotionTimeline.jsx`, `TraitDistribution.jsx`, `LanguageMixChart.jsx`
- [ ] Update App.jsx flow: Landing → CockpitV5 → CockpitPreview → Generator → SongDisplay
- [ ] Remove old pages: JournalPage.jsx, HookWorksheet.jsx, Cockpit.jsx

**Status**: Pending

---

## PHASE 4: OVERLAPPING COMPONENT CLEANUP

### 4.1 Hexagonal Interface Analysis
**File**: `frontend/src/components/IdentityRadar.jsx`

**Current**: 6-axis radar chart (good!)  
**Overlap Issues**:
- Axis labels sometimes overlap with data path at edges
- Tooltip positioning can go off-screen
- Color scheme not consistent with rest of UI

**Improvements**:
- [x] Add dynamic label positioning (repel if overlapping)
- [x] Smart tooltip placement (4-direction priority)
- [x] Animation smoothing on value changes
- [x] Accessibility: ARIA labels + keyboard navigation

**Status**: Pending optimization

---

### 4.2 Component Duplication Audit
**Found**:
- `IdentitySliders.jsx` + `KnobSlider.jsx` do similar things (both are range inputs)
  - Fix: Make `KnobSlider` the canonical component, deprecate `IdentitySliders`
- `EmotionGrid.jsx` (single select) + future emotion selector in Journal
  - Fix: Make `EmotionGrid` accept multi-select mode
- `PersonaCard.jsx` + `PersonaLiveBar.jsx` both display persona (redundant?)
  - Fix: Keep `PersonaLiveBar` (persistent), retire `PersonaCard` (inline display)

**Consolidation Tasks**:
- [ ] Update `KnobSlider` to be universal range input
- [ ] Update `EmotionGrid` prop: `multiSelect` boolean (default: false)
- [ ] Remove unused `PersonaCard.jsx` imports
- [ ] Audit other potential duplicates

**Status**: Pending

---

## PHASE 5: VISUAL IMPROVEMENTS & ANIMATIONS

### 5.1 Current State
```
✓ Glitch text effect (GlitchText.jsx)
✓ Waveform animations (mentioned in docs)
✗ No smooth transitions between states
✗ No loading state animations
✗ Charts/graphs are described but not implemented
✗ No visual hierarchy in complex inputs
```

### 5.2 Improvements to Implement
1. **State Transition Animations**
   - Fade + scale when sections change
   - Pulse effect on "updated" indicator
   - Smooth meter animations (ease-out)

2. **Chart Visualizations**
   - `EmotionTimeline.jsx` — line chart of emotions over 30 days
   - `TraitDistribution.jsx` — radar/spider chart of 4 traits
   - `LanguageMixChart.jsx` — pie/donut chart of EN/SW/SH mix
   - `CoherenceScoreMeter.jsx` — radial progress indicator

3. **Loading States**
   - Skeleton loaders for async data
   - Pulsing orbs during analysis
   - Progress indicators for ML calls

4. **Visual Hierarchy**
   - Color coding for zones (Journal: cool, Hook: warm, Identity: neutral)
   - Icon badges for archetype + emotion
   - Glow effect on active input zone

**Implementation Files**:
- `frontend/src/components/EmotionTimeline.jsx`
- `frontend/src/components/TraitDistribution.jsx`
- `frontend/src/components/LanguageMixChart.jsx`
- `frontend/src/components/CoherenceScoreMeter.jsx`
- `frontend/src/styles/animations.css`

**Status**: Pending

---

## PHASE 6: UNBIASED IDENTITY CAPTURE

### 6.1 Current Capture Methods
```
Journal free-write (good)
Emotion tags (good)
Archetype selection (manual, can be self-flattering)
Sliders (0-100, subject to bias)
Reference lyrics (good)
```

### 6.2 Identity Capture Scorecard
**Metrics to Measure**:
1. **Authenticity** — How honest vs. performed?
   - Signal: Language consistency (journal vs. slider claims)
   - Signal: Emotion distribution (spikes vs. flat)
   - Signal: Reference selection (aspirational vs. visceral)

2. **Consistency** — How internally coherent?
   - Signal: PIRE contradictions detected
   - Signal: Archetype matches emotion labels
   - Signal: Sub-themes repeat across entries

3. **Depth** — How specific vs. generic?
   - Signal: Journal word count + emotional vocabulary
   - Signal: Reference citations (named vs. "a song")
   - Signal: Hook phrase specificity (unique words vs. clichés)

4. **Nuance** — How complex vs. binary?
   - Signal: Duality entries (what + what-not)
   - Signal: Temporal distribution (not all past/future)
   - Signal: Archetype complexity (not single axis)

**Implementation**:
- [ ] Add `/api/identity/scorecard` endpoint
- [ ] Implement each metric as scoring function
- [ ] Return recommended actions to improve each metric
- [ ] Show scorecard in CockpitV5 visual feedback area

**Status**: Pending

---

### 6.3 Bias Reduction Strategies
```
1. CONFRONTATIONAL PROMPTS (existing)
   Keep journal prompts challenging: "Who are you NOT?" not "Tell us about yourself"

2. REFERENCE VALIDATION
   Require 2+ references for rhyme style confirmation
   Cross-reference from different genres (don't allow all sad songs)

3. SLIDER ANCHORING
   Instead of "Rawness: —[====]—", show examples:
   "Polished" (Ye, production-focused)
   ← Honest (Drake, introspective) →
   "Unfiltered" (Open Mike Eagle, raw bars)

4. TEMPORAL BALANCE CHECK
   If user fills only "past," suggest present/future entries
   If user fills only "future aspiration," ask about present reality

5. DUALITY REQUIREMENT (optional)
   "What are you becoming?" paired with "What are you refusing?"
   Forces user to acknowledge shadow

6. CONTRADICTION FLAGGING
   Journal: "I'm strong" (day 1) → "I'm so weak" (day 3)
   Engine: "These seem contradictory. Intentional or growth?"
```

**Implementation**: Backend identity validation middleware

**Status**: Pending

---

## PHASE 7: LOCAL-FIRST CONFIGURATION

### 7.1 Current Issue
```
No paid API key → engine cannot generate → user stuck
Claude API is expensive ($0.003/1K input, $0.015/1K output)
```

### 7.2 Solution: Graceful Degradation
```
IF user provides API key:
  ✓ Use Claude/OpenAI (best quality)
ELIF .env has local key:
  ✓ Use it (developer/paid tiers)
ELSE:
  ✓ Use rule-based fallback generation
  ✓ Show "Generated without AI (preview mode)"
```

**Rule-Based Generation Strategy**:
1. **Templates + Persona**
   - 8 conflict types × 3 song structures = 24 templates
   - Example: "Defiant" + "Transformation" → template_defiant_transformation.txt
   - Templates use {{mustache}} syntax for persona substitution

2. **Vocabulary Injection**
   - Extract words from journal entries
   - Extract rhyme scheme from references
   - Use thesaurus for synonyms (songwriting-tuned)
   - Maintain rhyme scheme automatically

3. **Quality Metrics**
   - Scan generated lyrics against clichés database
   - Ensure vocabulary matches persona (streetwise words for street persona)
   - Verify syllable stress patterns match meter
   - Replace weak lines with alternatives

**Implementation**:
- [ ] Create `engine/fallbackGenerator.js` with 24 templates
- [ ] Add vocabulary extraction to `identityParser.js`
- [ ] Create `backend/routes/generateFallback.js`
- [ ] Update `ai/generator.js` to call fallback if no API key

**Files**:
```
engine/
  ├── fallbackGenerator.js (main logic)
  ├── templates/
  │   ├── defiant_conflict_rise.txt
  │   ├── defiant_conflict_surrender.txt
  │   ├── wounded_conflict_transformation.txt
  │   ... (24 total)
  ├── vocabularies/
  │   ├── cliches.txt (words to avoid)
  │   └── streetwise.txt (for street personas)
  └── rhymeSchemes/
      └── rhymeLib.js (precomputed rhymes)
```

**Status**: Pending

---

## PHASE 8: BACKEND METRICS & UNBIASED IDENTITY

### 8.1 Current Data Capture
```
✓ Identity parsing (emotions, conflicts, traits)
✓ Temporal profile (past/present/future weights)
✗ Source quality scoring
✗ Comparative analysis (vs. user's typical patterns)
✗ Bias detection & flagging
```

### 8.2 Enhanced Capture Schema
**Database**: Add fields to session storage

```javascript
{
  sessionId: uuid,
  timestamp: Date,
  user_input: {
    journal_entries: [{ text, emotions, timestamp, coherence_score }],
    hook_strategy: { types, references, peak_location },
    identity_config: { archetype, sliders, language_mix },
  },
  analysis: {
    parsed_identity: { emotions, conflicts, traits },
    temporal_profile: { past, present, future },
    message: { core_message, sub_themes },
  },
  metrics: {
    authenticity_score: 0-100,
    consistency_score: 0-100,
    depth_score: 0-100,
    nuance_score: 0-100,
    bias_flags: [
      { type: "self_flattery", severity: "high", claim: "..." },
      { type: "shadow_denial", severity: "medium", claim: "..." },
    ],
  },
  recommendations: [
    "Explore more future-focused entries (currently 30% future)",
    "Consider what you're refusing (strong 'what' but no 'what-not')",
  ],
}
```

**Implementation**:
- [ ] Extend session storage schema
- [ ] Add scoring functions to `engine/metrics.js`
- [ ] Create `/api/metrics/session` endpoint
- [ ] Integrate into CockpitV5 visual feedback

**Status**: Pending

---

## PHASE 9: DOCUMENTATION & TESTING

### 9.1 Documentation Updates
- [ ] Update README.md with Habitat branding
- [ ] Create SETUP_LOCAL.md (run without paid API)
- [ ] Create ARCHITECTURE_V4.md (new clean layer structure)
- [ ] Create INTENT_ENDPOINTS.md (Journal, Hook Book, Identity APIs)
- [ ] Create BIAS_REDUCTION.md (capture best practices)

### 9.2 Testing Strategy
```
Unit Tests:
  ✓ Each engine module (identity parsing, persona building, etc.)
  ✓ Fallback generation logic
  ✓ Metrics scoring functions

Integration Tests:
  ✓ Journal → Hook Book → Cockpit flow
  ✓ All intent endpoints → Generator
  ✓ Fallback generator (no API key)

E2E Tests:
  ✓ Full flow: Landing → CockpitV5 → Song display
  ✓ Local-only mode (no Claude/OpenAI)
  ✓ Metrics & bias detection
```

**Status**: Pending

---

## IMPLEMENTATION ROADMAP

### Week 1: Foundation
- [ ] Directory rename: sci-songwriting-engine → Habitat
- [ ] Update all path references across codebase
- [ ] Separate concerns: Create layer boundaries
- [ ] Implement `/api/journal/*` endpoints

### Week 2: Endpoints & Backend
- [ ] Implement `/api/hookbook/*` endpoints
- [ ] Implement `/api/identity/*` endpoints
- [ ] Add identity metrics & bias detection
- [ ] Set up fallback generation

### Week 3: Frontend & UI
- [ ] Build CockpitV5 unified interface
- [ ] Implement chart components
- [ ] Add animations & visual feedback
- [ ] Remove old page structure (Journal, Hook Worksheet)

### Week 4: Polish & Testing
- [ ] Component consolidation & cleanup
- [ ] Full E2E testing
- [ ] Documentation update
- [ ] Performance optimization

---

## SUCCESS METRICS

✅ User can run Habitat locally without paid API (fallback works)  
✅ All 4 input zones visible in unified Cockpit (no page switching)  
✅ Identity Radar + charts update in real-time  
✅ Journal & Hook Book are proper API endpoints  
✅ Identity metrics show authenticity/consistency/depth/nuance scores  
✅ No component duplication (KnobSlider consolidation)  
✅ Directory fully renamed to Habitat  
✅ Song generation works with or without Claude API  

---

## NOTES & CONSTRAINTS

- **Backward Compatibility**: Old session files should still load (migration script if needed)
- **Performance**: Real-time hexagon + chart updates must not lag (debounce inputs to 300ms)
- **Accessibility**: All new components need ARIA labels + keyboard nav
- **Testing**: No breaking changes to existing endpoints; add new routes instead
- **Data Privacy**: No session data sent outside local machine (except optional to Claude API)

