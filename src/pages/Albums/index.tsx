import { useQuery } from "@tanstack/react-query";
import { getDeezerEditorialReleases } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

export function Albums() {
  const { data: releases, isLoading } = useQuery({
    queryKey: ["editorialReleases"],
    queryFn: getDeezerEditorialReleases,
  });

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-muted rounded-md" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">New Albums</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {releases?.albums?.data?.map((album: any) => (
          <Link
            key={album.id}
            to={`/album/${album.id}`}
            className="group space-y-3"
          >
            <div className="overflow-hidden rounded-md">
              <div className="relative aspect-square">
                <img
                  src={album.cover_xl || album.cover_big || album.cover_medium}
                  alt={album.title}
                  className="h-full w-full object-cover transition-all group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium leading-none line-clamp-1">{album.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{album.artist.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Albums; 