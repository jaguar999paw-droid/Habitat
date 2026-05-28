# Contributing to SCI

## Welcome
SCI is an open, extensible songwriting intelligence system. Contributions that extend
the engine's vocabulary, archetypes, languages, or structural intelligence are warmly welcomed.

## Ways to Contribute

### 1. Add a New Persona Archetype
Edit `engine/personaBuilder.js`:
- Add an entry to `ARCHETYPE_MAP` (conflict type → archetype name)
- Add corresponding tone in `EMOTION_TONE_MAP` if needed

Edit `engine/structurePlanner.js`:
- Add a structure template to `STRUCTURE_TEMPLATES` keyed to your new conflict type

### 2. Add a New Language
Edit `engine/styleMapper.js`:
- Add to `LANGUAGE_BLEND_INSTRUCTIONS` with blending guidance for the AI
Edit `engine/identityParser.js`:
- Add word lists to `detectLanguageMix()` for the new language

### 3. Add a New Song Structure Template
Edit `engine/structurePlanner.js`:
- Add new section blueprints to `SECTION_BLUEPRINTS`
- Add a new template array to `STRUCTURE_TEMPLATES`

### 4. Improve the Questionnaire
Edit `frontend/src/pages/Questionnaire.jsx`:
- Add questions to the `QUESTIONS` array
- Follow the `{ id, category, prompt, subtext, placeholder, required }` format

### 5. Add a New AI Provider
Edit `ai/generator.js`:
- Add a new async function `callYourProvider(systemPrompt, userPrompt, apiKey)`
- Add a branch in `generateSection()` for your provider name

## Code Style
- Pure JS modules in `engine/` — no external dependencies
- React components in `frontend/src/` — functional components + CSS modules
- Comments explaining *why*, not just *what*

## Commit Convention
`feat: add Yoruba language support`
`fix: correct rhyme scheme for bridge sections`
`engine: extend archetype map with The Exile`

## License
MIT — build freely, credit generously.
