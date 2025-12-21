import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/cart"
            className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Return to Cart
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

