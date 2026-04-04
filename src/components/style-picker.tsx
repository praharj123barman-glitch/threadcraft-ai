"use client";

import { cn } from "@/lib/utils";
import { threadStyles } from "@/lib/thread-styles";

interface StylePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {threadStyles.map((style) => {
        const isSelected = value === style.id;

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={cn(
              "relative text-left rounded-xl border p-5 transition-all duration-200 cursor-pointer",
              "hover:scale-[1.02] active:scale-[0.99]",
              isSelected
                ? "bg-gray-900 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "bg-gray-900/50 border-gray-800 hover:border-gray-600 hover:bg-gray-900"
            )}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{style.emoji}</span>
              <h4 className="text-base font-semibold text-white">
                {style.title}
              </h4>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              {style.description}
            </p>

            {/* Preview snippet */}
            <div
              className={cn(
                "rounded-lg p-3 border text-xs leading-relaxed italic transition-colors",
                isSelected
                  ? "bg-indigo-950/30 border-indigo-800/50 text-gray-300"
                  : "bg-gray-950/50 border-gray-800 text-gray-500"
              )}
            >
              &ldquo;{style.preview}&rdquo;
            </div>
          </button>
        );
      })}
    </div>
  );
}
