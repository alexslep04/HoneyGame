export const DAY_MS = 10 * 60 * 1000;
export const OFFLINE_CALENDAR_CAP = 14 * DAY_MS;
export const SEASONS = ["Spring", "Summer", "Autumn", "Winter"] as const;
export const ITEMS = {
  cloverHoney: {
    name: "Clover honey",
    description: "Light, floral & a little sunshine.",
    price: 8,
    color: "#dfa83d",
    unit: "jar",
  },
  lavenderHoney: {
    name: "Lavender honey",
    description: "A fragrant little taste of the garden.",
    price: 11,
    color: "#a394bf",
    unit: "jar",
  },
  wax: {
    name: "Beeswax",
    description: "Golden wax for something handmade.",
    price: 4,
    color: "#e3bc61",
    unit: "piece",
  },
  candle: {
    name: "Beeswax candle",
    description: "A warm glow, made by you.",
    price: 20,
    color: "#ddae75",
    unit: "candle",
  },
  apple: {
    name: "Garden apple",
    description: "Fresh from your very own tree.",
    price: 5,
    color: "#bc7760",
    unit: "apple",
  },
} as const;
export type ItemId = keyof typeof ITEMS;
export const ITEM_IDS = Object.keys(ITEMS) as ItemId[];
export const HONEY_IDS = ["cloverHoney", "lavenderHoney"] as const;
export type HoneyId = (typeof HONEY_IDS)[number];
export type PlantId = "clover" | "lavender";
export type BeeId = "meadow" | "lavender";
export type Inventory = Record<ItemId, number>;
export const PLANTS = {
  clover: {
    name: "White clover",
    note: "A favorite of meadow honeybees.",
    honey: "cloverHoney" as HoneyId,
  },
  lavender: {
    name: "Lavender",
    note: "Fragrant flowers for a different honey.",
    honey: "lavenderHoney" as HoneyId,
  },
};
export const BEES = {
  meadow: {
    name: "Meadow honeybees",
    favorite: "clover" as PlantId,
    note: "Gentle foragers with a fondness for clover.",
  },
  lavender: {
    name: "Lavender honeybees",
    favorite: "lavender" as PlantId,
    note: "A garden variety especially fond of lavender.",
  },
};
export interface GameState {
  version: 1;
  lastSavedAt: number;
  gameTime: number;
  coins: number;
  honey: Record<HoneyId, number>;
  wax: number;
  inventory: Inventory;
  shipping: Inventory;
  bee: BeeId;
  ownedBees: BeeId[];
  forage: PlantId;
  plots: (PlantId | null)[];
  seeds: Record<PlantId, number>;
  upgrades: {
    hive: number;
    storage: number;
    garden: number;
    collector: boolean;
  };
  care: { inspectedDay: number; repairedWeek: number };
  candleRecipe: boolean;
  tree: { owned: boolean; fruit: number };
  readLetters: string[];
  marketPurchases: string[];
  stats: { harvested: number; sold: number; earned: number };
  discovered: ItemId[];
  lastReceipt: { day: number; coins: number; units: number } | null;
}

const emptyInventory = (): Inventory => ({
  cloverHoney: 0,
  lavenderHoney: 0,
  wax: 0,
  candle: 0,
  apple: 0,
});
export function createGame(now = Date.now()): GameState {
  return {
    version: 1,
    lastSavedAt: now,
    gameTime: 0,
    coins: 16,
    honey: { cloverHoney: 0, lavenderHoney: 0 },
    wax: 0,
    inventory: emptyInventory(),
    shipping: emptyInventory(),
    bee: "meadow",
    ownedBees: ["meadow"],
    forage: "clover",
    plots: ["clover", "clover", null, null],
    seeds: { clover: 1, lavender: 1 },
    upgrades: { hive: 0, storage: 0, garden: 0, collector: false },
    care: { inspectedDay: -1, repairedWeek: -1 },
    candleRecipe: false,
    tree: { owned: false, fruit: 0 },
    readLetters: [],
    marketPurchases: [],
    stats: { harvested: 0, sold: 0, earned: 0 },
    discovered: [],
    lastReceipt: null,
  };
}

