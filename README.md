# 🎵 Local Music App

一个类似汽水音乐的 Web 音乐播放平台，支持用户注册/登录、播放音乐、创建/编辑歌单，以及基于角色的后台管理功能。

## ✨ 功能特性

### 用户端功能
- 🎧 音乐播放器 - 支持播放、暂停、切歌、进度控制
- 🔍 歌曲搜索 - 按标题搜索歌曲
- 📋 歌单管理 - 创建、编辑、删除歌单
- ❤️ 收藏功能 - 收藏喜欢的歌曲
- 🎨 现代化 UI - 使用 TailwindCSS 打造的精美界面
- 🌓 暗色/亮色主题切换 - 支持自动跟随系统主题

### 角色与权限系统
| 角色 | 权限 |
|------|------|
| **使用者 (USER)** | 访问用户端页面：听歌、创建歌单、收藏歌曲 |
| **歌手 (ARTIST)** | 用户端功能 + 歌手后台（管理自己的歌曲） |
| **管理员 (ADMIN)** | 所有功能 + 管理员后台（管理所有内容） |

### 后台管理功能
- **歌手后台**
  - 上传新歌曲
  - 管理自己的歌曲（编辑/删除）
  
- **管理员后台**
  - 管理所有用户的歌曲
  - 管理所有歌单
  - 用户管理（查看、修改角色、删除）

## 🛠️ 技术栈

### 前端
- React 19 + TypeScript
- React Router 7
- TailwindCSS 4
- Zustand（状态管理）
- Axios
- Heroicons

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite 数据库
- JWT 认证
- bcryptjs 密码加密

## 🚀 快速开始

### 方式一：Docker 一键部署（推荐）

确保已安装 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

#### 使用脚本部署

```bash
# 赋予执行权限并运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

#### 使用 Make 命令

```bash
# 一键部署（构建镜像 + 启动服务 + 预置数据）
make deploy
```

#### 手动部署

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 预置数据
docker-compose exec backend npx prisma db seed
```

访问应用：
- 前端页面：http://localhost
- 后端 API：http://localhost:3001

**常用命令：**
```bash
make build          # 构建镜像
make up             # 启动服务
make down           # 停止服务
make logs           # 查看所有日志
make logs-backend   # 查看后端日志
make logs-frontend  # 查看前端日志
make seed           # 重新预置数据
make deploy         # 完整部署
make help           # 查看所有命令
```

### 方式二：本地开发环境

### 预置数据（可选）

项目已预置了 65 首真实热门华语歌曲和 10 个精选歌单：

```bash
cd backend
npm run db:seed
```

**预置账号：**
| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `jay_chou` | `123456` | 歌手 | 周杰伦歌曲上传者 |
| `jj_lin` | `123456` | 歌手 | 林俊杰歌曲上传者 |
| `eason_chan` | `123456` | 歌手 | 陈奕迅歌曲上传者 |
| `music_lover` | `123456` | 用户 | 普通音乐爱好者 |

**预置歌曲（65首）：**
- 周杰伦：稻香、晴天、七里香、告白气球、青花瓷、听妈妈的话等
- 林俊杰：江南、曹操、修炼爱情、可惜没如果等
- 陈奕迅：十年、浮夸、K歌之王、爱情转移、孤勇者等
- 薛之谦：演员、丑八怪、绅士、认真的雪等
- 毛不易：消愁、像我这样的人、借、不染等
- 赵雷：成都、南方姑娘、理想、画等
- 民谣：南山南、董小姐、斑马斑马、安和桥等
- 女歌手：遇见、红豆、勇气、暖暖、匆匆那年等
- 其他热门：漠河舞厅、如愿、人世间、水星记、光年之外等

