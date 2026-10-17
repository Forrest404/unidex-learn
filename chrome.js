// The parts every page shares: the header with its menus (a drawer on narrow screens) and the footer. Each page has
// <header data-chrome></header> and <footer data-chrome></footer> and loads this module. A trimmed copy of the
// tools site's chrome.js (github.com/Forrest404/unidex, site/chrome.js), so both sites look and work the same.

const REPO = 'https://github.com/Forrest404/unidex-learn';
const SHOP = 'https://www.unidex.shop';
const TOOLS = 'https://tools.unidex.shop';

// One icon set: 24x24, stroked (styled by .icon in style.css)
const ICONS = {
  code: '<path d="m8 8-5 4 5 4"/><path d="m16 8 5 4-5 4"/><path d="m14 4-4 16"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M8 7h7"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  tools: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
};

const NS = 'http://www.w3.org/2000/svg';
export function icon(name, cls = 'icon') {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = ICONS[name] || ICONS.code;  // (fixed strings above, never data)
  return svg;
}

// The logo: the Pet robot and the name in pixels, in the text colour so it follows the theme.
const LOGO_D = 'M87.07 0h12.44v6.58h-12.44zM80.85 6.58h24.88v6.58h-24.88zM24.88 13.16h18.66v6.58h-18.66zM80.85 13.16h24.88v6.58h-24.88zM18.66 19.75h6.22v6.58h-6.22zM43.54 19.75h6.22v6.58h-6.22zM87.07 19.75h12.44v6.58h-12.44zM12.44 26.33h12.44v6.58h-12.44zM43.54 26.33h12.44v6.58h-12.44zM87.07 26.33h12.44v6.58h-12.44zM6.22 32.91h6.22v6.58h-6.22zM24.88 32.91h18.66v6.58h-18.66zM55.98 32.91h111.95v6.58h-111.95zM6.22 39.49h6.22v6.58h-6.22zM24.88 39.49h18.66v6.58h-18.66zM55.98 39.49h118.17v6.58h-118.17zM6.22 46.07h6.22v6.58h-6.22zM24.88 46.07h18.66v6.58h-18.66zM55.98 46.07h6.22v6.58h-6.22zM161.71 46.07h12.44v6.58h-12.44zM12.44 52.65h12.44v6.58h-12.44zM43.54 52.65h12.44v6.58h-12.44zM161.71 52.65h12.44v6.58h-12.44zM12.44 59.24h12.44v6.58h-12.44zM43.54 59.24h6.22v6.58h-6.22zM161.71 59.24h12.44v6.58h-12.44zM12.44 65.82h31.1v6.58h-31.1zM161.71 65.82h12.44v6.58h-12.44zM12.44 72.4h12.44v6.58h-12.44zM161.71 72.4h12.44v6.58h-12.44zM12.44 78.98h12.44v6.58h-12.44zM161.71 78.98h12.44v6.58h-12.44zM12.44 85.56h12.44v6.58h-12.44zM161.71 85.56h12.44v6.58h-12.44zM0 92.14h24.88v6.58h-24.88zM49.76 92.14h12.44v6.58h-12.44zM124.39 92.14h12.44v6.58h-12.44zM161.71 92.14h24.88v6.58h-24.88zM0 98.73h24.88v6.58h-24.88zM43.54 98.73h24.88v6.58h-24.88zM118.17 98.73h24.88v6.58h-24.88zM161.71 98.73h24.88v6.58h-24.88zM0 105.31h24.88v6.58h-24.88zM43.54 105.31h24.88v6.58h-24.88zM118.17 105.31h24.88v6.58h-24.88zM161.71 105.31h24.88v6.58h-24.88zM12.44 111.89h12.44v6.58h-12.44zM49.76 111.89h12.44v6.58h-12.44zM124.39 111.89h12.44v6.58h-12.44zM161.71 111.89h12.44v6.58h-12.44zM12.44 118.47h12.44v6.58h-12.44zM161.71 118.47h12.44v6.58h-12.44zM12.44 125.05h12.44v6.58h-12.44zM68.41 125.05h6.22v6.58h-6.22zM111.95 125.05h6.22v6.58h-6.22zM161.71 125.05h12.44v6.58h-12.44zM12.44 131.63h12.44v6.58h-12.44zM68.41 131.63h12.44v6.58h-12.44zM105.73 131.63h12.44v6.58h-12.44zM161.71 131.63h12.44v6.58h-12.44zM12.44 138.22h12.44v6.58h-12.44zM74.63 138.22h37.32v6.58h-37.32zM161.71 138.22h12.44v6.58h-12.44zM12.44 144.8h12.44v6.58h-12.44zM161.71 144.8h12.44v6.58h-12.44zM12.44 151.38h12.44v6.58h-12.44zM161.71 151.38h12.44v6.58h-12.44zM12.44 157.96h43.54v6.58h-43.54zM62.19 157.96h12.44v6.58h-12.44zM111.95 157.96h12.44v6.58h-12.44zM130.61 157.96h43.54v6.58h-43.54zM18.66 164.54h37.32v6.58h-37.32zM62.19 164.54h24.88v6.58h-24.88zM99.51 164.54h24.88v6.58h-24.88zM130.61 164.54h37.32v6.58h-37.32zM37.32 171.12h18.66v6.58h-18.66zM62.19 171.12h18.66v6.58h-18.66zM87.07 171.12h12.44v6.58h-12.44zM105.73 171.12h18.66v6.58h-18.66zM130.61 171.12h18.66v6.58h-18.66zM31.1 177.71h24.88v6.58h-24.88zM62.19 177.71h24.88v6.58h-24.88zM99.51 177.71h24.88v6.58h-24.88zM130.61 177.71h24.88v6.58h-24.88zM37.32 184.29h18.66v6.58h-18.66zM62.19 184.29h12.44v6.58h-12.44zM111.95 184.29h12.44v6.58h-12.44zM130.61 184.29h18.66v6.58h-18.66zM43.54 190.87h12.44v6.58h-12.44zM80.85 190.87h24.88v6.58h-24.88zM130.61 190.87h12.44v6.58h-12.44zM43.54 197.45h99.51v6.58h-99.51zM49.76 204.03h87.07v6.58h-87.07zM683.82 23.64h18.6v17.55h-18.6zM683.82 41.19h18.6v17.55h-18.6zM218.84 58.74h18.6v17.55h-18.6zM330.43 58.74h18.6v17.55h-18.6zM404.83 58.74h55.8v17.55h-55.8zM535.02 58.74h18.6v17.55h-18.6zM609.42 58.74h55.8v17.55h-55.8zM683.82 58.74h18.6v17.55h-18.6zM758.21 58.74h55.8v17.55h-55.8zM869.81 58.74h18.6v17.55h-18.6zM981.4 58.74h18.6v17.55h-18.6zM218.84 76.29h18.6v17.55h-18.6zM330.43 76.29h18.6v17.55h-18.6zM386.23 76.29h18.6v17.55h-18.6zM460.63 76.29h18.6v17.55h-18.6zM590.82 76.29h18.6v17.55h-18.6zM665.22 76.29h37.2v17.55h-37.2zM739.61 76.29h18.6v17.55h-18.6zM814.01 76.29h18.6v17.55h-18.6zM888.41 76.29h18.6v17.55h-18.6zM962.8 76.29h18.6v17.55h-18.6zM218.84 93.83h18.6v17.55h-18.6zM330.43 93.83h18.6v17.55h-18.6zM367.63 93.83h18.6v17.55h-18.6zM479.23 93.83h18.6v17.55h-18.6zM516.42 93.83h37.2v17.55h-37.2zM572.22 93.83h18.6v17.55h-18.6zM683.82 93.83h18.6v17.55h-18.6zM721.01 93.83h18.6v17.55h-18.6zM832.61 93.83h18.6v17.55h-18.6zM907 93.83h18.6v17.55h-18.6zM944.2 93.83h18.6v17.55h-18.6zM218.84 111.38h18.6v17.55h-18.6zM330.43 111.38h18.6v17.55h-18.6zM367.63 111.38h18.6v17.55h-18.6zM479.23 111.38h18.6v17.55h-18.6zM535.02 111.38h18.6v17.55h-18.6zM572.22 111.38h18.6v17.55h-18.6zM683.82 111.38h18.6v17.55h-18.6zM721.01 111.38h111.59v17.55h-111.59zM925.6 111.38h18.6v17.55h-18.6zM218.84 128.93h18.6v17.55h-18.6zM330.43 128.93h18.6v17.55h-18.6zM367.63 128.93h18.6v17.55h-18.6zM479.23 128.93h18.6v17.55h-18.6zM535.02 128.93h18.6v17.55h-18.6zM572.22 128.93h18.6v17.55h-18.6zM683.82 128.93h18.6v17.55h-18.6zM721.01 128.93h18.6v17.55h-18.6zM907 128.93h18.6v17.55h-18.6zM944.2 128.93h18.6v17.55h-18.6zM237.44 146.48h18.6v17.55h-18.6zM311.83 146.48h18.6v17.55h-18.6zM367.63 146.48h18.6v17.55h-18.6zM479.23 146.48h18.6v17.55h-18.6zM535.02 146.48h18.6v17.55h-18.6zM590.82 146.48h18.6v17.55h-18.6zM683.82 146.48h18.6v17.55h-18.6zM739.61 146.48h18.6v17.55h-18.6zM888.41 146.48h18.6v17.55h-18.6zM962.8 146.48h18.6v17.55h-18.6zM256.04 164.03h55.8v17.55h-55.8zM367.63 164.03h18.6v17.55h-18.6zM479.23 164.03h18.6v17.55h-18.6zM535.02 164.03h18.6v17.55h-18.6zM609.42 164.03h74.4v17.55h-74.4zM758.21 164.03h74.4v17.55h-74.4zM869.81 164.03h18.6v17.55h-18.6zM981.4 164.03h18.6v17.55h-18.6z';
function logo() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1000 210.61');
  svg.setAttribute('class', 'logo');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'unidex');
  svg.setAttribute('shape-rendering', 'crispEdges');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', LOGO_D);
  path.setAttribute('fill', 'currentColor');
  svg.append(path);
  return svg;
}

