import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokens, highlight } from '../highlight.js';

const kinds = (src) => tokens(src, 'cpp').filter(([k]) => k).map(([k, t]) => `${k}:${t}`);

test('the pieces join back into the same code', () => {
  const src = '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hi, \\"you\\"" << 3.5 << \'x\'; // done\n    /* a\n       b */\n}\n';
  assert.equal(tokens(src, 'cpp').map(([, t]) => t).join(''), src);
});

test('includes, keywords, types, strings, numbers, comments and calls', () => {
  assert.deepEqual(kinds('#include <iostream>'), ['kw:#include', 'str:<iostream>']);
  assert.deepEqual(kinds('int x = 42;'), ['type:int', 'num:42']);
  assert.deepEqual(kinds('if (x > 1.5e3) return 0;'), ['kw:if', 'num:1.5e3', 'kw:return', 'num:0']);
  assert.deepEqual(kinds('cout << "a // not a comment";'), ['type:cout', 'str:"a // not a comment"']);
  assert.deepEqual(kinds("char c = '\\n';"), ['type:char', "str:'\\n'"]);
  assert.deepEqual(kinds('x = 1; // say hi'), ['num:1', 'com:// say hi']);
  assert.deepEqual(kinds('/* one\ntwo */ y'), ['com:/* one\ntwo */']);
  assert.deepEqual(kinds('total = add(a, b);'), ['call:add']);
  assert.deepEqual(kinds('x2 = y3;'), []);  // digits inside names are not numbers
});

test('half-typed code still colours without throwing', () => {
  assert.deepEqual(kinds('cout << "not closed'), ['type:cout', 'str:"not closed']);
  assert.deepEqual(kinds('/* not closed'), ['com:/* not closed']);
});

test('HTML in code is escaped', () => {
  assert.equal(highlight('a < b && c > d', 'cpp'), 'a &lt; b &amp;&amp; c &gt; d');
  assert.equal(highlight('<script>', 'none'), '&lt;script&gt;');
});
