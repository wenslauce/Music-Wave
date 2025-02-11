import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getDeezerGenre, getDeezerGenreArtists, getDeezerGenrePlaylists, getDeezerGenreAlbums } from "@/lib/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useMusicStore } from "@/lib/store";

export function Genre() {
  const { id } = useParams();
  const { setCurrentTrack, setPlaylist } = useMusicStore();

  // Fetch genre details
  const { data: genre, isLoading: isLoadingGenre } = useQuery({
    queryKey: ["genre", id],
    queryFn: () => getDeezerGenre(id as string),
    enabled: !!id,
  });

  const { data: artists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ["genreArtists", id],
    queryFn: () => getDeezerGenreArtists(id as string),
    enabled: !!id,
  });

  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ["genrePlaylists", id],
    queryFn: () => getDeezerGenrePlaylists(id as string),
    enabled: !!id,
  });

  const { data: albums, isLoading: isLoadingAlbums } = useQuery({
    queryKey: ["genreAlbums", id],
    queryFn: () => getDeezerGenreAlbums(id as string),
    enabled: !!id,
  });

  const renderSection = (title: string, items: any[] | undefined, type: 'artist' | 'playlist' | 'album' = 'artist') => {
    if (!items?.length) return null;
    
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        </div>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/${type}/${item.id}`}
                className="group w-[150px] md:w-[200px] space-y-2 md:space-y-3 shrink-0"
              >
                <div className="overflow-hidden rounded-md">
                  <div className="relative aspect-square">
                    <img
                      src={
                        item.picture_xl || 
                        item.picture_big || 
                        item.picture_medium || 
                        item.cover_xl || 
                        item.cover_big || 
                        item.cover_medium ||
                        item.picture?.xl ||
                        item.picture?.big ||
                        item.picture?.medium
                      }
                      alt={item.name || item.title}
                      className="h-full w-full object-cover transition-all group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                      <Play className="h-8 w-8 md:h-12 md:w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium leading-none line-clamp-1 text-sm md:text-base">
                    {item.name || item.title}
                  </h3>
                  {type === 'playlist' && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                      {item.nb_tracks} tracks
                    </p>
                  )}
                  {type === 'artist' && item.nb_fan && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                      {new Intl.NumberFormat().format(item.nb_fan)} fans
                    </p>
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

  if (isLoadingGenre || isLoadingArtists || isLoadingPlaylists || isLoadingAlbums) {
    return (
      <div className="container space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="space-y-3">
                      <div className="aspect-square bg-muted rounded-md" />
                      <div className="h-4 w-3/4 bg-muted rounded" />
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

  if (!genre) return null;

  return (
    <div className="container mx-auto px-4 pb-20 md:pb-8 space-y-6 md:space-y-8">
      {/* Genre Header */}
      <div 
        className="relative h-32 md:h-48 rounded-lg overflow-hidden"
        style={{
          backgroundColor: genre.picture_xl ? 'transparent' : 'var(--muted)'
        }}
      >
        {genre.picture_xl && (
          <>
            <img
              src={genre.picture_xl}
              alt={genre.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            {genre.name}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 md:space-y-10">
        {/* Top Artists */}
        {renderSection("Popular Artists", artists?.data, 'artist')}
        
        {/* Albums */}
        {renderSection("Popular Albums", albums?.data, 'album')}
        
        {/* Playlists */}
        {renderSection("Featured Playlists", playlists?.data, 'playlist')}
      </div>
    </div>
  );
}

export default Genre; 