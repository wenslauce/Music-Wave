export const DEEZER_API = "https://api.deezer.com";
const JIOSAAVN_API = "https://jiosaavn-sand.vercel.app/api";

export interface DeezerSearchResult {
  id: string;
  title: string;
  duration: number;
  preview: string;
  artist?: {
    id: string;
    name: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
  };
  album?: {
    id: string;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
  };
  type: string;
}

export interface DeezerArtist {
  id: string;
  name: string;
  picture_medium: string;
  nb_album: number;
  nb_fan: number;
  tracklist: string;
}

export interface DeezerAlbum {
  id: string;
  title: string;
  cover_medium: string;
  release_date: string;
  tracks: {
    data: DeezerSearchResult[];
  };
}

export interface DeezerPlaylist {
  id: string;
  title: string;
  description: string;
  picture_medium: string;
  nb_tracks: number;
  tracks: {
    data: DeezerSearchResult[];
  };
}

export interface JioSaavnSongResult {
  id: string;
  title: string;
  url: string;
}

export interface JioSaavnTrack {
  id: string;
  name: string;
  duration: string;
  image: Array<{ quality: string; url: string }>;
  downloadUrl: Array<{ quality: string; url: string }>;
  artists: {
    primary: Array<{
      id: string;
      name: string;
      image: Array<{ quality: string; url: string }>;
    }>;
  };
  album?: {
    id: string;
    name: string;
    url: string;
  };
}

interface JioSaavnApiResponse {
  success: boolean;
  data: {
    results: Array<{
      id: string;
      name: string;
      downloadUrl: Array<{
        quality: string;
        url: string;
      }>;
      image: Array<{
        quality: string;
        url: string;
      }>;
      artists: {
        primary: Array<{
          id: string;
          name: string;
        }>;
      };
      album?: {
        id: string | null;
        name: string | null;
        url: string | null;
      };
    }>;
  };
}

// Helper function to create fetch options
function createFetchOptions() {
  return {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  };
}

export const searchDeezer = async (query: string, type: string = 'all') => {
  if (!query.trim()) return null;

  try {
    let endpoint = '';
    switch (type) {
      case 'artist':
        endpoint = '/search/artist';
        break;
      case 'album':
        endpoint = '/search/album';
        break;
      case 'playlist':
        endpoint = '/search/playlist';
        break;
      case 'track':
        endpoint = '/search/track';
        break;
      default:
        endpoint = '/search';
    }

    const res = await fetch(`${DEEZER_API}${endpoint}?q=${encodeURIComponent(query.trim())}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Deezer API error: ${res.status}`);
    }

    const data = await res.json();

    if (type === 'all') {
      return {
        tracks: data.data?.filter((item: any) => item.type === 'track') || [],
        artists: data.data?.filter((item: any) => item.type === 'artist') || [],
        albums: data.data?.filter((item: any) => item.type === 'album') || [],
        playlists: data.data?.filter((item: any) => item.type === 'playlist') || [],
      };
    }

    return data.data || [];
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getArtist = async (id: string): Promise<DeezerArtist | null> => {
  try {
    const res = await fetch(`${DEEZER_API}/artist/${id}`, createFetchOptions());

    if (!res.ok) {
      throw new Error(`Failed to fetch artist: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching artist:", error);
    throw new Error("Failed to load artist information. Please try again later.");
  }
};

export const getAlbum = async (id: string): Promise<DeezerAlbum | null> => {
  try {
    const res = await fetch(`${DEEZER_API}/album/${id}`, createFetchOptions());

    if (!res.ok) {
      throw new Error(`Failed to fetch album: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching album:", error);
    throw new Error("Failed to load album information. Please try again later.");
  }
};

export const getPlaylist = async (id: string): Promise<DeezerPlaylist | null> => {
  try {
    const res = await fetch(`${DEEZER_API}/playlist/${id}`, createFetchOptions());

    if (!res.ok) {
      throw new Error(`Failed to fetch playlist: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw new Error("Failed to load playlist information. Please try again later.");
  }
};

export const getJioSaavnSong = async (query: string): Promise<string | null> => {
  try {
    const res = await fetch(`${JIOSAAVN_API}/search?query=${encodeURIComponent(query)}`, createFetchOptions());
    
    if (!res.ok) {
      throw new Error(`JioSaavn API error: ${res.status}`);
    }

    const data = await res.json();
    return data.data.songs.results[0]?.url || null;
  } catch (error) {
    console.error("Error fetching JioSaavn song:", error);
    throw new Error("Failed to load song. Please try again later.");
  }
};

export const getDeezerNewReleases = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/chart/0/albums`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch new releases');
    }

    const data = await response.json();
    
    return data.data.map((album: any) => ({
      id: album.id,
      title: album.title,
      cover: album.cover,
      cover_medium: album.cover_medium,
      cover_big: album.cover_big,
      artist: {
        id: album.artist.id,
        name: album.artist.name
      },
      type: 'album'
    }));
  } catch (error) {
    console.error('Error fetching new releases:', error);
    throw error;
  }
};

export const getDeezerArtist = async (id: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/artist/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch artist');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching artist:', error);
    throw error;
  }
};

export const getDeezerArtistTopTracks = async (id: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/artist/${id}/top`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch artist top tracks');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    throw error;
  }
};

export const getDeezerArtistAlbums = async (id: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/artist/${id}/albums`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch artist albums');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    throw error;
  }
};

export const getDeezerAlbum = async (id: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/album/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch album');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
};

export const getDeezerCharts = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/chart`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch charts');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching charts:', error);
    throw error;
  }
};

export const getDeezerPlaylists = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/editorial/0/charts`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }

    const data = await response.json();
    return data.playlists?.data || [];
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

