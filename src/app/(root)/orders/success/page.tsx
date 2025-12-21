import { getCurrentUser } from "@/lib/auth/actions";
import { getOrders } from "@/lib/actions/orders";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link
            href="/sign-in"
            className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Get the most recent order
  const orders = await getOrders();
  const latestOrder = orders[0];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        {latestOrder && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-2">Order Details</h2>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Order Number:</span> {latestOrder.orderNumber}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Total:</span> ${parseFloat(latestOrder.totalAmount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span> {latestOrder.status.charAt(0).toUpperCase() + latestOrder.status.slice(1)}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            href="/profile/orders"
            className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

