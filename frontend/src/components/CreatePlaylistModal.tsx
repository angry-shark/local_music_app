import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlaylistModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await api.post('/playlists', {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
         style={{ backgroundColor: 'var(--overlay)' }}>
      <div className="rounded-2xl w-full max-w-md p-6 border"
           style={{ 
             backgroundColor: 'var(--bg-card)',
             borderColor: 'var(--border-primary)'
           }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            创建歌单
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-tertiary)'
            }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              歌单名称 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入歌单名称"
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加歌单描述（可选）"
              rows={3}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 resize-none transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border transition-colors"
              style={{ 
                borderColor: 'var(--border-primary)',
                accentColor: 'var(--accent-primary)'
              }}
            />
            <label htmlFor="isPublic" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              公开歌单（其他用户可以看到）
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff'
              }}
            >
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
