# HabitaT / sci-songwriting-engine
## Agent Build Brief: Hook Book & Journal — Identity Extraction Input Modules

> **Status:** Active Design Spec  
> **Owner:** Lee (Kamau / Paul Wambugu)  
> **Target service:** `~/sci-songwriting-engine/ml-service`  
> **Purpose of this doc:** Agents borrowing from this brief should treat it as the canonical contract for building the `HookBook` and `Journal` subsystems. Both are **alternative input mechanisms** that feed the engine's identity extraction pipeline.

---

## 0. System Context

The songwriting engine extracts a songwriter's **unique identity** from their inputs, then uses that identity as a constraint when generating/suggesting lyrics, hooks, and song structures. The two primary identity-capture surfaces are:

| Module | Nature | Identity Signal Type |
|---|---|---|
| **Hook Book** | Structured creative snippet store | Linguistic, rhythmic, thematic, semantic |
| **Journal** | Private reflective long-form | Psychological, emotional, valuative, temporal |

Both modules output normalized **Identity Feature Vectors** consumed by downstream ML models.

---

## 1. 🎣 HOOK BOOK

> *"A dedicated collection of song titles, lyrical snippets, and core ideas — a reservoir of potential starting points that ensures a songwriter never loses a spark of inspiration."*

### 1.1 Purpose
- Store and organize hooks, titles, lyrical fragments, and thematic seeds
- Prevent creative loss ("writer's block buffer")
- Provide structured identity signals to the ML engine
- Enforce quality gates so the AI can classify material as `HOOK`, `VERSE`, `TITLE`, or `CONCEPT`

### 1.2 Input Parameters (Required Schema)

Every Hook Book entry **MUST** capture:

```json
{
  "entry_id": "uuid-v4",
  "raw_text": "The line or phrase as the user wrote it",
  "source_type": "dream_journal | daily_log | improvisation | external_quote | rhyme_search",
  "timestamp": "ISO-8601",
  "location": { "lat": null, "lng": null },
  "weather_context": "optional ambient/environmental string",

  "linguistic_features": {
    "sentence_type": "declarative | interrogative | exclamatory | imperative | fragment",
    "figures_of_speech": ["metaphor", "simile", "alliteration", "personification", "irony"],
    "idioms": ["list of detected idioms"],
    "humor_type": "wordplay | sarcasm | absurdist | none",
    "poetry_form": "free_verse | haiku | couplet | none",
    "syllable_count": 0,
    "stress_pattern": "u-u-s-u-s",
    "rhyme_density": 0.0,
    "line_symmetry_score": 0.0
  },

  "semantic_features": {
    "is_title_candidate": false,
    "sentiment_delta": 0.0,
    "cliche_score": 0.0,
    "originality_percentile": 0.0,
    "thematic_tags": ["freedom", "loss", "identity"],
    "value_pillars": ["loyalty", "regret"]
  },

  "rhythmic_features": {
    "meter": "iambic | trochaic | free",
    "rhyme_zone_suggestions": [],
    "masterwriter_matches": [],
    "beat_pocket_fit": null
  },

  "classification": {
    "material_type": "HOOK | VERSE | TITLE | CONCEPT | BRIDGE",
    "intensity_rating": 7,
    "lock_state": "LOCKED | LIQUID",
    "ai_confidence": 0.0
  },

  "vocabulary_profile": {
    "era": "gen_z | millennial | vintage | academic | folk",
    "social_identity_tag": "cool | storyteller | poet | activist"
  },

  "provenance": {
    "input_method": "typed | voice | imported",
    "ai_augmented": false,
    "human_verified": false
  }
}
```

### 1.3 Linguistic Input Types to Handle

Agents must build parsers/detectors for:

- **Sentence structures:** declarative, interrogative, exclamatory, imperative, fragments, run-ons
- **Figures of speech:** metaphor, simile, hyperbole, alliteration, assonance, personification, irony, oxymoron, synecdoche
- **Idioms:** match against curated idiom database (EN-first, then locale-aware)
- **Humor:** wordplay, sarcasm, absurdism — scored 0–1 per type
- **Poetry forms:** free verse, couplets, quatrains, haiku, ballad stanzas
- **Rhyme & Meter:** integrate RhymeZone / MasterWriter APIs for "rhythmic pocket" matching

### 1.4 Quality Gates (Classification Rules)

