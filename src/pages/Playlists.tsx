import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDeezerPlaylists } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Play, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

export function Playlists() {
  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: getDeezerPlaylists,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-muted rounded-md" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20 md:pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Featured Playlists</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {playlists?.map((playlist) => (
          <Link
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            className="group space-y-3"
          >
            <div className="overflow-hidden rounded-md">
              <div className="relative aspect-square">
                <img
                  src={playlist.picture_big || playlist.picture_medium}
                  alt={playlist.title}
                  className="h-full w-full object-cover transition-all group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <Play className="h-8 w-8 md:h-12 md:w-12 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium leading-none line-clamp-1 text-sm md:text-base">
                {playlist.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                {playlist.nb_tracks} tracks • By {playlist.user?.name || 'Unknown'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {(!playlists || playlists.length === 0) && (
        <div className="text-center py-12 space-y-4">
          <ListMusic className="h-12 w-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium">No playlists found</p>
            <p className="text-sm text-muted-foreground">
              Try refreshing the page or check back later
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default Playlists;
