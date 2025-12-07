"use client";

import * as React from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageContainerProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  src: string;
  alt: string;
  caption?: string;
  zoomable?: boolean;
  maxHeight?: string | number;
  onZoomClick?: () => void;
  className?: string;
  objectFit?: "contain" | "cover";
  width?: number;
  height?: number;
  fill?: boolean;
}

export const ImageContainer = React.forwardRef<
  HTMLDivElement,
  ImageContainerProps
>(
  (
    {
      className,
      src,
      alt,
      caption,
      zoomable = false,
      maxHeight = 400,
      onZoomClick,
      objectFit = "contain",
      width,
      height,
      fill,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const maxHeightValue =
      typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

    const handleZoomClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onZoomClick?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-lg border border-border bg-muted p-4 shadow-sm overflow-hidden",
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Zoom Icon */}
        {zoomable && (
          <button
            onClick={handleZoomClick}
            className={cn(
              "absolute top-6 right-6 z-10 p-2 rounded bg-black/60 backdrop-blur-sm transition-opacity duration-150",
              "hover:bg-black/80",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            aria-label="Zoom image"
          >
            <ZoomIn className="h-5 w-5 text-white" />
          </button>
        )}

        {/* Image Container */}
        <div
          className={cn(
            "relative w-full rounded transition-transform duration-200",
            zoomable && isHovered && "scale-[1.02]",
            objectFit === "cover" ? "aspect-video" : "",
          )}
          style={{
            maxHeight: objectFit === "contain" ? maxHeightValue : undefined,
          }}
        >
          {fill ? (
            <Image
              src={src}
              alt={alt}
              fill
              className={cn(
                "rounded object-cover",
                objectFit === "contain" && "object-contain",
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width || 800}
              height={height || 400}
              className={cn(
                "w-full h-auto rounded",
                objectFit === "contain" && "object-contain",
                objectFit === "cover" && "object-cover",
              )}
              style={{
                maxHeight: objectFit === "contain" ? maxHeightValue : undefined,
              }}
            />
          )}
        </div>

        {/* Caption */}
        {caption && (
          <p className="text-xs font-normal text-muted-foreground text-center mt-3 max-w-[90%] mx-auto">
            {caption}
          </p>
        )}
      </div>
    );
  },
);

ImageContainer.displayName = "ImageContainer";
