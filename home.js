// The home page: one card per course in courses/index.json.
import { el } from './chrome.js';
import { courseIds, loadCourse } from './courses.js';
import { isDone } from './progress.js';

const list = document.getElementById('courses');
function progress(c) {
  const done = c.lessons.filter(f => isDone(`${c.id}/${f}`)).length;
  return done ? `${done} of ${c.lessons.length} lessons done` : `${c.lessons.length} lessons`;
}
try {
  for (const c of await Promise.all((await courseIds()).map(loadCourse))) {
    list.append(el('li', {}, el('a', { class: 'course', href: `course.html?c=${c.id}` },
      el('b', { text: c.title }),
      el('span', { text: c.blurb }),
      el('small', { text: progress(c) }))));
  }
} catch (e) {
  list.append(el('li', { class: 'bad', text: `The courses didn't load. Try reloading the page. (${e.message})` }));
}
