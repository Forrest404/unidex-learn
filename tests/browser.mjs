// A tiny headless Chrome driver for the page tests, over the DevTools protocol with Node's own WebSocket and fetch
// (no packages). It also serves the site with python3 -m http.server, so a test is one command:
//   node tests/pages.test.mjs
// CHROME can point at another Chrome; SHOTS=dir saves screenshots there.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitFor(fn, ms = 10000) {
  const end = Date.now() + ms;
  for (;;) {
    try { const v = await fn(); if (v) return v; } catch {}
    if (Date.now() > end) throw new Error('timed out');
    await sleep(100);
  }
}

export async function start() {
  const port = 8800 + Math.floor(Math.random() * 400), debug = port + 500;
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${debug}`, '--window-size=1280,900',
    ...(process.env.CI ? ['--no-sandbox'] : []),
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'learn-chrome-'))}`, 'about:blank'], { stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}/`;
  await waitFor(() => fetch(base).then(r => r.ok));
  const targets = await waitFor(async () => {
    const t = await (await fetch(`http://127.0.0.1:${debug}/json`)).json();
    return t.some(x => x.type === 'page') && t;
  });
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0;
  const waits = {}, listeners = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && waits[d.id]) { waits[d.id](d); delete waits[d.id]; }
    if (d.method) for (const l of listeners) l(d);
  };
  const send = (method, params = {}) => new Promise((r, j) => {
    waits[++id] = d => (d.error ? j(new Error(`${method}: ${d.error.message}`)) : r(d.result));
    ws.send(JSON.stringify({ id, method, params }));
  });
  const errors = [];
  listeners.push(d => {
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push(d.params.args.map(a => a.value ?? a.description).join(' '));
    // A compiler server turning a request away is handled by run.js (it tries the other one), so it isn't a fault
    if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error' && !/godbolt\.org|wandbox\.org/.test(d.params.entry.url || '')) {
      errors.push(`${d.params.entry.text} ${d.params.entry.url || ''}`);
    }
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

  const page = {
    base, errors, send,
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async goto(path) {
      const loaded = new Promise(r => listeners.push(function l(d) {
        if (d.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(l), 1); r(); }
      }));
      await send('Page.navigate', { url: base + path });
      await loaded;
      await sleep(300);
    },
    waitFor: (expr, ms) => waitFor(() => page.eval(expr), ms),
    async size(width, height, dark = false) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
      await sleep(400);  // let colour transitions finish before anything looks at the page
    },
    async shot(name) {
      if (!process.env.SHOTS) return;
      mkdirSync(process.env.SHOTS, { recursive: true });
      const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      writeFileSync(join(process.env.SHOTS, `${name}.png`), Buffer.from(data, 'base64'));
    },
    // Types into the focused element through the browser's own keyboard handling
    async type(text) {
      for (const ch of text) {
        if (ch === '\n') { await page.key('Enter'); continue; }
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch, text: ch });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch });
      }
    },
    async key(key, modifiers = 0) {
      const codes = { Enter: 13, Tab: 9, Backspace: 8 };
      const base = { key, code: key, windowsVirtualKeyCode: codes[key] || 0, modifiers };
      await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, text: key === 'Enter' && !modifiers ? '\r' : undefined });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
    },
    async close() {
      ws.close();
      chrome.kill();
      server.kill();
    },
  };
  return page;
}
