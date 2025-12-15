import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        xs: "size-6 text-xs",
        sm: "size-8 text-sm",
        default: "size-10 text-base",
        lg: "size-12 text-lg",
        xl: "size-16 text-xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface AvatarProps
  extends React.ComponentProps<"div">, VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

function Avatar({
  className,
  size,
  src,
  alt = "",
  fallback,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const initials = React.useMemo(() => {
    if (fallback) return fallback;
    if (!alt) return "?";
    return alt
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [alt, fallback]);

  return (
    <div
      data-slot="avatar"
      className={cn(avatarVariants({ size }), "shadow-sm", className)}
      {...props}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          onError={() => setHasError(true)}
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="font-semibold text-[var(--foreground-muted)]">
          {initials}
        </span>
      )}
    </div>
  );
}

// Avatar group for showing multiple avatars
interface AvatarGroupProps extends React.ComponentProps<"div"> {
  max?: number;
  children: React.ReactNode;
}

function AvatarGroup({
  className,
  max = 4,
  children,
  ...props
}: AvatarGroupProps) {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div
      data-slot="avatar-group"
      className={cn("flex -space-x-2", className)}
      {...props}
    >
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="ring-2 ring-white rounded-full">
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="ring-2 ring-white rounded-full">
          <div className="size-10 flex items-center justify-center rounded-full bg-muted text-xs font-semibold text-[var(--foreground-muted)]">
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup, avatarVariants };
