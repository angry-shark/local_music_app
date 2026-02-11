import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import type { Song, Playlist } from '../types';
import api from '../utils/api';

export default function AddSongsToPlaylist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [existingSongIds, setExistingSongIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingIds, setAddingIds] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [playlistRes, songsRes] = await Promise.all([
        api.get(`/playlists/${id}`),
        api.get('/songs'),
      ]);
      setPlaylist(playlistRes.data);
      setExistingSongIds(playlistRes.data.songs?.map((s: Song) => s.id) || []);
      setSongs(songsRes.data);
    } catch (error) {
      console.error('获取数据失败:', error);
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const addSong = async (songId: number) => {
    setAddingIds(prev => [...prev, songId]);
    try {
      await api.post(`/playlists/${id}/songs`, { songId });
      setExistingSongIds(prev => [...prev, songId]);
    } catch (error: any) {
      alert(error.response?.data?.message || '添加失败');
    } finally {
      setAddingIds(prev => prev.filter(id => id !== songId));
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/playlists/${id}`)}
          className="p-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)'
          }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            添加歌曲到歌单
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>{playlist?.name}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="搜索歌曲或歌手..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSongs.map((song) => {
          const isAdded = existingSongIds.includes(song.id);
          const isAdding = addingIds.includes(song.id);

          return (
            <div
              key={song.id}
              className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <img
                src={song.coverUrl || 'https://via.placeholder.com/64'}
                alt={song.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {song.title}
                </h3>
                <p className="text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {song.artistName}
                </p>
              </div>
              <button
                onClick={() => addSong(song.id)}
                disabled={isAdded || isAdding}
                className="p-2 rounded-lg transition-all disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: isAdded ? 'rgba(16, 185, 129, 0.2)' : 'var(--accent-primary)',
                  color: isAdded ? 'var(--accent-success)' : '#ffffff',
                  opacity: isAdded ? 1 : undefined
                }}
              >
                {isAdded ? (
                  <CheckIcon className="w-5 h-5" />
                ) : isAdding ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PlusIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <MusicalNoteIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>没有找到匹配的歌曲</p>
        </div>
      )}
    </div>
  );
}
