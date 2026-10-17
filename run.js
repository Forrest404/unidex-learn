// Runs a learner's program on a free online compiler: Compiler Explorer (godbolt.org) first, as it answers in about
// a second, and Wandbox (wandbox.org) if it can't be reached or is busy. Both are real compilers on real servers, so
// the code leaves this browser (PRIVACY.md).
//   const r = await run('cpp', code, input)
//   r.output     what the program printed
//   r.errors     [{line, col, text}] from the compiler (empty when it built)
//   r.message    the compiler's whole message, for showing as it is
//   r.status     'ok' | 'compile' (didn't build) | 'crash' (stopped with an error) | 'slow' (ran too long) |
//                'flood' (printed too much) | 'offline'
// The servers stop a program that never ends only after 20 to 60 seconds, so a small file built beside the
// learner's code (LIMIT) stops it after 5. The learner's own file isn't touched, so the line numbers in errors stay
// right.
const LIMIT_S = 5;
const LIMIT = `#include <csignal>
#include <cstdio>
#include <unistd.h>
static void stop(int) { std::fflush(stdout); _exit(142); }
static int limit = (std::signal(SIGALRM, stop), alarm(${LIMIT_S}), 0);
`;
const SLOW = 142;      // the exit code LIMIT stops with
const FLOOD = -1;      // printed so much that the server cut it off
const MAX_OUT = 20000; // characters of output to keep; a loop that prints forever makes megabytes

const LANGS = {
  cpp: { file: 'main.cpp', wandbox: 'gcc-13.2.0', limit: 'limit.cpp', flags: '-std=c++17', godbolt: 'g132' },
};

export const servers = {
  wandbox: 'https://wandbox.org/api/compile.json',
  godbolt: 'https://godbolt.org/api/compiler/',
};

async function post(url, body, ms) {
  const r = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(ms),
  });
  const host = new URL(url).host;
  if (!r.ok) throw new Error(`${host} said ${r.status}`);
  try { return await r.json(); } catch { throw new Error(`${host} sent back something unexpected`); }
}

async function wandbox(l, code, stdin) {
  const d = await post(servers.wandbox, {
    compiler: l.wandbox, code, stdin,
    codes: l.limit ? [{ file: l.limit, code: LIMIT }] : [],
    'compiler-option-raw': [l.flags, l.limit].filter(Boolean).join('\n'),
  }, 45000);
  const built = !/: (fatal )?error:/.test(d.compiler_error || '');
  return { message: d.compiler_error || '', built, output: d.program_output || '', stderr: d.program_error || '',
           code: built && d.status === '' ? FLOOD : Number(d.status || 0), file: 'prog.cc' };
}

async function godbolt(l, code, stdin) {
  const d = await post(`${servers.godbolt}${l.godbolt}/compile`, {
    source: code,
    files: l.limit ? [{ filename: l.limit, contents: LIMIT }] : [],
    options: { userArguments: [l.flags, l.limit].filter(Boolean).join(' '), executeParameters: { stdin },
               compilerOptions: { executorRequest: true }, filters: { execute: true } },
  }, 45000);
  // Output comes back as a list of lines
  const text = list => (list || []).map(x => x.text + '\n').join('').replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
  const built = d.buildResult ? d.buildResult.code === 0 : !!d.didExecute;
  return { message: text(d.buildResult?.stderr), built, output: text(d.stdout), stderr: text(d.stderr).trimEnd(),
           code: d.timedOut ? SLOW : d.truncated && d.code !== SLOW ? FLOOD : d.code, file: '<source>' };
}

export async function run(lang, code, stdin = '') {
  const l = LANGS[lang];
  if (!l) throw new Error(`Can't run ${lang} yet`);
  if (stdin && !stdin.endsWith('\n')) stdin += '\n';
  let r;
  try {
    r = await godbolt(l, code, stdin);
  } catch (e) {
    try {
      r = await wandbox(l, code, stdin);
    } catch (e2) {
      return { status: 'offline', output: '', errors: [], message: `Couldn't reach the compiler (${e.message}; ${e2.message}).` };
    }
  }
  const message = r.message.split(r.file).join(l.file).trim();
  const errors = [];
  for (const m of message.matchAll(new RegExp(`^${l.file.replace('.', '\\.')}:(\\d+):(\\d+): (?:fatal )?error: (.*)$`, 'gm'))) {
    errors.push({ line: +m[1], col: +m[2], text: m[3] });
  }
  let output = r.output;
  if (output.length > MAX_OUT) {
    output = output.slice(0, MAX_OUT) + '\n…';
    if (r.code !== SLOW) r.code = FLOOD;
  }
  const status = !r.built ? 'compile' : r.code === SLOW ? 'slow' : r.code === FLOOD ? 'flood' : r.code === 0 ? 'ok' : 'crash';
  return { status, output, errors, message, stderr: r.stderr, code: r.code, limit: LIMIT_S };
}
