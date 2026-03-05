"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Sparkles, Target, Wallet } from "lucide-react";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import RowItem from "@/components/RowItem";
import SectionCard from "@/components/SectionCard";
import SwapSheet from "@/components/SwapSheet";
import { Button } from "@/components/ui/button";
import { recipes } from "@/data/recipes";
import { buildCartFromMealPlan, generateMealPlan, getSwapOptions } from "@/lib/mockEngine";
import { getMealPlan, getPantry, getProfile, seedIfEmpty, setCart, setMealPlan } from "@/lib/storage";
import { MealPlanItem, PantryItem, UserProfile } from "@/lib/types";
import { DAY_LABELS } from "@/lib/utils";

function getTodayIndex(): MealPlanItem["dayIndex"] {
  const jsDay = new Date().getDay();
  return (jsDay === 0 ? 6 : jsDay - 1) as MealPlanItem["dayIndex"];
}

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [pantry, setPantryState] = useState<PantryItem[]>([]);
  const [mealPlan, setMealPlanState] = useState<MealPlanItem[]>([]);
  const [swapTarget, setSwapTarget] = useState<MealPlanItem | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [daySheetItem, setDaySheetItem] = useState<MealPlanItem | null>(null);
  const [daySheetOpen, setDaySheetOpen] = useState(false);

  const [adjustSimilar, setAdjustSimilar] = useState(true);
  const [adjustKids, setAdjustKids] = useState(true);
  const [adjustPantry, setAdjustPantry] = useState(true);

  useEffect(() => {
    seedIfEmpty();
    setProfileState(getProfile());
    setPantryState(getPantry());
    setMealPlanState(getMealPlan());
  }, []);

  const sortedMealPlan = useMemo(() => [...mealPlan].sort((a, b) => a.dayIndex - b.dayIndex), [mealPlan]);
  const confirmedCount = useMemo(() => mealPlan.filter((item) => item.confirmed).length, [mealPlan]);

  const todayItem = useMemo(() => {
    return sortedMealPlan.find((item) => item.dayIndex === getTodayIndex()) ?? sortedMealPlan[0] ?? null;
  }, [sortedMealPlan]);

  const persistPlan = (nextPlan: MealPlanItem[]) => {
    if (!profile) return;
    setMealPlanState(nextPlan);
    setMealPlan(nextPlan);
    const nextCart = buildCartFromMealPlan(profile, nextPlan, recipes);
    setCart(nextCart);
  };

  const toggleConfirm = (target: MealPlanItem) => {
    const next = mealPlan.map((item) =>
      item.id === target.id
        ? {
            ...item,
            confirmed: !item.confirmed,
          }
        : item,
    );

    persistPlan(next);
    toast.success(target.confirmed ? "확정을 해제했어요" : "저녁을 확정했어요");
  };

  const regeneratePlan = () => {
    if (!profile) return;
    const next = generateMealPlan(profile, pantry, 7);
    persistPlan(next);
    toast.success("식단을 다시 생성했어요");
  };

  const applyAdjustRecommendation = () => {
    if (!profile) return;

    const base = generateMealPlan(profile, pantry, 7);
    const next = base.map((item) => {
      const options = getSwapOptions({
        profile,
        pantry,
        current: item,
        preferSimilarTime: adjustSimilar,
        preferKids: adjustKids,
        preferPantry: adjustPantry,
      });

      const pick = options[0];
      if (!pick) return item;

      return {
        ...pick,
        id: item.id,
        dayIndex: item.dayIndex,
        confirmed: false,
      };
    });

    persistPlan(next);
    toast.success("조건 기반으로 식단을 재추천했어요");
  };

  if (!profile) {
    return <div className="py-20 text-center text-slate-500">불러오는 중...</div>;
  }

  return (
    <div className="space-y-4 pb-2">
      <SectionCard
        title="이번 주 요약"
        action={
          <Button size="sm" variant="secondary" onClick={regeneratePlan}>
            다시 생성(모의)
          </Button>
        }
      >
        <div className="space-y-1">
          <RowItem
            title="대표 목표"
            subtitle={profile.primaryGoal}
            leading={<Target className="h-4 w-4" />}
            onClick={() => router.push("/profile")}
          />
          <RowItem
            title="장보기 설정"
            subtitle={`${profile.shoppingWindowDays}일 · ${profile.storeProvider === "oasis" ? "오아시스" : "쿠팡"}`}
            leading={<Wallet className="h-4 w-4" />}
            onClick={() => router.push("/grocery")}
          />
          <RowItem
            title="확정된 저녁"
            subtitle={`${confirmedCount}/7 완료`}
            leading={<CalendarDays className="h-4 w-4" />}
            showChevron={false}
          />
        </div>
      </SectionCard>

      {todayItem && (
        <SectionCard title="오늘 저녁">
          <div className="space-y-3">
            <div>
              <p className="text-[20px] font-semibold text-slate-900">{todayItem.title}</p>
              <p className="mt-1 text-[13px] text-slate-500">
                {todayItem.cookTimeMin}분 · {todayItem.difficulty}
              </p>
            </div>
            <p className="line-clamp-1 text-[13px] text-slate-500">{todayItem.reason}</p>
            <div className="grid grid-cols-2 gap-2">
              <PrimaryButton onClick={() => toggleConfirm(todayItem)}>
                {todayItem.confirmed ? "확정 해제" : "확정"}
              </PrimaryButton>
              <Button
                variant="secondary"
                className="h-12 rounded-xl"
                onClick={() => {
                  setSwapTarget(todayItem);
                  setSwapOpen(true);
                }}
              >
                교체
              </Button>
            </div>
            <RowItem
              title="상세 보기"
              subtitle="레시피 재료/조리 단계 확인"
              onClick={() => router.push(`/meal/${todayItem.id}`)}
            />
          </div>
        </SectionCard>
      )}

      <SectionCard title="이번 주 식단">
        <div className="space-y-0.5">
          {sortedMealPlan.map((item) => (
            <RowItem
              key={item.id}
              title={`${DAY_LABELS[item.dayIndex]} · ${item.title}`}
              subtitle={item.confirmed ? "확정됨" : undefined}
              value={`${item.cookTimeMin}분`}
              onClick={() => {
                setDaySheetItem(item);
                setDaySheetOpen(true);
              }}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="조정/재추천">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Chip label="조리시간 유사" selected={adjustSimilar} onClick={() => setAdjustSimilar((prev) => !prev)} />
            <Chip label="아이 선호" selected={adjustKids} onClick={() => setAdjustKids((prev) => !prev)} />
            <Chip label="팬트리 우선" selected={adjustPantry} onClick={() => setAdjustPantry((prev) => !prev)} />
          </div>
          <PrimaryButton className="w-full" onClick={applyAdjustRecommendation}>
            이 조건으로 다시 추천(모의)
          </PrimaryButton>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <Sparkles className="h-3.5 w-3.5" />
            기존 mock 규칙 엔진으로만 재계산됩니다.
          </div>
        </div>
      </SectionCard>

      <BottomSheet
        open={daySheetOpen}
        onOpenChange={setDaySheetOpen}
        title={daySheetItem ? `${DAY_LABELS[daySheetItem.dayIndex]} 저녁` : "요일 상세"}
      >
        {daySheetItem && (
          <div className="space-y-4 pb-4">
            <SectionCard className="p-4" title={daySheetItem.title}>
              <div className="space-y-2">
                <p className="text-[13px] text-slate-500">
                  {daySheetItem.cookTimeMin}분 · {daySheetItem.difficulty}
                </p>
                <p className="text-[13px] text-slate-500">{daySheetItem.reason}</p>
              </div>
            </SectionCard>

            <PrimaryButton className="w-full" onClick={() => toggleConfirm(daySheetItem)}>
              {daySheetItem.confirmed ? "확정 해제" : "확정"}
            </PrimaryButton>
            <Button
              variant="secondary"
              className="h-12 w-full rounded-xl"
              onClick={() => {
                setSwapTarget(daySheetItem);
                setSwapOpen(true);
                setDaySheetOpen(false);
              }}
            >
              교체
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push(`/meal/${daySheetItem.id}`)}>
              상세 보기
            </Button>
          </div>
        )}
      </BottomSheet>

      <SwapSheet
        open={swapOpen}
        onOpenChange={setSwapOpen}
        profile={profile}
        pantry={pantry}
        current={swapTarget}
        onApplySwap={(nextItem) => {
          const next = mealPlan.map((item) => (item.id === nextItem.id ? nextItem : item));
          persistPlan(next);
        }}
      />
    </div>
  );
}
