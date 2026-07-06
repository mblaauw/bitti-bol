"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-himachali-wool" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-himachali-earth animate-spin" />
      </div>
      <p className="text-himachali-earth font-medium animate-pulse">
        Composing your song...
      </p>
      <p className="text-zinc-500 text-sm">
        Generating lyrics in Mahasuvi/Sirmauri dialect
      </p>
    </div>
  );
}
