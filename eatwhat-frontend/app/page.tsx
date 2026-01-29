'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RecipeCard from '@/components/ui/RecipeCard';
import ProductCard from '@/components/ui/ProductCard';
import FeatureCard from '@/components/ui/FeatureCard';
import Button from '@/components/ui/Button';
import { SkeletonCard, SkeletonProductCard } from '@/components/ui/Loading';
import { mockRecipes, mockDeals, getRandomRecipes } from '@/data/mockData';
import { toggleFavoriteRecipe, isFavoriteRecipe } from '@/lib/storage';

export default function Home() {
  const [recommendedRecipes, setRecommendedRecipes] = useState(getRandomRecipes(4));
  const [loading, setLoading] = useState(false);

  // Update favorite status
  const recipesWithFavorite = recommendedRecipes.map(recipe => ({
    ...recipe,
    isFavorite: isFavoriteRecipe(recipe.id)
  }));

  const handleFavoriteClick = (recipeId: string) => {
    toggleFavoriteRecipe(recipeId);
    // Trigger re-render
    setRecommendedRecipes([...recommendedRecipes]);
  };

  const handleRefreshRecipes = () => {
    setLoading(true);
    setTimeout(() => {
      setRecommendedRecipes(getRandomRecipes(4));
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              智能规划一周饮食
              <br />
              轻松吃得健康又省钱
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              根据您的口味、预算和家庭需求，定制专属食谱
            </p>
            <Link href="/meal-plan">
              <Button size="lg" className="bg-secondary hover:bg-orange-600 shadow-lg">
                开始规划本周食谱 →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCard
            title="一周食谱"
            description="查看/生成本周饮食计划"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            href="/meal-plan"
            color="bg-primary"
          />
          <FeatureCard
            title="附近优惠"
            description="查看附近超市打折商品"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            href="/deals"
            color="bg-error"
          />
          <FeatureCard
            title="菜谱库"
            description="浏览热门菜谱"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            href="/recipes"
            color="bg-secondary"
          />
          <FeatureCard
            title="购物清单"
            description="查看本周采购清单"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            href="/shopping-list"
            color="bg-blue-500"
          />
        </div>
      </section>

      {/* Recommended Recipes */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">本周推荐</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshRecipes}
              loading={loading}
            >
              换一批
            </Button>
            <Link href="/recipes">
              <Button variant="outline" size="sm">
                查看更多
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            recipesWithFavorite.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showFavorite
                onFavoriteClick={handleFavoriteClick}
              />
            ))
          )}
        </div>
      </section>

      {/* Nearby Deals */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">附近超市今日特惠</h2>
          <Link href="/deals">
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </Link>
        </div>

        {/* Supermarket Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['全部', 'Woolworths', 'Coles', 'ALDI'].map((market) => (
            <button
              key={market}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                market === '全部'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
              }`}
            >
              {market}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockDeals.slice(0, 6).map((deal) => (
            <ProductCard key={deal.id} product={deal} />
          ))}
        </div>
      </section>

      {/* Preference Setup Prompt (for new users) */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-secondary to-orange-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            完善您的饮食偏好，获得更精准推荐
          </h2>
          <p className="mb-6 opacity-90">
            告诉我们您的家庭人数、预算范围、口味偏好，让AI为您定制专属食谱
          </p>
          <Link href="/meal-plan">
            <Button size="lg" className="bg-white text-secondary hover:bg-gray-100">
              开始设置偏好 →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
