import { getProductReviews } from "@/lib/actions/product";
import { Star } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const reviews = await getProductReviews(productId);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{review.author}</h4>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {review.comment && (
            <p className="text-gray-700 mt-2">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function ProductReviewsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
        </div>
      ))}
    </div>
  );
}