```
IF sentiment_delta < 0.3  → classify as VERSE_MATERIAL (not hook-worthy)
IF is_title_candidate     → must be noun/action oriented (object-oriented)
IF cliche_score > 0.7     → trigger Originality Audit, surface similar existing lyrics
IF lock_state == LIQUID   → AI may suggest rhythmic/rhyming variations
IF lock_state == LOCKED   → AI read-only, no modifications
```

### 1.5 External Integrations
- **RhymeZone API** — end rhyme and internal rhyme suggestions
- **MasterWriter** — rhythmic pocket matching
- **Vector DB (pgvector / Chroma)** — similarity search against 50,000+ song lyrics for cliché scoring
- **NLP pipeline** — spaCy / HuggingFace for entity extraction, sentiment, POS tagging

---

## 2. 📓 JOURNAL

> *"A private digital space for unfiltered and open writing — a lyrical diary that captures raw emotions and reveals patterns the writer didn't notice in the moment."*

### 2.1 Purpose
- Provide a safe, private space for unfiltered creative writing
- Extract psychological identity markers (Big Five, MBTI proxies)
- Track value evolution and identity growth over time
- Supply long-form contextual training data to the ML engine

### 2.2 Schema: Journal Entry

```json
{
  "entry_id": "uuid-v4",
  "title": "optional user-given title",
  "body": "raw journal text",
  "timestamp": "ISO-8601",
  "geospatial": { "lat": null, "lng": null, "place_name": null },
  "ambient_context": {
    "weather": null,
    "noise_level": null,
    "time_of_day": "morning | afternoon | evening | night"
  },

  "nlp_extracted": {
    "entities": {
      "people": [],
      "places": [],
      "brands": [],
      "keywords": []
    },
    "sentiment": {
      "valence": 0.0,
      "arousal": 0.0,
      "dominant_emotion": "joy | sadness | anger | fear | surprise | disgust"
    },
    "value_pillars": ["freedom", "loyalty", "regret"],
    "intentions": [],
    "outcomes": [],
    "identity_growth_delta": 0.0
  },

  "psychological_profile": {
    "big_five": {
      "openness": null,
      "conscientiousness": null,
      "extraversion": null,
      "agreeableness": null,
      "neuroticism": null
    },
    "mbti_suggestion": null,
    "self_labeled_traits": [],
    "ai_suggested_traits": []
  },

  "linguistic_fingerprint": {
    "avg_sentence_complexity": 0.0,
    "vocabulary_diversity_ttr": 0.0,
    "frequent_metaphors": [],
    "vocabulary_era": "gen_z | millennial | academic | vintage | folk",
    "reading_grade_level": 0.0
  },

  "hook_candidates": [],

  "audit": {
    "source_type": "dream_journal | daily_log | field_note | reflection",
    "data_provenance": "user_input | ai_augmented | third_party",
    "hitl_verified": false,
    "ai_tags_confirmed": [],
    "ai_tags_rejected": [],
    "privacy_mode": "on_device | differential_privacy | cloud"
  },

  "contextual_envelope": {
    "intensity_rating": 7,
    "lock_state": "LOCKED | LIQUID",
    "modifiability_note": null
  }
}
```

### 2.3 Core Capabilities to Implement

#### A. Unfiltered Capture
- No character limits; markdown support
- Voice-to-text ingestion pipeline
- Offline-first with sync-on-connect (critical for field use)

#### B. Pattern Recognition ("Backstage Self")
- Temporal emotional trends: surface emotional arc across entries over 7/30/90 days
- Recurring theme clustering: use topic modeling (LDA / BERTopic)
- Identity growth tracker: `intentions` vs `outcomes` delta

#### C. Artistic Voice Development
- Linguistic fingerprint built across entries
- Vocabulary shelf-life tracking ("era" classification)
- "Writer's Muscle" score: consistency metric based on entry frequency and depth

#### D. Hook Extraction from Journal
- Automatic surfacing of "hook candidate" sentences
- Scored by `sentiment_delta`, `syllable_count`, `stress_pattern`
- Pushed into Hook Book with `source_type: "journal_extract"`

### 2.4 Privacy Architecture
```
Sensitive data handling options (configurable per user):
  - ON_DEVICE: TensorFlow Lite / CoreML for local inference
  - DIFFERENTIAL_PRIVACY: noise injection before cloud sync
  - FULL_CLOUD: opt-in only, explicit consent required

Audit log entries are IMMUTABLE once written.
```

