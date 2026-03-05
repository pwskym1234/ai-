"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { products } from "@/data/products";
import { recipes } from "@/data/recipes";
import { getCart, getMealPlan, getProfile, setCart, setMealPlan } from "@/lib/storage";
import { CartItem, MealPlanItem } from "@/lib/types";
import { DAY_LABELS, uid } from "@/lib/utils";

export default function MealDetailPage() {
  const params = useParams<{ mealId: string }>();
  const router = useRouter();
  const [daySelect, setDaySelect] = useState("0");

  const profile = getProfile();
  const mealPlan = getMealPlan();
  const cart = getCart();

  const meal = useMemo(() => mealPlan.find((item) => item.id === params.mealId), [mealPlan, params.mealId]);
  const recipe = useMemo(() => recipes.find((item) => item.id === meal?.recipeId), [meal?.recipeId]);

  if (!meal || !recipe) {
    return <div className="py-20 text-center text-muted-foreground">메뉴를 찾을 수 없습니다.</div>;
  }

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
    toast.success("선택한 요일 메뉴를 교체했어요");
    router.push("/home");
  };

  return (
    <div className="space-y-4 pb-6">
      <Card>
        <CardHeader>
          <CardTitle>{recipe.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-52 rounded-lg border bg-muted/60" />
          <p className="text-sm text-muted-foreground">
            조리시간 {recipe.cookTimeMin}분 · 난이도 {recipe.difficulty}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>재료</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.name} className="flex items-center justify-between rounded border px-3 py-2">
                <span>{ingredient.name}</span>
                <span className="text-muted-foreground">
                  {ingredient.qty}
                  {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>조리 단계</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {recipe.steps.map((step, index) => (
              <li key={step} className="rounded border px-3 py-2">
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>대체 재료</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {recipe.substitutions.map((sub) => (
            <div key={sub.from} className="rounded border px-3 py-2">
              {sub.from} → {sub.to.join(", ")}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={mergeRecipeIntoCart}>장바구니에 담기(모의)</Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">이 메뉴로 교체</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>요일 선택</DialogTitle>
              <DialogDescription>교체할 요일을 선택하세요.</DialogDescription>
            </DialogHeader>
            <Select value={daySelect} onValueChange={setDaySelect}>
              <SelectTrigger>
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
            <DialogFooter>
              <Button onClick={replaceMenuByDay}>적용</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
