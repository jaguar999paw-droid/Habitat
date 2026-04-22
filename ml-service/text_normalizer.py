"""
text_normalizer.py — SCI ML Service
Utility to normalize Unicode text before encoding to prevent ByteString conversion errors.
Handles em-dashes, smart quotes, and other typographic Unicode characters.
"""
import unicodedata
import re


def normalize_text(text: str) -> str:
    """
    Normalize Unicode text to prevent encoding errors in sentence-transformers.
    
    Handles:
    - Smart quotes (U+201C, U+201D, U+2018, U+2019) → regular quotes
    - Em-dashes (U+2014) → hyphens
    - En-dashes (U+2013) → hyphens
    - Ellipsis (U+2026) → three dots
    - Other typographic Unicode characters
    
    Args:
        text: Input text that may contain Unicode characters
        
    Returns:
        Normalized text safe for sentence-transformers encoding
    """
    if not text or not isinstance(text, str):
        return text
    
    # Replace common typographic characters with ASCII equivalents
    replacements = {
        '\u201C': '"',  # LEFT DOUBLE QUOTATION MARK
        '\u201D': '"',  # RIGHT DOUBLE QUOTATION MARK
        '\u2018': "'",  # LEFT SINGLE QUOTATION MARK
        '\u2019': "'",  # RIGHT SINGLE QUOTATION MARK
        '\u2014': '-',  # EM DASH
        '\u2013': '-',  # EN DASH
        '\u2026': '...',  # HORIZONTAL ELLIPSIS
        '\u2010': '-',  # HYPHEN
        '\u2011': '-',  # NON-BREAKING HYPHEN
        '\u00AD': '',   # SOFT HYPHEN (remove)
    }
    
    for unicode_char, ascii_equiv in replacements.items():
        text = text.replace(unicode_char, ascii_equiv)
    
    # Decompose remaining accented characters where possible
    # (converts é → e, ñ → n, etc.)
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    return text
