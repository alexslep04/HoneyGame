import { memo, useLayoutEffect, useRef, useState } from "react";
import { Flower2, Home, Sparkles } from "lucide-react";
import { getCalendar, harvestReady, type GameState } from "../game/game";

function Flower({
  x,
  y,
  color = "#f5efce",
  scale = 1,
}: {
  x: number;
  y: number;
  color?: string;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0q-5-13 0-26m-1 14q-13-10-12-1m13-5q12-10 12-2"
        fill="none"
        stroke="#789359"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g fill={color}>
        {[-90, -18, 54, 126, 198].map((r) => (
          <ellipse
            key={r}
            cx="0"
            cy="-31"
            rx="5"
            ry="8"
            transform={`rotate(${r} 0 -25)`}
          />
        ))}
      </g>
      <circle cy="-25" r="4" fill="#d8a854" />
    </g>
  );
}

function Tree({
  x,
  y,
  size = 1,
  autumn = false,
  winter = false,
  apples = false,
}: {
  x: number;
  y: number;
  size?: number;
  autumn?: boolean;
  winter?: boolean;
  apples?: boolean;
}) {
  const colors = winter
    ? ["#b5c3b0", "#cbd4c0", "#dce0cc"]
    : autumn
      ? ["#bd975d", "#d5ae6a", "#dfc482"]
      : ["#789467", "#95ad78", "#acc38c"];
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cy="8" rx="52" ry="13" fill="#496749" opacity=".1" />
      <path d="M-6 0L-8-91h17L7 0Z" fill="#9c8460" />
      <path
        d="M0-37l-22-26M2-56l22-24"
        fill="none"
        stroke="#9c8460"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M-52-71q-16-28 6-50-5-32 26-38 28-19 48 5 33-3 34 27 24 24 5 49-23 30-61 15-36 16-58-8"
        fill={colors[0]}
      />
      <ellipse cx="-11" cy="-126" rx="43" ry="34" fill={colors[1]} />
      <ellipse
        cx="-17"
        cy="-137"
        rx="26"
        ry="19"
        fill={colors[2]}
        opacity=".55"
      />
      {apples &&
        [
          [-26, -110],
          [21, -101],
          [7, -141],
          [-5, -83],
        ].map(([a, b]) => (
          <g key={`${a}${b}`}>
            <circle cx={a} cy={b} r="6" fill="#c87962" />
            <path d={`M${a} ${b - 5}l3-5`} stroke="#60724c" strokeWidth="2" />
          </g>
        ))}
    </g>
  );
}

function Bee({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="flying-bee" style={{ animationDelay: `${delay}s` }}>
        <ellipse
          cy="-5"
          cx="-3"
          rx="4"
          ry="6"
          fill="#fffef3"
          opacity=".9"
          transform="rotate(-30)"
        />
        <ellipse
          cy="-5"
          cx="4"
          rx="4"
          ry="6"
          fill="#fffef3"
          opacity=".9"
          transform="rotate(30)"
        />
        <ellipse rx="8" ry="5" fill="#dfb858" />
        <path d="M-3-4v8m5-8v8" stroke="#715d3f" strokeWidth="2" />
        <circle cx="7" cy="-1" r="1.2" fill="#4f513c" />
      </g>
    </g>
  );
}

