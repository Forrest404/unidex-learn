// The Playground: any C++, kept in this browser.
import { editor } from './editor.js';
import { getCode, setCode, clearCode } from './progress.js';
import { runInto } from './output.js';

const START = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello!\\n";
}
`;

const $ = id => document.getElementById(id);
let timer;
const ed = editor($('code'), {
  lang: 'cpp',
  value: getCode('play') ?? START,
  onChange: v => { clearTimeout(timer); timer = setTimeout(() => setCode('play', v), 300); },
  onRun: () => $('run').click(),
});
$('reset').onclick = () => { ed.value = START; clearCode('play'); ed.focus(); };

$('run').onclick = () => runInto($('output'), { lang: 'cpp', code: ed.value, stdin: $('stdin').value, ed, buttons: [$('run')] });
