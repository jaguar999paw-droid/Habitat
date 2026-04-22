"""
trait_model.py — SCI ML Service
Trait scoring using semantic similarity to archetype descriptions.
"""
from emotion_model import get_model
from sentence_transformers import util
from text_normalizer import normalize_text

TRAIT_ANCHORS = {
    'introspective': 'I think deeply about everything. I reflect on my inner world and question my feelings.',
    'assertive':     'I am certain and direct. I know what I want and I say it plainly.',
    'spiritual':     'I believe in a higher purpose. Faith and the universe guide my life.',
    'streetwise':    'I grew up in the streets. I know how the real world works. I hustle.',
    'poetic':        'I speak in metaphors and imagery. I see the world through symbols and feelings.',
    'wounded':       'I carry pain. I have been hurt and broken. My scars are part of who I am.',
}

def score_traits(text: str) -> dict:
    """
    Returns dict of {trait: score} — higher score = stronger trait presence.
    """
    model = get_model()
    text = normalize_text(text)  # Normalize Unicode characters before encoding
    text_emb = model.encode(text, convert_to_tensor=True)
    scores = {}
    for trait, anchor in TRAIT_ANCHORS.items():
        anchor_emb = model.encode(anchor, convert_to_tensor=True)
        scores[trait] = round(float(util.cos_sim(text_emb, anchor_emb)), 4)
    return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
