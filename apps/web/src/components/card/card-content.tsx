import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContentCardProps extends React.ComponentProps<"div"> {
  image?: React.ReactNode;
  category?: string;
  title: string;
  excerpt?: string;
  date?: string;
  author?: string;
}

export const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  (
    { className, image, category, title, excerpt, date, author, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-sm border border-border/60 rounded-xl overflow-hidden shadow-sm transition-all duration-250",
          "hover:shadow-md",
          className,
        )}
        {...props}
      >
        {image && (
          <div className="overflow-hidden">
            <div className="transition-transform duration-300 group-hover:scale-105">
              {image}
            </div>
          </div>
        )}
        <div className="p-4">
          {category && (
            <span className="text-xs font-medium text-primary mb-2 block">
              {category}
            </span>
          )}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-muted-foreground mb-3">{excerpt}</p>
          )}
          {(date || author) && (
            <div className="text-xs text-muted-foreground">
              {date && <span>{date}</span>}
              {date && author && <span className="mx-2">•</span>}
              {author && <span>{author}</span>}
            </div>
          )}
        </div>
      </div>
    );
  },
);
ContentCard.displayName = "ContentCard";
