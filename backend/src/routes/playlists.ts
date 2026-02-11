import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// 获取公开歌单
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const where: any = { isPublic: true };
    
    if (userId) {
      where.userId = parseInt(userId as string);
    }

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { songs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(playlists);
  } catch (error) {
    console.error('获取歌单列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个歌单详情
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const playlist = await prisma.playlist.findUnique({
      where: { id: id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        songs: {
          include: {
            song: {
              include: {
                artist: {
                  select: { id: true, username: true, avatar: true }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!playlist) {
      return res.status(404).json({ message: '歌单不存在' });
    }

    // 格式化返回数据
    const formattedPlaylist = {
      ...playlist,
      songs: playlist.songs.map(ps => ps.song)
    };

    res.json(formattedPlaylist);
  } catch (error) {
    console.error('获取歌单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建歌单（需要登录）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, coverUrl, isPublic = true } = req.body;
    const userId = req.user!.userId;

    if (!name) {
      return res.status(400).json({ message: '请提供歌单名称' });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        coverUrl,
        userId,
        isPublic
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { songs: true }
        }
      }
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error('创建歌单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新歌单（只能修改自己的歌单）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, description, coverUrl, isPublic } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // 查找歌单
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id: id }
    });

    if (!existingPlaylist) {
      return res.status(404).json({ message: '歌单不存在' });
    }

    // 检查权限
    if (userRole !== 'ADMIN' && existingPlaylist.userId !== userId) {
      return res.status(403).json({ message: '无权修改此歌单' });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: id },
      data: {
        name,
        description,
        coverUrl,
        isPublic
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { songs: true }
        }
      }
    });

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('更新歌单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除歌单
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // 查找歌单
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id: id }
    });

    if (!existingPlaylist) {
      return res.status(404).json({ message: '歌单不存在' });
    }

    // 检查权限
    if (userRole !== 'ADMIN' && existingPlaylist.userId !== userId) {
      return res.status(403).json({ message: '无权删除此歌单' });
    }

    await prisma.playlist.delete({
      where: { id: id }
    });

    res.json({ message: '歌单已删除' });
  } catch (error) {
    console.error('删除歌单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加歌曲到歌单
router.post('/:id/songs', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { songId } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // 查找歌单
    const playlist = await prisma.playlist.findUnique({
      where: { id: id }
    });

    if (!playlist) {
      return res.status(404).json({ message: '歌单不存在' });
    }

    // 检查权限
    if (userRole !== 'ADMIN' && playlist.userId !== userId) {
      return res.status(403).json({ message: '无权修改此歌单' });
    }

    // 检查歌曲是否存在
    const song = await prisma.song.findUnique({
      where: { id: songId }
    });

    if (!song) {
      return res.status(404).json({ message: '歌曲不存在' });
    }

    // 获取当前最大 order
    const maxOrder = await prisma.playlistSong.aggregate({
      where: { playlistId: id },
      _max: { order: true }
    });

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: id,
        songId,
        order: (maxOrder._max.order || 0) + 1
      }
    });

    res.status(201).json(playlistSong);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: '歌曲已在歌单中' });
    }
    console.error('添加歌曲到歌单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 从歌单移除歌曲
router.delete('/:id/songs/:songId', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const songId = parseInt(req.params.songId as string);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // 查找歌单
    const playlist = await prisma.playlist.findUnique({
      where: { id: id }
    });

    if (!playlist) {
      return res.status(404).json({ message: '歌单不存在' });
    }

    // 检查权限
    if (userRole !== 'ADMIN' && playlist.userId !== userId) {
      return res.status(403).json({ message: '无权修改此歌单' });
    }

    await prisma.playlistSong.deleteMany({
      where: {
        playlistId: id,
        songId: songId
      }
    });

    res.json({ message: '歌曲已从歌单移除' });
  } catch (error) {
    console.error('从歌单移除歌曲错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取我的歌单
router.get('/user/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(playlists);
  } catch (error) {
    console.error('获取我的歌单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有歌单（管理员）
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        _count: {
          select: { songs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(playlists);
  } catch (error) {
    console.error('获取所有歌单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
