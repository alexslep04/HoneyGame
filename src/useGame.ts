import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceGame,
  applyAction,
  createGame,
  DAY_MS,
  type Action,
  type GameState,
} from "./game/game";
import { parseSave, SAVE_BACKUP_KEY, SAVE_KEY } from "./game/save";
import { readStoredValue, writeStoredValue } from "./platform/storage";
import { exportSaveFile, listenToAppState } from "./platform/native";

export function useGame() {
  const [game, setGame] = useState(() => createGame());
  const current = useRef(game);
  const ready = useRef(false);
  const saveOperation = useRef(false);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [away, setAway] = useState("");

  const persist = useCallback((state: GameState) => {
    void writeStoredValue(SAVE_KEY, JSON.stringify(state))
      .then(() => setSaveError(""))
      .catch(() =>
        setSaveError(
          "This device could not save progress. Keep the game open and export a backup from the notebook.",
        ),
      );
  }, []);

  const update = useCallback(
    (state: GameState) => {
      current.current = state;
      setGame(state);
      persist(state);
    },
    [persist],
  );

  const advance = useCallback(
    (offline = false) => {
      if (!ready.current) return;
      const now = Date.now();
      // Laptop sleep can suspend a visible tab without a visibility event.
      const catchingUp = offline || now - current.current.lastSavedAt > 30_000;
      const result = advanceGame(current.current, now, catchingUp);
      update(result.state);
      if (catchingUp && result.elapsed > 30_000) {
        const days = Math.floor(result.calendarElapsed / DAY_MS);
        setAway(
          `${days ? `${days} in-game ${days === 1 ? "day" : "days"} passed` : "Your bees kept busy"} while you were away.${result.calendarCapped ? " Calendar catch-up stopped at two weeks." : ""}${result.earned ? ` Your shipment earned ${result.earned} coins.` : ""} Everything is safe and waiting for you.`,
        );
      } else if (result.earned)
        setNotice(
          `A delivery from Rowan: +${result.earned} coins from your shipment.`,
        );
    },
    [update],
  );

  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;
    let nativeCleanup: (() => void) | undefined;
    let suspended = document.hidden;
    const initialize = async () => {
      if (cancelled) return;
      try {
        const raw = await readStoredValue(SAVE_KEY);
        if (cancelled) return;
        current.current = raw ? parseSave(raw) : createGame();
        ready.current = true;
        advance(true);
      } catch (error) {
        ready.current = false;
        setLoadError(
          error instanceof Error
            ? error.message
            : "The saved game could not be opened.",
        );
      }
      setLoading(false);
    };
    // Only one tab may advance and write this local game at a time.
    if (navigator.locks) {
      void navigator.locks
        .request(
          "honey-and-hearth-writer",
          { ifAvailable: true },
          async (lock) => {
            if (cancelled) return;
            if (!lock) {
              setLocked(true);
              setLoading(false);
              return;
            }
            await initialize();
            if (cancelled) return;
            await new Promise<void>((resolve) => {
              release = resolve;
            });
          },
        )
        .catch(() => {
          if (!cancelled) {
            setLoadError(
              "The browser could not open this save safely. Please reload this tab.",
            );
            setLoading(false);
          }
        });
    } else void initialize();

    const interval = window.setInterval(() => {
      if (!document.hidden && !suspended) advance();
    }, 1000);
    const changeActivity = (active: boolean) => {
      if (cancelled || active === !suspended) return;
      if (!active) advance();
      suspended = !active;
      if (active) advance(true);
    };
    const visibility = () => changeActivity(!document.hidden);
    void listenToAppState(changeActivity)
      .then((cleanup) => {
        if (cancelled) cleanup();
        else nativeCleanup = cleanup;
      })
      .catch(() => {
        if (!cancelled)
          setNotice(
            "Device lifecycle events are unavailable; visibility-based saving is still active.",
          );
      });
    const pagehide = () => {
      if (ready.current) persist(current.current);
    };
    const storage = (event: StorageEvent) => {
      if (!navigator.locks && event.key === SAVE_KEY) {
        ready.current = false;
        setLocked(true);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pagehide);
    window.addEventListener("storage", storage);
    return () => {
      cancelled = true;
      ready.current = false;
      release?.();
      nativeCleanup?.();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pagehide);
      window.removeEventListener("storage", storage);
    };
  }, [advance, persist]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const act = (action: Action) => {
    if (!ready.current) return;
    const advanced = advanceGame(current.current, Date.now(), true).state;
    try {
      const result = applyAction(advanced, action);
      update(result.state);
      setNotice(result.message);
    } catch (error) {
      update(advanced);
      setNotice(
        error instanceof Error
          ? error.message
          : "That action could not be completed.",
      );
    }
  };

  const previewTime = (milliseconds: number, offline = false) => {
    if (!ready.current) return;
    const next = advanceGame(
      current.current,
      current.current.lastSavedAt + milliseconds,
      offline,
    );
    update({ ...next.state, lastSavedAt: Date.now() });
    setNotice(
      `Time preview applied.${next.calendarCapped ? " Calendar capped at two weeks." : ""}${next.earned ? ` Shipment: +${next.earned} coins.` : ""}`,
    );
  };

  const reset = async () => {
    if (
      locked ||
      saveOperation.current ||
      !window.confirm(
        "Start a new backyard? Your current save will be kept as a backup on this device.",
      )
    )
      return;
    saveOperation.current = true;
    const wasReady = ready.current;
    ready.current = false;
    try {
      const previous = await readStoredValue(SAVE_KEY);
      if (previous) await writeStoredValue(SAVE_BACKUP_KEY, previous);
    } catch {
      ready.current = wasReady;
      saveOperation.current = false;
      setNotice(
        "Could not preserve a backup. Export your save before starting over.",
      );
      return;
    }
    ready.current = true;
    setLoadError("");
    setAway("");
    update(createGame());
    saveOperation.current = false;
    setNotice("A new little beginning.");
  };

  const restore = async () => {
    if (locked || saveOperation.current) return;
    saveOperation.current = true;
    const wasReady = ready.current;
    ready.current = false;
    try {
      const backup = await readStoredValue(SAVE_BACKUP_KEY);
      if (!backup) throw new Error("There is no backup on this device yet.");
      current.current = parseSave(backup);
      ready.current = true;
      setLoadError("");
      advance(true);
      setNotice("Your backup has been restored.");
    } catch (error) {
      ready.current = wasReady;
      setNotice(
        error instanceof Error ? error.message : "Backup could not be loaded.",
      );
    } finally {
      saveOperation.current = false;
    }
  };

  const exportSave = async () => {
    let raw: string;
    try {
      raw = loadError
        ? ((await readStoredValue(SAVE_KEY)) ?? "{}")
        : JSON.stringify(current.current, null, 2);
    } catch {
      setNotice("This device cannot read the save.");
      return;
    }
    try {
      await exportSaveFile(raw);
    } catch {
      setNotice(
        "The save could not be shared. Your progress is still on this device.",
      );
    }
  };

  const importSave = async (file: File) => {
    if (locked || saveOperation.current) return;
    if (file.size > 100_000) {
      setNotice("This file is too large to be a Honey & Hearth save.");
      return;
    }
    saveOperation.current = true;
    const wasReady = ready.current;
    try {
      const loaded = parseSave(await file.text());
      if (
        !window.confirm(
          "Replace this backyard with the imported save? Your current save will be backed up.",
        )
      )
        return;
      ready.current = false;
      const previous = await readStoredValue(SAVE_KEY);
      if (previous) await writeStoredValue(SAVE_BACKUP_KEY, previous);
      current.current = loaded;
      ready.current = true;
      setLoadError("");
      advance(true);
      setNotice("Your backyard has come home.");
    } catch (error) {
      ready.current = wasReady;
      setNotice(
        error instanceof Error
          ? error.message
          : "This save could not be imported.",
      );
    } finally {
      saveOperation.current = false;
    }
  };

  return {
    game,
    loading,
    locked,
    loadError,
    saveError,
    notice,
    away,
    dismissAway: () => setAway(""),
    act,
    previewTime,
    reset,
    restore,
    exportSave,
    importSave,
  };
}
