"""
Identity — Vector Builder
Aggregates Hook Book entries and Journal entries
into a single IdentityVector for the generation layer.
"""

from __future__ import annotations
from statistics import mean
from typing import List
from models.hook_entry import HookEntry
from models.journal_entry import JournalEntry
from models.identity_vector import (
    IdentityVector, PsychologicalVector, LinguisticVector,
    ThematicVector, RhythmicVector, EmotionalVector, VocabularyVector
)
from datetime import datetime


def build_identity_vector(
    user_id: str,
    hook_entries: List[HookEntry],
    journal_entries: List[JournalEntry],
) -> IdentityVector:

    sources = []
    if hook_entries:
        sources.append("hook_book")
    if journal_entries:
        sources.append("journal")

    # ── Psychological (from Journal) ──────────────────────────────────────────
    all_traits = []
    mbti_votes = []
    for j in journal_entries:
        all_traits.extend(j.psychological.self_labeled_traits)
        if j.psychological.mbti_suggestion:
            mbti_votes.append(j.psychological.mbti_suggestion)

    psychological = PsychologicalVector(
        dominant_traits=list(set(all_traits))[:5],
        mbti=max(set(mbti_votes), key=mbti_votes.count) if mbti_votes else None,
    )

    # ── Linguistic (from Journal fingerprints) ────────────────────────────────
    if journal_entries:
        fps = [j.fingerprint for j in journal_entries]
        avg_complexity = mean(f.avg_sentence_complexity for f in fps)
        avg_diversity = mean(f.vocabulary_diversity_ttr for f in fps)
        avg_grade = mean(f.reading_grade_level for f in fps)
        all_metaphors = []
        for f in fps:
            all_metaphors.extend(f.frequent_metaphors)
        era_votes = [f.vocabulary_era for f in fps]
        era = max(set(era_votes), key=era_votes.count)
    else:
        avg_complexity = avg_diversity = avg_grade = 0.0
        all_metaphors = []
        era = "millennial"

    # Era from Hook Book vocabulary (supplement if available)
    if hook_entries:
        hook_eras = [h.vocabulary.era for h in hook_entries]
        hook_era = max(set(hook_eras), key=hook_eras.count)
        social_tag = hook_entries[-1].vocabulary.social_identity_tag
    else:
        hook_era = era
        social_tag = ""

    linguistic = LinguisticVector(
        avg_sentence_complexity=round(avg_complexity, 2),
        vocabulary_diversity=round(avg_diversity, 3),
        reading_grade_level=round(avg_grade, 2),
        frequent_metaphors=list(set(all_metaphors))[:5],
        era=era,
        social_identity_tag=social_tag,
    )

    # ── Thematic ──────────────────────────────────────────────────────────────
    all_value_pillars = []
    all_themes = []
    all_tags = []

    for j in journal_entries:
        all_value_pillars.extend(j.nlp.value_pillars)
    for h in hook_entries:
        all_value_pillars.extend(h.semantic.value_pillars)
        all_themes.extend(h.semantic.thematic_tags)
        all_tags.extend(h.semantic.thematic_tags)

    def top_n(items, n=5):
        from collections import Counter
        return [item for item, _ in Counter(items).most_common(n)]

    thematic = ThematicVector(
        value_pillars=top_n(all_value_pillars),
        recurring_themes=top_n(all_themes),
        thematic_tags=top_n(all_tags),
    )

    # ── Rhythmic (from Hook Book) ─────────────────────────────────────────────
    if hook_entries:
        avg_rhyme = mean(h.linguistic.rhyme_density for h in hook_entries)
        avg_syllable = mean(h.linguistic.syllable_count for h in hook_entries)
        avg_symmetry = mean(h.linguistic.line_symmetry_score for h in hook_entries)
        meter_votes = [h.linguistic.meter if hasattr(h.linguistic, 'meter') else "free"
                       for h in hook_entries]
    else:
        avg_rhyme = avg_syllable = avg_symmetry = 0.0
        meter_votes = ["free"]

    rhythmic = RhythmicVector(
        meter_preference=max(set(meter_votes), key=meter_votes.count),
        avg_rhyme_density=round(avg_rhyme, 3),
        avg_syllable_count=round(avg_syllable, 1),
        preferred_line_symmetry=round(avg_symmetry, 3),
    )

    # ── Emotional (from Journal + Hook Book) ──────────────────────────────────
    all_emotions = []
    all_valence = []
    all_intensity = []

    for j in journal_entries:
        all_emotions.append(j.nlp.sentiment.dominant_emotion)
        all_valence.append(j.nlp.sentiment.valence)
    for h in hook_entries:
        all_intensity.append(h.classification.intensity_rating)

    dominant_emotion = (
        max(set(all_emotions), key=all_emotions.count) if all_emotions else "neutral"
    )

    emotional = EmotionalVector(
        dominant_emotion=dominant_emotion,
        avg_valence=round(mean(all_valence), 3) if all_valence else 0.0,
        avg_intensity=round(mean(all_intensity), 1) if all_intensity else 5.0,
        emotion_range=list(set(all_emotions)),
    )

    # ── Vocabulary ────────────────────────────────────────────────────────────
    vocabulary = VocabularyVector(
        era=era,
        diversity_score=round(avg_diversity, 3),
        metaphor_clusters=list(set(all_metaphors))[:5],
    )

    # ── Confidence ───────────────────────────────────────────────────────────
    # More data = more confidence
    data_points = len(hook_entries) + len(journal_entries)
    confidence = min(data_points / 20, 1.0)

    return IdentityVector(
        user_id=user_id,
        generated_at=datetime.utcnow(),
        sources=sources,
        hook_entry_count=len(hook_entries),
        journal_entry_count=len(journal_entries),
        psychological=psychological,
        linguistic=linguistic,
        thematic=thematic,
        rhythmic=rhythmic,
        emotional=emotional,
        vocabulary=vocabulary,
        confidence_score=round(confidence, 3),
        audit_trail=[f"Built from {len(hook_entries)} hooks + {len(journal_entries)} journal entries"],
    )
