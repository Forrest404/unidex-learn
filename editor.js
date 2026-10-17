// The code editor: a textarea over a coloured copy of the code, with line numbers. The same idea as the tools
// site's App editor (github.com/Forrest404/unidex, site/editor.js). Tab indents, Enter keeps the indent (one more
// after {), typing } steps back, Ctrl/Cmd+Enter runs.
//   const ed = editor(box, { lang: 'cpp', value, onChange, onRun });
//   ed.value, ed.value = '...', ed.goTo(line), ed.markError(line or 0)
import { highlight } from './highlight.js';

const INDENT = '    ';
const LINE = 20;  // px, matches .code in style.css

export function editor(box, { lang, value = '', onChange = () => {}, onRun = () => {}, label = 'Code' } = {}) {
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
      if (s === end && !e.shiftKey) { insert(INDENT); return; }
      const blockEnd = v.indexOf('\n', end - (end > s && v[end - 1] === '\n' ? 1 : 0));
      const stop = blockEnd < 0 ? v.length : blockEnd;
      const block = v.slice(lineStart, stop);
      const changed = e.shiftKey ? block.replace(/^ {1,4}/gm, '') : block.replace(/^/gm, INDENT);
      text.setSelectionRange(lineStart, stop);
      insert(changed);
      text.setSelectionRange(lineStart, lineStart + changed.length);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !mod) {
      e.preventDefault();
      const indent = before.match(/^\s*/)[0];
      if (/[{(]\s*$/.test(before)) {
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
    if (e.key === '}' && s === end && /^\s+$/.test(before)) {
      e.preventDefault();
      text.setSelectionRange(lineStart, s);
      insert(before.slice(0, Math.max(0, before.length - INDENT.length)) + '}');
    }
  });
  text.addEventListener('keydown', e => { if (e.key === 'Escape') text.dataset.escaped = '1'; else if (e.key !== 'Tab' && e.key !== 'Shift') delete text.dataset.escaped; });
  text.addEventListener('blur', () => delete text.dataset.escaped);

  text.value = value;
  render();

  return {
    textarea: text,
    get value() { return text.value; },
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
