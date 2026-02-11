import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import type { Playlist } from '../types';
import api from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import CreatePlaylistModal from '../components/CreatePlaylistModal';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const [publicRes, myRes] = await Promise.all([
        api.get('/playlists'),
        isAuthenticated ? api.get('/playlists/user/my') : Promise.resolve({ data: [] }),
      ]);
      setPlaylists(publicRes.data);
      setMyPlaylists(myRes.data);
    } catch (error) {
      console.error('获取歌单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchPlaylists();
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          歌单
        </h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff'
            }}
          >
            <PlusIcon className="w-5 h-5" />
            创建歌单
          </button>
        )}
      </div>

      {/* My Playlists */}
      {isAuthenticated && myPlaylists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
            我的歌单
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {myPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      {/* Public Playlists */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
          发现歌单
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>

        {playlists.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            暂无歌单
          </div>
        )}
      </section>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link to={`/playlists/${playlist.id}`} className="group">
      <div className="aspect-square rounded-xl overflow-hidden mb-3 transition-all duration-200 group-hover:shadow-lg"
           style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
               style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <MusicalNoteIcon className="w-16 h-16" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium"
             style={{ 
               backgroundColor: 'rgba(0, 0, 0, 0.6)',
               color: '#ffffff'
             }}>
          {playlist._count?.songs || 0} 首
        </div>
      </div>
      <h3 className="font-medium truncate group-hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-primary)' }}>
        {playlist.name}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
        {playlist.user?.username || '未知用户'}
      </p>
    </Link>
  );
}
