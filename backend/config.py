import os
from dotenv import load_dotenv

load_dotenv()

OPENCODE_API_KEY = os.getenv("OPENCODE_API_KEY")
OPENCODE_BASE_URL = os.getenv("OPENCODE_BASE_URL", "https://api.opencode.ai/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "deepseek-chat")

SUNO_API_KEY = os.getenv("SUNO_API_KEY")
SUNO_BASE_URL = os.getenv("SUNO_BASE_URL", "")

MAX_LYRICS_CHARS = 5000
MAX_STYLE_CHARS = 1000
MAX_TITLE_CHARS = 100

DIALECT_REGION = "Mahasuvi/Sirmauri Himachali Pahari"
