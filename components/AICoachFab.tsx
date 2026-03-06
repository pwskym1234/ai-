"use client";

import { useEffect, useState } from "react";
import { MessageCircleMore, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import { Input } from "@/components/ui/input";
import { QUICK_COACH_PROMPTS } from "@/lib/content";
import { getProfile, setProfile } from "@/lib/storage";

const coachGoalByPrompt: Record<string, string> = {
  "편식 빼고 추천": "편식",
  "20분 내 요리": "체중",
  "내 재료 우선": "장건강",
  "혈당 중심": "혈당",
};

export default function AICoachFab() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const applyCoach = (value: string) => {
    const profile = getProfile();
    const matchedGoal =
      Object.entries(coachGoalByPrompt).find(([label]) => value.includes(label))?.[1] ||
      (value.includes("혈당") ? "혈당" : value.includes("내 재료") ? "장건강" : profile.primaryGoal);

    setProfile({
      ...profile,
      primaryGoal: matchedGoal,
      goals: Array.from(new Set([matchedGoal, ...profile.goals])),
    });

    toast.success("AI 코치가 조정했어요(모의)");
    setOpen(false);
    setPrompt("");
  };

  if (!mounted) return null;

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-white shadow-lg"
      >
        <MessageCircleMore className="h-4 w-4" />
        <span className="text-[13px] font-semibold">AI 코치</span>
      </motion.button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="AI 코치"
        description="빠른 프롬프트나 직접 입력으로 이번 주 식단 방향을 조정해보세요."
      >
        <div className="space-y-4 pb-24">
          <div className="flex flex-wrap gap-2">
            {QUICK_COACH_PROMPTS.map((item) => (
              <Chip
                key={item}
                label={item}
                onClick={() => {
                  setPrompt(item);
                }}
              />
            ))}
          </div>
          <div className="rounded-[20px] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[13px] text-slate-500">
              <Sparkles className="h-4 w-4 text-orange-500" />
              규칙 기반 mock 코치가 목표와 조건을 조정합니다.
            </div>
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="예: 20분 내 요리로 다시 맞춰줘"
              className="h-12 rounded-2xl bg-slate-50"
            />
          </div>
          <PrimaryButton className="w-full" onClick={() => applyCoach(prompt)} disabled={!prompt.trim()}>
            적용(모의)
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
