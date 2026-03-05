"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  total: number;
  current: number;
}

export default function Stepper({ total, current }: StepperProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>단계 {current + 1}</span>
        <span>{total}단계</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <div key={index} className={cn("h-2 rounded-full", index <= current ? "bg-primary" : "bg-muted")} />
        ))}
      </div>
    </div>
  );
}
