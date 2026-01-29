'use client';

import { useState } from 'react';
import RecipeCard from '@/components/ui/RecipeCard';
import { mockRecipes } from '@/data/mockData';
import { toggleFavoriteRecipe, isFavoriteRecipe } from '@/lib/storage';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState(
    mockRecipes.map((r) => ({ ...r, isFavorite: isFavoriteRecipe(r.id) }))
  );
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');

  const handleFavoriteClick = (recipeId: string) => {
    toggleFavoriteRecipe(recipeId);
    setRecipes(recipes.map((r) => ({ ...r, isFavorite: isFavoriteRecipe(r.id) })));
  };

  const cuisines = ['all', ...Array.from(new Set(mockRecipes.flatMap((r) => r.cuisine)))];

  const filteredRecipes =
    selectedCuisine === 'all'
      ? recipes
      : recipes.filter((r) => r.cuisine.includes(selectedCuisine));

  const cuisineLabels: Record<string, string> = {
    all: '全部',
    Chinese: '中餐',
    Cantonese: '粤菜',
    Sichuan: '川菜',
    Western: '西餐',
    Japanese: '日本料理',
    Korean: '韩国料理',
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">菜谱库</h1>

        {/* Cuisine Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCuisine === cuisine
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
              }`}
            >
              {cuisineLabels[cuisine] || cuisine}
            </button>
          ))}
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              showFavorite
              onFavoriteClick={handleFavoriteClick}
            />
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <p className="text-gray-text text-lg">暂无符合条件的菜谱</p>
          </div>
        )}
      </div>
    </div>
  );
}
