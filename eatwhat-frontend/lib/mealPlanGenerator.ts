import { MealPlan, Meal, Recipe, UserPreferences, ShoppingList, ShoppingListItem, GroupedShoppingItems, Product } from '@/types';
import { mockRecipes, mockProducts } from '@/data/mockData';

// Generate a weekly meal plan based on user preferences
export const generateMealPlan = (preferences: UserPreferences): MealPlan => {
  const weekStartDate = getStartOfWeek(new Date());
  const meals: Meal[] = [];

  // Filter recipes based on preferences
  let availableRecipes = mockRecipes.filter(recipe => {
    // Check cuisine preferences
    const matchesCuisine = preferences.cuisinePreferences.length === 0 ||
      recipe.cuisine.some(c => preferences.cuisinePreferences.includes(c));

    // Check cooking difficulty
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
    const matchesDifficulty = difficultyOrder[recipe.difficulty] <= difficultyOrder[preferences.cookingDifficulty];

    // Check cooking time
    const matchesTime = recipe.cookingTime <= preferences.maxCookingTime;

    // Check dietary restrictions (simplified)
    const matchesDiet = !preferences.dietaryRestrictions.includes('vegetarian') ||
      !recipe.ingredients.some(i => i.category === 'Meat' || i.category === 'Seafood');

    return matchesCuisine && matchesDifficulty && matchesTime && matchesDiet;
  });

  // If too few recipes, include all
  if (availableRecipes.length < 21) {
    availableRecipes = [...mockRecipes];
  }

  // Generate 7 days × 3 meals = 21 meals
  let recipeIndex = 0;
  let totalCost = 0;

  for (let day = 0; day < 7; day++) {
    const dayDate = new Date(weekStartDate);
    dayDate.setDate(dayDate.getDate() + day);

    ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
      const recipe = availableRecipes[recipeIndex % availableRecipes.length];

      // Adjust cost based on family size
      const adjustedRecipe = {
        ...recipe,
        estimatedCost: (recipe.estimatedCost / recipe.servings) * preferences.familySize
      };

      totalCost += adjustedRecipe.estimatedCost;

      meals.push({
        id: `meal-${day}-${mealType}`,
        dayOfWeek: day,
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
        recipe: adjustedRecipe,
        date: dayDate.toISOString().split('T')[0]
      });

      recipeIndex++;
    });
  }

  return {
    id: `mealplan-${Date.now()}`,
    userId: 'user-1',
    weekStartDate: weekStartDate.toISOString().split('T')[0],
    meals,
    totalCost: Math.round(totalCost * 100) / 100,
    preferences
  };
};

// Replace a single meal in the meal plan
export const replaceMeal = (mealPlan: MealPlan, mealId: string): MealPlan => {
  const mealIndex = mealPlan.meals.findIndex(m => m.id === mealId);
  if (mealIndex === -1) return mealPlan;

  const currentMeal = mealPlan.meals[mealIndex];

  // Find a different recipe
  const currentRecipeId = currentMeal.recipe.id;
  const availableRecipes = mockRecipes.filter(r => r.id !== currentRecipeId);
  const newRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];

  // Adjust cost
  const adjustedRecipe = {
    ...newRecipe,
    estimatedCost: (newRecipe.estimatedCost / newRecipe.servings) * mealPlan.preferences.familySize
  };

  const updatedMeals = [...mealPlan.meals];
  updatedMeals[mealIndex] = {
    ...currentMeal,
    recipe: adjustedRecipe
  };

  const totalCost = updatedMeals.reduce((sum, meal) => sum + meal.recipe.estimatedCost, 0);

  return {
    ...mealPlan,
    meals: updatedMeals,
    totalCost: Math.round(totalCost * 100) / 100
  };
};

// Generate shopping list from meal plan
export const generateShoppingList = (mealPlan: MealPlan): ShoppingList => {
  const ingredientMap = new Map<string, {
    ingredientName: string;
    quantity: number;
    unit: string;
    category: string;
    recipeIds: string[];
  }>();

  // Aggregate ingredients from all meals
  mealPlan.meals.forEach(meal => {
    meal.recipe.ingredients.forEach(ingredient => {
      const key = `${ingredient.name}-${ingredient.unit}`;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.quantity += ingredient.quantity;
        existing.recipeIds.push(meal.recipe.id);
      } else {
        ingredientMap.set(key, {
          ingredientName: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category,
          recipeIds: [meal.recipe.id]
        });
      }
    });
  });

  // Convert to shopping list items with product matches
  const items: ShoppingListItem[] = Array.from(ingredientMap.values()).map((item, index) => {
    // Try to find matching product (simplified matching)
    const matchingProduct = mockProducts.find(p =>
      p.name.toLowerCase().includes(item.ingredientName.toLowerCase()) ||
      item.ingredientName.toLowerCase().includes(p.name.toLowerCase())
    ) || getDefaultProduct(item.category);

    return {
      id: `item-${index}`,
      ingredientName: item.ingredientName,
      quantity: item.quantity,
      unit: item.unit,
      product: matchingProduct,
      checked: false,
      recipeIds: item.recipeIds
    };
  });

  // Group by supermarket
  const groupedBySupermarket: GroupedShoppingItems = {
    Woolworths: items.filter(item => item.product.supermarket === 'Woolworths'),
    Coles: items.filter(item => item.product.supermarket === 'Coles'),
    ALDI: items.filter(item => item.product.supermarket === 'ALDI')
  };

  const totalCost = items.reduce((sum, item) => sum + item.product.price, 0);

  return {
    id: `shoppinglist-${Date.now()}`,
    mealPlanId: mealPlan.id,
    weekStartDate: mealPlan.weekStartDate,
    items,
    groupedBySupermarket,
    totalCost: Math.round(totalCost * 100) / 100
  };
};

// Helper: Get start of current week (Sunday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

// Helper: Get default product for a category
const getDefaultProduct = (category: string): Product => {
  return {
    id: 'default',
    name: 'Generic Product',
    supermarket: 'Woolworths',
    price: 5.00,
    unit: 'each',
    image: '/images/placeholder.jpg',
    onSale: false,
    category: category
  };
};

// Helper: Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Helper: Get day name from dayOfWeek number
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};
