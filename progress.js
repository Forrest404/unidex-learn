// What this browser remembers: the code typed in each lesson (and the Playground) and which lessons are done.
// Only in this browser's localStorage; it can be empty or blocked (private windows), so every call is wrapped and
// the pages work without it.
const KEY = 'unidex-learn';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function getCode(where) { return load().code?.[where]; }
export function setCode(where, code) {
  const d = load();
  (d.code ||= {})[where] = code;
  save(d);
}
export function clearCode(where) {
  const d = load();
  if (d.code) delete d.code[where];
  save(d);
}

// Finished lessons, as "course/file" keys
export function isDone(where) { return !!load().done?.[where]; }
export function setDone(where) {
  const d = load();
  (d.done ||= {})[where] = Date.now();
  save(d);
}
