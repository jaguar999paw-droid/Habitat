# SCI Hook Book Songwriting — Melodic Identity & Structural Hooks for Song Impact

## Overview
The Hook Book is SCI's methodology for **identifying, crafting, and mapping melodic + lyrical hooks** that anchor a song's emotional identity. Rather than treating hooks as afterthoughts, Hook Book treats them as the **structural spine** — every section serves the hook. Identity drives the hook. The hook drives the song.

---

## Core Hook Book Principles

### What is a Hook?
Not just a catchy chorus. In SCI, a hook is:

| Hook Type | Definition | Identity Link |
|-----------|-----------|----------------|
| **Melodic Hook** | A 4–8 bar repeating melody that makes the song memorable | Energy level + vocal range of persona |
| **Lyrical Hook** | A repeated phrase/question/command that encapsulates core message | Core wound + active stance (defiance/surrender/wisdom) |
| **Structural Hook** | A section placement/pacing choice that creates impact (e.g., no chorus until minute 2) | Conflict type + temporal tension (delay for anticipation, acceleration for momentum) |
| **Reference Hook** | An embedded allusion/sample/rhyme that echoes something real the user loves | Literary DNA + emotional anchor |
| **Emotional Hook** | A specific feeling beat (vulnerability drop, defiance peak) placed for maximum catharsis | Archetype's shadow emotion |

---

## Hook Book Architecture: 3 Layers

### LAYER 1: Hook Ideation (Pre-Cockpit)
**Purpose:** Surface what already exists in the user's identity/taste/favorite songs.

| Feature | Data Flow | Engine Input |
|---------|-----------|--------------|
| **Reference lyrics paste** | User pastes 3–5 favorite song excerpts | `referenceAnalyzer.js` → rhyme scheme, vocabulary, tonal register |
| **Hook skeleton picker** | Visual templates: [Repetition], [Call-Response], [Question-Answer], [Paradox], [List] | Hooks mapped to conflict type |
| **Emotion peak locator** | "Where should this song break your heart?" | Temporal markers for structure injection |
| **Rhyme swatch** | User selects preferred rhyme style from their references | `style.rhymeScheme` override |
| **Archetype voice** | Based on persona: Does the hook sound defiant? Vulnerable? Wise? | Tone consistency check |

**Why pre-Cockpit:** Hook ideas flow from taste, not from abstract prompts. Reading lyrics the user loves reveals their sonic DNA.

---

### LAYER 2: Hook Embedding (During Cockpit)
**Purpose:** Wire hook ideas into the Cockpit overrides so the engine respects them.

| Feature | Cockpit Field | Engine Destination |
|---------|---------------|-------------------|
| **Hook theme** | Multi-select chips: [Repetition], [Ascending], [Paradox], [Call-Response], [Fragmented] | `craft.rhetoricalDevices` |
| **Hook word count** | Range slider: 3–12 words | `craft.restraint` (tight vs. expansive language) |
| **Emotional peak placement** | Pill select: [Verse-2], [Pre-Chorus], [Chorus], [Bridge] | `structurePlanner` injection logic |
| **Reference echo** | Checkbox: "Echo [Kendrick's internal rhyme style]" | `styleMapper` → rhyme weighting |
| **Rhyme intensity** | Radio: [Dense/Internal] vs [Consonant/External] | `style.rhymeScheme` specificity |

**Why Cockpit integration:** Hooks aren't spontaneous; they're engineered. The Cockpit makes hook choices explicit, visible, and reversible.

---

### LAYER 3: Hook Validation (Post-Generate)
**Purpose:** Test that generated song actually delivers the hook the user specified.

| Feature | Validation Check | Action |
|---------|-----------------|--------|
| **Hook strength meter** | Does the hook appear ≥3x in the song? Is it musically consistent? | ✅ or 🔄 Regenerate with seed |
| **Emotional integrity** | Does the hook feel like it came from the persona's core wound? | Cross-reference against journal synthesis |
| **Reference fidelity** | If user specified "echo Kendrick's style," does the rhyme scheme match? | `referenceAnalyzer` re-comparison |
| **Arch integrity** | Is the song's emotional arc (peak placement, intensity) honored? | Check against `temporalProfile` |
| **Memorability score** | Phonetic repetition, vowel patterns, semantic resonance | Highlight memorable phrases to user |

---

## Hook Categories — Mapped to SCI Archetypes

### The Defiant Hook
**Persona:** Rebel, Warrior, Dissident  
**Emotional core:** "I refuse. I will not be silenced."

