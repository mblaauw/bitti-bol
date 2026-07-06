"use client";

import { useState } from "react";
import { Mountain } from "lucide-react";
import InputForm from "@/components/InputForm";
import LyricsBlock from "@/components/LyricsBlock";
import StyleBlock from "@/components/StyleBlock";
import LoadingSpinner from "@/components/LoadingSpinner";
import SessionHistory from "@/components/SessionHistory";
import SunoSubmitPanel from "@/components/SunoSubmitPanel";
import { useGenerateSong } from "@/hooks/useGenerateSong";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import type { GeneratedSong, SongPreferences, LyricsBlock as LyricsBlockType, StyleBlock as StyleBlockType } from "@/types";

export default function Home() {
  const { generate, song, isLoading, error } = useGenerateSong();
  const { history, addToHistory, removeFromHistory } = useSessionHistory();
  const [editingLyrics, setEditingLyrics] = useState<LyricsBlockType | null>(null);
  const [editingStyle, setEditingStyle] = useState<StyleBlockType | null>(null);

  const handleSubmit = async (prefs: SongPreferences) => {
    const result = await generate(prefs);
    if (result) {
      addToHistory(result);
      setEditingLyrics(result.lyrics);
      setEditingStyle(result.style);
    }
  };

  const handleSelectFromHistory = (s: GeneratedSong) => {
    setEditingLyrics(s.lyrics);
    setEditingStyle(s.style);
  };

  const handleLyricsChange = (content: string) => {
    if (!editingLyrics) return;
    setEditingLyrics({ ...editingLyrics, content, char_count: content.length });
  };

  const handleStyleChange = (content: string) => {
    if (!editingStyle) return;
    setEditingStyle({ ...editingStyle, content, char_count: content.length });
  };

  const hasResult = !isLoading && editingLyrics && editingStyle;

  return (
    <div className="flex flex-1">
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {hasResult && (
          <div className="space-y-8 pb-12">
            <div className="flex items-center gap-2 border-b border-himachali-wool pb-3">
              <Mountain size={20} className="text-himachali-sunset" />
              <h2 className="text-xl font-bold text-himachali-earth">{song?.title || "Untitled"}</h2>
            </div>

            {song?.warnings && song.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm space-y-1">
                {song.warnings.map((w, i) => <p key={i}>{w}</p>)}
              </div>
            )}

            <LyricsBlock lyrics={editingLyrics} onChange={handleLyricsChange} />
            <StyleBlock style={editingStyle} onChange={handleStyleChange} />

            <div className="border-t border-himachali-wool pt-6">
              <SunoSubmitPanel
                lyrics={editingLyrics.content}
                style={editingStyle.content}
                title={song?.title || ""}
              />
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <aside className="w-64 border-l border-himachali-wool p-4 hidden lg:block">
          <SessionHistory
            history={history}
            onSelect={handleSelectFromHistory}
            onRemove={removeFromHistory}
          />
        </aside>
      )}
    </div>
  );
}
