import { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { User } from '../../types';
import api from '../../utils/api';

import { useAuthStore } from '../../stores/authStore';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('修改角色失败:', error);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('不能删除自己');
      return;
    }

    if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复。`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  };



  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          用户管理
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-tertiary)' }}>
          管理所有用户账号和权限
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
                    style={{ color: 'var(--text-tertiary)' }}>用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>邮箱</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>角色</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>统计</th>
                <th className="px-4 py-3 text-right text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>操作</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-opacity-50"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                             style={{ 
                               background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                               color: '#ffffff'
                             }}>
                          {user.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-tertiary)' }}>
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentUser?.id}
                      className="px-3 py-1 rounded-lg text-sm border focus:outline-none focus:ring-2 disabled:opacity-50"
                      style={{ 
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="USER">使用者</option>
                      <option value="ARTIST">歌手</option>
                      <option value="ADMIN">管理员</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <div className="space-y-1">
                      <p>{(user as any)._count?.songs || 0} 首歌曲</p>
                      <p>{(user as any)._count?.playlists || 0} 个歌单</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user)}
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              暂无用户
            </div>
          )}
        </div>
      )}
    </div>
  );
}