| Hook Element | Example | Why It Works |
|--------------|---------|-------------|
| **Lyrical skeleton** | "I [verb of resistance] [negation]" | "I will not apologize for existing" |
| **Rhyme style** | Internal, aggressive (monosyllabic consonants) | Percussive feel matches emotional intensity |
| **Placement** | Comes EARLY (verse 1) — establishes stance immediately | No warm-up; hits listeners with assertion |
| **Repetition pattern** | Exact same phrase + variation round 2 | Drives message home without redundancy |
| **Emotional peak** | Falls on a CONSONANT cluster or plosive | "I WILL NOT" — harsh sounds reinforce defiance |

**Hook Book example:**
```
Hook theme: Repetition + Ascending
"I am not sorry.
I am not silent.
I am not theirs."

Rhyme structure: Anaphora (lines start same) + consonant punch
Placement: Verse 1 top (immediate statement)
Peak: Emotional peak on "not THEIRS" (possession rejection)
```

---

### The Vulnerable Hook
**Persona:** Healer, Sage, Romantic  
**Emotional core:** "I am undone. I admit the truth."

| Hook Element | Example | Why It Works |
|--------------|---------|-------------|
| **Lyrical skeleton** | "I [confession] [feeling]" | "I still reach for you in the dark" |
| **Rhyme style** | Assonance (vowel echoes), legato flow | Smooth, intimate; invites listener in |
| **Placement** | Mid-song (bridge area) or pre-chorus | Vulnerability requires context/trust-building |
| **Repetition pattern** | Slight variation each time (not monotonous) | Honesty feels conversational, not preachy |
| **Emotional peak** | Falls on a vowel or PAUSE (silence = vulnerability) | Emptiness mirrors emotional exposure |

**Hook Book example:**
```
Hook theme: Question-Answer
"Where do you go when I let you down?
Do you stay? Do you leave?"

Rhyme structure: Assonance (go/no/know), conversational rhythm
Placement: Bridge (vulnerability safe zone)
Peak: Emotional sustain on "stay" (vulnerability apex)
```

---

### The Wisdom Hook
**Persona:** Oracle, Mentor, Sage  
**Emotional core:** "Here is what I learned. Here is what I offer."

| Hook Element | Example | Why It Works |
|--------------|---------|-------------|
| **Lyrical skeleton** | "[Metaphor] teaches us [insight]" | "The river knows it must move or die" |
| **Rhyme style** | Compound/literary (polysyllabic, classical) | Elevated language matches wisdom register |
| **Placement** | Chorus or outro — earned authority | Wisdom credible only after emotional journey |
| **Repetition pattern** | Varied but rhythmically consistent | Each repetition adds new layer of meaning |
| **Emotional peak** | Falls on a KEY WORD (noun, verb, not article) | "RIVER," "MOVE," "DIE" carry weight |

**Hook Book example:**
```
Hook theme: Metaphor + Paradox
"The wound becomes the well.
We drink what broke us.
This is how we grow."

Rhyme structure: Slant rhyme (well/well, us/grow) — unpredictable, wise
Placement: Chorus (revealed truth)
Peak: Emotional build on "grow" (transformation complete)
```

---

## Integration: Hook Book → Song Generation Engine

### Pre-Songwrite Flow
```
1. User collects favorite lyrics (3–5 references)
   ↓
2. referenceAnalyzer detects: rhyme scheme, vocabulary level, emotional tone
   ↓
3. Hook template selector: User picks which hook shapes to aim for
   ↓
4. Emotional peak locator: "Where should the heart break? Where should we triumph?"
   ↓
5. All data compiled into overrides object:
   {
     craft: { rhetoricalDevices: ['repetition', 'internal_rhyme'] },
     style: { rhymeScheme: 'INTERNAL', dictionLevel: 'elevated' },
     structurePlanner_hints: { emotionalPeakAt: 'bridge', hookCount: 4 }
   }
   ↓
6. User enters Cockpit with hook strategy already loaded
   ↓
7. onDone() sends answers + overrides → /api/analyze
```

### During Analysis & Generation
```
/api/analyze receives hook overrides
   ↓
personaBuilder incorporates hook constraints
   ↓
messageExtractor ensures core message == hook thesis
   ↓
structurePlanner places sections to CENTER hook (verses build to it)
   ↓
styleMapper applies rhyme/diction/metaphor rules for hook
   ↓
promptBuilder sends section-specific instructions:
   "Section 1 (Verse): Establish voice, hint at defiance.
    Section 2 (Hook): EXACT PHRASE: 'I will not be silenced.'
    Rhyme style: Internal (multisyllabic).
    Section 3 (Verse): Expand on 'silencing,' build toward bridge..."
   ↓
/api/section generates with hook as anchor
   ↓
generateSection context-passes: "Remember: The hook is 'I will not be silenced.'
                                           All rhymes should echo this consonant punch."
```

