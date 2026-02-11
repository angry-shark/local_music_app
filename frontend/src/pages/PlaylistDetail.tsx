import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PlayIcon, 
  ClockIcon, 
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import type { Playlist, Song } from '../types';
import api from '../utils/api';
import { usePlayerStore } from '../stores/playerStore';
import { useAuthStore } from '../stores/authStore';
import { formatTime } from '../utils/format';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { setPlaylist: setPlayerPlaylist, currentSong, isPlaying } = usePlayerStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const response = await api.get(`/playlists/${id}`);
      setPlaylist(response.data);
    } catch (error) {
      console.error('获取歌单失败:', error);
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const playAll = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      setPlayerPlaylist(playlist.songs, 0);
    }
  };

  const playSong = (_song: Song, index: number) => {
    if (playlist?.songs) {
      setPlayerPlaylist(playlist.songs, index);
    }
  };

  const removeSong = async (songId: number) => {
    if (!confirm('确定要从歌单中移除这首歌曲吗？')) return;
    
    try {
      await api.delete(`/playlists/${id}/songs/${songId}`);
      fetchPlaylist();
    } catch (error) {
      console.error('移除歌曲失败:', error);
    }
  };

  const deletePlaylist = async () => {
    if (!confirm('确定要删除这个歌单吗？此操作不可恢复。')) return;
    
    try {
      await api.delete(`/playlists/${id}`);
      navigate('/playlists');
    } catch (error) {
      console.error('删除歌单失败:', error);
    }
  };

  const canEdit = user && playlist && (user.role === 'ADMIN' || playlist.userId === user.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2"
             style={{ borderColor: 'var(--accent-primary)' }}></div>
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 transition-colors hover:opacity-70"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        返回
      </button>

      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Cover */}
        <div className="w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 mx-auto md:mx-0"
             style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
                 style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <span className="text-6xl">🎵</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm uppercase tracking-wider mb-2 font-medium"
             style={{ color: 'var(--accent-primary)' }}>
            歌单
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}>
            {playlist.name}
          </h1>
          <p className="mb-4" style={{ color: 'var(--text-tertiary)' }}>
            {playlist.description || '暂无描述'}
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-4 text-sm"
               style={{ color: 'var(--text-muted)' }}>
            <span>创建者: <span style={{ color: 'var(--text-secondary)' }}>{playlist.user?.username}</span></span>
            <span>•</span>
            <span>{playlist.songs?.length || 0} 首歌曲</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
            <button
              onClick={playAll}
              disabled={!playlist.songs?.length}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff'
              }}
            >
              <PlayIcon className="w-5 h-5" />
              播放全部
            </button>
            
            {canEdit && (
              <>
                <Link
                  to={`/playlists/${id}/add-songs`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <PlusIcon className="w-5 h-5" />
                  添加歌曲
                </Link>
                <button
                  onClick={deletePlaylist}
                  className="p-3 rounded-xl transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--accent-danger)'
                  }}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Songs List */}
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
              {canEdit && <th className="px-4 py-3 text-center text-sm font-medium w-20"
                             style={{ color: 'var(--text-tertiary)' }}>操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            {playlist.songs?.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;

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
                  onClick={() => playSong(song, index)}
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
                  {canEdit && (
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSong(song.id);
                        }}
                        className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        style={{ 
                          color: 'var(--text-muted)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = 'var(--accent-danger)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!playlist.songs || playlist.songs.length === 0) && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <p className="mb-4">歌单暂无歌曲</p>
            {canEdit && (
              <Link
                to={`/playlists/${id}/add-songs`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                <PlusIcon className="w-4 h-4" />
                添加歌曲
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
