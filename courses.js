// Loading courses and lessons from courses/. A course is courses/<id>/course.json and its lesson files.
import { parse } from './lesson-format.js';

export async function courseIds() {
  const r = await fetch('courses/index.json');
  if (!r.ok) throw new Error(`courses/index.json: ${r.status}`);
  return r.json();
}

export async function loadCourse(id) {
  if (!/^[a-z0-9-]+$/.test(id || '')) throw new Error('There is no course with that name.');
  const r = await fetch(`courses/${id}/course.json`);
  if (!r.ok) throw new Error('There is no course with that name.');
  return { id, ...(await r.json()) };
}

// n counts from 1
export async function loadLesson(course, n) {
  const file = course.lessons[n - 1];
  if (!file) throw new Error(`${course.title} has no lesson ${n}.`);
  const r = await fetch(`courses/${course.id}/${file}`);
  if (!r.ok) throw new Error(`Lesson ${n} didn't load (${r.status}).`);
  return { n, file, ...parse(await r.text(), course.lang) };
}
