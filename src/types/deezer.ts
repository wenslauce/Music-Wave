export interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: {
    id: number;
    name: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
  };
  album: {
    id: number;
    title: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
  };
}

export interface DeezerArtist {
  id: number;
  name: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  nb_fan?: number;
  tracklist?: string;
}

export interface DeezerAlbum {
  id: number;
  title: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  release_date: string;
  nb_tracks: number;
  artist: DeezerArtist;
  tracks?: {
    data: DeezerTrack[];
  };
}

export interface DeezerPlaylist {
  id: number;
  title: string;
  picture_medium: string;
  nb_tracks: number;
  description: string;
  user: {
    name: string;
  };
}

export interface DeezerChart {
  tracks: {
    data: DeezerTrack[];
  };
  playlists: {
    data: DeezerPlaylist[];
  };
  albums: {
    data: DeezerAlbum[];
  };
}

export interface JioSaavnResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Array<{
      id: string;
      name: string;
      type: string;
      downloadUrl: Array<{
        quality: string;
        url: string;
      }>;
      image: Array<{
        quality: string;
        url: string;
      }>;
      artists?: {
        primary: Array<{
          id: string;
          name: string;
          role: string;
          type: string;
          image: Array<{
            quality: string;
            url: string;
          }>;
          url: string;
        }>;
      };
    }>;
  };
} 