import {
  BEES,
  getHiveCapacity,
  getStorageCapacity,
  HONEY_IDS,
  honeyTotal,
  ITEM_IDS,
  PLANTS,
  storageUsed,
  type GameState,
} from "./game";

export const SAVE_KEY = "honey-and-hearth:save:v1";
export const SAVE_BACKUP_KEY = "honey-and-hearth:backup:v1";
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const number = (value: unknown, min = 0, max = 1e15): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
const integer = (value: unknown, min = 0, max = 1e12): value is number =>
  number(value, min, max) && Number.isSafeInteger(value);
const inventory = (
  value: unknown,
  keys: readonly string[],
  fractional = false,
) =>
  object(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => (fractional ? number(value[key]) : integer(value[key])));
const strings = (value: unknown, allowed: readonly string[]) =>
  Array.isArray(value) &&
  new Set(value).size === value.length &&
  value.every((entry) => typeof entry === "string" && allowed.includes(entry));
const plantIds = Object.keys(PLANTS);
const plant = (value: unknown) =>
  typeof value === "string" && plantIds.includes(value);

export function parseSave(raw: string): GameState {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(
      "This save is not valid JSON. Your existing file has been kept.",
    );
  }
  if (!object(value) || value.version !== 1)
    throw new Error(
      "This save uses an unsupported version. Your existing save has been kept.",
    );
  const v = value;
  const valid =
    number(v.lastSavedAt) &&
    number(v.gameTime) &&
    integer(v.coins) &&
    inventory(v.honey, HONEY_IDS, true) &&
    number(v.wax, 0, 4.000001) &&
    inventory(v.inventory, ITEM_IDS) &&
    inventory(v.shipping, ITEM_IDS) &&
    (v.bee === "meadow" || v.bee === "lavender") &&
    strings(v.ownedBees, Object.keys(BEES)) &&
    (v.ownedBees as unknown[]).includes(v.bee) &&
    plant(v.forage) &&
    Array.isArray(v.plots) &&
    v.plots.every((p) => p === null || plant(p)) &&
    v.plots.includes(v.forage) &&
    inventory(v.seeds, plantIds) &&
    object(v.upgrades) &&
    integer(v.upgrades.hive, 0, 3) &&
    integer(v.upgrades.storage, 0, 3) &&
    integer(v.upgrades.garden, 0, 2) &&
    typeof v.upgrades.collector === "boolean" &&
    v.plots.length === 4 + v.upgrades.garden * 2 &&
    object(v.care) &&
    integer(v.care.inspectedDay, -1) &&
    integer(v.care.repairedWeek, -1) &&
    typeof v.candleRecipe === "boolean" &&
    object(v.tree) &&
    typeof v.tree.owned === "boolean" &&
    integer(v.tree.fruit, 0, 6) &&
    strings(v.readLetters, ["welcome", "harvest", "market", "seasons"]) &&
    strings(v.marketPurchases, ["seeds-clover", "seeds-lavender"]) &&
    object(v.stats) &&
    integer(v.stats.harvested) &&
    integer(v.stats.sold) &&
    integer(v.stats.earned) &&
    strings(v.discovered, ITEM_IDS) &&
    (v.lastReceipt === null ||
      (object(v.lastReceipt) &&
        integer(v.lastReceipt.day) &&
        integer(v.lastReceipt.coins) &&
        integer(v.lastReceipt.units)));
  if (!valid)
    throw new Error(
      "This save contains incomplete or invalid game data. Your existing save has been kept.",
    );
  const game = v as unknown as GameState;
  if (
    storageUsed(game) > getStorageCapacity(game) ||
    honeyTotal(game) > getHiveCapacity(game) + 1e-6
  )
    throw new Error(
      "This save exceeds its storage limits. Your existing save has been kept.",
    );
  return game;
}
