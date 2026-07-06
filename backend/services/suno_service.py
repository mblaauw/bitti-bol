import httpx
import asyncio
from config import SUNO_API_KEY, SUNO_BASE_URL

BASE_URL = f"{SUNO_BASE_URL}/api/v1"
HEADERS = {
    "Authorization": f"Bearer {SUNO_API_KEY}",
    "Content-Type": "application/json",
}

SUNO_MODEL = "V5"


async def submit_to_suno(lyrics: str, style: str, title: str) -> dict:
    async with httpx.AsyncClient() as client:
        payload = {
            "prompt": lyrics,
            "style": style,
            "title": title,
            "customMode": True,
            "instrumental": False,
            "model": SUNO_MODEL,
            "callBackUrl": "https://api.sunoapi.org/callback",
        }

        response = await client.post(
            f"{BASE_URL}/generate",
            headers=HEADERS,
            json=payload,
            timeout=30,
        )

        result = response.json()

        if not response.is_success or result.get("code") != 200:
            raise Exception(f"Suno submission failed: {result.get('msg', 'Unknown error')}")

        return {"task_id": result["data"]["taskId"]}


async def poll_suno_status(task_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        for _ in range(180):
            response = await client.get(
                f"{BASE_URL}/generate/record-info?taskId={task_id}",
                headers={"Authorization": f"Bearer {SUNO_API_KEY}"},
                timeout=15,
            )

            result = response.json()

            if not response.is_success or result.get("code") != 200:
                raise Exception(f"Status check failed: {result.get('msg', 'Unknown error')}")

            data = result["data"]
            status = data["status"]

            if status in ("SUCCESS", "FIRST_SUCCESS"):
                return {
                    "status": "completed",
                    "tracks": [
                        {
                            "id": track["id"],
                            "title": track["title"],
                            "audio_url": track["audioUrl"],
                            "stream_audio_url": track.get("streamAudioUrl", ""),
                            "image_url": track.get("imageUrl", ""),
                            "duration": track.get("duration", 0),
                            "tags": track.get("tags", ""),
                        }
                        for track in data["response"].get("sunoData", [])
                    ],
                }

            if status == "TEXT_SUCCESS":
                continue

            if status in ("CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "SENSITIVE_WORD_ERROR", "CALLBACK_EXCEPTION"):
                return {
                    "status": "failed",
                    "error": data.get("errorMessage", f"Generation failed: {status}"),
                }

            await asyncio.sleep(5)

        return {"status": "timeout", "error": "Generation timed out after 15 minutes"}