export const el = (tag, props = {}, ...children) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k in e && typeof v !== 'string') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) if (c != null && c !== false) e.append(c);
  return e;
};

// ---- the menus ----
const MENUS = [
  { label: 'Courses', page: ['index.html', 'course.html', 'lesson.html', 'play.html'], items: [
    { label: 'All courses', desc: 'Pick one and start', href: './', icon: 'book' },
    { label: 'Make your own unidex app', desc: 'From nothing to your own app on your unidex', href: 'course.html?c=apps', icon: 'tools' },
    { label: 'C++ for beginners', desc: 'Your first program to your first project', href: 'course.html?c=cpp', icon: 'code' },
    { label: 'Playground', desc: 'Write any C++ and run it', href: 'play.html', icon: 'code' },
  ] },
  { label: 'unidex', page: [], items: [
    { label: 'Tools', desc: 'Install, apps and the App editor', href: TOOLS, icon: 'tools', ext: true },
    { label: 'The shop', desc: 'Get a unidex', href: SHOP, icon: 'bag', ext: true },
  ] },
];

const here = location.pathname.split('/').pop() || 'index.html';
const isHere = page => (Array.isArray(page) ? page : [page]).includes(here);
const extProps = item => (item.ext ? { target: '_blank', rel: 'noopener' } : {});

