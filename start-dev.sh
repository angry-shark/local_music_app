#!/bin/bash

# 本地开发启动脚本
# 同时启动前后端服务

echo "🎵 Local Music App - 本地开发启动脚本"
echo "========================================"

# 检查后端依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend && npm install
    cd ..
fi

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend && npm install
    cd ..
fi

# 启动后端（后台运行）
echo "🚀 启动后端服务 (http://localhost:3001)..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端
echo "🚀 启动前端服务 (http://localhost:5173)..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "✅ 服务已启动！"
echo "🌐 前端页面: http://localhost:5173"
echo "🔌 后端 API: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "========================================"

# 等待用户中断
trap "echo ''; echo '⛔ 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
