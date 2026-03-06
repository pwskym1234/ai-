"use client";

import * as React from "react";
import { motion } from "framer-motion";

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
  footer?: React.ReactNode;
}

export default function BottomSheet({ open, onOpenChange, title, description, children, footer }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[24px] border-0 bg-white p-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex h-full flex-col"
        >
          <div className="px-4 pt-3">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />
            <div className="pb-4 pt-3">
              <SheetHeader>
                <SheetTitle className="text-[18px] font-semibold">{title}</SheetTitle>
                {description ? <SheetDescription>{description}</SheetDescription> : null}
              </SheetHeader>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6">{children}</div>
          {footer ? <div className="border-t border-slate-100 bg-white px-4 py-3">{footer}</div> : null}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
