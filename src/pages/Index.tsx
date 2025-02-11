import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { DeezerSearchResult, DEEZER_API } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { getDeezerNewReleases, getDeezerCharts, getDeezerPlaylists, getDeezerRadios, getDeezerGenres, getDeezerEditorialCharts, getDeezerEditorialSelections, getDeezerEditorialReleases, getDeezerGenrePlaylists, getRegionalChart, getDeezerPlaylist } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Play, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/lib/store";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { GENRES, type GenreId } from "@/lib/constants";
import { DeezerTrack } from '@/types/deezer';

interface FeaturedContent {
  playlists: {
    data: Array<{
      id: string;
      title: string;
      picture_medium: string;
      nb_tracks: number;
    }>;
  };
}

// Curated playlist IDs for each region
const CURATED_PLAYLISTS = {
  KENYA: {
    TOP_HITS: '1362509215',
    AFROBEATS: '1440614715',
    LOCAL_HITS: '1362509215',
  },
  WORLDWIDE: {
    TOP_100: '3155776842',
    VIRAL_HITS: '1111142361',
    NEW_RELEASES: '1313621735',
  },
  USA: {
    HOT_HITS: '1313621735',
    RAP_CAVIAR: '1362520725',
    POP_HITS: '1362524485',
  },
  UK: {
    TOP_40: '1313620765',
    BRIT_HITS: '1362526845',
    GRIME: '1362529235',
  }
};

// Helper function to convert raw track data to DeezerTrack format
function convertDeezerTrack(deezerTrack: any): DeezerTrack {
  if (!deezerTrack || !deezerTrack.id || !deezerTrack.title || !deezerTrack.artist || !deezerTrack.album) {
    throw new Error('Invalid Deezer track data');
  }

  return {
    id: deezerTrack.id,
    title: deezerTrack.title,
    duration: deezerTrack.duration || 0,
    preview: deezerTrack.preview || '',
    artist: {
      id: deezerTrack.artist.id,
      name: deezerTrack.artist.name,
      picture_small: deezerTrack.artist.picture_small || '',
      picture_medium: deezerTrack.artist.picture_medium || deezerTrack.artist.picture_small || '',
      picture_big: deezerTrack.artist.picture_big || deezerTrack.artist.picture_medium || '',
    },
    album: {
      id: deezerTrack.album.id,
      title: deezerTrack.album.title,
      cover_small: deezerTrack.album.cover_small || '/default-album-art.jpg',
      cover_medium: deezerTrack.album.cover_medium || '/default-album-art.jpg',
      cover_big: deezerTrack.album.cover_big || deezerTrack.album.cover_medium || '/default-album-art.jpg',
    }
  };
}

