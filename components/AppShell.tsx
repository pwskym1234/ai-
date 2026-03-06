"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

import AICoachFab from "@/components/AICoachFab";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-background">
      <TopBar />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="px-4 pb-28 pt-2"
      >
        {children}
      </motion.main>
      <AICoachFab />
      <BottomNav />
    </div>
  );
}
