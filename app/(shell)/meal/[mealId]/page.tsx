"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import BottomSheet from "@/components/BottomSheet";
import PrimaryButton from "@/components/PrimaryButton";
import RowItem from "@/components/RowItem";
import SectionCard from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { products } from "@/data/products";
import { recipes } from "@/data/recipes";
import { difficultyLabel } from "@/lib/content";
import { getCart, getMealPlan, getProfile, setCart, setMealPlan } from "@/lib/storage";
import { CartItem, MealPlanItem } from "@/lib/types";
import { DAY_LABELS, uid } from "@/lib/utils";

export default function MealDetailPage() {
  const params = useParams<{ mealId: string }>();
  const router = useRouter();
  const [daySelect, setDaySelect] = useState("0");
  const [replaceOpen, setReplaceOpen] = useState(false);

  const profile = getProfile();
  const mealPlan = getMealPlan();
  const cart = getCart();

  const meal = useMemo(() => mealPlan.find((item) => item.id === params.mealId), [mealPlan, params.mealId]);
  const recipe = useMemo(() => recipes.find((item) => item.id === meal?.recipeId), [meal?.recipeId]);

  if (!meal || !recipe) {
    return <div className="py-20 text-center text-slate-500">메뉴를 찾을 수 없습니다.</div>;
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/home");
  };

  const mergeRecipeIntoCart = () => {
    const nextCart = [...cart];

    for (const ingredient of recipe.ingredients) {
      const options = products.filter(
        (product) => product.store === profile.storeProvider && product.ingredientName === ingredient.name,
      );

      if (options.length === 0) continue;

      const existingIndex = nextCart.findIndex((item) => item.ingredientName === ingredient.name);
      const qtyText = `${ingredient.qty}${ingredient.unit}`;

      if (existingIndex >= 0) {
        const existing = nextCart[existingIndex];
        nextCart[existingIndex] = {
          ...existing,
          qtyText,
          alternatives: options,
          product: existing.product.store === profile.storeProvider ? existing.product : options[0],
        };
      } else {
        const added: CartItem = {
          id: uid("cart-manual"),
          ingredientName: ingredient.name,
          qtyText,
          category: ingredient.category,
          product: options[0],
          alternatives: options,
          checked: true,
        };
        nextCart.push(added);
      }
    }

    setCart(nextCart);
    toast.success("장바구니에 담았어요(모의)");
  };

  const replaceMenuByDay = () => {
    const day = Number(daySelect) as MealPlanItem["dayIndex"];
    const target = mealPlan.find((item) => item.dayIndex === day);
    if (!target) return;

    const next = mealPlan.map((item) =>
      item.id === target.id
        ? {
            ...item,
            recipeId: recipe.id,
            title: recipe.title,
            tags: recipe.tags,
            cookTimeMin: recipe.cookTimeMin,
            difficulty: recipe.difficulty,
            reason: "상세 페이지에서 사용자가 직접 선택한 메뉴로 교체했어요.",
            confirmed: false,
          }
        : item,
    );

    setMealPlan(next);
    setReplaceOpen(false);
    toast.success("선택한 요일 메뉴를 교체했어요");
    router.push("/home");
  };

  return (
    <div className="space-y-4 pb-10">
      <button type="button" onClick={handleBack} className="flex items-center gap-2 text-[15px] font-medium text-slate-700">
        <ChevronLeft className="h-5 w-5" />
        뒤로가기
      </button>

      <SectionCard>
        <div className="space-y-4">
          <div className="relative h-56 w-full overflow-hidden rounded-[22px]">
            <Image src={recipe.imagePath} alt={recipe.title} fill className="object-cover" />
          </div>
          <div>
            <p className="text-[24px] font-semibold text-slate-900">{recipe.title}</p>
            <p className="mt-1 text-[13px] text-slate-500">
              조리시간 {recipe.cookTimeMin}분 · 난이도 {difficultyLabel(recipe.difficulty)}
            </p>
          </div>
          <PrimaryButton className="w-full" onClick={mergeRecipeIntoCart}>
            장바구니에 담기(모의)
          </PrimaryButton>
          <RowItem title="이 메뉴로 교체" subtitle="원하는 요일에 이 레시피를 반영해요." onClick={() => setReplaceOpen(true)} />
        </div>
      </SectionCard>

      <SectionCard title="재료">
        <div className="space-y-2">
          {recipe.ingredients.map((ingredient) => (
            <div key={ingredient.name} className="flex items-center justify-between rounded-[16px] bg-slate-50 px-4 py-3 text-[15px]">
              <span>{ingredient.name}</span>
              <span className="text-slate-500">
                {ingredient.qty}
                {ingredient.unit}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="조리 단계">
        <div className="space-y-2">
          {recipe.steps.map((step, index) => (
            <div key={step} className="rounded-[16px] bg-slate-50 px-4 py-3 text-[15px] text-slate-700">
              {index + 1}. {step}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="대체 재료">
        <div className="space-y-2">
          {recipe.substitutions.map((sub) => (
            <div key={sub.from} className="rounded-[16px] bg-slate-50 px-4 py-3 text-[15px] text-slate-700">
              {sub.from} → {sub.to.join(", ")}
            </div>
          ))}
        </div>
      </SectionCard>

      <BottomSheet open={replaceOpen} onOpenChange={setReplaceOpen} title="이 메뉴로 교체" description="적용할 요일을 선택하세요." footer={<PrimaryButton className="w-full" onClick={replaceMenuByDay}>선택한 요일에 적용</PrimaryButton>}>
        <div className="space-y-4">
          <Select value={daySelect} onValueChange={setDaySelect}>
            <SelectTrigger className="h-11 rounded-xl bg-slate-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_LABELS.map((label, index) => (
                <SelectItem key={label} value={String(index)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BottomSheet>
    </div>
  );
}
