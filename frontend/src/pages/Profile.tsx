import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getRoleName } from '../utils/format';
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(formData);
      setEditing(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      window.location.href = '/login';
    }
  };

  // Role badge color
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)' };
      case 'ARTIST':
        return { backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-secondary)' };
      default:
        return { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)' };
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
        个人资料
      </h1>

      <div className="rounded-2xl border p-6 space-y-6 transition-colors"
           style={{ 
             backgroundColor: 'var(--bg-card)',
             borderColor: 'var(--border-primary)'
           }}>
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                 style={{ 
                   background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                   color: '#ffffff'
                 }}>
              {user.username[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {user.username}
              </h2>
              <span className="px-2 py-0.5 text-xs rounded-full font-medium"
                    style={getRoleBadgeStyle(user.role)}>
                {getRoleName(user.role)}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              ID: {user.id}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        {editing ? (
          <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                头像 URL
              </label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                <CheckIcon className="w-4 h-4" />
                {loading ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({ username: user.username, avatar: user.avatar || '' });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                <XMarkIcon className="w-4 h-4" />
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Info List */}
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>用户名</p>
                  <p style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>邮箱</p>
                  <p style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>角色</p>
                  <p style={{ color: 'var(--text-primary)' }}>{getRoleName(user.role)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                <PencilIcon className="w-4 h-4" />
                编辑资料
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--accent-danger)'
                }}
              >
                退出登录
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
