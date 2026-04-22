"""
language_model.py — SCI ML Service
Language detection layering langdetect (EN/SW) + custom Sheng wordlist.
langdetect alone cannot detect Sheng — we overlay a 44-word Sheng lexicon.
"""
from text_normalizer import normalize_text

try:
    from langdetect import detect as langdetect_detect
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False

# 44-word Sheng lexicon (comprehensive, East African urban slang)
SHENG_LEXICON = [
    'manze','buda','niaje','poa','sema','fiti','mtaa','chali','dame','kama',
    'sawa','maze','kitu','vipi','rada','mambo','boss','ghali','raha','noma',
    'jaba','mbaya','safi','cheza','ingia','toa','enda','kuja','ona','jua',
    'fanya','gari','pesa','kazi','nyumba','mtu','watu','siku','usiku',
    'asubuhi','jioni','nilikuwa','wapi','hapa',
]

def detect_language(text: str) -> dict:
    """
    Returns language detection result.
    Strategy:
      1. Run langdetect for EN/SW baseline
      2. Count Sheng words — if ≥ 3 found, flag sheng: true with high confidence
    """
    text = normalize_text(text)  # Normalize Unicode characters before processing
    lower = text.lower()
    sheng_hits = [w for w in SHENG_LEXICON if w in lower]
    sheng_detected = len(sheng_hits) >= 3

    base_lang = 'en'
    if LANGDETECT_AVAILABLE:
        try:
            base_lang = langdetect_detect(text)
        except Exception:
            base_lang = 'en'

    return {
        'base': base_lang,
        'english': True,  # always present as base assumption
        'kiswahili': base_lang in ('sw', 'so'),
        'sheng': sheng_detected,
        'shengHits': len(sheng_hits),
        'shengWords': sheng_hits[:5],  # sample for debugging
        'confidence': min(len(sheng_hits) / 5, 1.0) if sheng_detected else 0.0,
    }
