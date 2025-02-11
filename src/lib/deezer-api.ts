import { DeezerChart, DeezerPlaylist, DeezerAlbum, DeezerTrack } from "@/types/deezer";

const DEEZER_API_BASE = "https://api.deezer.com";
const CORS_PROXY = "/api/proxy"; // We'll need to set this up in our Next.js API routes

async function fetchWithProxy(endpoint: string) {
  const response = await fetch(`${CORS_PROXY}?url=${encodeURIComponent(`${DEEZER_API_BASE}${endpoint}`)}`);
  if (!response.ok) throw new Error('API request failed');
  return response.json();
}

export async function getCharts(): Promise<DeezerChart> {
  return fetchWithProxy("/chart");
}

export async function getPlaylistsByGenre(genreId: number): Promise<{ data: DeezerPlaylist[] }> {
  return fetchWithProxy(`/genre/${genreId}/playlists`);
}

export async function getNewReleases(): Promise<{ data: DeezerAlbum[] }> {
  return fetchWithProxy("/chart/0/albums");
}

export async function getTopTracks(): Promise<{ data: DeezerTrack[] }> {
  return fetchWithProxy("/chart/0/tracks");
}

export const GENRE_IDS = {
  RAP: 116,
  ELECTRONIC: 106,
  RNB: 165,
  AFROBEAT: 530,
} as const; 