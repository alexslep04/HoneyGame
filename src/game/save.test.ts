import { describe, expect, it } from "vitest";
import { advanceGame, applyAction, createGame, DAY_MS } from "./game";
import { parseSave } from "./save";

describe("saved progress", () => {
  it("round-trips real simulation and actions", () => {
    let game = createGame(1000);
    game = advanceGame(game, 1000 + DAY_MS * 6).state;
    game = applyAction(game, { type: "harvest" }).state;
    game = applyAction(game, {
      type: "ship",
      item: "cloverHoney",
      quantity: 5,
    }).state;
    const loaded = parseSave(JSON.stringify(game));
    const next = advanceGame(
      loaded,
      game.lastSavedAt + DAY_MS * 30,
      true,
    ).state;
    expect(next.stats.sold).toBe(5);
    expect(next.shipping.cloverHoney).toBe(0);
    expect(parseSave(JSON.stringify(next))).toEqual(next);
    expect(advanceGame(next, next.lastSavedAt, true).state).toEqual(next);
  });

  it.each(["{oops", "{}", '{"version":2}', '{"version":1}'])(
    "rejects corrupt or unsupported saves: %s",
    (raw) => {
      expect(() => parseSave(raw)).toThrow();
    },
  );

  it("rejects negative inventory, impossible capacities, and unknown nested values", () => {
    for (const corrupt of [
      (g: ReturnType<typeof createGame>) => {
        g.inventory.wax = -2;
      },
      (g: ReturnType<typeof createGame>) => {
        g.shipping.candle = 5000;
      },
      (g: ReturnType<typeof createGame>) => {
        g.honey.cloverHoney = 100;
      },
      (g: ReturnType<typeof createGame>) => {
        g.upgrades.hive = 50;
      },
      (g: ReturnType<typeof createGame>) => {
        g.gameTime = Infinity;
      },
    ]) {
      const game = createGame();
      corrupt(game);
      expect(() => parseSave(JSON.stringify(game))).toThrow();
    }
  });
});
