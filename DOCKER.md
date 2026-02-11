# 🐳 Docker 部署指南

本文档介绍如何使用 Docker 部署 Music App。

## 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [部署方式](#部署方式)
- [常用命令](#常用命令)
- [配置说明](#配置说明)
- [故障排查](#故障排查)

## 环境要求

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+
- 内存：建议 2GB+
- 磁盘空间：建议 5GB+

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd local_music_app
```

### 2. 一键部署

```bash
# 使用部署脚本
chmod +x deploy.sh
./deploy.sh
```

或

```bash
# 使用 Make
make deploy
```

### 3. 访问应用

- 前端页面：http://localhost
- 后端 API：http://localhost:3001

## 部署方式

### 方式一：脚本部署（推荐）

```bash
./deploy.sh
```

脚本会自动完成：
- 检查 Docker 环境
- 构建前后端镜像
- 启动服务
- 预置歌曲数据

### 方式二：Make 命令

```bash
# 构建并部署
make deploy

# 查看帮助
make help
```

### 方式三：手动部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 预置数据
docker-compose exec backend npx prisma db seed
```

## 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v

# 重启服务
docker-compose restart

# 查看运行状态
docker-compose ps
```

### 日志查看

```bash
# 查看所有日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f frontend
```

### 数据管理

```bash
# 预置/重置数据
docker-compose exec backend npx prisma db seed

# 打开数据库管理界面
docker-compose exec backend npx prisma studio

# 进入后端容器
docker-compose exec backend sh

# 进入前端容器
docker-compose exec frontend sh
```

## 配置说明

### 服务架构

```
┌─────────────────────────────────────────────────────────────┐
│                         宿主机                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Docker Compose Network                   │  │
│  │                                                       │  │
│  │   ┌──────────────┐          ┌──────────────────┐     │  │
│  │   │   Nginx      │          │   Node.js        │     │  │
│  │   │   (前端)     │◄────────►│   (后端)         │     │  │
│  │   │   Port: 80   │   /api   │   Port: 3001     │     │  │
│  │   └──────────────┘          └────────┬─────────┘     │  │
│  │          ▲                            │              │  │
│  │          │                            ▼              │  │
│  │          │                   ┌──────────────────┐     │  │
│  │          │                   │   SQLite         │     │  │
│  │          │                   │   (数据库)        │     │  │
│  │          │                   └──────────────────┘     │  │
│  │          │                                             │  │
│  └──────────┼─────────────────────────────────────────────┘  │
│             │                                               │
│       http://localhost                                      │
└─────────────────────────────────────────────────────────────┘
```

### 环境变量

创建 `.env` 文件来自定义配置：

```bash
# JWT 密钥（生产环境请务必修改）
JWT_SECRET=your-super-secret-key

# 端口映射
FRONTEND_PORT=80
BACKEND_PORT=3001
```

### 数据持久化

以下数据会持久化到宿主机：

| 路径 | 说明 |
|------|------|
| `./backend/prisma/dev.db` | SQLite 数据库文件 |
| `./backend/uploads/` | 上传的音频/封面文件 |

### 网络配置

- **前端**：Nginx 容器，端口 80
- **后端**：Node.js 容器，端口 3001
- **代理**：前端 Nginx 将 `/api` 请求代理到后端

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
lsof -i :80
lsof -i :3001

# 重启服务
docker-compose restart
```

### 数据库问题

```bash
# 重置数据库（数据会丢失）
docker-compose down -v
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

### 前端无法连接后端

检查前端是否正确代理 API 请求：

```bash
# 进入前端容器
docker-compose exec frontend sh

# 测试后端连通性
wget -qO- http://backend:3001/api/health
```

### 镜像构建失败

```bash
# 清理构建缓存
docker-compose build --no-cache

# 清理所有未使用数据
docker system prune -a
```

## 生产环境部署

### 使用 HTTPS

建议使用反向代理（如 Nginx Proxy Manager、Traefik）来处理 HTTPS。

### 环境变量配置

生产环境务必修改以下配置：

1. **JWT 密钥**：使用强随机字符串
2. **数据库**：建议使用 PostgreSQL 或 MySQL 替代 SQLite
3. **文件存储**：使用云存储服务（如 AWS S3、阿里云 OSS）

### 备份策略

```bash
# 备份数据库
cp backend/prisma/dev.db backup/db-$(date +%Y%m%d).db

# 备份上传文件
tar -czf backup/uploads-$(date +%Y%m%d).tar.gz backend/uploads/
```

## 性能优化

### 启用 Gzip

前端 Nginx 已默认启用 Gzip 压缩。

### 静态资源缓存

```nginx
# 已在 nginx.conf 中配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 数据库优化

大量数据时建议：
1. 使用 PostgreSQL 替代 SQLite
2. 添加 Redis 缓存
3. 使用连接池

## 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并部署
make deploy

# 或者
./deploy.sh
```

## 卸载

```bash
# 停止并删除容器
docker-compose down

# 删除数据卷（会丢失所有数据）
docker-compose down -v

# 删除镜像
docker rmi local_music_app-backend local_music_app-frontend
```

## 支持的架构

- `linux/amd64` (x86_64)
- `linux/arm64` (Apple Silicon, Raspberry Pi)

---

有问题？请提交 [Issue](https://github.com/your-repo/issues)。
