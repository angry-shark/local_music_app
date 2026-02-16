import { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  CloudArrowDownIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
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
const QQ_COOKIE_STORAGE_KEY = 'qq_music_cookie_fields';

// QQ Cookie 字段类型
interface QQCookieFields {
  loginType: 'qq' | 'wx';
  uin: string;
  qqmusicKey: string;
  wxOpenId?: string;
  wxUnionId?: string;
  wxRefreshToken?: string;
}

export default function ExternalSearch() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VendorSearchResult | null>(null);
  const [activeVendor, setActiveVendor] = useState<Vendor>('netease');
  const [error, setError] = useState('');
  const [playingSong, setPlayingSong] = useState<ExternalSong | null>(null);
  
  // Cookie 设置相关状态
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [cookieInputMode, setCookieInputMode] = useState<'fields' | 'paste'>('fields');
  const [rawCookie, setRawCookie] = useState('');
  const [cookieFields, setCookieFields] = useState<QQCookieFields>({
    loginType: 'wx',
    uin: '',
    qqmusicKey: '',
    wxOpenId: '',
    wxUnionId: '',
    wxRefreshToken: '',
  });
  const [cookieStatus, setCookieStatus] = useState<{ hasCookie: boolean; cookiePreview: string | null } | null>(null);
  const [savingCookie, setSavingCookie] = useState(false);
  const [cookieMessage, setCookieMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 解析完整 Cookie 字符串
  const parseRawCookie = (cookieStr: string): Partial<QQCookieFields> => {
    const result: Partial<QQCookieFields> = {};
    const cookies: Record<string, string> = {};
    
    // 解析 cookie 字符串
    cookieStr.split(';').forEach(pair => {
      const [key, value] = pair.trim().split('=');
      if (key && value) {
        cookies[key.trim()] = value.trim();
      }
    });
    
    // 判断登录类型并提取字段
    if (cookies['login_type'] === '2' || cookies['wxuin'] || cookies['wxopenid']) {
      result.loginType = 'wx';
      result.uin = cookies['wxuin'] || '';
      result.wxOpenId = cookies['wxopenid'] || '';
      result.wxUnionId = cookies['wxunionid'] || '';
      result.wxRefreshToken = decodeURIComponent(cookies['wxrefresh_token'] || '');
      result.qqmusicKey = cookies['qm_keyst'] || cookies['qqmusic_key'] || '';
    } else if (cookies['login_type'] === '1' || cookies['uin'] || cookies['qqmusic_key']) {
      result.loginType = 'qq';
      result.uin = cookies['uin'] || '';
      result.qqmusicKey = cookies['qqmusic_key'] || '';
    }
    
    return result;
  };

  // 处理粘贴的 Cookie
  const handleRawCookieChange = (value: string) => {
    setRawCookie(value);
    const parsed = parseRawCookie(value);
    if (parsed.loginType) {
      setCookieFields(prev => ({
        ...prev,
        ...parsed,
      }));
      setCookieMessage({ type: 'success', text: 'Cookie 解析成功！已自动填充字段。' });
    }
  };
  
  const { setPlaylist, currentSong, isPlaying } = usePlayerStore();

  // 页面加载时获取 cookie 状态和本地存储的字段
  useEffect(() => {
    checkCookieStatus();
    const savedFields = localStorage.getItem(QQ_COOKIE_STORAGE_KEY);
    if (savedFields) {
      try {
        const parsed = JSON.parse(savedFields);
        setCookieFields(prev => ({ ...prev, ...parsed }));
      } catch {
        // 解析失败忽略
      }
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

  // 构建 Cookie 字符串
  const buildCookieString = (): string => {
    const { loginType, uin, wxOpenId } = cookieFields;
    const qqmusicKey = cookieFields.qqmusicKey;
    const wxUnionId = cookieFields.wxUnionId;
    const wxRefreshToken = cookieFields.wxRefreshToken;
    
    if (loginType === 'qq') {
      // QQ 登录
      return `login_type=1; uin=${uin}; qqmusic_key=${qqmusicKey}`;
    } else {
      // 微信登录
      const parts = [
        'login_type=2',
        `wxuin=${uin}`,
        `wxopenid=${wxOpenId || ''}`,
        `wxunionid=${wxUnionId || ''}`,
        `wxrefresh_token=${encodeURIComponent(wxRefreshToken || '')}`,
      ];
      if (qqmusicKey) {
        parts.push(`qm_keyst=${qqmusicKey}`);
        parts.push(`qqmusic_key=${qqmusicKey}`);
      }
      return parts.filter(p => !p.endsWith('=') && !p.endsWith('=undefined') && !p.endsWith('=null')).join('; ');
    }
  };

  // 保存 cookie 到服务器
  const saveCookie = async () => {
    const { loginType, uin } = cookieFields;
    
    if (!uin.trim()) {
      setCookieMessage({ type: 'error', text: '请输入 QQ号/微信UIN' });
      return;
    }
    
    if (loginType === 'wx' && !cookieFields.wxOpenId?.trim()) {
      setCookieMessage({ type: 'error', text: '微信登录需要填写 OpenID' });
      return;
    }

    setSavingCookie(true);
    setCookieMessage(null);

    try {
      const cookieString = buildCookieString();
      console.log('生成的 Cookie:', cookieString);
      
      const response = await api.post('/external-songs/cookie', { cookie: cookieString });
      if (response.data.status) {
        setCookieMessage({ type: 'success', text: 'Cookie 设置成功！' });
        localStorage.setItem(QQ_COOKIE_STORAGE_KEY, JSON.stringify(cookieFields));
        setCookieStatus({ hasCookie: true, cookiePreview: cookieString.slice(0, 50) + '...' });
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
    setCookieFields({
      loginType: 'wx',
      uin: '',
      qqmusicKey: '',
      wxOpenId: '',
      wxUnionId: '',
      wxRefreshToken: '',
    });
    setRawCookie('');
    setCookieInputMode('fields');
    localStorage.removeItem(QQ_COOKIE_STORAGE_KEY);
    setCookieMessage(null);
    try {
      await api.post('/external-songs/cookie', { cookie: '' });
      setCookieStatus({ hasCookie: false, cookiePreview: null });
    } catch (err) {
      console.error('清除 Cookie 失败:', err);
    }
  };

  // 关闭模态框时重置状态
  const handleCloseModal = () => {
    setShowCookieModal(false);
    setCookieMessage(null);
    setCookieInputMode('fields');
    setRawCookie('');
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
        alert('该歌曲暂无法播放，请检查 Cookie 是否有效');
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
      alert('暂无可播放的歌曲，请检查 Cookie 是否有效');
    }
  };

  // 平台配置
  const vendors: { key: Vendor; label: string; color: string }[] = [
    { key: 'netease', label: '网易云音乐', color: '#c20c0c' },
    { key: 'qq', label: 'QQ音乐', color: '#31c27c' },
    { key: 'xiami', label: '虾米音乐', color: '#fa8723' },
  ];

  // Modern 渲染歌曲列表
  const renderSongList = (vendor: Vendor) => {
    const vendorResults = results?.[vendor];
    if (!vendorResults?.songs?.length) {
      return (
        <div className="text-center py-16 rounded-3xl"
             style={{ 
               backgroundColor: 'var(--gradient-primary-soft)',
               border: '1px solid var(--border-primary)',
             }}>
          <p style={{ color: 'var(--text-muted)' }}>暂无搜索结果</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            共 {vendorResults.total} 首
          </span>
          <button
            onClick={() => playAllSongs(vendor)}
            className="px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
            style={{ 
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <PlayIcon className="w-4 h-4" />
            播放全部
          </button>
        </div>

        <div className="rounded-3xl overflow-hidden border"
             style={{ 
               backgroundColor: 'var(--bg-card)',
               borderColor: 'var(--border-primary)',
               boxShadow: 'var(--shadow-md)',
             }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold w-20"
                    style={{ color: 'var(--text-muted)' }}>#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold"
                    style={{ color: 'var(--text-muted)' }}>歌曲</th>
                <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell"
                    style={{ color: 'var(--text-muted)' }}>歌手</th>
                <th className="px-6 py-4 text-left text-sm font-semibold hidden sm:table-cell"
                    style={{ color: 'var(--text-muted)' }}>
                  <ClockIcon className="w-4 h-4" />
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold w-24"
                    style={{ color: 'var(--text-muted)' }}>操作</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={song.album?.cover || 'https://via.placeholder.com/48'}
                          alt={song.name}
                          className="w-12 h-12 rounded-xl object-cover shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                          }}
                        />
                        <div>
                          <span className={`font-semibold block ${isCurrentSong ? '' : ''}`}
                                style={{ color: isCurrentSong ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                            {song.name}
                          </span>
                          {song.cp && (
                            <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
                              版权受限
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {song.artists?.map(a => a.name).join(', ') || '未知歌手'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {song.duration ? formatTime(song.duration / 1000) : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('添加功能开发中...');
                        }}
                        className="p-3 rounded-xl transition-all duration-300 hover:scale-110"
                        style={{ 
                          color: 'var(--text-muted)',
                          backgroundColor: 'var(--bg-tertiary)',
                        }}
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
      {/* Modern Header */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-1">
              搜索外部音乐
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              搜索网易云音乐、QQ音乐、虾米音乐的歌曲资源
            </p>
          </div>
          <button
            onClick={() => setShowCookieModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: cookieStatus?.hasCookie ? 'var(--gradient-primary-soft)' : 'var(--bg-tertiary)',
              color: cookieStatus?.hasCookie ? 'var(--accent-success)' : 'var(--text-secondary)',
              border: `1px solid ${cookieStatus?.hasCookie ? 'var(--accent-success)' : 'var(--border-primary)'}`,
            }}
            title="设置 QQ 音乐 Cookie 以获取更高音质的播放链接"
          >
            {cookieStatus?.hasCookie ? <CheckCircleIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
            {cookieStatus?.hasCookie ? '已配置 Cookie' : '设置 Cookie'}
          </button>
        </div>

        {!cookieStatus?.hasCookie && (
          <div className="p-4 rounded-2xl mb-6 flex items-center gap-3"
               style={{ 
                 backgroundColor: 'var(--gradient-primary-soft)',
                 border: '1px solid var(--border-primary)',
               }}>
            <SparklesIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              提示：设置 QQ 音乐 Cookie 后可获取更高音质的播放链接
            </span>
          </div>
        )}

        {/* Modern Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="输入歌曲名、歌手名搜索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-12 pr-4 py-4 border w-full transition-all duration-300 focus:outline-none"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-xl)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="px-8 py-4 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            style={{ 
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span className="relative z-10">{loading ? '搜索中...' : '搜索'}</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white" />
          </button>
        </form>
      </div>

      {/* Modern Cookie Setting Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
             style={{ backgroundColor: 'var(--overlay)' }}
             onClick={handleCloseModal}>
          <div className="flex flex-col max-w-lg w-full max-h-[85vh] relative"
               style={{ 
                 backgroundColor: 'var(--bg-card)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 borderRadius: 'var(--radius-2xl)',
                 border: '1px solid var(--border-primary)',
                 boxShadow: 'var(--shadow-xl)',
               }}
               onClick={e => e.stopPropagation()}>
            {/* Fixed Header */}
            <div className="p-8 pb-4 flex-shrink-0">
            {/* Decorative line */}
            <div className="absolute top-0 left-8 right-8 h-px"
                 style={{ background: 'var(--gradient-primary)' }} />
            
            <h2 className="text-2xl font-bold gradient-text">
              设置 QQ 音乐 Cookie
            </h2>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
            
            {/* QQ Music External Link */}
            <a
              href="https://y.qq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 mb-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
              style={{ 
                backgroundColor: 'var(--gradient-primary-soft)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <MusicalNoteIcon className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  前往 QQ 音乐网页版获取 Cookie
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  登录后按 F12 → Application → Cookies → y.qq.com
                </div>
              </div>
              <ArrowTopRightOnSquareIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                               style={{ color: 'var(--accent-primary)' }} />
            </a>

            {/* Input Mode Toggle */}
            <div className="mb-6 p-1.5 rounded-2xl flex gap-1"
                 style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <button
                type="button"
                onClick={() => setCookieInputMode('fields')}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: cookieInputMode === 'fields' ? 'var(--bg-secondary)' : 'transparent',
                  color: cookieInputMode === 'fields' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: cookieInputMode === 'fields' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <PencilSquareIcon className="w-4 h-4" />
                逐个填写
              </button>
              <button
                type="button"
                onClick={() => setCookieInputMode('paste')}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: cookieInputMode === 'paste' ? 'var(--bg-secondary)' : 'transparent',
                  color: cookieInputMode === 'paste' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: cookieInputMode === 'paste' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                粘贴完整 Cookie
              </button>
            </div>

            {/* Paste Mode - Raw Cookie Input */}
            {cookieInputMode === 'paste' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
                    粘贴完整 Cookie 字符串
                  </label>
                  <textarea
                    value={rawCookie}
                    onChange={(e) => handleRawCookieChange(e.target.value)}
                    placeholder="从浏览器开发者工具复制完整的 Cookie 字符串，例如：&#10;login_type=2; wxuin=115292...; wxopenid=opCFJw...; qm_keyst=W_X_..."
                    className="w-full px-5 py-4 border transition-all duration-300 focus:outline-none resize-none"
                    style={{ 
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-xl)',
                      minHeight: '120px',
                    }}
                  />
                </div>
                
                {/* Auto-filled Preview */}
                {(cookieFields.uin || cookieFields.wxOpenId || cookieFields.qqmusicKey) && (
                  <div className="p-4 rounded-2xl"
                       style={{ 
                         backgroundColor: 'var(--gradient-primary-soft)',
                         border: '1px solid var(--border-primary)',
                       }}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircleIcon className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--accent-success)' }}>
                        自动解析结果
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>登录方式</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {cookieFields.loginType === 'wx' ? '微信登录' : 'QQ登录'}
                        </span>
                      </div>
                      {cookieFields.uin && (
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>
                            {cookieFields.loginType === 'wx' ? '微信 UIN' : 'QQ号'}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }} className="font-mono">
                            {cookieFields.uin.slice(0, 20)}{cookieFields.uin.length > 20 ? '...' : ''}
                          </span>
                        </div>
                      )}
                      {cookieFields.wxOpenId && (
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>OpenID</span>
                          <span style={{ color: 'var(--text-primary)' }} className="font-mono">
                            {cookieFields.wxOpenId.slice(0, 15)}...
                          </span>
                        </div>
                      )}
                      {cookieFields.qqmusicKey && (
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>音乐密钥</span>
                          <span style={{ color: 'var(--text-primary)' }} className="font-mono">
                            {cookieFields.qqmusicKey.slice(0, 15)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fields Mode - Individual Inputs */}
            {cookieInputMode === 'fields' && (
              <>
                {/* Modern 登录类型选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 ml-1" style={{ color: 'var(--text-secondary)' }}>
                    登录方式
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCookieFields(prev => ({ ...prev, loginType: 'wx' }))}
                      className="flex-1 px-4 py-3 text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: cookieFields.loginType === 'wx' ? 'var(--gradient-primary-soft)' : 'var(--bg-input)',
                        color: cookieFields.loginType === 'wx' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: `1px solid ${cookieFields.loginType === 'wx' ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                        borderRadius: 'var(--radius-xl)',
                      }}
                    >
                      微信登录
                    </button>
                    <button
                      type="button"
                      onClick={() => setCookieFields(prev => ({ ...prev, loginType: 'qq' }))}
                      className="flex-1 px-4 py-3 text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: cookieFields.loginType === 'qq' ? 'var(--gradient-primary-soft)' : 'var(--bg-input)',
                        color: cookieFields.loginType === 'qq' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: `1px solid ${cookieFields.loginType === 'qq' ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                        borderRadius: 'var(--radius-xl)',
                      }}
                    >
                      QQ登录
                    </button>
                  </div>
                </div>

                {/* Modern 字段输入 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
                  {cookieFields.loginType === 'qq' ? 'QQ号 (uin)' : '微信 UIN (wxuin)'}
                  <span style={{ color: 'var(--accent-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={cookieFields.uin}
                  onChange={(e) => setCookieFields(prev => ({ ...prev, uin: e.target.value }))}
                  placeholder={cookieFields.loginType === 'qq' ? '如: 123456789' : '如: 11529215...'}
                  className="w-full px-5 py-3 border transition-all duration-300 focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-xl)',
                  }}
                />
              </div>

              {cookieFields.loginType === 'wx' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
                      微信 OpenID (wxopenid)
                      <span style={{ color: 'var(--accent-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={cookieFields.wxOpenId}
                      onChange={(e) => setCookieFields(prev => ({ ...prev, wxOpenId: e.target.value }))}
                      placeholder="如: opCFJw..."
                      className="w-full px-5 py-3 border transition-all duration-300 focus:outline-none"
                      style={{ 
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-xl)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
                      微信 UnionID (wxunionid)
                    </label>
                    <input
                      type="text"
                      value={cookieFields.wxUnionId}
                      onChange={(e) => setCookieFields(prev => ({ ...prev, wxUnionId: e.target.value }))}
                      placeholder="如: oqFLxsmG..."
                      className="w-full px-5 py-3 border transition-all duration-300 focus:outline-none"
                      style={{ 
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-xl)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
                      微信 Refresh Token
                    </label>
                    <input
                      type="text"
                      value={cookieFields.wxRefreshToken}
                      onChange={(e) => setCookieFields(prev => ({ ...prev, wxRefreshToken: e.target.value }))}
                      placeholder="如: 101_R0sXjh..."
                      className="w-full px-5 py-3 border transition-all duration-300 focus:outline-none"
                      style={{ 
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-xl)',
                      }}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 ml-1" style={{ color: 'var(--text-secondary)' }}>
                  {cookieFields.loginType === 'qq' ? 'QQ音乐密钥 (qqmusic_key)' : 'QQ音乐密钥 (qm_keyst/qqmusic_key)'}
                </label>
                <input
                  type="text"
                  value={cookieFields.qqmusicKey}
                  onChange={(e) => setCookieFields(prev => ({ ...prev, qqmusicKey: e.target.value }))}
                  placeholder={cookieFields.loginType === 'qq' ? '如: Q_H_L_...' : '如: W_X_63B0amG...'}
                  className="w-full px-5 py-3 border transition-all duration-300 focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-xl)',
                  }}
                />
              </div>
            </div>
              </>
            )}

            {/* Modern 获取方式提示 */}
            <div className="mt-5 p-4 rounded-2xl text-sm" 
                 style={{ 
                   backgroundColor: 'var(--gradient-primary-soft)',
                   border: '1px solid var(--border-primary)',
                 }}>
              <p className="font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <SparklesIcon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                如何获取这些字段？
              </p>
              <ol className="list-decimal list-inside space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>在浏览器中登录 QQ 音乐网页版 (y.qq.com)</li>
                <li>按 F12 打开开发者工具 → Application/应用 → Cookies</li>
                <li>找到 y.qq.com 域名下的 Cookie</li>
                <li>复制对应的字段值填入上方表单</li>
              </ol>
            </div>

            {/* Cookie Status - 始终显示，与外部按钮保持一致 */}
            <div className="mt-4 p-4 rounded-2xl"
                 style={{ 
                   backgroundColor: cookieStatus?.hasCookie ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                   border: `1px solid ${cookieStatus?.hasCookie ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`,
                 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cookieStatus?.hasCookie ? (
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
                {cookieStatus?.hasCookie ? (
                  <button
                    onClick={async () => {
                      if (confirm('确定要重置服务器保存的 Cookie 吗？这将清除服务器上的登录状态。')) {
                        await clearCookie();
                        await checkCookieStatus(); // 刷新状态
                        setCookieMessage({ type: 'success', text: '服务器 Cookie 已重置' });
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--accent-danger)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    重置服务器 Cookie
                  </button>
                ) : (
                  <span className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ 
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}>
                    未配置
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            {cookieMessage && (
              <div className={`mt-4 p-3 rounded-lg ${
                cookieMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {cookieMessage.text}
              </div>
            )}

            {/* Modern Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={saveCookie}
                disabled={savingCookie}
                className="flex-1 px-6 py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{ 
                  background: 'var(--gradient-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <span className="relative z-10">{savingCookie ? '保存中...' : '保存设置'}</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white" />
              </button>
              <button
                onClick={clearCookie}
                className="px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                清除
              </button>
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                关闭
              </button>
            </div>
            </div>{/* End Scrollable Content */}
          </div>
        </div>
      )}

      {/* Modern Error Message */}
      {error && (
        <div className="mb-6 p-5 rounded-2xl flex items-center gap-3"
             style={{ 
               backgroundColor: 'rgba(239, 68, 68, 0.1)', 
               border: '1px solid rgba(239, 68, 68, 0.2)',
               color: 'var(--accent-danger)' 
             }}>
          <SparklesIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          {/* Modern Vendor Tabs */}
          <div className="flex gap-2 mb-6 p-1.5 rounded-2xl w-fit" 
               style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            {vendors.map(vendor => {
              const count = results[vendor.key]?.songs?.length || 0;
              const isActive = activeVendor === vendor.key;
              return (
                <button
                  key={vendor.key}
                  onClick={() => setActiveVendor(vendor.key)}
                  className="px-5 py-2.5 font-medium transition-all duration-300 flex items-center gap-2"
                  style={{
                    backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                    color: isActive ? vendor.color : 'var(--text-muted)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {vendor.label}
                  {count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: isActive ? vendor.color : 'var(--bg-secondary)',
                            color: isActive ? '#ffffff' : 'var(--text-muted)'
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

      {/* Modern Empty State */}
      {!results && !loading && !error && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
               style={{ 
                 backgroundColor: 'var(--gradient-primary-soft)',
                 border: '1px solid var(--border-primary)',
               }}>
            <MusicalNoteIcon className="w-12 h-12" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            开始搜索
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>输入关键词搜索外部音乐资源</p>
        </div>
      )}
    </div>
  );
}
