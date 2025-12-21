"use client";

import Image from "next/image";
import Link from "next/link";
import { addToCart } from "@/lib/actions/cart";
import { toggleFavorite } from "@/lib/actions/favorites";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { FavoriteProduct } from "@/lib/actions/favorites";

interface FavoriteCardProps {
  favorite: FavoriteProduct;
}

export function FavoriteCard({ favorite }: FavoriteCardProps) {
  const [isFavorite, setIsFavorite] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(favorite.product.id);
    if (result.success) {
      setIsFavorite(result.isFavorite);
      if (!result.isFavorite) {
        // Remove from UI
        window.location.reload();
      }
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // addToCart now handles product IDs and gets first variant
      const result = await addToCart(favorite.product.id, 1);
      if (result.success) {
        alert("Added to cart!");
      } else {
        alert(result.error || "Failed to add to cart");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const primaryImage = favorite.product.images.find(img => img.isPrimary) || favorite.product.images[0];
  const imageUrl = primaryImage?.url || "/shoes/shoe-1.jpg";

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${favorite.product.id}`}>
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={imageUrl}
            alt={favorite.product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/products/${favorite.product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {favorite.product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">
          {favorite.product.gender.label}'s {favorite.product.category.name}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            {favorite.product.minPrice !== favorite.product.maxPrice ? (
              <p className="text-lg font-bold text-gray-900">
                ${favorite.product.minPrice.toFixed(2)} - ${favorite.product.maxPrice.toFixed(2)}
              </p>
            ) : (
              <p className="text-lg font-bold text-gray-900">
                ${favorite.product.minPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex-1 bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`px-4 py-2 rounded-md border-2 transition-colors flex items-center justify-center ${
              isFavorite
                ? "border-red-500 text-red-500 hover:bg-red-50"
                : "border-gray-300 text-gray-500 hover:border-gray-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

