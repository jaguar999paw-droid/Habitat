# SCI Architecture

## Overview
SCI (Structured Creative Intelligence) uses a 3-layer pipeline:

```
User Answers → ENGINE (pure JS) → AI LAYER (Claude/OpenAI) → Song
```

## Engine Layer (Rule-Based, No AI)

| Module | Role |
|---|---|
| `identityParser.js` | Extracts emotions, conflicts, traits, language signals from raw text |
| `personaBuilder.js` | Maps parsed identity → structured Persona object (archetype, voice, tone, energy) |
| `messageExtractor.js` | Derives core message and sub-themes |
| `structurePlanner.js` | Dynamically generates section plan based on conflict type |
| `styleMapper.js` | Determines rhyme scheme, flow style, language blending, imagery |

## AI Layer
- `promptBuilder.js` — Constructs structured prompts per section
- `generator.js` — Calls Claude/OpenAI API section-by-section with context passing

## Frontend Flow
1. **Landing** → API key setup, provider selection
2. **Questionnaire** → 7 progressive identity questions
3. **PersonaReview** → Calls `/api/analyze`, shows persona + structure
4. **Generator** → Calls `/api/section` in sequence, streams lyrics live
5. **SongDisplay** → Final song with copy/download

## Backend API
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/analyze` | POST | Run engine pipeline on answers |
| `/api/generate` | POST | Generate full song |
| `/api/section` | POST | Generate one section |

## Extensibility
- Add archetypes: extend `ARCHETYPE_MAP` in `personaBuilder.js`
- Add languages: extend `LANGUAGE_BLEND_INSTRUCTIONS` in `styleMapper.js`
- Add structure templates: extend `STRUCTURE_TEMPLATES` in `structurePlanner.js`
- Swap AI provider: add a new function to `generator.js` and pass `provider` param
