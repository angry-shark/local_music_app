#!/bin/bash

# Music App 重新部署脚本
# 用于代码更新后重新构建并部署服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "${BLUE}🔹 $1${NC}"
}

# 显示帮助信息
show_help() {
    cat << EOF
Music App 重新部署脚本

用法: ./redeploy.sh [选项]

选项:
    -h, --help          显示帮助信息
    -n, --no-cache      构建时不使用缓存（强制重新构建）
    -v, --volumes       同时删除数据卷（⚠️ 会清空数据库和上传文件）
    -s, --seed          部署后自动运行数据库种子
    --skip-build        跳过构建步骤，只重启容器

示例:
    ./redeploy.sh                   # 常规重新部署
    ./redeploy.sh -n                # 不使用缓存重新构建
    ./redeploy.sh -n -v             # 完全重置（包括数据）
    ./redeploy.sh --skip-build      # 快速重启（不重新构建）

EOF
}

# 解析参数
NO_CACHE=false
DELETE_VOLUMES=false
RUN_SEED=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--no-cache)
            NO_CACHE=true
            shift
            ;;
        -v|--volumes)
            DELETE_VOLUMES=true
            shift
            ;;
        -s|--seed)
            RUN_SEED=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    print_error "Docker 未安装"
    exit 1
fi

# 确定使用哪个 compose 命令
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    print_error "Docker Compose 未安装"
    exit 1
fi

print_info "使用命令: $COMPOSE_CMD"

# ==================== 停止服务 ====================
echo ""
print_step "步骤 1/5: 停止现有服务..."

if $DELETE_VOLUMES; then
    print_warning "将删除数据卷（数据库和上传文件将被清空）"
    $COMPOSE_CMD down -v
else
    $COMPOSE_CMD down
fi

print_success "服务已停止"

# ==================== 构建镜像 ====================
echo ""
if $SKIP_BUILD; then
    print_step "步骤 2/5: 跳过构建步骤"
else
    print_step "步骤 2/5: 构建 Docker 镜像..."
    
    if $NO_CACHE; then
        print_info "不使用缓存构建..."
        $COMPOSE_CMD build --no-cache
    else
        $COMPOSE_CMD build
    fi
    
    print_success "镜像构建完成"
fi

# ==================== 启动服务 ====================
echo ""
print_step "步骤 3/5: 启动服务..."
$COMPOSE_CMD up -d
print_success "服务已启动"

# ==================== 健康检查 ====================
echo ""
print_step "步骤 4/5: 等待服务就绪..."

# 等待后端服务健康检查
HEALTH_CHECK_URL="http://localhost:3001/api/health"
MAX_RETRIES=30
RETRY_INTERVAL=2
RETRY_COUNT=0

# 检查后端健康状态
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        print_success "后端服务已就绪"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -ne "\r  等待后端服务... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_warning "后端服务健康检查超时，但服务可能仍在启动中"
fi

# ==================== 数据库种子 ====================
echo ""
if $RUN_SEED; then
    print_step "步骤 5/5: 运行数据库种子..."
    sleep 2
    $COMPOSE_CMD exec -T backend npx prisma db seed || print_warning "种子执行失败，数据可能已存在"
else
    print_step "步骤 5/5: 跳过数据库种子（使用 -s 参数可自动运行）"
fi

# ==================== 完成 ====================
echo ""
echo "=========================================="
print_success "重新部署完成！"
echo "=========================================="
echo ""
print_info "访问地址:"
echo "  🌐 前端页面: http://localhost"
echo "  🔌 后端 API: http://localhost:3001"
echo ""
print_info "演示账号:"
echo "  歌手: jay_chou / 123456"
echo "  用户: music_lover / 123456"
echo ""
print_info "常用命令:"
echo "  查看日志:    $COMPOSE_CMD logs -f"
echo "  停止服务:    $COMPOSE_CMD down"
echo "  运行种子:    $COMPOSE_CMD exec backend npx prisma db seed"
echo "=========================================="
