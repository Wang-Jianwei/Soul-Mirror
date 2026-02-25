# 心镜截图指南

## 方法一：Puppeteer 截图（推荐）

### 1. 启动 Expo Web 模式

```bash
cd soul-mirror
npx expo start --web
```

等待显示:
```
Web is waiting on http://localhost:8081
```

### 2. 运行截图脚本

```bash
# 默认截图
node scripts/screenshot.js

# 指定 URL 和输出路径
node scripts/screenshot.js http://localhost:8081 ./screenshots/home.png
```

### 3. 查看截图

截图保存在 `./screenshots/soul-mirror.png`

---

## 方法二：手动截图

### 1. 启动应用

```bash
npm start
```

### 2. 用浏览器打开

在浏览器中访问 `http://localhost:8081`

### 3. 开发者工具截图

- 按 F12 打开开发者工具
- 按 Ctrl+Shift+P (Cmd+Shift+P on Mac)
- 输入 "screenshot"
- 选择 "Capture full size screenshot"

---

## 方法三：多页面截图

创建批量截图脚本:

```javascript
// scripts/screenshot-all.js
const puppeteer = require('puppeteer');

const pages = [
  { name: 'today', url: 'http://localhost:8081' },
  { name: 'thoughts', url: 'http://localhost:8081/thoughts' },
  { name: 'profile', url: 'http://localhost:8081/profile' },
];

async function captureAll() {
  for (const page of pages) {
    console.log(`截图: ${page.name}`);
    // ... 截图逻辑
  }
}
```

---

## 注意事项

1. **确保 Expo Web 已启动** — 截图前必须先运行 `npx expo start --web`
2. **等待渲染完成** — 脚本已设置 3 秒等待时间
3. **移动端尺寸** — 默认使用 iPhone 12 Pro 尺寸 (390x844)

---

*此心光明，亦复何言。*