export function getCalendar(game: GameState) {
  const dayIndex = Math.floor(game.gameTime / DAY_MS);
  const seasonIndex = Math.floor(dayIndex / 28) % 4;
  return {
    dayIndex,
    day: (dayIndex % 28) + 1,
    dayOfWeek: (dayIndex % 7) + 1,
    week: Math.floor(dayIndex / 7),
    weekOfSeason: Math.floor((dayIndex % 28) / 7) + 1,
    season: SEASONS[seasonIndex],
    seasonIndex,
    year: Math.floor(dayIndex / 112) + 1,
    marketOpen: dayIndex % 7 === 6,
    dayProgress: (game.gameTime % DAY_MS) / DAY_MS,
    untilMarket: (7 - (dayIndex % 7) - 1) * DAY_MS - (game.gameTime % DAY_MS),
    untilShipment: (7 - (dayIndex % 7)) * DAY_MS - (game.gameTime % DAY_MS),
  };
}
export const getHiveCapacity = (game: GameState) => 12 + game.upgrades.hive * 8;
export const getStorageCapacity = (game: GameState) =>
  40 + game.upgrades.storage * 24;
export const honeyTotal = (game: GameState) =>
  game.honey.cloverHoney + game.honey.lavenderHoney;
export const inventoryCount = (inventory: Inventory) =>
  ITEM_IDS.reduce((sum, id) => sum + inventory[id], 0);
export const storageUsed = (game: GameState) =>
  inventoryCount(game.inventory) + inventoryCount(game.shipping);
export const shipmentValue = (game: GameState) =>
  ITEM_IDS.reduce((sum, id) => sum + game.shipping[id] * ITEMS[id].price, 0);
export const whole = (amount: number) => Math.floor(amount + 1e-8);
export const harvestReady = (game: GameState) =>
  whole(game.honey.cloverHoney) +
  whole(game.honey.lavenderHoney) +
  whole(game.wax);

export function productionRate(game: GameState) {
  const calendar = getCalendar(game);
  const season = [1, 1.2, 0.85, 0.4][calendar.seasonIndex];
  const favorite = BEES[game.bee].favorite === game.forage ? 1.2 : 1;
  const flowers =
    1 + game.plots.filter((plant) => plant === game.forage).length * 0.05;
  const inspection = game.care.inspectedDay === calendar.dayIndex ? 1.15 : 1;
  const repair = game.care.repairedWeek === calendar.week ? 1.1 : 1;
  return (season * favorite * flowers * inspection * repair) / 30_000;
}

function discover(game: GameState, item: ItemId) {
  if (!game.discovered.includes(item)) game.discovered.push(item);
}

function collect(game: GameState) {
  let room = getStorageCapacity(game) - storageUsed(game);
  let collected = 0;
  for (const item of [...HONEY_IDS, "wax"] as const) {
    const available = item === "wax" ? game.wax : game.honey[item];
    const amount = Math.min(room, whole(available));
    if (amount <= 0) continue;
    game.inventory[item] += amount;
    if (item === "wax") game.wax = Math.max(0, game.wax - amount);
    else game.honey[item] = Math.max(0, game.honey[item] - amount);
    room -= amount;
    collected += amount;
    discover(game, item);
  }
  game.stats.harvested += collected;
  return collected;
}

