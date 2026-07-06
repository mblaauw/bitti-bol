from config import MAX_LYRICS_CHARS, MAX_STYLE_CHARS


def validate_lyrics(lyrics: str) -> dict:
    warnings = []
    char_count = len(lyrics)

    if char_count > MAX_LYRICS_CHARS:
        warnings.append(f"Lyrics block exceeds {MAX_LYRICS_CHARS} characters ({char_count}). Suno may truncate.")

    required_tags = ["[Verse", "[Chorus]", "[Intro]"]
    for tag in required_tags:
        if tag not in lyrics:
            warnings.append(f"Missing structural element: {tag}")

    if "[Outro]" not in lyrics:
        warnings.append("Consider adding [Outro] for complete song structure")

    return {
        "char_count": char_count,
        "warnings": warnings,
        "is_valid": len([w for w in warnings if "Missing" in w or "exceeds" in w]) == 0
    }


def validate_style(style: str) -> dict:
    warnings = []
    char_count = len(style)

    if char_count > MAX_STYLE_CHARS:
        warnings.append(f"Style block exceeds {MAX_STYLE_CHARS} characters ({char_count}). Suno may truncate.")

    if "Himachali" not in style and "Pahari" not in style:
        warnings.append("Style block should mention Himachali/Pahari foundation")

    return {
        "char_count": char_count,
        "warnings": warnings,
        "is_valid": len([w for w in warnings if "exceeds" in w]) == 0
    }
