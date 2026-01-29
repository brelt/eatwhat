'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingList, GroupedShoppingItems } from '@/types';
import { getMealPlan } from '@/lib/storage';
import { generateShoppingList } from '@/lib/mealPlanGenerator';
import { getCheckedItems, toggleCheckedItem, clearCheckedItems } from '@/lib/storage';
import Button from '@/components/ui/Button';

export default function ShoppingListPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState<keyof GroupedShoppingItems | 'all'>('all');
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    const mealPlan = getMealPlan();
    if (mealPlan) {
      const list = generateShoppingList(mealPlan);
      setShoppingList(list);
    }
    setCheckedItems(getCheckedItems());
  }, []);

  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">购物清单</h1>
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">暂无购物清单</h2>
            <p className="text-gray-text mb-6">
              先生成一周食谱，系统会自动为您创建购物清单
            </p>
            <Link href="/meal-plan">
              <Button size="lg">前往生成食谱</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckItem = (itemId: string) => {
    toggleCheckedItem(itemId);
    setCheckedItems(getCheckedItems());
  };

  const handleClearChecked = () => {
    clearCheckedItems();
    setCheckedItems([]);
  };

  const handleExportText = () => {
    const text = shoppingList.items
      .map((item) => `${item.ingredientName} - ${item.quantity} ${item.unit} (${item.product.supermarket})`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
  };

  const handleShare = async () => {
    const text = shoppingList.items
      .map((item) => `${item.ingredientName} - ${item.quantity} ${item.unit}`)
      .join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: '购物清单',
          text: text,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('清单已复制到剪贴板');
    }
    setShowExportOptions(false);
  };

  const itemsToShow =
    selectedSupermarket === 'all'
      ? shoppingList.items
      : shoppingList.groupedBySupermarket[selectedSupermarket];

  const checkedCount = itemsToShow.filter((item) => checkedItems.includes(item.id)).length;
  const progress = (checkedCount / itemsToShow.length) * 100;

  const supermarketColors = {
    Woolworths: 'border-green-600 bg-green-50',
    Coles: 'border-red-600 bg-red-50',
    ALDI: 'border-blue-600 bg-blue-50',
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">购物清单</h1>
            <p className="text-gray-text">
              {new Date(shoppingList.weekStartDate).toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric',
              })} - 共 {itemsToShow.length} 件商品
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowExportOptions(true)}>
            导出/分享
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">采购进度</span>
            <span className="text-gray-text">
              {checkedCount} / {itemsToShow.length}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {checkedCount === itemsToShow.length && itemsToShow.length > 0 && (
            <p className="text-success text-sm mt-2">✓ 采购完成！</p>
          )}
        </div>

        {/* Supermarket Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSupermarket('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              selectedSupermarket === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
            }`}
          >
            全部 ({shoppingList.items.length})
          </button>
          {(['Woolworths', 'Coles', 'ALDI'] as const).map((market) => (
            <button
              key={market}
              onClick={() => setSelectedSupermarket(market)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedSupermarket === market
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
              }`}
            >
              {market} ({shoppingList.groupedBySupermarket[market].length})
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        {checkedCount > 0 && (
          <div className="mb-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearChecked}>
              清除已勾选
            </Button>
          </div>
        )}

        {/* Shopping List */}
        <div className="space-y-4">
          {selectedSupermarket !== 'all' ? (
            /* Single Supermarket View */
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div
                className={`p-4 border-l-4 font-semibold ${
                  supermarketColors[selectedSupermarket as keyof typeof supermarketColors]
                }`}
              >
                {selectedSupermarket}
              </div>
              <div className="divide-y">
                {itemsToShow.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition ${
                        isChecked ? 'opacity-50' : ''
                      }`}
                      onClick={() => handleCheckItem(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckItem(item.id)}
                        className="w-5 h-5 text-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${isChecked ? 'line-through' : ''}`}>
                          {item.ingredientName}
                        </div>
                        <div className="text-sm text-gray-text">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          ${item.product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-text">{item.product.unit}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center font-semibold">
                <span>小计</span>
                <span className="text-lg text-primary">
                  $
                  {itemsToShow
                    .reduce((sum, item) => sum + item.product.price, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            /* All Supermarkets View */
            (['Woolworths', 'Coles', 'ALDI'] as const).map((market) => {
              const items = shoppingList.groupedBySupermarket[market];
              if (items.length === 0) return null;

              return (
                <div key={market} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div
                    className={`p-4 border-l-4 font-semibold ${supermarketColors[market]}`}
                  >
                    {market} ({items.length} 件)
                  </div>
                  <div className="divide-y">
                    {items.map((item) => {
                      const isChecked = checkedItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition ${
                            isChecked ? 'opacity-50' : ''
                          }`}
                          onClick={() => handleCheckItem(item.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckItem(item.id)}
                            className="w-5 h-5 text-primary rounded cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${isChecked ? 'line-through' : ''}`}>
                              {item.ingredientName}
                            </div>
                            <div className="text-sm text-gray-text">
                              {item.quantity} {item.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">
                              ${item.product.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-text">{item.product.unit}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 bg-gray-50 border-t flex justify-between items-center font-semibold">
                    <span>小计</span>
                    <span className="text-lg text-primary">
                      $
                      {items
                        .reduce((sum, item) => sum + item.product.price, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total Cost */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>预计总花费</span>
            <span className="text-2xl text-primary">${shoppingList.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Export/Share Modal */}
      {showExportOptions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExportOptions(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">导出购物清单</h3>
            <div className="space-y-3">
              <Button fullWidth variant="outline" onClick={handleExportText}>
                下载为文本文件
              </Button>
              <Button fullWidth variant="outline" onClick={handleShare}>
                分享清单
              </Button>
              <Button
                fullWidth
                variant="ghost"
                onClick={() => setShowExportOptions(false)}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
