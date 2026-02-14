"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const music_api_1 = __importDefault(require("@suen/music-api"));
const router = (0, express_1.Router)();
/**
 * 搜索歌曲（聚合多平台）
 * GET /api/external-songs/search?keyword=xxx&offset=0
 */
router.get('/search', async (req, res) => {
    try {
        const { keyword, offset = '0' } = req.query;
        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ message: '请提供搜索关键词' });
        }
        const result = await music_api_1.default.searchSong(keyword, parseInt(offset));
        if (!result.status) {
            return res.status(500).json({ message: '搜索失败', error: result });
        }
        // 格式化搜索结果，统一返回格式
        const formattedResult = {
            netease: formatSearchResult(result.data?.netease),
            qq: formatSearchResult(result.data?.qq),
            xiami: formatSearchResult(result.data?.xiami),
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
 * vendor: netease | qq | xiami
 */
router.get('/search/:vendor', async (req, res) => {
    try {
        const { vendor } = req.params;
        const { keyword, offset = '0' } = req.query;
        if (!['netease', 'qq', 'xiami'].includes(vendor)) {
            return res.status(400).json({ message: '不支持的音乐平台' });
        }
        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ message: '请提供搜索关键词' });
        }
        const vendorApi = music_api_1.default[vendor];
        if (!vendorApi || !vendorApi.searchSong) {
            return res.status(400).json({ message: '该平台暂不支持搜索' });
        }
        const result = await vendorApi.searchSong({
            keyword,
            offset: parseInt(offset),
        });
        if (!result.status) {
            return res.status(500).json({ message: '搜索失败', error: result });
        }
        res.json({
            status: true,
            data: formatSearchResult(result.data),
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
        if (!['netease', 'qq', 'xiami'].includes(vendor)) {
            return res.status(400).json({ message: '不支持的音乐平台' });
        }
        const result = await music_api_1.default.getSongDetail(vendor, id);
        if (!result.status) {
            return res.status(500).json({ message: '获取歌曲详情失败', error: result });
        }
        res.json({
            status: true,
            data: result.data,
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
        if (!['netease', 'qq', 'xiami'].includes(vendor)) {
            return res.status(400).json({ message: '不支持的音乐平台' });
        }
        const result = await music_api_1.default.getBatchSongDetail(vendor, ids);
        if (!result.status) {
            return res.status(500).json({ message: '批量获取歌曲详情失败', error: result });
        }
        res.json({
            status: true,
            data: result.data,
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
        if (!['netease', 'qq', 'xiami'].includes(vendor)) {
            return res.status(400).json({ message: '不支持的音乐平台' });
        }
        const result = await music_api_1.default.getSongUrl(vendor, id);
        if (!result.status) {
            return res.status(500).json({ message: '获取歌曲地址失败', error: result });
        }
        res.json({
            status: true,
            data: {
                url: result.data?.url,
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
        if (!['netease', 'qq', 'xiami'].includes(vendor)) {
            return res.status(400).json({ message: '不支持的音乐平台' });
        }
        const result = await music_api_1.default.getLyric(vendor, id);
        if (!result.status) {
            return res.status(500).json({ message: '获取歌词失败', error: result });
        }
        res.json({
            status: true,
            data: {
                lyric: result.data,
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
        if (!['netease', 'qq', 'xiami'].includes(vendor)) {
            return res.status(400).json({ message: '不支持的音乐平台' });
        }
        const vendorApi = music_api_1.default[vendor];
        if (!vendorApi || !vendorApi.getArtistSongs) {
            return res.status(400).json({ message: '该平台暂不支持获取歌手单曲' });
        }
        const result = await vendorApi.getArtistSongs(id, parseInt(offset), parseInt(limit));
        if (!result.status) {
            return res.status(500).json({ message: '获取歌手单曲失败', error: result });
        }
        res.json({
            status: true,
            data: result.data,
        });
    }
    catch (error) {
        console.error('获取歌手单曲错误:', error);
        res.status(500).json({ message: '获取歌手单曲失败', error: error.message });
    }
});
/**
 * 格式化搜索结果
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
 * 格式化歌曲条目
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