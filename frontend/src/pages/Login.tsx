import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MusicalNoteIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
         style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MusicalNoteIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            欢迎回来
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-tertiary)' }}>
            登录以继续享受音乐
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} 
              className="rounded-2xl p-6 space-y-4 border transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)'
              }}>
          {error && (
            <div className="p-3 rounded-xl text-sm border"
                 style={{ 
                   backgroundColor: 'rgba(239, 68, 68, 0.1)',
                   borderColor: 'rgba(239, 68, 68, 0.2)',
                   color: 'var(--accent-danger)'
                 }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              用户名或邮箱
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border transition-colors duration-200 focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              placeholder="输入用户名或邮箱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border transition-colors duration-200 focus:outline-none focus:ring-2 pr-12"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
                placeholder="输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff'
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            还没有账号？{' '}
            <Link to="/register" 
                  className="font-medium transition-colors hover:underline"
                  style={{ color: 'var(--accent-primary)' }}>
              立即注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