// Advance between calendar boundaries. Collector transfers at whole-unit events,
// so a single offline advance gives the same result as many foreground ticks.
function produce(game: GameState, elapsed: number) {
  const rate = productionRate(game);
  const honey = PLANTS[game.forage].honey;
  if (game.upgrades.collector) collect(game);
  while (elapsed > 0.001) {
    const room = getHiveCapacity(game) - honeyTotal(game);
    if (room < 1e-8) break;
    const canCollect =
      game.upgrades.collector && storageUsed(game) < getStorageCapacity(game);
    const nextHoney = whole(game.honey[honey]) + 1 - game.honey[honey];
    const nextWax = (whole(game.wax) + 1 - game.wax) * 6;
    const amount = Math.min(
      room,
      elapsed * rate,
      canCollect ? Math.min(nextHoney, nextWax) : Infinity,
    );
    game.honey[honey] += amount;
    game.wax = Math.min(4, game.wax + amount / 6);
    elapsed -= amount / rate;
    if (canCollect) collect(game);
  }
}

function settleShipment(game: GameState, day: number) {
  const units = inventoryCount(game.shipping);
  if (!units) return;
  const coins = shipmentValue(game);
  game.coins += coins;
  game.stats.sold += units;
  game.stats.earned += coins;
  game.lastReceipt = { day, coins, units };
  game.shipping = emptyInventory();
}

export function advanceGame(original: GameState, now: number, offline = false) {
  const state = structuredClone(original);
  const elapsed = Math.max(0, now - state.lastSavedAt);
  const calendarElapsed = offline
    ? Math.min(elapsed, OFFLINE_CALENDAR_CAP)
    : elapsed;
  const target = state.gameTime + calendarElapsed;
  while (state.gameTime < target) {
    const calendar = getCalendar(state);
    const boundary = (calendar.dayIndex + 1) * DAY_MS;
    const next = Math.min(boundary, target);
    produce(state, next - state.gameTime);
    state.gameTime = next;
    if (next === boundary) {
      if (calendar.marketOpen) {
        settleShipment(state, calendar.dayIndex + 1);
        state.marketPurchases = [];
      }
      if (state.tree.owned && calendar.season !== "Winter")
        state.tree.fruit = Math.min(6, state.tree.fruit + 1);
    }
  }
  // Calendar catch-up is bounded, but elapsed production still fills available
  // containers. No invented days, payouts, or fruit harvests occur in this tail.
  if (elapsed > calendarElapsed) produce(state, elapsed - calendarElapsed);
  state.lastSavedAt = Math.max(state.lastSavedAt, now);
  return {
    state,
    elapsed,
    calendarElapsed,
    calendarCapped: elapsed > calendarElapsed,
    earned: state.coins - original.coins,
  };
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  price: number;
  kind:
    | "hive"
    | "storage"
    | "garden"
    | "plant"
    | "recipe"
    | "collector"
    | "tree"
    | "bee";
  soldOut: boolean;
}
export function getOffers(game: GameState): Offer[] {
  const week = getCalendar(game).week;
  const seed: PlantId = week % 2 === 0 ? "lavender" : "clover";
  const result: Offer[] = [
    {
      id: "hive",
      name: "Roomier honey frames",
      description: "+8 jars of hive capacity",
      price: 32 + game.upgrades.hive * 24,
      kind: "hive",
      soldOut: game.upgrades.hive >= 3,
    },
    {
      id: "storage",
      name: "Pantry shelves",
      description: "+24 spaces for goods & shipping",
      price: 40 + game.upgrades.storage * 25,
      kind: "storage",
      soldOut: game.upgrades.storage >= 3,
    },
    {
      id: "garden",
      name: "A little more garden",
      description: "Two new planting beds",
      price: 48 + game.upgrades.garden * 32,
      kind: "garden",
      soldOut: game.upgrades.garden >= 2,
    },
    {
      id: `seeds-${seed}`,
      name: `${PLANTS[seed].name} seeds`,
      description: "Two packets, ready to plant",
      price: 12,
      kind: "plant",
      soldOut: game.marketPurchases.includes(`seeds-${seed}`),
    },
    {
      id: "recipe",
      name: "Candle-making notes",
      description: "Turn 3 beeswax into a candle",
      price: 20,
      kind: "recipe",
      soldOut: game.candleRecipe,
    },
    {
      id: "collector",
      name: "Gentle honey collector",
      description: "Moves whole goods into your pantry",
      price: 120,
      kind: "collector",
      soldOut: game.upgrades.collector,
    },
  ];
  if (week % 2 === 0)
    result.push({
      id: "tree",
      name: "Little apple tree",
      description: "Grows up to 6 apples; rests in winter",
      price: 55,
      kind: "tree",
      soldOut: game.tree.owned,
    });
  else
    result.push({
      id: "bee",
      name: "Lavender honeybees",
      description: "Unlock a colony variety that loves lavender",
      price: 75,
      kind: "bee",
      soldOut: game.ownedBees.includes("lavender"),
    });
  return result;
}

