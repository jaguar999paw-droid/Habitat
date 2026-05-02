"""
Journal Entry Schema
Part of the HabitaT / sci-songwriting-engine identity extraction pipeline.
Captures the "Backstage Self" â€” raw, unfiltered, private writing
that feeds psychological and linguistic identity modelling.
"""

from __future__ import annotations
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime


class TimeOfDay(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"


class JournalSourceType(str, Enum):
    DREAM_JOURNAL = "dream_journal"    # high metaphor / abstract
    DAILY_LOG = "daily_log"            # high concrete detail
    FIELD_NOTE = "field_note"          # real-time observation
    REFLECTION = "reflection"          # retrospective analysis


class DataProvenance(str, Enum):
    USER_INPUT = "user_input"
    AI_AUGMENTED = "ai_augmented"
    THIRD_PARTY = "third_party"


class PrivacyMode(str, Enum):
    ON_DEVICE = "on_device"
    DIFFERENTIAL_PRIVACY = "differential_privacy"
    CLOUD = "cloud"


class LockState(str, Enum):
    LOCKED = "LOCKED"
    LIQUID = "LIQUID"


class AmbientContext(BaseModel):
    weather: Optional[str] = None
    noise_level: Optional[str] = None
    time_of_day: TimeOfDay = TimeOfDay.MORNING


class ExtractedEntities(BaseModel):
    people: List[str] = Field(default_factory=list)
    places: List[str] = Field(default_factory=list)
    brands: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)


class SentimentProfile(BaseModel):
    valence: float = 0.0
    arousal: float = 0.0
    dominant_emotion: str = "neutral"


class NLPExtracted(BaseModel):
    entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    sentiment: SentimentProfile = Field(default_factory=SentimentProfile)
    value_pillars: List[str] = Field(default_factory=list)
    intentions: List[str] = Field(default_factory=list)
    outcomes: List[str] = Field(default_factory=list)
    identity_growth_delta: float = 0.0
    ai_generated: bool = True


class BigFive(BaseModel):
    openness: Optional[float] = None
    conscientiousness: Optional[float] = None
    extraversion: Optional[float] = None
    agreeableness: Optional[float] = None
    neuroticism: Optional[float] = None


class PsychologicalProfile(BaseModel):
    big_five: BigFive = Field(default_factory=BigFive)
    mbti_suggestion: Optional[str] = None
    self_labeled_traits: List[str] = Field(default_factory=list)
    ai_suggested_traits: List[str] = Field(default_factory=list)
    ai_generated: bool = True


class LinguisticFingerprint(BaseModel):
    avg_sentence_complexity: float = 0.0
    vocabulary_diversity_ttr: float = 0.0
    frequent_metaphors: List[str] = Field(default_factory=list)
    vocabulary_era: str = "millennial"
    reading_grade_level: float = 0.0


class HITLRecord(BaseModel):
    ai_tags_confirmed: List[str] = Field(default_factory=list)
    ai_tags_rejected: List[str] = Field(default_factory=list)
    corrections: Dict[str, Any] = Field(default_factory=dict)
    last_reviewed: Optional[datetime] = None


class AuditRecord(BaseModel):
    source_type: JournalSourceType = JournalSourceType.DAILY_LOG
    data_provenance: DataProvenance = DataProvenance.USER_INPUT
    hitl_verified: bool = False
    hitl_history: List[HITLRecord] = Field(default_factory=list)
    privacy_mode: PrivacyMode = PrivacyMode.ON_DEVICE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    schema_type: str = "CreativeWork"
    schema_version: str = "1.0"


class ContextualEnvelope(BaseModel):
    intensity_rating: int = Field(default=5, ge=1, le=10)
    lock_state: LockState = LockState.LIQUID
    modifiability_note: Optional[str] = None


class JournalEntry(BaseModel):
    entry_id: str = Field(default_factory=lambda: str(uuid4()))
    title: Optional[str] = None
    body: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    geospatial: dict = Field(default_factory=lambda: {"lat": None, "lng": None, "place_name": None})
    ambient: AmbientContext = Field(default_factory=AmbientContext)
    nlp: NLPExtracted = Field(default_factory=NLñxtracted)
    psychological: PsychologicalProfile = Field(default_factory=PsychologicalProfile)
    fingerprint: LinguisticFingerprint = Field(default_factory=LinguisticFingerprint)
    hook_candidates: List[str] = Field(default_factory=list)
    audit: AuditRecord = Field(default_factory=AuditRecord)
    envelope: ContextualEnvelope = Field(default_factory=ContextualEnvelope)

    class Config:
        use_enum_values = True
