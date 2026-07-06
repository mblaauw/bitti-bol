"use client";

import CopyButton from "./CopyButton";
import ValidationWarnings from "./ValidationWarnings";
import type { StyleBlock as StyleBlockType } from "@/types";

interface Props {
  style: StyleBlockType;
  onChange: (content: string) => void;
}

export default function StyleBlock({ style, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-himachali-pine">Style</h2>
        <CopyButton text={style.content} />
      </div>
      <textarea
        value={style.content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[80px] p-4 rounded-lg border border-himachali-wool bg-white font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-himachali-earth/30"
        spellCheck={false}
      />
      <ValidationWarnings
        warnings={style.validation_warnings}
        charCount={style.char_count}
        maxChars={1000}
      />
    </div>
  );
}
