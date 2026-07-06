"use client";

import { useState, useEffect } from "react";
import type { GeneratedSong } from "@/types";

const HISTORY_KEY = "bitti-bol-history";
const MAX_HISTORY = 20;

export function useSessionHistory() {
  const [history, setHistory] = useState<GeneratedSong[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        localStorage.removeItem(HISTORY_KEY);
      }
    }
  }, []);

  const addToHistory = (song: GeneratedSong) => {
    setHistory(prev => {
      const updated = [song, ...prev.filter(s => s.id !== song.id)].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { history, addToHistory, removeFromHistory };
}
