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
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ListBulletIcon,
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
    playMode,
    togglePlay, 
    playNext, 
    playPrev,
    seek,
    setVolume,
    initAudio,
    togglePlayMode
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

  const playModeIcons = {
    sequence: { icon: ListBulletIcon, label: '顺序播放' },
    random: { icon: ArrowsRightLeftIcon, label: '随机播放' },
    single: { icon: ArrowPathIcon, label: '单曲循环' },
  };

  const PlayModeIcon = playModeIcons[playMode].icon;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Modern Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
              style={{ 
                backgroundColor: resolvedTheme === 'dark' ? 'rgba(9, 9, 11, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-primary)',
              }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Modern Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                 style={{ background: 'var(--gradient-primary)' }}>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <MusicalNoteIcon className="w-6 h-6 text-white relative z-10" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              MusicApp
            </span>
          </Link>

          {/* Modern Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl"
               style={{ 
                 backgroundColor: 'var(--bg-tertiary)',
                 borderRadius: 'var(--radius-xl)',
               }}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                  isActive(item.path)
                    ? 'shadow-md'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isActive(item.path) ? 'var(--bg-secondary)' : 'transparent',
                  color: isActive(item.path) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  boxShadow: isActive(item.path) ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Modern User Actions */}
          <div className="flex items-center gap-3">
            {/* Modern Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
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
                    className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium`}
                    style={{
                      backgroundColor: location.pathname.startsWith('/admin') ? 'var(--gradient-primary-soft)' : 'var(--bg-tertiary)',
                      color: location.pathname.startsWith('/admin') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span>后台</span>
                  </Link>
                )}
                
                {/* Modern User Menu */}
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-2 pr-4 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-xl object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                         style={{ background: 'var(--gradient-primary)' }}>
                      {user.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.username}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 btn-gradient"
              >
                登录
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
            >
              {mobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Modern Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4"
               style={{ 
                 backgroundColor: resolvedTheme === 'dark' ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                 backdropFilter: 'blur(20px)',
                 borderColor: 'var(--border-primary)',
               }}>
            <nav className="space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive(item.path)
                      ? ''
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: isActive(item.path) ? 'var(--gradient-primary-soft)' : 'var(--bg-tertiary)',
                    color: isActive(item.path) ? 'var(--accent-primary)' : 'var(--text-secondary)',
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium`}
                  style={{
                    backgroundColor: location.pathname.startsWith('/admin') ? 'var(--gradient-primary-soft)' : 'var(--bg-tertiary)',
                    color: location.pathname.startsWith('/admin') ? 'var(--accent-primary)' : 'var(--text-secondary)',
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

      {/* Main Content with padding for fixed header and player */}
      <main className="flex-1 pt-20 pb-36">
        {children}
      </main>

      {/* Modern Glass Player Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
             style={{ 
               backgroundColor: resolvedTheme === 'dark' ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               borderTop: '1px solid var(--border-primary)',
             }}>
          {/* Modern Progress Bar */}
          <div className="w-full h-1 cursor-pointer group relative"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const percent = (e.clientX - rect.left) / rect.width;
                 seek(percent * duration);
               }}>
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            <div 
              className="absolute inset-y-0 left-0 transition-all duration-100"
              style={{ 
                width: `${duration ? (progress / duration) * 100 : 0}%`,
                background: 'var(--gradient-primary)',
              }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `calc(${duration ? (progress / duration) * 100 : 0}% - 6px)` }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            {/* Modern Song Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative group">
                <img
                  src={currentSong.coverUrl || 'https://via.placeholder.com/48'}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded-xl object-cover shadow-lg"
                />
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                  {currentSong.title}
                </h4>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {currentSong.artistName}
                </p>
              </div>
            </div>

            {/* Modern Center Controls */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                {/* Play Mode Button */}
                <button 
                  onClick={togglePlayMode}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ 
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                  title={playModeIcons[playMode].label}
                >
                  <PlayModeIcon className="w-4 h-4" />
                </button>
                
                {/* Previous Button */}
                <button 
                  onClick={playPrev}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <BackwardIcon className="w-5 h-5" />
                </button>
                
                {/* Play/Pause Button */}
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: 'var(--gradient-primary)',
                    color: '#ffffff',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {isPlaying ? (
                    <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6 ml-0.5" />
                  )}
                </button>
                
                {/* Next Button */}
                <button 
                  onClick={playNext}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <ForwardIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modern Volume & Time Controls */}
            <div className="hidden sm:flex items-center gap-4 flex-1 justify-end">
              <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {formatTime(progress)} / {formatTime(duration)}
              </span>
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <SpeakerWaveIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 rounded-full appearance-none cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--border-secondary)',
                    accentColor: 'var(--accent-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
