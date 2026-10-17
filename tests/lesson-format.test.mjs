import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, matches } from '../lesson-format.js';

const sample = `# Hello, world

Every program starts at \`main\`. This one **prints** a line:

\`\`\`cpp
#include <iostream>
int main() {
    std::cout << "Hi";
}
\`\`\`

It prints:

\`\`\`text
Hi
\`\`\`

## Your turn

- Change the text
- Run it, then press
  Check

1. one
2. two

See [the playground](play.html) or [cppreference](https://en.cppreference.com).

\`\`\`starter
int main() {
}
\`\`\`

\`\`\`solution
int main() { return 0; }
\`\`\`

\`\`\`test
input:
3 4
output:
7
\`\`\`

\`\`\`test
output:
Hello
\`\`\`
`;

test('title, examples, starter, solution and tests', () => {
  const l = parse(sample);
  assert.equal(l.title, 'Hello, world');
  assert.equal(l.examples.length, 1);
  assert.match(l.examples[0], /^#include <iostream>\n/);
  assert.equal(l.starter, 'int main() {\n}\n');
  assert.equal(l.solution, 'int main() { return 0; }\n');
  assert.deepEqual(l.tests, [{ input: '3 4\n', output: '7' }, { input: '', output: 'Hello' }]);
});

test('the HTML', () => {
  const { html } = parse(sample);
  assert.doesNotMatch(html, /<h1>/);  // the title is shown by the page, not in the text
  assert.match(html, /<p>Every program starts at <code>main<\/code>\. This one <strong>prints<\/strong> a line:<\/p>/);
  assert.match(html, /<div class="example" data-example="0"><pre><code><span class="tk-kw">#include<\/span>/);
  assert.match(html, /<pre class="plain"><code>Hi<\/code><\/pre>/);
  assert.match(html, /<h2>Your turn<\/h2>/);
  assert.match(html, /<ul><li>Change the text<\/li><li>Run it, then press Check<\/li><\/ul>/);
  assert.match(html, /<ol><li>one<\/li><li>two<\/li><\/ol>/);
  assert.match(html, /<a href="play.html">the playground<\/a>/);
  assert.match(html, /<a href="https:\/\/en.cppreference.com" target="_blank" rel="noopener">cppreference<\/a>/);
  assert.doesNotMatch(html, /starter|solution|output:/);
});

test('text is escaped and links can only be web or local pages', () => {
  const { html } = parse('Use `<b>` and a < b, "quoted". [x](javascript:alert(1)) *word* 2 * 3 * 4');
  assert.match(html, /<code>&lt;b&gt;<\/code>/);
  assert.match(html, /a &lt; b, &quot;quoted&quot;/);
  assert.doesNotMatch(html, /href="javascript/);
  assert.match(html, /<em>word<\/em> 2 \* 3 \* 4/);
});

test('a test block without output: is a mistake in the lesson', () => {
  assert.throws(() => parse('```test\n5\n```'), /output:/);
});

test('output matching ignores trailing spaces and blank lines, nothing else', () => {
  assert.ok(matches('7\n', '7'));
  assert.ok(matches('a  \nb\n\n', 'a\nb'));
  assert.ok(matches('a\r\nb', 'a\nb'));
  assert.ok(!matches('7', '8'));
  assert.ok(!matches(' 7', '7'));
  assert.ok(!matches('Hello', 'hello'));
  assert.ok(!matches('a\n\nb', 'a\nb'));
});

test('an input block belongs to the example before it', () => {
  const l = parse('```cpp\nint main() {}\n```\n\n```input\n5\n```\n\n```cpp\nint main() {}\n```\n');
  assert.deepEqual(l.inputs, ['5\n', '']);
  assert.match(l.html, /data-example="0">.*When it runs, the input is:.*<code>5<\/code><\/pre><\/div>/s);
  assert.throws(() => parse('Some text\n\n```input\n5\n```'), /straight after an example/);
});

test('an output block is shown inside the example above it', () => {
  const l = parse('```cpp\nint main() {}\n```\n\n```input\n5\n```\n\n```output\n10\n```\n');
  assert.equal(l.outputs[0], '10\n');
  assert.match(l.html, /When it runs, the input is:.*It prints:<\/p><pre class="plain expected"><code>10<\/code><\/pre><\/div>$/s);
  assert.throws(() => parse('Text\n\n```output\n5\n```'), /output block goes straight after an example/);
});

test('app lessons: app.json starter and solution, and check steps', () => {
  const l = parse([
    '# One', '', '```lua', 'function draw() end', '```', '', '## Your turn', '',
    '```starter', 'function draw() end', '```', '',
    '```starter app.json', '{"id": "water"}', '```', '',
    '```solution', 'function draw() unidex.centered(90, "0") end', '```', '',
    '```check', 'shows: 0', 'press: b b B', 'reopen', 'hides: 2', '```',
  ].join('\n'), 'lua');
  assert.equal(l.examples.length, 1);
  assert.match(l.html, /data-example="0"/);
  assert.equal(l.starter, 'function draw() end\n');
  assert.equal(l.starterJson, '{"id": "water"}\n');
  assert.equal(l.solutionJson, null);
  assert.deepEqual(l.checks, [[
    { do: 'shows', text: '0' }, { do: 'press', keys: ['b', 'b', 'B'] }, { do: 'reopen' }, { do: 'hides', text: '2' },
  ]]);
  assert.throws(() => parse('```check\nwiggle: it\n```', 'lua'), /don't know: "wiggle: it"/);
});
