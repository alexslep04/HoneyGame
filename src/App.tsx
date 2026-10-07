import { useEffect, useState } from "react";
import {
  Archive,
  ArrowDownToLine,
  BookOpen,
  Bug,
  Check,
  ChevronRight,
  Clock3,
  Coins,
  Flower2,
  Leaf,
  Mail,
  Package,
  RotateCcw,
  Settings2,
  ShoppingBasket,
  Sprout,
  Store,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { GardenScene } from "./components/GardenScene";
import { BottomSheet } from "./components/BottomSheet";
import { BeeMark, Jar } from "./components/GameIcons";
import {
  GardenPanel,
  HivePanel,
  LettersPanel,
  MarketPanel,
  PantryPanel,
  timeLabel,
} from "./components/GamePanels";
import {
  DAY_MS,
  getCalendar,
  getHiveCapacity,
  getLetters,
  getStorageCapacity,
  harvestReady,
  honeyTotal,
  inventoryCount,
  storageUsed,
} from "./game/game";
import { useGame } from "./useGame";
import { installBackHandler } from "./platform/native";

type Panel = "hive" | "garden" | "pantry" | "market" | "letters" | "notebook";
const panelTitles: Record<Panel, string> = {
  hive: "The little hive",
  garden: "Your flower garden",
  pantry: "Pantry & shipping",
  market: "Village market",
  letters: "Letters from the village",
  notebook: "Beekeeper’s notebook",
};
const panelSubtitles: Record<Panel, string> = {
  hive: "SMALL WINGS. SWEET THINGS.",
  garden: "A LITTLE ROOM TO GROW",
  pantry: "FROM YOUR HIVE, WITH LOVE",
  market: "A WALK INTO BRAMBLEWICK",
  letters: "A LITTLE NOTE FOR YOU",
  notebook: "A FEW USEFUL THINGS",
};
const dockItems = [
  { id: "hive" as const, label: "Hive", accessible: "The hive", Icon: Bug },
  {
    id: "garden" as const,
    label: "Plant",
    accessible: "Flower garden",
    Icon: Sprout,
  },
  {
    id: "pantry" as const,
    label: "Pantry",
    accessible: "Pantry",
    Icon: ShoppingBasket,
  },
  {
    id: "market" as const,
    label: "Market",
    accessible: "Village market",
    Icon: Store,
  },
  {
    id: "letters" as const,
    label: "Letters",
    accessible: "Letters",
    Icon: Mail,
  },
];

export default function App() {
  const {
    game,
    loading,
    locked,
    loadError,
    saveError,
    notice,
    away,
    dismissAway,
    act,
    previewTime,
    reset,
    restore,
    exportSave,
    importSave,
  } = useGame();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [showGuide, setShowGuide] = useState(() => window.innerHeight > 600);
  const calendar = getCalendar(game);
  const ready = harvestReady(game);
  const fullStorage = storageUsed(game) >= getStorageCapacity(game);
  const unread = getLetters(game).filter(
    (letter) => !game.readLetters.includes(letter.id),
  ).length;
  const blocked = loading || locked || Boolean(loadError);
  const progress =
    game.stats.sold > 0
      ? 4
      : inventoryCount(game.shipping) > 0
        ? 3
        : game.stats.harvested > 0
          ? 2
          : game.care.inspectedDay >= 0
            ? 1
            : 0;
  const hints: { title: string; text: string; target: Panel }[] = [
    {
      title: "Meet your little colony",
      text: "Tap the hive to give your bees a little care.",
      target: "hive",
    },
    {
      title: "Something sweet is growing",
      text: "Gather a jar when your bees are ready.",
      target: "hive",
    },
    {
      title: "A little honey to share",
      text: "Pack your first shipment in the pantry.",
      target: "pantry",
    },
    {
      title: "A delivery to look forward to",
      text: "Rowan collects at the end of market day.",
      target: "pantry",
    },
    {
      title: "Make this place your own",
      text: "A new bloom, a roomier hive. What comes next?",
      target: "market",
    },
  ];

  useEffect(() => {
    // Escape is handled by the native dialog. Android Back closes the same
    // dialog first, then returns the app to the background from the garden.
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void installBackHandler()
      .then((cleanup) => {
        if (cancelled) cleanup();
        else dispose = cleanup;
      })
      .catch((error) =>
        console.warn("Could not register Android Back handling", error),
      );
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div className="game-app">
      <main className="game-world" aria-label="Your backyard" inert={blocked}>
        <h1 className="sr-only">Honey & Hearth — your backyard</h1>
        <GardenScene
          game={game}
          onHive={() => setPanel("hive")}
          onGarden={() => setPanel("garden")}
          onHouse={() => setPanel("pantry")}
        />
        <header className="game-hud">
          <div className="hud-calendar">
            <span className="hud-season">
              <Sun size={23} />
            </span>
            <div>
              <strong>
                {calendar.season} <span>·</span> Day {calendar.day}
              </strong>
              <small>
                Year {calendar.year} · Week {calendar.weekOfSeason}
              </small>
              <div
                className="day-track"
                aria-label={`${Math.round(calendar.dayProgress * 100)} percent of the day passed`}
              >
                <span style={{ width: `${calendar.dayProgress * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="hud-right">
            <div className="coin-balance" aria-label={`${game.coins} coins`}>
              <span>
                <Coins size={21} />
              </span>
              <strong>{game.coins.toLocaleString()}</strong>
            </div>
            <button
              className="hud-button"
              aria-label="Open beekeeper notebook"
              onClick={() => setPanel("notebook")}
            >
              <Settings2 size={23} />
            </button>
          </div>
        </header>
        <div className="world-location">
          <span className="live-dot" /> BRAMBLEWICK <span>·</span> your backyard
        </div>
        <div className="world-tools">
          <button
            className="hud-button mail-button"
            aria-label="Read village letters"
            onClick={() => setPanel("letters")}
          >
            <Mail size={24} />
            {unread > 0 && <span className="notification-count">{unread}</span>}
          </button>
          <button
            className="hud-button"
            aria-label={showGuide ? "Hide garden guide" : "Show garden guide"}
            aria-pressed={showGuide}
            onClick={() => setShowGuide(!showGuide)}
          >
            <BookOpen size={23} />
          </button>
        </div>
        <div className="world-bottom">
          {showGuide && (
            <button
              className="garden-guide"
              onClick={() => setPanel(hints[progress].target)}
            >
              <span className="guide-bee">
                <BeeMark />
              </span>
              <span>
                <span className="eyebrow">
                  {progress < 4
                    ? "YOUR FIRST LITTLE CHAPTER"
                    : "A LITTLE POSSIBILITY"}
                </span>
                <strong>{hints[progress].title}</strong>
                <small>{hints[progress].text}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          )}
          <div className="harvest-row">
            <button
              className="honey-meter"
              onClick={() => setPanel("hive")}
              aria-label={`Hive honey: ${honeyTotal(game).toFixed(1)} of ${getHiveCapacity(game)} jars`}
            >
              <Jar small />
              <span>
                <strong>
                  {honeyTotal(game).toFixed(1)}
                  <small> / {getHiveCapacity(game)}</small>
                </strong>
                <span className="mini-track">
                  <span
                    style={{
                      width: `${(honeyTotal(game) / getHiveCapacity(game)) * 100}%`,
                    }}
                  />
                </span>
              </span>
            </button>
            <button
              className="quick-harvest"
              disabled={!ready || fullStorage}
              onClick={() => act({ type: "harvest" })}
            >
              <ShoppingBasket size={22} />
              <span>
                {fullStorage
                  ? "Pantry full"
                  : ready
                    ? `Gather (${ready})`
                    : "Making honey"}
                <small>
                  {fullStorage
                    ? "Ship or store more"
                    : ready
                      ? "A little golden goodness"
                      : "Your bees are busy"}
                </small>
              </span>
              {ready > 0 && !fullStorage && (
                <span className="harvest-spark">✦</span>
              )}
            </button>
          </div>
          <nav className="game-dock" aria-label="Your apiary">
            {dockItems.map(({ id, label, accessible, Icon }) => (
              <button
                key={id}
                onClick={() => setPanel(id)}
                aria-label={accessible}
              >
                <span className={`dock-icon dock-${id}`}>
                  <Icon size={25} strokeWidth={1.8} />
                  {id === "letters" && unread > 0 && (
                    <span className="dock-dot" />
                  )}
                  {id === "market" && calendar.marketOpen && (
                    <span className="dock-dot" />
                  )}
                </span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </main>
      {!blocked && (
        <div className="world-alerts">
          {saveError && (
            <div className="banner error" role="alert">
              {saveError}
            </div>
          )}
          {away && (
            <div className="banner welcome">
              <Leaf size={21} />
              <div>
                <strong>Welcome back, beekeeper.</strong>
                <p>{away}</p>
              </div>
              <button
                className="icon-button"
                onClick={dismissAway}
                aria-label="Dismiss welcome back"
              >
                <X size={21} />
              </button>
            </div>
          )}
        </div>
      )}
      {blocked && (
        <div className="recovery-screen">
          <span className="recovery-bee">
            <BeeMark />
          </span>
          <h1>
            {loading
              ? "Opening the garden gate…"
              : locked
                ? "Your garden is open in another tab."
                : "Let’s keep your save safe."}
          </h1>
          <p>
            {loading
              ? "A little place of your own."
              : locked
                ? "Close the other game tab, then reload this one to continue."
                : loadError}
          </p>
          {!loading && (
            <div className="button-row">
              {locked ? (
                <button
                  className="button primary"
                  onClick={() => window.location.reload()}
                >
                  Reload this tab
                </button>
              ) : (
                <>
                  <button className="button" onClick={() => void exportSave()}>
                    Export existing save
                  </button>
                  <button className="button" onClick={() => void restore()}>
                    Restore backup
                  </button>
                  <button className="text-button" onClick={() => void reset()}>
                    Start a new backyard
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <BottomSheet
        open={panel !== null && !blocked}
        title={panel ? panelTitles[panel] : ""}
        subtitle={panel ? panelSubtitles[panel] : ""}
        notice={saveError || notice}
        onClose={() => setPanel(null)}
      >
        {panel === "hive" && <HivePanel game={game} act={act} />}
        {panel === "garden" && <GardenPanel game={game} act={act} />}
        {panel === "pantry" && <PantryPanel game={game} act={act} />}
        {panel === "market" && <MarketPanel game={game} act={act} />}
        {panel === "letters" && <LettersPanel game={game} act={act} />}
        {panel === "notebook" && (
          <>
            <section className="panel notebook-section">
              <h3>
                <Clock3 size={20} /> The rhythm of this place
              </h3>
              <p>
                A day lasts 10 real minutes. The market opens every seventh day,
                and your home sale bin pays out when it closes. Four weeks make
                a season.
              </p>
              <p>
                Calendar catch-up stops after two weeks away. Your bees keep
                working until their containers fill. No hurry, no lost progress.
              </p>
              <div className="notebook-stats">
                <span>
                  <Sun size={17} />
                  Next day in {timeLabel(DAY_MS * (1 - calendar.dayProgress))}
                </span>
                <span>
                  <Check size={17} />
                  {saveError
                    ? "Save needs attention"
                    : "Progress saved on this device"}
                </span>
              </div>
            </section>
            <section className="panel notebook-section">
              <h3>
                <Archive size={20} /> Keep your progress close
              </h3>
              <p>
                Export a copy before moving to another device or removing the
                app.
              </p>
              <div className="button-row">
                <button className="button" onClick={() => void exportSave()}>
                  <ArrowDownToLine size={18} />
                  Export save
                </button>
                <label className="button file-label">
                  <Upload size={18} />
                  Import save
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void importSave(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                <button className="text-button" onClick={() => void restore()}>
                  Restore backup
                </button>
              </div>
            </section>
            <section className="panel notebook-section">
              <h3>
                <Package size={20} /> Try a little time travel
              </h3>
              <p>
                First-playable preview tools. These advance your current save,
                so you can try the game without waiting.
              </p>
              <div className="button-row">
                <button className="button" onClick={() => previewTime(60_000)}>
                  Pass 1 minute
                </button>
                <button className="button" onClick={() => previewTime(DAY_MS)}>
                  Pass 1 day
                </button>
                <button
                  className="button"
                  onClick={() =>
                    previewTime(
                      calendar.marketOpen
                        ? calendar.untilShipment
                        : calendar.untilMarket,
                    )
                  }
                >
                  {calendar.marketOpen
                    ? "Close this market"
                    : "Go to market day"}
                </button>
                <button
                  className="button"
                  onClick={() => previewTime(DAY_MS * 28, true)}
                >
                  Preview long absence
                </button>
              </div>
            </section>
            <div className="notebook-bottom">
              <span>Honey & Hearth · a little more grown</span>
              <button className="text-button" onClick={() => void reset()}>
                <RotateCcw size={16} />
                Start fresh
              </button>
            </div>
          </>
        )}
      </BottomSheet>
      <div
        className={`toast ${notice && !panel ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && !panel && (
          <>
            <Flower2 size={22} />
            <span>{notice}</span>
          </>
        )}
      </div>
    </div>
  );
}
