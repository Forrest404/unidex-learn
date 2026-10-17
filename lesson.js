// A lesson (lesson.html?c=cpp&l=1): the text on the left and, beside it, the workspace for the course's kind:
// C++ that runs on an online compiler (cpp-workspace.js), or a unidex app that runs on the virtual unidex
// (app-workspace.js). Both keep what's typed in this browser.
import { el } from './chrome.js';
import { loadCourse, loadLesson } from './courses.js';
import { isDone, setDone } from './progress.js';

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

  // Previous and next. Next stands out once the lesson is done.
  const pager = $('pager');
  pager.append(n > 1 ? el('a', { class: 'button secondary', href: `lesson.html?c=${course.id}&l=${n - 1}`, text: '← Previous' }) : el('span'));
  pager.append(n < total ? el('a', { class: 'button secondary', id: 'next', href: `lesson.html?c=${course.id}&l=${n + 1}`, text: 'Next lesson →' })
                         : el('a', { class: 'button secondary', id: 'next', href: `course.html?c=${course.id}`, text: 'Back to the course' }));
  const finished = () => {
    setDone(where);
    $('next').classList.remove('secondary');
    $('next').focus();
  };

  const app = course.runner === 'unidex';
  $('lesson').classList.toggle('app', app);
  const ws = app ? (await import('./app-workspace.js')).appWorkspace : (await import('./cpp-workspace.js')).cppWorkspace;
  const showDone = ws({ course, lesson, where, finished });
  if (isDone(where)) { showDone(); $('next').classList.remove('secondary'); }
  $('lesson').hidden = false;
  pager.hidden = false;
} catch (e) {
  $('problem').textContent = e.message;
  $('problem').hidden = false;
  $('problem').after(el('p', {}, el('a', { href: './', text: 'See all the courses' })));
}
