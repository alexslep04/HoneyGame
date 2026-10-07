import { beforeEach, describe, expect, it, vi } from "vitest";

const native = vi.hoisted(() => ({
  enabled: false,
  values: new Map<string, string>(),
  set: vi.fn(),
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => native.enabled },
}));
vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: async ({ key }: { key: string }) => ({
      value: native.values.get(key) ?? null,
    }),
    set: native.set,
  },
}));
import { readStoredValue, writeStoredValue } from "./storage";

beforeEach(() => {
  native.enabled = false;
  native.values.clear();
  native.set
    .mockReset()
    .mockImplementation(
      async ({ key, value }: { key: string; value: string }) => {
        native.values.set(key, value);
      },
    );
  const web = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => web.get(key) ?? null,
    setItem: (key: string, value: string) => {
      web.set(key, value);
    },
  });
});

describe("device save storage", () => {
  it("keeps browser saves under their existing localStorage key", async () => {
    await writeStoredValue("game", "web progress");
    expect(localStorage.getItem("game")).toBe("web progress");
    expect(await readStoredValue("game")).toBe("web progress");
    expect(native.set).not.toHaveBeenCalled();
  });
  it("uses native preferences without depending on WebView storage", async () => {
    native.enabled = true;
    await writeStoredValue("game", "device progress");
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("unavailable");
      },
    });
    expect(await readStoredValue("game")).toBe("device progress");
  });
  it("migrates an existing WebView save once without overwriting native progress", async () => {
    localStorage.setItem("game", "old webview progress");
    native.enabled = true;
    expect(await readStoredValue("game")).toBe("old webview progress");
    await writeStoredValue("game", "new native progress");
    expect(await readStoredValue("game")).toBe("new native progress");
  });
  it("serializes writes so an older save cannot finish after a newer one", async () => {
    native.enabled = true;
    let finish: () => void = () => {};
    native.set.mockImplementationOnce(
      ({ key, value }: { key: string; value: string }) =>
        new Promise<void>((resolve) => {
          finish = () => {
            native.values.set(key, value);
            resolve();
          };
        }),
    );
    const first = writeStoredValue("game", "first");
    const second = writeStoredValue("game", "second");
    await vi.waitFor(() => expect(native.set).toHaveBeenCalledTimes(1));
    finish();
    await Promise.all([first, second]);
    expect(await readStoredValue("game")).toBe("second");
  });
  it("reports a failed write without poisoning subsequent attempts", async () => {
    native.enabled = true;
    native.set.mockRejectedValueOnce(new Error("disk full"));
    await expect(writeStoredValue("game", "failed")).rejects.toThrow(
      "disk full",
    );
    await writeStoredValue("game", "recovered");
    expect(await readStoredValue("game")).toBe("recovered");
  });
});
