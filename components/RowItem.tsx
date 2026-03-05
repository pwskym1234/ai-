"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface RowItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export default function RowItem({
  title,
  subtitle,
  value,
  leading,
  trailing,
  onClick,
  showChevron = true,
  className,
}: RowItemProps) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left",
        onClick ? "hover:bg-slate-50 active:bg-slate-100" : "",
        className,
      )}
    >
      {leading && <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">{leading}</div>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-slate-900">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-[12px] text-slate-500">{subtitle}</p>}
      </div>
      {value && <p className="text-[13px] font-medium text-slate-500">{value}</p>}
      {trailing}
      {!trailing && showChevron && onClick && <ChevronRight className="h-4 w-4 text-slate-400" />}
    </Comp>
  );
}
