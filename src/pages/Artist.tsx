import { useState, useEffect } from 'react';
import { useMusicStore } from "@/lib/store";
import { DeezerTrack } from "@/types/deezer";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArtistLink } from "@/components/ArtistLink";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeezerArtist, getDeezerArtistTopTracks } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function Artist() {
  const { id } = useParams();
  const { setCurrentTrack, setPlaylist, setIsPlaying } = useMusicStore();
  const { toast } = useToast();

  const { data: artist, isLoading: isLoadingArtist } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => getDeezerArtist(id as string),
    enabled: !!id,
  });

  const { data: topTracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: ["artistTracks", id],
    queryFn: () => getDeezerArtistTopTracks(id as string),
    enabled: !!id,
  });

  const handleTrackSelect = async (track: DeezerTrack, tracks: DeezerTrack[]) => {
    try {
      // Validate track data
      if (!track || !track.title || !track.artist?.name) {
        throw new Error('Invalid track data');
      }

      // Update playlist and current track
      setPlaylist(tracks);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to play track",
        variant: "destructive",
      });
    }
  };

  const handlePlayAll = async () => {
    if (topTracks?.length > 0) {
      await handleTrackSelect(topTracks[0], topTracks);
    }
  };

  const isLoading = isLoadingArtist || isLoadingTracks;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!artist || !topTracks) return null;

  return (
    <div className="container mx-auto px-4 pb-20 md:pb-8 space-y-6">
      {/* Artist header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
        <img
          src={artist.picture_big || artist.picture_medium}
          alt={artist.name}
          className="w-48 h-48 md:w-64 md:h-64 rounded-full shadow-lg object-cover"
        />
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">{artist.name}</h1>
            {artist.nb_fan && (
              <p className="text-sm md:text-base text-muted-foreground">
                {artist.nb_fan.toLocaleString()} fans
              </p>
            )}
          </div>
          {topTracks.length > 0 && (
            <Button
              onClick={handlePlayAll}
              size="lg"
              className="w-full md:w-auto gap-2"
            >
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              Play All
            </Button>
          )}
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Popular Tracks</h2>
        <div className="grid gap-2">
          {topTracks.map((track) => (
            <Button
              key={track.id}
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-4 p-4 h-auto",
                "justify-start text-left hover:bg-accent"
              )}
              onClick={() => handleTrackSelect(track, topTracks)}
            >
              <img
                src={track.album.cover_small || '/default-album-art.jpg'}
                alt={track.title}
                className="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm md:text-base">{track.title}</p>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <ArtistLink 
                    id={track.artist.id} 
                    name={track.artist.name}
                  />
                  {track.album && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="truncate hidden md:inline">{track.album.title}</span>
                    </>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Artist;
