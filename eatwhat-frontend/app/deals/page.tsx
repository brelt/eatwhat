'use client';

import { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { mockDeals } from '@/data/mockData';

export default function DealsPage() {
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'price'>('discount');

  const filteredDeals =
    selectedSupermarket === 'all'
      ? mockDeals
      : mockDeals.filter((deal) => deal.supermarket === selectedSupermarket);

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'discount') {
      return b.discountPercentage - a.discountPercentage;
    } else {
      return a.price - b.price;
    }
  });

  return (
    <div className="min-h-screen bg-gray-bg pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">附近超市特惠</h1>
          <p className="text-gray-text">发现本周最划算的优惠商品</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Supermarket Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-text mb-2 block">超市筛选</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'Woolworths', 'Coles', 'ALDI'].map((market) => (
                  <button
                    key={market}
                    onClick={() => setSelectedSupermarket(market)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                      selectedSupermarket === market
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {market === 'all' ? '全部' : market}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-gray-text mb-2 block">排序方式</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'discount' | 'price')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="discount">折扣力度</option>
                <option value="price">价格由低到高</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-text">
          找到 {sortedDeals.length} 件特惠商品
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedDeals.map((deal) => (
            <ProductCard key={deal.id} product={deal} showAddButton />
          ))}
        </div>

        {sortedDeals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏷️</div>
            <p className="text-gray-text text-lg">暂无符合条件的优惠</p>
          </div>
        )}
      </div>
    </div>
  );
}
