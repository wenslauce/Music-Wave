import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ArtistLinkProps {
  id: string | number;
  name: string;
  className?: string;
  source?: 'deezer' | 'jiosaavn';
}

export function ArtistLink({ id, name, className, source = 'deezer' }: ArtistLinkProps) {
  // Only create clickable links for Deezer artists
  if (source === 'jiosaavn') {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {name}
      </span>
    );
  }

  return (
    <Link
      to={`/artist/${id}`}
      className={cn(
        "hover:underline text-muted-foreground hover:text-primary transition-colors",
        className
      )}
      onClick={(e) => e.stopPropagation()} // Prevent parent click handlers from firing
    >
      {name}
    </Link>
  );
} 