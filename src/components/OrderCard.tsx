"use client";

import Image from "next/image";
import Link from "next/link";
import { cancelOrder } from "@/lib/actions/orders";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { OrderWithItems } from "@/lib/actions/orders";

interface OrderCardProps {
  order: OrderWithItems;
}

function getStatusBadge(status: string, createdAt: Date) {
  const isDelivered = status === "delivered";
  const isPending = status === "pending" || status === "processing";
  
  if (isDelivered) {
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    return {
      text: `Delivered on ${formattedDate}`,
      className: "bg-green-50 text-green-700 border border-green-200",
    };
  }
  
  if (isPending) {
    // Calculate estimated arrival (7 days from order date)
    const estimatedDate = new Date(createdAt);
    estimatedDate.setDate(estimatedDate.getDate() + 7);
    const formattedDate = estimatedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return {
      text: `Estimated arrival ${formattedDate}`,
      className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    };
  }
  
  return {
    text: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-50 text-gray-700 border border-gray-200",
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const statusBadge = getStatusBadge(order.status, order.createdAt);
  const canCancel = order.status === "pending" || order.status === "processing";

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const result = await cancelOrder(order.id);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "Failed to cancel order");
      }
    } catch (error) {
      alert("An error occurred while cancelling the order");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {order.items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {item.product.image ? (
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Status Badge */}
            {index === 0 && (
              <div className={`inline-block px-3 py-1 rounded-md text-xs font-medium mb-2 ${statusBadge.className}`}>
                {statusBadge.text}
              </div>
            )}

            <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">Men&apos;s Shoes</p>
            <p className="text-sm text-gray-600">
              Size {item.variant.size.name} Quantity {item.quantity}
            </p>

            {/* Price and Cancel Button */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900">
                ${parseFloat(item.price).toFixed(2)}
              </p>
              {index === 0 && canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {isCancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

