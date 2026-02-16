import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MusicalNoteIcon, EyeIcon, EyeSlashIcon, SparklesIcon, UserIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password, formData.role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'USER', label: '音乐爱好者', icon: UserIcon, desc: '听歌、创建歌单' },
    { value: 'ARTIST', label: '音乐人', icon: MicrophoneIcon, desc: '上传作品、管理歌曲' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
             style={{ background: 'var(--gradient-primary)' }} />
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
             style={{ background: 'var(--gradient-primary)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Modern Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 relative group"
               style={{ background: 'var(--gradient-primary)' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                 style={{ background: 'var(--gradient-primary)', filter: 'blur(20px)' }} />
            <MusicalNoteIcon className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            创建账号
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            开启您的音乐之旅
          </p>
        </div>

        {/* Modern Glass Form */}
        <form onSubmit={handleSubmit} 
              className="p-8 space-y-5 relative"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 'var(--radius-2xl)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-xl)',
              }}>
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-6 right-6 h-px"
               style={{ background: 'var(--gradient-primary)' }} />

          {error && (
            <div className="p-4 rounded-xl text-sm flex items-center gap-2"
                 style={{ 
                   backgroundColor: 'rgba(239, 68, 68, 0.1)',
                   border: '1px solid rgba(239, 68, 68, 0.2)',
                   color: 'var(--accent-danger)',
                   borderRadius: 'var(--radius-lg)',
                 }}>
              <SparklesIcon className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>
              用户名
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-5 py-4 border transition-all duration-300 focus:outline-none"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-xl)',
              }}
              placeholder="输入用户名"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>
              邮箱
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-5 py-4 border transition-all duration-300 focus:outline-none"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-xl)',
              }}
              placeholder="输入邮箱地址"
              required
            />
          </div>

          {/* Modern Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>
              选择身份
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value as UserRole })}
                    className="p-4 border transition-all duration-300 flex flex-col items-center gap-2 text-center"
                    style={{
                      backgroundColor: isSelected ? 'var(--gradient-primary-soft)' : 'var(--bg-input)',
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-primary)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {role.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {role.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-5 py-4 border transition-all duration-300 focus:outline-none pr-14"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-xl)',
                }}
                placeholder="至少6个字符"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200 hover:scale-110"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>
              确认密码
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-5 py-4 border transition-all duration-300 focus:outline-none"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-xl)',
              }}
              placeholder="再次输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            style={{ 
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span className="relative z-10">{loading ? '创建中...' : '创建账号'}</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white" />
          </button>

          <div className="pt-4 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              已有账号？{' '}
              <Link to="/login" 
                    className="font-semibold transition-all duration-200 hover:opacity-80"
                    style={{ color: 'var(--accent-primary)' }}>
                立即登录
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
          注册即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
