import { useState, useEffect } from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  MusicalNoteIcon, 
  QueueListIcon, 
  UsersIcon, 
  ChartBarIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import AdminSongs from './admin/AdminSongs';
import AdminPlaylists from './admin/AdminPlaylists';
import AdminUsers from './admin/AdminUsers';
import ArtistSongs from './admin/ArtistSongs';

export default function AdminDashboard() {
  const location = useLocation();
  const { isAdmin, isArtist } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const adminMenuItems = [
    { path: '/admin/songs', label: '歌曲管理', icon: MusicalNoteIcon },
    { path: '/admin/playlists', label: '歌单管理', icon: QueueListIcon },
    { path: '/admin/users', label: '用户管理', icon: UsersIcon },
  ];

  const artistMenuItems = [
    { path: '/admin/my-songs', label: '我的歌曲', icon: MusicalNoteIcon },
  ];

  const menuItems = isAdmin() ? adminMenuItems : artistMenuItems;

  return (
    <div className="min-h-screen transition-colors duration-300"
         style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
        `}
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}>
          {/* Header */}
          <div className="p-6 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ 
                     background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))'
                   }}>
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>后台管理</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {isAdmin() ? '管理员' : '歌手'}控制台
                </p>
              </div>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} to={item.path} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Back to App - Fixed at bottom */}
          <div className="p-4 border-t flex-shrink-0"
               style={{ borderColor: 'var(--border-primary)' }}>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
            >
              <ChevronRightIcon className="w-5 h-5 rotate-180" />
              返回应用
            </Link>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: 'var(--overlay)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <ChartBarIcon className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
              </button>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                后台管理
              </h1>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {resolvedTheme === 'dark' ? (
                <SunIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <MoonIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
          </div>

          <Routes>
            <Route path="/" element={<Navigate to={isAdmin() ? "/admin/songs" : "/admin/my-songs"} replace />} />
            <Route path="/songs" element={isAdmin() ? <AdminSongs /> : <Navigate to="/admin/my-songs" />} />
            <Route path="/playlists" element={isAdmin() ? <AdminPlaylists /> : <Navigate to="/" />} />
            <Route path="/users" element={isAdmin() ? <AdminUsers /> : <Navigate to="/" />} />
            <Route path="/my-songs" element={isArtist() || isAdmin() ? <ArtistSongs /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
        color: isActive ? '#ffffff' : 'var(--text-secondary)',
        fontWeight: isActive ? 600 : 400,
        opacity: isActive ? 1 : 0.8,
      }}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </Link>
  );
}
