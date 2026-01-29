// Core types for EatWhat application

export interface Recipe {
  id: string;
  name: string;
  nameEn?: string;
  image: string;
  cookingTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  estimatedCost: number; // AUD
  cuisine: string[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition: Nutrition;
  rating: number;
  reviewCount: number;
  isFavorite?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  nameEn?: string;
  quantity: number;
  unit: string;
  category: string;
  productMatches?: Product[];
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  image?: string;
  duration?: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

export interface Product {
  id: string;
  name: string;
  supermarket: 'Woolworths' | 'Coles' | 'ALDI';
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  onSale: boolean;
  discount?: number;
  category: string;
}

export interface Deal extends Product {
  dealEndDate: string;
  discountPercentage: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStartDate: string;
  meals: Meal[];
  totalCost: number;
  preferences: UserPreferences;
}

export interface Meal {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipe: Recipe;
  date: string;
}

export interface UserPreferences {
  familySize: number;
  weeklyBudget: number;
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  cookingDifficulty: 'easy' | 'medium' | 'hard';
  maxCookingTime: number;
  allergies: string[];
}

export interface ShoppingList {
  id: string;
  mealPlanId: string;
  weekStartDate: string;
  items: ShoppingListItem[];
  groupedBySupermarket: GroupedShoppingItems;
  totalCost: number;
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  product: Product;
  checked: boolean;
  recipeIds: string[];
}

export interface GroupedShoppingItems {
  Woolworths: ShoppingListItem[];
  Coles: ShoppingListItem[];
  ALDI: ShoppingListItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location?: {
    suburb: string;
    state: string;
    postcode: string;
  };
  preferences: UserPreferences;
  favoriteRecipes: string[];
  mealPlanHistory: string[];
}

export interface Supermarket {
  id: string;
  name: 'Woolworths' | 'Coles' | 'ALDI';
  distance: number; // km
  address: string;
  openingHours: string;
}
