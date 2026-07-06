"use client";

import { useState } from "react";
import { Music, Sparkles } from "lucide-react";
import type { SongPreferences } from "@/types";

interface Props {
  onSubmit: (prefs: SongPreferences) => void;
  isLoading: boolean;
}

const MOODS = [
  { value: "romantic", label: "Romantic" },
  { value: "longing", label: "Longing" },
  { value: "celebratory", label: "Celebratory" },
  { value: "devotional", label: "Devotional" },
  { value: "playful", label: "Playful" },
  { value: "nostalgic", label: "Nostalgic" },
];

const OCCASIONS = [
  { value: "wedding", label: "Wedding" },
  { value: "village_fair", label: "Village Fair" },
  { value: "harvest", label: "Harvest" },
  { value: "festival", label: "Festival" },
  { value: "casual", label: "Casual" },
  { value: "other", label: "Other" },
];

const INSTRUMENTS = [
  { value: "electric guitar", label: "Electric Guitar" },
  { value: "harmonium", label: "Harmonium" },
  { value: "tumbi", label: "Tumbi" },
  { value: "dholak", label: "Dholak (variations)" },
  { value: "additional flute", label: "Additional Flute" },
  { value: "shehnai", label: "Shehnai" },
];

export default function InputForm({ onSubmit, isLoading }: Props) {
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState("");
  const [occasion, setOccasion] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments(prev =>
      prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onSubmit({
      topic: topic.trim(),
      mood: mood || undefined,
      occasion: occasion || undefined,
      preferred_instruments: selectedInstruments.join(", ") || undefined,
      additional_notes: additionalNotes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Music className="w-6 h-6 text-himachali-sunset" />
        <div>
          <h1 className="text-2xl font-bold text-himachali-earth">Bitti Bol</h1>
          <p className="text-sm text-zinc-500">Himachali Pahari Song Generator</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-himachali-pine mb-1.5">
          Topic <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., chitte dandru, mountain love, apple harvest"
          className="w-full px-4 py-2.5 rounded-lg border border-himachali-wool bg-white focus:outline-none focus:ring-2 focus:ring-himachali-earth/30"
          required
        />
        <p className="text-xs text-zinc-400 mt-1">Type in any language — lyrics will always be in Himachali Pahari</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-himachali-pine mb-1.5">Mood</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-himachali-wool bg-white focus:outline-none focus:ring-2 focus:ring-himachali-earth/30"
          >
            <option value="">Any mood</option>
            {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-himachali-pine mb-1.5">Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-himachali-wool bg-white focus:outline-none focus:ring-2 focus:ring-himachali-earth/30"
          >
            <option value="">Any occasion</option>
            {OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-himachali-pine mb-1.5">Preferred Instruments</label>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map(inst => (
            <button
              key={inst.value}
              type="button"
              onClick={() => toggleInstrument(inst.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selectedInstruments.includes(inst.value)
                  ? "bg-himachali-earth text-white border-himachali-earth"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-himachali-earth/50"
              }`}
            >
              {inst.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-himachali-pine mb-1.5">Additional Notes</label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Any extra guidance for the songwriter..."
          className="w-full px-4 py-2.5 rounded-lg border border-himachali-wool bg-white focus:outline-none focus:ring-2 focus:ring-himachali-earth/30 resize-none h-20"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-himachali-earth text-white font-medium hover:bg-himachali-earth/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Sparkles size={18} />
        {isLoading ? "Generating..." : "Generate Song"}
      </button>
    </form>
  );
}
