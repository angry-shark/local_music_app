import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import { useThemeStore } from '../stores/themeStore';
import { 
  HomeIcon, 
  MusicalNoteIcon, 
  QueueListIcon, 
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { formatTime } from '../utils/format';
import { useState, useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isArtistOrAdmin } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { 
    currentSong, 
    isPlaying, 
    progress, 
    duration, 
    volume,
    togglePlay, 
    playNext, 
    playPrev,
    seek,
    setVolume,
    initAudio
  } = usePlayerStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initAudio();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '首页', icon: HomeIcon },
    { path: '/songs', label: '歌曲', icon: MusicalNoteIcon },
    { path: '/external-search', label: '外部搜索', icon: MagnifyingGlassIcon },
    { path: '/playlists', label: '歌单', icon: QueueListIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
              style={{ 
                backgroundColor: resolvedTheme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: 'var(--border-primary)'
              }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MusicalNoteIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              MusicApp
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'font-semibold'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive(item.path) ? 'var(--accent-primary)' : 'transparent',
                  color: isActive(item.path) ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
              title={resolvedTheme === 'dark' ? '切换到亮色' : '切换到暗色'}
            >
              {resolvedTheme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Admin Link */}
                {isArtistOrAdmin() && (
                  <Link
                    to="/admin"
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname.startsWith('/admin')
                        ? 'font-semibold'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: location.pathname.startsWith('/admin') ? 'var(--accent-secondary)' : 'transparent',
                      color: location.pathname.startsWith('/admin') ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>后台</span>
                  </Link>
                )}
                
                {/* User Menu */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                      {user.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">{user.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                登录
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t transition-colors duration-300"
               style={{ 
                 backgroundColor: 'var(--bg-elevated)',
                 borderColor: 'var(--border-primary)'
               }}>
            <nav className="px-4 py-2 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'font-semibold'
                      : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: isActive(item.path) ? 'var(--accent-primary)' : 'transparent',
                    color: isActive(item.path) ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {isArtistOrAdmin() && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'font-semibold'
                      : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: location.pathname.startsWith('/admin') ? 'var(--accent-secondary)' : 'transparent',
                    color: location.pathname.startsWith('/admin') ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>后台管理</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-32">
        {children}
      </main>

      {/* Player Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t z-50 transition-colors duration-300"
             style={{ 
               backgroundColor: resolvedTheme === 'dark' ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
               borderColor: 'var(--border-primary)'
             }}>
          {/* Progress Bar */}
          <div className="w-full h-1 cursor-pointer group"
               style={{ backgroundColor: 'var(--bg-tertiary)' }}
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const percent = (e.clientX - rect.left) / rect.width;
                 seek(percent * duration);
               }}>
            <div 
              className="h-full transition-all duration-100"
              style={{ 
                width: `${(progress / duration) * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Song Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentSong.coverUrl || 'https://via.placeholder.com/48'}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentSong.title}
                </h4>
                <p className="text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {currentSong.artistName}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={playPrev}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <BackwardIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  color: '#ffffff'
                }}
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6 ml-0.5" />
                )}
              </button>
              <button 
                onClick={playNext}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ForwardIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Volume & Time */}
            <div className="hidden sm:flex items-center gap-4 flex-1 justify-end">
              <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {formatTime(progress)} / {formatTime(duration)}
              </span>
              <div className="flex items-center gap-2">
                <SpeakerWaveIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-blue-500"
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