const GardenArtwork = memo(
  function GardenArtwork({
    portrait,
    season,
    treeOwned,
    plots,
  }: {
    portrait: boolean;
    season: ReturnType<typeof getCalendar>["season"];
    treeOwned: boolean;
    plots: GameState["plots"];
  }) {
    const winter = season === "Winter";
    const autumn = season === "Autumn";
    const grass = winter ? "#d5ddd0" : autumn ? "#c6c38e" : "#bfd09f";
    const world = portrait
      ? { width: 480, height: 860 }
      : { width: 840, height: 510 };
    return (
      <svg
        viewBox={`0 0 ${world.width} ${world.height}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Your ${season.toLowerCase()} backyard, with a cottage, flower beds, and a wooden beehive`}
      >
        <defs>
          <linearGradient id="sky" x2="0" y2="1">
            <stop stopColor="#e2e9d8" />
            <stop offset="1" stopColor="#f2edda" />
          </linearGradient>
          <linearGradient id="lawn" x2=".3" y2="1">
            <stop stopColor={grass} />
            <stop offset="1" stopColor={winter ? "#e1e5d6" : "#d2dcb2"} />
          </linearGradient>
          <linearGradient id="roof" x2="0" y2="1">
            <stop stopColor="#b88c72" />
            <stop offset="1" stopColor="#a57961" />
          </linearGradient>
          <pattern
            id="soil"
            width="20"
            height="17"
            patternUnits="userSpaceOnUse"
          >
            <rect width="20" height="17" fill="#9b8965" />
            <circle cx="5" cy="6" r="1.5" fill="#ad9870" />
            <path d="M12 12h4" stroke="#81795a" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={world.width} height={world.height} fill="url(#sky)" />
        <circle
          cx={portrait ? 374 : 652}
          cy={portrait ? 142 : 87}
          r="36"
          fill="#f4e7b5"
          opacity=".85"
        />
        <path
          d={
            portrait
              ? "M0 218Q87 116 228 200T480 166V344H0Z"
              : "M0 172Q105 66 263 144T517 143T840 105V344H0Z"
          }
          fill="#c7d3b5"
        />
        <path
          d={
            portrait
              ? "M0 258Q138 167 300 222T480 222V365H0Z"
              : "M0 190Q156 133 326 179T624 169T840 155V365H0Z"
          }
          fill="#b2c49f"
        />
        <g
          className="cloud-drift"
          fill="#f7f4e8"
          opacity=".65"
          transform={portrait ? "translate(-65 80)" : undefined}
        >
          <ellipse cx="167" cy="64" rx="48" ry="9" />
          <ellipse cx="191" cy="59" rx="22" ry="11" />
          <ellipse cx="527" cy="46" rx="37" ry="8" />
        </g>
        <path
          d={
            portrait
              ? "M0 300Q260 232 480 287V860H0Z"
              : "M0 232Q402 188 840 221V510H0Z"
          }
          fill="url(#lawn)"
        />
        <path
          d={
            portrait
              ? "M0 397q140-31 260 2t220-25"
              : "M0 260q230-28 413 15t427-25"
          }
          stroke="#e5e3bc"
          strokeWidth="2"
          fill="none"
          opacity=".6"
        />
        <g
          transform={portrait ? "translate(-30 78)" : undefined}
          stroke="#e9e6cc"
          strokeWidth="9"
          strokeLinecap="round"
        >
          <path d="M0 223L840 214M0 249L840 242" />
          {Array.from({ length: 23 }, (_, i) => (
            <path key={i} d={`M${i * 39} 207v58`} />
          ))}
        </g>
        <g transform={portrait ? "translate(68 335)" : "translate(106 239)"}>
          <ellipse
            cx="122"
            cy="35"
            rx="145"
            ry="27"
            fill="#6c815b"
            opacity=".13"
          />
          <path d="M7-104h203V29H7Z" fill="#ece2bc" />
          <path d="M134-104h76V29h-76Z" fill="#dccfaa" />
          <path d="M-17-104L31-185h174l40 81Z" fill="url(#roof)" />
          <path d="M-17-104L31-185h12l-43 81Z" fill="#c69d81" />
          <path d="M149-185h56l40 81h-36Z" fill="#9e735e" />
          <path d="M159-166v-45h24v63" fill="#baa38b" />
          <path d="M153-210h36" stroke="#a9917a" strokeWidth="6" />
          {[0, 1, 2].map((n) => (
            <path
              key={n}
              d={`M${11 - n * 10} ${-143 + n * 17}h${210 + n * 9}`}
              stroke="#9d755e"
              opacity=".4"
              fill="none"
            />
          ))}
          <path d="M87 29v-75q0-20 18-20t18 20v75Z" fill="#80927d" />
          <path
            d="M97-44v52m11-58v58m10-49v49"
            stroke="#6d806c"
            strokeWidth="1.5"
          />
          <circle cx="114" cy="-4" r="2.5" fill="#ddc481" />
          <path
            d="M23-64h42v44H23Z"
            fill="#b5c9bf"
            stroke="#faf2d5"
            strokeWidth="6"
          />
          <path d="M44-64v44M23-42h42" stroke="#faf2d5" strokeWidth="3" />
          <path
            d="M155-64h33v40h-33Z"
            fill="#a7bcb0"
            stroke="#f2e8c7"
            strokeWidth="5"
          />
          <path d="M171-64v40m-16-20h33" stroke="#f2e8c7" strokeWidth="2" />
          <path d="M18-16h52l-5 14H23Z" fill="#b68d6b" />
          <g fill="#83955e">
            <circle cx="26" cy="-18" r="8" />
            <circle cx="45" cy="-17" r="9" />
            <circle cx="61" cy="-17" r="7" />
          </g>
          {[27, 42, 59].map((x) => (
            <circle key={x} cx={x} cy="-23" r="4" fill="#e7ccbb" />
          ))}
          <path d="M75 29h64l7 12H68Z" fill="#ccc5a8" />
          <path
            d="M187 29q19-18 13-59t23-62"
            stroke="#87996a"
            strokeWidth="4"
            fill="none"
          />
          {[
            [-20, 0],
            [0, -20],
            [4, -49],
            [18, -69],
          ].map(([x, y]) => (
            <ellipse
              key={y}
              cx={203 + x}
              cy={y}
              rx="12"
              ry="5"
              fill="#8ba16b"
              transform={`rotate(-30 ${203 + x} ${y})`}
            />
          ))}
        </g>
        <path
          d={
            portrait
              ? "M172 370q-31 72 33 123t-27 114q-59 30 14 121t38 132"
              : "M208 281q-28 70 46 92t58 137"
          }
          stroke="#ddd4b3"
          strokeWidth="47"
          fill="none"
        />
        <path
          d={portrait ? "M211 480q41 40 116 28" : "M251 363q93-43 241-16"}
          stroke="#ddd4b3"
          strokeWidth="29"
          fill="none"
        />
        {(portrait
          ? [
              [168, 386, 17, 7],
              [169, 419, 17, 8],
              [187, 451, 18, 8],
              [212, 487, 17, 8],
              [213, 524, 18, 9],
              [196, 557, 18, 8],
              [170, 592, 17, 8],
              [173, 636, 17, 8],
              [196, 675, 17, 8],
              [220, 718, 17, 8],
              [232, 760, 18, 8],
              [233, 801, 18, 8],
            ]
          : [
              [200, 302, 17, 7],
              [209, 324, 16, 8],
              [228, 346, 18, 7],
              [266, 373, 17, 8],
              [291, 400, 17, 8],
              [310, 434, 16, 7],
              [317, 470, 19, 9],
            ]
        ).map(([x, y, rx, ry]) => (
          <ellipse
            key={y}
            cx={x}
            cy={y}
            rx={rx}
            ry={ry}
            fill="#c6bea2"
            stroke="#e8dfc0"
            strokeWidth="2"
            transform={`rotate(10 ${x} ${y})`}
          />
        ))}
        <Tree
          x={portrait ? 23 : 55}
          y={portrait ? 462 : 317}
          size={1.15}
          autumn={autumn}
          winter={winter}
        />
        <Tree
          x={portrait ? 450 : 780}
          y={portrait ? 386 : 277}
          size={1.3}
          autumn={autumn}
          winter={winter}
        />
        <Tree
          x={portrait ? 442 : 681}
          y={portrait ? 649 : 255}
          size={0.88}
          autumn={autumn}
          winter={winter}
          apples={treeOwned}
        />
        <g transform={portrait ? "translate(326 469)" : "translate(489 321)"}>
          <ellipse cy="33" rx="62" ry="15" fill="#63774b" opacity=".19" />
          <path d="M-33 13v31m63-31v31" stroke="#8e7958" strokeWidth="9" />
          <rect x="-42" y="-61" width="84" height="85" rx="3" fill="#dcbb72" />
          <path d="M25-61h17v85H25Z" fill="#c5a460" />
          <path
            d="M-42-35h84m-84 27h84m-84 27h84"
            stroke="#b09457"
            strokeWidth="2"
          />
          <path d="M-50-61l11-27h74l17 27Z" fill="#8f9c83" />
          <path
            d="M-50-61h102"
            stroke="#71876e"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M-16 18h29"
            stroke="#6e5c39"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="-15" y="-24" width="28" height="9" rx="3" fill="#c4a15b" />
          <path d="M-27 26h51l8 8h-65Z" fill="#ac925f" />
          <circle cx="-1" cy="-47" r="6" fill="#edcf81" />
        </g>
        <g transform={portrait ? "translate(271 391)" : "translate(371 291)"}>
          <path d="M0 28v-39" stroke="#8b805f" strokeWidth="5" />
          <rect
            x="-26"
            y="-21"
            width="51"
            height="25"
            rx="3"
            fill="#e6d8b0"
            transform="rotate(-5)"
          />
          <path d="M-16-8h31m-26 6h22" stroke="#a29670" strokeWidth="2" />
        </g>
        <g
          transform={
            portrait ? "translate(45 525) scale(1.05)" : "translate(578 356)"
          }
        >
          {plots.map((plant, i) => {
            const x = (i % 4) * 44;
            const y = Math.floor(i / 4) * 55;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path
                  d="M-5 0h37l-4 32H-9Z"
                  fill="url(#soil)"
                  stroke="#bba27a"
                  strokeWidth="4"
                />
                {plant && (
                  <>
                    {plant === "lavender" ? (
                      <g stroke="#7e9464" strokeWidth="2.5">
                        {[1, 10, 20].map((a) => (
                          <g key={a}>
                            <path d={`M${a} 19l4-37`} />
                            {[0, 6, 12].map((b) => (
                              <ellipse
                                key={b}
                                cx={a + 4}
                                cy={-18 + b}
                                rx="3.8"
                                ry="5.5"
                                fill="#9b8fb1"
                                stroke="none"
                              />
                            ))}
                          </g>
                        ))}
                      </g>
                    ) : (
                      <>
                        <Flower x={7} y={22} scale={0.6} />
                        <Flower x={21} y={12} scale={0.5} />
                      </>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </g>
        <g transform={portrait ? "translate(316 611)" : "translate(449 424)"}>
          <ellipse rx="28" ry="9" fill="#6c815b" opacity=".1" />
          <path d="M-15-27h29l-2 25h-23Z" fill="#8fa3a0" />
          <path
            d="M14-20q30-8 21 13L12-4"
            stroke="#809692"
            strokeWidth="4"
            fill="none"
          />
          <path d="M-15-14l-19-11-7 4 27 21" fill="#8fa3a0" />
          <path
            d="M-5-26q1-20 11-15l7 16"
            stroke="#809692"
            strokeWidth="4"
            fill="none"
          />
        </g>
        <g transform={portrait ? "translate(83 677)" : "translate(144 402)"}>
          <path
            d="M-42 1q-3-22 22-31t53 7q25 20 3 37t-59 4q-27-3-19-17"
            fill="#b6c9bc"
            stroke="#c4c8a8"
            strokeWidth="7"
          />
          <path
            d="M-17-16q21-8 36 3m-47 17h32"
            fill="none"
            stroke="#d5e0cd"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse cx="27" cy="7" rx="10" ry="4" fill="#8fa681" />
        </g>
        <g opacity={winter ? 0.45 : 1}>
          {(portrait
            ? [
                [45, 640],
                [58, 665],
                [301, 557],
                [328, 577],
                [405, 690],
                [388, 720],
                [37, 543],
                [273, 521],
                [419, 438],
                [70, 772],
                [330, 740],
                [269, 362],
              ]
            : [
                [74, 453],
                [98, 472],
                [365, 453],
                [386, 472],
                [736, 421],
                [762, 446],
                [43, 369],
                [331, 304],
                [553, 276],
              ]
          ).map(([x, y], i) => (
            <Flower
              key={i}
              x={x}
              y={y}
              scale={i % 2 ? 0.7 : 0.95}
              color={i % 3 ? "#f4f0d4" : "#deb5a8"}
            />
          ))}
        </g>
        {(portrait
          ? [
              [291, 399],
              [357, 438],
              [248, 542],
              [155, 556],
              [300, 470],
            ]
          : [
              [317, 282],
              [524, 272],
              [565, 311],
              [466, 238],
              [620, 337],
            ]
        ).map(([x, y], i) => (
          <Bee key={i} x={x} y={y} delay={-i * 1.3} />
        ))}
        <g fill="#8da16d" opacity=".5">
          {(portrait
            ? [
                [32, 721],
                [348, 663],
                [410, 821],
                [424, 481],
                [143, 422],
                [381, 585],
                [90, 682],
                [335, 707],
              ]
            : [
                [43, 478],
                [550, 456],
                [705, 485],
                [804, 341],
                [269, 288],
                [377, 358],
                [17, 336],
                [692, 295],
              ]
          ).map(([x, y]) => (
            <path
              key={x}
              d={`M${x} ${y}l-3-7m3 7l4-10m-4 10l8-4`}
              stroke="#8da16d"
              strokeWidth="2"
            />
          ))}
        </g>
        <path
          d={
            portrait
              ? "M0 810q100-37 236-5t244 15v40H0Z"
              : "M0 502q120-31 230-1t310 2t300-4v20H0Z"
          }
          fill="#abc48f"
          opacity=".6"
        />
      </svg>
    );
  },
  (previous, next) =>
    previous.portrait === next.portrait &&
    previous.season === next.season &&
    previous.treeOwned === next.treeOwned &&
    previous.plots.length === next.plots.length &&
    previous.plots.every((plant, index) => plant === next.plots[index]),
);

export function GardenScene({
  game,
  onHive,
  onGarden,
  onHouse,
}: {
  game: GameState;
  onHive: () => void;
  onGarden: () => void;
  onHouse: () => void;
}) {
  const calendar = getCalendar(game);
  const ready = harvestReady(game);
  const scene = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(scene.current!);
    return () => observer.disconnect();
  }, []);
  const portrait = size.width / size.height < 0.8;
  const world = portrait
    ? { width: 480, height: 860 }
    : { width: 840, height: 510 };
  const scale = Math.max(size.width / world.width, size.height / world.height);
  const marker = (x: number, y: number) => ({
    left: Math.max(
      75,
      Math.min(
        size.width - 75,
        x * scale + (size.width - world.width * scale) / 2,
      ),
    ),
    top: y * scale + (size.height - world.height * scale) / 2,
  });
  return (
    <div
      ref={scene}
      className={`garden-scene season-${calendar.season.toLowerCase()}`}
    >
      <GardenArtwork
        portrait={portrait}
        season={calendar.season}
        treeOwned={game.tree.owned}
        plots={game.plots}
      />
      <button
        className={`scene-marker hive-marker ${ready ? "ready" : ""}`}
        style={portrait ? marker(326, 383) : marker(489, 217)}
        onClick={onHive}
        aria-label="Open the hive"
      >
        <Sparkles size={17} />
        <span>{ready ? `${ready} ready to gather` : "The little hive"}</span>
      </button>
      <button
        className="scene-marker garden-marker"
        style={portrait ? marker(123, 475) : marker(650, 420)}
        onClick={onGarden}
        aria-label="Tend the flower beds"
      >
        <Flower2 size={17} />
        <span>Flower beds</span>
      </button>
      <button
        className="scene-marker house-marker"
        style={portrait ? marker(163, 356) : marker(203, 291)}
        onClick={onHouse}
        aria-label="Open the pantry and home shipping box"
      >
        <Home size={17} />
        <span>Home</span>
      </button>
    </div>
  );
}
