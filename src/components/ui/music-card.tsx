import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import Image from "next/image";

interface MusicCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  className?: string;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  onClick?: () => void;
}

export function MusicCard({
  title,
  subtitle,
  imageUrl,
  className,
  aspectRatio = "square",
  width = 200,
  height = 200,
  onClick,
}: MusicCardProps) {
  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-colors hover:bg-accent",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className={cn(
          "overflow-hidden rounded-md",
          aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
        )}>
          <Image
            src={imageUrl}
            alt={title}
            width={width}
            height={height}
            className={cn(
              "h-auto w-auto object-cover transition-all hover:scale-105",
              aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
            )}
          />
        </div>
        <CardHeader className="p-0 pt-4">
          <CardTitle className="text-sm font-medium leading-none">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="text-xs text-muted-foreground">
              {subtitle}
            </CardDescription>
          )}
        </CardHeader>
      </CardContent>
    </Card>
  );
} 