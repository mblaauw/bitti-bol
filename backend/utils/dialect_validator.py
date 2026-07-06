import json
from openai import OpenAI
from config import OPENCODE_API_KEY, OPENCODE_BASE_URL, LLM_MODEL


VALIDATOR_PROMPT = """You are a Himachali Pahari language expert specializing in Mahasuvi/Sirmauri dialects.

Analyze the following song lyrics and determine if they are in authentic Mahasuvi/Sirmauri Himachali Pahari dialect.

Check for:
1. Pahari-specific vocabulary (not standard Hindi)
2. Correct grammatical patterns
3. No contamination from Punjabi, standard Hindi, or Urdu

Respond with JSON only:
{
  "is_authentic": true/false,
  "confidence": 0.0-1.0,
  "issues_found": ["list of specific issues"],
  "hindi_words_found": ["words that should be Pahari alternatives"]
}"""


async def validate_dialect(lyrics: str) -> dict:
    client = OpenAI(
        api_key=OPENCODE_API_KEY,
        base_url=OPENCODE_BASE_URL
    )

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": VALIDATOR_PROMPT},
            {"role": "user", "content": f"Validate these lyrics:\n\n{lyrics[:3000]}"}
        ],
        temperature=0.2,
        max_tokens=4000,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    if not raw:
        raise ValueError(f"Empty validator response. finish={response.choices[0].finish_reason}")
    return json.loads(raw)
