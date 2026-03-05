export type StoreProvider = "oasis" | "coupang";
export type Difficulty = "easy" | "medium" | "hard";
export type MealType = "dinner";

export interface UserProfile {
  targetTypes: Array<"kids" | "senior">;
  primaryGoal: string;
  goals: string[];
  constraints: {
    vegetarian: boolean;
    halal: boolean;
    allergies: string[];
  };
  dislikes: string[];
  cookingTimeMin: number;
  difficulty: Difficulty;
  kids?: {
    ages: number[];
    pickyIngredients: string[];
    favoriteFoods: string[];
  };
  shoppingWindowDays: 3 | 7 | 14;
  storeProvider: StoreProvider;
  budget?: number;
}

export interface PantryItem {
  id: string;
  name: string;
  qty?: string;
  expiresAt?: string;
}

export interface Ingredient {
  name: string;
  qty: number;
  unit: string;
  category:
    | "vegetable"
    | "fruit"
    | "protein"
    | "dairy"
    | "grain"
    | "seasoning"
    | "other";
}

export interface Recipe {
  id: string;
  title: string;
  tags: string[];
  cookTimeMin: number;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: string[];
  substitutions: Array<{ from: string; to: string[] }>;
}

export interface MealPlanItem {
  id: string;
  dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  mealType: MealType;
  recipeId: string;
  title: string;
  tags: string[];
  cookTimeMin: number;
  difficulty: Difficulty;
  reason: string;
  confirmed: boolean;
}

export interface StoreProduct {
  id: string;
  store: StoreProvider;
  ingredientName: string;
  title: string;
  unitText: string;
  price: number;
  url: string;
}

export interface CartItem {
  id: string;
  ingredientName: string;
  qtyText: string;
  category: Ingredient["category"];
  product: StoreProduct;
  alternatives: StoreProduct[];
  checked: boolean;
}
