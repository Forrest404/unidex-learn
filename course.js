// A course's page (course.html?c=cpp): its lessons, ticked when done, and a button to carry on where you left off.
import { el } from './chrome.js';
import { loadCourse, loadLesson } from './courses.js';
import { isDone } from './progress.js';

const $ = id => document.getElementById(id);
try {
  const course = await loadCourse(new URLSearchParams(location.search).get('c'));
  const lessons = await Promise.all(course.lessons.map((_, i) => loadLesson(course, i + 1)));
  const done = lessons.map(l => isDone(`${course.id}/${l.file}`));
  const count = done.filter(Boolean).length;
  const next = done.indexOf(false);

  document.title = course.title;
  $('title').textContent = course.title;
  $('blurb').textContent = course.blurb;
  $('count').textContent = `${count} of ${lessons.length} done`;
  const go = $('continue');
  go.href = `lesson.html?c=${course.id}&l=${next < 0 ? 1 : next + 1}`;
  go.textContent = count === 0 ? 'Start the course' : next < 0 ? 'Start again from lesson 1' : `Carry on: lesson ${next + 1}`;
  $('lessons').replaceChildren(...lessons.map((l, i) => el('li', { class: done[i] ? 'done' : '' },
    el('a', { href: `lesson.html?c=${course.id}&l=${i + 1}` }, l.title),
    done[i] ? el('span', { class: 'chip ok', text: '✓ done' }) : null)));
  $('course').hidden = false;
} catch (e) {
  $('problem').textContent = e.message;
  $('problem').hidden = false;
  $('problem').after(el('p', {}, el('a', { href: './', text: 'See all the courses' })));
}
