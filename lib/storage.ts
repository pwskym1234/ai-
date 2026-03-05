import { recipes } from "@/data/recipes";
import { buildCartFromMealPlan, generateMealPlan } from "@/lib/mockEngine";
import { CartItem, MealPlanItem, PantryItem, UserProfile } from "@/lib/types";

export const STORAGE_KEYS = {
  profile: "ai-nutri-profile",
  pantry: "ai-nutri-pantry",
  mealPlan: "ai-nutri-mealplan",
  cart: "ai-nutri-cart",
} as const;

const defaultProfile: UserProfile = {
  targetTypes: ["kids"],
  primaryGoal: "혈당",
  goals: ["혈당", "체중", "장건강"],
  constraints: {
    vegetarian: false,
    halal: false,
    allergies: [],
  },
  dislikes: [],
  cookingTimeMin: 30,
  difficulty: "easy",
  kids: {
    ages: [8],
    pickyIngredients: ["버섯"],
    favoriteFoods: ["닭", "계란"],
  },
  shoppingWindowDays: 7,
  storeProvider: "oasis",
  budget: 80000,
};

function hasWindow() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!hasWindow()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): UserProfile {
  return readJSON<UserProfile>(STORAGE_KEYS.profile, defaultProfile);
}

export function setProfile(value: UserProfile) {
  writeJSON(STORAGE_KEYS.profile, value);
}

export function getPantry(): PantryItem[] {
  return readJSON<PantryItem[]>(STORAGE_KEYS.pantry, []);
}

export function setPantry(value: PantryItem[]) {
  writeJSON(STORAGE_KEYS.pantry, value);
}

export function getMealPlan(): MealPlanItem[] {
  return readJSON<MealPlanItem[]>(STORAGE_KEYS.mealPlan, []);
}

export function setMealPlan(value: MealPlanItem[]) {
  writeJSON(STORAGE_KEYS.mealPlan, value);
}

export function getCart(): CartItem[] {
  return readJSON<CartItem[]>(STORAGE_KEYS.cart, []);
}

export function setCart(value: CartItem[]) {
  writeJSON(STORAGE_KEYS.cart, value);
}

export function seedIfEmpty() {
  if (!hasWindow()) return;

  const profileExists = window.localStorage.getItem(STORAGE_KEYS.profile);
  const pantryExists = window.localStorage.getItem(STORAGE_KEYS.pantry);
  const mealPlanExists = window.localStorage.getItem(STORAGE_KEYS.mealPlan);
  const cartExists = window.localStorage.getItem(STORAGE_KEYS.cart);

  const profile = profileExists ? getProfile() : defaultProfile;
  const pantry = pantryExists ? getPantry() : [];
  const mealPlan = mealPlanExists ? getMealPlan() : generateMealPlan(profile, pantry, 7);
  const cart = cartExists ? getCart() : buildCartFromMealPlan(profile, mealPlan, recipes);

  if (!profileExists) setProfile(profile);
  if (!pantryExists) setPantry(pantry);
  if (!mealPlanExists) setMealPlan(mealPlan);
  if (!cartExists) setCart(cart);
}

export function resetAllStorage() {
  if (!hasWindow()) return;
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
}
