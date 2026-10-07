import { describe, expect, it } from "vitest";
import {
  advanceGame,
  applyAction,
  createGame,
  DAY_MS,
  getCalendar,
  getHiveCapacity,
  getOffers,
  storageUsed,
} from "./game";

const start = 1_800_000_000_000;

describe("the apiary simulation", () => {
  it("starts with one empty hive and progresses without attendance", () => {
    const game = createGame(start);
    expect(Object.values(game.honey).reduce((a, b) => a + b, 0)).toBe(0);
    const next = advanceGame(game, start + 60_000).state;
    expect(next.honey.cloverHoney).toBeGreaterThanOrEqual(1);
    expect(game.honey.cloverHoney).toBe(0);
  });

  it("caps the offline calendar at fourteen days and does not replay discarded time", () => {
    const result = advanceGame(createGame(start), start + DAY_MS * 500, true);
    expect(result.state.gameTime).toBe(DAY_MS * 14);
    expect(result.calendarCapped).toBe(true);
    expect(advanceGame(result.state, start + DAY_MS * 500, true).state).toEqual(
      result.state,
    );
    expect(
      Object.values(result.state.honey).reduce((a, b) => a + b, 0),
    ).toBeCloseTo(getHiveCapacity(result.state));
  });

  it("retains phase across the cap and ignores backwards wall-clock changes", () => {
    const game = advanceGame(createGame(start), start + 42_000).state;
    const next = advanceGame(game, start + DAY_MS * 100, true).state;
    expect(next.gameTime).toBe(DAY_MS * 14 + 42_000);
    expect(advanceGame(next, next.lastSavedAt - 1000).state).toEqual(next);
  });

  it("leaves unharvested honey in the hive when storage cannot fit it", () => {
    let game = advanceGame(createGame(start), start + DAY_MS).state;
    game.inventory.cloverHoney = 39;
    game = applyAction(game, { type: "harvest" }).state;
    expect(storageUsed(game)).toBe(40);
    expect(game.honey.cloverHoney).toBeGreaterThan(0);
    const full = advanceGame(game, start + DAY_MS * 3).state;
    expect(full.inventory.cloverHoney).toBe(40);
    expect(() => applyAction(full, { type: "harvest" })).toThrow(/storage/i);
  });

  it("settles home shipping once at market close, never on ordinary days", () => {
    let game = createGame(start);
    game.inventory.cloverHoney = 3;
    game = applyAction(game, {
      type: "ship",
      item: "cloverHoney",
      quantity: 3,
    }).state;
    const coins = game.coins;
    game = advanceGame(game, start + DAY_MS * 6).state;
    expect(getCalendar(game).marketOpen).toBe(true);
    expect(game.coins).toBe(coins);
    game = advanceGame(game, start + DAY_MS * 7, true).state;
    expect(game.coins).toBe(coins + 3 * 8);
    expect(game.shipping.cloverHoney).toBe(0);
    expect(advanceGame(game, game.lastSavedAt, true).state.coins).toBe(
      game.coins,
    );
  });

  it("keeps shipping and inventory within the same capacity and permits withdrawal", () => {
    const game = createGame(start);
    game.inventory.wax = 8;
    const shipped = applyAction(game, {
      type: "ship",
      item: "wax",
      quantity: 5,
    }).state;
    expect(storageUsed(shipped)).toBe(8);
    expect(
      applyAction(shipped, { type: "unship", item: "wax", quantity: 5 }).state
        .inventory.wax,
    ).toBe(8);
    expect(() =>
      applyAction(game, { type: "ship", item: "wax", quantity: -1 }),
    ).toThrow();
  });

  it("bounds collection by storage and resumes after goods are shipped", () => {
    let game = createGame(start);
    game.upgrades.collector = true;
    game = advanceGame(game, start + DAY_MS * 5, true).state;
    expect(storageUsed(game)).toBe(40);
    expect(Object.values(game.honey).reduce((a, b) => a + b, 0)).toBeCloseTo(
      getHiveCapacity(game),
    );
    game = applyAction(game, {
      type: "ship",
      item: "cloverHoney",
      quantity: game.inventory.cloverHoney,
    }).state;
    const next = advanceGame(game, start + DAY_MS * 8, true).state;
    expect(next.coins).toBeGreaterThan(game.coins);
    expect(storageUsed(next)).toBeLessThanOrEqual(40);
  });

  it("requires the market to be open and makes purchases atomic", () => {
    const game = createGame(start);
    expect(() => applyAction(game, { type: "buy", offer: "hive" })).toThrow(
      /market/i,
    );
    const open = advanceGame(game, start + DAY_MS * 6).state;
    open.coins = 0;
    expect(() => applyAction(open, { type: "buy", offer: "hive" })).toThrow(
      /coins/i,
    );
    expect(open.upgrades.hive).toBe(0);
    open.coins = 500;
    const bought = applyAction(open, { type: "buy", offer: "hive" }).state;
    expect(getHiveCapacity(bought)).toBeGreaterThan(getHiveCapacity(open));
    expect(bought.coins).toBeLessThan(open.coins);
  });

  it("rotates weekly seed inventory and prevents buying sold-out stock again", () => {
    let game = advanceGame(createGame(start), start + DAY_MS * 6).state;
    game.coins = 500;
    const offer = getOffers(game).find((item) => item.id.startsWith("seeds-"))!;
    game = applyAction(game, { type: "buy", offer: offer.id }).state;
    expect(() => applyAction(game, { type: "buy", offer: offer.id })).toThrow(
      /sold out/i,
    );
    const later = advanceGame(game, start + DAY_MS * 13).state;
    expect(
      getOffers(later).find((item) => item.id.startsWith("seeds-"))!.id,
    ).not.toBe(offer.id);
  });

  it("changes honey through forage and makes bee preferences matter", () => {
    let game = createGame(start);
    game = applyAction(game, {
      type: "plant",
      index: 2,
      plant: "lavender",
    }).state;
    game = applyAction(game, { type: "forage", plant: "lavender" }).state;
    const lavender = advanceGame(game, start + 60_000).state;
    expect(lavender.honey.lavenderHoney).toBeGreaterThan(0);
    expect(lavender.honey.cloverHoney).toBe(0);
    game.bee = "lavender";
    expect(
      advanceGame(game, start + 60_000).state.honey.lavenderHoney,
    ).toBeGreaterThan(lavender.honey.lavenderHoney);
  });

  it("crafts using owned ingredients without duplicating them", () => {
    let game = createGame(start);
    game.candleRecipe = true;
    game.inventory.wax = 3;
    game = applyAction(game, { type: "craft" }).state;
    expect(game.inventory.wax).toBe(0);
    expect(game.inventory.candle).toBe(1);
    expect(() => applyAction(game, { type: "craft" })).toThrow(/wax/i);
  });

  it("makes split active simulation agree with a single uninterrupted advance", () => {
    const game = createGame(start);
    game.upgrades.collector = true;
    const once = advanceGame(game, start + DAY_MS * 2).state;
    let split = game;
    for (let i = 1; i <= 120; i++)
      split = advanceGame(split, start + (DAY_MS * 2 * i) / 120).state;
    expect(storageUsed(split)).toBe(storageUsed(once));
    expect(split.honey.cloverHoney).toBeCloseTo(once.honey.cloverHoney, 5);
    expect(split.wax).toBeCloseTo(once.wax, 5);
  });

  it("rolls seasons and years over without losing progress", () => {
    const game = createGame(start);
    expect(
      getCalendar(advanceGame(game, start + DAY_MS * 28).state).season,
    ).toBe("Summer");
    const year = advanceGame(game, start + DAY_MS * 112).state;
    expect(getCalendar(year).year).toBe(2);
    expect(getCalendar(year).season).toBe("Spring");
    expect(year.coins).toBe(game.coins);
  });
});
