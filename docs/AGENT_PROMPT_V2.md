# Habitat v2 — Agent Prompt: Cockpit UI + ML Engine + Art Theme Overhaul

> Copy-paste this entire document as your opening message to a new Claude session.
> The agent has MCP access to: ssh-shell-mcp (host: `localhost`, user: `kamau`),
> github MCP (authenticated as `jaguar999paw-droid`), desktop-commander.

---

## IDENTITY & REPO

- **Project**: `Habitat` at `~/sci-songwriting-engine` on `localhost`
- **GitHub**: `https://github.com/jaguar999paw-droid/sci-songwriting-engine`
- **Auth**: GitHub token is in `~/.bashrc` as `GITHUB_API_TOKEN` (use this for git push via `source ~/.bashrc`)
- **Branch strategy**: Create branch `v2-cockpit-ml` from `main`, do all work there, then push and open a PR
- **Runtime**: Node 24, Python 3.10, numpy installed, 3.8GB RAM, Ubuntu 22.04

---

## YOUR MISSION

Perform a complete v2 overhaul of Habitat across three dimensions:

1. **COCKPIT UI** — Replace the sequential questionnaire with a spatial, multi-panel cockpit interface
2. **ML ENGINE** — Add a Python microservice for sentence-level NLP (embeddings + clustering) to replace crude keyword matching in the engine
3. **ART THEME** — Full visual redesign: green + magenta + black/white with expressive typographic art

Work on `localhost` via `ssh-shell-mcp`, commit to `v2-cockpit-ml` branch, push to GitHub.

---

## PART 1 — COCKPIT UI OVERHAUL

### Philosophy
The current UI is a sequential card-per-question form. Replace it with a **single-screen cockpit** — all inputs visible simultaneously, organised into spatial zones like a mixing console or aircraft cockpit. The user should feel like a pilot of their own creative session, not a form-filler.

### Layout: Three-Panel Cockpit

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR: persona live-preview (updates as user types)       │
├──────────────┬──────────────────────────┬────────────────────┤
│  LEFT PANEL  │     CENTRE STAGE         │   RIGHT PANEL      │
│  "WHO"       │     "WHAT / MESSAGE"     │   "HOW / STYLE"    │
│              │                          │                    │
│  Identity    │  Core message textarea   │  Knobs & Sliders   │
│  rejection   │  (large, breathing)      │                    │
│  checkboxes  │                          │  • Energy: 0–100   │
│              │  Emotional truth field   │  • Rawness: 0–100  │
│  Visual      │                          │  • Language mix    │
│  archetype   │  Social conflict field   │    [EN][SW][SH]    │
│  picker      │                          │    toggle trio     │
│  (8 cards    │  Paste/search box:       │                    │
│   with icons)│  "Drop a lyric, quote,  │  • Perspective     │
│              │   or reference that      │    [1st][2nd][3rd] │
│  Trait       │   feels right"           │    radio pills     │
│  sliders:    │                          │                    │
│  • Poetic    │  Additional context:     │  • Rhyme style     │
│  • Streetwise│  multi-select chips      │    visual swatches │
│  • Spiritual │  (place / love /         │    AABB ABAB FREE  │
│  • Wounded   │   transformation /       │    AAAA INTERNAL   │
│              │   society / roots)       │                    │
└──────────────┴──────────────────────────┴────────────────────┘
│  BOTTOM BAR: [  IGNITE →  ]  big launch button               │
└─────────────────────────────────────────────────────────────┘
```

### Input Widget Types Required

Map these widget types to the data the backend `identityParser.js` needs:

| Widget | Field | Maps to engine input |
|--------|-------|---------------------|
| **Checkbox grid** (multi-select) | "I am NOT..." — 16 preset identity-rejection chips + free text | `whoAreYouNot` |
| **Large textarea** | Core message — breathing placeholder | `mainIdea` |
| **Textarea** | Emotional truth | `emotionalTruth` |
| **Textarea** | Social conflict | `socialConflict` |
| **Copy-paste / search box** | Reference drop zone — accepts lyric, quote, or search term; shows preview | `referenceText` (new field) |
| **Visual archetype picker** | 8 archetype cards with icon + label, single-select | overrides `persona.archetype` |
| **4× range sliders (knobs)** | Poetic / Streetwise / Spiritual / Wounded — 0 to 100 | feeds `traits` weighting |
| **Range slider** | Energy — 0 (low/slow) to 100 (high/intense) | `persona.energy` override |
| **Range slider** | Rawness — 0 (polished) to 100 (unfiltered/vulnerable) | new `style.rawness` field |
| **3-toggle language mix** | [EN] [SW] [SH] — each independently on/off | `languageMix` override |
| **3-pill radio** | Perspective — [1st] [2nd] [3rd] person | `persona.perspective` override |
| **5-swatch rhyme picker** | AABB / ABAB / FREE / AAAA / INTERNAL — visual colour swatches | `style.rhymeScheme` override |
| **Multi-select theme chips** | Place / Love / Transformation / Society / Roots / Duality | `message.subThemes` seed |
| **Live persona preview bar** | Top bar: updates every 500ms as user changes inputs | read-only display |

### Additional Cockpit UX Rules
- All panels are visible at once — no hidden steps, no pagination
- Inputs auto-save to `localStorage` every 2 seconds (session persistence)
- The top persona bar shows: archetype emoji + archetype name + dominant emotion + language mix, updating live
- Every slider/knob uses a custom CSS dial or track with the magenta/green theme
- The "IGNITE →" button at the bottom spans full width, glows green on hover
- On mobile (< 768px): stack panels vertically, maintain cockpit feel with compact layout
- The reference drop-zone accepts pasted text and detects keywords to pre-fill emotion signals

---

## PART 2 — ML ENGINE (Python Microservice)

### Why ML Here
The current `identityParser.js` uses crude keyword matching — it misses semantic meaning.
A user who writes "I feel like I'm suffocating in this city" won't match any anger keywords but clearly
expresses confinement + identity_stagnation. We need sentence-level understanding.

### Architecture: Python Flask Microservice

Create `/ml-service/` directory with:

```
/ml-service/
  app.py              Flask API server on port 3002
  requirements.txt    sentence-transformers, scikit-learn, flask, flask-cors, numpy
  emotion_model.py    Emotion detection using sentence embeddings + cosine similarity
  conflict_model.py   Conflict classification using embedding clusters
  trait_model.py      Trait scoring using semantic similarity to archetype descriptions
  language_model.py   Language detection (langdetect for Sheng/SW/EN detection)
  startup.sh          Script to launch the ML service
