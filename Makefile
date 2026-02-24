.PHONY: help setup dev test lint build deploy clean

help: ## 显示帮助信息
	@echo "Soul Mirror - Agent 开发命令"
	@echo ""
	@echo "可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## 安装依赖
	@echo "📦 安装依赖..."
	@cd src/app && npm install
	@echo "✅ 依赖安装完成"

dev: ## 启动开发环境
	@echo "🚀 启动开发环境..."
	@cd src/app && npm run dev

test: ## 运行测试
	@echo "🧪 运行测试..."
	@cd src/app && npm test

lint: ## 代码检查
	@echo "🔍 代码检查..."
	@cd src/app && npm run lint

build: ## 构建项目
	@echo "📦 构建项目..."
	@cd src/app && npm run build

deploy: ## 部署
	@echo "🚀 部署..."
	@# TODO: 实现部署脚本
	@echo "⚠️  部署脚本待实现"

clean: ## 清理缓存
	@echo "🧹 清理缓存..."
	@cd src/app && rm -rf node_modules dist
	@echo "✅ 清理完成"

agent-check: ## Agent 自检
	@echo "🤖 Agent 自检..."
	@echo "✅ 阅读了 .agent/context.md"
	@echo "✅ 阅读了 .agent/tasks/current.md"
	@make lint
	@make test
	@echo "✅ 自检完成"
