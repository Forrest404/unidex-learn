// The virtual unidex's serial line for the lesson pages: vendor/emu-device.js (the tools site's), plus games.
// vendor/emu-device.js opens an app from Apps and a plugin from Badge. A game (app.json "type": "game") opens from
// Games, the way a person would: Home, Games, A until it's highlighted ("list:<name>" in X STATE), then B starts a
// round. open(entry, { seed, manual }) can set the round's seed (X SEED) and play it one frame at a time (X MANUAL),
// which is how Check plays a game (check.js).
import * as base from './vendor/emu-device.js';

export * from './vendor/emu-device.js';
const { dev, serially } = base;

const hex = h => new TextDecoder().decode(new Uint8Array((h.match(/../g) || []).map(x => parseInt(x, 16))));
async function stateNow() {
  await dev.send('X STATE');
  const r = await dev.expect('OK X STATE', 5000);
  if (!r) throw new Error("The emulator didn't answer.");
  const kv = Object.fromEntries(r.split(' ').slice(3).map(p => p.split('=')));
  return { screen: hex(kv.screen || ''), sel: hex(kv.sel || ''), detail: hex(kv.detail || ''), toast: hex(kv.toast || '') };
}
async function sendNow(line, reply = line.split(' ').slice(0, 2).join(' ')) {
  await dev.send(line);
  if (!(await dev.expect(`OK ${reply}`, 30000))) throw new Error(`The emulator didn't answer ${line}.`);
}
const pressNow = k => sendNow(`X BTN ${k}`, 'X BTN');

async function homeNow() {
  for (let i = 0; i < 6 && (await stateNow()).screen === 'Welcome'; i++) await pressNow('b');
  for (let i = 0; i < 6 && (await stateNow()).screen !== 'Home'; i++) await pressNow('A');
}

// What a failed game says: "failed:<name>:<the error>" (or just "failed:<name>")
let playing = '';
function gameError(detail) {
  const rest = detail.slice('failed:'.length);
  if (rest === playing) return 'Your game stopped with an error.';
  return rest.startsWith(`${playing}:`) ? rest.slice(playing.length + 1) : rest;
}

// Returns null when it's running, or what went wrong
export function open(entry, { seed = 0, manual = false } = {}) {
  if (entry.type !== 'game') return base.open(entry);
  return serially(async () => {
    await homeNow();
    await sendNow(`X SEED ${seed}`);
    await sendNow(`X MANUAL ${manual ? 1 : 0}`);
    for (let i = 0; i < 16 && (await stateNow()).sel !== 'Games'; i++) await pressNow('a');
    await pressNow('b');
    playing = entry.name;
    let s = await stateNow();
    for (let i = 0; i < 40 && s.detail !== `list:${entry.name}`; i++) { await pressNow('a'); s = await stateNow(); }
    if (s.detail !== `list:${entry.name}`) {
      return 'It isn\'t in the Games list. A game\'s app.json needs "type": "game" and "category": "games".';
    }
    await pressNow('b');
    s = await stateNow();
    if (s.detail.startsWith('failed:')) return gameError(s.detail);
    if (!s.detail.startsWith('play:')) return s.toast ? `The unidex says "${s.toast}".` : "The game didn't start.";
    return null;
  });
}

// The error on the screen now, if an app or a game has failed (null if not)
export async function failure() {
  const s = await base.state();
  if (s.screen === 'Games') return s.detail.startsWith('failed:') ? gameError(s.detail) : null;
  return base.failure();
}

// Back to playing in real time with a random seed, leaving a round Check was playing a frame at a time
export const playLive = () => serially(async () => {
  if ((await stateNow()).detail.startsWith('play:')) await pressNow('A');
  await sendNow('X MANUAL 0');
  await sendNow('X SEED 0');
});
