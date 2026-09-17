"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, PackageOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type ProductMediaProps = {
  imageUrl: string | null;
  imageAlt: string | null;
  productName: string;
  categoryName?: string;
  className?: string;
  sizes?: string;
  compact?: boolean;
};

export function ProductMedia({
  imageUrl,
  imageAlt,
  productName,
  categoryName,
  className,
  sizes = "(min-width: 1280px) 280px, (min-width: 768px) 33vw, 100vw",
  compact = false,
}: ProductMediaProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div
      className={cn(
        "bg-muted relative isolate flex aspect-[4/3] w-full items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div
        className="bg-accent/75 absolute inset-x-0 bottom-0 h-1/2 [clip-path:polygon(0_42%,100%_0,100%_100%,0_100%)]"
        aria-hidden="true"
      />
      <div
        className="border-primary/10 absolute -top-16 -right-16 size-48 rounded-full border-[28px]"
        aria-hidden="true"
      />

      {showImage && imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt?.trim() || productName}
          fill
          sizes={sizes}
          className="z-10 object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="relative z-10 flex max-w-[14rem] flex-col items-center px-6 text-center">
          <span className="bg-card text-primary shadow-card flex size-14 items-center justify-center rounded-2xl border">
            {imageFailed ? (
              <ImageOff className="size-6" aria-hidden="true" />
            ) : (
              <PackageOpen className="size-6" aria-hidden="true" />
            )}
          </span>
          {!compact ? (
            <>
              <span className="text-foreground mt-3 text-sm font-semibold">
                {productName}
              </span>
              <span className="text-muted-foreground mt-1 text-xs">
                {imageFailed
                  ? "Image unavailable"
                  : categoryName || "Product image coming soon"}
              </span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
