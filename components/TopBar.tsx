"use client";

import { usePathname } from "next/navigation";

import AiAdjustDialog from "@/components/AiAdjustDialog";

const titleMap: Record<string, string> = {
  "/home": "대시보드",
  "/grocery": "장보기",
  "/pantry": "팬트리",
  "/profile": "설정",
  "/styleguide": "스타일가이드",
};

export default function TopBar() {
  const pathname = usePathname();

  const title = Object.entries(titleMap).find(([key]) => pathname.startsWith(key))?.[1] ?? "AI 영양사";

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <h1 className="text-[22px] font-semibold text-slate-900">{title}</h1>
        <AiAdjustDialog compact />
      </div>
    </header>
  );
}
