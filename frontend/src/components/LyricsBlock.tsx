"use client";

import CopyButton from "./CopyButton";
import ValidationWarnings from "./ValidationWarnings";
import type { LyricsBlock as LyricsBlockType } from "@/types";

interface Props {
  lyrics: LyricsBlockType;
  onChange: (content: string) => void;
}

export default function LyricsBlock({ lyrics, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-himachali-pine">Lyrics</h2>
        <CopyButton text={lyrics.content} />
      </div>
      <textarea
        value={lyrics.content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[300px] p-4 rounded-lg border border-himachali-wool bg-white font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-himachali-earth/30"
        spellCheck={false}
      />
      <ValidationWarnings
        warnings={lyrics.validation_warnings}
        charCount={lyrics.char_count}
        maxChars={5000}
      />
    </div>
  );
}
