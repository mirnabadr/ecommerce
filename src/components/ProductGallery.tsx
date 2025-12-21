"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
  variantId: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  variantId?: string | null;
}

export function ProductGallery({ images, variantId }: ProductGalleryProps) {
  // Use images as provided (already filtered by variant)
  const filteredImages = images;

  // Sort by isPrimary first, then sortOrder
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  // Filter out invalid images
  const validImages = sortedImages.filter((img) => img.url && img.url.trim() !== "");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Reset to first image when variant or images change
  useEffect(() => {
    setCurrentIndex(0);
    setImageErrors(new Set());
  }, [variantId, images.length]);

  const handleImageError = useCallback((imageId: string) => {
    setImageErrors((prev) => new Set(prev).add(imageId));
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }, [validImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }, [validImages.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext]);

  // Get current valid images (excluding errored ones)
  const displayImages = validImages.filter(
    (img) => !imageErrors.has(img.id)
  );

  if (displayImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ImageOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = displayImages[currentIndex] || displayImages[0];

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Thumbnail Strip - Left side on desktop, top on mobile */}
        {displayImages.length > 1 && (
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide order-2 lg:order-1">
            {displayImages.map((img, index) => (
              <button
                key={img.id}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-black ${
                  index === currentIndex
                    ? "border-black"
                    : "border-transparent hover:border-gray-300"
                }`}
                aria-label={`View image ${index + 1}`}
                aria-pressed={index === currentIndex}
              >
                <div className="relative w-full h-full bg-gray-100">
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main Image Container */}
        <div className="relative flex-1 aspect-square bg-white order-1 lg:order-2">
          <div className="relative w-full h-full">
            {currentImage && (
              <Image
                src={currentImage.url}
                alt={`Product image ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                onError={() => handleImageError(currentImage.id)}
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border border-gray-300 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-black transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border border-gray-300 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-black transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-900" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

