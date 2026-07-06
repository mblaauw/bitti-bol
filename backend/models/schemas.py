from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SongPreferences(BaseModel):
    topic: str = Field(..., description="Main topic/subject hint")
    mood: Optional[str] = Field(None, description="e.g., romantic, longing, celebratory")
    occasion: Optional[str] = Field(None, description="e.g., wedding, village fair, harvest")
    preferred_instruments: Optional[str] = Field(None, description="comma-separated instruments")
    additional_notes: Optional[str] = Field(None, description="Any extra guidance")
    input_language: str = Field(default="any", description="Language of user input")


class SongGenerationRequest(BaseModel):
    preferences: SongPreferences
    session_id: Optional[str] = None


class LyricsBlock(BaseModel):
    content: str
    char_count: int
    validation_warnings: List[str] = []


class StyleBlock(BaseModel):
    content: str
    char_count: int
    validation_warnings: List[str] = []


class GeneratedSong(BaseModel):
    id: str
    title: str
    lyrics: LyricsBlock
    style: StyleBlock
    generated_at: datetime
    topic: str
    is_valid: bool
    warnings: List[str] = []


class SongGenerationResponse(BaseModel):
    success: bool
    song: GeneratedSong
    error: Optional[str] = None


class SunoSubmissionRequest(BaseModel):
    song_id: str
    lyrics: str
    style: str
    title: str


class SunoTrack(BaseModel):
    id: str
    title: str
    audio_url: str
    stream_audio_url: str = ""
    image_url: str = ""
    duration: float = 0
    tags: str = ""


class SunoSubmissionResponse(BaseModel):
    success: bool
    task_id: str = ""
    status: str = ""
    tracks: List[SunoTrack] = []
    error: Optional[str] = None
