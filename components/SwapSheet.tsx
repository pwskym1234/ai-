"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import { recipes } from "@/data/recipes";
import { difficultyLabel } from "@/lib/content";
import { getSwapOptions } from "@/lib/mockEngine";
import { MealPlanItem, PantryItem, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SwapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  pantry: PantryItem[];
  current: MealPlanItem | null;
  onApplySwap: (next: MealPlanItem) => void;
}

export default function SwapSheet({
  open,
  onOpenChange,
  profile,
  pantry,
  current,
  onApplySwap,
}: SwapSheetProps) {
  const [preferSimilarTime, setPreferSimilarTime] = useState(true);
  const [preferKids, setPreferKids] = useState(true);
  const [preferPantry, setPreferPantry] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const options = useMemo(() => {
    if (!current) return [];
    return getSwapOptions({
      profile,
      pantry,
      current,
      preferSimilarTime,
      preferKids,
      preferPantry,
    });
  }, [current, pantry, preferKids, preferPantry, preferSimilarTime, profile]);

  useEffect(() => {
    setSelectedRecipeId(options[0]?.recipeId ?? null);
  }, [options]);

  const selected = options.find((option) => option.recipeId === selectedRecipeId) ?? options[0] ?? null;

  const apply = () => {
    if (!current || !selected) return;
    onApplySwap({ ...selected, id: current.id, confirmed: false });
    toast.success("선택한 메뉴로 교체했어요");
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="메뉴 교체"
      description="취향 조건을 반영해 교체 후보를 골라보세요."
      footer={
        <PrimaryButton className="w-full" onClick={apply} disabled={!selected}>
          선택한 메뉴로 교체
        </PrimaryButton>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Chip label="조리시간 유사" selected={preferSimilarTime} onClick={() => setPreferSimilarTime((prev) => !prev)} />
          <Chip label="아이 선호" selected={preferKids} onClick={() => setPreferKids((prev) => !prev)} />
          <Chip label="내 재료 우선" selected={preferPantry} onClick={() => setPreferPantry((prev) => !prev)} />
        </div>

        <div className="space-y-2">
          {options.map((option) => {
            const recipe = recipes.find((item) => item.id === option.recipeId);
            const isSelected = selected?.recipeId === option.recipeId;

            return (
              <button
                key={option.recipeId}
                type="button"
                onClick={() => setSelectedRecipeId(option.recipeId)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm",
                  isSelected ? "ring-2 ring-orange-400" : "",
                )}
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                  {recipe ? <Image src={recipe.imagePath} alt={option.title} fill className="object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-slate-900">{option.title}</p>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {option.cookTimeMin}분 · {difficultyLabel(option.difficulty)}
                  </p>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300">
                  {isSelected && <div className="h-3 w-3 rounded-full bg-orange-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
