# SCI Journalling Features — Identity Knowledge Acquisition Through Reflective Writing

## Overview
Journalling in SCI is not note-taking; it is **structured identity excavation** through confrontational prompts and progressive self-interrogation. Each journal entry feeds into the songwriting engine by surfacing emotional truth, identifying belief contradictions, and tracking identity evolution over time.

---

## Core Journalling Principles

### 1. Confrontational Questions (Identity Interrogation)
Unlike passive journaling, SCI's journal prompts are **confrontational by design**:
- "Who are you NOT?" — Rejection clarifies essence
- "What are you carrying?" — Emotional payload discovery
- "When did you become this?" — Temporal origins
- "Where does it hurt?" — Emotional geography
- "Why is this yours to carry?" — Meaning extraction
- "How do you defend it?" — Identity armor

**Integration Goal:** Journal entries prime the engine's `/api/analyze` endpoint with rich emotional context. Each entry populates `answers.emotionalTruth` and `answers.socialConflict` fields.

---

## Journalling Features — Two-Tier Architecture

### TIER 1: Rapid Capture (Real-Time Stream)
**Purpose:** Low-friction emotional expression without self-censorship.

| Feature | How It Works | Engine Input |
|---------|-------------|--------------|
| **Free-write timer** | Timed 5–15 min prompts; auto-save every 30s | Raw text → `parseIdentity()` |
| **Emotion breadcrumbs** | Click emoji/keyword while writing to tag feelings in-stream | Emotion signal → weighting |
| **Reference detection** | Paste a lyric that moved you; auto-detect rhyme + tone | `referenceAnalyzer.js` input |
| **Word count health** | "Your truth meter: 342 words in this session" | Signal when entry is ripe for analysis |
| **Voice-to-text** | Speak answers; engine transcribes + analyzes | Raw speech → identity signals |

**Why this is essential:**
- Authenticity: Unedited emotion > polished self-narrative
- Velocity: 5 min of freewriting = data equivalent of 20 min of forms
- Continuity: Journal becomes a living feed of identity evolution

---

### TIER 2: Structured Analysis (Weekly Reflection)
**Purpose:** Integrate journal entries into identity model; detect patterns and contradictions.

| Feature | How It Works | Engine Integration |
|---------|-------------|------------------|
| **Weekly synthesis** | AI reads last 7 journal entries + summarizes key tension/growth | Feeds `identityConfig.past`, `identityConfig.present`, `identityConfig.future` |
| **Temporal classifier (PIRE)** | Entries auto-tagged: Past (memory/old pain), Present (current state), Future (aspiration) | `temporalParser.js` conflict detection |
| **Contradiction detector** | Highlights logical gaps: "I want freedom" vs "I stay trapped" | `propertyTensionEngine` feeds into song structure |
| **Emotion trajectory** | Graph last 30 days: anger↑ sadness↓ hope→ | Energy + rawness override suggestions |
| **Archetype drift** | "You've moved from [Rebel] to [Sage] — your song voice should shift too" | Persona recommendation |
| **Sub-theme extraction** | "Society, Roots, Transformation appear 8x this week" | `message.subThemes` seed-ing |

**Why two tiers matter:**
- Tier 1 captures unfiltered feeling (low cognitive load, authenticity)
- Tier 2 makes patterns visible (the engine's insight, not the user's effort)
- Together: rapid emotional input + intelligent synthesis

---

## Integration Points: Journalling → Song Engine

### Entry Point 1: Direct Cockpit Injection
```
User writes in Journal
    ↓ (weekly AI read + synthesis)
    ↓
Cockpit opens with pre-populated fields:
  - emotionalTruth: "Synthesized from 7 entries"
  - subThemes: [auto-detected themes]
  - identityConfig: { past, present, future }
  ↓
User refines/edits/ignites
    ↓
/api/analyze → /api/generate
```

### Entry Point 2: Reference Chain
```
Journal entry mentions a lyric: "That Kendrick bar saved me"
    ↓
referenceAnalyzer detects it
    ↓
Rhyme scheme, vocabulary, tone extracted
    ↓
styleMapper uses reference as style anchor
    ↓
Generated song echoes same structural DNA
```

### Entry Point 3: Tension-Driven Structure
```
Temporal parser detects:
  Past: "I was swallowed by shame"
  Present: "I'm learning to breathe"
  Future: "I will speak my truth"
    ↓
Conflict type determined (TRANSFORMATION)
    ↓
structurePlanner injects bridge_transformation + call_and_response
    ↓
Song structure literally mirrors journal evolution
```

---

## Feature Workflow: Journalling Session

### Phase 1: Prompt (0–2 min)
```
"Who Are You NOT?"
[emoji selection: identity rejections]
"I am not my family's shame.
I am not the things I've survived.
I am not the girl they trained me to be."
```
**Engine sees:** Rejection patterns, identity armor, authority conflict

