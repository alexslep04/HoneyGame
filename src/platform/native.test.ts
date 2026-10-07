import { beforeEach, describe, expect, it, vi } from "vitest";

const device = vi.hoisted(() => ({
  platform: "web",
  callbacks: new Map<string, (event?: unknown) => void>(),
  remove: vi.fn(async () => {}),
  minimize: vi.fn(async () => {}),
  write: vi.fn(async () => ({ uri: "file://cache/backyard.json" })),
  share: vi.fn(async () => {}),
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: () => device.platform,
    isNativePlatform: () => device.platform !== "web",
  },
}));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: async (name: string, callback: (event?: unknown) => void) => {
      device.callbacks.set(name, callback);
      return { remove: device.remove };
    },
    minimizeApp: device.minimize,
  },
}));
vi.mock("@capacitor/filesystem", () => ({
  Directory: { Cache: "CACHE" },
  Encoding: { UTF8: "utf8" },
  Filesystem: { writeFile: device.write },
}));
vi.mock("@capacitor/share", () => ({ Share: { share: device.share } }));
import { exportSaveFile, installBackHandler, listenToAppState } from "./native";

beforeEach(() => {
  device.platform = "android";
  device.callbacks.clear();
  vi.clearAllMocks();
});

describe("Android integration boundary", () => {
  it("closes a game sheet before minimizing and releases its listener", async () => {
    const close = vi.fn();
    let open = true;
    vi.stubGlobal("document", {
      querySelectorAll: () => ({
        length: open ? 1 : 0,
        item: () => (open ? { close } : null),
      }),
    });
    const dispose = await installBackHandler();
    device.callbacks.get("backButton")!();
    expect(close).toHaveBeenCalledOnce();
    expect(device.minimize).not.toHaveBeenCalled();
    open = false;
    device.callbacks.get("backButton")!();
    expect(device.minimize).toHaveBeenCalledOnce();
    dispose();
    expect(device.remove).toHaveBeenCalledOnce();
  });
  it("forwards pause/resume state and removes its subscription", async () => {
    const callback = vi.fn();
    const dispose = await listenToAppState(callback);
    device.callbacks.get("appStateChange")!({ isActive: false });
    device.callbacks.get("appStateChange")!({ isActive: true });
    expect(callback.mock.calls).toEqual([[false], [true]]);
    dispose();
    expect(device.remove).toHaveBeenCalledOnce();
  });
  it("shares the written cache file instead of a WebView blob download", async () => {
    await exportSaveFile('{"version":1}');
    expect(device.write).toHaveBeenCalledWith({
      path: "honey-and-hearth-save.json",
      data: '{"version":1}',
      directory: "CACHE",
      encoding: "utf8",
    });
    expect(device.share).toHaveBeenCalledWith(
      expect.objectContaining({ url: "file://cache/backyard.json" }),
    );
  });
  it("does not register native handlers in a browser", async () => {
    device.platform = "web";
    (await installBackHandler())();
    (await listenToAppState(vi.fn()))();
    expect(device.callbacks.size).toBe(0);
  });
});
