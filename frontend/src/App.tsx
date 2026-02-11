import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Songs from './pages/Songs';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import AddSongsToPlaylist from './pages/AddSongsToPlaylist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
function ProtectedRoute({ children, requireArtistOrAdmin = false }: { 
  children: React.ReactNode; 
  requireArtistOrAdmin?: boolean;
}) {
  const { isAuthenticated, isArtistOrAdmin } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireArtistOrAdmin && !isArtistOrAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirect if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme
    initTheme();
    
    // Check token and fetch user info on app load
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      fetchUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Home /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/songs" element={
          <ProtectedRoute>
            <Layout><Songs /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/playlists" element={
          <ProtectedRoute>
            <Layout><Playlists /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/playlists/:id" element={
          <ProtectedRoute>
            <Layout><PlaylistDetail /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/playlists/:id/add-songs" element={
          <ProtectedRoute>
            <Layout><AddSongsToPlaylist /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />

        {/* Admin Routes (Artist or Admin only) */}
        <Route path="/admin/*" element={
          <ProtectedRoute requireArtistOrAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
