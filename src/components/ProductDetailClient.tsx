"use client";

import { useState, useMemo, useCallback } from "react";
import { ProductGallery } from "./ProductGallery";
import { ColorSwatches } from "./ColorSwatches";
import { SizePicker } from "./SizePicker";
import { CollapsibleSection } from "./CollapsibleSection";
import { Heart, ShoppingBag } from "lucide-react";
import type { ProductDetail } from "@/lib/actions/product";

interface ProductDetailClientProps {
  product: ProductDetail;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );

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
  }, [product.variants, product.images, getImagesForVariant]);

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
          {product.gender.label}'s {product.category.name}
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
        <SizePicker sizes={sizes} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button className="flex-1 bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Add to Bag
          </button>
          <button className="px-6 py-3 border-2 border-gray-300 rounded-md font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors flex items-center justify-center gap-2">
            <Heart className="w-5 h-5" />
            Favorite
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

          <CollapsibleSection title="Reviews" badge={10} rating={5}>
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </>
  );
}

