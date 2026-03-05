"use client";

import { DAY_LABELS, cn } from "@/lib/utils";

interface WeekCalendarProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export default function WeekCalendar({ selectedDay, onSelectDay }: WeekCalendarProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {DAY_LABELS.map((label, index) => (
        <button
          key={label}
          onClick={() => onSelectDay(index)}
          className={cn(
            "rounded-lg border px-2 py-3 text-base font-medium",
            selectedDay === index ? "border-primary bg-primary/10 text-primary" : "border-border bg-card",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
