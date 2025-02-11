'use client';

import { Link } from 'react-router-dom';
import { useMusicStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Repeat, Repeat1, Shuffle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { formatTime } from '@/lib/utils';
import { DeezerTrack, JioSaavnResponse } from '@/types/deezer';
import { toast } from '@/components/ui/use-toast';

interface PlayerProps {
  className?: string;
  isLoading?: boolean;
}

export function Player({ className, isLoading }: PlayerProps) {
  const { 
    currentTrack,
    isPlaying,
    volume,
    progress,
    repeatMode,
    isShuffled,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    setProgress,
    toggleRepeat,
    toggleShuffle,
    setIsPlaying
  } = useMusicStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const getJioSaavnUrl = async (track: DeezerTrack): Promise<string | null> => {
    try {
      // Clean and format search query
      const cleanTitle = track.title.toLowerCase()
        .replace(/\(feat\..*?\)/g, '') // Remove feat. sections
        .replace(/\[.*?\]/g, '')       // Remove bracketed sections
        .replace(/\(.*?\)/g, '')       // Remove parentheses sections
        .trim();
      
      const cleanArtist = track.artist.name.toLowerCase()
        .replace(/&/g, 'and')          // Replace & with 'and'
        .replace(/ft\./g, '')          // Remove ft.
        .replace(/feat\./g, '')        // Remove feat.
        .trim();

      const searchQuery = `${cleanTitle} ${cleanArtist}`;
      console.log('🔍 Searching JioSaavn:', searchQuery);

      // Add parameters for high quality
      const params = new URLSearchParams({
        query: searchQuery,
        limit: '20',
        lyrics: 'false',
        premium: 'false',
        sort: 'relevance',
        params: JSON.stringify({
          quality: ['320'],  // Only highest quality
          format: 'mp4',    // MP4 only
          bitrate: '320',
          cache: false,
          type: 'song',
          __call: 'song.getDetails',
          _format: 'json',
          _marker: '0'
        })
      });

      const response = await fetch(
        `https://jiosaavn-sand.vercel.app/api/search/songs?${params.toString()}`,
        { 
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!response.ok) {
        throw new Error('JioSaavn API error');
      }

      const data: JioSaavnResponse = await response.json();
      console.log('JioSaavn response:', data);

      if (!data.success || !data.data?.results?.length) {
        console.log('⚠️ No JioSaavn results found, falling back to preview URL');
        return track.preview;
      }

      // Find best matching result by comparing titles and artists
      const results = data.data.results;
      let bestMatch = null;
      let highestScore = 0;

      // Score-based matching
      for (const result of results) {
        let score = 0;
        const resultTitle = result.name.toLowerCase();
        const resultArtists = result.artists?.primary?.map(a => a.name.toLowerCase()) || [];

        // Exact title match
        if (resultTitle === cleanTitle) {
          score += 100;
        } else if (resultTitle.includes(cleanTitle) || cleanTitle.includes(resultTitle)) {
          score += 50;
        }

        // Artist match
        if (resultArtists.some(artist => artist === cleanArtist)) {
          score += 100;
        } else if (resultArtists.some(artist => 
          artist.includes(cleanArtist) || cleanArtist.includes(artist)
        )) {
          score += 50;
        }

        // Update best match if score is higher
        if (score > highestScore) {
          highestScore = score;
          bestMatch = result;
        }

        // Break early if we find a perfect match
        if (score === 200) break;
      }

      // If no good match found (score < 50), fall back to Deezer preview
      if (!bestMatch || highestScore < 50) {
        console.log('⚠️ No good match found, falling back to preview URL');
        return track.preview;
      }

      // Quality selection - Prioritize MP4 320kbps
      if (!bestMatch.downloadUrl?.length) {
        console.log('⚠️ No download URLs found, falling back to preview URL');
        return track.preview;
      }

      // First try: Find exact 320.mp4 URL
      const highQualityMp4 = bestMatch.downloadUrl.find(u => 
        u.url.toLowerCase().endsWith('320.mp4')
      )?.url;

      if (highQualityMp4) {
        // Verify URL is accessible
        try {
          const urlCheck = await fetch(highQualityMp4, { method: 'HEAD' });
          if (urlCheck.ok) {
            console.log('✅ Found verified JioSaavn 320kbps MP4 URL');
            return highQualityMp4;
          }
        } catch (error) {
          console.warn('Failed to verify 320kbps MP4 URL:', error);
        }
      }

      // Second try: Find URL containing both 320 and mp4
      const alternativeMp4 = bestMatch.downloadUrl.find(u => {
        const url = u.url.toLowerCase();
        return url.includes('320') && url.includes('mp4');
      })?.url;

      if (alternativeMp4) {
        console.log('✅ Found alternative 320kbps MP4 URL');
        return alternativeMp4;
      }

      // Last resort: use Deezer preview
      console.log('⚠️ No high quality MP4 URL available, using Deezer preview URL');
      return track.preview;

    } catch (error) {
      console.error('❌ Error getting JioSaavn URL:', error);
      toast({
        title: "Playback Error",
        description: "Unable to find high quality stream. Using preview.",
        variant: "destructive",
      });
      return track.preview;
    }
  };

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const setupPlayback = async () => {
      try {
        setPlaybackError(null);

        // Get playback URL
        console.log('Getting playback URL for:', currentTrack.title, 'by', currentTrack.artist.name);
        const url = await getJioSaavnUrl(currentTrack);
        
        if (!url) {
          console.error('No playback URL available');
          setPlaybackError('No playback URL available');
          setIsPlaying(false);
          return;
        }

        console.log('Setting up playback with URL:', url);
        
        // Set up audio playback
        audioRef.current.src = url;
        audioRef.current.load();
        
        // Always try to play when track changes
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          console.log('Playback started successfully');
        } catch (error) {
          console.error('Playback error:', error);
          setIsPlaying(false);
          setPlaybackError(error instanceof Error ? error.message : 'Failed to start playback');
          
          // Try fallback to preview URL if main URL fails
          if (currentTrack.preview && url !== currentTrack.preview) {
            console.log('Trying preview URL as fallback');
            try {
              audioRef.current.src = currentTrack.preview;
              audioRef.current.load();
              await audioRef.current.play();
              setIsPlaying(true);
              setPlaybackError(null);
            } catch (previewError) {
              console.error('Preview playback failed:', previewError);
              setPlaybackError('Unable to play this track');
              setIsPlaying(false);
            }
          }
        }
      } catch (error) {
        console.error('Setup failed:', error);
        setPlaybackError(error instanceof Error ? error.message : 'Failed to set up playback');
        setIsPlaying(false);
      }
    };

    setupPlayback();
  }, [currentTrack]); // Remove isPlaying from dependencies

  // Handle play/pause separately
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Play failed:', error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error('Repeat play failed:', error);
          setIsPlaying(false);
        });
      } else {
        nextTrack();
      }
    };

    const handleError = async (e: ErrorEvent) => {
      if (currentTrack.preview && audio.src !== currentTrack.preview) {
        try {
          audio.src = currentTrack.preview;
          await audio.play();
          setIsPlaying(true);
        } catch (previewError) {
          setPlaybackError('Unable to play this track');
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
    };
  }, [currentTrack, repeatMode, nextTrack, setProgress]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleProgressChange = (values: number[]) => {
    if (!audioRef.current || values.length === 0) return;
    const newTime = (values[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(values[0]);
  };

  if (playbackError) {
    return (
      <div className={cn("fixed bottom-0 left-0 right-0 z-50 border-t bg-background", className)}>
        <div className="container h-16 flex items-center justify-center text-destructive">
          <p>{playbackError}</p>
        </div>
      </div>
    );
  }

  if (!currentTrack) return null;

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 border-t bg-background", className)}>
      <audio ref={audioRef} />
      <Progress value={progress} className="h-1" />
      
      {/* Mobile Player */}
      <div className="md:hidden container h-16">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={currentTrack.album.cover_small}
              alt={currentTrack.title}
              className="h-10 w-10 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentTrack.artist.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={previousTrack}
            >
              <SkipBack className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Player */}
      <div className="hidden md:block container h-24">
        <div className="flex h-full items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={currentTrack.album.cover_medium}
              alt={currentTrack.title}
              className="h-16 w-16 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {currentTrack.title}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {currentTrack.artist.name}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn(isShuffled && "text-primary")}
              >
                <Shuffle className="h-5 w-5" />
                <span className="sr-only">Shuffle</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={previousTrack}
              >
                <SkipBack className="h-5 w-5" />
                <span className="sr-only">Previous</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
                <span className="sr-only">
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
              >
                <SkipForward className="h-5 w-5" />
                <span className="sr-only">Next</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                className={cn(repeatMode !== 'off' && "text-primary")}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-5 w-5" />
                ) : (
                  <Repeat className="h-5 w-5" />
                )}
                <span className="sr-only">Repeat</span>
              </Button>
            </div>

            <div className="flex w-full items-center gap-2">
              <span className="text-sm text-muted-foreground w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={handleProgressChange}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={(values) => setVolume(values[0])}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 