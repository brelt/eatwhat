import { UserPreferences, MealPlan, Recipe } from '@/types';
import { defaultUserPreferences } from '@/data/mockData';

// LocalStorage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: 'eatwhat_user_preferences',
  MEAL_PLAN: 'eatwhat_meal_plan',
  FAVORITE_RECIPES: 'eatwhat_favorite_recipes',
  SHOPPING_LIST_CHECKED: 'eatwhat_shopping_checked',
} as const;

// User Preferences
export const getUserPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') return defaultUserPreferences;

  const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
  if (!stored) return defaultUserPreferences;

  try {
    return JSON.parse(stored);
  } catch {
    return defaultUserPreferences;
  }
};

export const saveUserPreferences = (preferences: UserPreferences): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
};

// Meal Plan
export const getMealPlan = (): MealPlan | null => {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEYS.MEAL_PLAN);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const saveMealPlan = (mealPlan: MealPlan): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(mealPlan));
};

export const clearMealPlan = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.MEAL_PLAN);
};

// Favorite Recipes
export const getFavoriteRecipes = (): string[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.FAVORITE_RECIPES);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const toggleFavoriteRecipe = (recipeId: string): boolean => {
  if (typeof window === 'undefined') return false;

  const favorites = getFavoriteRecipes();
  const index = favorites.indexOf(recipeId);

  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.FAVORITE_RECIPES, JSON.stringify(favorites));
    return false;
  } else {
    favorites.push(recipeId);
    localStorage.setItem(STORAGE_KEYS.FAVORITE_RECIPES, JSON.stringify(favorites));
    return true;
  }
};

export const isFavoriteRecipe = (recipeId: string): boolean => {
  const favorites = getFavoriteRecipes();
  return favorites.includes(recipeId);
};

// Shopping List Checked Items
export const getCheckedItems = (): string[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST_CHECKED);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const toggleCheckedItem = (itemId: string): boolean => {
  if (typeof window === 'undefined') return false;

  const checked = getCheckedItems();
  const index = checked.indexOf(itemId);

  if (index > -1) {
    checked.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST_CHECKED, JSON.stringify(checked));
    return false;
  } else {
    checked.push(itemId);
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST_CHECKED, JSON.stringify(checked));
    return true;
  }
};

export const clearCheckedItems = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SHOPPING_LIST_CHECKED);
};
