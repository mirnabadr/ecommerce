"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const footerLinks = {
    featured: [
      { name: "Air Force 1", href: "/products/air-force-1" },
      { name: "Huarache", href: "/products/huarache" },
      { name: "Air Max 90", href: "/products/air-max-90" },
      { name: "Air Max 95", href: "/products/air-max-95" },
    ],
    shoes: [
      { name: "All Shoes", href: "/shoes" },
      { name: "Custom Shoes", href: "/shoes/custom" },
      { name: "Jordan Shoes", href: "/shoes/jordan" },
      { name: "Running Shoes", href: "/shoes/running" },
    ],
    clothing: [
      { name: "All Clothing", href: "/clothing" },
      { name: "Modest Wear", href: "/clothing/modest" },
      { name: "Hoodies & Pullovers", href: "/clothing/hoodies" },
      { name: "Shirts & Tops", href: "/clothing/shirts" },
    ],
    kids: [
      { name: "Infant & Toddler Shoes", href: "/kids/infant" },
      { name: "Kids' Shoes", href: "/kids/shoes" },
      { name: "Kids' Jordan Shoes", href: "/kids/jordan" },
      { name: "Kids' Basketball Shoes", href: "/kids/basketball" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          {/* Logo */}
          <div className="mb-6 md:mb-0">
            <Image
              src="/logo.svg"
              alt="Nike Logo"
              width={60}
              height={24}
              className="h-6 w-auto brightness-0 invert"
            />
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 md:ml-12">
            {/* Featured */}
            <div>
              <h3 className="font-semibold mb-4 text-sm">Featured</h3>
              <ul className="space-y-2">
                {footerLinks.featured.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shoes */}
            <div>
              <h3 className="font-semibold mb-4 text-sm">Shoes</h3>
              <ul className="space-y-2">
                {footerLinks.shoes.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clothing */}
            <div>
              <h3 className="font-semibold mb-4 text-sm">Clothing</h3>
              <ul className="space-y-2">
                {footerLinks.clothing.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kids' */}
            <div>
              <h3 className="font-semibold mb-4 text-sm">Kids&apos;</h3>
              <ul className="space-y-2">
                {footerLinks.kids.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-4 mt-6 md:mt-0">
            <Link
              href="https://twitter.com/nike"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center hover:bg-white hover:text-gray-900 transition-colors"
              aria-label="Twitter"
            >
              <Image
                src="/x.svg"
                alt="X"
                width={16}
                height={16}
                className="brightness-0 invert"
              />
            </Link>
            <Link
              href="https://facebook.com/nike"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center hover:bg-white hover:text-gray-900 transition-colors"
              aria-label="Facebook"
            >
              <Image
                src="/facebook.svg"
                alt="Facebook"
                width={16}
                height={16}
                className="brightness-0 invert"
              />
            </Link>
            <Link
              href="https://instagram.com/nike"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center hover:bg-white hover:text-gray-900 transition-colors"
              aria-label="Instagram"
            >
              <Image
                src="/instagram.svg"
                alt="Instagram"
                width={16}
                height={16}
                className="brightness-0 invert"
              />
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-gray-400 text-sm">WorldWide Store</span>
            <span className="text-gray-600 mx-2">|</span>
            <span className="text-gray-400 text-sm">
              © 2025 Nike, Inc. All Rights Reserved
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/guides"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Guides
            </Link>
            <Link
              href="/terms-of-sale"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms of Sale
            </Link>
            <Link
              href="/terms-of-use"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Nike Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

