"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarDays, Sparkles, Target, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import Chip from "@/components/Chip";
import PrimaryButton from "@/components/PrimaryButton";
import RowItem from "@/components/RowItem";
import SectionCard from "@/components/SectionCard";
import SwapSheet from "@/components/SwapSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { recipes } from "@/data/recipes";
import { buildCartFromMealPlan, calcCartTotal, generateMealPlan, getSwapOptions } from "@/lib/mockEngine";
import { getCart, getMealPlan, getPantry, getProfile, seedIfEmpty, setCart, setMealPlan } from "@/lib/storage";
import { MealPlanItem, PantryItem, UserProfile } from "@/lib/types";
import { difficultyLabel } from "@/lib/content";
import { DAY_LABELS } from "@/lib/utils";

const COACH_CARD_KEY = "ai-nutri-coach-card-dismissed";

function getTodayIndex(): MealPlanItem["dayIndex"] {
  const jsDay = new Date().getDay();
  return (jsDay === 0 ? 6 : jsDay - 1) as MealPlanItem["dayIndex"];
}

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [pantry, setPantryState] = useState<PantryItem[]>([]);
  const [mealPlan, setMealPlanState] = useState<MealPlanItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swapTarget, setSwapTarget] = useState<MealPlanItem | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [daySheetItem, setDaySheetItem] = useState<MealPlanItem | null>(null);
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [coachCardVisible, setCoachCardVisible] = useState(false);
  const [adjustSimilar, setAdjustSimilar] = useState(true);
  const [adjustKids, setAdjustKids] = useState(true);
  const [adjustPantry, setAdjustPantry] = useState(true);

  useEffect(() => {
    seedIfEmpty();
    window.setTimeout(() => {
      const nextProfile = getProfile();
      const nextPantry = getPantry();
      const nextMealPlan = getMealPlan();
      const nextCart = getCart();

      setProfileState(nextProfile);
      setPantryState(nextPantry);
      setMealPlanState(nextMealPlan);
      setCartTotal(calcCartTotal(nextCart));
      setCoachCardVisible(window.localStorage.getItem(COACH_CARD_KEY) !== "1");
      setLoading(false);
    }, 950);
  }, []);

  const sortedMealPlan = useMemo(() => [...mealPlan].sort((a, b) => a.dayIndex - b.dayIndex), [mealPlan]);
  const confirmedCount = useMemo(() => mealPlan.filter((item) => item.confirmed).length, [mealPlan]);
  const recipeMap = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), []);

  const todayItem = useMemo(() => {
    return sortedMealPlan.find((item) => item.dayIndex === getTodayIndex()) ?? sortedMealPlan[0] ?? null;
  }, [sortedMealPlan]);

  const persistPlan = (nextPlan: MealPlanItem[]) => {
    if (!profile) return;
    const nextCart = buildCartFromMealPlan(profile, nextPlan, recipes);
    setMealPlanState(nextPlan);
    setMealPlan(nextPlan);
    setCart(nextCart);
    setCartTotal(calcCartTotal(nextCart));
  };

  const handleConfirm = (target: MealPlanItem) => {
    const next = mealPlan.map((item) => (item.id === target.id ? { ...item, confirmed: !item.confirmed } : item));
    persistPlan(next);
    toast.success(target.confirmed ? "저녁 확정을 해제했어요" : "저녁을 확정했어요");
  };

  const handleRegenerate = () => {
    if (!profile) return;
    const next = generateMealPlan(profile, pantry, 7);
    persistPlan(next);
    toast.success("이번 주 식단을 다시 생성했어요");
  };

  const handleAdjust = () => {
    if (!profile) return;

    const next = mealPlan.map((item) => {
      const candidates = getSwapOptions({
        profile,
        pantry,
        current: item,
        preferSimilarTime: adjustSimilar,
        preferKids: adjustKids,
        preferPantry: adjustPantry,
      });

      const candidate = candidates[0];
      if (!candidate) return item;

      return {
        ...candidate,
        id: item.id,
        dayIndex: item.dayIndex,
        confirmed: false,
      };
    });

    persistPlan(next);
    toast.success("조정 조건으로 다시 추천했어요");
  };

  const dismissCoachCard = () => {
    window.localStorage.setItem(COACH_CARD_KEY, "1");
    setCoachCardVisible(false);
  };

  const renderMealVisual = (item: MealPlanItem) => {
    const recipe = recipeMap.get(item.recipeId);
    if (!recipe) return null;

    return (
      <div className="relative h-[160px] w-full overflow-hidden rounded-[20px]">
        <Image src={recipe.imagePath} alt={recipe.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
      </div>
    );
  };

  if (loading || !profile) {
    return (
      <div className="space-y-4">
        <SectionCard className="overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,237,213,0.95))]">
          <Skeleton className="mb-3 h-6 w-28 bg-slate-200/80" />
          <Skeleton className="h-24 w-full bg-slate-200/80" />
        </SectionCard>
        <SectionCard>
          <Skeleton className="h-56 w-full bg-slate-200/80" />
        </SectionCard>
        <SectionCard>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full bg-slate-200/80" />
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-2">
      <SectionCard className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,237,213,0.9))] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.18),transparent_36%)]" />
        <div className="relative space-y-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-slate-900">이번 주 요약</h2>
            <Button size="sm" variant="secondary" className="rounded-full" onClick={handleRegenerate}>
              다시 생성
            </Button>
          </div>
          <RowItem title="대표 목표" subtitle={profile.primaryGoal} leading={<Target className="h-4 w-4" />} showChevron={false} />
          <RowItem
            title="장보기 설정"
            subtitle={`${profile.shoppingWindowDays}일 · ${profile.storeProvider === "oasis" ? "오아시스" : "쿠팡"}`}
            leading={<Wallet className="h-4 w-4" />}
            showChevron={false}
          />
          <RowItem
            title="확정 수 / 예상 총액"
            subtitle={`${confirmedCount}/7 끼 확정`}
            value={`${cartTotal.toLocaleString("ko-KR")}원`}
            leading={<CalendarDays className="h-4 w-4" />}
            showChevron={false}
          />
        </div>
      </SectionCard>

      {todayItem ? (
        <SectionCard title="오늘 저녁">
          <div className="space-y-4">
            {renderMealVisual(todayItem)}
            <div>
              <p className="text-[22px] font-semibold text-slate-900">{todayItem.title}</p>
              <p className="mt-1 text-[13px] text-slate-500">
                {todayItem.cookTimeMin}분 · {difficultyLabel(todayItem.difficulty)}
              </p>
            </div>
            <p className="text-[13px] text-slate-600">{todayItem.reason}</p>
            <PrimaryButton className="w-full" onClick={() => handleConfirm(todayItem)}>
              {todayItem.confirmed ? "확정 해제" : "오늘 저녁 확정"}
            </PrimaryButton>
            <RowItem
              title="다른 메뉴로 교체"
              subtitle="비슷한 조리시간과 조건으로 다시 고를 수 있어요."
              onClick={() => {
                setSwapTarget(todayItem);
                setSwapOpen(true);
              }}
            />
            <RowItem title="상세 레시피 보기" subtitle="재료와 조리 단계를 확인해요." onClick={() => router.push(`/meal/${todayItem.id}`)} />
          </div>
        </SectionCard>
      ) : null}

      <AnimatePresence>
        {coachCardVisible ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <SectionCard title="AI 코치로 조정해보세요">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[13px] text-slate-500">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  편식 제외, 20분 내 요리, 내 재료 우선 같은 빠른 조정을 바로 적용할 수 있어요.
                </div>
                <Button variant="secondary" className="w-full rounded-xl" onClick={dismissCoachCard}>
                  이해했어요
                </Button>
              </div>
            </SectionCard>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SectionCard title="이번 주 식단">
        <div className="space-y-1">
          {sortedMealPlan.map((item) => (
            <RowItem
              key={item.id}
              title={`${DAY_LABELS[item.dayIndex]} · ${item.title}`}
              subtitle={item.confirmed ? "확정됨" : item.reason}
              value={`${item.cookTimeMin}분`}
              onClick={() => {
                setDaySheetItem(item);
                setDaySheetOpen(true);
              }}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="조정 카드">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Chip label="조리시간 유사" selected={adjustSimilar} onClick={() => setAdjustSimilar((prev) => !prev)} />
            <Chip label="아이 선호" selected={adjustKids} onClick={() => setAdjustKids((prev) => !prev)} />
            <Chip label="내 재료 우선" selected={adjustPantry} onClick={() => setAdjustPantry((prev) => !prev)} />
          </div>
          <PrimaryButton className="w-full" onClick={handleAdjust}>
            이 조건으로 다시 추천(모의)
          </PrimaryButton>
        </div>
      </SectionCard>

      <BottomSheet
        open={daySheetOpen}
        onOpenChange={setDaySheetOpen}
        title={daySheetItem ? `${DAY_LABELS[daySheetItem.dayIndex]} 저녁` : "요일 상세"}
        footer={
          daySheetItem ? (
            <PrimaryButton className="w-full" onClick={() => handleConfirm(daySheetItem)}>
              {daySheetItem.confirmed ? "확정 해제" : "이 날 저녁 확정"}
            </PrimaryButton>
          ) : null
        }
      >
        {daySheetItem ? (
          <div className="space-y-4">
            {renderMealVisual(daySheetItem)}
            <div className="rounded-[20px] bg-white p-4 shadow-sm">
              <p className="text-[20px] font-semibold text-slate-900">{daySheetItem.title}</p>
              <p className="mt-1 text-[13px] text-slate-500">
                {daySheetItem.cookTimeMin}분 · {difficultyLabel(daySheetItem.difficulty)}
              </p>
              <p className="mt-3 text-[13px] text-slate-600">{daySheetItem.reason}</p>
            </div>
            <RowItem
              title="메뉴 교체"
              subtitle="다른 후보 중에서 하나를 골라 바꿔요."
              onClick={() => {
                setSwapTarget(daySheetItem);
                setSwapOpen(true);
                setDaySheetOpen(false);
              }}
            />
            <RowItem title="상세 레시피로 이동" subtitle="재료와 순서를 확인해요." onClick={() => router.push(`/meal/${daySheetItem.id}`)} />
          </div>
        ) : null}
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
