import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Song } from '../types';
import api from '../utils/api';

interface Props {
  song: Song | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SongFormModal({ song, onClose, onSuccess }: Props) {
  const isEditing = !!song;
  const [formData, setFormData] = useState({
    title: '',
    audioUrl: '',
    coverUrl: '',
    duration: 0,
    lyrics: '',
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title,
        audioUrl: song.audioUrl,
        coverUrl: song.coverUrl || '',
        duration: song.duration,
        lyrics: song.lyrics || '',
        isPublic: song.isPublic,
      });
    }
  }, [song]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.audioUrl.trim()) {
      alert('请填写歌曲标题和音频链接');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/songs/${song!.id}`, formData);
      } else {
        await api.post('/songs', formData);
      }
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
         style={{ backgroundColor: 'var(--overlay)' }}>
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border"
           style={{ 
             backgroundColor: 'var(--bg-card)',
             borderColor: 'var(--border-primary)'
           }}>
        <div className="sticky top-0 border-b p-6 flex items-center justify-between"
             style={{ 
               backgroundColor: 'var(--bg-card)',
               borderColor: 'var(--border-primary)'
             }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? '编辑歌曲' : '上传歌曲'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              歌曲标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入歌曲名称"
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
              音频链接 *
            </label>
            <input
              type="url"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              placeholder="https://example.com/song.mp3"
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              required
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              支持外部音频链接（如 CDN、云存储等）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              封面图片链接
            </label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              placeholder="https://example.com/cover.jpg"
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
              时长（秒）
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              placeholder="0"
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
              歌词
            </label>
            <textarea
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              placeholder="输入歌词（可选）"
              rows={6}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 resize-none font-mono text-sm transition-colors"
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
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded border transition-colors"
              style={{ 
                borderColor: 'var(--border-primary)',
                accentColor: 'var(--accent-primary)'
              }}
            />
            <label htmlFor="isPublic" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              公开歌曲（其他用户可以看到并播放）
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
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff'
              }}
            >
              {loading ? '保存中...' : (isEditing ? '保存修改' : '上传歌曲')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
