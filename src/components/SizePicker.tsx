"use client";

import { useState } from "react";

interface Size {
  id: string;
  name: string;
  slug: string;
  available: boolean;
}

interface SizePickerProps {
  sizes: Size[];
  selectedSizeId?: string | null;
  onSizeChange?: (sizeId: string) => void;
}

export function SizePicker({
  sizes,
  selectedSizeId,
  onSizeChange,
}: SizePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedSizeId || null);

  // Sort sizes by sortOrder (if available) or name
  const sortedSizes = [...sizes].sort((a, b) => {
    // Try to parse as number for numeric sizes
    const aNum = parseFloat(a.name);
    const bNum = parseFloat(b.name);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.name.localeCompare(b.name);
  });

  const handleSizeSelect = (sizeId: string) => {
    const size = sizes.find((s) => s.id === sizeId);
    if (size && size.available) {
      setSelectedId(sizeId);
      if (onSizeChange) {
        onSizeChange(sizeId);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, sizeId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSizeSelect(sizeId);
    }
  };

  if (sizes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-900">Select Size</span>
        <button
          className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-black rounded"
          aria-label="Open size guide"
        >
          Size Guide
        </button>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {sortedSizes.map((size) => {
          const isSelected = size.id === selectedId;
          const isDisabled = !size.available;

          return (
            <button
              key={size.id}
              onClick={() => handleSizeSelect(size.id)}
              onKeyDown={(e) => handleKeyDown(e, size.id)}
              disabled={isDisabled}
              className={`
                px-4 py-3 text-sm font-medium border-2 rounded transition-all
                focus:outline-none focus:ring-2 focus:ring-black
                ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : isDisabled
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-500"
                }
              `}
              aria-label={`Select size ${size.name}${isDisabled ? " (unavailable)" : ""}`}
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
            >
              {size.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

