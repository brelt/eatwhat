'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RecipeCard from '@/components/ui/RecipeCard';
import { getUserPreferences, getFavoriteRecipes, getMealPlan } from '@/lib/storage';
import { mockRecipes } from '@/data/mockData';
import { UserPreferences } from '@/types';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'favorites' | 'history'>('info');
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteRecipeIds(getFavoriteRecipes());
  }, []);

  const favoriteRecipes = mockRecipes.filter((r) => favoriteRecipeIds.includes(r.id));
  const mealPlan = getMealPlan();

  return (
    <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-green-600 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary text-4xl font-bold">
              吃
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">美食爱好者</h1>
              <p className="opacity-90">Sydney, NSW</p>
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{favoriteRecipes.length}</div>
                  <div className="text-sm opacity-90">收藏菜谱</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{mealPlan ? 1 : 0}</div>
                  <div className="text-sm opacity-90">食谱计划</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'info', label: '个人信息', icon: '👤' },
            { id: 'favorites', label: '收藏菜谱', icon: '❤️' },
            { id: 'history', label: '历史计划', icon: '📅' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-lg whitespace-nowrap font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white shadow-md text-primary'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Preferences Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">饮食偏好</h2>
                <Link href="/meal-plan">
                  <button className="text-primary hover:underline">编辑</button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-text mb-2">家庭人数</div>
                  <div className="text-lg font-semibold">{preferences.familySize} 人</div>
                </div>

                <div>
                  <div className="text-sm text-gray-text mb-2">每周预算</div>
                  <div className="text-lg font-semibold">${preferences.weeklyBudget} AUD</div>
                </div>

                <div>
                  <div className="text-sm text-gray-text mb-2">烹饪难度</div>
                  <div className="text-lg font-semibold">
                    {preferences.cookingDifficulty === 'easy'
                      ? '简单'
                      : preferences.cookingDifficulty === 'medium'
                      ? '中等'
                      : '困难'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-text mb-2">最长烹饪时间</div>
                  <div className="text-lg font-semibold">{preferences.maxCookingTime} 分钟</div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-sm text-gray-text mb-2">饮食偏好</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.cuisinePreferences.length > 0 ? (
                      preferences.cuisinePreferences.map((cuisine) => (
                        <span
                          key={cuisine}
                          className="px-3 py-1 bg-green-50 text-primary rounded-full text-sm"
                        >
                          {cuisine}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-text">暂无偏好</span>
                    )}
                  </div>
                </div>

                {preferences.dietaryRestrictions.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-text mb-2">饮食限制</div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.dietaryRestrictions.map((restriction) => (
                        <span
                          key={restriction}
                          className="px-3 py-1 bg-orange-50 text-secondary rounded-full text-sm"
                        >
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">快捷设置</h2>

              <div className="space-y-3">
                <Link href="/meal-plan">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍽️</span>
                      <span className="font-medium">更新饮食偏好</span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <span className="font-medium">更改位置</span>
                  </div>
                  <span className="text-gray-text text-sm">Sydney</span>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    <span className="font-medium">通知设置</span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌐</span>
                    <span className="font-medium">语言</span>
                  </div>
                  <span className="text-gray-text text-sm">中文</span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">帮助与支持</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">❓</span>
                    <span className="font-medium">常见问题</span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <span className="font-medium">反馈建议</span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <span className="font-medium">关于我们</span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={{ ...recipe, isFavorite: true }} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">❤️</div>
                <h2 className="text-2xl font-semibold mb-4">暂无收藏</h2>
                <p className="text-gray-text mb-6">发现喜欢的菜谱，点击爱心收藏吧</p>
                <Link href="/recipes">
                  <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition">
                    浏览菜谱
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {mealPlan ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold">当前食谱计划</h3>
                    <p className="text-gray-text">
                      {new Date(mealPlan.weekStartDate).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Link href="/meal-plan">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition">
                      查看详情
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{mealPlan.meals.length}</div>
                    <div className="text-sm text-gray-text mt-1">总餐数</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ${mealPlan.totalCost.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-text mt-1">预计花费</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {mealPlan.preferences.familySize}
                    </div>
                    <div className="text-sm text-gray-text mt-1">家庭人数</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">7</div>
                    <div className="text-sm text-gray-text mt-1">天数</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h2 className="text-2xl font-semibold mb-4">暂无历史计划</h2>
                <p className="text-gray-text mb-6">开始生成您的第一个食谱计划吧</p>
                <Link href="/meal-plan">
                  <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-green-600 transition">
                    生成食谱计划
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
