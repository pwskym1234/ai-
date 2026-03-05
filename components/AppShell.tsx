"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

interface AppShellProps {
  children: ReactNode;
}

const hideShellPaths = ["/", "/onboarding"];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideShell = hideShellPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-background">
      <TopBar />
      <main className="px-4 pb-28 pt-2">{children}</main>
      <BottomNav />
    </div>
  );
}
