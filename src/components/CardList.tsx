"use client";

import { Product } from "@/db/schema";
import { ProductCard } from "./ProductCard";

interface CardListProps {
  products: Product[];
  title?: string;
  showBestSeller?: boolean;
}

export function CardList({ products, title, showBestSeller = false }: CardListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            showBestSeller={showBestSeller && index === 0}
          />
        ))}
      </div>
    </div>
  );
}

