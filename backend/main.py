from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime

from models.schemas import SongGenerationRequest, SongGenerationResponse, GeneratedSong, LyricsBlock, StyleBlock, SunoSubmissionRequest, SunoSubmissionResponse, SunoTrack
from services.llm_service import generate_song
from services.validator import validate_lyrics, validate_style
from utils.dialect_validator import validate_dialect
from services.suno_service import submit_to_suno, poll_suno_status

app = FastAPI(title="Bitti Bol — Himachali Pahari Music Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_RETRIES = 3


@app.post("/api/generate", response_model=SongGenerationResponse)
async def generate(request: SongGenerationRequest):
    for attempt in range(MAX_RETRIES):
        try:
            raw_song = await generate_song(request.preferences)

            if not raw_song.get("lyrics") or not raw_song.get("style"):
                raise ValueError(f"Missing fields in generation: {raw_song}")

            lyrics_validation = validate_lyrics(raw_song["lyrics"])
            style_validation = validate_style(raw_song["style"])

            dialect_check = await validate_dialect(raw_song["lyrics"])

            all_warnings = []
            all_warnings.extend(lyrics_validation["warnings"])
            all_warnings.extend(style_validation["warnings"])

            if not dialect_check.get("is_authentic", True):
                issues = dialect_check.get("issues_found", [])
                all_warnings.append(f"Dialect concerns: {'; '.join(issues)}")

                if dialect_check.get("confidence", 0) < 0.7:
                    if attempt < MAX_RETRIES - 1:
                        continue

            song = GeneratedSong(
                id=str(uuid.uuid4()),
                title=raw_song["title"],
                lyrics=LyricsBlock(
                    content=raw_song["lyrics"],
                    char_count=lyrics_validation["char_count"],
                    validation_warnings=lyrics_validation["warnings"]
                ),
                style=StyleBlock(
                    content=raw_song["style"],
                    char_count=style_validation["char_count"],
                    validation_warnings=style_validation["warnings"]
                ),
                generated_at=datetime.utcnow(),
                topic=request.preferences.topic,
                is_valid=lyrics_validation["is_valid"] and style_validation["is_valid"],
                warnings=all_warnings
            )

            return SongGenerationResponse(success=True, song=song)

        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
            continue

    raise HTTPException(status_code=500, detail="Max retries exceeded")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/submit-to-suno", response_model=SunoSubmissionResponse)
async def submit_to_suno_endpoint(request: SunoSubmissionRequest):
    try:
        result = await submit_to_suno(
            lyrics=request.lyrics,
            style=request.style,
            title=request.title,
        )

        task_id = result["task_id"]
        poll_result = await poll_suno_status(task_id)

        if poll_result["status"] == "completed":
            tracks = [SunoTrack(**t) for t in poll_result["tracks"]]
            return SunoSubmissionResponse(success=True, task_id=task_id, status="completed", tracks=tracks)

        return SunoSubmissionResponse(
            success=False,
            task_id=task_id,
            status=poll_result["status"],
            error=poll_result.get("error", "Generation failed"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suno submission failed: {str(e)}")


@app.post("/api/submit-to-suno-async", response_model=SunoSubmissionResponse)
async def submit_to_suno_async(request: SunoSubmissionRequest):
    try:
        result = await submit_to_suno(
            lyrics=request.lyrics,
            style=request.style,
            title=request.title,
        )
        return SunoSubmissionResponse(success=True, task_id=result["task_id"], status="submitted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suno submission failed: {str(e)}")


@app.get("/api/suno-status/{task_id}", response_model=SunoSubmissionResponse)
async def check_suno_status(task_id: str):
    try:
        poll_result = await poll_suno_status(task_id)

        if poll_result["status"] == "completed":
            tracks = [SunoTrack(**t) for t in poll_result["tracks"]]
            return SunoSubmissionResponse(success=True, task_id=task_id, status="completed", tracks=tracks)

        return SunoSubmissionResponse(
            success=False,
            task_id=task_id,
            status=poll_result["status"],
            error=poll_result.get("error", "Still processing"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
