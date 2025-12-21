"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import Image from "next/image";

interface ColorVariant {
  id: string;
  color: {
    id: string;
    name: string;
    slug: string;
    hexCode: string;
  };
  variantId: string;
  imageUrl?: string;
}

interface ColorSwatchesProps {
  variants: ColorVariant[];
  selectedVariantId?: string | null;
  onVariantChange?: (variantId: string) => void;
}

export function ColorSwatches({
  variants,
  selectedVariantId,
  onVariantChange,
}: ColorSwatchesProps) {
  // Group variants by color
  const colorMap = new Map<string, ColorVariant[]>();
  variants.forEach((variant) => {
    const colorId = variant.color.id;
    if (!colorMap.has(colorId)) {
      colorMap.set(colorId, []);
    }
    colorMap.get(colorId)!.push(variant);
  });

  // Get unique colors (one variant per color)
  const uniqueColors = Array.from(colorMap.values()).map((variants) => variants[0]);

  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    selectedVariantId
      ? variants.find((v) => v.variantId === selectedVariantId)?.color.id || null
      : uniqueColors[0]?.color.id || null
  );

  useEffect(() => {
    if (selectedVariantId) {
      const variant = variants.find((v) => v.variantId === selectedVariantId);
      if (variant) {
        setSelectedColorId(variant.color.id);
      }
    }
  }, [selectedVariantId, variants]);

  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);
    // Find the variant that matches this color swatch
    const selectedVariant = uniqueColors.find((c) => c.color.id === colorId);
    if (selectedVariant && onVariantChange) {
      // Use the exact variant that this swatch represents
      onVariantChange(selectedVariant.variantId);
    }
  };

  if (uniqueColors.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        {uniqueColors.map((variant) => {
          const isSelected = variant.color.id === selectedColorId;
          // Always prefer image over color square
          const hasImage = variant.imageUrl && variant.imageUrl.trim() !== "";
          return (
            <button
              key={variant.color.id}
              onClick={() => handleColorSelect(variant.color.id)}
              className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-black overflow-hidden bg-gray-100 ${
                isSelected
                  ? "border-black"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              aria-label={`Select color ${variant.color.name}`}
              aria-pressed={isSelected}
            >
              {hasImage && variant.imageUrl ? (
                <>
                  <div className="relative w-full h-full">
                    <Image
                      src={variant.imageUrl}
                      alt={`${variant.color.name} color option`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 80px, 96px"
                      priority={isSelected}
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="absolute inset-0 bg-black/5"></div>
                      <Check className="relative w-5 h-5 text-black drop-shadow-lg bg-white rounded-full p-0.5 z-10" />
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full rounded flex items-center justify-center"
                  style={{ backgroundColor: variant.color.hexCode }}
                >
                  {isSelected && (
                    <Check className="w-5 h-5 text-white drop-shadow-lg" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

