import { getFavorites } from "@/lib/actions/favorites";

export async function FavoritesCount() {
  try {
    const favorites = await getFavorites();
    const count = favorites.length;
    
    if (count === 0) {
      return null;
    }

    return (
      <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
        ({count})
      </span>
    );
  } catch {
    return null;
  }
}

