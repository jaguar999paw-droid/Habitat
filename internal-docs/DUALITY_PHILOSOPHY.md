# SCI Duality Philosophy

> *"Every truth carries its shadow. To know what you are, you must sit with what you are not."*

## The Core Principle

SCI v3 is built on a duality framework: **every input has a shadow**.

Every song emerges not just from what the artist IS saying, but from what they are *refusing* to say. The engine now reasons on both dimensions simultaneously.

| Stated Truth | Shadow Truth |
|---|---|
| Core Message | The protected truth it won't state |
| Emotional Truth | The emotion being performed instead |
| Social Conflict | What the world gets RIGHT about you |
| Identity Position | Who you're refusing to become |

---

## The Square of Opposition

SCI borrows from classical logic's Square of Opposition to classify the tension between stated and shadow positions:

### CONTRADICTION ⊥ (Tension: 1.0)
*A and NOT-A. Both cannot be true AND both cannot be false.*

Example: "I am strong" ↔ "I am terrified"  
Instruction: **Do NOT resolve. Hold both truths simultaneously. This IS the song.**

### CONTRARY ⌂ (Tension: 0.75)
*Two states that cannot both be true, but both can be false.*

Example: "I am completely free" ↔ "I am completely trapped"  
Instruction: **Write into the gap. The song lives in the space where neither extreme is true.**

### SUBCONTRARY ≈ (Tension: 0.5)
*Both can be true, but both cannot be false. At least one IS true.*

Example: "Sometimes I love this" ↔ "Sometimes I hate this"  
Instruction: **Both truths exist. Do NOT simplify. Let the paradox breathe.**

### SUBALTERNATION ↘ (Tension: 0.4)
*The general implies the specific. Descent from claim to wound.*

Example: "People never listen" → "You never listened to me that night"  
Instruction: **Move from universal to specific. What does this claim cost in flesh and bone?**

---

## Philosophical Lineage

### Hegel — The Dialectic
Thesis → Antithesis → Synthesis.  
SCI doesn't rush to synthesis. The song IS the thesis/antithesis tension. If there's a synthesis, the artist writes it. We don't force it.

### Sartre — Radical Freedom and Refusal
"You are what you choose NOT to be as much as what you choose to be."  
Every identity claim in a song is also a *refusal*. The engine now surfaces what is being refused.

### Jungian Shadow Work
The shadow is not what you don't know about yourself — it's what you *refuse* to acknowledge.  
The most powerful songs excavate shadow material. SCI's duality fields create the container for this.

### Buddhist Non-Duality
Form and emptiness co-arise. The stated and the unstated are inseparable.  
The silence in a song (what it doesn't say) is as meaningful as what it does.

### East African Philosophy — Mtu Ni Watu
Identity is relational. "I am" is always in context of "we are."  
The duality framework asks: who is missing from this story? Who is the implied OTHER?

---

## Implementation

### In the UI (CockpitHub)
- Toggle **⊥ dual** in the main input zone to reveal shadow fields
- Each core input field has a corresponding shadow field
- Shadow fields are optional — progressive disclosure

### In the Engine (dualityEngine.js)
- `analyzeDuality(userInputs, parsedIdentity)` → full duality analysis
- `buildDualityBlock(analysis, section)` → injects into AI prompts
- Shadow map: 30+ concept → shadow-concept mappings

### In AI Prompts (promptBuilder.js)
- `DUALITY PRINCIPLE` added to system prompt
- `buildDualityBlock()` injected per section when duality data present
- AI instructed: "Write into the tension, not out of it"

---

## The Song's Location

| Relation | Where the song lives |
|---|---|
| CONTRADICTION | In the unresolved tension between both truths |
| CONTRARY | In the gap where neither extreme is true |
| SUBCONTRARY | In the fullness of holding both realities |
| SUBALTERNATION | In the descent from abstract to embodied |

---

*"The wound you're circling is the song's center."*

---
*SCI Duality Philosophy v1 — 2026-04*
