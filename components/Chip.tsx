"use client";

import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full px-3 text-[13px] font-medium transition",
        selected ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600",
      )}
    >
      {label}
    </button>
  );
}
