import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ComponentProps<"div"> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "away" | "offline";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const statusColors = {
  online: "bg-[#6ECDC1]",
  away: "bg-yellow-500",
  offline: "bg-gray-400",
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, src, alt = "Avatar", initials, size = "md", status, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        {...props}
      >
        <div
          className={cn(
            "relative rounded-full overflow-hidden border-2 border-background shadow-sm transition-all duration-150",
            "hover:scale-105 hover:shadow-md",
            sizeClasses[size],
          )}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
              {initials || "?"}
            </div>
          )}
        </div>
        {status && (
          <div
            className={cn(
              "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background",
              statusColors[status],
            )}
          />
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
