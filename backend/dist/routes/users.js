"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 获取当前用户信息
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 更新当前用户信息
router.put('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, avatar } = req.body;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                username,
                avatar
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('更新用户信息错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 修改密码
router.put('/me/password', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: '请提供当前密码和新密码' });
        }
        // 获取用户
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        // 验证当前密码
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ message: '当前密码错误' });
        }
        // 更新密码
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: '密码已更新' });
    }
    catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 获取收藏的歌曲
router.get('/me/favorites', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const favorites = await prisma_1.default.userFavorite.findMany({
            where: { userId },
            include: {
                song: {
                    include: {
                        artist: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const songs = favorites.map(f => f.song);
        res.json(songs);
    }
    catch (error) {
        console.error('获取收藏错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 添加收藏
router.post('/me/favorites', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { songId } = req.body;
        if (!songId) {
            return res.status(400).json({ message: '请提供歌曲ID' });
        }
        // 检查歌曲是否存在
        const song = await prisma_1.default.song.findUnique({
            where: { id: songId }
        });
        if (!song) {
            return res.status(404).json({ message: '歌曲不存在' });
        }
        const favorite = await prisma_1.default.userFavorite.create({
            data: {
                userId,
                songId
            }
        });
        res.status(201).json(favorite);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: '歌曲已在收藏中' });
        }
        console.error('添加收藏错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 取消收藏
router.delete('/me/favorites/:songId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const songId = parseInt(req.params.songId);
        await prisma_1.default.userFavorite.deleteMany({
            where: {
                userId,
                songId
            }
        });
        res.json({ message: '已取消收藏' });
    }
    catch (error) {
        console.error('取消收藏错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 管理员：获取所有用户
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
                _count: {
                    select: {
                        songs: true,
                        playlists: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 管理员：修改用户角色
router.put('/:id/role', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { role } = req.body;
        const validRoles = ['USER', 'ARTIST', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: '无效的角色' });
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: id },
            data: { role },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('修改用户角色错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 管理员：删除用户
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = id;
        // 不能删除自己
        if (userId === req.user.userId) {
            return res.status(400).json({ message: '不能删除自己' });
        }
        await prisma_1.default.user.delete({
            where: { id: userId }
        });
        res.json({ message: '用户已删除' });
    }
    catch (error) {
        console.error('删除用户错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map