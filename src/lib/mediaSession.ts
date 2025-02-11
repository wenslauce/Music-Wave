interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
}

export function setupMediaSession(
  audioRef: React.RefObject<HTMLAudioElement>,
  currentTrack: any,
  handlers: MediaSessionHandlers
) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack?.title || '',
      artist: currentTrack?.artist?.name || '',
      album: currentTrack?.album?.title || '',
      artwork: [
        {
          src: currentTrack?.album?.cover_medium || '',
          sizes: '250x250',
          type: 'image/jpeg',
        },
        {
          src: currentTrack?.album?.cover_big || '',
          sizes: '500x500',
          type: 'image/jpeg',
        },
      ],
    });

    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNextTrack);
  }
} 