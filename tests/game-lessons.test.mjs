// Every lesson of the game course, and Check's game steps, on a model of the unidex's Games app (game-model.mjs),
// with no emulator or browser. Needs Lua 5.4 or newer (LUA=/path/to/lua if it isn't lua5.4 or lua):
//   node --test tests/game-lessons.test.mjs
//   LESSON=03 node --test tests/game-lessons.test.mjs     just the lessons whose file starts with 03
// For each lesson: the answer passes Check, the starter doesn't, and every example plays without an error.
// tests/app-lessons.test.mjs runs the same lessons on the real firmware, once the emulator has games (API 4).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from '../lesson-format.js';
import { runChecks } from '../check.js';
import { modelEmu, lua } from './game-model.mjs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const enc = new TextEncoder();
const skip = lua ? false : 'needs Lua 5.4 or newer (set LUA)';
const emu = lua ? modelEmu() : null;
after(() => emu?.close());
const files = (main, json) => [{ path: 'main.lua', bytes: enc.encode(main) }, { path: 'app.json', bytes: enc.encode(json) }];
const run = (main, json, checks) => runChecks(emu, files(main, json), checks);

// A game's app.json, as the firmware takes it (apps_logic.h: check)
function gameJson(text) {
  const j = JSON.parse(text);
  assert.equal(j.type, 'game');
  assert.equal(j.category, 'games');
  assert.ok(j.api >= 4, 'a game needs "api": 4');
  assert.match(j.id, /^[a-z0-9-]+$/);
  assert.ok(j.name && j.name.length <= 20, 'a name of up to 20 characters');
  if (j.frame_ms != null) assert.ok(j.frame_ms >= 48 && j.frame_ms <= 1000, 'frame_ms is 48 to 1000');
}

for (const id of JSON.parse(read('courses/index.json'))) {
  const course = JSON.parse(read(`courses/${id}/course.json`));
  if (course.runner !== 'unidex' || JSON.parse(course.appJson).type !== 'game') continue;
  for (const file of course.lessons.filter(f => f.startsWith(process.env.LESSON || ''))) {
    test(`${id}/${file}`, { skip }, async () => {
      const l = parse(read(`courses/${id}/${file}`), 'lua');
      assert.ok(l.title && l.starter && l.solution && l.checks.length, 'needs a title, a starter, a solution and a check');
      assert.match(l.html, /<h2>Your turn<\/h2>/);
      const json = l.solutionJson || l.starterJson || course.appJson;
      gameJson(json);
      gameJson(l.starterJson || course.appJson);

      assert.deepEqual(await run(l.solution, json, l.checks), { ok: true }, 'the answer passes');
      const starter = await run(l.starter, l.starterJson || course.appJson, l.checks);
      assert.equal(starter.ok, false, 'the starter does not pass yet');

      for (const [n, code] of l.examples.entries()) {
        const r = await run(code, course.appJson, [[{ do: 'play', frames: '0'.repeat(20) + '1'.repeat(5) + '0'.repeat(10) }]]);
        assert.deepEqual(r, { ok: true }, `example ${n + 1} plays`);
      }
    });
  }
}

test('check: game steps and what they say', { skip }, async () => {
  const json = '{"id": "count", "name": "Count", "version": "1.0.0", "category": "games", "api": 4, "type": "game"}';
  const game = `local n, x = 0, 0
function start(seed) math.randomseed(seed); n = 0; x = math.random(1, 100) end
function step(tapped, held)
  if held then n = n + 1 end
  if n >= 3 then return "over" end
end
function draw() unidex.text(8, 20, "n" .. n); unidex.fill(x, 50, 10, 20) end
function score() return n * 2 end
`;
  const c = s => parse('```check\n' + s + '\n```', 'lua').checks;
  assert.deepEqual(await run(game, json, c('shows: n0\nplay: 1 0*5\nshows: n1\nplaying\nplay: 11\nover\nscore: 6')), { ok: true });
  assert.deepEqual(await run(game, json, c('play: 1 0\nover')),
    { ok: false, message: "After 2 frames with B down in 1, the round should be over (step() returns \"over\"). It's still going." });
  assert.deepEqual(await run(game, json, c('play: 111 0\nplaying')),
    { ok: false, message: 'After 4 frames with B down in 3, the round should still be going, but it ended after 3 frames.' });
  assert.deepEqual(await run(game, json, c('play: 1*5\nscore: 4')),
    { ok: false, message: 'After 5 frames with B down in 5, the score should be 4. score() gave 6.' });
  assert.deepEqual(await run(game, json, c('score: 0')),
    { ok: false, message: "When the round starts, the round should be over, with a score of 0. It's still going." });
  // The seed: the same one plays the same round, another one doesn't
  assert.deepEqual(await run(game, json, c('seed: 3\nremember\nagain\nsame\nseed: 4\nagain\nchanged')), { ok: true });
  assert.deepEqual(await run(game, json, c('seed: 3\nremember\nseed: 4\nagain\nsame')),
    { ok: false, message: "When the next round starts, the screen should look the same as it did when the round started in the round before. It's different. The rounds had different seeds." });
  assert.deepEqual(await run(game, json, c('remember\nplay: 0\nchanged')),
    { ok: false, message: "After 1 frame, the screen should look different from how it did when the round started. It's the same." });
  // Boxes
  assert.deepEqual(await run(game, json, c('box: * 50 10 20\nbox: 1-100 * * 15-25')), { ok: true });
  const box = await run(game, json, c('seed: 3\nbox: 30 40-45 10 20'));
  assert.equal(box.ok, false);
  assert.match(box.message, /^When the round starts, the screen should have a 10 x 20 box at x 30, y 40 to 45\. Its boxes were: 10 x 20 at x \d+, y 50\.$/);
  // A shown frame after the round ended says when it ended
  const ended = await run(game, json, c('play: 1*6\nshows: n9'));
  assert.match(ended.message, /should show "n9"\. It showed "n0"\. The round ended after 3 frames\.$/);
  // Errors, with the learner's own line numbers
  const broken = await run(game.replace('n = n + 1', 'n = n + nothing.here'), json, c('play: 1'));
  assert.equal(broken.ok, false);
  assert.match(broken.message, /^main\.lua:4: attempt to index a nil value/);
  const noScore = await run(game.replace(/function score.*\n/, ''), json, c('play: 111'));
  assert.deepEqual(noScore, { ok: false, message: 'main.lua has no score() function' });
});