### Post-Generate Validation
```
User sees full song.
Hook validation runs:
   ✅ Hook appears 4x? Yes.
   ✅ Does it feel defiant? Yes (consonant clusters, short lines).
   ✅ Placed at emotional peak? Yes (bridge + pre-chorus).
   ✅ Echoes user's reference style? Yes (internal rhyme like Kendrick).
   ↓
Display: "Hook strength: 9/10"
   ↓
User can per-section regenerate (↻) with seed param
   ↓ (if hook not satisfied)
   ↓
Song refined until hook hits target.
```

---

## Hook Book Worksheet — User Fills Before Cockpit

```markdown
# My Hook Book Worksheet

## Step 1: Favorite Lyrics Reference
Paste 3 song excerpts you love (lyrics only, artist name):

1. Lyric: "___________________________"
   Artist/Song: ___________________
   Why: (emotional resonance)

2. Lyric: "___________________________"
   Artist/Song: ___________________
   Why: (emotional resonance)

3. Lyric: "___________________________"
   Artist/Song: ___________________
   Why: (emotional resonance)

[System auto-analyzes: rhyme scheme, vocabulary, tone]

## Step 2: My Hook Archetype
Which of these describes my song's core message?
- [ ] Defiant ("I refuse…")
- [ ] Vulnerable ("I confess…")
- [ ] Wise ("I learned…")
- [ ] Question ("What if…")
- [ ] Paradox ("It is both…")

## Step 3: Hook Skeleton
How should my hook repeat?
- [ ] Exact repetition (strength through repetition)
- [ ] Call-and-response (dialogue/tension)
- [ ] Ascending (building intensity)
- [ ] Question-answer (inquiry toward truth)
- [ ] Fragmented (pieces that cohere)

## Step 4: The Emotional Peak
When should the song's biggest feeling happen?
- [ ] Verse 1 (immediate, no buildup)
- [ ] Pre-chorus (tension before release)
- [ ] Chorus (classic peak)
- [ ] Bridge (vulnerability/revelation)
- [ ] Outro (earned wisdom)

## Step 5: Hook Rough Draft
In 1–2 sentences, what is the core phrase that must repeat?

"What I need the song to keep saying:
_______________________________________
_______________________________________"

[Cockpit will refine this into the final hook.]
```

---

## Implementation Roadmap for Hook Book

### MVP (Week 1–2)
- [ ] **ReferenceAnalyzer component** — Paste 3 lyrics, auto-detect rhyme + tone
- [ ] **Hook template picker** — Visual selector for [Repetition], [Call-Response], [Ascending], etc.
- [ ] **Hook worksheet export** — PDF of user's answers before entering Cockpit
- [ ] **Simple hook validator** — Check if hook appears ≥3x in final song

### Phase 2 (Week 3–4)
- [ ] **Emotional peak locator UI** — Timeline where user clicks "This is where my heart breaks"
- [ ] **Hook strength meter** — Display after generation (memorability score)
- [ ] **Per-section regeneration** — ↻ button for each section with seed param
- [ ] **Hook echo detection** — Verify reference style is actually reflected in generated song

### Phase 3 (Week 5–6)
- [ ] **Hook variant suggestions** — AI proposes 3 alternative hooks if user unhappy
- [ ] **Rhyme scheme analyzer** — Show user what rhyme scheme their chosen template implies
- [ ] **Archetype voice guide** — "As a [Defiant] persona, your hook should sound like this"
- [ ] **Hook library** — Save successful hooks for future songs (personal hook database)

---

## Why Hook Book Matters for Identity Knowledge Acquisition

**Traditional songwriting:** "The hook is the catchiest part." (Vague)

**SCI Hook Book:** "The hook IS your identity. What you choose to repeat defines you. How you say it reflects your voice. Where you place it shows your emotional architecture."

Hook Book turns songwriting into **identity assertion**:
- What words do you choose to hammer home?
- What rhyme schemes feel authentic to you?
- Where do you break? Where do you stand firm?
- How do you echo the artists who moved you?

The final song's hook is not SCI's creation. **It's your identity, structured and sung.**

---

## Hook Book + Journalling Synergy

```
Journal Entry (Tuesday):
"I will not apologize for being too much."
   ↓
Archetype identified: Defiant
   ↓
Hook Book worksheet filled:
"What I need to keep saying: I am enough as I am."
   ↓
Reference lyrics analyzed:
"Rihanna: 'I'm worth my weight in gold'"
(Rhyme: EXTERNAL, monosyllabic, aggressive)
   ↓
Cockpit loaded with:
- Hook theme: Repetition + defiant archetype
- Rhyme style: External (matching Rihanna DNA)
- Emotional peak at: Bridge (vulnerability into power)
   ↓
/api/analyze processes all this
   ↓
Song generated with hook:
"I am worth. I am gold. I am NOT apologizing."
   ↓
Song validates: Hook appears 5x, echoes Rihanna's style, peaks at bridge
   ↓
User sings her identity home.
```

---

*Last updated: 2026-04-21 | Part of SCI v2 Identity Knowledge Acquisition Suite*
