'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPreferences, MealPlan } from '@/types';
import { getUserPreferences, saveUserPreferences, getMealPlan, saveMealPlan } from '@/lib/storage';
import { generateMealPlan, replaceMeal, getDayName } from '@/lib/mealPlanGenerator';
import Button from '@/components/ui/Button';
import RecipeCard from '@/components/ui/RecipeCard';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function MealPlanPage() {
  const [step, setStep] = useState<'preferences' | 'plan'>('preferences');
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    const existingPlan = getMealPlan();
    if (existingPlan) {
      setMealPlan(existingPlan);
      setStep('plan');
    }
  }, []);

  const handleGeneratePlan = () => {
    setLoading(true);
    saveUserPreferences(preferences);

    setTimeout(() => {
      const newPlan = generateMealPlan(preferences);
      setMealPlan(newPlan);
      saveMealPlan(newPlan);
      setStep('plan');
      setLoading(false);
    }, 1500);
  };

  const handleReplaceMeal = (mealId: string) => {
    if (!mealPlan) return;

    setLoading(true);
    setTimeout(() => {
      const updatedPlan = replaceMeal(mealPlan, mealId);
      setMealPlan(updatedPlan);
      saveMealPlan(updatedPlan);
      setLoading(false);
    }, 800);
  };

  const handleRegeneratePlan = () => {
    setStep('preferences');
    setMealPlan(null);
  };

  if (step === 'preferences') {
    return (
      <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">设置饮食偏好</h1>
          <p className="text-gray-text mb-8">告诉我们您的需求，为您生成专属食谱</p>

          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            {/* Family Size */}
            <div>
              <label className="block font-semibold mb-2">家庭人数</label>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPreferences({ ...preferences, familySize: size })}
                    className={`py-3 rounded-lg border-2 font-semibold transition ${
                      preferences.familySize === size
                        ? 'border-primary bg-green-50 text-primary'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Budget */}
            <div>
              <label className="block font-semibold mb-2">
                每周预算: ${preferences.weeklyBudget} AUD
              </label>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={preferences.weeklyBudget}
                onChange={(e) =>
                  setPreferences({ ...preferences, weeklyBudget: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-text mt-1">
                <span>$50</span>
                <span>$300</span>
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div>
              <label className="block font-semibold mb-2">饮食偏好（可多选）</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Chinese', 'Western', 'Japanese', 'Korean', 'Thai', 'Indian'].map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => {
                      const newCuisines = preferences.cuisinePreferences.includes(cuisine)
                        ? preferences.cuisinePreferences.filter((c) => c !== cuisine)
                        : [...preferences.cuisinePreferences, cuisine];
                      setPreferences({ ...preferences, cuisinePreferences: newCuisines });
                    }}
                    className={`py-3 rounded-lg border-2 transition ${
                      preferences.cuisinePreferences.includes(cuisine)
                        ? 'border-primary bg-green-50 text-primary font-semibold'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    {cuisine === 'Chinese' ? '中餐' :
                     cuisine === 'Western' ? '西餐' :
                     cuisine === 'Japanese' ? '日本料理' :
                     cuisine === 'Korean' ? '韩国料理' :
                     cuisine === 'Thai' ? '泰国菜' : '印度菜'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block font-semibold mb-2">饮食限制（可多选）</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { value: 'vegetarian', label: '素食' },
                  { value: 'no-pork', label: '不吃猪肉' },
                  { value: 'no-beef', label: '不吃牛肉' },
                  { value: 'no-seafood', label: '不吃海鲜' },
                  { value: 'gluten-free', label: '无麸质' },
                  { value: 'low-sugar', label: '低糖' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newRestrictions = preferences.dietaryRestrictions.includes(option.value)
                        ? preferences.dietaryRestrictions.filter((r) => r !== option.value)
                        : [...preferences.dietaryRestrictions, option.value];
                      setPreferences({ ...preferences, dietaryRestrictions: newRestrictions });
                    }}
                    className={`py-3 rounded-lg border-2 transition ${
                      preferences.dietaryRestrictions.includes(option.value)
                        ? 'border-primary bg-green-50 text-primary font-semibold'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Difficulty */}
            <div>
              <label className="block font-semibold mb-2">烹饪难度</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'easy', label: '简单' },
                  { value: 'medium', label: '中等' },
                  { value: 'hard', label: '困难' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        cookingDifficulty: option.value as 'easy' | 'medium' | 'hard',
                      })
                    }
                    className={`py-3 rounded-lg border-2 transition ${
                      preferences.cookingDifficulty === option.value
                        ? 'border-primary bg-green-50 text-primary font-semibold'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Cooking Time */}
            <div>
              <label className="block font-semibold mb-2">
                最长烹饪时间: {preferences.maxCookingTime}分钟
              </label>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={preferences.maxCookingTime}
                onChange={(e) =>
                  setPreferences({ ...preferences, maxCookingTime: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-text mt-1">
                <span>15分钟</span>
                <span>120分钟</span>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              size="lg"
              fullWidth
              onClick={handleGeneratePlan}
              loading={loading}
            >
              生成本周食谱
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!mealPlan) return null;

  const mealsForDay = mealPlan.meals.filter((m) => m.dayOfWeek === selectedDay);

  return (
    <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">本周食谱</h1>
            <p className="text-gray-text">
              {new Date(mealPlan.weekStartDate).toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric',
              })} - 预算: ${mealPlan.totalCost.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/shopping-list">
              <Button variant="secondary">生成购物清单</Button>
            </Link>
            <Button variant="outline" onClick={handleRegeneratePlan}>
              重新生成
            </Button>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-lg whitespace-nowrap font-medium transition ${
                selectedDay === day
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getDayName(day)}
            </button>
          ))}
        </div>

        {/* Meals for Selected Day */}
        <div className="space-y-6">
          {['breakfast', 'lunch', 'dinner'].map((mealType) => {
            const meal = mealsForDay.find((m) => m.mealType === mealType);
            if (!meal) return null;

            const mealTypeNames = {
              breakfast: '早餐',
              lunch: '午餐',
              dinner: '晚餐',
            };

            return (
              <div key={mealType} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    {mealTypeNames[mealType as keyof typeof mealTypeNames]}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReplaceMeal(meal.id)}
                    disabled={loading}
                  >
                    换一道菜
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <RecipeCard recipe={meal.recipe} />

                  <div>
                    <h4 className="font-semibold mb-3">食材清单</h4>
                    <div className="space-y-2">
                      {meal.recipe.ingredients.slice(0, 6).map((ingredient, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2 border-b border-gray-100"
                        >
                          <span>{ingredient.name}</span>
                          <span className="text-gray-text">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {meal.recipe.ingredients.length > 6 && (
                      <Link href={`/recipes/${meal.recipe.id}`}>
                        <Button variant="ghost" size="sm" className="mt-3" fullWidth>
                          查看完整食谱
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nutrition Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">今日营养</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: '总热量',
                value: mealsForDay.reduce((sum, m) => sum + m.recipe.nutrition.calories, 0),
                unit: 'kcal',
              },
              {
                label: '蛋白质',
                value: mealsForDay.reduce((sum, m) => sum + m.recipe.nutrition.protein, 0),
                unit: 'g',
              },
              {
                label: '碳水',
                value: mealsForDay.reduce((sum, m) => sum + m.recipe.nutrition.carbs, 0),
                unit: 'g',
              },
              {
                label: '脂肪',
                value: mealsForDay.reduce((sum, m) => sum + m.recipe.nutrition.fat, 0),
                unit: 'g',
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stat.value.toFixed(0)}
                  <span className="text-sm ml-1">{stat.unit}</span>
                </div>
                <div className="text-sm text-gray-text mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-text">正在为您寻找新菜谱...</p>
          </div>
        </div>
      )}
    </div>
  );
}
