import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlayIcon, HeartIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import type { Song } from '../types';
import api from '../utils/api';
import { usePlayerStore } from '../stores/playerStore';
import { useAuthStore } from '../stores/authStore';
import { formatTime } from '../utils/format';

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const { setPlaylist, currentSong, isPlaying } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchSongs();
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [searchParams, isAuthenticated]);

  const fetchSongs = async () => {
    try {
      const search = searchParams.get('search') || '';
      const artistId = searchParams.get('artistId');
      
      let url = '/songs?';
      if (search) url += `search=${search}&`;
      if (artistId) url += `artistId=${artistId}&`;
      
      const response = await api.get(url);
      setSongs(response.data);
    } catch (error) {
      console.error('获取歌曲失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/users/me/favorites');
      setFavorites(response.data.map((song: Song) => song.id));
    } catch (error) {
      console.error('获取收藏失败:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    window.history.replaceState(null, '', `?${params.toString()}`);
    fetchSongs();
  };

  const playSong = (song: Song) => {
    const index = songs.findIndex(s => s.id === song.id);
    setPlaylist(songs, index);
  };

  const toggleFavorite = async (songId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }

    try {
      if (favorites.includes(songId)) {
        await api.delete(`/users/me/favorites/${songId}`);
        setFavorites(favorites.filter(id => id !== songId));
      } else {
        await api.post('/users/me/favorites', { songId });
        setFavorites([...favorites, songId]);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2"
             style={{ borderColor: 'var(--accent-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          歌曲列表
        </h1>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="搜索歌曲..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 w-full md:w-64 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff'
            }}
          >
            搜索
          </button>
        </form>
      </div>

      {/* Songs Table */}
      <div className="rounded-2xl overflow-hidden border"
           style={{ 
             backgroundColor: 'var(--bg-card)',
             borderColor: 'var(--border-primary)'
           }}>
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium w-16"
                  style={{ color: 'var(--text-tertiary)' }}>#</th>
              <th className="px-4 py-3 text-left text-sm font-medium"
                  style={{ color: 'var(--text-tertiary)' }}>歌曲</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell"
                  style={{ color: 'var(--text-tertiary)' }}>歌手</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell"
                  style={{ color: 'var(--text-tertiary)' }}>
                <ClockIcon className="w-4 h-4" />
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium w-20"
                  style={{ color: 'var(--text-tertiary)' }}>操作</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              const isFavorite = favorites.includes(song.id);

              return (
                <tr
                  key={song.id}
                  className="group cursor-pointer transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => playSong(song)}
                >
                  <td className="px-4 py-3">
                    {isCurrentSong && isPlaying ? (
                      <div className="flex gap-0.5 items-end h-4">
                        <div className="w-1 animate-pulse h-2"
                             style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                        <div className="w-1 animate-pulse h-4 delay-75"
                             style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                        <div className="w-1 animate-pulse h-3 delay-150"
                             style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                      </div>
                    ) : (
                      <span className="group-hover:hidden" style={{ color: 'var(--text-muted)' }}>
                        {index + 1}
                      </span>
                    )}
                    <PlayIcon className="w-5 h-5 hidden group-hover:block"
                             style={{ color: 'var(--text-primary)' }} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={song.coverUrl || 'https://via.placeholder.com/40'}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className={`font-medium ${isCurrentSong ? 'font-semibold' : ''}`}
                            style={{ color: isCurrentSong ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {song.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'var(--text-tertiary)' }}>
                    {song.artistName}
                  </td>
                  <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                    {formatTime(song.duration)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => toggleFavorite(song.id, e)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: isFavorite ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                      }}
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="w-5 h-5" style={{ color: 'var(--accent-danger)' }} />
                      ) : (
                        <HeartIcon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {songs.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            暂无歌曲
          </div>
        )}
      </div>
    </div>
  );
}
