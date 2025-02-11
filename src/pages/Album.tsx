import { useState, useEffect } from 'react';
import { useMusicStore } from "@/lib/store";
import { DeezerTrack } from "@/types/deezer";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArtistLink } from "@/components/ArtistLink";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeezerAlbum } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function Album() {
  const { id } = useParams();
  const { setCurrentTrack, setPlaylist, setIsPlaying } = useMusicStore();
  const { toast } = useToast();

  const { data: album, isLoading } = useQuery({
    queryKey: ["album", id],
    queryFn: () => getDeezerAlbum(id as string),
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
    if (album?.tracks?.data?.length > 0) {
      await handleTrackSelect(album.tracks.data[0], album.tracks.data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Album header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <img
          src={album.cover_medium}
          alt={album.title}
          className="w-48 h-48 rounded-lg shadow-lg object-cover"
        />
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{album.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <ArtistLink 
                id={album.artist.id} 
                name={album.artist.name}
              />
              {album.release_date && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {new Date(album.release_date).getFullYear()}
                  </span>
                </>
              )}
              {album.nb_tracks && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {album.nb_tracks} tracks
                  </span>
                </>
              )}
            </div>
          </div>
          {album.tracks?.data?.length > 0 && (
            <Button
              onClick={handlePlayAll}
              size="lg"
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              Play All
            </Button>
          )}
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold mb-4">Tracks</h2>
        <div className="grid gap-2">
          {album.tracks?.data?.map((track: DeezerTrack) => (
            <Button
              key={track.id}
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-4 p-4 h-auto",
                "justify-start text-left"
              )}
              onClick={() => handleTrackSelect(track, album.tracks.data)}
            >
              <img
                src={track.album.cover_medium}
                alt={track.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArtistLink 
                    id={track.artist.id} 
                    name={track.artist.name}
                  />
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Album;
