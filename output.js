// Shows a run's result in an output box, in plain words: what the program printed, or why it didn't build with a
// "Go to line" button for each error, or why it stopped.
import { run } from './run.js';

function line(box, text, kind) {
  const d = document.createElement('div');
  if (kind) d.className = kind;
  d.textContent = text;
  box.append(d);
  return d;
}

export function show(box, r, ed) {
  box.replaceChildren();
  if (r.status === 'offline') {
    line(box, `${r.message} Check you're online and try again.`, 'err');
    return;
  }
  if (r.status === 'compile') {
    line(box, "It didn't build. The compiler says:", 'err');
    for (const text of r.message.split('\n')) {
      const m = /^main\.cpp:(\d+):\d+: (?:fatal )?error:/.exec(text);
      const l = line(box, text, m ? 'err' : 'muted');
      if (m && ed) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'secondary';
        b.textContent = `Go to line ${m[1]}`;
        b.onclick = () => ed.goTo(+m[1]);
        l.append(b);
      }
    }
    if (ed && r.errors[0]) ed.markError(r.errors[0].line);
    return;
  }
  if (r.output) line(box, r.output);
  else if (r.status === 'ok') line(box, '(Nothing was printed.)', 'muted');
  if (r.stderr) line(box, r.stderr, 'err');
  if (r.status === 'slow') line(box, `Stopped after ${r.limit} seconds. Is there a loop that never ends?`, 'err');
  if (r.status === 'flood') line(box, 'Stopped because it printed too much. Is there a loop that never ends?', 'err');
  if (r.status === 'crash') {
    line(box, r.code > 128 ? `Your program crashed (code ${r.code}).` : `Your program finished with code ${r.code}.`,
         r.code > 128 ? 'err' : 'muted');
  }
}

// While something runs: the buttons that could start another run are off, and the box says what's happening
export function busy(box, text, buttons = []) {
  for (const b of buttons) b.disabled = true;
  box.hidden = false;
  box.replaceChildren();
  line(box, text, 'muted');
  box.setAttribute('aria-busy', 'true');
  return () => {
    box.removeAttribute('aria-busy');
    for (const b of buttons) b.disabled = false;
    box.scrollIntoView({ block: 'nearest' });
  };
}

// Run button helper: shows "Running…", runs, shows the result
export async function runInto(box, { lang, code, stdin, ed, buttons }) {
  const done = busy(box, 'Running…', buttons);
  try {
    const r = await run(lang, code, stdin);
    show(box, r, ed);
    return r;
  } finally {
    done();
  }
}
