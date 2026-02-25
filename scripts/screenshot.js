const puppeteer = require('puppeteer-core');

// 心镜应用截图脚本
// 使用: node scripts/screenshot.js [url] [output]

const DEFAULT_URL = 'http://localhost:8081'; // Expo web 默认端口
const DEFAULT_OUTPUT = './screenshots/soul-mirror.png';

async function captureScreenshot(url = DEFAULT_URL, outputPath = DEFAULT_OUTPUT) {
  console.log(`🚀 启动无头浏览器...`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=390,844', // iPhone 12 Pro 尺寸
    ],
  });

  try {
    const page = await browser.newPage();
    
    // 设置移动端视口
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    // 设置 User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    );

    console.log(`📱 访问应用: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // 等待应用加载完成
    console.log('⏳ 等待应用渲染...');
    await page.waitForTimeout(3000);

    // 截图
    console.log(`📸 截图保存至: ${outputPath}`);
    
    await page.screenshot({
      path: outputPath,
      fullPage: false,
    });

    console.log('✅ 截图完成!');
    
  } catch (error) {
    console.error('❌ 截图失败:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// 主函数
async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  const output = process.argv[3] || DEFAULT_OUTPUT;
  
  // 确保输出目录存在
  const fs = require('fs');
  const path = require('path');
  const outputDir = path.dirname(output);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  await captureScreenshot(url, output);
}

main();
