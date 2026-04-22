"""
app.py — SCI ML Microservice
Flask API on port 3002 providing semantic NLP for the SCI songwriting engine.

Endpoints:
  POST /ml/analyze  — full text analysis (emotions, conflicts, traits, language)
  POST /ml/embed    — raw sentence embeddings
  GET  /ml/health   — service status
"""

import os
import sys
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

# Lazy imports — loaded at first request or startup warm-up
from emotion_model  import detect_emotions, get_model
from conflict_model import classify_conflicts
from trait_model    import score_traits
from language_model import detect_language
from text_normalizer import normalize_text

app = Flask(__name__)
CORS(app)

_startup_time = time.time()
_model_loaded = False

def warm_up():
    """Pre-load the sentence-transformer model at startup (avoids cold-start latency)."""
    global _model_loaded
    try:
        get_model()  # triggers singleton load
        _model_loaded = True
        print(f"[SCI-ML] Model loaded in {time.time() - _startup_time:.1f}s", flush=True)
    except Exception as e:
        print(f"[SCI-ML] Model load failed: {e}", flush=True)


@app.route('/ml/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok' if _model_loaded else 'loading',
        'model': 'paraphrase-MiniLM-L6-v2',
        'loaded': _model_loaded,
        'uptime_s': round(time.time() - _startup_time, 1),
    })


@app.route('/ml/analyze', methods=['POST'])
def analyze():
    """
    Body: { text: string }
    Returns: { emotions, conflicts, traits, languageMix, confidence }
    """
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()

    if not text:
        return jsonify({'error': 'text is required'}), 400
    if not _model_loaded:
        return jsonify({'error': 'model not yet loaded'}), 503

    try:
        emotions   = detect_emotions(text)
        conflicts  = classify_conflicts(text)
        traits     = score_traits(text)
        lang       = detect_language(text)

        # Confidence = average of top emotion score + top conflict score
        top_emotion_score  = emotions[0]['score']  if emotions  else 0
        top_conflict_score = list(conflicts.values())[0] if conflicts else 0
        confidence = round((top_emotion_score + top_conflict_score) / 2, 4)

        return jsonify({
            'emotions':    emotions,
            'conflicts':   conflicts,
            'traits':      traits,
            'languageMix': lang,
            'confidence':  confidence,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/ml/embed', methods=['POST'])
def embed():
    """
    Body: { texts: [string] }
    Returns: { embeddings: [[float]] }
    """
    data  = request.get_json(silent=True) or {}
    texts = data.get('texts', [])
    if not texts or not isinstance(texts, list):
        return jsonify({'error': 'texts array is required'}), 400
    if not _model_loaded:
        return jsonify({'error': 'model not yet loaded'}), 503
    try:
        model  = get_model()
        # Normalize each text before encoding to prevent ByteString conversion errors
        normalized_texts = [normalize_text(t) if isinstance(t, str) else t for t in texts]
        embeds = model.encode(normalized_texts).tolist()
        return jsonify({'embeddings': embeds})
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# ── Hook Book Routes (mounted on existing Flask app) ──────────────────────────
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from hookbook_service import (
    analyze_line_syllables, analyze_lines_syllables,
    get_rhymes, get_near_rhymes, get_stress_pattern, classify_meter,
    detect_end_rhyme_scheme, detect_devices, grammar_check,
    suggest_synonyms, score_verse_coherence
)

@app.route('/hookbook/syllables', methods=['POST'])
def hb_syllables():
    """POST {line: str} or {lines: [str]} — syllable breakdown"""
    d = request.get_json(silent=True) or {}
    if 'lines' in d:
        return jsonify(analyze_lines_syllables(d['lines']))
    elif 'line' in d:
        return jsonify(analyze_line_syllables(d['line']))
    return jsonify({'error': 'line or lines required'}), 400

@app.route('/hookbook/rhymes', methods=['POST'])
def hb_rhymes():
    """POST {word: str, near: bool} — perfect + near rhymes"""
    d = request.get_json(silent=True) or {}
    word = d.get('word','')
    if not word: return jsonify({'error': 'word required'}), 400
    near = bool(d.get('near', True))
    result = {'word': word, 'rhymes': get_rhymes(word)}
    if near: result['near_rhymes'] = get_near_rhymes(word, 15)
    return jsonify(result)

@app.route('/hookbook/stress', methods=['POST'])
def hb_stress():
    """POST {line: str} — stress pattern + meter classification"""
    d = request.get_json(silent=True) or {}
    line = d.get('line','')
    if not line: return jsonify({'error': 'line required'}), 400
    pattern = get_stress_pattern(line)
    meter = classify_meter(pattern)
    return jsonify({'line': line, 'pattern': pattern, 'meter': meter})

@app.route('/hookbook/scheme', methods=['POST'])
def hb_scheme():
    """POST {lines: [str]} — end rhyme scheme detection"""
    d = request.get_json(silent=True) or {}
    lines = d.get('lines',[])
    if not lines: return jsonify({'error': 'lines required'}), 400
    scheme = detect_end_rhyme_scheme(lines)
    return jsonify({'scheme': scheme, 'lines': lines})

@app.route('/hookbook/devices', methods=['POST'])
def hb_devices():
    """POST {lines: [str]} — literary device detection"""
    d = request.get_json(silent=True) or {}
    lines = d.get('lines',[])
    if not lines: return jsonify({'error': 'lines required'}), 400
    return jsonify(detect_devices(lines))

@app.route('/hookbook/grammar', methods=['POST'])
def hb_grammar():
    """POST {text: str, artistic_mode: bool} — grammar intelligence"""
    d = request.get_json(silent=True) or {}
    text = d.get('text','')
    if not text: return jsonify({'error': 'text required'}), 400
    return jsonify(grammar_check(text, d.get('artistic_mode', True)))

@app.route('/hookbook/synonyms', methods=['POST'])
def hb_synonyms():
    """POST {word: str} — songwriting synonym suggestions"""
    d = request.get_json(silent=True) or {}
    word = d.get('word','')
    if not word: return jsonify({'error': 'word required'}), 400
    return jsonify({'word': word, 'suggestions': suggest_synonyms(word)})

@app.route('/hookbook/coherence', methods=['POST'])
def hb_coherence():
    """POST {lines: [str]} — verse coherence score"""
    d = request.get_json(silent=True) or {}
    lines = d.get('lines',[])
    if not lines: return jsonify({'error': 'lines required'}), 400
    return jsonify(score_verse_coherence(lines))

@app.route('/hookbook/analyze', methods=['POST'])
def hb_full_analyze():
    """POST {lines: [str], text: str} — full Hook Book analysis in one shot"""
    d = request.get_json(silent=True) or {}
    lines = d.get('lines',[])
    text = d.get('text', chr(10).join(lines))
    if not lines and not text: return jsonify({'error': 'lines or text required'}), 400
    if not lines: lines = [l for l in text.split(chr(10)) if l.strip()]
    return jsonify({
        'syllables':  analyze_lines_syllables(lines),
        'scheme':     detect_end_rhyme_scheme(lines),
        'devices':    detect_devices(lines),
        'grammar':    grammar_check(text),
        'coherence':  score_verse_coherence(lines),
        'stress':     [{ 'line': l, 'pattern': get_stress_pattern(l), 'meter': classify_meter(get_stress_pattern(l)) } for l in lines],
    })


if __name__ == '__main__':
    warm_up()
    port = int(os.environ.get('ML_PORT', 3002))
    print(f"[SCI-ML] Starting on port {port}", flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)
