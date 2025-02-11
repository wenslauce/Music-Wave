import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Music, User, Disc, ListMusic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchDeezer } from "@/lib/api";
import { useMusicStore } from "@/lib/store";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArtistLink } from "@/components/ArtistLink";

export function Search() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const debouncedQuery = useDebounce(query, 500);
  const { setCurrentTrack, setPlaylist } = useMusicStore();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery, activeTab],
    queryFn: () => searchDeezer(debouncedQuery, activeTab),
    enabled: debouncedQuery.length > 2,
  });

  const handleTrackClick = (track: any, tracks: any[]) => {
    const validTracks = tracks.filter(t => t.preview);
    setPlaylist(validTracks);
    setCurrentTrack(track);
  };

  const renderTrackItem = (track: any) => (
    <Button
      key={track.id}
      variant="ghost"
      className="w-full flex items-center gap-4 p-4 hover:bg-accent h-auto"
      onClick={() => handleTrackClick(track, searchResults?.tracks || [])}
      disabled={!track.preview}
    >
      <img
        src={track.album?.cover_medium || "/placeholder.svg"}
        alt={track.title}
        className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover"
      />
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium truncate text-sm md:text-base">{track.title}</p>
        <p className="text-xs md:text-sm truncate text-muted-foreground">
          {track.artist && (
            <ArtistLink id={track.artist.id} name={track.artist.name} />
          )}
          {track.album && (
            <>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="hidden md:inline">{track.album.title}</span>
            </>
          )}
        </p>
      </div>
      {!track.preview && (
        <span className="text-xs text-muted-foreground">Preview unavailable</span>
      )}
    </Button>
  );

  const renderAlbumItem = (album: any) => (
    <Link 
      to={`/album/${album.id}`}
      key={album.id}
      className="group p-2 md:p-4 space-y-2 md:space-y-3"
    >
      <div className="aspect-square overflow-hidden rounded-md">
        <img
          src={album.cover_big || album.cover_medium || "/placeholder.svg"}
          alt={album.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div>
        <h3 className="font-medium truncate text-sm md:text-base">{album.title}</h3>
        {album.artist && (
          <ArtistLink 
            id={album.artist.id} 
            name={album.artist.name} 
            className="text-xs md:text-sm"
          />
        )}
      </div>
    </Link>
  );

  const renderArtistItem = (artist: any) => (
    <Link 
      to={`/artist/${artist.id}`}
      key={artist.id}
      className="group p-2 md:p-4 space-y-2 md:space-y-3 text-center"
    >
      <div className="aspect-square overflow-hidden rounded-full mx-auto">
        <img
          src={artist.picture_big || artist.picture_medium || "/placeholder.svg"}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div>
        <h3 className="font-medium truncate text-sm md:text-base">{artist.name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          {artist.nb_fan?.toLocaleString()} fans
        </p>
      </div>
    </Link>
  );

  const renderPlaylistItem = (playlist: any) => (
    <Link 
      to={`/playlist/${playlist.id}`}
      key={playlist.id}
      className="group p-2 md:p-4 space-y-2 md:space-y-3"
    >
      <div className="aspect-square overflow-hidden rounded-md">
        <img
          src={playlist.picture_big || playlist.picture_medium || "/placeholder.svg"}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div>
        <h3 className="font-medium truncate text-sm md:text-base">{playlist.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground truncate">
          {playlist.nb_tracks} tracks • By {playlist.user?.name}
        </p>
      </div>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 pb-20 md:pb-8 space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for songs, artists, albums or playlists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {debouncedQuery.length > 2 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2 text-xs md:text-sm">
              <Music className="h-4 w-4" />
              <span className="hidden md:inline">All</span>
            </TabsTrigger>
            <TabsTrigger value="artist" className="flex items-center gap-2 text-xs md:text-sm">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Artists</span>
            </TabsTrigger>
            <TabsTrigger value="album" className="flex items-center gap-2 text-xs md:text-sm">
              <Disc className="h-4 w-4" />
              <span className="hidden md:inline">Albums</span>
            </TabsTrigger>
            <TabsTrigger value="playlist" className="flex items-center gap-2 text-xs md:text-sm">
              <ListMusic className="h-4 w-4" />
              <span className="hidden md:inline">Playlists</span>
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-6">
                {searchResults?.tracks?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Songs</h3>
                      {searchResults.tracks.length > 5 && (
                        <Button variant="link" onClick={() => setActiveTab('track')}>
                          Show all
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {searchResults.tracks.slice(0, 5).map(renderTrackItem)}
                    </div>
                  </div>
                )}

                {searchResults?.artists?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Artists</h3>
                      {searchResults.artists.length > 4 && (
                        <Button variant="link" onClick={() => setActiveTab('artist')}>
                          Show all
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {searchResults.artists.slice(0, 4).map(renderArtistItem)}
                    </div>
                  </div>
                )}

                {searchResults?.albums?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Albums</h3>
                      {searchResults.albums.length > 4 && (
                        <Button variant="link" onClick={() => setActiveTab('album')}>
                          Show all
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {searchResults.albums.slice(0, 4).map(renderAlbumItem)}
                    </div>
                  </div>
                )}

                {searchResults?.playlists?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Playlists</h3>
                      {searchResults.playlists.length > 4 && (
                        <Button variant="link" onClick={() => setActiveTab('playlist')}>
                          Show all
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {searchResults.playlists.slice(0, 4).map(renderPlaylistItem)}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="artist" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults?.artists?.map(renderArtistItem)}
              </TabsContent>

              <TabsContent value="album" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults?.albums?.map(renderAlbumItem)}
              </TabsContent>

              <TabsContent value="playlist" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults?.playlists?.map(renderPlaylistItem)}
              </TabsContent>

              <TabsContent value="track" className="space-y-2">
                {searchResults?.tracks?.map(renderTrackItem)}
              </TabsContent>
            </>
          )}
        </Tabs>
      )}
    </div>
  );
}

export default Search;
