"""
Hook Book — Ingestion
Main entrypoint: takes raw text input, runs the full pipeline,
returns a validated HookEntry ready for storage.
"""

from __future__ import annotations
from models.hook_entry import HookEntry, SourceType
from modules.hook_book.linguistic_parser import parse_linguistic_features
from modules.hook_book.semantic_scorer import score_semantic_features
from modules.hook_book.classifier import classify_material, classify_vocabulary


def ingest_hook(
    text: str,
    source_type: str = "improvisation",
    lock_state: str = "LIQUID",
    intensity_rating: int = 5,
    location: dict = None,
    weather_context: str = None,
) -> HookEntry:
    """
    Full pipeline:
      raw text → linguistic features → semantic features → classification → HookEntry
    """
    linguistic = parse_linguistic_features(text)
    semantic = score_semantic_features(text)
    classification = classify_material(
        sentiment_delta=semantic.sentiment_delta,
        cliche_score=semantic.cliche_score,
        is_title_candidate=semantic.is_title_candidate,
        syllable_count=linguistic.syllable_count,
        rhyme_density=linguistic.rhyme_density,
        lock_state=lock_state,
    )
    classification.intensity_rating = intensity_rating
    vocabulary = classify_vocabulary(text)

    entry = HookEntry(
        raw_text=text,
        source_type=SourceType(source_type),
        location=location or {"lat": None, "lng": None},
        weather_context=weather_context,
        linguistic=linguistic,
        semantic=semantic,
        classification=classification,
        vocabulary=vocabulary,
    )
    return entry


if __name__ == "__main__":
    sample = "I've been burning bridges just to feel the light"
    entry = ingest_hook(sample, source_type="improvisation", intensity_rating=8)
    print(entry.model_dump_json(indent=2))
