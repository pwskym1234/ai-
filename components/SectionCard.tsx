import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ title, action, children, className }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={cn("rounded-[20px] bg-white p-4 shadow-sm", className)}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? <h2 className="text-[17px] font-semibold text-slate-900">{title}</h2> : <span />}
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
