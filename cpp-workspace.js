// The C++ workspace on a lesson page: the editor, Run with an input box, Check against the lesson's tests, and
// the answer. Examples in the text run where they are.
import { el } from './chrome.js';
import { editor } from './editor.js';
import { runInto, show, busy } from './output.js';
import { run } from './run.js';
import { matches } from './lesson-format.js';
import { highlight } from './highlight.js';
import { getCode, setCode, clearCode } from './progress.js';

const $ = id => document.getElementById(id);

// finished(): the lesson is passed; returns showDone() for a lesson passed before
export function cppWorkspace({ course, lesson, where, finished }) {
  $('cpp-ws').hidden = false;
    // Each example gets its own Run button and output
    for (const box of $('text').querySelectorAll('.example')) {
      const out = el('div', { class: 'output', role: 'log', 'aria-label': 'What the example printed', hidden: true });
      const btn = el('button', { type: 'button', class: 'secondary small', text: 'Run', 'aria-label': 'Run this example' });
      btn.onclick = () => {
        const i = +box.dataset.example;
        runInto(out, { lang: course.lang, code: lesson.examples[i], stdin: lesson.inputs[i], buttons: [btn] });
      };
      box.append(el('div', { class: 'run-bar' }, btn), out);
    }

    // The learner's code
    let timer;
    const ed = editor($('code'), {
      lang: course.lang,
      label: 'Your code',
      value: getCode(where) ?? lesson.starter,
      onChange: v => { clearTimeout(timer); timer = setTimeout(() => setCode(where, v), 300); },
      onRun: () => $('run').click(),
    });
    const firstInput = lesson.tests.find(t => t.input)?.input;
    if (firstInput) {
      $('stdin-box').hidden = false;
      $('stdin').value = firstInput.trimEnd();
    }
    const workButtons = [$('run'), $('check')];
    $('run').onclick = () => runInto($('output'), { lang: course.lang, code: ed.value, stdin: $('stdin').value, ed, buttons: workButtons });
    $('reset').onclick = () => { ed.value = lesson.starter; clearCode(where); ed.focus(); };

    // Check: run the code with each test's input and compare what it prints
    if (!lesson.tests.length) $('check').hidden = true;
    $('check').onclick = async () => {
      const out = $('output');
      const finish = busy(out, 'Checking…', workButtons);
      try {
        for (const [i, t] of lesson.tests.entries()) {
          if (lesson.tests.length > 1) out.firstChild.textContent = `Checking ${i + 1} of ${lesson.tests.length}…`;
          const r = await run(course.lang, ed.value, t.input);
          if (r.status !== 'ok' || !matches(r.output, t.output)) {
            if (r.status !== 'ok') { show(out, r, ed); return; }
            out.replaceChildren(el('div', { class: 'err', text: 'Not quite yet.' }));
            if (t.input) out.append(el('div', { class: 'muted', text: 'With this input:' }), el('div', { text: t.input.trimEnd() }));
            out.append(el('div', { class: 'muted', text: t.input ? 'it should print:' : 'It should print:' }), el('div', { text: t.output.trimEnd() }),
                       el('div', { class: 'muted', text: 'Yours printed:' }), el('div', { text: r.output.trimEnd() || '(nothing)' }));
            return;
          }
        }
        out.replaceChildren(el('div', { class: 'ok', text: `That's right. Well done!` }));
        $('done-mark').hidden = false;
        finished();
      } finally {
        finish();
      }
    };

    // The answer, on request
    $('answer-code').innerHTML = highlight(lesson.solution.trimEnd(), course.lang);
    if (!lesson.solution) $('show-answer').hidden = true;
    $('show-answer').onclick = () => {
      const open = $('answer').hidden;
      $('answer').hidden = !open;
      $('show-answer').setAttribute('aria-expanded', String(open));
      $('show-answer').textContent = open ? 'Hide the answer' : 'Show the answer';
    };
  return () => { $('done-mark').hidden = false; };
}
