"use client";

import { getCurrentUser } from "@/lib/auth/actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProfileLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

const tabs = [
  { label: "My Orders", href: "/profile/orders" },
  { label: "Favorites", href: "/profile/favorites" },
  { label: "My Details", href: "/profile/details" },
  { label: "Payment Methods", href: "/profile/payment-methods" },
  { label: "Address Book", href: "/profile/addresses" },
];

export function ProfileLayout({ children, user }: ProfileLayoutProps) {
  const pathname = usePathname();

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
          <div className="relative w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

