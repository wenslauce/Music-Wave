import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getDeezerPlaylist } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/lib/store";
import { Play, Pause, Clock } from "lucide-react";
import { ArtistLink } from "@/components/ArtistLink";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { DeezerTrack } from "@/types/deezer";
import { convertToTrack } from '@/lib/helpers';

export function Playlist() {
  const { id } = useParams();
  const { currentTrack, setCurrentTrack, setPlaylist, isPlaying, setIsPlaying } = useMusicStore();
  const { toast } = useToast();

  const { data: playlist, isLoading } = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => getDeezerPlaylist(id as string),
    enabled: !!id,
  });

  const handlePlayTrack = async (track: any, tracks: any[]) => {
    try {
      // Filter out invalid tracks
      const validTracks = tracks.filter(t => t && t.id);
      
      // Find the selected track
      const selectedTrack = validTracks.find(t => t.id === track.id);
      if (!selectedTrack) {
        throw new Error('Selected track not found');
      }

      // Update the playlist and current track
      setPlaylist(validTracks);
      setCurrentTrack(selectedTrack);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 md:h-64 bg-muted rounded-lg" />
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="container mx-auto px-4 pb-20 md:pb-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
        <img
          src={playlist.picture_big || playlist.picture_medium}
          alt={playlist.title}
          className="w-48 h-48 md:w-64 md:h-64 rounded-lg shadow-xl object-cover"
        />
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-bold">{playlist.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {playlist.description || `Created by ${playlist.creator?.name}`}
          </p>
          <p className="text-sm md:text-base text-muted-foreground">
            {playlist.nb_tracks} tracks • {Math.round(playlist.duration / 60)} minutes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={() => playlist.tracks?.data && handlePlayTrack(playlist.tracks.data[0], playlist.tracks.data)}
          >
            <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Play All
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 text-muted-foreground text-sm font-medium">
            <div className="w-8">#</div>
            <div>Title</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="divide-y">
            {playlist.tracks?.data?.map((track: any, index: number) => (
              <Button
                key={track.id}
                variant="ghost"
                className={cn(
                  "w-full grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto]",
                  "items-center gap-4 p-4 hover:bg-accent rounded-none",
                  "text-left"
                )}
                onClick={() => handlePlayTrack(track, playlist.tracks.data)}
              >
                <div className="hidden md:block w-8 text-sm text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex flex-col items-start gap-1 min-w-0">
                  <span className="font-medium truncate w-full">
                    {track.title}
                  </span>
                  {track.artist && (
                    <ArtistLink 
                      id={track.artist.id} 
                      name={track.artist.name}
                      className="text-sm"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                  </span>
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  ) : null}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playlist; 