export type Action =
  | { type: "inspect" | "repair" | "harvest" | "craft" | "gather" }
  | { type: "ship" | "unship"; item: ItemId; quantity: number }
  | { type: "buy"; offer: string }
  | { type: "plant"; index: number; plant: PlantId }
  | { type: "forage"; plant: PlantId }
  | { type: "bee"; bee: BeeId }
  | { type: "read"; id: string };

export function applyAction(
  original: GameState,
  action: Action,
): { state: GameState; message: string } {
  const state = structuredClone(original);
  const calendar = getCalendar(state);
  let message = "";
  switch (action.type) {
    case "inspect":
      if (state.care.inspectedDay === calendar.dayIndex)
        throw new Error("Already checked today. Your bees are doing well.");
      state.care.inspectedDay = calendar.dayIndex;
      message = "A happy little colony. +15% production for today.";
      break;
    case "repair":
      if (state.care.repairedWeek === calendar.week)
        throw new Error("The hive is already ready for this week.");
      state.care.repairedWeek = calendar.week;
      message = "Frames tidied, roof checked. +10% production this week.";
      break;
    case "harvest": {
      if (storageUsed(state) >= getStorageCapacity(state))
        throw new Error(
          "Your storage is full. Ship some goods or add pantry shelves.",
        );
      const count = collect(state);
      if (!count)
        throw new Error(
          "The bees are still filling the first jar. Check back shortly.",
        );
      message = `${count} ${count === 1 ? "good" : "goods"} gathered and tucked into the pantry.`;
      break;
    }
    case "ship":
    case "unship": {
      const quantity = action.quantity;
      if (
        !ITEM_IDS.includes(action.item) ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
      )
        throw new Error("Choose a positive whole quantity.");
      const from = action.type === "ship" ? state.inventory : state.shipping;
      const to = action.type === "ship" ? state.shipping : state.inventory;
      if (from[action.item] < quantity)
        throw new Error("There are not enough goods available.");
      from[action.item] -= quantity;
      to[action.item] += quantity;
      message =
        action.type === "ship"
          ? "Packed for collection at the end of market day."
          : "Returned safely to your pantry.";
      break;
    }
    case "plant":
      if (
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= state.plots.length ||
        !(action.plant in PLANTS)
      )
        throw new Error("Choose an available garden bed.");
      if (state.plots[action.index])
        throw new Error("That bed is already planted.");
      if (state.seeds[action.plant] < 1)
        throw new Error("You need a packet of those seeds.");
      state.seeds[action.plant]--;
      state.plots[action.index] = action.plant;
      message = `${PLANTS[action.plant].name} planted. New forage for your bees!`;
      break;
    case "forage":
      if (!state.plots.includes(action.plant))
        throw new Error("Plant this forage in your garden first.");
      state.forage = action.plant;
      message = `The next honey will come from ${PLANTS[action.plant].name.toLowerCase()}.`;
      break;
    case "bee":
      if (!state.ownedBees.includes(action.bee))
        throw new Error("Discover this bee variety at the market first.");
      state.bee = action.bee;
      message = `${BEES[action.bee].name} are tending this hive now.`;
      break;
    case "buy": {
      if (!calendar.marketOpen)
        throw new Error("The market opens on the seventh day of each week.");
      const offer = getOffers(state).find((entry) => entry.id === action.offer);
      if (!offer)
        throw new Error("That vendor offer is not available this week.");
      if (offer.soldOut)
        throw new Error("This offer is sold out or already fully upgraded.");
      if (state.coins < offer.price)
        throw new Error("You need a few more coins for this.");
      state.coins -= offer.price;
      if (offer.id === "hive" || offer.id === "storage")
        state.upgrades[offer.id]++;
      else if (offer.id === "garden") {
        state.upgrades.garden++;
        state.plots.push(null, null);
      } else if (offer.id === "recipe") state.candleRecipe = true;
      else if (offer.id === "collector") state.upgrades.collector = true;
      else if (offer.id === "tree") state.tree.owned = true;
      else if (offer.id === "bee") state.ownedBees.push("lavender");
      else if (offer.id.startsWith("seeds-")) {
        state.seeds[offer.id.slice(6) as PlantId] += 2;
        state.marketPurchases.push(offer.id);
      }
      message = `${offer.name}, brought home with care.`;
      break;
    }
    case "craft":
      if (!state.candleRecipe)
        throw new Error("Find the candle recipe at the market first.");
      if (state.inventory.wax < 3)
        throw new Error("You need 3 pieces of beeswax.");
      state.inventory.wax -= 3;
      state.inventory.candle++;
      discover(state, "candle");
      message = "One beeswax candle, made with a little love.";
      break;
    case "gather": {
      if (!state.tree.owned || !state.tree.fruit)
        throw new Error("Your tree needs time to grow some apples.");
      const amount = Math.min(
        state.tree.fruit,
        getStorageCapacity(state) - storageUsed(state),
      );
      if (!amount) throw new Error("Your storage is full.");
      state.tree.fruit -= amount;
      state.inventory.apple += amount;
      discover(state, "apple");
      message = `${amount} apples picked from your tree.`;
      break;
    }
    case "read":
      if (!getLetters(state).some((letter) => letter.id === action.id))
        throw new Error("That letter has not arrived yet.");
      if (!state.readLetters.includes(action.id))
        state.readLetters.push(action.id);
      message = "A little note, kept for another day.";
      break;
  }
  return { state, message };
}

