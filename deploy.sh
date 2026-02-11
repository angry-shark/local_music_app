#!/bin/bash

# Music App Docker 部署脚本

set -e

echo "🚀 开始部署 Music App..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请访问 https://docs.docker.com/get-docker/ 安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    echo "请访问 https://docs.docker.com/compose/install/ 安装 Docker Compose"
    exit 1
fi

# 确定使用哪个 compose 命令
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

echo "📦 使用命令: $COMPOSE_CMD"

# 构建镜像
echo ""
echo "🔨 构建 Docker 镜像..."
$COMPOSE_CMD build

# 启动服务
echo ""
echo "🚀 启动服务..."
$COMPOSE_CMD up -d

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查后端是否健康
echo ""
echo "🏥 检查后端服务健康状态..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ 后端服务已就绪"
        break
    fi
    echo "  等待后端服务... ($i/30)"
    sleep 2
done

# 预置数据
echo ""
echo "🌱 预置歌曲数据..."
$COMPOSE_CMD exec -T backend npx prisma db seed || echo "⚠️ 数据可能已存在"

echo ""
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo ""
echo "🌐 访问地址:"
echo "  前端页面: http://localhost"
echo "  后端 API: http://localhost:3001"
echo ""
echo "👤 演示账号:"
echo "  歌手账号:"
echo "    - jay_chou   / 123456"
echo "    - jj_lin     / 123456"
echo "    - eason_chan / 123456"
echo "  普通用户:"
echo "    - music_lover / 123456"
echo ""
echo "📝 常用命令:"
echo "  查看日志:    $COMPOSE_CMD logs -f"
echo "  停止服务:    $COMPOSE_CMD down"
echo "  重启服务:    $COMPOSE_CMD restart"
echo "  重新预置数据: $COMPOSE_CMD exec backend npx prisma db seed"
echo "=========================================="
