// Check for app lessons: runs the learner's app on the virtual unidex, presses its buttons the way a person would,
// and looks at what each screen shows. It reads the screen through a one-line helper put in front of main.lua
// (SHIM), so the learner's line numbers stay the same: it has unidex.header, centered, text, hints and wrap print
// what they draw, rect and fill say they drew a box, and each draw() is marked (through _G's __newindex). Nothing
// in the firmware changes.
// A game (app.json "type": "game") opens from Games with the check's seed (X SEED) and plays one frame at a time
// (X MANUAL, X PLAY). Its helper (GAME_SHIM) also gives each box's place and size, and what step() and score()
// return, so a check can look at where things are, whether the round ended, and the score.
//   const r = await runChecks(emu, files, lesson.checks, progress)  ->  {ok} or {ok: false, message}
export const SEP = '\x1f';
const shim = (fns, wrap) => 'local __ck_u, __ck_p, __ck_s = unidex, print, string.char(31); ' +
  `for _, __ck_n in ipairs({${fns}}) do local __ck_f = __ck_u[__ck_n]; ` +
  '__ck_u[__ck_n] = function(...) local __ck_a = {__ck_n}; for i = 1, select("#", ...) do ' +
  '__ck_a[#__ck_a + 1] = tostring((select(i, ...))) end; __ck_p(__ck_s .. table.concat(__ck_a, __ck_s)); ' +
  `return __ck_f(...) end end; setmetatable(_G, {__newindex = function(t, k, v) ${wrap} rawset(t, k, v) end}); `;
export const SHIM = shim('"header", "centered", "text", "hints", "wrap", "rect", "fill"',
  'if k == "draw" and type(v) == "function" then local __ck_d = v; ' +
  'v = function(...) __ck_p(__ck_s .. "draw"); return __ck_d(...) end end;');
export const GAME_SHIM = shim('"header", "centered", "text", "hints", "wrap", "rect", "fill", "line"',
  'if (k == "draw" or k == "step" or k == "score") and type(v) == "function" then local __ck_d = v; ' +
  'v = function(...) if k == "draw" then __ck_p(__ck_s .. "draw") end; local __ck_r = __ck_d(...); ' +
  'if k ~= "draw" then __ck_p(__ck_s .. k .. __ck_s .. tostring(__ck_r)) end; return __ck_r end end;');

