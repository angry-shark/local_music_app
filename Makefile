# Music App Docker 管理命令

.PHONY: build up down restart logs shell clean seed

# 构建所有镜像
build:
	docker-compose build

# 启动所有服务（后台运行）
up:
	docker-compose up -d

# 停止所有服务
down:
	docker-compose down

# 停止并删除所有数据（包括卷）
down-v:
	docker-compose down -v

# 重启所有服务
restart:
	docker-compose restart

# 查看日志
logs:
	docker-compose logs -f

# 查看后端日志
logs-backend:
	docker-compose logs -f backend

# 查看前端日志
logs-frontend:
	docker-compose logs -f frontend

# 进入后端容器 shell
shell-backend:
	docker-compose exec backend sh

# 进入前端容器 shell
shell-frontend:
	docker-compose exec frontend sh

# 运行数据库种子
seed:
	docker-compose exec backend npx prisma db seed

# 查看数据库
studio:
	docker-compose exec backend npx prisma studio

# 清理所有未使用的 Docker 数据
clean:
	docker system prune -f
	docker volume prune -f

# 重新构建并启动
rebuild: down build up

# 显示状态
status:
	docker-compose ps

# 一键部署（构建 + 启动 + 种子数据）
deploy: build up
	@echo "等待服务启动..."
	@sleep 5
	@echo "预置数据..."
	@docker-compose exec -T backend npx prisma db seed || true
	@echo ""
	@echo "✅ 部署完成！"
	@echo "前端访问: http://localhost"
	@echo "后端 API: http://localhost:3001"
	@echo ""
	@echo "演示账号:"
	@echo "  jay_chou / 123456 (歌手)"
	@echo "  jj_lin / 123456 (歌手)"
	@echo "  eason_chan / 123456 (歌手)"
	@echo "  music_lover / 123456 (用户)"

# 帮助信息
help:
	@echo "Music App Docker 管理命令"
	@echo ""
	@echo "用法: make [命令]"
	@echo ""
	@echo "命令:"
	@echo "  build          构建所有 Docker 镜像"
	@echo "  up             启动所有服务（后台运行）"
	@echo "  down           停止所有服务"
	@echo "  restart        重启所有服务"
	@echo "  logs           查看所有服务日志"
	@echo "  logs-backend   查看后端日志"
	@echo "  logs-frontend  查看前端日志"
	@echo "  seed           运行数据库种子，预置歌曲数据"
	@echo "  studio         打开 Prisma Studio 数据库管理"
	@echo "  deploy         一键部署（构建+启动+种子数据）"
	@echo "  clean          清理未使用的 Docker 数据"
	@echo "  help           显示帮助信息"
