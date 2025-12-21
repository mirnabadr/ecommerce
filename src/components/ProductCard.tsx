"use client";

import { ProductListItem } from "@/lib/actions/product";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: ProductListItem;
  showBestSeller?: boolean;
}

export function ProductCard({ product, showBestSeller = false }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);

  // Get primary image (first image from images array)
  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : "/shoes/shoe-1.jpg";

  // Format price display
  const priceDisplay = product.minPrice !== product.maxPrice
    ? `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`
    : `$${product.minPrice.toFixed(2)}`;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        {/* Best Seller Badge */}
        {showBestSeller && (
          <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Best Seller
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {product.gender.label}&apos;s {product.category.name}
          </p>
          {product.images && product.images.length > 1 && (
            <p className="text-xs text-gray-500 mb-3">
              {product.images.length} {product.images.length > 1 ? "Colors" : "Color"}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">
              {priceDisplay}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Note: addToCart might need to be updated to work with ProductListItem
                // For now, we'll just prevent default and let the link handle navigation
              }}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

