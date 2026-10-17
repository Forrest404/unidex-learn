// Renders tools/og.html to og.png (1200 x 630) in headless Chrome: node tools/make-og.mjs
import { writeFileSync } from 'node:fs';
import { start } from '../tests/browser.mjs';

const page = await start();
await page.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
await page.goto('tools/og.html');
await page.waitFor(`document.body.dataset.ready && document.fonts.status === 'loaded'`);
const { data } = await page.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
writeFileSync(new URL('../og.png', import.meta.url), Buffer.from(data, 'base64'));
await page.close();
console.log('og.png written');
