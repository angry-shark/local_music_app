# 后端 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# 复制源代码并构建
COPY . .
RUN npm run build

# 生产环境
FROM node:18-alpine

WORKDIR /app

# 安装必要工具
RUN apk add --no-cache sqlite

# 复制 package.json
COPY package*.json ./
COPY prisma ./prisma/

# 只安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制构建文件
COPY --from=builder /app/dist ./dist

# 创建上传目录
RUN mkdir -p uploads/songs uploads/covers uploads/avatars

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed || true && node dist/index.js"]
