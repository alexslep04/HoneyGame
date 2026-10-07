import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

let writes: Promise<void> = Promise.resolve();

export async function readStoredValue(key: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return localStorage.getItem(key);
  await writes;
  const { value } = await Preferences.get({ key });
  if (value !== null) return value;
  // Preserve progress from a pre-Preferences WebView build. Native preferences
  // become authoritative after migration; a stale web copy cannot replace them.
  const legacy = localStorage.getItem(key);
  if (legacy !== null) await writeStoredValue(key, legacy);
  return legacy;
}

export async function writeStoredValue(
  key: string,
  value: string,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    localStorage.setItem(key, value);
    return;
  }
  const next = writes.then(() => Preferences.set({ key, value }));
  writes = next.catch(() => {});
  return next;
}
