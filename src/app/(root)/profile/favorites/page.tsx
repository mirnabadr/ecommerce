import { getCurrentUser } from "@/lib/auth/actions";
import { getFavorites } from "@/lib/actions/favorites";
import { ProfileLayout } from "@/components/ProfileLayout";
import { FavoriteCard } from "@/components/FavoriteCard";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const favorites = await getFavorites();

  return (
    <ProfileLayout user={user}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-lg text-gray-500 mb-2">No favorites yet</p>
            <p className="text-sm text-gray-400">
              Start adding products to your favorites
            </p>
          </div>
        ) : (
          favorites.map((favorite) => (
            <FavoriteCard key={favorite.id} favorite={favorite} />
          ))
        )}
      </div>
    </ProfileLayout>
  );
}