export const getDeezerRadios = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/radio/top`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch radios');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching radios:', error);
    throw error;
  }
};

export const getDeezerPlaylist = async (id: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/playlist/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playlist');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw error;
  }
};

export const getDeezerGenres = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/genre`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const getDeezerGenreArtists = async (genreId: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/genre/${genreId}/artists`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch genre artists');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching genre artists:', error);
    throw error;
  }
};

export const getDeezerGenrePlaylists = async (genreId: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/genre/${genreId}/playlists`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch genre playlists');
    return response.json();
  } catch (error) {
    console.error('Error fetching genre playlists:', error);
    throw error;
  }
};

export const getDeezerEditorialCharts = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/editorial/0/charts`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch editorial charts');
    return response.json();
  } catch (error) {
    console.error('Error fetching editorial charts:', error);
    throw error;
  }
};

export const getDeezerEditorialSelections = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/editorial/0/selections`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch editorial selections');
    return response.json();
  } catch (error) {
    console.error('Error fetching editorial selections:', error);
    throw error;
  }
};

export const getDeezerEditorialReleases = async () => {
  try {
    const response = await fetch(`${DEEZER_API}/editorial/0/releases`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch editorial releases');
    return response.json();
  } catch (error) {
    console.error('Error fetching editorial releases:', error);
    throw error;
  }
};

interface ChartResponse {
  tracks: { data: any[] };
  playlists: { data: any[] };
  albums: { data: any[] };
}

// Regional chart IDs from Deezer
const CHART_REGIONS = {
  WORLDWIDE: 0,
  USA: 23,
  UK: 67,
  KENYA: 341
};

export const getRegionalChart = async (regionId: number): Promise<ChartResponse> => {
  try {
    const response = await fetch(`${DEEZER_API}/editorial/${regionId}/charts`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch charts for region ${regionId}`);
    return response.json();
  } catch (error) {
    console.error(`Error fetching charts for region ${regionId}:`, error);
    throw error;
  }
};

export const getDeezerGenre = async (genreId: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/genre/${genreId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch genre');
    return response.json();
  } catch (error) {
    console.error('Error fetching genre:', error);
    throw error;
  }
};

export const getDeezerGenreAlbums = async (genreId: string) => {
  try {
    const response = await fetch(`${DEEZER_API}/genre/${genreId}/albums`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch genre albums');
    return response.json();
  } catch (error) {
    console.error('Error fetching genre albums:', error);
    throw error;
  }
};

export async function searchJioSaavn(query: string) {
  try {
    const response = await fetch(`https://jiosaavn-sand.vercel.app/api/search/songs?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('JioSaavn search failed');
    
    const data: JioSaavnApiResponse = await response.json();
    console.log('Raw API Response:', data);

    if (!data.success || !data.data?.results?.[0]) {
      throw new Error('No results found');
    }
    
    const track = data.data.results[0];
    console.log('Selected track:', track);

    return track;
  } catch (error) {
    console.error('JioSaavn search error:', error);
    throw error;
  }
}

export function getBestQualityUrl(downloadUrls: Array<{ quality: string; url: string }>) {
  if (!Array.isArray(downloadUrls) || !downloadUrls.length) {
    console.error('Invalid downloadUrls:', downloadUrls);
    return '';
  }

  console.log('Available download URLs:', downloadUrls); // Debug log

  // Quality preference order
  const qualityOrder = ['320', '160', '96', '48'];
  
  // First try to find a URL with preferred quality
  for (const quality of qualityOrder) {
    const match = downloadUrls.find(item => item.quality === quality);
    if (match?.url) {
      console.log(`Selected ${quality}kbps URL:`, match.url);
      return match.url;
    }
  }

  // Fallback to first available URL
  console.log('Using fallback URL:', downloadUrls[0].url);
  return downloadUrls[0].url;
}

export async function getPlaybackUrl(track: DeezerSearchResult): Promise<string | null> {
  try {
    // Search JioSaavn using Deezer metadata
    const searchQuery = `${track.title} ${track.artist?.name}`;
    const response = await fetch(`${JIOSAAVN_API}/search/songs?query=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();

    if (!data.success || !data.data?.results?.length) {
      throw new Error('No results found on JioSaavn');
    }

    // Get best matching result
    const match = data.data.results[0];
    if (!match.downloadUrl?.length) {
      throw new Error('No download URLs available');
    }

    // Get highest quality URL
    const qualities = ["320kbps", "160kbps", "96kbps", "48kbps"];
    for (const quality of qualities) {
      const url = match.downloadUrl.find(u => u.quality === quality)?.url;
      if (url) return url;
    }

    return match.downloadUrl[0].url;
  } catch (error) {
    console.error('Error getting playback URL:', error);
    return null;
  }
}
