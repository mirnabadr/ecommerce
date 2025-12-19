"use client";

import { Product } from "@/lib/db/schema";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  showBestSeller?: boolean;
}

export function ProductCard({ product, showBestSeller = false }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);

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
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
            {product.category || "Men's Shoes"}
          </p>
          {product.stock && product.stock > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              {product.stock > 1 ? `${product.stock} Colors` : "1 Color"}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">
              ${product.price}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
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

