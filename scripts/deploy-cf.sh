#!/bin/bash
# Cloudflare Pages 部署脚本

set -e

CF_TOKEN="lWCoH6KDl-jNh0FBdgbNpZiFEdFe04ag4hqL-eIR"
PROJECT_NAME="soul-mirror"
DIST_DIR="/root/.openclaw/workspace/soul-mirror/dist"

echo "🚀 开始部署到 Cloudflare Pages..."

# 1. 创建 Pages 项目
echo "📦 创建项目..."
CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/@me/pages/projects" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"production_branch\": \"main\"
  }")

echo "创建响应: $CREATE_RESPONSE"

# 2. 打包文件
echo "📁 打包文件..."
cd "$DIST_DIR"
tar -czf /tmp/deploy.tar.gz .

# 3. 上传部署
echo "⬆️ 上传文件..."
UPLOAD_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/@me/pages/projects/$PROJECT_NAME/deployments" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -F "file=@/tmp/deploy.tar.gz")

echo "上传响应: $UPLOAD_RESPONSE"

echo "✅ 部署完成！"
