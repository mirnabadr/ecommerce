import { getCartCount } from "@/lib/actions/cart";

export async function CartCount() {
  const count = await getCartCount();
  
  if (count === 0) {
    return null;
  }

  return (
    <span className="ml-1 bg-black text-white text-xs rounded-full px-2 py-0.5">
      ({count})
    </span>
  );
}

