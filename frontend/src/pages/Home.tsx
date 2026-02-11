import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MusicalNoteIcon, PlayIcon, ClockIcon } from '@heroicons/react/24/solid';
import type { Song, Playlist } from '../types';
import api from '../utils/api';
import { usePlayerStore } from '../stores/playerStore';
import { formatTime } from '../utils/format';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPlaylist } = usePlayerStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [songsRes, playlistsRes] = await Promise.all([
        api.get('/songs'),
        api.get('/playlists'),
      ]);
      setSongs(songsRes.data.slice(0, 6));
      setPlaylists(playlistsRes.data.slice(0, 4));
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = (song: Song, allSongs: Song[]) => {
    const index = allSongs.findIndex(s => s.id === song.id);
    setPlaylist(allSongs, index);
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12"
               style={{ 
                 background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
               }}>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            发现你喜欢的音乐
          </h1>
          <p className="text-lg mb-6 max-w-xl text-white/80">
            探索海量音乐，创建专属歌单，享受沉浸式音乐体验
          </p>
          <Link
            to="/songs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--accent-primary)'
            }}
          >
            <PlayIcon className="w-5 h-5" />
            开始探索
          </Link>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <MusicalNoteIcon className="w-full h-full text-white" />
        </div>
      </section>

      {/* Featured Songs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            热门歌曲
          </h2>
          <Link to="/songs" 
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--accent-primary)' }}>
            查看全部 →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <div
              key={song.id}
              className="group rounded-xl p-4 border cursor-pointer transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)'
              }}
              onClick={() => playSong(song, songs)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={song.coverUrl || 'https://via.placeholder.com/64'}
                    alt={song.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <PlayIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-primary)' }}>
                    {song.title}
                  </h3>
                  <p className="text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {song.artistName}
                  </p>
                  <div className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    <ClockIcon className="w-3 h-3" />
                    {formatTime(song.duration)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Playlists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            精选歌单
          </h2>
          <Link to="/playlists" 
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--accent-primary)' }}>
            查看全部 →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              to={`/playlists/${playlist.id}`}
              className="group"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 transition-shadow duration-200 group-hover:shadow-lg"
                   style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <img
                  src={playlist.coverUrl || 'https://via.placeholder.com/300'}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold truncate group-hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-primary)' }}>
                {playlist.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {playlist._count?.songs || 0} 首歌曲
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
