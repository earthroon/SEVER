const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/crawl', async (req, res) => {
  const url = req.body.url;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(3000);
    const ids = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/products/"]'))
        .map(a => a.href.match(/products\/(\d{11})/))
        .filter(Boolean)
        .map(m => m[1]);
    });
    await browser.close();
    const unique = Array.from(new Set(ids));
    res.json({ count: unique.length, data: unique });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '크롤링 실패', detail: e.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`서버 실행: http://localhost:${port}`));