```

### ML Approach (fits 3.8GB RAM constraint)

Use `sentence-transformers` with the **`paraphrase-MiniLM-L6-v2`** model (80MB, fast, CPU-friendly):

```python
# emotion_model.py — semantic emotion detection
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

EMOTION_ANCHORS = {
    'anger':         'I am furious, full of rage, burning with resentment',
    'sadness':       'I feel empty, broken, lost and grieving alone',
    'defiance':      'I refuse to submit, I will fight back and resist',
    'longing':       'I miss what was, I wish for what could be',
    'pride':         'I am strong, I earned this, I built myself',
    'confusion':     'I do not understand, I am lost and uncertain',
    'joy':           'I feel free, alive, grateful and full of light',
    'vulnerability': 'I am exposed, afraid, fragile and in need',
}

def detect_emotions(text):
    text_emb = model.encode(text)
    scores = {}
    for emotion, anchor in EMOTION_ANCHORS.items():
        anchor_emb = model.encode(anchor)
        scores[emotion] = float(util.cos_sim(text_emb, anchor_emb))
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

Apply the same pattern for conflict classification and trait scoring.

### Flask API Endpoints

```
POST /ml/analyze        Body: { text: string }
                        Returns: { emotions, conflicts, traits, languageMix, confidence }

POST /ml/embed          Body: { texts: [string] }
                        Returns: { embeddings: [[float]] }

GET  /ml/health         Returns: { status, model, loaded }
```

### Integration: Backend Upgrade

In `backend/server.js`, modify `/api/analyze` to:
1. First call `http://localhost:3002/ml/analyze` with the full text
2. Merge ML results with the rule-based results from `identityParser.js`
3. ML results take priority for emotion/conflict detection (higher accuracy)
4. Rule-based results fill in where ML has low confidence (< 0.4)
5. If ML service is down (timeout 500ms), fall back gracefully to rule-based only

Add to `backend/package.json` dependencies: `node-fetch` or use built-in `fetch` (Node 24 has it).

### New Engine Fields

