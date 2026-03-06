import { products } from "@/data/products";
import { recipes } from "@/data/recipes";
import { CartItem, MealPlanItem, PantryItem, Recipe, StoreProvider, UserProfile } from "@/lib/types";

function containsAny(text: string, words: string[]): boolean {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word.toLowerCase()));
}

function pantryHitCount(recipe: Recipe, pantry: PantryItem[]): number {
  const pantryNames = pantry.map((item) => item.name.toLowerCase());
  return recipe.ingredients.filter((ingredient) => pantryNames.includes(ingredient.name.toLowerCase())).length;
}

function kidsScore(recipe: Recipe, profile: UserProfile): number {
  if (!profile.kids) return 0;

  let score = 0;
  for (const picky of profile.kids.pickyIngredients) {
    if (containsAny(recipe.title, [picky]) || recipe.ingredients.some((i) => containsAny(i.name, [picky]))) {
      score -= 12;
    }
  }

  for (const favorite of profile.kids.favoriteFoods) {
    if (containsAny(recipe.title, [favorite]) || recipe.ingredients.some((i) => containsAny(i.name, [favorite]))) {
      score += 9;
    }
  }

  return score;
}

function baseRecipeScore(recipe: Recipe, profile: UserProfile, pantry: PantryItem[]): number {
  let score = 0;

  if (recipe.tags.includes(profile.primaryGoal)) {
    score += 24;
  }

  score += recipe.tags.filter((tag) => profile.goals.includes(tag)).length * 7;

  const timeDiff = Math.abs(recipe.cookTimeMin - profile.cookingTimeMin);
  score += Math.max(0, 14 - Math.floor(timeDiff / 4));

  if (recipe.difficulty === profile.difficulty) {
    score += 10;
  } else {
    score += 3;
  }

  score += pantryHitCount(recipe, pantry) * 4;
  score += kidsScore(recipe, profile);

  if (profile.constraints.vegetarian && recipe.ingredients.some((ingredient) => ingredient.category === "protein" && ingredient.name !== "두부")) {
    score -= 14;
  }

  if (profile.constraints.halal && recipe.ingredients.some((ingredient) => containsAny(ingredient.name, ["돼지"]))) {
    score -= 20;
  }

  if (profile.dislikes.length > 0) {
    const dislikeHit = profile.dislikes.some((dislike) => containsAny(recipe.title, [dislike]) || recipe.ingredients.some((i) => containsAny(i.name, [dislike])));
    if (dislikeHit) score -= 10;
  }

  return score;
}

function makeReason(recipe: Recipe, profile: UserProfile, pantry: PantryItem[], includeKidsHint: boolean): string {
  const pantryHits = pantryHitCount(recipe, pantry);
  const parts: string[] = [];

  parts.push(`${profile.primaryGoal} 목표와 맞는 태그를 포함해 이번 주 저녁에 적합해요.`);

  if (pantryHits > 0) {
    parts.push(`내 재료에 있는 재료 ${pantryHits}가지를 활용해 준비 부담을 낮췄어요.`);
  }

  if (includeKidsHint && profile.kids) {
    parts.push("아이 선호 재료를 우선 반영해 거부감을 줄이도록 구성했어요.");
  }

  return parts.slice(0, 2).join(" ");
}

function toMealPlanItem(recipe: Recipe, dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6, reason: string, confirmed = false, idPrefix = "plan"): MealPlanItem {
  return {
    id: `${idPrefix}-${dayIndex}-${recipe.id}`,
    dayIndex,
    mealType: "dinner",
    recipeId: recipe.id,
    title: recipe.title,
    tags: recipe.tags,
    cookTimeMin: recipe.cookTimeMin,
    difficulty: recipe.difficulty,
    reason,
    confirmed,
  };
}