const Index = () => {
  const { toast } = useToast();

  const { data: featuredPlaylists, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ["featuredPlaylists"],
    queryFn: async () => {
      try {
        const res = await fetch(`${DEEZER_API}/editorial/0/charts`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch playlists: ${res.status}`);
        }
        
        const data: FeaturedContent = await res.json();
        return data.playlists?.data || [];
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load featured playlists. Please try again later.",
        });
        return [];
      }
    }
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery({
    queryKey: ["charts"],
    queryFn: getDeezerCharts,
  });

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getDeezerGenres,
  });

  const { data: editorialCharts, isLoading: isLoadingEditorialCharts } = useQuery({
    queryKey: ["editorialCharts"],
    queryFn: getDeezerEditorialCharts,
  });

  const { data: selections } = useQuery({
    queryKey: ["selections"],
    queryFn: getDeezerEditorialSelections,
  });

  const { data: newReleases, isLoading: isLoadingReleases } = useQuery({
    queryKey: ["editorialReleases"],
    queryFn: getDeezerEditorialReleases,
  });

  const { data: rapPlaylists } = useQuery({
    queryKey: ["genrePlaylists", "116"],
    queryFn: () => getDeezerGenrePlaylists("116"),
  });

  const { data: edmPlaylists } = useQuery({
    queryKey: ["genrePlaylists", "106"],
    queryFn: () => getDeezerGenrePlaylists("106"),
  });

  const { data: rnbPlaylists } = useQuery({
    queryKey: ["genrePlaylists", "165"],
    queryFn: () => getDeezerGenrePlaylists("165"),
  });

  const { data: afrobeatPlaylists } = useQuery({
    queryKey: ["genrePlaylists", "197"],
    queryFn: () => getDeezerGenrePlaylists("197"),
  });

  const { setCurrentTrack, setPlaylist } = useMusicStore();

  const randomAlbum = newReleases?.[Math.floor(Math.random() * (newReleases?.length || 1))];

  const handlePlay = () => {
    if (charts?.tracks?.data) {
      try {
        const validTracks = charts.tracks.data
          .filter(track => track && track.id) // Filter out invalid tracks
          .map(convertDeezerTrack);
        if (validTracks.length > 0) {
          setPlaylist(validTracks);
          setCurrentTrack(validTracks[0]);
        }
      } catch (error) {
        console.error('Error converting tracks:', error);
        toast({
          title: "Error",
          description: "Failed to play tracks",
          variant: "destructive",
        });
      }
    }
  };

  const renderSection = (title: string, items: any[] | undefined, type: 'playlist' | 'album' | 'radio' = 'playlist') => {
    if (!items || items.length === 0) return null;
    
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/${type}s`} className="text-sm md:text-base">View All</Link>
          </Button>
        </div>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {items.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/${type}/${item.id}`}
                className="group w-[150px] md:w-[200px] space-y-2 md:space-y-3 shrink-0"
                onClick={(e) => {
                  if (type === 'album' && item.tracks?.data) {
                    e.preventDefault();
                    const validTracks = item.tracks.data.map(convertDeezerTrack);
                    setPlaylist(validTracks);
                    setCurrentTrack(validTracks[0]);
                  }
                }}
              >
                <div className="overflow-hidden rounded-md">
                  <div className="relative aspect-square">
                    <img
                      src={
                        item.picture_xl || 
                        item.picture_big || 
                        item.picture_medium || 
                        item.album?.cover_xl || 
                        item.album?.cover_big || 
                        item.album?.cover_medium || 
                        item.cover_xl || 
                        item.cover_big || 
                        item.cover_medium
                      }
                      alt={item.title}
                      className="h-full w-full object-cover transition-all group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                      <Play className="h-8 w-8 md:h-12 md:w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium leading-none line-clamp-1 text-sm md:text-base">{item.title}</h3>
                  {item.artist && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{item.artist.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
    );
  };

  const renderGenreSection = (title: string, items: any[] | undefined) => {
    if (!items || items.length === 0) return null;
    
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        </div>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {items.map((genre) => {
              const genreInfo = GENRES[genre.id as GenreId];
              if (!genreInfo) return null;

              return (
                <Link
                  key={genre.id}
                  to={`/genre/${genre.id}`}
                  className="group w-[150px] md:w-[200px] space-y-2 md:space-y-3 shrink-0"
                >
                  <div className="overflow-hidden rounded-md">
                    <div className={`relative aspect-square ${genreInfo.color} transition-all group-hover:scale-105`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-lg md:text-xl font-bold text-white">{genreInfo.name}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
    );
  };

  const isLoading = isLoadingCharts || isLoadingEditorialCharts || isLoadingReleases;

  // Regional charts queries
  const { data: worldwideCharts } = useQuery({
    queryKey: ["charts", "worldwide"],
    queryFn: () => getRegionalChart(0),
  });

  const { data: usaCharts } = useQuery({
    queryKey: ["charts", "usa"],
    queryFn: () => getRegionalChart(23),
  });

  const { data: kenyaCharts } = useQuery({
    queryKey: ["charts", "kenya"],
    queryFn: () => getRegionalChart(341),
  });

  // Playlist queries for each region
  const { data: kenyaTopHits } = useQuery({
    queryKey: ["playlist", CURATED_PLAYLISTS.KENYA.TOP_HITS],
    queryFn: () => getDeezerPlaylist(CURATED_PLAYLISTS.KENYA.TOP_HITS),
  });

  const { data: kenyaAfrobeats } = useQuery({
    queryKey: ["playlist", CURATED_PLAYLISTS.KENYA.AFROBEATS],
    queryFn: () => getDeezerPlaylist(CURATED_PLAYLISTS.KENYA.AFROBEATS),
  });

  // Add TikTok Hits playlist query
  const { data: tiktokHits } = useQuery({
    queryKey: ["playlist", "4403076402"],
    queryFn: () => getDeezerPlaylist("4403076402"),
  });

  // Add Hip Hop Hits playlist query
  const { data: hipHopHits } = useQuery({
    queryKey: ["playlist", "1677006641"],
    queryFn: () => getDeezerPlaylist("1677006641"),
  });

  // Add 2000's Rap playlist query
  const { data: rap2000s } = useQuery({
    queryKey: ["playlist", "4676818664"],
    queryFn: () => getDeezerPlaylist("4676818664"),
  });

  const renderPlaylistSection = (title: string, playlist: any) => {
    if (!playlist?.tracks?.data) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xl font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{playlist.description || `${playlist.nb_tracks} tracks`}</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/playlist/${playlist.id}`}>View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlist.tracks.data.slice(0, 6).map((track: any, index: number) => (
            <Button
              key={track.id}
              variant="ghost"
              className="flex items-center gap-4 h-16 w-full"
              onClick={() => {
                setPlaylist(playlist.tracks.data);
                setCurrentTrack(track);
              }}
            >
              <div className="flex-shrink-0 w-12 h-12 relative">
                <img
                  src={track.album.cover_medium}
                  alt={track.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 hover:bg-black/40 hover:opacity-100 transition-all rounded">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left truncate">
                <p className="font-medium truncate">{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist.name}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-[75vh] bg-muted rounded-lg" />
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="space-y-3">
                      <div className="aspect-square bg-muted rounded-md" />
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12">
      <section className="relative h-[50vh] md:h-[65vh]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        </div>

        <div className="container relative h-full">
          <div className="flex h-full items-end pb-12 md:pb-24">
            <div className="max-w-2xl space-y-4 md:space-y-8">
              <div className="space-y-2 md:space-y-4">
                <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-white">
                  Your Music Journey Starts Here
                </h1>
                <p className="text-base md:text-xl text-white/80">
                  Discover millions of tracks, playlists, and podcasts. Stream your favorite music or explore new sounds.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => {
                    if (worldwideCharts?.tracks?.data) {
                      setPlaylist(worldwideCharts.tracks.data);
                      setCurrentTrack(worldwideCharts.tracks.data[0]);
                    }
                  }} 
                  className="text-base md:text-lg w-full sm:w-auto"
                >
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Play Top Hits
                </Button>
                <Button size="lg" variant="secondary" asChild className="text-base md:text-lg w-full sm:w-auto">
                  <Link to="/search">Discover More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-8 md:space-y-12">
        {/* TikTok Hits */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground">TikTok Hits</h3>
          {renderPlaylistSection("Viral TikTok Songs", tiktokHits)}
        </div>

        {/* Kenya Charts */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground">Top Kenya</h3>
          {renderPlaylistSection("Kenya Top 50", kenyaTopHits)}
          {renderPlaylistSection("Afrobeats Hits", kenyaAfrobeats)}
          {renderSection("Trending", kenyaCharts?.tracks?.data?.slice(0, 10), 'album')}
        </div>

        {/* Worldwide Charts */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground">Top Worldwide</h3>
          {renderPlaylistSection("Global Top 100", worldwideCharts?.playlists?.data?.[0])}
          {renderSection("Trending Globally", worldwideCharts?.tracks?.data?.slice(0, 10), 'album')}
        </div>

        {/* USA Charts */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground">Top USA</h3>
          {renderPlaylistSection("Hot Hits USA", usaCharts?.playlists?.data?.[0])}
          {renderSection("Trending in USA", usaCharts?.tracks?.data?.slice(0, 10), 'album')}
        </div>

        {/* Hip Hop Hits */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground">Hip Hop Hits</h3>
          {renderPlaylistSection("Latest Hip Hop Bangers", hipHopHits)}
        </div>

        {/* 2000's Rap */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground">2000's Rap</h3>
          {renderPlaylistSection("Classic 2000's Hip Hop", rap2000s)}
        </div>
      </div>
    </div>
  );
};

export default Index;
