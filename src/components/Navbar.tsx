import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { CartCount } from "./CartCount";
import { FavoritesCount } from "./FavoritesCount";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Nike Logo"
              width={60}
              height={24}
              className="h-6 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products?gender=men"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Men
            </Link>
            <Link
              href="/products?gender=women"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Women
            </Link>
            <Link
              href="/products?gender=unisex"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Kids
            </Link>
            <Link
              href="/products"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Collections
            </Link>
            <Link
              href="/contact"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            <Link
              href="/favorites"
              className="text-black hover:text-red-600 transition-colors font-medium relative flex items-center"
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
              <FavoritesCount />
            </Link>
            <Link
              href="/cart"
              className="text-black hover:text-gray-600 transition-colors font-medium relative flex items-center"
            >
              <ShoppingBag className="w-5 h-5" />
              <CartCount />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

