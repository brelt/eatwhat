import Link from 'next/link';
import { Recipe } from '@/types';
import Image from 'next/image';

interface RecipeCardProps {
  recipe: Recipe;
  showFavorite?: boolean;
  onFavoriteClick?: (recipeId: string) => void;
}

export default function RecipeCard({
  recipe,
  showFavorite = false,
  onFavoriteClick,
}: RecipeCardProps) {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="relative h-48 bg-gray-200">
          {recipe.image && recipe.image.startsWith('http') ? (
            <Image
              src={recipe.image}
              alt={recipe.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Favorite Button */}
          {showFavorite && onFavoriteClick && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavoriteClick(recipe.id);
              }}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              aria-label="Favorite"
            >
              <svg
                className={`w-5 h-5 ${
                  recipe.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
                }`}
                fill={recipe.isFavorite ? 'currentColor' : 'none'}
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
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                difficultyColors[recipe.difficulty]
              }`}
            >
              {difficultyLabels[recipe.difficulty]}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition">
            {recipe.name}
          </h3>
          {recipe.nameEn && (
            <p className="text-sm text-gray-text mb-2">{recipe.nameEn}</p>
          )}
        </Link>

        <div className="flex items-center justify-between text-sm text-gray-text mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{recipe.cookingTime}分钟</span>
          </div>

          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{recipe.servings}人份</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-primary font-semibold text-lg">
            ${recipe.estimatedCost.toFixed(2)}
          </div>

          <div className="flex items-center gap-1 text-sm">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-gray-text">{recipe.rating}</span>
            <span className="text-gray-400">({recipe.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
