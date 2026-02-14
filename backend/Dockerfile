# 后端 Dockerfile - 简化版（使用预构建的 dist）
FROM node:18-slim

WORKDIR /app

# 安装必要工具
RUN apt-get update && apt-get install -y sqlite3 openssl && rm -rf /var/lib/apt/lists/*

# 复制 package.json
COPY package*.json ./
COPY prisma ./prisma/

# 安装生产依赖（使用 --legacy-peer-deps 提高稳定性）
RUN npm install --omit=dev --legacy-peer-deps || npm install --omit=dev

# 安装 ts-node 和 typescript（种子脚本需要）
RUN npm install ts-node typescript --legacy-peer-deps

# 生成 Prisma 客户端（必须在复制 dist 之前）
RUN npx prisma generate

# 复制预构建的文件和种子脚本
COPY dist ./dist
COPY scripts ./scripts

# 创建上传目录
RUN mkdir -p uploads/songs uploads/covers uploads/avatars

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed || true && node dist/index.js"]
