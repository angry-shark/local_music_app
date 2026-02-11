"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 获取所有歌曲（公开）
router.get('/', async (req, res) => {
    try {
        const { search, artistId } = req.query;
        const where = { isPublic: true };
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }
        if (artistId) {
            where.artistId = parseInt(artistId);
        }
        const songs = await prisma_1.default.song.findMany({
            where,
            include: {
                artist: {
                    select: { id: true, username: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(songs);
    }
    catch (error) {
        console.error('获取歌曲列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 获取单个歌曲
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const song = await prisma_1.default.song.findUnique({
            where: { id: id },
            include: {
                artist: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });
        if (!song) {
            return res.status(404).json({ message: '歌曲不存在' });
        }
        res.json(song);
    }
    catch (error) {
        console.error('获取歌曲错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 创建歌曲（需要歌手或管理员权限）
router.post('/', auth_1.authenticateToken, auth_1.requireArtistOrAdmin, async (req, res) => {
    try {
        const { title, audioUrl, coverUrl, duration, lyrics } = req.body;
        const userId = req.user.userId;
        if (!title || !audioUrl) {
            return res.status(400).json({ message: '请提供歌曲标题和音频地址' });
        }
        // 获取用户信息
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { username: true }
        });
        const song = await prisma_1.default.song.create({
            data: {
                title,
                artistId: userId,
                artistName: user.username,
                audioUrl,
                coverUrl,
                duration: duration || 0,
                lyrics
            },
            include: {
                artist: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });
        res.status(201).json(song);
    }
    catch (error) {
        console.error('创建歌曲错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 更新歌曲（歌手只能更新自己的歌曲）
router.put('/:id', auth_1.authenticateToken, auth_1.requireArtistOrAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, coverUrl, lyrics, isPublic } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;
        // 查找歌曲
        const existingSong = await prisma_1.default.song.findUnique({
            where: { id: id }
        });
        if (!existingSong) {
            return res.status(404).json({ message: '歌曲不存在' });
        }
        // 检查权限：非管理员只能修改自己的歌曲
        if (userRole !== 'ADMIN' && existingSong.artistId !== userId) {
            return res.status(403).json({ message: '无权修改此歌曲' });
        }
        const updatedSong = await prisma_1.default.song.update({
            where: { id: id },
            data: {
                title,
                coverUrl,
                lyrics,
                isPublic
            },
            include: {
                artist: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });
        res.json(updatedSong);
    }
    catch (error) {
        console.error('更新歌曲错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 删除歌曲（歌手只能删除自己的歌曲，管理员可以删除所有）
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.userId;
        const userRole = req.user.role;
        // 查找歌曲
        const existingSong = await prisma_1.default.song.findUnique({
            where: { id: id }
        });
        if (!existingSong) {
            return res.status(404).json({ message: '歌曲不存在' });
        }
        // 检查权限
        if (userRole !== 'ADMIN') {
            // 歌手只能删除自己的歌曲
            if (userRole === 'ARTIST' && existingSong.artistId !== userId) {
                return res.status(403).json({ message: '无权删除此歌曲' });
            }
            // 普通用户不能删除歌曲
            if (userRole === 'USER') {
                return res.status(403).json({ message: '无权删除歌曲' });
            }
        }
        await prisma_1.default.song.delete({
            where: { id: id }
        });
        res.json({ message: '歌曲已删除' });
    }
    catch (error) {
        console.error('删除歌曲错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 获取当前用户的歌曲（歌手后台）
router.get('/my/songs', auth_1.authenticateToken, auth_1.requireArtistOrAdmin, async (req, res) => {
    try {
        const userId = req.user.userId;
        const songs = await prisma_1.default.song.findMany({
            where: { artistId: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(songs);
    }
    catch (error) {
        console.error('获取我的歌曲错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 获取所有歌曲（管理员）
router.get('/admin/all', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const songs = await prisma_1.default.song.findMany({
            include: {
                artist: {
                    select: { id: true, username: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(songs);
    }
    catch (error) {
        console.error('获取所有歌曲错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
exports.default = router;
//# sourceMappingURL=songs.js.map