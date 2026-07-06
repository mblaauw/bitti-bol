"use client";

import { useState } from "react";
import type { SongPreferences, GeneratedSong } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useGenerateSong() {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<GeneratedSong | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (preferences: SongPreferences) => {
    setIsLoading(true);
    setError(null);
    setSong(null);

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error((detail as { detail?: string }).detail || `Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSong(data.song);
      return data.song as GeneratedSong;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, song, isLoading, error };
}
