"""
conflict_model.py — SCI ML Service
Conflict classification using sentence embedding cosine similarity.
"""
from emotion_model import get_model
from sentence_transformers import util
from text_normalizer import normalize_text

CONFLICT_ANCHORS = {
    'identity_rejection': 'I am not what they say I am. I refuse their definition of me.',
    'external_judgment':  'People judge me and see me wrongly. The world misunderstands who I am.',
    'transformation':     'I have changed. I am no longer who I used to be. I am becoming.',
    'stagnation':         'I am stuck. I cannot escape this cycle. Everything stays the same.',
    'duality':            'I live between two worlds. I belong to both and neither at the same time.',
    'isolation':          'I am alone. No one understands me. I stand by myself.',
    'ancestral_tension':  'I carry the weight of my family and roots. My blood defines and burdens me.',
    'place_identity':     'Where I come from shapes who I am. My environment made me.',
}

def classify_conflicts(text: str) -> dict:
    """
    Returns dict of {conflict_type: probability} sorted by value descending.
    """
    model = get_model()
    text = normalize_text(text)  # Normalize Unicode characters before encoding
    text_emb = model.encode(text, convert_to_tensor=True)
    scores = {}
    for conflict, anchor in CONFLICT_ANCHORS.items():
        anchor_emb = model.encode(anchor, convert_to_tensor=True)
        scores[conflict] = round(float(util.cos_sim(text_emb, anchor_emb)), 4)
    return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