export function generateMealPlan(profile: UserProfile, pantry: PantryItem[], days = 7): MealPlanItem[] {
  const dayCount = Math.min(7, Math.max(1, days));
  const pickedIds = new Set<string>();
  const result: MealPlanItem[] = [];

  for (let day = 0; day < dayCount; day += 1) {
    const scored = recipes
      .map((recipe) => {
        const duplicatePenalty = pickedIds.has(recipe.id) ? -12 : 0;
        const dayVariation = ((day + 1) * (recipe.id.charCodeAt(1) || 3)) % 5;
        const score = baseRecipeScore(recipe, profile, pantry) + duplicatePenalty + dayVariation;
        return { recipe, score };
      })
      .sort((a, b) => b.score - a.score);

    const chosen = scored[0]?.recipe ?? recipes[day % recipes.length];
    pickedIds.add(chosen.id);

    result.push(
      toMealPlanItem(
        chosen,
        day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        makeReason(chosen, profile, pantry, !!profile.kids),
      ),
    );
  }

  return result;
}

export function getSwapOptions(args: {
  profile: UserProfile;
  pantry: PantryItem[];
  current: MealPlanItem;
  preferSimilarTime: boolean;
  preferKids: boolean;
  preferPantry: boolean;
}): MealPlanItem[] {
  const { profile, pantry, current, preferSimilarTime, preferKids, preferPantry } = args;
  const currentRecipe = recipes.find((recipe) => recipe.id === current.recipeId);

  const scored = recipes
    .filter((recipe) => recipe.id !== current.recipeId)
    .map((recipe) => {
      let score = baseRecipeScore(recipe, profile, pantry);

      if (preferSimilarTime && currentRecipe) {
        const diff = Math.abs(recipe.cookTimeMin - currentRecipe.cookTimeMin);
        score += Math.max(0, 12 - diff);
      }

      if (preferKids) {
        score += kidsScore(recipe, profile) * 1.2;
      }

      if (preferPantry) {
        score += pantryHitCount(recipe, pantry) * 6;
      }

      return { recipe, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.slice(0, 4).map(({ recipe }, index) =>
    toMealPlanItem(
      recipe,
      current.dayIndex,
      makeReason(recipe, profile, pantry, preferKids && !!profile.kids),
      false,
      `swap-${index}`,
    ),
  );
}

export function buildCartFromMealPlan(profile: UserProfile, mealPlan: MealPlanItem[], recipeList: Recipe[]): CartItem[] {
  const confirmedMealPlan = mealPlan.filter((item) => item.confirmed);
  const ingredientMap = new Map<
    string,
    { qty: number; unit: string; category: Recipe["ingredients"][number]["category"] }
  >();

  const recipeById = new Map(recipeList.map((recipe) => [recipe.id, recipe]));

  for (const plan of confirmedMealPlan) {
    const recipe = recipeById.get(plan.recipeId);
    if (!recipe) continue;

    for (const ingredient of recipe.ingredients) {
      const existing = ingredientMap.get(ingredient.name);
      if (!existing) {
        ingredientMap.set(ingredient.name, {
          qty: ingredient.qty,
          unit: ingredient.unit,
          category: ingredient.category,
        });
      } else {
        existing.qty += ingredient.qty;
      }
    }
  }

  const cart: CartItem[] = [];

  for (const [ingredientName, value] of ingredientMap.entries()) {
    const options = products.filter(
      (product) => product.store === profile.storeProvider && product.ingredientName === ingredientName,
    );

    if (options.length === 0) continue;

    cart.push({
      id: `cart-${profile.storeProvider}-${ingredientName}`,
      ingredientName,
      qtyText: `${Number.isInteger(value.qty) ? value.qty : value.qty.toFixed(1)}${value.unit}`,
      category: value.category,
      product: options[0],
      alternatives: options,
      checked: true,
    });
  }

  return cart;
}

export function remapCartItemProvider(cart: CartItem[], provider: StoreProvider): CartItem[] {
  return cart
    .map((item) => {
      const options = products.filter(
        (product) => product.store === provider && product.ingredientName === item.ingredientName,
      );

      if (options.length === 0) return null;

      const preferred = item.product.title.includes("대용량")
        ? options.find((option) => option.title.includes("대용량"))
        : options[0];

      return {
        ...item,
        id: `cart-${provider}-${item.ingredientName}`,
        product: preferred ?? options[0],
        alternatives: options,
      };
    })
    .filter((item): item is CartItem => item !== null);
}

export function calcCartTotal(cart: CartItem[]): number {
  return cart.filter((item) => item.checked).reduce((sum, item) => sum + item.product.price, 0);
}
