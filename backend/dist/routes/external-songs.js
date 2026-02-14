"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// qq-music-api 服务地址，可通过环境变量配置
const QQ_MUSIC_API_BASE = process.env.QQ_MUSIC_API_URL || 'http://localhost:3300';
/**
 * 转发请求到 qq-music-api 服务
 * @param path API 路径
 * @param query 查询参数
 * @returns 响应数据
 */
async function forwardToQQMusicApi(path, query) {
    const url = new URL(path, QQ_MUSIC_API_BASE);
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
    }
    const response = await fetch(url.toString());
    const data = await response.json();
    // 如果 qq-music-api 返回错误，抛出包含详细信息的错误
    if (!response.ok || data.error) {
        const errorMsg = data.error || data.message || `qq-music-api request failed: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
    }
    return data;
}
/**
 * 搜索歌曲（QQ音乐）
 * GET /api/external-songs/search?keyword=xxx&offset=0
 */
router.get('/search', async (req, res) => {
    try {
        const { keyword, offset = '0' } = req.query;
        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ message: '请提供搜索关键词' });
        }
        const pageNo = Math.floor(parseInt(offset) / 20) + 1;
        const result = await forwardToQQMusicApi('/search', {
            key: keyword,
            pageNo: pageNo.toString(),
            pageSize: '20',
            t: '0', // 0: 单曲
        });
        // 格式化搜索结果
        const formattedResult = {
            qq: formatQQSearchResult(result),
        };
        res.json({
            status: true,
            data: formattedResult,
        });
    }
    catch (error) {
        console.error('搜索歌曲错误:', error);
        res.status(500).json({ message: '搜索歌曲失败', error: error.message });
    }
});
/**
 * 指定平台搜索歌曲
 * GET /api/external-songs/search/:vendor?keyword=xxx&offset=0
 * vendor: qq (目前只支持QQ音乐)
 */
router.get('/search/:vendor', async (req, res) => {
    try {
        const { vendor } = req.params;
        const { keyword, offset = '0' } = req.query;
        if (vendor !== 'qq') {
            return res.status(400).json({ message: '不支持的音乐平台，目前仅支持 qq' });
        }
        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ message: '请提供搜索关键词' });
        }
        const pageNo = Math.floor(parseInt(offset) / 20) + 1;
        const result = await forwardToQQMusicApi('/search', {
            key: keyword,
            pageNo: pageNo.toString(),
            pageSize: '20',
            t: '0', // 0: 单曲
        });
        res.json({
            status: true,
            data: formatQQSearchResult(result),
        });
    }
    catch (error) {
        console.error('平台搜索歌曲错误:', error);
        res.status(500).json({ message: '搜索歌曲失败', error: error.message });
    }
});
/**
 * 获取歌曲详情
 * GET /api/external-songs/detail?vendor=xxx&id=xxx
 */
router.get('/detail', async (req, res) => {
    try {
        const { vendor, id } = req.query;
        if (!vendor || typeof vendor !== 'string') {
            return res.status(400).json({ message: '请提供平台参数 vendor' });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: '请提供歌曲 ID' });
        }
        if (vendor !== 'qq') {
            return res.status(400).json({ message: '不支持的音乐平台，目前仅支持 qq' });
        }
        // QQ音乐通过歌曲链接获取详情，使用 song/urls 获取播放链接作为详情补充
        const result = await forwardToQQMusicApi('/song/urls', {
            id,
            ownCookie: '1',
        });
        res.json({
            status: true,
            data: result,
        });
    }
    catch (error) {
        console.error('获取歌曲详情错误:', error);
        res.status(500).json({ message: '获取歌曲详情失败', error: error.message });
    }
});
/**
 * 批量获取歌曲详情
 * POST /api/external-songs/batch-detail
 * Body: { vendor: string, ids: string[] }
 */
router.post('/batch-detail', async (req, res) => {
    try {
        const { vendor, ids } = req.body;
        if (!vendor || typeof vendor !== 'string') {
            return res.status(400).json({ message: '请提供平台参数 vendor' });
        }
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: '请提供歌曲 ID 数组' });
        }
        if (vendor !== 'qq') {
            return res.status(400).json({ message: '不支持的音乐平台，目前仅支持 qq' });
        }
        const result = await forwardToQQMusicApi('/song/urls', {
            id: ids.join(','),
            ownCookie: '1',
        });
        res.json({
            status: true,
            data: result,
        });
    }
    catch (error) {
        console.error('批量获取歌曲详情错误:', error);
        res.status(500).json({ message: '批量获取歌曲详情失败', error: error.message });
    }
});
/**
 * 获取歌曲播放地址
 * GET /api/external-songs/url?vendor=xxx&id=xxx
 */
router.get('/url', async (req, res) => {
    try {
        const { vendor, id } = req.query;
        if (!vendor || typeof vendor !== 'string') {
            return res.status(400).json({ message: '请提供平台参数 vendor' });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: '请提供歌曲 ID' });
        }
        if (vendor !== 'qq') {
            return res.status(400).json({ message: '不支持的音乐平台，目前仅支持 qq' });
        }
        const result = await forwardToQQMusicApi('/song/urls', {
            id,
            ownCookie: '1',
        });
        // qq-music-api 直接返回 {songId: url} 结构
        res.json({
            status: true,
            data: {
                url: result[id] || null,
            },
        });
    }
    catch (error) {
        console.error('获取歌曲地址错误:', error);
        res.status(500).json({ message: '获取歌曲地址失败', error: error.message });
    }
});
/**
 * 获取歌曲歌词
 * GET /api/external-songs/lyric?vendor=xxx&id=xxx
 */
router.get('/lyric', async (req, res) => {
    try {
        const { vendor, id } = req.query;
        if (!vendor || typeof vendor !== 'string') {
            return res.status(400).json({ message: '请提供平台参数 vendor' });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: '请提供歌曲 ID' });
        }
        if (vendor !== 'qq') {
            return res.status(400).json({ message: '不支持的音乐平台，目前仅支持 qq' });
        }
        const result = await forwardToQQMusicApi('/lyric', {
            songmid: id,
        });
        res.json({
            status: true,
            data: {
                lyric: result.data?.lyric || result.data,
            },
        });
    }
    catch (error) {
        console.error('获取歌词错误:', error);
        res.status(500).json({ message: '获取歌词失败', error: error.message });
    }
});
/**
 * 获取歌手单曲
 * GET /api/external-songs/artist/:vendor/:id?offset=0&limit=50
 */
router.get('/artist/:vendor/:id', async (req, res) => {
    try {
        const { vendor, id } = req.params;
        const { offset = '0', limit = '50' } = req.query;
        if (vendor !== 'qq') {
            return res.status(400).json({ message: '不支持的音乐平台，目前仅支持 qq' });
        }
        const result = await forwardToQQMusicApi('/singer/songs', {
            singermid: id,
            page: (Math.floor(parseInt(offset) / parseInt(limit)) + 1).toString(),
            num: limit,
        });
        res.json({
            status: true,
            data: formatQQArtistSongs(result),
        });
    }
    catch (error) {
        console.error('获取歌手单曲错误:', error);
        res.status(500).json({ message: '获取歌手单曲失败', error: error.message });
    }
});
/**
 * 格式化 QQ 音乐搜索结果
 */
function formatQQSearchResult(data) {
    if (!data)
        return null;
    // QQ 音乐返回的数据结构处理
    const list = data.data?.list || data.data?.song?.list || data.list || [];
    const total = data.data?.totalnum || data.data?.song?.totalnum || list.length || 0;
    return {
        songs: list.map(formatQQSongItem),
        total,
    };
}
/**
 * 格式化 QQ 音乐歌手歌曲列表
 */
function formatQQArtistSongs(data) {
    if (!data)
        return null;
    const list = data.data?.list || data.data?.songList || data.list || [];
    const total = data.data?.total || data.data?.totalNum || list.length || 0;
    return {
        songs: list.map(formatQQSongItem),
        total,
    };
}
/**
 * 格式化 QQ 音乐歌曲条目
 */
function formatQQSongItem(song) {
    if (!song)
        return null;
    // QQ 音乐的歌曲数据结构
    const album = song.album || song.albummid ? {
        id: song.albummid || song.album?.mid,
        name: song.albumname || song.album?.name,
    } : null;
    const artists = song.singer?.map((s) => ({
        id: s.mid,
        name: s.name,
    })) || (song.singername ? [{ id: song.singermid, name: song.singername }] : []);
    return {
        id: song.mid || song.songmid || song.id,
        name: song.name || song.songname,
        artists,
        album,
        duration: song.interval || song.duration || 0,
        cp: song.pay?.pay_play === 1 || song.payplay === 1, // 版权限制
    };
}
/**
 * 格式化搜索结果（兼容旧格式）
 */
function formatSearchResult(data) {
    if (!data)
        return null;
    // 如果已经是数组，直接返回
    if (Array.isArray(data)) {
        return {
            songs: data.map(formatSongItem),
            total: data.length,
        };
    }
    // 处理包含 songs 字段的对象
    if (data.songs) {
        return {
            songs: data.songs.map(formatSongItem),
            total: data.total || data.songs.length,
        };
    }
    return data;
}
/**
 * 格式化歌曲条目（兼容旧格式）
 */
function formatSongItem(song) {
    if (!song)
        return null;
    return {
        id: song.id,
        name: song.name,
        artists: song.artists || [],
        album: song.album || null,
        duration: song.duration || 0,
        cp: song.cp || false, // 版权限制
    };
}
exports.default = router;
//# sourceMappingURL=external-songs.js.map