Add to `identityParser.js` output schema:
```js
{
  mlConfidence: 0.0–1.0,   // how confident the ML was
  mlUsed: true/false,       // whether ML service responded
  semanticProfile: {         // new from ML
    emotionVector: [...],    // top 3 emotions with scores
    conflictProbabilities: { identity_rejection: 0.8, ... },
    traitScores: { poetic: 0.7, streetwise: 0.3, ... }
  }
}
```

### Startup Script

Create `~/sci-songwriting-engine/ml-service/startup.sh`:
```bash
#!/bin/bash
cd ~/sci-songwriting-engine/ml-service
pip3 install -r requirements.txt --break-system-packages -q
python3 app.py &
echo "ML service started on port 3002"
```

Update root `package.json` dev script to also start the ML service:
```json
"dev": "concurrently --names BACKEND,FRONTEND,ML \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\" \"bash ml-service/startup.sh\""
```

---

## PART 3 — VISUAL REDESIGN: GREEN + MAGENTA + B&W ART THEME

### Color System (replace all current purple/violet tokens)

```css
:root {
  /* Backgrounds — deep blacks */
  --bg:           #040407;
  --surface:      #0c0c10;
  --surface2:     #141418;
  --surface3:     #1c1c22;

  /* Primary accent — electric green */
  --green:        #00ff88;
  --green-dim:    #00cc6a;
  --green-deep:   #004d29;
  --green-glow:   rgba(0, 255, 136, 0.15);

  /* Secondary accent — hot magenta */
  --magenta:      #ff00aa;
  --magenta-dim:  #cc0088;
  --magenta-deep: #4d0033;
  --magenta-glow: rgba(255, 0, 170, 0.15);

  /* Neutral — whites and greys */
  --white:        #f5f5f5;
  --grey-light:   #a0a0a8;
  --grey-mid:     #505058;
  --grey-dark:    #282830;
  --border:       #242430;

  /* Semantic */
  --text:         #f0f0f4;
  --text-muted:   #606068;
  --text-dim:     #909098;
  --success:      var(--green);
  --error:        #ff3355;
  --warning:      #ffaa00;

  /* Fonts — keep Space Grotesk + Space Mono */
  /* Add: Bebas Neue for large display labels */
}
```

### Typographic Art Directive

The interface must feel like **a creative instrument, not software**. Guidelines:

- **Large section labels** (LEFT / CENTRE / RIGHT panel headers): Bebas Neue, 11px, letter-spacing 4px, all-caps, colour: `var(--grey-mid)` — industrial stencil feel
- **Persona archetype display**: 48px+ Bebas Neue, green glow `text-shadow: 0 0 20px var(--green)`
- **Knob/slider values**: Space Mono, colour alternates green (active) ↔ magenta (hover)
- **The IGNITE button**: full-width, 20px Bebas Neue, black text on green background, no border radius, on hover: magenta background with green border — stark, confrontational
- **Decorative elements**: Use CSS `::before`/`::after` pseudo-elements with single-character symbols (◈ ◆ ▸ ⬡ ✦ ░ ▓) as ambient art accents scattered in panel corners — not interactive, purely atmospheric
- **Scan-line texture**: Apply a subtle repeating-linear-gradient to `.app` background simulating CRT scanlines — 1px lines, 2% opacity — adds analogue warmth
- **Active input glow**: focused inputs get `box-shadow: 0 0 0 2px var(--green), 0 0 16px var(--green-glow)` — like a lit instrument panel
- **Archetype cards**: 1px magenta border on hover, green border when selected, icon in white, label in grey, selected state flips to black background + green text
- **Rhyme swatch buttons**: small rectangles (not pills), each a different subtle tint: AABB=#001a0d, ABAB=#1a0010, FREE=#0a0a0a, AAAA=#1a0000, INTERNAL=#0a0a1a — colour-coded mnemonic

### Animation Principles
- **No bounce** — all transitions `ease` or `linear`, no spring physics — cold, precise
- Slider knobs rotate with CSS `transform: rotate()` as value changes — physical feel
- Top persona bar fades text changes with `opacity 0.2s` — like a display refresh
- On IGNITE: button flashes green → magenta → green before navigating — ignition sequence

---

## PART 4 — ADDITIONAL IMPROVEMENTS NOT EXPLICITLY MENTIONED

These are important and must be included:

### 4a. Engine: `structurePlanner.js` — Emotion-Weighted Structures
Currently structure is purely conflict-type driven. Add emotion intensity weighting:
- If `emotions[0].intensity > 0.7` AND energy > 70 → prefer denser structures (more verses, double hook)
- If `vulnerability` is in top 2 emotions → always include a bridge with `goal: surrender_or_acceptance`
- Add 3 new section types: `verse_address_listener` (second-person break), `spoken_word` (no rhyme, prose delivery), `call_and_response` (for spiritual/streetwise archetypes)

### 4b. Engine: `styleMapper.js` — Rawness Field
Add `rawness` (0–100, from cockpit slider) to style output:
- rawness < 30: "polished, metaphor-heavy, indirect imagery"
- rawness 30–70: "honest, grounded, mixing direct and figurative"
- rawness > 70: "unfiltered, confessional, blunt — say it plain"

### 4c. Backend: Reference Text Processing
New engine module: `engine/referenceAnalyzer.js`
- Accepts `referenceText` (the paste/drop field from cockpit)
- Extracts: rhyme patterns (end-word pairs), tonal register, vocabulary level
- Output feeds into `styleMapper` to influence rhyme scheme and vocabulary

### 4d. `promptBuilder.js` — Rawness + Reference Injection
Inject rawness descriptor and reference text analysis into every section prompt:
```
Rawness Level: [descriptor from above]
Reference Influence: [extracted style patterns from referenceAnalyzer]
```

### 4e. `SongDisplay.jsx` — Add Section Regeneration
Each generated section should have a ↺ regenerate button that calls `/api/section`
with the same params + a `seed` increment — lets the user swap out a single section
without regenerating the whole song.

### 4f. `PersonaReview.jsx` → Rename to `CockpitPreview.jsx`
After the cockpit, show a full-screen cinematic persona reveal:
- Black screen, archetype name fades in large (Bebas Neue, 72px, green glow)
- Below it: core message in italic
- Then the structure plan slides up from the bottom
- Single "GENERATE →" button — no back button, no editing — commit mode

### 4g. New Backend Route: `POST /api/save`
Save session to `~/.habitat-sessions/[timestamp].json` — allows later retrieval.
Add `GET /api/sessions` to list saved sessions.

### 4h. ML: Add `language_model.py` using `langdetect` + custom Sheng wordlist
Since `langdetect` doesn't detect Sheng, layer it:
1. `langdetect` detects EN/SW baseline
2. Check against 80-word Sheng lexicon (expand from current 11 words in identityParser)
   Expanded Sheng list: `['manze','buda','niaje','poa','sema','fiti','mtaa','chali','dame','kama','sawa','maze','kitu','vipi','rada','mambo','boss','ghali','raha','noma','jaba','mbaya','safi','cheza','ingia','toa','enda','kuja','ona','jua','fanya','gari','pesa','kazi','nyumba','mtu','watu','siku','usiku','asubuhi','jioni']`
3. If ≥ 3 Sheng words detected → `sheng: true` with high confidence

---

## EXECUTION INSTRUCTIONS FOR THE AGENT

### Step 1 — Setup
```bash
cd ~/sci-songwriting-engine
source ~/.bashrc
git checkout -b v2-cockpit-ml
```

### Step 2 — ML Service
1. Create `/ml-service/requirements.txt`, `app.py`, `emotion_model.py`, `conflict_model.py`, `trait_model.py`, `language_model.py`, `startup.sh`
2. Run `pip3 install sentence-transformers scikit-learn flask flask-cors langdetect --break-system-packages`
3. Test: `python3 ml-service/app.py &` then `curl -s http://localhost:3002/ml/health`

### Step 3 — Engine Updates
1. Update `engine/identityParser.js` — add ML call + fallback
2. Update `engine/styleMapper.js` — add `rawness` field
3. Update `engine/structurePlanner.js` — add emotion-weighted structures + 3 new section types
4. Create `engine/referenceAnalyzer.js`
5. Update `ai/promptBuilder.js` — inject rawness + reference

### Step 4 — Backend Updates
1. Update `backend/server.js` — ML integration in `/api/analyze`, add `/api/save`, `/api/sessions`
2. Update root `package.json` — dev script includes ML service

### Step 5 — Frontend: Cockpit UI
This is the largest change. Replace the entire `Questionnaire.jsx` + `PersonaReview.jsx` flow:

1. Create `frontend/src/pages/Cockpit.jsx` + `Cockpit.module.css` — the main cockpit interface
2. Create `frontend/src/components/` new components:
   - `KnobSlider.jsx` + CSS — custom range input with rotate animation
   - `ArchetypeGrid.jsx` + CSS — 8-card visual picker
   - `LanguageToggle.jsx` + CSS — 3-button EN/SW/SH toggle
   - `RhymeSwatch.jsx` + CSS — 5 coloured rectangle selectors
   - `ThemeChips.jsx` + CSS — multi-select chip grid
   - `ReferenceDropZone.jsx` + CSS — paste/search box with keyword preview
   - `PersonaLiveBar.jsx` + CSS — top bar with live updates
3. Create `frontend/src/pages/CockpitPreview.jsx` + CSS — cinematic persona reveal
4. Update `frontend/src/App.jsx` — replace step 1 (Questionnaire) with Cockpit, step 2 with CockpitPreview
5. Update `frontend/src/styles/global.css` — full colour token replacement (green/magenta/B&W)
6. Update `frontend/index.html` — add Bebas Neue to Google Fonts import

### Step 6 — SongDisplay Updates
1. Add per-section regenerate button (↺) in `SongDisplay.jsx`
2. Style with new theme

### Step 7 — Commit Strategy (meaningful, atomic)
```
feat(ml): add Python ML microservice with sentence-transformer emotion/conflict detection
feat(engine): add rawness field, reference analyzer, emotion-weighted structures
feat(backend): integrate ML service with graceful fallback, add session save/list routes
feat(frontend/theme): replace purple theme with green+magenta+B&W art system
feat(frontend/cockpit): replace sequential questionnaire with spatial cockpit interface
feat(frontend/components): add KnobSlider, ArchetypeGrid, LanguageToggle, RhymeSwatch, ThemeChips, ReferenceDropZone, PersonaLiveBar
feat(frontend/preview): add cinematic CockpitPreview persona reveal screen
feat(frontend/song): add per-section regenerate button
chore: update root dev script to launch ML service alongside backend+frontend
```

### Step 8 — Push and PR
```bash
source ~/.bashrc
git remote set-url origin "https://jaguar999paw-droid:${GITHUB_API_TOKEN}@github.com/jaguar999paw-droid/sci-songwriting-engine.git"
git push origin v2-cockpit-ml
# Then use github MCP tool: github_create_pull_request
# base: main, head: v2-cockpit-ml
# title: "v2: Cockpit UI + ML Engine + Green/Magenta Art Theme"
```

---

## QUALITY BARS — Do Not Ship Without These

- [ ] ML service starts and `/ml/health` returns `{ status: "ok" }` with model loaded
- [ ] Cockpit loads all 3 panels on a single screen with no scroll on desktop (1280×800+)
- [ ] Live persona bar updates within 500ms of any input change
- [ ] All sliders/knobs are styled (no browser-default range inputs visible)
- [ ] IGNITE button is full-width, Bebas Neue, green→magenta hover
- [ ] Scan-line texture visible on dark backgrounds
- [ ] Green glow on focused inputs
- [ ] Per-section regenerate works in SongDisplay
- [ ] Session save writes to `~/.habitat-sessions/`
- [ ] All 9 commits pushed to `v2-cockpit-ml` branch
- [ ] PR opened on GitHub

---

## NOTES FOR THE AGENT

- Machine RAM is 3.8GB — do NOT use `all-MiniLM-L12` or larger models. Use `paraphrase-MiniLM-L6-v2` (80MB).
- The ML service model loads once at startup and stays in memory — do not reload per request.
- When writing CSS, never use `var(--accent)` or `var(--accent2)` — those are the old purple tokens. Always use `var(--green)`, `var(--magenta)`, etc.
- The cockpit must work without the ML service running (graceful degradation to rule-based engine).
- All new React components use CSS modules (`.module.css`), not inline styles.
- `localStorage` key for cockpit state: `habitat_cockpit_v2`.
- The reference drop-zone is NOT a file upload — text only.
- Sheng detection wordlist must be expanded to 40+ words (list provided above in 4h).
- Keep `Questionnaire.jsx` and `PersonaReview.jsx` in place (don't delete) — just stop routing to them. Mark as `@deprecated` in comments.
