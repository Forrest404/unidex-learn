// Check for app lessons: runs the learner's app on the virtual unidex, presses its buttons the way a person would,
// and looks at what each screen shows. It reads the screen through a one-line helper put in front of main.lua
// (SHIM), so the learner's line numbers stay the same: it has unidex.header, centered, text, hints and wrap print
// what they draw, rect and fill say they drew a box, and each draw() is marked (through _G's __newindex). Nothing
// in the firmware changes.
//   const r = await runChecks(emu, files, lesson.checks, progress)  ->  {ok} or {ok: false, message}
export const SEP = '\x1f';
export const SHIM = 'local __ck_u, __ck_p, __ck_s = unidex, print, string.char(31); ' +
  'for _, __ck_n in ipairs({"header", "centered", "text", "hints", "wrap", "rect", "fill"}) do local __ck_f = __ck_u[__ck_n]; ' +
  '__ck_u[__ck_n] = function(...) local __ck_a = {__ck_n}; for i = 1, select("#", ...) do ' +
  '__ck_a[#__ck_a + 1] = tostring((select(i, ...))) end; __ck_p(__ck_s .. table.concat(__ck_a, __ck_s)); ' +
  'return __ck_f(...) end end; setmetatable(_G, {__newindex = function(t, k, v) ' +
  'if k == "draw" and type(v) == "function" then local __ck_d = v; ' +
  'v = function(...) __ck_p(__ck_s .. "draw"); return __ck_d(...) end end; rawset(t, k, v) end}); ';

// Which arguments are the text: header(title, right), hints(a, b, holdB), centered(y, text), text(x, y, text),
// wrap(x, y, w, text)
const TEXT_ARGS = { header: [0, 1], hints: [0, 1, 2], centered: [1], text: [2], wrap: [3], rect: [], fill: [] };
// {day}, {month} and {year} in a check are today's: the virtual unidex's clock is this browser's
const today = s => {
  const d = new Date();
  return s.replace('{day}', d.getDate()).replace('{month}', d.getMonth() + 1).replace('{year}', d.getFullYear());
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const keyName = k => (k === k.toUpperCase() ? `hold ${k}` : k.toUpperCase());

export async function runChecks(emu, files, checks, progress = () => {}) {
  const { install, open, failure, onPrint, serially, dev } = emu;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const main = files.find(f => f.path === 'main.lua');
  const shimmed = files.map(f => (f === main ? { path: f.path, bytes: enc.encode(SHIM + dec.decode(f.bytes)) } : f));

  // Each draw() makes a frame: the strings it drew, and how many boxes
  let frames = [], id = null;
  const boxes = { rect: 0, fill: 0 };
  if (!runChecks.listening) {
    runChecks.listening = true;
    onPrint(text => runChecks.sink?.(text));
  }
  runChecks.sink = text => {
    if (!id || !text.startsWith(`${id}: ${SEP}`)) return;
    const [what, ...args] = text.slice(id.length + 3).split(SEP);
    if (what === 'draw') frames.push(Object.assign([], { rect: 0, fill: 0 }));
    else if (frames.length) {
      const f = frames[frames.length - 1];
      if (what in boxes) f[what]++;
      else f.push(...TEXT_ARGS[what].map(i => args[i]).filter(Boolean));
    }
  };
  const drawn = () => frames.length;
  async function waitForDraw(since, ms) {
    const end = Date.now() + ms;
    while (Date.now() < end && drawn() === since) await sleep(50);
    await sleep(250);  // the rest of that frame's lines
    return drawn() > since;
  }
  const screen = () => (frames.length ? frames[frames.length - 1] : Object.assign([], { rect: 0, fill: 0 }));
  const showing = () => (screen().length ? screen().map(s => `"${s}"`).join(', ') : 'nothing');

  try {
    for (const [n, steps] of checks.entries()) {
      progress(checks.length > 1 ? `Checking ${n + 1} of ${checks.length}…` : 'Checking…');
      frames = [];
      const entry = await install(shimmed, () => {}, { fresh: true });
      id = entry.id;
      let err = await open(entry);
      if (err) return { ok: false, message: err };
      await waitForDraw(0, 4000);
      if (!drawn()) return { ok: false, message: 'Your app opened, but nothing was drawn. Is there a draw() function?' };

      let did = 'When the app opens', stuck = null;  // stuck: a button after which the screen didn't redraw
      const hint = () => (stuck ? ` The screen didn't change after ${keyName(stuck)}. Does its function return "partial"?` : '');
      for (const step of steps) {
        if (step.do === 'press') {
          for (const k of step.keys) {
            const before = drawn();
            await serially(async () => { await dev.send(`X BTN ${k}`); await dev.expect('OK X BTN', 10000); });
            const redrew = await waitForDraw(before, 1500);
            if ((err = await failure())) return { ok: false, message: err };
            if (!redrew && k !== 'A') stuck = k;
          }
          did = `After pressing ${step.keys.map(keyName).join(', ')}`;
          if (stuck && !step.keys.includes(stuck)) stuck = null;
        } else if (step.do === 'reopen') {
          const before = drawn();
          err = await open(entry);
          if (err) return { ok: false, message: err };
          await waitForDraw(before, 4000);
          did = 'After leaving the app and opening it again';
        } else if (step.do === 'has') {
          const json = JSON.parse(dec.decode(files.find(f => f.path === 'app.json').bytes));
          if (json[step.key] == null || json[step.key] === '') return { ok: false, message: `app.json needs "${step.key}".` };
        } else if (step.do === 'fills' || step.do === 'rects') {
          const fn = step.do === 'fills' ? 'fill' : 'rect', got = screen()[fn];
          if (got !== step.n) {
            return { ok: false, message: `${did}, the screen should have ${step.n} box${step.n === 1 ? '' : 'es'} drawn with unidex.${fn}. It had ${got}.${hint()}` };
          }
        } else {
          const text = today(step.text), has = screen().some(s => s.includes(text));
          if (step.do === 'shows' && !has) {
            return { ok: false, message: `${did}, the screen should show "${text}". It showed ${showing()}.${hint()}` };
          }
          if (step.do === 'hides' && has) {
            return { ok: false, message: `${did}, the screen shouldn't show "${text}" any more. It showed ${showing()}.${hint()}` };
          }
        }
      }
    }
    return { ok: true };
  } finally {
    id = null;
  }
}
