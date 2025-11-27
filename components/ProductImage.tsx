"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProductImage = ({ 
  src, 
  alt, 
  className = "w-full h-full object-cover",
  fallbackClassName
}: ProductImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clean the image URL - remove whitespace, newlines, and trim
  const cleanImageUrl = src 
    ? src.replace(/\s+/g, ' ').trim().replace(/\n/g, '')
    : null;

  if (!cleanImageUrl || imageError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted",
        fallbackClassName || className
      )}>
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <img
        src={cleanImageUrl}
        alt={alt}
        className={cn(className, isLoading && "opacity-0")}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        loading="lazy"
        crossOrigin="anonymous"
      />
    </div>
  );
};

