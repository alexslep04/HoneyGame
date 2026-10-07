import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export async function installBackHandler(): Promise<() => void> {
  if (Capacitor.getPlatform() !== "android") return () => {};
  const listener = await App.addListener("backButton", () => {
    const dialogs =
      document.querySelectorAll<HTMLDialogElement>("dialog[open]");
    const top = dialogs.item(dialogs.length - 1);
    if (top) top.close();
    else void App.minimizeApp();
  });
  return () => {
    void listener.remove();
  };
}

export async function listenToAppState(
  callback: (active: boolean) => void,
): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) return () => {};
  const listener = await App.addListener("appStateChange", ({ isActive }) =>
    callback(isActive),
  );
  return () => {
    void listener.remove();
  };
}

export async function exportSaveFile(raw: string): Promise<void> {
  const name = "honey-and-hearth-save.json";
  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: name,
      data: raw,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({
      title: "Honey & Hearth save",
      url: uri,
      dialogTitle: "Keep a copy of your backyard",
    });
    return;
  }
  const url = URL.createObjectURL(
    new Blob([raw], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
