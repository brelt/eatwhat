'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Recipe } from '@/types';
import { mockRecipes } from '@/data/mockData';
import { toggleFavoriteRecipe, isFavoriteRecipe } from '@/lib/storage';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import { LoadingPage } from '@/components/ui/Loading';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const recipeId = params.id as string;
    const foundRecipe = mockRecipes.find((r) => r.id === recipeId);

    if (!foundRecipe) {
      router.push('/recipes');
      return;
    }

    setRecipe(foundRecipe);
    setIsFavorite(isFavoriteRecipe(recipeId));
  }, [params.id, router]);

  if (!recipe) {
    return <LoadingPage />;
  }

  const handleFavorite = () => {
    const newFavoriteStatus = toggleFavoriteRecipe(recipe.id);
    setIsFavorite(newFavoriteStatus);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `看看这道菜谱: ${recipe.name} - ${recipe.nameEn}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  const difficultyLabels = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-gray-200">
        {recipe.image && recipe.image.startsWith('http') ? (
          <Image src={recipe.image} alt={recipe.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFavorite}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <svg
              className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {/* Recipe Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
              {recipe.nameEn && <p className="text-xl text-gray-text">{recipe.nameEn}</p>}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                difficultyColors[recipe.difficulty]
              }`}
            >
              {difficultyLabels[recipe.difficulty]}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-semibold">{recipe.rating}</span>
            </div>
            <span className="text-gray-text">({recipe.reviewCount} 评价)</span>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {recipe.cookingTime}
                <span className="text-sm ml-1">分钟</span>
              </div>
              <div className="text-sm text-gray-text mt-1">烹饪时间</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {recipe.servings}
                <span className="text-sm ml-1">人份</span>
              </div>
              <div className="text-sm text-gray-text mt-1">份量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${recipe.estimatedCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-text mt-1">预计花费</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {recipe.cuisine.map((c) => (
              <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">食材清单</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {recipe.ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{ingredient.name}</div>
                  {ingredient.nameEn && (
                    <div className="text-sm text-gray-text">{ingredient.nameEn}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {ingredient.quantity} {ingredient.unit}
                  </div>
                  {ingredient.productMatches && ingredient.productMatches.length > 0 && (
                    <div className="text-xs text-success">
                      ${ingredient.productMatches[0].price.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cooking Steps */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">烹饪步骤</h2>
          <div className="space-y-6">
            {recipe.steps.map((step) => (
              <div key={step.stepNumber} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <p className="text-lg leading-relaxed">{step.instruction}</p>
                  {step.duration && (
                    <p className="text-sm text-gray-text mt-2">
                      ⏱️ 约 {step.duration} 分钟
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">营养信息（每人份）</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: '热量', value: recipe.nutrition.calories, unit: 'kcal' },
              { label: '蛋白质', value: recipe.nutrition.protein, unit: 'g' },
              { label: '碳水化合物', value: recipe.nutrition.carbs, unit: 'g' },
              { label: '脂肪', value: recipe.nutrition.fat, unit: 'g' },
              { label: '纤维', value: recipe.nutrition.fiber, unit: 'g' },
              { label: '钠', value: recipe.nutrition.sodium, unit: 'mg' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {item.value || 0}
                  <span className="text-sm ml-1">{item.unit}</span>
                </div>
                <div className="text-sm text-gray-text mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Matching Products */}
        {recipe.ingredients.some((i) => i.productMatches && i.productMatches.length > 0) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">推荐商品</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recipe.ingredients
                .filter((i) => i.productMatches && i.productMatches.length > 0)
                .flatMap((i) => i.productMatches!)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} showAddButton />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
          链接已复制到剪贴板
        </div>
      )}
    </div>
  );
}
