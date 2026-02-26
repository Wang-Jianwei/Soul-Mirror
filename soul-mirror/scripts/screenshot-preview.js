const puppeteer = require('puppeteer-core');

async function capturePreview() {
  console.log('🚀 启动无头浏览器...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 430,
      height: 900,
      deviceScaleFactor: 2,
    });

    const filePath = 'file://' + __dirname + '/../preview.html';
    console.log('📱 加载预览页面...');
    
    await page.goto(filePath, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const outputPath = './screenshots/soul-mirror-v0.1.png';
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

capturePreview();
