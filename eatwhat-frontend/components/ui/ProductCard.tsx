import { Product, Deal } from '@/types';
import Image from 'next/image';

interface ProductCardProps {
  product: Product | Deal;
  showAddButton?: boolean;
  onAddClick?: (productId: string) => void;
}

export default function ProductCard({
  product,
  showAddButton = false,
  onAddClick,
}: ProductCardProps) {
  const isDeal = 'discountPercentage' in product;
  const supermarketColors = {
    Woolworths: 'bg-green-600',
    Coles: 'bg-red-600',
    ALDI: 'bg-blue-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-40 bg-gray-100">
        {product.image && product.image.startsWith('http') ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}

        {/* Supermarket Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium text-white ${
              supermarketColors[product.supermarket]
            }`}
          >
            {product.supermarket}
          </span>
        </div>

        {/* Sale Badge */}
        {product.onSale && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded bg-error text-white text-xs font-bold">
              {isDeal
                ? `-${(product as Deal).discountPercentage}%`
                : '特价'}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-text mb-3">{product.unit}</div>

        {product.onSale && product.discount && (
          <div className="text-xs text-success mb-3">
            省 ${product.discount.toFixed(2)}
          </div>
        )}

        {showAddButton && onAddClick && (
          <button
            onClick={() => onAddClick(product.id)}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
          >
            加入购物清单
          </button>
        )}
      </div>
    </div>
  );
}
