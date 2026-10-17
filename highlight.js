// Code colouring. Each language is one regex that finds the pieces (comments, strings, numbers, words) and a
// function that names each piece; the editor and the lesson examples both use highlight(). To add a language,
// add an entry to LANGS.
const words = s => new Set(s.split(' '));

const CPP_KW = words('if else while for do switch case default break continue return true false nullptr new delete ' +
  'class struct public private protected using namespace const static auto void this sizeof template typename try catch throw');
const CPP_TYPE = words('int double float char bool long short unsigned signed string vector size_t std cout cin endl');

const LANGS = {
  cpp: {
    re: /(\/\*[\s\S]*?(?:\*\/|(?![\s\S])))|(\/\/[^\n]*)|(^[ \t]*#[ \t]*\w+)(?:([ \t]*<[^>\n]*>?))?|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?[fFlLuU]*\b|\.\d+\b)|([A-Za-z_]\w*)/gm,
    kind(m, src, end) {
      if (m[1] || m[2]) return 'com';
      if (m[3]) return 'kw';
      if (m[5]) return 'str';
      if (m[6]) return 'num';
      if (CPP_KW.has(m[0])) return 'kw';
      if (CPP_TYPE.has(m[0])) return 'type';
      if (/^\s*\(/.test(src.slice(end, end + 20))) return 'call';
      return null;
    },
  },
};

// The code split into [kind, text] pieces (kind is null for plain text). Joining the texts gives back the code.
export function tokens(src, lang) {
  const def = LANGS[lang];
  if (!def) return [[null, src]];
  const out = [];
  const plain = t => { if (t) out.push([null, t]); };
  let last = 0, m;
  def.re.lastIndex = 0;
  while ((m = def.re.exec(src))) {
    if (!m[0].length) { def.re.lastIndex++; continue; }
    plain(src.slice(last, m.index));
    if (m[3]) {  // #include <iostream>: the directive, then the header name
      out.push(['kw', m[3]]);
      if (m[4]) { plain(m[4].match(/^\s*/)[0]); out.push(['str', m[4].trimStart()]); }
    } else {
      out.push([def.kind(m, src, def.re.lastIndex), m[0]]);
    }
    last = def.re.lastIndex;
  }
  plain(src.slice(last));
  return out;
}

const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

// The code as HTML, every piece escaped, coloured by the .tk-* classes in style.css
export function highlight(src, lang) {
  return tokens(src, lang).map(([k, t]) => (k ? `<span class="tk-${k}">${esc(t)}</span>` : esc(t))).join('');
}
