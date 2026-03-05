"use client";

import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onOpenChange, title, description, children }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[24px] border-0 bg-white p-0">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />
        <div className="px-4 pb-4 pt-3">
          <SheetHeader>
            <SheetTitle className="text-[18px] font-semibold">{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
        </div>
        <div className="h-[calc(90vh-72px)] overflow-y-auto px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
