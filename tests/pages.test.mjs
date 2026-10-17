// The pages in a real (headless) Chrome: node tests/pages.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start } from './browser.mjs';

let page;
before(async () => { page = await start(); });
after(() => page.close());

const noSideScroll = () => page.eval('document.documentElement.scrollWidth <= innerWidth');

test('home: header, footer and the course list', async () => {
  await page.size(1280, 900);
  await page.goto('index.html');
  await page.waitFor(`document.querySelector('#courses .course')`);
  assert.equal(await page.eval(`document.querySelector('.site-head .brand small').textContent`), 'learn');
  assert.equal(await page.eval(`document.querySelector('#courses .course b').textContent`), 'C++ for beginners');
  assert.match(await page.eval(`document.querySelector('#courses .course').getAttribute('href')`), /course\.html\?c=cpp/);
  assert.ok(await page.eval(`document.querySelector('.site-foot .foot-row')`));
  assert.ok(await noSideScroll());
  await page.shot('home-desktop-light');
  assert.deepEqual(page.errors, []);
});

test('home: phone width, light and dark, and the menu drawer', async () => {
  for (const dark of [false, true]) {
    await page.size(375, 800, dark);
    await page.goto('index.html');
    await page.waitFor(`document.querySelector('#courses .course')`);
    assert.ok(await noSideScroll(), `sideways scroll at 375px (${dark ? 'dark' : 'light'})`);
    const bg = await page.eval(`getComputedStyle(document.body).backgroundColor`);
    assert.equal(bg, dark ? 'rgb(20, 20, 20)' : 'rgb(244, 241, 234)');
    await page.shot(`home-phone-${dark ? 'dark' : 'light'}`);
  }
  await page.eval(`document.querySelector('.menu-btn').click()`);
  assert.ok(await page.eval(`document.querySelector('.drawer.open') && document.activeElement.closest('.drawer') !== null`));
  assert.ok(await page.eval(`[...document.querySelectorAll('.drawer a')].some(a => a.textContent === 'C++ for beginners')`));
  await page.size(1280, 900);
  assert.deepEqual(page.errors, []);
});

test('editor: colours, typing, indenting, and it remembers the code', async () => {
  await page.goto('play.html');
  await page.eval(`localStorage.clear()`);
  await page.goto('play.html');
  const ta = `document.querySelector('#code textarea')`;
  assert.match(await page.eval(`${ta}.value`), /Hello!/);
  assert.equal(await page.eval(`document.querySelector('#code .tk-kw').textContent`), '#include');
  assert.equal(await page.eval(`document.querySelector('#code .tk-type').textContent`), 'std');
  assert.ok(await page.eval(`[...document.querySelectorAll('#code .tk-str')].some(s => s.textContent === '"Hello!\\\\n"')`));
  assert.equal(await page.eval(`document.querySelectorAll('#code .gutter div').length`), 7);

  // Replace everything by typing, as a person would
  await page.eval(`${ta}.focus(); ${ta}.select()`);
  await page.type('int main() {\nint x = 1;\nif (x) {\nx = 2;\n}\n}');
  assert.equal(await page.eval(`${ta}.value`), 'int main() {\n    int x = 1;\n    if (x) {\n        x = 2;\n    }\n}');
  await page.key('Tab');
  assert.match(await page.eval(`${ta}.value`), /\n}    $/);
  // Enter between { and } puts the } on its own line
  await page.eval(`${ta}.value = 'int f() {}'; ${ta}.setSelectionRange(9, 9)`);
  await page.key('Enter');
  assert.equal(await page.eval(`${ta}.value`), 'int f() {\n    \n}');
  assert.equal(await page.eval(`${ta}.selectionStart`), 14);
  assert.equal(await page.eval(`document.querySelectorAll('#code .gutter div').length`), 3);

  // Saved: still there after a reload; Start again brings the example back
  await new Promise(r => setTimeout(r, 500));
  await page.goto('play.html');
  assert.equal(await page.eval(`${ta}.value`), 'int f() {\n    \n}');
  await page.eval(`document.getElementById('reset').click()`);
  assert.match(await page.eval(`${ta}.value`), /Hello!/);
  await page.shot('play-desktop');
  assert.deepEqual(page.errors, []);
});

test('editor: Escape then Tab leaves the editor (no keyboard trap)', async () => {
  await page.goto('play.html');
  await page.eval(`document.querySelector('#code textarea').focus()`);
  await page.key('Escape');
  await page.key('Tab');
  assert.equal(await page.eval(`document.activeElement.closest('#code') === null`), true);
});

