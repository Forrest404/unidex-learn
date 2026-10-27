// A stand-in for the virtual unidex's Games app, for testing game lessons and check.js without the emulator: it
// speaks to check.js the way unidex-emu.js does (install, open, state, failure, and X SEED, X PLAY and X BTN on its
// serial line), and plays the game in Lua (game-model.lua). Needs a Lua 5.4 or newer: LUA, or lua5.4, lua or lua5.5.
//   const emu = modelEmu(); ... await emu.close();
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

export const lua = [process.env.LUA, 'lua5.4', 'lua', 'lua5.5'].filter(Boolean)
  .find(bin => /Lua 5\.[4-9]/.test(spawnSync(bin, ['-v'], { encoding: 'utf8' }).stdout || ''));

export function modelEmu() {
  const dir = mkdtempSync(join(tmpdir(), 'learn-game-'));
  const printers = new Set(), replies = [];
  let proc = null, next = null, entry = null, seed = 0;
  let round = 'list', error = '';  // play, over, list or failed

  // One command to the game; its print()s go to the printers, and its END line is the answer
  const tell = cmd => new Promise(resolve => {
    next = resolve;
    proc.stdin.write(cmd + '\n');
  });
  function load(main) {
    proc?.kill();
    writeFileSync(join(dir, 'main.lua'), main);
    proc = spawn(lua, [new URL('./game-model.lua', import.meta.url).pathname, join(dir, 'main.lua'), entry.id]);
    createInterface({ input: proc.stdout }).on('line', line => {
      if (line.startsWith('LUA ')) printers.forEach(fn => fn(line.slice(4)));
      else if (line.startsWith('END ')) next?.(line.slice(4));
    });
  }
  async function command(cmd) {
    const r = await tell(cmd);
    round = r.split(' ')[0];
    error = round === 'failed' ? r.slice(7) : '';
  }
  const startRound = () => command(`start ${seed || Math.floor(Math.random() * 1e9)}`);

  let files = null;
  return {
    onPrint: fn => printers.add(fn),
    serially: work => work(),
    async install(list) {
      files = list;
      const json = JSON.parse(new TextDecoder().decode(list.find(f => f.path === 'app.json').bytes));
      entry = { ...json, name: json.name || json.id };
      round = 'list';
      return entry;
    },
    async open(e, opts = {}) {
      seed = opts.seed || 0;
      load(new TextDecoder().decode(files.find(f => f.path === 'main.lua').bytes));
      await startRound();
      return round === 'failed' ? error : null;
    },
    async state() { return { screen: 'Games', sel: '', detail: `${round}:${entry?.name}` }; },
    async failure() { return round === 'failed' ? error : null; },
    async playLive() {},
    dev: {
      async send(line) {
        const [, what, rest = ''] = /^X (\w+) ?(.*)$/.exec(line);
        if (what === 'SEED') seed = +rest;
        else if (what === 'PLAY' && round === 'play') await command(`play ${rest}`);
        else if (what === 'BTN' && rest === 'A' && round === 'play') round = 'list';
        else if (what === 'BTN' && rest === 'b' && (round === 'list' || round === 'over')) await startRound();
        replies.push(`OK X ${what}`);
      },
      async expect(prefix) {
        const i = replies.findIndex(r => r.startsWith(prefix));
        return i < 0 ? null : replies.splice(i, 1)[0];
      },
    },
    close() { proc?.kill(); },
  };
}
