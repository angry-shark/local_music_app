import { useState, useEffect } from 'react';
import { PlayIcon, ClockIcon, MagnifyingGlassIcon, CloudArrowDownIcon, Cog6ToothIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { MusicalNoteIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';
import { usePlayerStore } from '../stores/playerStore';
import { formatTime } from '../utils/format';

// 外部歌曲类型
interface ExternalSong {
  id: string | number;
  name: string;
  artists: { id: string | number; name: string }[];
  album?: {
    id: string | number;
    name: string;
    cover: string;
  };
  duration?: number;
  cp?: boolean; // 版权限制
}

// 搜索结果类型
interface SearchResult {
  songs: ExternalSong[];
  total: number;
}

// 平台类型
type Vendor = 'netease' | 'qq' | 'xiami';

interface VendorSearchResult {
  netease: SearchResult | null;
  qq: SearchResult | null;
  xiami: SearchResult | null;
}

// Cookie 存储 key
const QQ_COOKIE_STORAGE_KEY = 'qq_music_cookie';

export default function ExternalSearch() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VendorSearchResult | null>(null);
  const [activeVendor, setActiveVendor] = useState<Vendor>('netease');
  const [error, setError] = useState('');
  const [playingSong, setPlayingSong] = useState<ExternalSong | null>(null);
  
  // Cookie 设置相关状态
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [cookieInput, setCookieInput] = useState('');
  const [cookieStatus, setCookieStatus] = useState<{ hasCookie: boolean; cookiePreview: string | null } | null>(null);
  const [savingCookie, setSavingCookie] = useState(false);
  const [cookieMessage, setCookieMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { setPlaylist, currentSong, isPlaying } = usePlayerStore();

  // 页面加载时获取 cookie 状态和本地存储的 cookie
  useEffect(() => {
    checkCookieStatus();
    const savedCookie = localStorage.getItem(QQ_COOKIE_STORAGE_KEY);
    if (savedCookie) {
      setCookieInput(savedCookie);
    }
  }, []);

  // 检查服务器 cookie 状态
  const checkCookieStatus = async () => {
    try {
      const response = await api.get('/external-songs/cookie/status');
      if (response.data.status) {
        setCookieStatus(response.data.data);
      }
    } catch (err) {
      console.error('获取 Cookie 状态失败:', err);
    }
  };

  // 保存 cookie 到服务器
  const saveCookie = async () => {
    if (!cookieInput.trim()) {
      setCookieMessage({ type: 'error', text: '请输入 Cookie' });
      return;
    }

    setSavingCookie(true);
    setCookieMessage(null);

    try {
      const response = await api.post('/external-songs/cookie', { cookie: cookieInput.trim() });
      if (response.data.status) {
        setCookieMessage({ type: 'success', text: 'Cookie 设置成功！' });
        localStorage.setItem(QQ_COOKIE_STORAGE_KEY, cookieInput.trim());
        setCookieStatus({ hasCookie: true, cookiePreview: cookieInput.trim().slice(0, 50) + '...' });
        setTimeout(() => setShowCookieModal(false), 1000);
      } else {
        setCookieMessage({ type: 'error', text: response.data.message || '设置失败' });
      }
    } catch (err: any) {
      setCookieMessage({ type: 'error', text: err.response?.data?.message || '设置失败，请检查网络' });
    } finally {
      setSavingCookie(false);
    }
  };

  // 清除 cookie
  const clearCookie = async () => {
    setCookieInput('');
    localStorage.removeItem(QQ_COOKIE_STORAGE_KEY);
    setCookieMessage(null);
    try {
      await api.post('/external-songs/cookie', { cookie: '' });
      setCookieStatus({ hasCookie: false, cookiePreview: null });
    } catch (err) {
      console.error('清除 Cookie 失败:', err);
    }
  };

  // 执行搜索
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await api.get(`/external-songs/search?keyword=${encodeURIComponent(keyword)}`);
      if (response.data.status) {
        setResults(response.data.data);
      } else {
        setError('搜索失败');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 播放歌曲
  const playExternalSong = async (song: ExternalSong, vendor: Vendor) => {
    try {
      setPlayingSong(song);
      
      // 获取歌曲播放地址
      const urlResponse = await api.get(`/external-songs/url?vendor=${vendor}&id=${song.id}`);
      if (!urlResponse.data.status || !urlResponse.data.data?.url) {
        alert('该歌曲暂无法播放');
        return;
      }

      const audioUrl = urlResponse.data.data.url;

      // 获取歌词（可选）
      let lyrics = '';
      try {
        const lyricResponse = await api.get(`/external-songs/lyric?vendor=${vendor}&id=${song.id}`);
        if (lyricResponse.data.status) {
          lyrics = JSON.stringify(lyricResponse.data.data?.lyric || '');
        }
      } catch {
        // 歌词获取失败不影响播放
      }

      // 转换为本地 Song 格式并播放
      const formattedSong = {
        id: `external-${vendor}-${song.id}`,
        title: song.name,
        artistId: 0,
        artistName: song.artists?.map(a => a.name).join(', ') || '未知歌手',
        audioUrl: audioUrl,
        coverUrl: song.album?.cover,
        duration: song.duration || 0,
        lyrics: lyrics,
        isPublic: true,
        createdAt: new Date().toISOString(),
      };

      // 设置播放列表为当前歌曲
      setPlaylist([formattedSong as any], 0);
    } catch (err: any) {
      alert(err.response?.data?.message || '播放失败');
    } finally {
      setPlayingSong(null);
    }
  };

  // 播放平台所有歌曲
  const playAllSongs = async (vendor: Vendor) => {
    const vendorResults = results?.[vendor];
    if (!vendorResults?.songs?.length) return;

    const songs = vendorResults.songs.slice(0, 20); // 限制前20首
    const formattedSongs: any[] = [];

    for (const song of songs) {
      try {
        const urlResponse = await api.get(`/external-songs/url?vendor=${vendor}&id=${song.id}`);
        if (urlResponse.data.status && urlResponse.data.data?.url) {
          formattedSongs.push({
            id: `external-${vendor}-${song.id}`,
            title: song.name,
            artistId: 0,
            artistName: song.artists?.map(a => a.name).join(', ') || '未知歌手',
            audioUrl: urlResponse.data.data.url,
            coverUrl: song.album?.cover,
            duration: song.duration || 0,
            isPublic: true,
            createdAt: new Date().toISOString(),
          });
        }
      } catch {
        // 跳过无法播放的歌曲
      }
    }

    if (formattedSongs.length > 0) {
      setPlaylist(formattedSongs, 0);
    } else {
      alert('暂无可播放的歌曲');
    }
  };

  // 平台配置
  const vendors: { key: Vendor; label: string; color: string }[] = [
    { key: 'netease', label: '网易云音乐', color: '#c20c0c' },
    { key: 'qq', label: 'QQ音乐', color: '#31c27c' },
    { key: 'xiami', label: '虾米音乐', color: '#fa8723' },
  ];

  // 渲染歌曲列表
  const renderSongList = (vendor: Vendor) => {
    const vendorResults = results?.[vendor];
    if (!vendorResults?.songs?.length) {
      return (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          暂无搜索结果
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            共 {vendorResults.total} 首
          </span>
          <button
            onClick={() => playAllSongs(vendor)}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1"
            style={{ 
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff'
            }}
          >
            <PlayIcon className="w-4 h-4" />
            播放全部
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border"
             style={{ 
               backgroundColor: 'var(--bg-card)',
               borderColor: 'var(--border-primary)'
             }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium w-16"
                    style={{ color: 'var(--text-tertiary)' }}>#</th>
                <th className="px-4 py-3 text-left text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}>歌曲</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell"
                    style={{ color: 'var(--text-tertiary)' }}>歌手</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell"
                    style={{ color: 'var(--text-tertiary)' }}>
                  <ClockIcon className="w-4 h-4" />
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium w-20"
                    style={{ color: 'var(--text-tertiary)' }}>操作</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {vendorResults.songs.map((song, index) => {
                const songId = `external-${vendor}-${song.id}`;
                const isCurrentSong = currentSong != null && (currentSong.id as string | number) === songId;
                const isLoading = playingSong != null && song.id != null && playingSong.id == song.id;

                return (
                  <tr
                    key={songId}
                    className="group cursor-pointer transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => playExternalSong(song, vendor)}
                  >
                    <td className="px-4 py-3">
                      {isCurrentSong && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-4">
                          <div className="w-1 animate-pulse h-2"
                               style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                          <div className="w-1 animate-pulse h-4 delay-75"
                               style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                          <div className="w-1 animate-pulse h-3 delay-150"
                               style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                        </div>
                      ) : (
                        <span className="group-hover:hidden" style={{ color: 'var(--text-muted)' }}>
                          {index + 1}
                        </span>
                      )}
                      {isLoading ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-t-transparent hidden group-hover:block"
                             style={{ borderColor: 'var(--accent-primary)' }} />
                      ) : (
                        <PlayIcon className="w-5 h-5 hidden group-hover:block"
                                 style={{ color: 'var(--text-primary)' }} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={song.album?.cover || 'https://via.placeholder.com/40'}
                          alt={song.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                          }}
                        />
                        <div>
                          <span className={`font-medium block ${isCurrentSong ? 'font-semibold' : ''}`}
                                style={{ color: isCurrentSong ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                            {song.name}
                          </span>
                          {song.cp && (
                            <span className="text-xs px-1.5 py-0.5 rounded"
                                  style={{ backgroundColor: 'var(--accent-danger)', color: '#fff' }}>
                              版权受限
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'var(--text-tertiary)' }}>
                      {song.artists?.map(a => a.name).join(', ') || '未知歌手'}
                    </td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {song.duration ? formatTime(song.duration / 1000) : '--:--'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 添加到本地歌单功能
                          alert('添加功能开发中...');
                        }}
                        className="p-2 rounded-lg transition-colors hover:opacity-70"
                        style={{ color: 'var(--text-muted)' }}
                        title="添加到歌单"
                      >
                        <CloudArrowDownIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <MusicalNoteIcon className="w-8 h-8 inline-block mr-2" style={{ color: 'var(--accent-primary)' }} />
            搜索外部音乐
          </h1>
          <button
            onClick={() => setShowCookieModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{ 
              backgroundColor: cookieStatus?.hasCookie ? 'var(--accent-success)' : 'var(--bg-tertiary)',
              color: cookieStatus?.hasCookie ? '#ffffff' : 'var(--text-secondary)'
            }}
            title="设置 QQ 音乐 Cookie 以获取更高音质的播放链接"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            {cookieStatus?.hasCookie ? '已配置 Cookie' : '设置 Cookie'}
          </button>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          搜索网易云音乐、QQ音乐、虾米音乐的歌曲资源
          {!cookieStatus?.hasCookie && (
            <span className="block mt-1 text-xs" style={{ color: 'var(--accent-warning)' }}>
              ⚠️ 提示：设置 QQ 音乐 Cookie 后可获取更高音质的播放链接
            </span>
          )}
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="输入歌曲名、歌手名搜索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 w-full transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff'
            }}
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </form>
      </div>

      {/* Cookie Setting Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             onClick={() => setShowCookieModal(false)}>
          <div className="rounded-2xl p-6 max-w-lg w-full"
               style={{ backgroundColor: 'var(--bg-card)' }}
               onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              设置 QQ 音乐 Cookie
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Cookie 值
              </label>
              <textarea
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                placeholder="请从浏览器开发者工具中复制 QQ 音乐的 Cookie..."
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                  minHeight: '120px'
                }}
              />
              <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                💡 提示：在浏览器中登录 QQ 音乐，按 F12 打开开发者工具，进入 Application/Storage → Cookies，
                复制 y.qq.com 下的 cookie 字符串（包含 uin、qqmusic_key 等字段）
              </p>
            </div>

            {/* Cookie Status */}
            {cookieStatus && (
              <div className="mb-4 p-3 rounded-lg"
                   style={{ 
                     backgroundColor: cookieStatus.hasCookie ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                   }}>
                <div className="flex items-center gap-2">
                  {cookieStatus.hasCookie ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" style={{ color: 'var(--accent-success)' }} />
                      <span style={{ color: 'var(--accent-success)' }}>服务器已配置 Cookie</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-muted)' }}>服务器未配置 Cookie</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Message */}
            {cookieMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                cookieMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {cookieMessage.text}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={saveCookie}
                disabled={savingCookie}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                {savingCookie ? '保存中...' : '保存'}
              </button>
              <button
                onClick={clearCookie}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)'
                }}
              >
                清除
              </button>
              <button
                onClick={() => setShowCookieModal(false)}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl"
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          {/* Vendor Tabs */}
          <div className="flex gap-2 mb-6 border-b pb-2" style={{ borderColor: 'var(--border-primary)' }}>
            {vendors.map(vendor => {
              const count = results[vendor.key]?.songs?.length || 0;
              return (
                <button
                  key={vendor.key}
                  onClick={() => setActiveVendor(vendor.key)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{
                    backgroundColor: activeVendor === vendor.key ? vendor.color : 'transparent',
                    color: activeVendor === vendor.key ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {vendor.label}
                  {count > 0 && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: activeVendor === vendor.key ? 'rgba(255,255,255,0.3)' : 'var(--bg-tertiary)',
                            color: activeVendor === vendor.key ? '#ffffff' : 'var(--text-muted)'
                          }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Song List */}
          {renderSongList(activeVendor)}
        </div>
      )}

      {/* Empty State */}
      {!results && !loading && !error && (
        <div className="text-center py-20">
          <MusicalNoteIcon className="w-20 h-20 mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>输入关键词搜索外部音乐资源</p>
        </div>
      )}
    </div>
  );
}
