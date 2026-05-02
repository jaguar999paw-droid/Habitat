"""
Hook Book Entry Schema
Part of the HabitaT / sci-songwriting-engine identity extraction pipeline.
Every hook captured by the user passes through this schema before storage.
"""

from __future__ import annotations
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime


class SourceType(str, Enum):
    DREAM_JOURNAL = "dream_journal"
    DAILY_LOG = "daily_log"
    IMPROVISATION = "improvisation"
    EXTERNAL_QUOTE = "external_quote"
    RHYME_SEARCH = "rhyme_search"
    JOURNAL_EXTRACT = "journal_extract"


class SentenceType(str, Enum):
    DECLARATIVE = "declarative"
    INTERROGATIVE = "interrogative"
    EXCLAMATORY = "exclamatory"
    IMPERATIVE = "imperative"
    FRAGMENT = "fragment"


class HumorType(str, Enum):
    WORDPLAY = "wordplay"
    SARCASM = "sarcasm"
    ABSURDIST = "absurdist"
    NONE = "none"


class PoetryForm(str, Enum):
    FREE_VERSE = "free_verse"
    HAIKU = "haiku"
    COUPLET = "couplet"
    QUATRAIN = "quatrain"
    NONE = "none"


class MaterialType(str, Enum):
    HOOK = "HOOK"
    VERSE = "VERSE"
    TITLE = "TITLE"
    CONCEPT = "CONCEPT"
    BRIDGE = "BRIDGE"


class LockState(str, Enum):
    LOCKED = "LOCKED"   # AI read-only — user loves it exactly as is
    LIQUID = "LIQUID"   # AI may suggest rhythmic/rhyming variations


class VocabularyEra(str, Enum):
    GEN_Z = "gen_z"
    MILLENNIAL = "millennial"
    VINTAGE = "vintage"
    ACADEMIC = "academic"
    FOLK = "folk"


class LinguisticFeatures(BaseModel):
    sentence_type: Optional[SentenceType] = None
    figures_of_speech: List[str] = Field(default_factory=list)
    idioms: List[str] = Field(default_factory=list)
    humor_type: HumorType = HumorType.NONE
    poetry_form: PoetryForm = PoetryForm.NONE
    syllable_count: int = 0
    stress_pattern: str = ""          # e.g. "u-s-u-s-u"
    rhyme_density: float = 0.0        # 0-1; proxy for "sonic glue"
    line_symmetry_score: float = 0.0  # balance of line A vs line B


class SemanticFeatures(BaseModel):
    is_title_candidate: bool = False
    sentiment_delta: float = 0.0      # emotional "turn" magnitude
    cliche_score: float = 0.0         # 0-1; 1 = very cliched
    originality_percentile: float = 0.0
    thematic_tags: List[str] = Field(default_factory=list)
    value_pillars: List[str] = Field(default_factory=list)


class RhythmicFeatures(BaseModel):
    meter: str = "free"               # iambic | trochaic | anapestic | free
    rhyme_zone_suggestions: List[str] = Field(default_factory=list)
    masterwriter_matches: List[str] = Field(default_factory=list)
    beat_pocket_fit: Optional[float] = None  # 0-1 fit score


class Classification(BaseModel):
    material_type: MaterialType = MaterialType.CONCEPT
    intensity_rating: int = Field(default=5, ge=1, le=10)
    lock_state: LockState = LockState.LIQUID
    ai_confidence: float = 0.0
    ai_generated: bool = False


class VocabularyProfile(BaseModel):
    era: VocabularyEra = VocabularyEra.MILLENNIAL
    social_identity_tag: str = ""     # cool | storyteller | poet | activist


class Provenance(BaseModel):
    input_method: str = "typed"       # typed | voice | imported
    ai_augmented: bool = False
    human_verified: bool = False
    audit_events: List[str] = Field(default_factory=list)


class HookEntry(BaseModel):
    entry_id: str = Field(default_factory=lambda: str(uuid4()))
    raw_text: str
    source_type: SourceType = SourceType.IMPROVISATION
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    location: dict = Field(default_factory=lambda: {"lat": None, "lng": None})
    weather_context: Optional[str] = None

    linguistic: LinguisticFeatures = Field(default_factory=LinguisticFeatures)
    semantic: SemanticFeatures = Field(default_factory=SemanticFeatures)
    rhythmic: RhythmicFeatures = Field(default_factory=RhythmicFeatures)
    classification: Classification = Field(default_factory=Classification)
    vocabulary: VocabularyProfile = Field(default_factory=VocabularyProfile)
    provenance: Provenance = Field(default_factory=Provenance)

    class Config:
        use_enum_values = True
