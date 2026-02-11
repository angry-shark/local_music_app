"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role = 'USER' } = req.body;
        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({ message: '请填写所有必填字段' });
        }
        // 检查用户名是否已存在
        const existingUser = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: '用户名或邮箱已存在' });
        }
        // 验证角色
        const validRoles = ['USER', 'ARTIST', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: '无效的角色类型' });
        }
        // 加密密码
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // 创建用户
        const user = await prisma_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role
            }
        });
        // 生成 JWT
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            username: user.username,
            role: user.role
        });
        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    }
    catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: '请填写用户名和密码' });
        }
        // 查找用户
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ username }, { email: username }]
            }
        });
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        // 验证密码
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        // 生成 JWT
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            username: user.username,
            role: user.role
        });
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    }
    catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map