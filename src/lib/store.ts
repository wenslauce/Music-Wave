import { create } from 'zustand';
import { DeezerTrack } from '@/types/deezer';

type RepeatMode = 'off' | 'all' | 'one';

interface MusicStore {
  // State
  currentTrack: DeezerTrack | null;
  playlist: DeezerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  shuffledIndices: number[];
  
  // Actions
  setCurrentTrack: (track: DeezerTrack | null) => void;
  setPlaylist: (playlist: DeezerTrack[]) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  togglePlayPause: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  playTrack: (track: DeezerTrack, playlist?: DeezerTrack[]) => void;
}

function isValidTrack(track: unknown): track is DeezerTrack {
  try {
    if (!track || typeof track !== 'object') return false;
    const t = track as any;
    
    return !!(
      t.id &&
      t.title &&
      t.artist?.name &&
      t.album?.title
    );
  } catch (error) {
    console.warn('Track validation error:', error);
    return false;
  }
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  // Initial state
  currentTrack: null,
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 1,
  progress: 0,
  repeatMode: 'off' as RepeatMode,
  isShuffled: false,
  shuffledIndices: [],

  // Actions
  setCurrentTrack: (track) => {
    try {
      if (track === null) {
        set({ currentTrack: null, isPlaying: false });
        return;
      }

      if (!isValidTrack(track)) {
        console.warn('Invalid track data:', track);
        return;
      }

      set({ currentTrack: track, isPlaying: false });
    } catch (error) {
      console.error('Error setting current track:', error);
    }
  },
  
  setPlaylist: (playlist) => {
    try {
      const validTracks = playlist.filter(track => {
        const isValid = isValidTrack(track);
        if (!isValid) {
          console.warn('Filtering out invalid track:', track);
        }
        return isValid;
      });

      if (validTracks.length === 0) {
        console.warn('No valid tracks found in playlist');
        set({ playlist: [], currentIndex: -1, shuffledIndices: [] });
        return;
      }

      const { isShuffled } = get();
      const indices = Array.from({ length: validTracks.length }, (_, i) => i);
      const shuffledIndices = isShuffled ? shuffleArray(indices) : indices;

      set({ 
        playlist: validTracks, 
        shuffledIndices,
        currentIndex: validTracks.length > 0 ? 0 : -1
      });
    } catch (error) {
      console.error('Error setting playlist:', error);
    }
  },
  
  setCurrentIndex: (index) => {
    const { playlist } = get();
    if (index >= 0 && index < playlist.length) {
      set({ 
        currentIndex: index,
        currentTrack: isValidTrack(playlist[index]) ? playlist[index] : null,
        isPlaying: false
      });
    }
  },
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setVolume: (volume) => set({ volume }),
  
  setProgress: (progress) => set({ progress }),
  
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  toggleRepeat: () => set((state) => ({ 
    repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off' 
  })),
  
  toggleShuffle: () => {
    const { playlist } = get();
    const indices = Array.from({ length: playlist.length }, (_, i) => i);
    set((state) => ({ 
      isShuffled: !state.isShuffled,
      shuffledIndices: !state.isShuffled ? shuffleArray(indices) : indices
    }));
  },
  
  nextTrack: () => {
    const { currentIndex, playlist, repeatMode, isShuffled, shuffledIndices } = get();
    if (playlist.length === 0) return;

    const indices = isShuffled ? shuffledIndices : Array.from({ length: playlist.length }, (_, i) => i);
    const currentPosition = indices.indexOf(currentIndex);
    let nextIndex = currentPosition + 1;

    if (nextIndex >= indices.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    const nextTrack = isValidTrack(playlist[indices[nextIndex]]) ? playlist[indices[nextIndex]] : null;
    set({ 
      currentIndex: indices[nextIndex],
      currentTrack: nextTrack,
      isPlaying: false
    });
  },
  
  previousTrack: () => {
    const { currentIndex, playlist, repeatMode, isShuffled, shuffledIndices } = get();
    if (playlist.length === 0) return;

    const indices = isShuffled ? shuffledIndices : Array.from({ length: playlist.length }, (_, i) => i);
    const currentPosition = indices.indexOf(currentIndex);
    let prevIndex = currentPosition - 1;

    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = indices.length - 1;
      } else {
        return;
      }
    }

    const prevTrack = isValidTrack(playlist[indices[prevIndex]]) ? playlist[indices[prevIndex]] : null;
    set({ 
      currentIndex: indices[prevIndex],
      currentTrack: prevTrack,
      isPlaying: false
    });
  },
  
  playTrack: (track, newPlaylist) => {
    try {
      if (newPlaylist) {
        const validTracks = newPlaylist.filter(isValidTrack);
        if (validTracks.length === 0) {
          console.warn('No valid tracks in playlist');
          return;
        }

        const { isShuffled } = get();
        const indices = Array.from({ length: validTracks.length }, (_, i) => i);
        const shuffledIndices = isShuffled ? shuffleArray(indices) : indices;
        const newIndex = validTracks.findIndex(t => t.id === track.id);

        set({ 
          playlist: validTracks,
          currentTrack: track,
          currentIndex: newIndex >= 0 ? newIndex : 0,
          shuffledIndices,
          isPlaying: false
        });
      } else {
        if (!isValidTrack(track)) {
          console.warn('Invalid track data');
          return;
        }
        set({ currentTrack: track, isPlaying: false });
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }
}));
