// 用户角色
export type UserRole = 'USER' | 'ARTIST' | 'ADMIN';

// 用户信息
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

// 歌曲
export interface Song {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  audioUrl: string;
  coverUrl?: string;
  duration: number;
  lyrics?: string;
  isPublic: boolean;
  createdAt: string;
  artist?: User;
}

// 歌单
export interface Playlist {
  id: number;
  name: string;
  description?: string;
  coverUrl?: string;
  userId: number;
  isPublic: boolean;
  createdAt: string;
  user?: User;
  songs?: Song[];
  _count?: { songs: number };
}

// 播放器状态
export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  duration: number;
  playlist: Song[];
  currentIndex: number;
  playMode: 'sequence' | 'random' | 'single';
}

// API 响应
export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
}
