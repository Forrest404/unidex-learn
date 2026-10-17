// The code editor: a textarea over a coloured copy of the code, with line numbers. The same idea as the tools
// site's App editor (github.com/Forrest404/unidex, site/editor.js). Tab indents, Enter keeps the indent (one more
// after { in C++; after then, do, else, function(...) or { in Lua), typing } or end steps back, Ctrl/Cmd+Enter runs.
//   const ed = editor(box, { lang: 'cpp', value, onChange, onRun });
//   ed.value, ed.value = '...', ed.goTo(line), ed.markError(line or 0)
import { highlight } from './highlight.js';

const LINE = 20;  // px, matches .code in style.css
const RULES = {
  cpp: { indent: '    ', opens: /[{(]\s*$/, closes: '}' },
  lua: { indent: '  ', opens: /(\bthen|\bdo|\belse|\brepeat|\bfunction\b.*\)|[{(])\s*$/, closes: 'end' },
  json: { indent: '  ', opens: /[{[]\s*$/, closes: '}' },
};

export function editor(box, { lang, value = '', onChange = () => {}, onRun = () => {}, label = 'Code' } = {}) {
  const rules = () => RULES[lang] || RULES.cpp;
  box.classList.add('code');
  const gutter = document.createElement('div');
  gutter.className = 'gutter';
  gutter.setAttribute('aria-hidden', 'true');
  const area = document.createElement('div');
  area.className = 'area';
  const paint = document.createElement('pre');
  paint.setAttribute('aria-hidden', 'true');
  const text = document.createElement('textarea');
  Object.assign(text, { spellcheck: false, autocapitalize: 'off', autocomplete: 'off', wrap: 'off' });
  text.setAttribute('autocorrect', 'off');
  text.setAttribute('aria-label', label);
  area.append(paint, text);
  box.replaceChildren(gutter, area);

  let errLine = 0, lines = 0;
  function render() {
    paint.innerHTML = highlight(text.value, lang) + '\n ';
    const n = text.value.split('\n').length;
    if (n !== lines || gutter.dataset.err !== String(errLine)) {
      let g = '';
      for (let i = 1; i <= n; i++) g += `<div${i === errLine ? ' class="err"' : ''}>${i}</div>`;
      gutter.innerHTML = g;
      lines = n;
      gutter.dataset.err = errLine;
    }
    sync();
  }
  function sync() {
    paint.scrollTop = text.scrollTop;
    paint.scrollLeft = text.scrollLeft;
    gutter.scrollTop = text.scrollTop;
  }

  // Through execCommand, so Ctrl/Cmd+Z undoes it like typing
  function insert(s) {
    if (!document.execCommand('insertText', false, s)) {
      text.setRangeText(s, text.selectionStart, text.selectionEnd, 'end');
      text.dispatchEvent(new Event('input'));
    }
  }

  text.addEventListener('input', () => { errLine = 0; render(); onChange(text.value); });
  text.addEventListener('scroll', sync);
  text.addEventListener('keydown', e => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === 'Enter') { e.preventDefault(); onRun(); return; }
    const v = text.value, s = text.selectionStart, end = text.selectionEnd;
    const lineStart = v.lastIndexOf('\n', s - 1) + 1;
    const before = v.slice(lineStart, s);
    if (e.key === 'Tab' && !mod) {
      // Escape then Tab leaves the editor, so keyboard users aren't trapped in it
      if (text.dataset.escaped) return;
      e.preventDefault();
      const INDENT = rules().indent;
      if (s === end && !e.shiftKey) { insert(INDENT); return; }
      const blockEnd = v.indexOf('\n', end - (end > s && v[end - 1] === '\n' ? 1 : 0));
      const stop = blockEnd < 0 ? v.length : blockEnd;
      const block = v.slice(lineStart, stop);
      const changed = e.shiftKey ? block.replace(new RegExp(`^ {1,${INDENT.length}}`, 'gm'), '') : block.replace(/^/gm, INDENT);
      text.setSelectionRange(lineStart, stop);
      insert(changed);
      text.setSelectionRange(lineStart, lineStart + changed.length);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !mod) {
      e.preventDefault();
      const indent = before.match(/^\s*/)[0], INDENT = rules().indent;
      if (rules().opens.test(before)) {
        // Between { and }: the } goes on its own line below
        if (/^\s*[})]/.test(v.slice(s, v.indexOf('\n', s) < 0 ? v.length : v.indexOf('\n', s)))) {
          insert('\n' + indent + INDENT + '\n' + indent);
          const at = s + 1 + indent.length + INDENT.length;
          text.setSelectionRange(at, at);
        } else {
          insert('\n' + indent + INDENT);
        }
      } else {
        insert('\n' + indent);
      }
      return;
    }
    // The closing } (or Lua's end) on a line of its own steps back one level
    const closes = rules().closes, typed = before + e.key;
    if (s === end && e.key.length === 1 && typed.endsWith(closes) && /^\s+$/.test(typed.slice(0, -closes.length)) &&
        (closes === '}' || !/\w/.test(v[s] || ''))) {
      e.preventDefault();
      const INDENT = rules().indent, spaces = typed.slice(0, -closes.length);
      text.setSelectionRange(lineStart, s);
      insert(spaces.slice(0, Math.max(0, spaces.length - INDENT.length)) + closes);
    }
  });
  text.addEventListener('keydown', e => { if (e.key === 'Escape') text.dataset.escaped = '1'; else if (e.key !== 'Tab' && e.key !== 'Shift') delete text.dataset.escaped; });
  text.addEventListener('blur', () => delete text.dataset.escaped);

  text.value = value;
  render();

  return {
    textarea: text,
    get value() { return text.value; },
    set lang(l) { lang = l; render(); },
    set value(v) { text.value = v; errLine = 0; text.scrollTop = 0; render(); },
    focus() { text.focus(); },
    markError(line) { errLine = line; render(); },
    goTo(line) {
      const all = text.value.split('\n');
      const at = all.slice(0, line - 1).reduce((n, l) => n + l.length + 1, 0);
      text.focus();
      text.setSelectionRange(at, at + (all[line - 1] || '').length);
      text.scrollTop = Math.max(0, (line - 1) * LINE - text.clientHeight / 3);
      sync();
    },
  };
}
