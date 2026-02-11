import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Song } from '../../types';
import api from '../../utils/api';
import SongFormModal from '../../components/SongFormModal';
import { formatTime } from '../../utils/format';

export default function ArtistSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await api.get('/songs/my/songs');
      setSongs(response.data);
    } catch (error) {
      console.error('获取歌曲失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (song: Song) => {
    if (!confirm(`确定要删除歌曲 "${song.title}" 吗？此操作不可恢复。`)) return;

    try {
      await api.delete(`/songs/${song.id}`);
      fetchSongs();
    } catch (error) {
      console.error('删除歌曲失败:', error);
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingSong(null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditingSong(null);
    fetchSongs();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            我的歌曲
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-tertiary)' }}>
            管理你上传的音乐作品
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:opacity-90"
          style={{ 
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff'
          }}
        >
          <PlusIcon className="w-5 h-5" />
          上传歌曲
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2"
               style={{ borderColor: 'var(--accent-primary)' }}></div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border"
             style={{ 
               backgroundColor: 'var(--bg-card)',
               borderColor: 'var(--border-primary)'
             }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>歌曲</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>时长</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>上传时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>操作</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {songs.map((song) => (
                <tr key={song.id} className="transition-colors hover:bg-opacity-50"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={song.coverUrl || 'https://via.placeholder.com/40'}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {song.title}
                        </p>
                        <a
                          href={song.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs hover:underline"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          ↗ 音频链接
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-tertiary)' }}>
                    {formatTime(song.duration)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      song.isPublic 
                        ? '' : ''
                    }`}
                    style={{ 
                      backgroundColor: song.isPublic ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: song.isPublic ? 'var(--accent-success)' : 'var(--accent-warning)'
                    }}>
                      {song.isPublic ? '公开' : '私有'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {new Date(song.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(song)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.color = 'var(--accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(song)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = 'var(--accent-danger)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {songs.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <p className="mb-4">还没有上传任何歌曲</p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                上传第一首歌曲
              </button>
            </div>
          )}
        </div>
      )}

      {/* Song Form Modal */}
      {showModal && (
        <SongFormModal
          song={editingSong}
          onClose={() => {
            setShowModal(false);
            setEditingSong(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
