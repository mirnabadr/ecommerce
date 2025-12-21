"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductGallery } from "./ProductGallery";
import { ColorSwatches } from "./ColorSwatches";
import { SizePicker } from "./SizePicker";
import { CollapsibleSection } from "./CollapsibleSection";
import { Heart, ShoppingBag } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";
import { toggleFavorite, isFavorite } from "@/lib/actions/favorites";
import type { ProductDetail } from "@/lib/actions/product";

interface ProductDetailClientProps {
  product: ProductDetail;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [isFavoriteState, setIsFavoriteState] = useState<boolean | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Helper function to get images for a specific variant (same logic as gallery)
  const getImagesForVariant = useCallback((variantId: string | null) => {
    if (!variantId) return product.images;
    
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return product.images;
    
    const variantSpecificImages = product.images.filter(
      (img) => img.variantId === variantId
    );
    const genericImages = product.images.filter((img) => !img.variantId);
    
    // Same logic as gallery: variant-specific first, then generic
    if (variantSpecificImages.length > 0) {
      return [...variantSpecificImages, ...genericImages];
    }
    return genericImages.length > 0 ? genericImages : product.images;
  }, [product.images, product.variants]);

  // Get images for selected variant - use the same helper function
  const variantImages = useMemo(() => {
    return getImagesForVariant(selectedVariantId);
  }, [selectedVariantId, getImagesForVariant]);
  
  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId),
    [selectedVariantId, product.variants]
  );

  // Check favorite status on mount
  useEffect(() => {
    isFavorite(product.id).then((fav) => setIsFavoriteState(fav ?? false));
  }, [product.id]);

  // Find the variant that matches selected color and size
  const finalVariant = useMemo(() => {
    if (!selectedVariant) {
      return null;
    }
    
    // If size is selected, find variant with same color and selected size
    if (selectedSizeId) {
      const matchingVariant = product.variants.find(
        (v) => v.color.id === selectedVariant.color.id && v.size.id === selectedSizeId
      );
      return matchingVariant || selectedVariant;
    }
    
    // Otherwise use the selected variant (which has a default size)
    return selectedVariant;
  }, [selectedVariant, selectedSizeId, product.variants]);

  const handleAddToBag = async () => {
    if (!finalVariant) {
      alert("Please select a color and size");
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(finalVariant.id, 1);
      if (result.success) {
        // Show success feedback
        alert("Added to bag!");
        router.refresh(); // Refresh to update cart count
      } else {
        alert(result.error || "Failed to add to bag");
      }
    } catch (error) {
      console.error("Add to bag error:", error);
      alert("An error occurred while adding to bag");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      const result = await toggleFavorite(product.id);
      if (result.success && result.isFavorite !== undefined) {
        setIsFavoriteState(result.isFavorite);
      } else {
        alert(result.error || "Failed to update favorite");
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      alert("An error occurred");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Group variants by color for color swatches
  // For each color, find a UNIQUE image to avoid duplicates
  const colorVariants = useMemo(() => {
    const acc: Record<string, { id: string; color: any; variantId: string; imageUrl?: string }> = {};
    const usedImageUrls = new Set<string>();
    
    // First pass: prioritize variant-specific images for each color
    product.variants.forEach((variant) => {
      const colorId = variant.color.id;
      if (!acc[colorId]) {
        // Get variant-specific images first
        const variantSpecificImages = product.images.filter(
          (img) => img.variantId === variant.id
        );
        
        if (variantSpecificImages.length > 0) {
          // Sort: primary first, then by sortOrder
          const sorted = [...variantSpecificImages].sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return a.sortOrder - b.sortOrder;
          });
          
          // Find first unused image
          let imageUrl: string | undefined;
          for (const img of sorted) {
            if (!usedImageUrls.has(img.url)) {
              imageUrl = img.url;
              usedImageUrls.add(img.url);
              break;
            }
          }
          
          // If all variant-specific images are used, use the first one
          if (!imageUrl && sorted.length > 0) {
            imageUrl = sorted[0].url;
          }
          
          acc[colorId] = {
            id: variant.id,
            color: variant.color,
            variantId: variant.id,
            imageUrl: imageUrl,
          };
        }
      }
    });
    
    // Second pass: for colors without variant-specific images, use generic images
    product.variants.forEach((variant) => {
      const colorId = variant.color.id;
      if (!acc[colorId]) {
        // Get generic images
        const genericImages = product.images.filter((img) => !img.variantId);
        
        if (genericImages.length > 0) {
          // Sort: primary first, then by sortOrder
          const sorted = [...genericImages].sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return a.sortOrder - b.sortOrder;
          });
          
          // Find first unused generic image
          let imageUrl: string | undefined;
          for (const img of sorted) {
            if (!usedImageUrls.has(img.url)) {
              imageUrl = img.url;
              usedImageUrls.add(img.url);
              break;
            }
          }
          
          // If all generic images are used, cycle through them
          if (!imageUrl && sorted.length > 0) {
            const colorIndex = Object.keys(acc).length;
            imageUrl = sorted[colorIndex % sorted.length].url;
          }
          
          acc[colorId] = {
            id: variant.id,
            color: variant.color,
            variantId: variant.id,
            imageUrl: imageUrl,
          };
        } else if (product.images.length > 0) {
          // Last resort: use any product image
          const sortedAll = [...product.images].sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return a.sortOrder - b.sortOrder;
          });
          
          const colorIndex = Object.keys(acc).length;
          const imageUrl = sortedAll[colorIndex % sortedAll.length].url;
          
          acc[colorId] = {
            id: variant.id,
            color: variant.color,
            variantId: variant.id,
            imageUrl: imageUrl,
          };
        }
      }
    });
    
    return acc;
  }, [product.variants, product.images]);

  // Get unique sizes from variants
  const sizeMap = new Map<string, { id: string; name: string; slug: string; available: boolean }>();
  product.variants.forEach((variant) => {
    if (!sizeMap.has(variant.size.id)) {
      sizeMap.set(variant.size.id, {
        id: variant.size.id,
        name: variant.size.name,
        slug: variant.size.slug,
        available: variant.inStock > 0,
      });
    } else {
      const existing = sizeMap.get(variant.size.id)!;
      if (variant.inStock > 0) {
        existing.available = true;
      }
    }
  });

  const sizes = Array.from(sizeMap.values());

  // Calculate display price
  const displayPrice = selectedVariant
    ? selectedVariant.salePrice || selectedVariant.price
    : product.minPrice;
  
  const originalPrice = selectedVariant?.salePrice ? selectedVariant.price : null;
  const hasSale = selectedVariant?.salePrice !== null;

  return (
    <>
      {/* Left: Gallery */}
      <div className="order-2 lg:order-1">
        <ProductGallery images={variantImages} variantId={selectedVariantId} />
      </div>

      {/* Right: Product Info */}
      <div className="order-1 lg:order-2">
        {/* Badge */}
        {hasSale && (
          <div className="mb-4">
            <span className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded">
              Highly Rated
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>

        {/* Category */}
        <p className="text-base text-gray-600 mb-4">
          {product.gender.label}&apos;s {product.category.name}
        </p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            {originalPrice ? (
              <>
                <span className="text-3xl font-bold text-gray-900">
                  ${displayPrice.toFixed(2)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
            )}
          </div>
          {hasSale && (
            <p className="text-sm text-green-600 mt-1">
              Extra 20% off w/ code SPORT
            </p>
          )}
        </div>

        {/* Color Swatches */}
        <ColorSwatches
          variants={Object.values(colorVariants)}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
        />

        {/* Size Picker */}
        <SizePicker 
          sizes={sizes} 
          selectedSizeId={selectedSizeId}
          onSizeChange={setSelectedSizeId}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button 
            onClick={handleAddToBag}
            disabled={isAddingToCart || !finalVariant}
            className="flex-1 bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-5 h-5" />
            {isAddingToCart ? "Adding..." : "Add to Bag"}
          </button>
          <button 
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`px-6 py-3 border-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isFavoriteState
                ? "border-red-500 text-red-500 hover:bg-red-50"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavoriteState ? "fill-current" : ""}`} />
            {isTogglingFavorite ? "..." : "Favorite"}
          </button>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-0">
          <CollapsibleSection title="Product Details" defaultOpen={true}>
            <p className="mb-4">{product.description || "No description available."}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Padded collar</li>
              <li>Foam midsole</li>
              <li>Shown: {selectedVariant?.color.name || product.variants[0]?.color.name || "Various colors"}</li>
              <li>Style: {selectedVariant?.sku || product.variants[0]?.sku || "N/A"}</li>
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Shipping & Returns">
            <div className="space-y-3">
              <p>
                <strong>Free Shipping:</strong> Orders over $50 qualify for free standard shipping.
              </p>
              <p>
                <strong>Returns:</strong> Easy returns within 30 days of purchase. Items must be unworn and in original packaging.
              </p>
              <p>
                <strong>Delivery:</strong> Standard shipping takes 5-7 business days. Express shipping available at checkout.
              </p>
            </div>
          </CollapsibleSection>

        </div>
      </div>
    </>
  );
}

