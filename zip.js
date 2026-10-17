// An app's folder as a .zip to download: stored, not compressed (the files are tiny), the same writer as the tools
// site's App editor (github.com/Forrest404/unidex, site/editor.js).
import { crc32 } from './vendor/store-device.js';

const enc = new TextEncoder();

export function zip(entries) {  // [{name, bytes}] -> Blob
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts = [], central = [];
  let offset = 0;
  for (const { name, bytes } of entries) {
    const n = enc.encode(name), crc = crc32(bytes);
    const head = new Uint8Array(30 + n.length), h = new DataView(head.buffer);
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 10, true); h.setUint16(6, 0x0800, true);
    h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
    h.setUint32(18, bytes.length, true); h.setUint32(22, bytes.length, true); h.setUint16(26, n.length, true);
    head.set(n, 30);
    const dir = new Uint8Array(46 + n.length), d = new DataView(dir.buffer);
    d.setUint32(0, 0x02014b50, true); d.setUint16(4, 20, true); d.setUint16(6, 10, true); d.setUint16(8, 0x0800, true);
    d.setUint16(12, time, true); d.setUint16(14, date, true); d.setUint32(16, crc, true);
    d.setUint32(20, bytes.length, true); d.setUint32(24, bytes.length, true); d.setUint16(28, n.length, true);
    d.setUint32(42, offset, true);
    dir.set(n, 46);
    parts.push(head, bytes);
    central.push(dir);
    offset += head.length + bytes.length;
  }
  const size = central.reduce((s, c) => s + c.length, 0);
  const tail = new Uint8Array(22), t = new DataView(tail.buffer);
  t.setUint32(0, 0x06054b50, true); t.setUint16(8, entries.length, true); t.setUint16(10, entries.length, true);
  t.setUint32(12, size, true); t.setUint32(16, offset, true);
  return new Blob([...parts, ...central, tail], { type: 'application/zip' });
}

export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
