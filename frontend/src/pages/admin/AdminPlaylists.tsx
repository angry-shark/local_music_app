import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { Playlist } from '../../types';
import api from '../../utils/api';

export default function AdminPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await api.get('/playlists/admin/all');
      setPlaylists(response.data);
    } catch (error) {
      console.error('获取歌单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (playlist: Playlist) => {
    if (!confirm(`确定要删除歌单 "${playlist.name}" 吗？此操作不可恢复。`)) return;

    try {
      await api.delete(`/playlists/${playlist.id}`);
      fetchPlaylists();
    } catch (error) {
      console.error('删除歌单失败:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          歌单管理
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-tertiary)' }}>
          管理所有用户的歌单
        </p>
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
                    style={{ color: 'var(--text-tertiary)' }}>歌单</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>创建者</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>歌曲数</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>状态</th>
                <th className="px-4 py-3 text-right text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>操作</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {playlists.map((playlist) => (
                <tr key={playlist.id} className="transition-colors hover:bg-opacity-50"
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
                        src={playlist.coverUrl || 'https://via.placeholder.com/40'}
                        alt={playlist.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <Link
                        to={`/playlists/${playlist.id}`}
                        className="font-medium hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {playlist.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-tertiary)' }}>
                    {playlist.user?.username || '未知用户'}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-tertiary)' }}>
                    {playlist._count?.songs || 0} 首
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full font-medium"
                          style={{ 
                            backgroundColor: playlist.isPublic ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: playlist.isPublic ? 'var(--accent-success)' : 'var(--accent-warning)'
                          }}>
                      {playlist.isPublic ? '公开' : '私有'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(playlist)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {playlists.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              暂无歌单
            </div>
          )}
        </div>
      )}
    </div>
  );
}
