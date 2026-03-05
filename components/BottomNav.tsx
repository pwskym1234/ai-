"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Refrigerator, ShoppingCart, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "식단", icon: Home },
  { href: "/grocery", label: "장보기", icon: ShoppingCart },
  { href: "/pantry", label: "팬트리", icon: Refrigerator },
  { href: "/profile", label: "설정", icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-[72px] max-w-3xl grid-cols-4 px-2 pb-2 pt-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "mx-1 flex flex-col items-center justify-center gap-1 rounded-2xl text-[12px] font-medium",
                active ? "bg-orange-50 text-orange-500" : "text-slate-400",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
