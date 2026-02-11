"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireArtistOrAdmin = exports.requireAdmin = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
// 验证 JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: '令牌无效或已过期' });
    }
};
exports.authenticateToken = authenticateToken;
// 检查是否为管理员
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: '未认证' });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
// 检查是否为歌手或管理员
const requireArtistOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: '未认证' });
    }
    if (req.user.role !== 'ARTIST' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: '需要歌手或管理员权限' });
    }
    next();
};
exports.requireArtistOrAdmin = requireArtistOrAdmin;
//# sourceMappingURL=auth.js.map