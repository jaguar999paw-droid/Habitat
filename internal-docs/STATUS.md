# SCI — Project Status
> **Last updated:** 2026-04 (v3 overhaul)
> **Branch:** `main`

---

## v3 Changes Summary

### New Engine Modules
| Module | Status | Purpose |
|---|---|---|
| `engine/dualityEngine.js` | ✅ NEW | What vs What-Not reasoning, Square of Opposition, shadow mapping |
| `engine/studioEngine.js` | ✅ NEW | Gen-Z studio modes: cypher, battle, analyze, juxtapose |
| `engine/defaultPersonaData.js` | ✅ NEW | Gen-Z archetypes, rich defaults, spiritual anchors, questionnaire generator |

### Updated Engine / AI
| Module | Change |
|---|---|
| `ai/promptBuilder.js` | + Duality layer, enhanced system prompt philosophy |
| `backend/server.js` | + Studio routes (/api/studio/*), /api/duality |

### New Frontend
| Component | Status | Purpose |
|---|---|---|
| `pages/CockpitHub.jsx` | ✅ NEW | Unified non-sequential cockpit, optional panels, duality mode |
| `pages/CockpitHub.module.css` | ✅ NEW | CockpitHub styles |
| `components/DualityInput.jsx` | ✅ NEW | What ↔ What-Not dual text field |
| `components/DualityInput.module.css` | ✅ NEW | DualityInput styles |
| `App.jsx` | ✅ UPDATED | Routes to CockpitHub, removed sequential steps 1+2 |

### New Documentation
| File | Status |
|---|---|
| `docs/DUALITY_PHILOSOPHY.md` | ✅ NEW |
| `docs/STUDIO_GUIDE.md` | ✅ NEW |
| `docs/ARCHITECTURE_V3.md` | ✅ NEW |
| `docs/STATUS.md` | ✅ UPDATED (this file) |

---

## Interface Philosophy v3

**Before (v2):** Sequential 7-step flow. Landing → Journal → HookWorksheet → Cockpit (4 phases) → Preview → Generator → Display

**After (v3):** Hub model.
- **Landing** (step 0) → **CockpitHub** (step 1) → **Preview** (step 2) → **Generator** (step 3) → **Display** (step 4)
- CockpitHub contains ALL optional panels accessible simultaneously:
  - Hook Book (drafts, rhyme, borrowed lines)
  - Journal (persona exploration, questionnaire, AI synthesis)
  - Studio (cypher, battle, analyze, juxtapose)
  - Manual Config (PIRE, duality, identity sliders)
- No forced sequence — every panel is optional, toggle-accessible
- Duality mode toggle adds shadow fields to core inputs

---

## Priority Queue

| # | Item | Status |
|---|---|---|
| 1 | `git push origin main` | 🔴 TODO — push all v3 changes |
| 2 | SSE streaming on `/api/section` | 🟠 Planned |
| 3 | Song Library (localStorage) | 🟡 Planned |
| 4 | Beat BPM suggestion in SongDisplay | 🟡 Planned |
| 5 | Sheng questionnaire UI | 🟢 Future |
| 6 | Cypher battle mode: two-AI debate | 🟢 Future |
| 7 | Spiritual layer deep integration | 🟢 Future |

---
*Generated 2026-04*