### 2.5 Human-in-the-Loop (HITL) Validation
```
After every AI tagging pass, surface to user:
  "The AI thinks this hook is 'melancholic' — is that correct? [Yes / No / Edit]"

User confirmations → ground_truth training labels
User rejections    → negative training signal
Both stored in audit.ai_tags_confirmed / ai_tags_rejected
```

---

## 3. Shared Infrastructure

### 3.1 Database Recommendations

| Need | Recommended DB |
|---|---|
| Flexible JSON entries | MongoDB / PostgreSQL + JSONB |
| Theme/relationship mapping | Neo4j (graph) |
| Lyric similarity / cliché scoring | pgvector / ChromaDB |
| Audit log (immutable) | Append-only Postgres table / SQLite WAL |

### 3.2 Identity Feature Vector (Output Contract)

Both modules ultimately produce:

```python
IdentityVector = {
    "user_id": str,
    "generated_at": datetime,
    "sources": ["hook_book", "journal"],
    "psychological": { ...big_five, mbti },
    "linguistic": { ...fingerprint, era, complexity },
    "thematic": { ...value_pillars, recurring_themes },
    "rhythmic": { ...meter_preference, rhyme_density_avg },
    "emotional": { ...dominant_emotion, intensity_avg },
    "vocabulary": { ...era, diversity, metaphor_clusters }
}
```

This vector is the **primary input** to the lyrics generation and hook suggestion models.

### 3.3 Metadata Standards
- Use **Schema.org `CreativeWork`** and `Article` types for external compatibility
- All timestamps in **ISO-8601 UTC**
- All IDs as **UUID v4**
- All AI-generated fields flagged with `ai_generated: true`

---

## 4. Proposed ml-service Directory Structure

```
ml-service/
├── README.md
├── requirements.txt
├── config/
│   └── settings.py
├── models/
│   ├── identity_vector.py         # Pydantic schemas for IdentityVector
│   ├── hook_entry.py              # Pydantic schema for Hook Book entry
│   └── journal_entry.py           # Pydantic schema for Journal entry
├── modules/
│   ├── hook_book/
│   │   ├── __init__.py
│   │   ├── ingestion.py           # Input capture + validation
│   │   ├── linguistic_parser.py   # Sentence type, figures of speech, idioms
│   │   ├── rhythmic_analyzer.py   # Syllable count, stress pattern, meter
│   │   ├── semantic_scorer.py     # Sentiment delta, cliché score, originality
│   │   ├── classifier.py          # HOOK / VERSE / TITLE / CONCEPT classifier
│   │   └── rhyme_integration.py   # RhymeZone / MasterWriter API clients
│   ├── journal/
│   │   ├── __init__.py
│   │   ├── ingestion.py           # Entry capture, offline queue
│   │   ├── nlp_pipeline.py        # Entity extraction, sentiment, NER
│   │   ├── pattern_recognition.py # Temporal trends, topic modeling
│   │   ├── fingerprinting.py      # Linguistic fingerprint builder
│   │   ├── hook_extractor.py      # Surface hook candidates from journal
│   │   ├── hitl_validator.py      # Human-in-the-loop validation flows
│   │   └── privacy_layer.py       # On-device vs differential privacy
│   └── identity/
│       ├── __init__.py
│       ├── vector_builder.py      # Aggregate Hook Book + Journal → IdentityVector
│       └── audit_log.py           # Immutable provenance/audit trail
├── api/
│   ├── __init__.py
│   ├── routes_hook_book.py
│   ├── routes_journal.py
│   └── routes_identity.py
├── db/
│   ├── mongo_client.py
│   ├── neo4j_client.py
│   └── vector_store.py            # ChromaDB / pgvector
└── tests/
    ├── test_hook_book.py
    ├── test_journal.py
    └── test_identity_vector.py
```

---

## 5. Agent Instructions

When an agent picks up this brief:

1. **Start with `models/`** — define all Pydantic schemas before writing any logic
2. **Hook Book first** — it has tighter, more testable constraints
3. **Journal second** — heavier NLP; depends on fingerprint model being stable
4. **Identity Vector last** — aggregation layer; depends on both modules
5. **Never skip the audit log** — every write must emit an audit event
6. **HITL loops are not optional** — they are the ground truth mechanism
7. **Privacy mode must be configurable** — never hard-code cloud-only processing
8. **All AI-generated fields must be flagged** — `ai_generated: true` in every record

---

*Last updated: 2026-04-26 | sci-songwriting-engine / HabitaT*
