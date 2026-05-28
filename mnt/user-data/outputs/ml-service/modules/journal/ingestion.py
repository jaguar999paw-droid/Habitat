"""
Journal — Ingestion
Main entrypoint: takes raw journal text input,
runs the full NLP pipeline, builds fingerprint,
extracts hook candidates, returns a validated JournalEntry.
"""

from __future__ import annotations
from datetime import datetime
from models.journal_entry import (
    JournalEntry, AmbientContext, AuditRecord,
    ContextualEnvelope, JournalSourceType, PrivacyMode, LockState
)
from modules.journal.nlp_pipeline import run_nlp_pipeline
from modules.journal.fingerprinting import build_fingerprint
from modules.journal.hook_extractor import extract_hook_candidates


def ingest_journal_entry(
    body: str,
    title: str = None,
    source_type: str = "daily_log",
    intensity_rating: int = 5,
    lock_state: str = "LIQUID",
    location: dict = None,
    weather: str = None,
    time_of_day: str = "morning",
    privacy_mode: str = "on_device",
) -> JournalEntry:
    """
    Full pipeline:
      raw text → NLP → fingerprint → hook candidates → JournalEntry
    """
    nlp = run_nlp_pipeline(body)
    fingerprint = build_fingerprint(body)
    hook_candidates = extract_hook_candidates(body)

    ambient = AmbientContext(
        weather=weather,
        time_of_day=time_of_day,
    )

    audit = AuditRecord(
        source_type=JournalSourceType(source_type),
        privacy_mode=PrivacyMode(privacy_mode),
    )

    envelope = ContextualEnvelope(
        intensity_rating=intensity_rating,
        lock_state=LockState(lock_state),
    )

    entry = JournalEntry(
        title=title,
        body=body,
        geospatial=location or {"lat": None, "lng": None, "place_name": None},
        ambient=ambient,
        nlp=nlp,
        fingerprint=fingerprint,
        hook_candidates=[c["text"] for c in hook_candidates],
        audit=audit,
        envelope=envelope,
    )
    return entry


if __name__ == "__main__":
    sample = """
    I've been thinking about what freedom really means to me.
    Every morning I wake up and I still feel like I'm running from something.
    I want to make music that actually tells the truth.
    Last week I tried to finish a song and I just couldn't get past the second verse.
    Turns out I was scared of what I was about to say.
    I'm going to face that fear and finish it by Friday.
    Life is a locked door and I keep building new keys.
    """
    entry = ingest_journal_entry(sample, title="Morning Pages", source_type="reflection")
    print(entry.model_dump_json(indent=2))
