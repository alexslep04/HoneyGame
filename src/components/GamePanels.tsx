import { useState } from "react";
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bug,
  Check,
  Clock3,
  Coins,
  Flame,
  Flower2,
  Heart,
  House,
  Package,
  Plus,
  Settings2,
  ShoppingBasket,
  Shovel,
  Sprout,
  Store,
  TreeDeciduous,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  BEES,
  DAY_MS,
  getCalendar,
  getHiveCapacity,
  getLetters,
  getOffers,
  getStorageCapacity,
  harvestReady,
  honeyTotal,
  HONEY_IDS,
  inventoryCount,
  ITEM_IDS,
  ITEMS,
  PLANTS,
  productionRate,
  shipmentValue,
  storageUsed,
  type Action,
  type GameState,
  type Offer,
  type PlantId,
} from "../game/game";
import { BeeMark, Jar } from "./GameIcons";

type PanelProps = { game: GameState; act: (action: Action) => void };
export function timeLabel(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function HivePanel({ game, act }: PanelProps) {
  const calendar = getCalendar(game);
  const ready = harvestReady(game);
  const full = storageUsed(game) >= getStorageCapacity(game);
  const count = honeyTotal(game);
  const capacity = getHiveCapacity(game);
  return (
    <>
      <section className="panel hive-card">
        <div className="hive-status">
          <span className="live-dot" />
          {count >= capacity - 0.001
            ? "Full & resting"
            : "Happily making honey"}
          <span>Hive 01</span>
        </div>
        <div className="honey-display">
          <Jar item={PLANTS[game.forage].honey} />
          <div>
            <span className="big-number">
              {count.toFixed(1)}
              <span> / {capacity}</span>
            </span>
            <p>jars tucked in the hive</p>
          </div>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Honey in hive"
          aria-valuenow={Math.floor(count)}
          aria-valuemin={0}
          aria-valuemax={capacity}
        >
          <span style={{ width: `${(count / capacity) * 100}%` }} />
        </div>
        <div className="hive-details">
          <span>
            <Flower2 size={16} />
            {PLANTS[game.forage].name}
          </span>
          <span>~{Math.round(productionRate(game) * DAY_MS)} jars / day</span>
        </div>
        <button
          className="button primary harvest-button"
          onClick={() => act({ type: "harvest" })}
          disabled={!ready || full}
        >
          <ShoppingBasket size={20} />
          {full
            ? "Pantry is full"
            : ready
              ? `Gather honey & wax (${ready})`
              : "Your first harvest is growing"}
        </button>
        <p className="quiet-note">
          {game.upgrades.collector
            ? "Your collector carries whole goods to the pantry."
            : "Safe in the hive until you are ready."}
        </p>
      </section>
      <section className="panel">
        <h3>A little everyday care</h3>
        <div className="care-list">
          {[
            {
              type: "inspect" as const,
              name: "Check on the colony",
              description: "+15% honey production today",
              done: game.care.inspectedDay === calendar.dayIndex,
              Icon: Heart,
            },
            {
              type: "repair" as const,
              name: "Tidy frames & check the roof",
              description: "+10% production this week",
              done: game.care.repairedWeek === calendar.week,
              Icon: Wrench,
            },
          ].map(({ type, name, description, done, Icon }) => (
            <button
              key={type}
              className={`care-task ${done ? "done" : ""}`}
              disabled={done}
              onClick={() => act({ type })}
            >
              <span className="task-icon">
                <Icon size={21} />
              </span>
              <span>
                <strong>{name}</strong>
                <small>{description}</small>
              </span>
              <span className="check-circle">
                {done ? <Check size={16} /> : <Plus size={16} />}
              </span>
            </button>
          ))}
        </div>
        <p className="quiet-note">
          Missed a task? Your bees are still safe and productive.
        </p>
      </section>
      <section className="panel colony-panel">
        <div className="colony-heading">
          <span className="bee-portrait">
            <BeeMark />
          </span>
          <div>
            <span className="eyebrow">YOUR LITTLE COLONY</span>
            <h3>{BEES[game.bee].name}</h3>
          </div>
        </div>
        <p>{BEES[game.bee].note}</p>
        <div className="colony-facts">
          <span>
            Favorite forage
            <strong>{PLANTS[BEES[game.bee].favorite].name}</strong>
          </span>
          <span>
            Beeswax in hive<strong>{game.wax.toFixed(1)} / 4</strong>
          </span>
          <span>
            Varieties found<strong>{game.ownedBees.length} / 2</strong>
          </span>
        </div>
        {game.ownedBees.length > 1 && (
          <label className="field-label">
            Colony tending this hive
            <select
              value={game.bee}
              onChange={(e) =>
                act({ type: "bee", bee: e.target.value as keyof typeof BEES })
              }
            >
              {game.ownedBees.map((bee) => (
                <option value={bee} key={bee}>
                  {BEES[bee].name}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>
      <section className="panel">
        <h3>Your honey journal</h3>
        <div className="discovery-grid">
          {HONEY_IDS.map((item) => (
            <div
              key={item}
              className={
                game.discovered.includes(item) ? "discovery found" : "discovery"
              }
            >
              <Jar item={item} small />
              <div>
                <strong>{ITEMS[item].name}</strong>
                <small>
                  {game.discovered.includes(item)
                    ? "Discovered & collected"
                    : "A discovery to come"}
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function GardenPanel({ game, act }: PanelProps) {
  const [plant, setPlant] = useState<PlantId>("lavender");
  return (
    <>
      <section className="panel">
        <p className="panel-description">
          A different bloom. A different honey. Tap an empty bed to plant.
        </p>
        <label className="field-label">
          Seed packet
          <select
            value={plant}
            onChange={(e) => setPlant(e.target.value as PlantId)}
          >
            {Object.entries(PLANTS).map(([id, value]) => (
              <option key={id} value={id}>
                {value.name} · {game.seeds[id as PlantId]} left
              </option>
            ))}
          </select>
        </label>
        <div className="plant-beds">
          {game.plots.map((entry, index) => (
            <button
              key={index}
              className={`plant-bed ${entry ?? "empty"}`}
              disabled={entry !== null || game.seeds[plant] === 0}
              onClick={() => act({ type: "plant", index, plant })}
              aria-label={
                entry
                  ? `Bed ${index + 1}: ${PLANTS[entry].name}`
                  : `Plant ${PLANTS[plant].name} in bed ${index + 1}`
              }
            >
              {entry ? <Flower2 size={31} /> : <Plus size={28} />}
              <strong>{entry ? PLANTS[entry].name : "Plant a seed"}</strong>
              <small>{entry ? "In bloom" : `Bed ${index + 1}`}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3>
          <Bug size={19} /> Guide your foragers
        </h3>
        <div className="segmented">
          {Object.entries(PLANTS).map(([id, value]) => (
            <button
              key={id}
              disabled={!game.plots.includes(id as PlantId)}
              aria-pressed={game.forage === id}
              onClick={() => act({ type: "forage", plant: id as PlantId })}
            >
              {value.name}
              {game.forage === id && <Check size={16} />}
            </button>
          ))}
        </div>
        <p className="quiet-note">
          This guides new honey. Anything already in the hive keeps its original
          flavor.
        </p>
      </section>
      {game.tree.owned && (
        <section className="panel tree-row">
          <TreeDeciduous size={32} />
          <div>
            <h3>Your little apple tree</h3>
            <p>{game.tree.fruit} / 6 apples · rests in winter</p>
          </div>
          <button
            className="button"
            disabled={
              !game.tree.fruit || storageUsed(game) >= getStorageCapacity(game)
            }
            onClick={() => act({ type: "gather" })}
          >
            Pick apples
          </button>
        </section>
      )}
    </>
  );
}

export function PantryPanel({ game, act }: PanelProps) {
  const shipping = inventoryCount(game.shipping);
  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <h3>On your shelves</h3>
          <span className="subtle-badge">
            {storageUsed(game)} / {getStorageCapacity(game)} spaces
          </span>
        </div>
        <p className="panel-description">
          Pantry and sale bin share storage. Everything keeps safely.
        </p>
        <div className="inventory-list">
          {ITEM_IDS.map((item) => (
            <div
              className={`inventory-row ${game.inventory[item] ? "" : "empty-item"}`}
              key={item}
            >
              <Jar item={item} small />
              <div className="item-description">
                <strong>{ITEMS[item].name}</strong>
                <small>{ITEMS[item].price} coins each</small>
              </div>
              <span className="quantity">{game.inventory[item]}</span>
              <button
                className="button ship-one"
                disabled={!game.inventory[item]}
                onClick={() => act({ type: "ship", item, quantity: 1 })}
                aria-label={`Ship one ${ITEMS[item].name}`}
              >
                Ship 1
              </button>
              <button
                className="icon-button"
                disabled={!game.inventory[item]}
                onClick={() =>
                  act({ type: "ship", item, quantity: game.inventory[item] })
                }
                aria-label={`Ship all ${ITEMS[item].name}`}
                title="Ship all"
              >
                <ArrowUpRight size={22} />
              </button>
            </div>
          ))}
        </div>
      </section>
      <section className="panel shipping-panel">
        <div className="section-heading">
          <h3>
            <Package size={22} /> The home sale bin
          </h3>
          <span className="price">
            <Coins size={18} />
            {shipmentValue(game)}
          </span>
        </div>
        <p>
          Rowan collects your shipment at the <strong>end of market day</strong>
          , even while you are away.
        </p>
        <div className="shipment-items">
          {shipping ? (
            ITEM_IDS.filter((item) => game.shipping[item]).map((item) => (
              <div key={item}>
                <span>
                  {game.shipping[item]} × {ITEMS[item].name}
                </span>
                <button
                  className="text-button"
                  onClick={() =>
                    act({ type: "unship", item, quantity: game.shipping[item] })
                  }
                  aria-label={`Return ${ITEMS[item].name} to pantry`}
                >
                  Return
                </button>
              </div>
            ))
          ) : (
            <p>Your next shipment starts with something from the pantry.</p>
          )}
        </div>
        <span className="collection-time">
          <Clock3 size={16} /> Collection in{" "}
          {timeLabel(getCalendar(game).untilShipment)}
        </span>
        {game.lastReceipt && (
          <div className="receipt">
            <Check size={19} />
            <span>
              Last delivery: <strong>+{game.lastReceipt.coins} coins</strong> ·{" "}
              {game.lastReceipt.units} goods
            </span>
          </div>
        )}
      </section>
      <section className="panel crafting">
        <span className="task-icon peach">
          <Flame size={25} />
        </span>
        <div>
          <h3>A little candle-making</h3>
          <p>
            {game.candleRecipe
              ? "3 beeswax → 1 handmade candle"
              : "Find the recipe at the market."}
          </p>
        </div>
        <button
          className="button"
          disabled={!game.candleRecipe || game.inventory.wax < 3}
          onClick={() => act({ type: "craft" })}
        >
          Make candle
        </button>
      </section>
    </>
  );
}

const offerIcons: Record<Offer["kind"], LucideIcon> = {
  hive: House,
  storage: Archive,
  garden: Shovel,
  plant: Sprout,
  recipe: BookOpen,
  collector: Settings2,
  tree: TreeDeciduous,
  bee: Bug,
};
export function MarketPanel({ game, act }: PanelProps) {
  const calendar = getCalendar(game);
  return (
    <>
      <section className={`market-banner ${calendar.marketOpen ? "open" : ""}`}>
        <div className="market-awning" />
        <Store size={40} strokeWidth={1.5} />
        <div>
          <h3>
            {calendar.marketOpen
              ? "The stalls are open!"
              : "Good things are on their way."}
          </h3>
          <p>
            {calendar.marketOpen
              ? `Closes in ${timeLabel(DAY_MS * (1 - calendar.dayProgress))}. Take a little look around.`
              : `Opens in ${timeLabel(calendar.untilMarket)}. Every seventh day.`}
          </p>
        </div>
      </section>
      <div className="offers-grid">
        {getOffers(game).map((offer) => {
          const Icon = offerIcons[offer.kind];
          return (
            <article className="panel offer-card" key={offer.id}>
              <span className={`offer-icon ${offer.kind}`}>
                <Icon size={29} strokeWidth={1.5} />
              </span>
              <h3>{offer.name}</h3>
              <p>{offer.description}</p>
              <span className="price">
                <Coins size={17} />
                {offer.price}
              </span>
              <button
                className="button"
                disabled={
                  !calendar.marketOpen ||
                  offer.soldOut ||
                  game.coins < offer.price
                }
                onClick={() => act({ type: "buy", offer: offer.id })}
                aria-label={`Buy ${offer.name}`}
              >
                {offer.soldOut
                  ? "All yours"
                  : !calendar.marketOpen
                    ? "Opens on day 7"
                    : game.coins < offer.price
                      ? "Save a little more"
                      : "Bring home"}
                {calendar.marketOpen &&
                  !offer.soldOut &&
                  game.coins >= offer.price && <Plus size={16} />}
              </button>
            </article>
          );
        })}
      </div>
      <p className="quiet-note market-footnote">
        <Heart size={16} /> Miss a market? There is always another. Special
        finds rotate weekly.
      </p>
    </>
  );
}

export function LettersPanel({ game, act }: PanelProps) {
  return (
    <>
      {getLetters(game).map((letter) => (
        <article className="letter-card" key={letter.id}>
          <div className="letter-top">
            <span className="avatar">{letter.from.charAt(0)}</span>
            <div>
              <strong>{letter.from}</strong>
              <small>{letter.role}</small>
            </div>
            <span className="letter-stamp">
              <Flower2 size={27} />
            </span>
          </div>
          <span className="eyebrow">
            {game.readLetters.includes(letter.id)
              ? "KEPT WITH CARE"
              : "A NEW LETTER"}
          </span>
          <h3>{letter.title}</h3>
          <p>{letter.body}</p>
          <div className="letter-signature">With warmth, {letter.from}</div>
          <button
            className="text-button"
            disabled={game.readLetters.includes(letter.id)}
            onClick={() => act({ type: "read", id: letter.id })}
          >
            {game.readLetters.includes(letter.id) ? (
              <>
                <Check size={17} />
                Read & tucked away
              </>
            ) : (
              <>
                Keep this letter
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </article>
      ))}
    </>
  );
}
