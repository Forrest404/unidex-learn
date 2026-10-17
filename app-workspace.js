// The app workspace on a lesson page: main.lua and app.json in tabs, the virtual unidex (device.js) beside what the
// app prints, and Run, which installs the app on it and opens it the way a person would (vendor/emu-device.js).
// An example in the text runs on the same unidex, under its own id, so it never touches the learner's app or data.
import { el } from './chrome.js';
import { editor } from './editor.js';
import { highlight } from './highlight.js';
import { startDevice } from './device.js';
import { zip, download } from './zip.js';
import { getCode, setCode, clearCode } from './progress.js';

const $ = id => document.getElementById(id);
const enc = new TextEncoder();
const EXAMPLE_JSON = '{\n  "id": "example",\n  "name": "Example",\n  "version": "1.0.0",\n  "api": 1,\n  "type": "app"\n}\n';

export function appWorkspace({ course, lesson, where, finished }) {
  $('app-ws').hidden = false;
  const starterJson = lesson.starterJson || course.appJson;
  const files = {
    'main.lua': { lang: 'lua', key: where, start: lesson.starter },
    'app.json': { lang: 'json', key: `${where}#app.json`, start: starterJson },
  };
  for (const f of Object.values(files)) f.text = getCode(f.key) ?? f.start;
  let active = 'main.lua';

  // ---- the editor, one file at a time ----
  let timer;
  const ed = editor($('app-code'), {
    lang: 'lua', label: 'Your code', value: files[active].text,
    onChange: v => {
      const f = files[active];
      f.text = v;
      clearTimeout(timer);
      timer = setTimeout(() => setCode(f.key, v), 300);
    },
    onRun: () => $('app-run').click(),
  });
  const tabs = { 'main.lua': $('tab-main'), 'app.json': $('tab-json') };
  function show(path) {
    active = path;
    for (const [p, b] of Object.entries(tabs)) b.setAttribute('aria-selected', String(p === path));
    ed.lang = files[path].lang;
    ed.value = files[path].text;
  }
  for (const [p, b] of Object.entries(tabs)) b.onclick = () => show(p);

  // ---- the output ----
  const out = $('app-output');
  const say = (text, kind) => {
    const line = el('div', { class: kind || '', text });
    out.append(line);
    out.scrollTop = out.scrollHeight;
    return line;
  };
  function showError(msg) {
    const line = say(msg, 'err');
    const m = /\b(main\.lua|app\.json):(\d+):/.exec(msg);
    if (!m) return;
    const goTo = () => { if (active !== m[1]) show(m[1]); ed.goTo(+m[2]); };
    line.append(el('button', { type: 'button', class: 'secondary', text: `Go to line ${m[2]}`, onclick: goTo }));
    if (active === m[1]) ed.markError(+m[2]);
  }

  // ---- the virtual unidex ----
  const device = startDevice({ canvas: $('screen'), btnA: $('btnA'), btnB: $('btnB') });
  const emu = device.then(() => import('./vendor/emu-device.js'));
  device.catch(e => say(`The unidex didn't start: ${e.message}. Check you're online and reload the page.`, 'err'));
  let running = null;  // the id of the app on the screen, for its print()s
  emu.then(({ onPrint }) => onPrint(text => {
    if (text.includes('\x1f')) return;  // what Check's helper prints (check.js)
    const m = /^([a-z0-9-]+): ([\s\S]*)$/.exec(text);
    if (m && m[1] === running) say(m[2]);
  }));

  // An app can fail later, when a button is pressed: look now and then, and say so once
  let busy = false, lastFailure = null;
  setInterval(async () => {
    if (!running || busy || document.hidden) return;
    try {
      const { failure } = await emu;
      const f = await failure();
      if (f && f !== lastFailure) showError(f);
      lastFailure = f;
    } catch { /* the emulator is busy */ }
  }, 1500);

  const work = [$('app-run'), $('app-check')];
  async function runOnDevice(list, { fresh = false, buttons = work } = {}) {
    busy = true;
    buttons.forEach(b => { b.disabled = true; });
    out.replaceChildren();
    const status = say('Starting the unidex…', 'muted');
    try {
      const { install, open } = await emu;
      status.textContent = 'Putting it on the unidex…';
      const entry = await install(list, () => {}, { fresh });
      running = entry.id;
      const err = await open(entry);
      lastFailure = err;
      status.remove();
      if (err) showError(err);
      else say(`${entry.name} is running. Press A and B to try it.`, 'ok');
      $('screen').closest('.device').focus({ preventScroll: true });
      $('screen').scrollIntoView({ block: 'nearest' });
      return { entry, err };
    } catch (e) {
      status.remove();
      showError(e.message || String(e));
      return { err: e.message };
    } finally {
      busy = false;
      buttons.forEach(b => { b.disabled = false; });
    }
  }

  // app.json first, so a mistake in it is named with its line
  function appFiles() {
    try { JSON.parse(files['app.json'].text); } catch (e) {
      const at = /position (\d+)/.exec(e.message), line = /line (\d+)/.exec(e.message);
      const n = line ? +line[1] : at ? files['app.json'].text.slice(0, +at[1]).split('\n').length : 1;
      throw new Error(`app.json:${n}: this isn't valid JSON (${e.message.replace(/^JSON\.parse: /, '')}).`);
    }
    return Object.entries(files).map(([path, f]) => ({ path, bytes: enc.encode(f.text) }));
  }
  $('app-run').onclick = () => {
    let list;
    try { list = appFiles(); } catch (e) { out.replaceChildren(); showError(e.message); return; }
    runOnDevice(list);
  };

  // ---- Check: runs the app with the lesson's check steps (check.js) ----
  if (!lesson.checks.length) $('app-check').hidden = true;
  $('app-check').onclick = async () => {
    let list;
    try { list = appFiles(); } catch (e) { out.replaceChildren(); showError(e.message); return; }
    busy = true;
    work.forEach(b => { b.disabled = true; });
    out.replaceChildren();
    const status = say('Checking…', 'muted');
    out.setAttribute('aria-busy', 'true');
    try {
      const { runChecks } = await import('./check.js');
      const r = await runChecks(await emu, list, lesson.checks, t => { status.textContent = t; });
      running = null;  // the helper's copy is on the screen now; Run puts the real one back
      status.remove();
      if (r.ok) {
        say("That's right. Well done!", 'ok');
        $('app-done').hidden = false;
        finished();
      } else {
        say('Not quite yet.', 'err');
        showError(r.message);
      }
    } catch (e) {
      status.remove();
      showError(e.message || String(e));
    } finally {
      out.removeAttribute('aria-busy');
      busy = false;
      work.forEach(b => { b.disabled = false; });
    }
  };

  // ---- examples in the text run on the same unidex ----
  for (const box of $('text').querySelectorAll('.example')) {
    const btn = el('button', { type: 'button', class: 'secondary small', text: 'Run', 'aria-label': 'Run this example on the unidex' });
    btn.onclick = () => runOnDevice([
      { path: 'main.lua', bytes: enc.encode(lesson.examples[+box.dataset.example]) },
      { path: 'app.json', bytes: enc.encode(EXAMPLE_JSON) },
    ], { buttons: [...work, btn] });  // its saved data stays, as on a real unidex (lesson 7's example counts visits)
    box.append(el('div', { class: 'run-bar' }, btn));
  }

  // ---- start again, the answer, download ----
  $('app-reset').onclick = () => {
    for (const f of Object.values(files)) { f.text = f.start; clearCode(f.key); }
    show(active);
    ed.focus();
  };
  $('app-answer-code').innerHTML = highlight(lesson.solution.trimEnd(), 'lua');
  if (lesson.solutionJson) {  // the answer is (partly) in app.json: show both, named
    const pre = $('app-answer-code').parentElement;
    pre.before(el('p', { class: 'input-label', text: 'main.lua' }));
    const json = el('pre', {}, el('code'));
    json.firstChild.innerHTML = highlight(lesson.solutionJson.trimEnd(), 'json');
    pre.after(el('p', { class: 'input-label', text: 'app.json' }), json);
  }
  if (!lesson.solution) $('app-show-answer').hidden = true;
  $('app-show-answer').onclick = () => {
    const open = $('app-answer').hidden;
    $('app-answer').hidden = !open;
    $('app-show-answer').setAttribute('aria-expanded', String(open));
    $('app-show-answer').textContent = open ? 'Hide the answer' : 'Show the answer';
  };
  $('app-download').onclick = () => {
    let id = 'my-app';
    try { id = JSON.parse(files['app.json'].text).id || id; } catch { /* keeps my-app */ }
    id = String(id).replace(/[^a-z0-9-]/g, '') || 'my-app';
    download(zip(Object.entries(files).map(([path, f]) => ({ name: `${id}/${path}`, bytes: enc.encode(f.text) }))), `${id}.zip`);
    out.replaceChildren();
    say(`Downloaded ${id}.zip.`, 'muted');
  };

  // Onto their own unidex, over USB
  $('app-install').onclick = async () => {
    let list;
    try { list = appFiles(); } catch (e) { out.replaceChildren(); showError(e.message); return; }
    const btn = $('app-install');
    btn.disabled = true;
    out.replaceChildren();
    const status = say('Plug in your unidex, press one of its buttons to wake it, then pick it from the list.', 'muted');
    try {
      const { installOnUnidex } = await import('./install-device.js');
      const name = await installOnUnidex(list, t => { status.textContent = t; });
      status.remove();
      say(`${name} is on your unidex. Find it under Apps.`, 'ok');
    } catch (e) {
      status.remove();
      say(e.message || String(e), 'err');
    } finally {
      btn.disabled = false;
    }
  };

  // For check.js and the tests
  window.appWorkspace = { files, ed, show, runOnDevice, appFiles, say, showError, out, work, emu };
  return () => { $('app-done').hidden = false; };
}
