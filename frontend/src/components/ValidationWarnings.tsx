"use client";

import { AlertTriangle, Info } from "lucide-react";

interface Props {
  warnings: string[];
  charCount: number;
  maxChars: number;
}

export default function ValidationWarnings({ warnings, charCount, maxChars }: Props) {
  const nearLimit = charCount > maxChars * 0.9;
  const overLimit = charCount > maxChars;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm">
        <span className={overLimit ? "text-red-500 font-semibold" : nearLimit ? "text-amber-500" : "text-zinc-500"}>
          {charCount} / {maxChars} characters
        </span>
        {overLimit && <span className="text-red-500 text-xs">(Suno may truncate)</span>}
      </div>
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-1.5 text-sm text-amber-600">
          {w.startsWith("Missing") ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <Info size={14} className="mt-0.5 shrink-0" />}
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}
