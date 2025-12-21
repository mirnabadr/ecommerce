"use client";

import Image from "next/image";
import Link from "next/link";
import { updateCartItemQuantity, removeFromCart } from "@/lib/actions/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CartItemWithProduct } from "@/lib/actions/cart";

interface CartItemRowProps {
  item: CartItemWithProduct;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const price = parseFloat(item.productVariant.salePrice || item.productVariant.price);
  const subtotal = price * quantity;

  const primaryImage = item.productVariant.product.images.find(img => img.isPrimary) || item.productVariant.product.images[0];
  const imageUrl = primaryImage?.url || "/shoes/shoe-1.jpg";

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemove();
      return;
    }

    setIsUpdating(true);
    setQuantity(newQuantity);
    try {
      await updateCartItemQuantity(item.id, newQuantity);
    } catch (error) {
      // Revert on error
      setQuantity(item.quantity);
      alert("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove this item from cart?")) {
      return;
    }

    try {
      await removeFromCart(item.id);
      window.location.reload();
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
      {/* Product Image */}
      <Link href={`/products/${item.productVariant.product.id}`}>
        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={item.productVariant.product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.productVariant.product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{item.productVariant.product.name}</h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">
          {item.productVariant.color.name} • Size {item.productVariant.size.name}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 p-2"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</p>
        {item.productVariant.salePrice && (
          <p className="text-sm text-gray-500 line-through">
            ${(parseFloat(item.productVariant.price) * quantity).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}