// Which arguments are the text: header(title, right), hints(a, b, holdB), centered(y, text), text(x, y, text),
// wrap(x, y, w, text)
const TEXT_ARGS = { header: [0, 1], hints: [0, 1, 2], centered: [1], text: [2], wrap: [3], rect: [], fill: [], line: [] };
// {day}, {month} and {year} in a check are today's: the virtual unidex's clock is this browser's
const today = s => {
  const d = new Date();
  return s.replace('{day}', d.getDate()).replace('{month}', d.getMonth() + 1).replace('{year}', d.getFullYear());
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const keyName = k => (k === k.toUpperCase() ? `hold ${k}` : k.toUpperCase());
const blank = () => Object.assign([], { rect: 0, fill: 0, boxes: [], calls: [] });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// box: x y w h, each [min, max] or null for any
const fits = (want, box) => want.every((r, i) => !r || (box[i] >= r[0] && box[i] <= r[1]));
const one = r => r && r[0] === r[1];
const part = (r, name) => (!r ? '' : one(r) ? `${name} ${r[0]}` : `${name} ${r[0]} to ${r[1]}`);
function describe([x, y, w, h]) {
  const sized = one(w) && one(h);
  const where = [part(x, 'x'), part(y, 'y'), ...(sized ? [] : [part(w, 'width'), part(h, 'height')])].filter(Boolean);
  return `${sized ? `a ${w[0]} x ${h[0]} box` : 'a box'}${where.length ? ` at ${where.join(', ')}` : ''}`;
}

export async function runChecks(emu, files, checks, progress = () => {}) {
  const { install, open, failure, onPrint, serially, dev, state } = emu;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const json = JSON.parse(dec.decode(files.find(f => f.path === 'app.json').bytes));
  const game = json.type === 'game';
  const main = files.find(f => f.path === 'main.lua');
  const shimmed = files.map(f => (f === main ? { path: f.path, bytes: enc.encode((game ? GAME_SHIM : SHIM) + dec.decode(f.bytes)) } : f));

  // Each draw() makes a frame: the strings it drew, and its boxes. A game's step() and score() say what they gave.
  let frames = [], id = null, stepped = 0, overAt = 0, score = null;
  const boxes = { rect: 0, fill: 0 };
  if (!runChecks.listening) {
    runChecks.listening = true;
    onPrint(text => runChecks.sink?.(text));
  }
  runChecks.sink = text => {
    if (!id || !text.startsWith(`${id}: ${SEP}`)) return;
    const [what, ...args] = text.slice(id.length + 3).split(SEP);
    if (what === 'draw') frames.push(blank());
    else if (what === 'step') { stepped++; if (args[0] === 'over') overAt = stepped; }
    else if (what === 'score') score = args[0];
    else if (frames.length && what in TEXT_ARGS) {
      const f = frames[frames.length - 1];
      f.calls.push([what, ...args].join(' '));
      if (what in boxes) {
        f[what]++;
        f.boxes.push(args.slice(0, 4).map(Number));
      } else f.push(...TEXT_ARGS[what].map(i => args[i]).filter(Boolean));
    }
  };
  const drawn = () => frames.length;
  async function waitForDraw(since, ms) {
    const end = Date.now() + ms;
    while (Date.now() < end && drawn() === since) await sleep(50);
    await sleep(250);  // the rest of that frame's lines
    return drawn() > since;
  }
  const screen = () => (frames.length ? frames[frames.length - 1] : blank());
  const showing = () => (screen().length ? screen().map(s => `"${s}"`).join(', ') : 'nothing');
  const send = (line, reply = line.split(' ').slice(0, 2).join(' ')) =>
    serially(async () => { await dev.send(line); return dev.expect(`OK ${reply}`, 30000); });
  const round = async () => (await state()).detail.split(':')[0];  // a game's: play, over, list or failed

  try {
    for (const [n, steps] of checks.entries()) {
      progress(checks.length > 1 ? `Checking ${n + 1} of ${checks.length}…` : 'Checking…');
      frames = [];
      stepped = overAt = 0;
      score = null;
      const entry = await install(shimmed, () => {}, { fresh: true });
      id = entry.id;
      // A game's first round has the seed on the check's first line, if that's a seed: line (else 1)
      const seed = steps[0]?.do === 'seed' ? steps[0].n : 1;
      let err = await open(entry, game ? { seed, manual: true } : undefined);
      if (err) return { ok: false, message: err };
      await waitForDraw(0, 4000);
      if (!drawn()) return { ok: false, message: `Your ${game ? 'game' : 'app'} opened, but nothing was drawn. Is there a draw() function?` };

      let did = game ? 'When the round starts' : 'When the app opens', stuck = null;  // stuck: a button after which the screen didn't redraw
      let played = 0, down = 0, rounds = 1, remembered = null, roundSeed = seed, nextSeed = seed;
      const hint = () => (stuck ? ` The screen didn't change after ${keyName(stuck)}. Does its function return "partial"?`
        : overAt ? ` The round ended after ${plural(overAt, 'frame')}.` : '');
      for (const step of steps) {
        if (step.do === 'press') {
          for (const k of step.keys) {
            const before = drawn();
            await serially(async () => { await dev.send(`X BTN ${k}`); await dev.expect('OK X BTN', 10000); });
            const redrew = await waitForDraw(before, 1500);
            if ((err = await failure())) return { ok: false, message: err };
            if (!redrew && k !== 'A' && !game) stuck = k;
          }
          did = `After pressing ${step.keys.map(keyName).join(', ')}`;
          if (stuck && !step.keys.includes(stuck)) stuck = null;
        } else if (step.do === 'reopen') {
          const before = drawn();
          err = await open(entry, game ? { seed, manual: true } : undefined);
          if (err) return { ok: false, message: err };
          await waitForDraw(before, 4000);
          did = 'After leaving the app and opening it again';
        } else if (step.do === 'has') {
          if (json[step.key] == null || json[step.key] === '') return { ok: false, message: `app.json needs "${step.key}".` };
        } else if (step.do === 'fills' || step.do === 'rects') {
          const fn = step.do === 'fills' ? 'fill' : 'rect', got = screen()[fn];
          if (got !== step.n) {
            return { ok: false, message: `${did}, the screen should have ${step.n} box${step.n === 1 ? '' : 'es'} drawn with unidex.${fn}. It had ${got}.${hint()}` };
          }

        // ---- games ----
        } else if (step.do === 'seed') {
          await send(`X SEED ${step.n}`);  // for the next round (the first round's was set as it opened)
          nextSeed = step.n;
        } else if (step.do === 'play') {
          // In parts that fit on one line to the device. Each part draws the frame it ends on.
          for (let i = 0; i < step.frames.length; i += 200) await send(`X PLAY ${step.frames.slice(i, i + 200)}`);
          await sleep(100);
          if ((err = await failure())) return { ok: false, message: err };
          played += step.frames.length;
          down += step.frames.split('1').length - 1;
          did = `After ${plural(played, 'frame')}${down ? ` with B down in ${down}` : ''}`;
        } else if (step.do === 'again') {
          const before = drawn();
          if ((await round()) === 'play') await send('X BTN A', 'X BTN');  // hold A: out of the round
          await send('X BTN b', 'X BTN');  // B: a new round, from the list or the game-over screen
          await waitForDraw(before, 4000);
          if ((err = await failure())) return { ok: false, message: err };
          played = down = stepped = overAt = 0;
          score = null;
          rounds++;
          roundSeed = nextSeed;
          did = 'When the next round starts';
        } else if (step.do === 'over' || step.do === 'playing') {
          const now = await round();
          if (step.do === 'over' && now !== 'over') {
            return { ok: false, message: `${did}, the round should be over (step() returns "over"). It's still going.` };
          }
          if (step.do === 'playing' && now !== 'play') {
            return { ok: false, message: `${did}, the round should still be going, but it ended${overAt ? ` after ${plural(overAt, 'frame')}` : ''}.` };
          }
        } else if (step.do === 'score') {
          if ((await round()) !== 'over') {
            return { ok: false, message: `${did}, the round should be over, with a score of ${step.n}. It's still going.` };
          }
          if (Number(score) !== step.n) {
            return { ok: false, message: `${did}, the score should be ${step.n}. score() gave ${score ?? 'nothing'}.` };
          }
        } else if (step.do === 'box') {
          if (!screen().boxes.some(b => fits(step.box, b))) {
            const had = screen().boxes.map(([x, y, w, h]) => `${w} x ${h} at x ${x}, y ${y}`).join('; ') || 'none';
            return { ok: false, message: `${did}, the screen should have ${describe(step.box)}. Its boxes were: ${had}.${hint()}` };
          }
        } else if (step.do === 'remember') {
          remembered = { calls: screen().calls.join('\n'), round: rounds, seed: roundSeed,
                         when: did.replace(/^When the (next )?round starts/, 'when the round started').replace(/^After/, 'after') };
        } else if (step.do === 'same' || step.do === 'changed') {
          const same = screen().calls.join('\n') === remembered.calls;
          const before = remembered.round < rounds;
          const then = `${remembered.when}${before ? ' in the round before' : ''}`;
          const seeds = !before ? '' : remembered.seed === roundSeed ? ' Both rounds had the same seed.' : ' The rounds had different seeds.';
          if (step.do === 'same' && !same) {
            return { ok: false, message: `${did}, the screen should look the same as it did ${then}. It's different.${seeds}` };
          }
          if (step.do === 'changed' && same) {
            return { ok: false, message: `${did}, the screen should look different from how it did ${then}. It's the same.${seeds || hint()}` };
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
    if (game) await emu.playLive().catch(() => {});  // Run plays in real time again
  }
}
