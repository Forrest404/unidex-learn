// The runner against the real compilers (needs the internet), each case on both servers:
//   node --test --test-concurrency=1 tests/run.test.mjs
import { describe, it, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { run, servers } from '../run.js';

const real = { ...servers };
const DOWN = 'https://127.0.0.1:9/';  // nothing listens there, so it fails at once

for (const server of ['godbolt', 'wandbox']) {
  describe(server, () => {
    before(() => { if (server === 'wandbox') servers.godbolt = DOWN; });
    after(() => Object.assign(servers, real));

    const hello = '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, world!\\n";\n}\n';

    it('runs a program and returns what it printed', async () => {
      const r = await run('cpp', hello);
      assert.equal(r.status, 'ok');
      assert.equal(r.output, 'Hello, world!\n');
      assert.deepEqual(r.errors, []);
    });

    it('passes input to cin', async () => {
      const r = await run('cpp', '#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n}\n', '20 22');
      assert.equal(r.status, 'ok');
      assert.equal(r.output.trimEnd(), '42');
    });

    it('a compile error names main.cpp and the right line', async () => {
      const r = await run('cpp', '#include <iostream>\nusing namespace std;\nint main() {\n    cout << x;\n}\n');
      assert.equal(r.status, 'compile');
      assert.equal(r.errors[0].line, 4);
      assert.match(r.errors[0].text, /'x' was not declared/);
      assert.match(r.message, /^main\.cpp:/m);
      assert.doesNotMatch(r.message, /prog\.cc|limit\.cpp/);
    });

    it('a missing semicolon points at a line', async () => {
      const r = await run('cpp', '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "hi"\n}\n');
      assert.equal(r.status, 'compile');
      assert.ok(r.errors[0].line === 4 || r.errors[0].line === 5);
    });

    it('names the limit file uses (write, sleep, stop) are free for the learner', async () => {
      const r = await run('cpp', '#include <iostream>\nusing namespace std;\nint sleep = 3;\nvoid write() { cout << sleep; }\nvoid stop() {}\nint limit = 1;\nint main() { write(); stop(); }\n');
      assert.equal(r.status, 'ok', r.message);
      assert.equal(r.output.trimEnd(), '3');
    });

    it('a program that never ends is stopped after a few seconds, keeping what it printed', async () => {
      const t = Date.now();
      const r = await run('cpp', '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "start\\n";\n    while (true) {}\n}\n');
      const took = (Date.now() - t) / 1000;
      assert.equal(r.status, 'slow');
      assert.equal(r.output, 'start\n');
      assert.ok(took < 20, `took ${took}s`);
    });

    it('a program that prints forever is cut short', async () => {
      const r = await run('cpp', '#include <iostream>\nint main() {\n    while (true) std::cout << "spam\\n";\n}\n');
      assert.equal(r.status, 'flood');
      assert.ok(r.output.length <= 20002 && r.output.startsWith('spam\n'));
    });

    it('a crash is a crash, not ok', async () => {
      const r = await run('cpp', 'int main() {\n    int* p = nullptr;\n    return *p;\n}\n');
      assert.equal(r.status, 'crash');
    });
  });
}

test('falls back to Wandbox when Compiler Explorer is down', async () => {
  servers.godbolt = DOWN;
  try {
    const r = await run('cpp', '#include <iostream>\nint main() { std::cout << 42; }\n');
    assert.equal(r.status, 'ok');
    assert.equal(r.output, '42');  // only Wandbox can tell there was no newline at the end
  } finally {
    Object.assign(servers, real);
  }
});

test('says so when neither compiler can be reached', async () => {
  servers.wandbox = DOWN;
  servers.godbolt = DOWN;
  try {
    const r = await run('cpp', '#include <iostream>\nint main() {}\n');
    assert.equal(r.status, 'offline');
    assert.match(r.message, /Couldn't reach the compiler/);
  } finally {
    Object.assign(servers, real);
  }
});
