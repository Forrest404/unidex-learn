// Every lesson of the app course, on the virtual unidex in a real (headless) Chrome:
//   node --test tests/app-lessons.test.mjs
//   LESSON=03 node --test tests/app-lessons.test.mjs     just the lessons whose file starts with 03
// For each lesson: the answer passes Check, the starter doesn't, and every example opens without an error.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { start } from './browser.mjs';
import { parse } from '../lesson-format.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const course = JSON.parse(read('courses/apps/course.json'));
let page;
before(async () => { page = await start(); await page.size(1280, 900); });
after(() => page.close());

const out = `document.getElementById('app-output')`;
async function check(main, json) {
  await page.eval(`(() => {
    const w = window.appWorkspace;
    w.files['main.lua'].text = ${JSON.stringify(main)};
    w.files['app.json'].text = ${JSON.stringify(json)};
    w.show('main.lua');
    document.getElementById('app-check').click();
  })()`);
  await page.waitFor(`!document.getElementById('app-check').disabled && !${out}.hasAttribute('aria-busy') && !/^Checking/.test(${out}.textContent)`, 120000);
  return page.eval(`${out}.textContent`);
}

for (const [i, file] of course.lessons.entries()) {
  if (!file.startsWith(process.env.LESSON || '')) continue;
  test(file, async () => {
    const l = parse(read(`courses/apps/${file}`), 'lua');
    assert.ok(l.title && l.starter && l.solution && l.checks.length, 'needs a title, a starter, a solution and a check');
    assert.match(l.html, /<h2>Your turn<\/h2>/);
    await page.goto(`lesson.html?c=apps&l=${i + 1}`);
    await page.eval(`localStorage.clear()`);
    await page.goto(`lesson.html?c=apps&l=${i + 1}`);
    await page.waitFor(`!document.getElementById('lesson').hidden && window.appWorkspace`);

    const json = l.solutionJson || l.starterJson || course.appJson;
    assert.equal(await check(l.solution, json), "That's right. Well done!", 'the answer passes');
    const starter = await check(l.starter, l.starterJson || course.appJson);
    assert.match(starter, /^Not quite yet\./, 'the starter does not pass yet');

    for (const [n] of l.examples.entries()) {
      await page.eval(`document.querySelectorAll('.example button')[${n}].click()`);
      await page.waitFor(`!document.getElementById('app-run').disabled && ${out}.textContent && !/^(Starting|Putting)/.test(${out}.textContent)`, 60000);
      assert.match(await page.eval(`${out}.textContent`), /Example is running/, `example ${n + 1}: ${await page.eval(`${out}.textContent`)}`);
    }
    assert.deepEqual(page.errors, []);
  });
}
