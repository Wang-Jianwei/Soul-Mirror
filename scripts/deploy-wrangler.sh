#!/bin/bash
# 使用 Wrangler 部署 Cloudflare Pages

set -e

export CLOUDFLARE_API_TOKEN="i0JDf1LfX4n2V06zc5NBxtYjGIFDplDr8uwqJ5NR"

PROJECT_NAME="soul-mirror"
DIST_DIR="/root/.openclaw/workspace/soul-mirror/dist"

echo "🚀 部署到 Cloudflare Pages..."

# 使用 npx 运行 wrangler
npx wrangler pages deploy "$DIST_DIR" \
  --project-name="$PROJECT_NAME" \
  --branch="main" \
  --commit-dirty=true

echo "✅ 部署完成!"
