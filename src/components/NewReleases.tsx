import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDeezerNewReleases } from "@/lib/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArtistLink } from "@/components/ArtistLink";

export function NewReleases() {
  const { data: newReleases, isLoading } = useQuery({
    queryKey: ["newReleases"],
    queryFn: getDeezerNewReleases,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">New Releases</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">New Releases</h2>
      </div>
      <ScrollArea>
        <div className="flex space-x-4 pb-4">
          {newReleases?.map((album) => (
            <Link
              key={album.id}
              to={`/album/${album.id}`}
              className="w-[200px] space-y-3"
            >
              <div className="overflow-hidden rounded-md">
                <img
                  src={album.cover_big || album.cover_medium || album.cover}
                  alt={album.title}
                  className="aspect-square h-auto w-full object-cover transition-all hover:scale-105"
                />
              </div>
              <div className="space-y-1 text-sm">
                <h3 className="font-medium leading-none">{album.title}</h3>
                {album.artist && (
                  <ArtistLink 
                    id={album.artist.id} 
                    name={album.artist.name} 
                    className="text-xs"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
} 