function menuLink(item) {
  const a = el('a', { href: item.href, ...extProps(item) });
  if (!item.ext && item.href === location.pathname.split('/').pop() + location.search) a.setAttribute('aria-current', 'page');
  a.textContent = item.label + (item.ext ? ' ↗' : '');
  return a;
}

let openPanel = null;
function closePanels(except) {
  for (const b of document.querySelectorAll('.menus .top[aria-expanded=true]')) {
    if (b === except) continue;
    b.setAttribute('aria-expanded', 'false');
    document.getElementById(b.getAttribute('aria-controls')).classList.remove('open');
  }
  if (!except) openPanel = null;
}

function header() {
  const menus = el('ul', { class: 'menus' });
  MENUS.forEach((m, i) => {
    const id = `menu-${i}`;
    const btn = el('button', { class: 'top', type: 'button', 'aria-expanded': 'false', 'aria-controls': id },
                   m.label, icon('chevron'));
    if (isHere(m.page)) btn.setAttribute('aria-current', 'page');
    const panel = el('ul', { class: 'panel', id }, m.items.map(it => el('li', {}, menuLink(it))));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      closePanels(btn);
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
      openPanel = open ? btn : null;
      if (open && btn.dataset.keyboard) panel.querySelector('a').focus();
      delete btn.dataset.keyboard;
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') btn.dataset.keyboard = '1';
      if (e.key === 'ArrowDown') { e.preventDefault(); btn.click(); }
    });
    panel.addEventListener('keydown', e => {
      const links = [...panel.querySelectorAll('a')], i2 = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); links[(i2 + 1) % links.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); links[(i2 - 1 + links.length) % links.length].focus(); }
    });
    menus.append(el('li', {}, btn, panel));
  });

  const menuBtn = el('button', { class: 'menu-btn', type: 'button', 'aria-label': 'Menu', 'aria-expanded': 'false',
                                 onclick: () => openDrawer() }, icon('menu'));
  return el('div', { class: 'bar' },
    el('a', { class: 'brand', href: './', 'aria-label': 'unidex learn, home' }, logo(), el('small', { text: 'learn' })),
    el('nav', { 'aria-label': 'Main' }, menus),
    el('div', { class: 'head-right' },
      el('a', { class: 'shop-link', href: SHOP, target: '_blank', rel: 'noopener', text: 'unidex.shop ↗' }), menuBtn));
}

