// Turns a lesson file (a small Markdown) into HTML and the exercise. What a lesson file can have:
//   # Title                    the lesson's name
//   ## Heading, ### Heading    sections
//   text, - lists, 1. lists, `code`, **bold**, *italic*, [links](https://…)
//   ```cpp       an example, shown coloured with a Run button
//   ```input     straight after an example: what that example reads when it's run
//   ```output    what the example above prints (the lesson tests check it really does)
//   ```text      shown as it is
//   ```starter   the code the editor starts with
//   ```solution  one right answer, hidden until asked for
//   ```test      input: (lines the program reads)  output: (what it must print). A lesson can have several.
// App courses (runner "unidex") also have:
//   ```starter app.json / ```solution app.json   the app.json to start from, and the answer's (else the course's)
//   ```check     steps run on the virtual unidex, one per line: press: b b B (capitals are holds), reopen,
//                shows: text, hides: text ({day} {month} {year} are today's), fills: n, rects: n (boxes drawn),
//                has: key (app.json has it). A lesson can have several; each starts the app afresh.
//                Games (app.json "type": "game") also have: play: 0*30 1*5 (frames, B up 0 or down 1, *n repeats),
//                seed: n, again (a new round), over, playing, score: n, box: x y w h (each a number, a-b or *),
//                remember, then same or changed (the screen against the one remembered).
import { highlight } from './highlight.js';

const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function inline(s) {
  const code = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${code.push(c) - 1}\u0000`);
  s = esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\.?\/|[\w-]+\.html)[^)\s]*)\)/g, (_, t, href) =>
      `<a href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(code[i])}</code>`);
}

function parseTest(body) {
  const m = /^input:[ \t]*\n?([\s\S]*?)^output:[ \t]*\n?([\s\S]*)$/m.exec(body) || /^output:[ \t]*\n?([\s\S]*)$/m.exec(body);
  if (!m) throw new Error('A test block needs an "output:" line');
  return m.length === 3 ? { input: m[1], output: m[2] } : { input: '', output: m[1] };
}

function parseCheck(lines) {
  const steps = [];
  for (const l of lines.map(x => x.trim()).filter(Boolean)) {
    let m;
    if ((m = /^press:\s*([abAB](?:\s+[abAB])*)$/.exec(l))) steps.push({ do: 'press', keys: m[1].split(/\s+/) });
    else if (l === 'reopen') steps.push({ do: 'reopen' });
    else if ((m = /^(shows|hides):\s*(.+)$/.exec(l))) steps.push({ do: m[1], text: m[2] });
    else if ((m = /^(fills|rects):\s*(\d+)$/.exec(l))) steps.push({ do: m[1], n: +m[2] });
    else if ((m = /^has:\s*([\w-]+)$/.exec(l))) steps.push({ do: 'has', key: m[1] });
    // Games
    else if ((m = /^play:\s*([01]+(?:\*\d+)?(?:\s+[01]+(?:\*\d+)?)*)$/.exec(l))) {
      steps.push({ do: 'play', frames: m[1].split(/\s+/).map(g => { const [b, n = 1] = g.split('*'); return b.repeat(+n); }).join('') });
    } else if ((m = /^(seed|score):\s*(-?\d+)$/.exec(l))) steps.push({ do: m[1], n: +m[2] });
    else if (/^(again|over|playing|remember|same|changed)$/.test(l)) steps.push({ do: l });
    else if ((m = /^box:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/.exec(l)) && m.slice(1).every(n => /^(\*|-?\d+|\d+-\d+)$/.test(n))) {
      steps.push({ do: 'box', box: m.slice(1).map(n => (n === '*' ? null : n.includes('-', 1) ? n.split('-').map(Number) : [+n, +n])) });
    } else throw new Error(`A check step I don't know: "${l}"`);
  }
  return steps;
}

export function parse(src, lang = 'cpp') {
  const lesson = { title: '', html: '', examples: [], inputs: [], outputs: [], starter: '', solution: '', tests: [],
                   starterJson: null, solutionJson: null, checks: [] };
  const out = [];
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  let para = [], list = null;
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
    if (list) out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const fence = /^```(\w*)(?:[ \t]+([\w.-]+))?\s*$/.exec(l);
    if (fence) {
      flush();
      const body = [];
      while (++i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i]);
      const code = body.join('\n') + '\n';
      const kind = fence[1] || 'text';
      if (fence[2] === 'app.json' && (kind === 'starter' || kind === 'solution')) lesson[`${kind}Json`] = code;
      else if (kind === 'starter') lesson.starter = code;
      else if (kind === 'solution') lesson.solution = code;
      else if (kind === 'check') lesson.checks.push(parseCheck(body));
      else if (kind === 'test') lesson.tests.push(parseTest(body.join('\n')));
      else if (kind === lang) {
        const n = lesson.examples.push(code) - 1;
        lesson.inputs.push('');
        out.push(`<div class="example" data-example="${n}"><pre><code>${highlight(code.trimEnd(), lang)}</code></pre></div>`);
      } else if (kind === 'input' || kind === 'output') {
        // Both belong to the example just above, and are shown inside it
        const n = lesson.examples.length - 1;
        if (n < 0 || !out[out.length - 1].startsWith('<div class="example"')) {
          throw new Error(`An ${kind} block goes straight after an example`);
        }
        (kind === 'input' ? lesson.inputs : lesson.outputs)[n] = code;
        const label = kind === 'input' ? 'When it runs, the input is:' : 'It prints:';
        out[out.length - 1] = out[out.length - 1].replace(/<\/div>$/,
          `<p class="input-label">${label}</p><pre class="plain ${kind === 'input' ? 'input' : 'expected'}"><code>${esc(code.trimEnd())}</code></pre></div>`);
      } else {
        out.push(`<pre class="plain"><code>${esc(code.trimEnd())}</code></pre>`);
      }
      continue;
    }
    let m;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(l))) {
      flush();
      if (m[1] === '#') lesson.title = m[2].trim();
      else out.push(`<h${m[1].length}>${inline(m[2].trim())}</h${m[1].length}>`);
    } else if ((m = /^\s*(-|\d+\.)\s+(.*)$/.exec(l))) {
      const tag = m[1] === '-' ? 'ul' : 'ol';
      if (para.length || (list && list.tag !== tag)) flush();
      (list ||= { tag, items: [] }).items.push(m[2]);
    } else if (!l.trim()) {
      flush();
    } else if (list && /^\s+\S/.test(l)) {
      list.items[list.items.length - 1] += ' ' + l.trim();  // a list item carried on to the next line
    } else {
      if (list) flush();
      para.push(l.trim());
    }
  }
  flush();
  lesson.html = out.join('\n');
  return lesson;
}

// Does what the program printed match what the test expects? Spaces at the ends of lines and blank lines at the
// end don't count; everything else does.
const tidy = s => s.replace(/\r/g, '').split('\n').map(l => l.trimEnd()).join('\n').replace(/\n+$/, '');
export const matches = (printed, expected) => tidy(printed) === tidy(expected);
