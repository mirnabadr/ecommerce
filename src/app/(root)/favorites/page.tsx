import { getCurrentUser } from "@/lib/auth/actions";
import { getFavorites } from "@/lib/actions/favorites";
import { FavoriteCard } from "@/components/FavoriteCard";
import Link from "next/link";

// Simple favorites page accessible from navbar
export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const favorites = await getFavorites();

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-8">
            Sign in to view and manage your favorite products.
          </p>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500 mb-2">No favorites yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Start adding products to your favorites
            </p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <FavoriteCard key={favorite.id} favorite={favorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

