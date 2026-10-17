// A lesson (lesson.html?c=cpp&l=1): the text on the left, the learner's code on the right. Examples in the text
// run where they are; the editor is for the "Your turn" part and keeps what's typed in this browser.
import { el } from './chrome.js';
import { loadCourse, loadLesson } from './courses.js';
import { editor } from './editor.js';
import { runInto, show, busy } from './output.js';
import { run } from './run.js';
import { matches } from './lesson-format.js';
import { highlight } from './highlight.js';
import { getCode, setCode, clearCode, isDone, setDone } from './progress.js';

const $ = id => document.getElementById(id);
const q = new URLSearchParams(location.search);

try {
  const course = await loadCourse(q.get('c'));
  const n = Math.max(1, parseInt(q.get('l'), 10) || 1);
  const lesson = await loadLesson(course, n);
  const total = course.lessons.length;
  const where = `${course.id}/${lesson.file}`;

  document.title = `${lesson.title} · ${course.title}`;
  $('crumbs').replaceChildren(el('a', { href: `course.html?c=${course.id}`, text: course.title }),
                              el('span', { text: `Lesson ${n} of ${total}` }));
  $('title').textContent = lesson.title;
  $('text').innerHTML = lesson.html;  // built by lesson-format.js, which escapes all the text

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
  const done = () => {
    $('done-mark').hidden = false;
    $('next').classList.remove('secondary');
  };
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
      setDone(where);
      done();
      $('next').focus();
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

  // Previous and next
  const pager = $('pager');
  pager.append(n > 1 ? el('a', { class: 'button secondary', href: `lesson.html?c=${course.id}&l=${n - 1}`, text: '← Previous' }) : el('span'));
  pager.append(n < total ? el('a', { class: 'button secondary', id: 'next', href: `lesson.html?c=${course.id}&l=${n + 1}`, text: 'Next lesson →' })
                         : el('a', { class: 'button secondary', id: 'next', href: `course.html?c=${course.id}`, text: 'Back to the course' }));
  if (isDone(where)) done();
  $('lesson').hidden = false;
  pager.hidden = false;
} catch (e) {
  $('problem').textContent = e.message;
  $('problem').hidden = false;
  $('problem').after(el('p', {}, el('a', { href: './', text: 'See all the courses' })));
}
