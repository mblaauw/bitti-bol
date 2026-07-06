"use client";

import { Clock, Trash2 } from "lucide-react";
import type { GeneratedSong } from "@/types";

interface Props {
  history: GeneratedSong[];
  onSelect: (song: GeneratedSong) => void;
  onRemove: (id: string) => void;
}

export default function SessionHistory({ history, onSelect, onRemove }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
        <Clock size={14} />
        Session History
      </h3>
      <div className="space-y-2">
        {history.map((song) => (
          <div
            key={song.id}
            className="group flex items-center justify-between p-3 rounded-lg border border-himachali-wool bg-white/50 hover:bg-white cursor-pointer transition-colors"
            onClick={() => onSelect(song)}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-himachali-earth truncate">{song.title}</p>
              <p className="text-xs text-zinc-400 truncate">{song.topic}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(song.id);
              }}
              className="p-1.5 rounded-md text-zinc-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
