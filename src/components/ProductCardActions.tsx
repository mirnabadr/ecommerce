"use client";

import { useState, useEffect } from "react";
import { addToCart } from "@/lib/actions/cart";
import { toggleFavorite, isFavorite } from "@/lib/actions/favorites";
import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductCardActionsProps {
  productId: string;
  variantId?: string; // Optional variant ID, will use first variant if not provided
}

export function ProductCardActions({ productId, variantId }: ProductCardActionsProps) {
  const [isFav, setIsFav] = useState<boolean | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  // Check favorite status on mount
  useEffect(() => {
    isFavorite(productId).then(setIsFav);
  }, [productId]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      // If no variantId provided, we need to get the first variant
      // For now, we'll use the productId and let the backend handle it
      // In a real implementation, you'd need to pass variantId
      const result = await addToCart(variantId || productId, 1);
      if (result.success) {
        router.refresh(); // Refresh to update cart count
      } else {
        alert(result.error || "Failed to add to cart");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(productId);
    if (result.success) {
      setIsFav(result.isFavorite);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="flex-1 bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <ShoppingBag className="w-4 h-4" />
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
      <button
        onClick={handleToggleFavorite}
        className={`px-4 py-2 rounded-md border-2 transition-colors flex items-center justify-center ${
          isFav
            ? "border-red-500 text-red-500 hover:bg-red-50"
            : "border-gray-300 text-gray-500 hover:border-gray-400"
        }`}
      >
        <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}