test('playground: Run, input, Ctrl+Enter, and a compile error with Go to line', async () => {
  await page.goto('play.html');
  await page.eval(`document.getElementById('reset').click()`);
  const out = `document.getElementById('output')`;
  await page.eval(`document.getElementById('run').click()`);
  assert.equal(await page.eval(`document.getElementById('run').disabled`), true);
  await page.waitFor(`!${out}.hasAttribute('aria-busy') && ${out}.textContent !== 'Running…'`, 60000);
  assert.equal(await page.eval(`${out}.textContent`), 'Hello!\n');

  const ta = `document.querySelector('#code textarea')`;
  await page.eval(`${ta}.value = '#include <iostream>\\nusing namespace std;\\nint main() {\\n    int n;\\n    cin >> n;\\n    cout << n * 2;\\n}'; ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('stdin').value = '21'; ${ta}.focus()`);
  await page.key('Enter', process.platform === 'darwin' ? 4 : 2);  // Cmd/Ctrl+Enter
  await page.waitFor(`${out}.textContent && ${out}.textContent !== 'Running…' && !${out}.hasAttribute('aria-busy')`, 60000);
  assert.equal((await page.eval(`${out}.textContent`)).trimEnd(), '42');
  assert.equal(await page.eval(`${ta}.value.split('\\n').length`), 7);  // Ctrl+Enter didn't add a line

  await page.eval(`${ta}.value = '#include <iostream>\\nusing namespace std;\\nint main() {\\n    cout << x;\\n}'; ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('run').click()`);
  await page.waitFor(`${out}.querySelector('button')`, 60000);
  assert.match(await page.eval(`${out}.firstChild.textContent`), /didn't build/);
  assert.equal(await page.eval(`document.querySelector('#code .gutter .err').textContent`), '4');
  await page.eval(`${out}.querySelector('button').click()`);
  assert.equal(await page.eval(`${ta}.value.slice(${ta}.selectionStart, ${ta}.selectionEnd)`), '    cout << x;');
  await page.shot('play-error');
  assert.deepEqual(page.errors, []);
});

test('lesson: text, a runnable example, the editor with the starter, and the pager', async () => {
  await page.goto('lesson.html?c=cpp&l=1');
  await page.eval(`localStorage.clear()`);
  await page.goto('lesson.html?c=cpp&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  assert.equal(await page.eval(`document.getElementById('title').textContent`), 'Hello, world');
  assert.equal(await page.eval(`document.title`), 'Hello, world · C++ for beginners');
  assert.match(await page.eval(`document.getElementById('crumbs').textContent`), /C\+\+ for beginners.*Lesson 1 of 13/);
  assert.match(await page.eval(`document.querySelector('#code textarea').value`), /Hello, world!/);
  assert.equal(await page.eval(`document.getElementById('stdin-box').hidden`), true);  // lesson 1 reads no input
  assert.doesNotMatch(await page.eval(`document.getElementById('text').textContent`), /I'm learning C\+\+!\\n/);  // no answer in the text

  // The example's own Run
  await page.eval(`document.querySelector('.example button').click()`);
  const exOut = `document.querySelector('.example div.output')`;
  await page.waitFor(`!${exOut}.hidden && !${exOut}.hasAttribute('aria-busy') && ${exOut}.textContent !== 'Running…'`, 60000);
  assert.equal(await page.eval(`${exOut}.textContent`), 'Hello, world!\n');
  assert.equal(await page.eval(`document.getElementById('output').textContent`), '');  // the workspace is untouched

  // The learner's code runs in the workspace
  const ta = `document.querySelector('#code textarea')`;
  await page.eval(`${ta}.value = ${ta}.value.replace('Hello, world!', 'Hi there'); ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('run').click()`);
  const out = `document.getElementById('output')`;
  await page.waitFor(`!${out}.hasAttribute('aria-busy') && ${out}.textContent !== 'Running…' && ${out}.textContent !== ''`, 60000);
  assert.equal(await page.eval(`${out}.textContent`), 'Hi there\n');

  // First lesson: no Previous; the last lesson's Next goes back to the course
  assert.equal(await page.eval(`document.querySelector('#pager a').textContent`), 'Next lesson →');
  assert.match(await page.eval(`document.querySelector('#pager a').href`), /lesson\.html\?c=cpp&l=2$/);
  await page.shot('lesson-desktop');
  await page.size(375, 800, true);
  assert.ok(await noSideScroll());
  await page.shot('lesson-phone-dark');
  await page.size(1280, 900);
  assert.deepEqual(page.errors, []);
});

test('lesson: a missing course or lesson says so', async () => {
  await page.goto('lesson.html?c=cpp&l=99');
  await page.waitFor(`!document.getElementById('problem').hidden`);
  assert.match(await page.eval(`document.getElementById('problem').textContent`), /no lesson 99/);
  await page.goto('lesson.html?c=../../etc');
  await page.waitFor(`!document.getElementById('problem').hidden`);
  assert.match(await page.eval(`document.getElementById('problem').textContent`), /no course/);
  page.errors.length = 0;  // the 404 for the missing file is expected
});

test('check: wrong, broken, then right; the answer; progress on the course and home pages', async () => {
  await page.goto('course.html?c=cpp');
  await page.eval(`localStorage.clear()`);
  await page.goto('course.html?c=cpp');
  await page.waitFor(`!document.getElementById('course').hidden`);
  assert.equal(await page.eval(`document.getElementById('continue').textContent`), 'Start the course');
  assert.equal(await page.eval(`document.querySelector('#lessons a').textContent`), 'Hello, world');
  assert.equal(await page.eval(`document.getElementById('count').textContent`), '0 of 13 done');

  await page.goto('lesson.html?c=cpp&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  const out = `document.getElementById('output')`, ta = `document.querySelector('#code textarea')`;
  const settle = () => page.waitFor(`!${out}.hasAttribute('aria-busy') && !/^(Checking|Running)…$/.test(${out}.textContent) && ${out}.textContent !== ''`, 90000);
  assert.equal(await page.eval(`document.getElementById('next').classList.contains('secondary')`), true);

  // The starter isn't the answer
  await page.eval(`document.getElementById('check').click()`);
  await settle();
  assert.match(await page.eval(`${out}.textContent`), /^Not quite yet\.It should print:I'm learning C\+\+!Yours printed:Hello, world!$/);

  // A broken program shows the compiler's error
  await page.eval(`${ta}.value = 'int main() { cout << 1 }'; ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('check').click()`);
  await settle();
  assert.match(await page.eval(`${out}.textContent`), /didn't build/);

  // The answer
  await page.eval(`document.getElementById('show-answer').click()`);
  assert.equal(await page.eval(`document.getElementById('answer').hidden`), false);
  assert.match(await page.eval(`document.getElementById('answer-code').textContent`), /I'm learning C\+\+!/);
  assert.equal(await page.eval(`document.getElementById('show-answer').getAttribute('aria-expanded')`), 'true');

  // Right
  await page.eval(`${ta}.value = '#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    cout << "I\\'m learning C++!" << endl;\\n}\\n'; ${ta}.dispatchEvent(new Event('input'))`);
  await page.eval(`document.getElementById('check').click()`);
  await settle();
  assert.equal(await page.eval(`${out}.textContent`), "That's right. Well done!");
  assert.equal(await page.eval(`document.getElementById('done-mark').hidden`), false);
  assert.equal(await page.eval(`document.getElementById('next').classList.contains('secondary')`), false);
  assert.equal(await page.eval(`document.activeElement.id`), 'next');
  await page.shot('lesson-done');

  // Remembered
  await new Promise(r => setTimeout(r, 400));
  await page.goto('lesson.html?c=cpp&l=1');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  assert.equal(await page.eval(`document.getElementById('done-mark').hidden`), false);
  assert.match(await page.eval(`${ta}.value`), /I'm learning C\+\+!" << endl/);
  await page.goto('course.html?c=cpp');
  await page.waitFor(`!document.getElementById('course').hidden`);
  assert.equal(await page.eval(`document.getElementById('count').textContent`), '1 of 13 done');
  assert.equal(await page.eval(`document.querySelector('#lessons li .chip').textContent`), '✓ done');
  assert.equal(await page.eval(`document.getElementById('continue').textContent`), 'Carry on: lesson 2');
  assert.match(await page.eval(`document.getElementById('continue').href`), /l=2$/);
  assert.equal(await page.eval(`document.querySelectorAll('#lessons li').length`), 13);
  await page.shot('course');
  await page.goto('index.html');
  await page.waitFor(`document.querySelector('#courses .course small')`);
  assert.equal(await page.eval(`document.querySelector('#courses .course small').textContent`), '1 of 13 lessons done');
  assert.deepEqual(page.errors, []);
});

test('lesson pages: an example with input, the last lesson, and every lesson loads', async () => {
  await page.size(1280, 900);
  await page.goto('lesson.html?c=cpp&l=5');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  assert.equal(await page.eval(`document.getElementById('stdin').value`), '3 4');
  await page.eval(`document.querySelector('.example button').click()`);
  const exOut = `document.querySelector('.example div.output')`;
  await page.waitFor(`!${exOut}.hasAttribute('aria-busy') && ${exOut}.textContent !== 'Running…' && ${exOut}.textContent !== ''`, 60000);
  assert.equal((await page.eval(`${exOut}.textContent`)).trim(), "Hi Ada!\nNext year you'll be 12.");
  await page.shot('lesson-05');

  await page.goto('lesson.html?c=cpp&l=13');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  assert.equal(await page.eval(`document.getElementById('next').textContent`), 'Back to the course');
  assert.equal(await page.eval(`document.querySelector('#pager a').textContent`), '← Previous');
  await page.shot('lesson-13');

  for (let n = 1; n <= 13; n++) {
    await page.goto(`lesson.html?c=cpp&l=${n}`);
    await page.waitFor(`!document.getElementById('lesson').hidden`);
    assert.ok(await page.eval(`document.getElementById('title').textContent.length > 0`), `lesson ${n}`);
    if (n === 9) await page.shot('lesson-09');
  }
  assert.deepEqual(page.errors, []);
});

test('every page: one h1, every control has a name, no sideways scroll on a phone', async () => {
  const pages = ['index.html', 'course.html?c=cpp', 'lesson.html?c=cpp&l=7', 'play.html', '404.html'];
  for (const dark of [false, true]) {
    await page.size(375, 800, dark);
    for (const p of pages) {
      await page.goto(p);
      await page.waitFor(`document.querySelector('.site-head .bar') && document.readyState === 'complete'`);
      await new Promise(r => setTimeout(r, 300));
      assert.ok(await noSideScroll(), `${p} scrolls sideways (${dark ? 'dark' : 'light'})`);
      assert.equal(await page.eval(`document.querySelectorAll('h1').length`), 1, `${p}: one h1`);
      const unnamed = await page.eval(`[...document.querySelectorAll('button, a[href], textarea, input, select')]
        .filter(e => e.offsetParent !== null || e.closest('[hidden]') === null)
        .filter(e => !(e.getAttribute('aria-label') || e.textContent.trim() || e.labels?.length || e.getAttribute('aria-labelledby')))
        .map(e => e.outerHTML.slice(0, 80))`);
      assert.deepEqual(unnamed, [], `${p}: controls without a name`);
    }
  }
  await page.shot('404-phone-dark');
  await page.size(1280, 900);
  assert.deepEqual(page.errors, []);
});

test('ux: Run and Check lock each other, Check shows progress, the output stays in view', async () => {
  await page.size(1280, 720);
  await page.goto('lesson.html?c=cpp&l=7');
  await page.waitFor(`!document.getElementById('lesson').hidden`);
  const out = `document.getElementById('output')`;
  // Scroll down the lesson, as someone reading the task would, then run
  await page.eval(`scrollTo(0, document.body.scrollHeight)`);
  await page.eval(`document.getElementById('run').click()`);
  assert.equal(await page.eval(`document.getElementById('check').disabled`), true, 'Check is off while running');
  await page.waitFor(`!${out}.hasAttribute('aria-busy')`, 60000);
  assert.equal(await page.eval(`document.getElementById('check').disabled`), false);
  const r = await page.eval(`(() => { const b = ${out}.getBoundingClientRect(); return [b.top, b.bottom, innerHeight]; })()`);
  assert.ok(r[0] >= 0 && r[1] <= r[2], `output in view: ${r}`);

  await page.eval(`document.getElementById('check').click()`);
  assert.equal(await page.eval(`document.getElementById('run').disabled`), true, 'Run is off while checking');
  await page.waitFor(`/^Checking \\d of 6…$/.test(${out}.textContent)`, 30000);
  await page.waitFor(`!${out}.hasAttribute('aria-busy')`, 90000);
  assert.match(await page.eval(`${out}.textContent`), /Not quite yet/);
  await page.shot('ux-lesson-720');
  await page.size(1280, 900);
  assert.deepEqual(page.errors, []);
});

test('ux: lesson rows on the course page are big enough to tap', async () => {
  await page.size(375, 800);
  await page.goto('course.html?c=cpp');
  await page.waitFor(`!document.getElementById('course').hidden`);
  const heights = await page.eval(`[...document.querySelectorAll('#lessons a')].map(a => a.getBoundingClientRect().height)`);
  assert.ok(heights.every(h => h >= 44), `row heights: ${heights}`);
  await page.size(1280, 900);
});