**预置歌单（10个）：**
- 🔥 抖音热歌榜2024
- 👑 周杰伦全集
- 💔 深夜emo时刻
- ✨ 林氏情歌
- 🎸 民谣小酒馆
- 🌸 女神之声
- 🎹 陈奕迅精选
- 📝 毛不易作品集
- 🎤 薛之谦金曲
- ❤️ 华语经典老歌

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd local_music_app
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **初始化数据库**
```bash
npm run db:migrate
```

4. **启动后端服务器**
```bash
npm run dev
```
后端服务将在 `http://localhost:3001` 启动

5. **安装前端依赖（新终端）**
```bash
cd frontend
npm install
```

6. **启动前端开发服务器**
```bash
npm run dev
```
前端将在 `http://localhost:5173` 启动

## 📁 项目结构

```
local_music_app/
├── backend/                    # 后端项目
│   ├── prisma/
│   │   └── schema.prisma       # 数据库模型
│   ├── src/
│   │   ├── middleware/         # 中间件（认证等）
│   │   ├── routes/             # API 路由
│   │   ├── utils/              # 工具函数
│   │   └── index.ts            # 入口文件
│   └── package.json
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── components/         # 组件
│   │   ├── pages/              # 页面
│   │   │   └── admin/          # 后台管理页面
│   │   ├── stores/             # Zustand 状态管理
│   │   ├── types/              # TypeScript 类型
│   │   └── utils/              # 工具函数
│   └── package.json
└── README.md
```

## 🔌 API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 歌曲
- `GET /api/songs` - 获取歌曲列表
- `GET /api/songs/:id` - 获取歌曲详情
- `POST /api/songs` - 创建歌曲（歌手/管理员）
- `PUT /api/songs/:id` - 更新歌曲
- `DELETE /api/songs/:id` - 删除歌曲
- `GET /api/songs/my/songs` - 获取我的歌曲（歌手）
- `GET /api/songs/admin/all` - 获取所有歌曲（管理员）

### 歌单
- `GET /api/playlists` - 获取歌单列表
- `GET /api/playlists/:id` - 获取歌单详情
- `POST /api/playlists` - 创建歌单
- `PUT /api/playlists/:id` - 更新歌单
- `DELETE /api/playlists/:id` - 删除歌单
- `POST /api/playlists/:id/songs` - 添加歌曲到歌单
- `DELETE /api/playlists/:id/songs/:songId` - 从歌单移除歌曲

### 用户
- `GET /api/users/me` - 获取当前用户
- `PUT /api/users/me` - 更新用户信息
- `GET /api/users/me/favorites` - 获取收藏
- `POST /api/users/me/favorites` - 添加收藏
- `DELETE /api/users/me/favorites/:songId` - 取消收藏
- `GET /api/users` - 获取所有用户（管理员）
- `PUT /api/users/:id/role` - 修改用户角色（管理员）

## 🎯 使用指南

### 1. 注册账号
访问 `http://localhost:5173/register`，可以选择注册为：
- **使用者** - 普通听歌用户
- **歌手** - 可以上传自己的音乐作品

### 2. 登录使用
使用注册的账号登录，进入首页浏览音乐。

### 3. 创建歌单
在"歌单"页面点击"创建歌单"按钮，填写信息后创建。

### 4. 歌手上传歌曲
- 注册时选择"歌手"角色，或联系管理员修改角色
- 登录后点击右上角"后台"进入歌手后台
- 点击"上传歌曲"添加作品

### 5. 管理员操作
- 管理员可以访问"后台管理"页面
- 管理所有歌曲、歌单和用户
- 可以修改用户角色

## 📝 默认账号

首次使用需要注册账号，可以注册不同类型的账号来体验不同角色。

## 🔒 安全说明

- 生产环境请修改 `backend/src/utils/jwt.ts` 中的 JWT_SECRET
- 使用 HTTPS 部署
- 定期更新依赖包

## 🐛 已知问题

- Node.js 版本警告（项目使用 Node 18，Vite 7 推荐 Node 20+，但不影响功能）

## 📄 许可证

MIT