### Phase 2: Capture (2–7 min)
```
Free-write timer running.
User types emotional truth.
Optional: Click 🔥 (anger), 💔 (sadness), 💪 (defiance) while typing.
System tags emotions in real-time.
```
**Engine learns:** emotion distribution, temporal markers (past/present/future language)

### Phase 3: Reference (7–9 min)
```
"Kendrick says: 'I got a right to be hostile'
That line. That's me. Every. Day."
```
**Engine analyzes:** Kendrick's rhyme scheme is internal + metaphor-dense. Note for later.

### Phase 4: Auto-Save & Synthesis (9–10 min)
```
Entry saved to localStorage + backend
30-entry rolling window analyzed
AI report: "This week you've written about 
             belonging 12x, identity 8x, 
             resistance 6x. Primary emotion: 
             defiance. Trajectory: anger→clarity."
```
**Engine prepares:** Overrides for next song generation

---

## Identity Knowledge Acquisition — The Full Loop

### What the Journal + Engine reveal together:

1. **Emotional Baseline**
   - Which emotions dominate your writing?
   - How do they shift day-to-day?
   - What triggers intensity?

2. **Core Conflict**
   - What contradictions appear repeatedly?
   - What belief systems clash in your journal?
   - Where is your wound?

3. **Identity Archetypes**
   - Which persona archetype emerges from your entries?
   - Do you code-switch between personas?
   - How does your voice change by context?

4. **Communication DNA**
   - Vocabulary register (formal/street/poetic)?
   - Metaphor patterns (violence, nature, intimacy)?
   - Grammar intentionality (fragmented vs. flowing)?
   - What literary references recur?

5. **Temporal Strata**
   - What past haunts you most?
   - What present struggle is acute?
   - What future do you claim?

6. **Language Mix**
   - Do you code-switch English ↔ Kiswahili ↔ Sheng?
   - In what emotional contexts?
   - How should your song reflect this?

### The Output: A Living Identity Profile
```json
{
  "primaryArchetype": "Defiant",
  "emotionalProfile": {
    "dominant": { "emotion": "defiance", "frequency": 0.42 },
    "secondary": { "emotion": "longing", "frequency": 0.28 },
    "shadow": { "emotion": "shame", "frequency": 0.18 }
  },
  "coreConflict": "TRANSFORMATION (past servitude → present agency → future leadership)",
  "languageMix": ["EN", "SW", "SH"],
  "literaryDNA": {
    "rhymePreference": "INTERNAL (multisyllabic, semantic)",
    "metaphorDomain": "VIOLENCE + NATURE",
    "paceSignature": "STACCATO (short lines, interruption, fragments)"
  },
  "temporalProfile": {
    "past": "systemic oppression, childhood constraint",
    "present": "identity reclamation, boundary-setting",
    "future": "community leadership, legacy-building"
  },
  "identityTensions": [
    { "property": "autonomy", "contradiction": "I demand freedom yet self-sabotage" },
    { "property": "belonging", "contradiction": "I crave connection yet protect isolation" }
  ]
}
```

---

## Implementation Roadmap for Journalling Feature

### MVP (Week 1–2)
- [ ] **JournalEntry.jsx** — Simple free-write form with 5–15 min timer
- [ ] **localStorage integration** — Save entries with timestamp + emotion tags
- [ ] **Weekly synthesis route** — `POST /api/journal/synthesize` reads last 7 entries, returns summary
- [ ] **Route in Cockpit** — "Start here: Journal Entry" tab before Cockpit

### Phase 2 (Week 3–4)
- [ ] **Emotion breadcrumbs** — Click-to-tag during writing
- [ ] **Temporal classifier** — Auto-detect past/present/future language
- [ ] **Reference detection** — Paste lyrics, auto-analyze rhyme + tone
- [ ] **Journal → Cockpit prepopulation** — Next button injects synthesis into Cockpit fields

### Phase 3 (Week 5–6)
- [ ] **Weekly trends screen** — Graph emotion trajectory, archetype drift
- [ ] **Contradiction detector** — Flag logical tensions across entries
- [ ] **Voice-to-text option** — Accessibility + authenticity
- [ ] **Export journal** — PDF with synthesis + identity profile snapshot

---

## Why This Matters for Identity Knowledge Acquisition

**Traditional songwriting:** "Write what you feel." (Vague, inconsistent)

**SCI Journalling:** "Write freely → System reveals patterns you didn't know existed → You conscious-raise yourself → Song becomes excavation, not generation."

The journal is not a side feature. **It is the engine's primary data source.** Every prompt, every emotion tag, every reference is signal. The system learns who you are by reading what you write, not what you tell it you are.

---

*Last updated: 2026-04-21 | Part of SCI v2 Identity Knowledge Acquisition Suite*
