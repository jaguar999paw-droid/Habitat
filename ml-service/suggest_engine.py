"""
suggest_engine.py — SCI ML Service
Real-time suggestive writing analysis for HookBook and Journal editors.

Returns:
  warns      — issues to flag (syllable variance, no rhyme, short lines)
  alerts     — positive detections (alliteration, anaphora, rhyme scheme)
  spectrum   — 5-axis emotion intensity (energy/darkness/vulnerability/defiance/hope)
  textMagic  — word-level annotations for inline decoration
  nextLines  — contextual next-line suggestions (pattern-based, no model needed)
"""

import re
from hookbook_service import (
    analyze_lines_syllables, detect_end_rhyme_scheme,
    detect_devices, get_rhymes
)

# ── Emotion keyword maps ───────────────────────────────────────────────────────
_SPECTRUM = {
    'energy':        r'\b(fire|burn|rage|rise|run|fight|break|crash|fly|rush|blast|charge|explode|ignite|roar)\b',
    'darkness':      r'\b(dark|lost|pain|death|empty|hollow|void|cold|alone|shadow|grave|bleed|shatter|drown|black)\b',
    'vulnerability': r'\b(hurt|cry|afraid|weak|soft|tender|gentle|fragile|scared|open|bare|raw|quiet|still)\b',
    'defiance':      r"\\b(refuse|never|won't|defy|stand|resist|fight|bold|proud|strong|hold|won't|dare|push)\b",
    'hope':          r'\b(light|dream|rise|climb|trust|bright|new|born|free|open|heal|tomorrow|believe|shine)\b',
}

# ── Rhyme group color palette (cycles through 5) ──────────────────────────────
_RHYME_STYLES = ['underline-magenta', 'underline-cyan', 'underline-amber', 'underline-green', 'underline-blue']


def suggest_inline(lines: list, text: str) -> dict:
    """
    Full suggestive analysis on a list of lyric lines.
    Returns warns, alerts, spectrum, textMagic, nextLines.
    """
    warns = []
    alerts = []
    text_magic = []

    if not lines:
        return {
            'warns': [], 'alerts': [],
            'spectrum': {k: 0 for k in _SPECTRUM},
            'textMagic': [], 'nextLines': [],
        }

    # ── Syllable analysis ─────────────────────────────────────────────────────
    syl_data = analyze_lines_syllables(lines)
    totals = [d['total'] for d in syl_data if d['total'] > 0]

    if len(totals) >= 2:
        variance = max(totals) - min(totals)
        if variance > 8:
            warns.append({
                'type': 'syllable_variance', 'severity': 'high',
                'message': f'Lines vary by {variance} syllables ({min(totals)}–{max(totals)}) — big rhythmic gap',
            })
        elif variance > 4:
            warns.append({
                'type': 'syllable_variance', 'severity': 'medium',
                'message': f'Syllable imbalance ({min(totals)}–{max(totals)}) — consider tightening',
            })

    # Very short lines
    short_lines = [(i, d['total']) for i, d in enumerate(syl_data) if 0 < d['total'] < 4]
    for li, sc in short_lines[:2]:
        warns.append({
            'type': 'short_line', 'severity': 'low',
            'message': f'Line {li + 1} is only {sc} syllable{"s" if sc != 1 else ""} — might feel clipped',
        })

    # ── Rhyme scheme ──────────────────────────────────────────────────────────
    scheme = ''
    rhyme_groups = {}  # letter → [{'lineIndex': int, 'word': str}]

    if len(lines) >= 2:
        scheme = detect_end_rhyme_scheme(lines)
        unique_letters = set(scheme)

        if len(unique_letters) == len(scheme) and len(scheme) >= 4:
            warns.append({
                'type': 'no_rhyme', 'severity': 'medium',
                'message': 'No end rhymes found — add some sonic anchors',
            })
        elif len(unique_letters) <= len(scheme) - 1:
            alerts.append({
                'type': 'rhyme_scheme', 'scheme': scheme,
                'message': f'Rhyme scheme: {scheme}',
            })

        # Build rhyme groups for text magic
        for i, line in enumerate(lines):
            ws = re.findall(r"[\w']+", line.lower())
            if ws and i < len(scheme):
                letter = scheme[i]
                if letter not in rhyme_groups:
                    rhyme_groups[letter] = []
                rhyme_groups[letter].append({'lineIndex': i, 'word': ws[-1]})

    # ── Literary devices ──────────────────────────────────────────────────────
    devices = detect_devices(lines)

    for hit in devices.get('alliteration', []):
        alerts.append({
            'type': 'alliteration',
            'message': f"Alliteration on '{hit['letter']}': {', '.join(hit['words'][:4])}",
            'words': hit['words'],
        })

    for hit in devices.get('anaphora', []):
        alerts.append({
            'type': 'anaphora',
            'message': f"Anaphora — '{hit['word']}' opens consecutive lines",
        })

    for hit in devices.get('epistrophe', []):
        alerts.append({
            'type': 'epistrophe',
            'message': f"Epistrophe — '{hit['word']}' closes consecutive lines",
        })

    # ── Emotion spectrum ──────────────────────────────────────────────────────
    lower = text.lower()
    spectrum = {}
    for axis, pattern in _SPECTRUM.items():
        matches = len(re.findall(pattern, lower))
        spectrum[axis] = min(100, matches * 18)

    # ── Text magic annotations ────────────────────────────────────────────────
    color_idx = 0

    # Rhyme-end word highlights
    for letter, group in rhyme_groups.items():
        if len(group) > 1:
            style = _RHYME_STYLES[color_idx % len(_RHYME_STYLES)]
            color_idx += 1
            for item in group:
                li = item['lineIndex']
                word = item['word']
                line = lines[li]
                idx = line.lower().rfind(word)
                if idx >= 0:
                    text_magic.append({
                        'lineIndex': li, 'start': idx, 'end': idx + len(word),
                        'type': 'rhyme', 'style': style, 'group': letter,
                    })

    # Alliteration word bold-green
    for hit in devices.get('alliteration', []):
        li = hit['line'] - 1
        if 0 <= li < len(lines):
            line = lines[li]
            for word in hit['words']:
                idx = line.lower().find(word)
                if idx >= 0:
                    text_magic.append({
                        'lineIndex': li, 'start': idx, 'end': idx + len(word),
                        'type': 'alliteration', 'style': 'bold-green',
                    })

    # ── Next-line pattern suggestions ─────────────────────────────────────────
    next_lines = _suggest_next_lines(lines, scheme, devices)

    return {
        'warns': warns,
        'alerts': alerts,
        'spectrum': spectrum,
        'textMagic': text_magic,
        'nextLines': next_lines,
        'syllables': [{'line': d['line'], 'total': d['total']} for d in syl_data],
        'scheme': scheme,
    }