export function getLetters(game: GameState) {
  return [
    {
      id: "welcome",
      from: "Mabel",
      role: "Your neighbor",
      title: "A little place to begin",
      body: "Welcome to Bramblewick, dear. That little hive is yours now. Take a peek inside, tidy the frames, and let the bees settle in. I left clover and lavender seeds by the gate. There is no hurry here. A garden grows a little at a time.",
      available: true,
    },
    {
      id: "harvest",
      from: "Mabel",
      role: "Your neighbor",
      title: "Your first golden harvest",
      body: "Your first honey! Keep what you like in the pantry and put anything you want to sell in the shipping box at home. Rowan collects it at the end of each weekly market day, even if you are away. No stall to set up, no fuss.",
      available: game.stats.harvested > 0,
    },
    {
      id: "market",
      from: "Rowan",
      role: "Market keeper",
      title: "See you by the village green",
      body: "Our stalls open every seventh day, for one whole day. Bring your coins, not your crates: your home shipment is taken care of. You will find new seeds, useful equipment, and a different little surprise each week. Miss a market? We will be here again.",
      available: game.gameTime >= 3 * DAY_MS || game.stats.sold > 0,
    },
    {
      id: "seasons",
      from: "Juniper",
      role: "Village gardener",
      title: "A garden for every season",
      body: "Summer brings busy bees; winter asks for a slower rhythm. Your colonies stay safe in every season. When the flowers are quiet, try making candles or tending the hive. Plant lavender and choose it as forage to discover a new honey.",
      available: game.gameTime >= 7 * DAY_MS,
    },
  ].filter((letter) => letter.available);
}
