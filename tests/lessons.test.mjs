// Every lesson of every course, on the real compiler (needs the internet):
//   node --test --test-concurrency=1 tests/lessons.test.mjs
//   LESSON=03 node --test tests/lessons.test.mjs     just the lessons whose file starts with 03
// For each lesson: it has a title, a starter, a solution and a test; the solution passes every test; the starter
// builds but doesn't pass yet; every example runs, and prints what its output block says it prints.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse, matches } from '../lesson-format.js';
import { run } from '../run.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const passes = async (lang, code, tests) => {
  for (const t of tests) {
    const r = await run(lang, code, t.input);
    if (r.status !== 'ok') return `${r.status}: ${r.message || r.output}`;
    if (!matches(r.output, t.output)) return `printed ${JSON.stringify(r.output)}, wanted ${JSON.stringify(t.output)}`;
  }
  return true;
};

for (const id of JSON.parse(read('courses/index.json'))) {
  const course = JSON.parse(read(`courses/${id}/course.json`));
  if (course.runner === 'unidex') continue;  // app courses run on the virtual unidex: tests/apps.test.mjs
  describe(course.title, () => {
    for (const file of course.lessons.filter(f => f.startsWith(process.env.LESSON || ''))) {
      it(file, async () => {
        const l = parse(read(`courses/${id}/${file}`), course.lang);
        assert.ok(l.title, 'no # title');
        assert.ok(l.starter && l.solution && l.tests.length, 'needs a starter, a solution and at least one test');
        assert.match(l.html, /<h2>Your turn<\/h2>/);
        assert.equal(await passes(course.lang, l.solution, l.tests), true, 'the solution should pass');
        const s = await run(course.lang, l.starter, l.tests[0].input);
        assert.notEqual(s.status, 'compile', `the starter should build: ${s.message}`);
        assert.notEqual(await passes(course.lang, l.starter, l.tests), true, 'the starter passes already');
        for (const [i, code] of l.examples.entries()) {
          const r = await run(course.lang, code, l.inputs[i]);
          assert.equal(r.status, 'ok', `example ${i + 1}: ${r.status} ${r.message}`);
          if (l.outputs[i] != null) assert.ok(matches(r.output, l.outputs[i]), `example ${i + 1} prints ${JSON.stringify(r.output)}`);
        }
      });
    }
  });
}