// ---- the drawer (narrow screens) ----
let drawer;
function openDrawer() {
  if (!drawer) {
    const close = () => { drawer.classList.remove('open'); document.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
                          document.querySelector('.menu-btn').focus(); };
    drawer = el('div', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menu' },
      el('div', { class: 'scrim', onclick: close }),
      el('div', { class: 'sheet' },
        el('div', { class: 'sheet-top' },
          el('a', { class: 'brand', href: './' }, logo()),
          el('button', { class: 'quiet', type: 'button', 'aria-label': 'Close the menu', onclick: close }, icon('close'))),
        MENUS.map(m => [el('h2', { text: m.label }), el('ul', {}, m.items.map(it => el('li', {}, menuLink(it))))])));
    drawer.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    drawer.addEventListener('click', e => { if (e.target.closest('a')) drawer.classList.remove('open'); });
    document.body.append(drawer);
  }
  drawer.classList.add('open');
  document.querySelector('.menu-btn').setAttribute('aria-expanded', 'true');
  drawer.querySelector('.sheet-top button').focus();
}

// ---- the footer ----
function footer() {
  const link = (text, href) => el('a', { href, text, ...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {}) });
  return [
    el('div', { class: 'foot-row' },
      el('a', { class: 'brand', href: './' }, logo(), el('small', { text: 'learn' })),
      el('nav', { 'aria-label': 'Footer' }, link('Courses', './'), link('Playground', 'play.html'), link('Tools ↗', TOOLS))),
    el('div', { class: 'foot-row small' },
      el('span', { text: 'Free to learn from.' }),
      el('nav', { 'aria-label': 'More' },
        link('unidex.shop ↗', SHOP), link('Source ↗', REPO), link('Privacy ↗', `${REPO}/blob/main/PRIVACY.md`))),
  ];
}

// ---- put it all on the page ----
function mount() {
  let h = document.querySelector('header[data-chrome]');
  if (!h) document.body.prepend(h = el('header'));
  h.className = 'site-head';
  h.replaceChildren(header());
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main';
  document.body.prepend(el('a', { class: 'skip', href: '#main', text: 'Skip to content' }));
  const foot = document.querySelector('footer[data-chrome]');
  if (foot) {
    foot.className = 'site-foot';
    foot.replaceChildren(...footer());
  }
}
mount();

document.addEventListener('click', e => { if (openPanel && !e.target.closest('.menus')) closePanels(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && openPanel) { const b = openPanel; closePanels(); b.focus(); }
});
document.addEventListener('focusin', e => { if (openPanel && !e.target.closest('.menus')) closePanels(); });
