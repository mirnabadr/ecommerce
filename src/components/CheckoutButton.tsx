"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItemWithProduct } from "@/lib/actions/cart";

interface CheckoutButtonProps {
  cartItems: CartItemWithProduct[];
}

export function CheckoutButton({ cartItems }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading || cartItems.length === 0}
      className="w-full bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Processing..." : "Checkout with Stripe"}
    </button>
  );
}

