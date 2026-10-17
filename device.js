// The virtual unidex on a lesson page: the real firmware, compiled for the browser, loaded from the tools site
// (tools.unidex.shop/emu/, which any site may load). It draws the screen onto a canvas and takes the A and B buttons
// from the page's buttons or the A/B keys. vendor/emu-device.js then installs and opens apps on it.
//   startDevice({ canvas, btnA, btnB }) -> Promise of the emulator, also announced as window.unidexEmu
export const EMU = 'https://tools.unidex.shop/emu/';

const loadScript = src => new Promise((ok, bad) => {
  const s = document.createElement('script');
  s.src = src;
  s.crossOrigin = 'anonymous';
  s.onload = ok;
  s.onerror = () => bad(new Error(`Couldn't load ${src}`));
  document.head.append(s);
});

let started = null;
export function startDevice({ canvas, btnA, btnB }) {
  if (started) return started;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(200, 200);
  let mod = null;

  // The screen arrives as 1 bit a pixel, 1 = white, rows top to bottom, leftmost pixel in the top bit
  function draw(bytes) {
    const d = img.data;
    for (let i = 0; i < 40000; i++) {
      const ink = (bytes[i >> 3] & (0x80 >> (i & 7))) === 0;
      d[i * 4] = ink ? 24 : 233; d[i * 4 + 1] = ink ? 24 : 233; d[i * 4 + 2] = ink ? 27 : 218; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function press(which, down) {
    if (mod) mod.ccall('emu_button', null, ['number', 'number'], [which, down ? 1 : 0]);
    (which ? btnB : btnA).classList.toggle('down', down);
  }
  for (const [el, which] of [[btnA, 0], [btnB, 1]]) {
    el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); press(which, true); });
    el.addEventListener('pointerup', () => press(which, false));
    el.addEventListener('pointercancel', () => press(which, false));
  }
  // The A and B keys press the buttons, except while typing in the editor or using another control
  const keys = { a: 0, A: 0, b: 1, B: 1 };
  addEventListener('keydown', e => {
    if (!(e.key in keys) || e.repeat || e.metaKey || e.ctrlKey || e.altKey ||
        e.target.closest('input, textarea, select, a, [contenteditable], button:not(.device-btn)')) return;
    e.preventDefault();
    press(keys[e.key], true);
  });
  addEventListener('keyup', e => { if (e.key in keys) press(keys[e.key], false); });
  addEventListener('blur', () => { press(0, false); press(1, false); });

  started = (async () => {
    const list = await (await fetch(`${EMU}versions.json`)).json();
    const dir = `${EMU}${list.latest}/`;
    await loadScript(`${dir}unidex.js`);
    mod = await globalThis.createUnidex({ onScreen: draw, print() {}, printErr() {}, locateFile: f => dir + f });
    window.unidexEmu = mod;
    dispatchEvent(new Event('unidex-ready'));
    return mod;
  })();
  return started;
}
