import requests
import json
import os
import tarfile
import io

CF_TOKEN = "lWCoH6KDl-jNh0FBdgbNpZiFEdFe04ag4hqL-eIR"
PROJECT_NAME = "soul-mirror"
DIST_DIR = "/root/.openclaw/workspace/soul-mirror/dist"

def cf_api(method, endpoint, data=None, files=None):
    url = f"https://api.cloudflare.com/client/v4{endpoint}"
    headers = {
        "Authorization": f"Bearer {CF_TOKEN}"
    }
    if data and not files:
        headers["Content-Type"] = "application/json"
    
    if method == "GET":
        resp = requests.get(url, headers=headers)
    elif method == "POST":
        if files:
            resp = requests.post(url, headers=headers, files=files)
        else:
            resp = requests.post(url, headers=headers, json=data)
    
    return resp.json()

# 1. 尝试创建项目
print("🚀 创建 Cloudflare Pages 项目...")
result = cf_api("POST", "/accounts/@me/pages/projects", {
    "name": PROJECT_NAME,
    "production_branch": "main"
})
print(json.dumps(result, indent=2))

if result.get("success") or "already exists" in str(result.get("errors", [])):
    print(f"✅ 项目 {PROJECT_NAME} 准备就绪")
else:
    print(f"❌ 创建失败: {result.get('errors')}")
    exit(1)

# 2. 打包文件
print("📦 打包文件...")
tar_buffer = io.BytesIO()
with tarfile.open(fileobj=tar_buffer, mode="w:gz") as tar:
    tar.add(DIST_DIR, arcname=".")
tar_buffer.seek(0)

# 3. 上传部署
print("⬆️ 上传部署...")
files = {"file": ("deploy.tar.gz", tar_buffer, "application/gzip")}
result = cf_api("POST", f"/accounts/@me/pages/projects/{PROJECT_NAME}/deployments", files=files)
print(json.dumps(result, indent=2))

if result.get("success"):
    print(f"✅ 部署成功!")
    if result.get("result", {}).get("url"):
        print(f"🌐 访问地址: {result['result']['url']}")
else:
    print(f"❌ 部署失败: {result.get('errors')}")
