import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDeezerCharts, getDeezerEditorialReleases, getDeezerEditorialSelections } from "@/lib/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/lib/store";
import { DeezerTrack } from "@/types/deezer";
import { toast } from "@/components/ui/use-toast";
import { ArtistLink } from "@/components/ArtistLink";

export function Artists() {
  const { setCurrentTrack, setPlaylist, setIsPlaying } = useMusicStore();

  // Fetch top artists from charts
  const { data: charts, isLoading: isLoadingCharts } = useQuery({
    queryKey: ["charts"],
    queryFn: getDeezerCharts,
  });

  // Fetch editorial selections for featured artists
  const { data: selections, isLoading: isLoadingSelections } = useQuery({
    queryKey: ["selections"],
    queryFn: getDeezerEditorialSelections,
  });

  // Fetch new releases for latest albums
  const { data: releases, isLoading: isLoadingReleases } = useQuery({
    queryKey: ["editorialReleases"],
    queryFn: getDeezerEditorialReleases,
  });

  const handleTrackPlay = (track: DeezerTrack, tracks: DeezerTrack[]) => {
    try {
      setPlaylist(tracks);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
      toast({
        title: "Error",
        description: "Failed to play track",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingCharts || isLoadingSelections || isLoadingReleases;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-pulse space-y-8">
          {/* Featured Artists Loading */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-muted rounded-full" />
                  <div className="h-4 w-3/4 bg-muted rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tracks Loading */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>

          {/* Latest Albums Loading */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-muted rounded-md" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Featured Artists */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">Featured Artists</h2>
        <ScrollArea>
          <div className="flex space-x-6 pb-4">
            {selections?.artists?.map((artist: any) => (
              <Link
                key={artist.id}
                to={`/artist/${artist.id}`}
                className="group w-[150px] md:w-[200px] space-y-4 text-center shrink-0"
              >
                <div className="overflow-hidden rounded-full aspect-square">
                  <img
                    src={artist.picture_big || artist.picture_medium}
                    alt={artist.name}
                    className="h-full w-full object-cover transition-all group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium line-clamp-1">{artist.name}</h3>
                  {artist.nb_fan && (
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat().format(artist.nb_fan)} fans
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Popular Tracks */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">Popular Tracks</h2>
        <div className="grid gap-2">
          {charts?.tracks?.data?.slice(0, 10).map((track: DeezerTrack) => (
            <Button
              key={track.id}
              variant="ghost"
              className="w-full flex items-center gap-4 p-4 h-auto justify-start"
              onClick={() => handleTrackPlay(track, charts.tracks.data)}
            >
              <img
                src={track.album.cover_small}
                alt={track.title}
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium truncate">{track.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArtistLink 
                    id={track.artist.id} 
                    name={track.artist.name}
                  />
                  {track.album && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="truncate">{track.album.title}</span>
                    </>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </section>

      {/* Latest Albums */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">Latest Albums</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/albums">View All</Link>
          </Button>
        </div>
        <ScrollArea>
          <div className="flex space-x-6 pb-4">
            {releases?.albums?.data?.map((album: any) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="group w-[150px] md:w-[200px] space-y-3 shrink-0"
              >
                <div className="overflow-hidden rounded-md">
                  <div className="relative aspect-square">
                    <img
                      src={album.cover_big || album.cover_medium}
                      alt={album.title}
                      className="h-full w-full object-cover transition-all group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                      <Play className="h-8 w-8 md:h-12 md:w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium leading-none line-clamp-1">
                    {album.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {album.artist.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
    </div>
  );
}

export default Artists; 