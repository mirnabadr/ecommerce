"use client";

import Image from "next/image";
import Link from "next/link";

interface CardProps {
  title: string;
  subtitle: string;
  meta?: string;
  price: number;
  imageSrc: string;
  badge?: { label: string; tone: "orange" | "red" | "green" };
  href: string;
}

export function Card({
  title,
  subtitle,
  meta,
  price,
  imageSrc,
  badge,
  href,
}: CardProps) {
  const badgeColors = {
    orange: "bg-orange-500",
    red: "bg-red-500",
    green: "bg-green-500",
  };

  return (
    <Link href={href} className="group block">
      <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-2 left-2 z-10 ${badgeColors[badge.tone]} text-white text-xs font-semibold px-2 py-1 rounded`}
          >
            {badge.label}
          </div>
        )}

        {/* Image */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
          {meta && (
            <p className="text-xs text-gray-500 mb-3">{meta}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${meta && meta.includes("off") ? "text-gray-400 line-through" : "text-gray-900"}`}>
                ${price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

