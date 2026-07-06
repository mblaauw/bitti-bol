import json
from openai import OpenAI
from config import OPENCODE_API_KEY, OPENCODE_BASE_URL, LLM_MODEL
from services.prompt_builder import SYSTEM_PROMPT, build_user_prompt


async def generate_song(preferences):
    user_prompt = build_user_prompt(preferences)

    client = OpenAI(
        api_key=OPENCODE_API_KEY,
        base_url=OPENCODE_BASE_URL
    )

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.85,
        max_tokens=4000,
        response_format={"type": "json_object"}
    )

    raw_output = response.choices[0].message.content
    if not raw_output:
        raise ValueError(f"Empty content returned. finish_reason={response.choices[0].finish_reason}")
    parsed = json.loads(raw_output)

    return {
        "title": parsed.get("title", "Untitled"),
        "lyrics": parsed.get("lyrics", ""),
        "style": parsed.get("style", "")
    }
