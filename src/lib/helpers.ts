import { Track } from '@/types/music';

export function convertToTrack(track: any): Track {
  if (!track || !track.id || !track.title) {
    throw new Error('Invalid track data');
  }

  return {
    id: String(track.id),
    deezerData: {
      id: String(track.id),
      title: track.title,
      artist: {
        id: String(track.artist?.id || ''),
        name: track.artist?.name || 'Unknown Artist',
        picture_small: track.artist?.picture_small || '/default-artist.jpg',
        picture_medium: track.artist?.picture_medium || track.artist?.picture_small || '/default-artist.jpg',
        picture_big: track.artist?.picture_big || track.artist?.picture_medium || '/default-artist.jpg',
      },
      album: {
        id: String(track.album?.id || ''),
        title: track.album?.title || 'Unknown Album',
        cover_small: track.album?.cover_small || '/default-album-art.jpg',
        cover_medium: track.album?.cover_medium || '/default-album-art.jpg',
        cover_big: track.album?.cover_big || track.album?.cover_medium || '/default-album-art.jpg',
      },
      duration: track.duration || 0,
      preview: track.preview || '',
    },
    playbackData: track.playbackData || null
  };
} 