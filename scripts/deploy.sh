#!/bin/bash
# Soul Mirror 网站部署脚本

set -e

PROJECT_DIR="/root/.openclaw/workspace/soul-mirror"
DEPLOY_DIR="/var/www/soul-mirror"
DOMAIN="xswl.icu"

echo "🚀 开始部署 Soul Mirror..."

# 检查 dist 文件夹是否存在
if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo "❌ 错误: dist 文件夹不存在，请先运行构建命令"
    exit 1
fi

# 创建部署目录
sudo mkdir -p $DEPLOY_DIR

# 复制文件
echo "📦 复制构建文件..."
sudo cp -r $PROJECT_DIR/dist/* $DEPLOY_DIR/
sudo chown -R www-data:www-data $DEPLOY_DIR

echo "✅ 部署完成！"
echo "🌐 网站地址: http://$DOMAIN"
