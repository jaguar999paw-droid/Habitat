"""
emotion_model.py — SCI ML Service
Semantic emotion detection using sentence-transformers + cosine similarity.
Model: paraphrase-MiniLM-L6-v2 (80MB, CPU-friendly, fits 3.8GB RAM)
"""
from sentence_transformers import SentenceTransformer, util
from text_normalizer import normalize_text

# Singleton — loaded once at startup, reused for all requests
_model = None

EMOTION_ANCHORS = {
    'anger':         'I am furious, full of rage, burning with resentment',
    'sadness':       'I feel empty, broken, lost and grieving alone',
    'defiance':      'I refuse to submit, I will fight back and resist',
    'longing':       'I miss what was, I wish for what could be',
    'pride':         'I am strong, I earned this, I built myself from nothing',
    'confusion':     'I do not understand, I am lost and uncertain about everything',
    'joy':           'I feel free, alive, grateful and full of light',
    'vulnerability': 'I am exposed, afraid, fragile and in need of safety',
}

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
    return _model

def detect_emotions(text: str) -> list:
    """
    Returns list of {emotion, score} sorted by score descending.
    """
    model = get_model()
    text = normalize_text(text)  # Normalize Unicode characters before encoding
    text_emb = model.encode(text, convert_to_tensor=True)
    scores = {}
    for emotion, anchor in EMOTION_ANCHORS.items():
        anchor_emb = model.encode(anchor, convert_to_tensor=True)
        scores[emotion] = float(util.cos_sim(text_emb, anchor_emb))
    return sorted(
        [{'emotion': e, 'score': round(s, 4)} for e, s in scores.items()],
        key=lambda x: x['score'], reverse=True
    )
