# AGENTS.md - Local Music App

> 本项目是一个完整的音乐播放 Web 应用，具有用户端和后台管理功能。

## 项目状态

**状态:** ✅ 已完成基础功能开发

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + TailwindCSS 4 + React Router 7 |
| 后端 | Node.js + Express + Prisma ORM + SQLite |
| 状态管理 | Zustand |
| 认证 | JWT |

## 项目结构

```
local_music_app/
├── backend/          # 后端 API 服务
│   ├── src/
│   │   ├── routes/   # API 路由 (auth, songs, playlists, users, external-songs)
│   │   ├── middleware/  # 认证中间件
│   │   └── utils/    # 工具函数
│   └── prisma/       # 数据库模型
├── frontend/         # 前端 React 应用
│   └── src/
│       ├── pages/    # 页面组件 (含 ExternalSearch.tsx)
│       ├── components/  # 可复用组件
│       └── stores/   # Zustand 状态管理
├── start-dev.sh      # 本地开发启动脚本
└── README.md
```

## 启动命令

### Docker 部署（推荐）

```bash
# 一键部署
make deploy

# 或使用脚本
./deploy.sh
```

### 服务架构

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   frontend  │──────▶│   backend   │──────▶│qq-music-api │
│   (nginx)   │      │  (express)  │      │  (QQ音乐API) │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   SQLite    │
                     └─────────────┘
```

- **frontend**: 前端服务 (端口 80)
- **backend**: 后端 API 服务 (端口 3001)
- **qq-music-api**: QQ 音乐 API 服务 (端口 3300)
- **SQLite**: 本地数据库

### 本地开发

#### 快速启动

```bash
# 使用脚本同时启动前后端
./start-dev.sh
```

或分别启动：

```bash
# 终端 1：启动后端（端口 3001）
cd backend && npm run dev

# 终端 2：启动前端（端口 5173，已配置代理）
cd frontend && npm run dev
```

访问地址：
- 前端页面：http://localhost:5173
- 后端 API：http://localhost:3001

#### 开发配置

- **前端代理**：Vite 配置已添加代理，开发时 `/api` 请求自动转发到后端
- **环境变量**：
  - `frontend/.env.development` - 开发环境（使用相对路径）
  - `frontend/.env.production` - 生产环境

```bash
# 预置示例数据（可选）
cd backend && npm run db:seed
```

## 功能特性

- ✅ 用户注册/登录（JWT 认证）
- ✅ 角色系统：使用者、歌手、管理员
- ✅ 音乐播放器（播放、暂停、切歌、进度控制）
- ✅ 歌单管理（创建、编辑、删除）
- ✅ 歌曲搜索（本地 + 外部音乐源）
- ✅ 外部音乐搜索（网易云、QQ音乐、虾米音乐）
- ✅ 收藏功能
- ✅ 歌手后台（管理自己的歌曲）
- ✅ 管理员后台（管理所有内容）

## API 端点

- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/songs` - 歌曲列表
- `GET /api/playlists` - 歌单列表
- 更多见 README.md

## 外部音乐搜索

外部歌曲搜索通过 `@suen/music-api` npm 包实现，支持多平台音乐搜索。

### 支持平台

- **网易云音乐** (`netease`)
- **QQ音乐** (`qq`)
- **虾米音乐** (`xiami`)

### 后端 API 端点

- `GET /api/external-songs/search?keyword=xxx&offset=0` - 聚合搜索（全平台）
- `GET /api/external-songs/search/:vendor` - 指定平台搜索
- `GET /api/external-songs/detail?vendor=xxx&id=xxx` - 获取歌曲详情
- `POST /api/external-songs/batch-detail` - 批量获取歌曲详情
- `GET /api/external-songs/url?vendor=xxx&id=xxx` - 获取歌曲播放地址
- `GET /api/external-songs/lyric?vendor=xxx&id=xxx` - 获取歌词
- `GET /api/external-songs/artist/:vendor/:id` - 获取歌手单曲

### 前端页面

- 路径：`/external-search`
- 功能：搜索、播放外部音乐资源

---
*Last updated: 2026-02-14*
