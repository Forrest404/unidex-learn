// Puts the learner's app on their own unidex over USB (Chrome or Edge on a computer), the way the tools site's
// app store installs apps: vendor/serial.js opens the device, vendor/store-device.js sends the files.
import { supported, connect, knownPort, asleepHint } from './vendor/serial.js';
import { installApp } from './vendor/store-device.js';
import { entryFrom } from './vendor/emu-device.js';

export { supported };

// The install itself, on a device that's already open (the virtual unidex's serial line works the same way)
export async function installOn(dev, files, progress = () => {}) {
  const entry = await entryFrom(files);
  await installApp(dev, entry, async (e, f) => f.bytes, t => progress(`${entry.name}: ${t}…`));
  return entry;
}

// Opens the unidex (asking which one the first time), installs, and lets go. Returns the app's name.
export async function installOnUnidex(files, progress) {
  if (!supported) throw new Error('Putting it on your unidex needs Chrome or Edge on a computer. You can still download the .zip.');
  let dev = null;
  try {
    dev = await connect(await knownPort() || undefined);
    return (await installOn(dev, files, progress)).name;
  } catch (e) {
    if (e.name === 'NotFoundError') throw new Error(asleepHint);
    if (e.name === 'InvalidStateError' || /already open|Failed to open/i.test(e.message)) {
      throw new Error('Another page or program is using the unidex. Close it (or its tab), then try again.');
    }
    throw e;
  } finally {
    if (dev) await dev.close().catch(() => {});
  }
}