# ── Next-line pattern generators ──────────────────────────────────────────────
_CONTINUATIONS = {
    'interrogative': [
        "And who's left to answer that?",
        "Or maybe the silence knows.",
        "Tell me — does it still feel real?",
    ],
    'imperative': [
        "Stand where the fire won't follow.",
        "Hold what the night tried to take.",
        "Let the echo carry it.",
    ],
    'declarative': [
        "And still the clock forgets to move.",
        "Something shifts beneath the words.",
        "The weight of it stays unnamed.",
    ],
    'exclamatory': [
        "Nothing left to prove to them.",
        "Every wall I built — for what?",
        "And it burns like it should.",
    ],
}

_DEFIANCE_LINES = [
    "I was not made for their version.",
    "Keep the crown — I built my own.",
    "They named me wrong from the start.",
]

_HOPE_LINES = [
    "But light still finds the smallest cracks.",
    "Even the dark ends somewhere forward.",
    "There's a version where I make it.",
]

_DARK_LINES = [
    "And the hollow becomes a room.",
    "I sleep where the forgetting lives.",
    "Pain has a shape — I know it well.",
]


def _suggest_next_lines(lines: list, scheme: str, devices: dict) -> list:
    """Generate 2-3 contextual next-line suggestions based on the current state."""
    if not lines:
        return []

    last = lines[-1].strip().lower()
    suggestions = []

    # Detect sentence type of last line
    if last.endswith('?'):
        pool = _CONTINUATIONS['interrogative']
    elif last.endswith('!'):
        pool = _CONTINUATIONS['exclamatory']
    elif re.match(r'^(don\'t|never|always|stop|let|be|hold|run|rise|stand|fight)', last):
        pool = _CONTINUATIONS['imperative']
    else:
        pool = _CONTINUATIONS['declarative']

    suggestions.append(pool[len(lines) % len(pool)])

    # Suggest a rhyming next line based on last word of current last line
    ws = re.findall(r"[\w']+", last)
    if ws:
        last_word = ws[-1]
        rhymes = get_rhymes(last_word, 5)
        if rhymes:
            target = rhymes[0]
            theme_lines = [l for l in _DARK_LINES + _HOPE_LINES + _DEFIANCE_LINES if target in l.lower()]
            if theme_lines:
                suggestions.append(theme_lines[0])
            else:
                suggestions.append(f"... (rhymes with '{last_word}': {', '.join(rhymes[:4])})")

    # Tonal continuation
    lower_all = ' '.join(lines).lower()
    if any(w in lower_all for w in ['refuse', 'never', 'stand', 'bold', 'defy']):
        suggestions.append(_DEFIANCE_LINES[len(lines) % len(_DEFIANCE_LINES)])
    elif any(w in lower_all for w in ['dark', 'pain', 'lost', 'hollow', 'alone']):
        suggestions.append(_DARK_LINES[len(lines) % len(_DARK_LINES)])
    elif any(w in lower_all for w in ['light', 'hope', 'rise', 'dream', 'free']):
        suggestions.append(_HOPE_LINES[len(lines) % len(_HOPE_LINES)])

    return list(dict.fromkeys(suggestions))[:3]  # dedupe, max 3
