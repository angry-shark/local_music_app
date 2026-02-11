import { create } from 'zustand';
import type { Song, PlayerState } from '../types';

interface PlayerStore extends PlayerState {
  audio: HTMLAudioElement | null;
  
  // 播放控制
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  
  // 歌曲切换
  setCurrentSong: (song: Song) => void;
  playNext: () => void;
  playPrev: () => void;
  
  // 播放列表
  setPlaylist: (songs: Song[], startIndex?: number) => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (index: number) => void;
  clearPlaylist: () => void;
  
  // 进度和音量
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  
  // 播放模式
  setPlayMode: (mode: PlayerState['playMode']) => void;
  togglePlayMode: () => void;
  
  // 初始化音频
  initAudio: () => void;
  
  // 更新进度（由定时器调用）
  updateProgress: () => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  duration: 0,
  playlist: [],
  currentIndex: -1,
  playMode: 'sequence',
  audio: null,

  initAudio: () => {
    if (!get().audio) {
      const audio = new Audio();
      audio.volume = get().volume;
      
      audio.addEventListener('timeupdate', () => {
        set({ 
          progress: audio.currentTime,
          duration: audio.duration || 0
        });
      });
      
      audio.addEventListener('ended', () => {
        get().playNext();
      });
      
      audio.addEventListener('loadedmetadata', () => {
        set({ duration: audio.duration });
      });
      
      set({ audio });
    }
  },

  play: () => {
    const { audio, currentSong } = get();
    if (audio && currentSong) {
      audio.play().then(() => {
        set({ isPlaying: true });
      }).catch(console.error);
    }
  },

  pause: () => {
    const { audio } = get();
    if (audio) {
      audio.pause();
      set({ isPlaying: false });
    }
  },

  togglePlay: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  setCurrentSong: (song: Song) => {
    const { audio, play } = get();
    if (audio) {
      audio.src = song.audioUrl;
      audio.load();
      set({ currentSong: song, isPlaying: false, progress: 0 });
      play();
    }
  },

  playNext: () => {
    const { playlist, currentIndex, playMode, setCurrentSong } = get();
    if (playlist.length === 0) return;

    let nextIndex: number;
    
    if (playMode === 'random') {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (playMode === 'single') {
      nextIndex = currentIndex;
      const { audio } = get();
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
      return;
    } else {
      // sequence
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        nextIndex = 0; // 循环播放
      }
    }

    set({ currentIndex: nextIndex });
    setCurrentSong(playlist[nextIndex]);
  },

  playPrev: () => {
    const { playlist, currentIndex, playMode, setCurrentSong } = get();
    if (playlist.length === 0) return;

    let prevIndex: number;
    
    if (playMode === 'random') {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = playlist.length - 1;
      }
    }

    set({ currentIndex: prevIndex });
    setCurrentSong(playlist[prevIndex]);
  },

  setPlaylist: (songs: Song[], startIndex = 0) => {
    set({ playlist: songs, currentIndex: startIndex });
    if (songs[startIndex]) {
      get().setCurrentSong(songs[startIndex]);
    }
  },

  addToPlaylist: (song: Song) => {
    const { playlist } = get();
    set({ playlist: [...playlist, song] });
  },

  removeFromPlaylist: (index: number) => {
    const { playlist, currentIndex } = get();
    const newPlaylist = playlist.filter((_, i) => i !== index);
    let newIndex = currentIndex;
    
    if (index < currentIndex) {
      newIndex = currentIndex - 1;
    } else if (index === currentIndex) {
      newIndex = -1;
    }
    
    set({ playlist: newPlaylist, currentIndex: newIndex });
  },

  clearPlaylist: () => {
    const { audio } = get();
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    set({ 
      playlist: [], 
      currentIndex: -1, 
      currentSong: null, 
      isPlaying: false, 
      progress: 0,
      duration: 0
    });
  },

  setProgress: (progress: number) => set({ progress }),
  setDuration: (duration: number) => set({ duration }),
  
  setVolume: (volume: number) => {
    const { audio } = get();
    if (audio) {
      audio.volume = volume;
    }
    set({ volume });
  },

  seek: (time: number) => {
    const { audio } = get();
    if (audio) {
      audio.currentTime = time;
      set({ progress: time });
    }
  },

  setPlayMode: (mode) => set({ playMode: mode }),
  
  togglePlayMode: () => {
    const { playMode } = get();
    const modes: PlayerState['playMode'][] = ['sequence', 'random', 'single'];
    const currentIndex = modes.indexOf(playMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    set({ playMode: nextMode });
  },

  updateProgress: () => {
    const { audio } = get();
    if (audio) {
      set({ 
        progress: audio.currentTime,
        duration: audio.duration || 0
      });
    }
  },
}));
