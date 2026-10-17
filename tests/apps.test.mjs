// The app course in a real (headless) Chrome, on the virtual unidex loaded from tools.unidex.shop:
//   node --test tests/apps.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start } from './browser.mjs';

let page;
before(async () => { page = await start(); });
after(() => page.close());

const out = `document.getElementById('app-output')`;
const idle = () => page.waitFor(`!document.getElementById('app-run').disabled && ${out}.textContent && !/^(Starting|Putting)/.test(${out}.textContent)`, 60000);
// How much of the screen is ink: a blank or missing screen is 0
const ink = () => page.eval(`(() => { const d = document.getElementById('screen').getContext('2d').getImageData(0, 0, 200, 200).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 100) n++; return n; })()`);

test('app workspace: an example and your app run on the virtual unidex', async () => {
  await page.size(1280, 900);
  await page.goto('lesson.html?c=apps&l=1');
  await page.eval(`localStorage.clear()`);
  await page.goto('lesson.html?c=apps&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  assert.equal(await page.eval(`document.getElementById('cpp-ws').hidden`), true);
  assert.equal(await page.eval(`document.querySelector('#app-code textarea').value.includes('Hi there!')`), true);
  assert.equal(await page.eval(`document.querySelector('#app-code .tk-type').textContent`), 'unidex');

  // The example
  await page.eval(`document.querySelector('.example button').click()`);
  await idle();
  assert.match(await page.eval(`${out}.textContent`), /Example is running/);
  const exampleInk = await ink();
  assert.ok(exampleInk > 300, `the screen shows something (${exampleInk} dark pixels)`);

  // Your app, changed
  const ta = `document.querySelector('#app-code textarea')`;
  await page.eval(`${ta}.value = ${ta}.value.replace('Hi there!', 'Changed it'); ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('app-run').click()`);
  await idle();
  assert.match(await page.eval(`${out}.textContent`), /Water is running/);
  assert.notEqual(await ink(), exampleInk, 'the screen changed to your app');
  assert.equal(await page.eval(`document.activeElement.classList.contains('device')`), true, 'focus is on the unidex, so A and B work');
  await page.shot('app-desktop');
  assert.deepEqual(page.errors, []);
});

test('app workspace: errors point at the line, in main.lua and in app.json', async () => {
  const ta = `document.querySelector('#app-code textarea')`;
  await page.eval(`${ta}.value = 'function draw()\\n  unidex.header("Water")\\n  unidex.centered(100, nothing.here)\\nend\\n'; ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('app-run').click()`);
  await idle();
  assert.match(await page.eval(`${out}.textContent`), /main\.lua:3: attempt to index a nil value/);
  assert.equal(await page.eval(`document.querySelector('#app-code .gutter .err').textContent`), '3');
  await page.eval(`${out}.querySelector('button').click()`);
  assert.equal(await page.eval(`${ta}.value.slice(${ta}.selectionStart, ${ta}.selectionEnd)`), '  unidex.centered(100, nothing.here)');

  // A mistake in app.json
  await page.eval(`document.getElementById('tab-json').click()`);
  assert.match(await page.eval(`${ta}.value`), /"id": "water"/);
  await page.eval(`${ta}.value = ${ta}.value.replace('"name": "Water",', '"name": "Water"'); ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('tab-main').click()`);
  await page.eval(`document.getElementById('app-run').click()`);
  await page.waitFor(`${out}.textContent.includes('app.json')`, 10000);
  assert.match(await page.eval(`${out}.textContent`), /^app\.json:4: this isn't valid JSON/);
  await page.eval(`${out}.querySelector('button').click()`);
  assert.equal(await page.eval(`document.getElementById('tab-json').getAttribute('aria-selected')`), 'true');

  // Both files remembered; Start again brings back the starter
  await new Promise(r => setTimeout(r, 400));
  await page.goto('lesson.html?c=apps&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  assert.match(await page.eval(`${ta}.value`), /nothing\.here/);
  await page.eval(`document.getElementById('app-reset').click()`);
  assert.match(await page.eval(`${ta}.value`), /Hi there!/);
  await page.eval(`document.getElementById('tab-json').click()`);
  assert.match(await page.eval(`${ta}.value`), /"name": "Water",/);
  assert.deepEqual(page.errors, []);
});

test('app workspace: the A and B buttons and keys reach the unidex; a download is a real zip', async () => {
  await page.eval(`document.getElementById('tab-main').click()`);
  const ta = `document.querySelector('#app-code textarea')`;
  await page.eval(`${ta}.value = 'local n = 0\\nfunction draw()\\n  unidex.centered(100, "n=" .. n)\\nend\\nfunction onB()\\n  n = n + 1\\n  print("n is", n)\\n  return "partial"\\nend\\n'; ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('app-run').click()`);
  await idle();
  // B by clicking, then by the key
  const btn = await page.eval(`(() => { const r = document.getElementById('btnB').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: btn[0], y: btn[1], button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 100));
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: btn[0], y: btn[1], button: 'left', clickCount: 1 });
  await page.waitFor(`${out}.textContent.includes('n is 1')`, 10000);
  await page.eval(`document.querySelector('.device').focus()`);
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'b', code: 'KeyB', windowsVirtualKeyCode: 66 });
  await new Promise(r => setTimeout(r, 100));
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'b', code: 'KeyB', windowsVirtualKeyCode: 66 });
  await page.waitFor(`${out}.textContent.includes('n is 2')`, 10000);
  // Typing b in the editor doesn't press B
  await page.eval(`${ta}.focus()`);
  await page.type('b');
  await new Promise(r => setTimeout(r, 1500));
  assert.doesNotMatch(await page.eval(`${out}.textContent`), /n is 3/);

  const zip = await page.eval(`(async () => {
    const { zip } = await import('./zip.js');
    const b = new Uint8Array(await zip([{ name: 'water/main.lua', bytes: new TextEncoder().encode('x') }]).arrayBuffer());
    return [b[0], b[1], new TextDecoder().decode(b.slice(30, 44)), b.length];
  })()`);
  assert.deepEqual(zip.slice(0, 3), [0x50, 0x4b, 'water/main.lua']);
  assert.deepEqual(page.errors, []);
});

test('app workspace: phone width, light and dark', async () => {
  for (const dark of [false, true]) {
    await page.size(375, 800, dark);
    await page.goto('lesson.html?c=apps&l=1');
    await page.waitFor(`!document.getElementById('lesson').hidden`);
    assert.ok(await page.eval('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll');
    const edges = await page.eval(`['app-ws', 'text'].map(id => Math.round(document.getElementById(id).getBoundingClientRect().right))`);
    assert.ok(edges.every(r => r <= 375), `everything fits the screen: ${edges}`);
    // One column: the workspace comes after the text, not beside it
    assert.ok(await page.eval(`document.getElementById('app-ws').getBoundingClientRect().top > document.getElementById('text').getBoundingClientRect().bottom`));
    await page.shot(`app-phone-${dark ? 'dark' : 'light'}`);
  }
  await page.size(1280, 900);
});

const checkOut = () => page.waitFor(`!document.getElementById('app-check').disabled && !${out}.hasAttribute('aria-busy') && !/^Checking/.test(${out}.textContent)`, 90000);

test('check: lesson 1, the starter is not it, the answer is', async () => {
  await page.size(1280, 900);
  await page.goto('lesson.html?c=apps&l=1');
  await page.eval(`localStorage.clear()`);
  await page.goto('lesson.html?c=apps&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  await page.eval(`document.getElementById('app-check').click()`);
  assert.equal(await page.eval(`document.getElementById('app-run').disabled`), true, 'Run is off while checking');
  await checkOut();
  assert.equal(await page.eval(`${out}.textContent`), 'Not quite yet.When the app opens, the screen should show "Water". It showed "Hello", "Hi there!".');

  const ta = `document.querySelector('#app-code textarea')`;
  await page.eval(`${ta}.value = window.appWorkspace ? ${ta}.value.replace('"Hello"', '"Water"').replace('"Hi there!"', '"0 glasses"') : ''; ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('app-check').click()`);
  await checkOut();
  assert.equal(await page.eval(`${out}.textContent`), "That's right. Well done!");
  assert.equal(await page.eval(`document.getElementById('app-done').hidden`), false);
  assert.equal(await page.eval(`document.getElementById('next').classList.contains('secondary')`), false);
  await page.shot('app-check-done');
  assert.deepEqual(page.errors, []);
});

test('check: presses, holds, reopen, hides, a missing "partial", an error, and showing 0', async () => {
  const app = `local count = tonumber(unidex.data.read("count") or "") or 0
local function save() unidex.data.write("count", tostring(count)) end
function draw()
  unidex.header("Water")
  unidex.centered(100, count)
  unidex.hints("less", "add", "reset")
end
function onB() count = count + 1; save(); return "partial" end
function onBHold() count = 0; save(); return "partial" end
function onA() count = count - 1 end
`;
  const json = '{"id": "water", "name": "Water", "version": "1.0.0", "api": 1, "type": "app"}';
  const run = (code, checks) => page.eval(`(async () => {
    const { runChecks } = await import('./check.js');
    const enc = new TextEncoder();
    return runChecks(await window.appWorkspace.emu, [{ path: 'main.lua', bytes: enc.encode(${JSON.stringify(code)}) },
      { path: 'app.json', bytes: enc.encode(${JSON.stringify(json)}) }], ${JSON.stringify(checks)});
  })()`);
  const steps = (...s) => s.map(x => (typeof x === 'string' ? { do: 'press', keys: x.split(' ') } : x));

  assert.deepEqual(await run(app, [[{ do: 'shows', text: '0' }]]), { ok: true }, 'a 0 drawn from a number counts');
  assert.deepEqual(await run(app, [steps('b b', { do: 'shows', text: '2' }, { do: 'hides', text: '0' })]), { ok: true });
  assert.deepEqual(await run(app, [steps('b b', { do: 'reopen' }, { do: 'shows', text: '2' })]), { ok: true }, 'saved through reopen');
  assert.deepEqual(await run(app, [steps('b b B', { do: 'shows', text: '0' })]), { ok: true }, 'hold B resets');
  assert.deepEqual(await run(app, [steps('b', { do: 'shows', text: '5' })]),
    { ok: false, message: 'After pressing B, the screen should show "5". It showed "Water", "1", "less", "add", "reset".' });
  assert.deepEqual(await run(app, [steps('b a', { do: 'shows', text: '0' })]),
    { ok: false, message: 'After pressing B, A, the screen should show "0". It showed "Water", "1", "less", "add", "reset". The screen didn\'t change after A. Does its function return "partial"?' });
  // Boxes, today's date, and app.json
  const boxes = `function draw()\n  for i = 1, 4 do\n    if i <= 1 then unidex.fill(i * 20, 60, 15, 15) else unidex.rect(i * 20, 60, 15, 15) end\n  end\n  local t = unidex.time()\n  unidex.header("Water", t.day .. "/" .. t.month)\nend\n`;
  assert.deepEqual(await run(boxes, [[{ do: 'fills', n: 1 }, { do: 'rects', n: 3 }, { do: 'shows', text: '{day}/{month}' }, { do: 'has', key: 'name' }]]), { ok: true });
  assert.deepEqual(await run(boxes, [[{ do: 'fills', n: 2 }]]),
    { ok: false, message: 'When the app opens, the screen should have 2 boxes drawn with unidex.fill. It had 1.' });
  assert.deepEqual(await run(boxes, [[{ do: 'has', key: 'icon' }]]), { ok: false, message: 'app.json needs "icon".' });
  const broken = app.replace('count = count + 1', 'count = count + nothing.here');
  const r = await run(broken, [steps('b')]);
  assert.equal(r.ok, false);
  assert.match(r.message, /^main\.lua:8: attempt to index a nil value/);
  const noDraw = await run('function onB() end\n', [[]]);
  assert.equal(noDraw.ok, false);
  assert.match(noDraw.message, /no draw\(\) function|nothing was drawn/);
  assert.deepEqual(page.errors, []);
});

test('install on my unidex: the install works over a unidex serial line (the virtual one), and says what it needs', async () => {
  await page.goto('lesson.html?c=apps&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  const r = await page.eval(`(async () => {
    const emu = await window.appWorkspace.emu;
    const { installOn } = await import('./install-device.js');
    const enc = new TextEncoder();
    const files = [{ path: 'main.lua', bytes: enc.encode('function draw()\\n  unidex.centered(100, "Over USB")\\nend\\n') },
                   { path: 'app.json', bytes: enc.encode('{"id": "usb-test", "name": "USB test", "version": "1.0.0", "api": 1, "type": "app"}') }];
    const steps = [];
    const entry = await emu.serially(() => installOn(emu.dev, files, t => steps.push(t)));
    const err = await emu.open(entry);
    return { name: entry.name, err, steps: steps.length };
  })()`);
  assert.equal(r.name, 'USB test');
  assert.equal(r.err, null, 'it opens on the device');
  assert.ok(r.steps > 0, 'it reported its progress');
  // A browser without Web Serial (Safari, Firefox, phones) is told what it needs
  const { identifier } = await page.send('Page.addScriptToEvaluateOnNewDocument', { source: 'delete Navigator.prototype.serial;' });
  await page.goto('lesson.html?c=apps&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  await page.eval(`document.getElementById('app-install').click()`);
  await page.waitFor(`${out}.querySelector('.err')`, 10000);
  assert.match(await page.eval(`${out}.textContent`), /needs Chrome or Edge on a computer\. You can still download the \.zip/);
  await page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
  assert.equal(await page.eval(`document.getElementById('app-install').textContent`), 'Install on my unidex');
  assert.deepEqual(page.errors, []);
});

test('examples keep their saved data between runs, as on a real unidex', async () => {
  await page.size(1280, 900);
  await page.goto('lesson.html?c=apps&l=7');
  await page.waitFor(`!document.getElementById('lesson').hidden && window.appWorkspace`);
  const pic = () => page.eval(`document.getElementById('screen').toDataURL()`);
  const runExample = async () => {
    await page.eval(`document.querySelector('.example button').click()`);
    await page.waitFor(`!document.getElementById('app-run').disabled && /running/.test(${out}.textContent)`, 60000);
    await new Promise(r => setTimeout(r, 1500));
    return pic();
  };
  const first = await runExample();
  const second = await runExample();
  assert.notEqual(first, second, 'the visit count went up, so the screen changed');
});

test('the answer shows app.json too when that is where the answer is', async () => {
  await page.goto('lesson.html?c=apps&l=11');
  await page.waitFor(`window.appWorkspace`);
  await page.eval(`document.getElementById('app-show-answer').click()`);
  const labels = await page.eval(`[...document.querySelectorAll('#app-answer .input-label')].map(p => p.textContent)`);
  assert.deepEqual(labels, ['main.lua', 'app.json']);
  assert.match(await page.eval(`document.getElementById('app-answer').textContent`), /"icon": \[/);
  await page.goto('lesson.html?c=apps&l=4');
  await page.waitFor(`window.appWorkspace`);
  assert.equal(await page.eval(`document.querySelectorAll('#app-answer .input-label').length`), 0, 'only main.lua, unlabelled, elsewhere');
});

test('the app course comes first: home page, menu, and its course page', async () => {
  await page.size(1280, 900);
  await page.goto('index.html');
  await page.waitFor(`document.querySelectorAll('#courses .course').length === 2`);
  assert.deepEqual(await page.eval(`[...document.querySelectorAll('#courses .course b')].map(b => b.textContent)`),
    ['Make your own unidex app', 'C++ for beginners']);
  assert.equal(await page.eval(`document.querySelector('#menu-0 li:nth-child(2) a').textContent`), 'Make your own unidex app');
  await page.shot('home-two-courses');
  await page.goto('course.html?c=apps');
  await page.waitFor(`!document.getElementById('course').hidden`);
  assert.equal(await page.eval(`document.querySelectorAll('#lessons li').length`), 12);
  assert.equal(await page.eval(`document.querySelector('#lessons a').textContent`), 'Your first app');
  await page.shot('course-apps');
  assert.deepEqual(page.errors, []);
});
