"use client";

import { useEffect, useMemo, useState } from "react";

type ProductImageGalleryProps = {
  title: string;
  images: string[];
};

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";

  const value = src.trim();

  if (!value) return "/placeholder-product.png";

  return value;
}

export default function ProductImageGallery({
  title,
  images,
}: ProductImageGalleryProps) {
  const safeImages = useMemo(() => {
    const cleanedImages = images
      .map((image) => getSafeImage(image))
      .filter(Boolean);

    const uniqueImages = Array.from(new Set(cleanedImages));

    return uniqueImages.length > 0
      ? uniqueImages.slice(0, 5)
      : ["/placeholder-product.png"];
  }, [images]);

  const [selectedImage, setSelectedImage] = useState(safeImages[0]);

  useEffect(() => {
    setSelectedImage(safeImages[0]);
  }, [safeImages]);

  return (
    <div className="bg-[var(--surface-soft)] p-3 sm:p-4 lg:p-5">
      <div className="overflow-hidden rounded-[26px] bg-[var(--surface)]">
        <img
          src={selectedImage}
          alt={title}
          className="h-[320px] w-full object-contain sm:h-[500px] lg:h-[610px]"
          onError={(event) => {
            event.currentTarget.src = "/placeholder-product.png";
          }}
        />
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
          {safeImages.map((image, index) => {
            const isSelected = selectedImage === image;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                onMouseEnter={() => setSelectedImage(image)}
                onFocus={() => setSelectedImage(image)}
                className={`h-[58px] overflow-hidden rounded-[16px] border bg-[var(--surface)] transition sm:h-[76px] sm:rounded-[18px] ${
                  isSelected
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/25"
                    : "border-[var(--border-soft)] hover:border-[var(--primary)]"
                }`}
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder-product.png";
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}