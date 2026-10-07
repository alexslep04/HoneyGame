import { Flame, TreeDeciduous } from "lucide-react";
import { ITEMS, type ItemId } from "../game/game";

export function BeeMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <g stroke="#625839" strokeWidth="1.8">
        <ellipse
          cx="18"
          cy="17"
          rx="7"
          ry="9"
          fill="#fffdf1"
          transform="rotate(-30 18 17)"
        />
        <ellipse
          cx="30"
          cy="17"
          rx="7"
          ry="9"
          fill="#fffdf1"
          transform="rotate(30 30 17)"
        />
        <ellipse cx="24" cy="29" rx="14" ry="10" fill="#e4b95e" />
        <path d="M20 20v18m8-18v18" />
        <circle cx="34" cy="27" r=".7" fill="#625839" />
      </g>
    </svg>
  );
}

export function Jar({
  item = "cloverHoney",
  small = false,
}: {
  item?: ItemId;
  small?: boolean;
}) {
  return (
    <span className={`product-art ${small ? "small" : ""}`} aria-hidden="true">
      {item === "candle" ? (
        <Flame />
      ) : item === "apple" ? (
        <TreeDeciduous />
      ) : item === "wax" ? (
        <svg viewBox="0 0 60 70">
          <path
            d="M30 8l22 13v27L30 61 8 48V21Z"
            fill="#e4bc64"
            stroke="#bf9a4e"
            strokeWidth="2"
          />
          <path
            d="M30 20l12 7v15l-12 7-12-7V27Z"
            fill="#f0ce7c"
            stroke="#caaa59"
            strokeWidth="2"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 60 70">
          <path
            d="M15 19h30l3 9v31q0 5-5 5H17q-5 0-5-5V28Z"
            fill={ITEMS[item].color}
          />
          <path
            d="M16 30v25"
            stroke="#fff7d9"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".65"
          />
          <rect x="12" y="12" width="36" height="10" rx="3" fill="#ae9972" />
          <path
            d="M16 14v5m6-5v5m6-5v5m6-5v5m6-5v5"
            stroke="#d4c4a1"
            strokeWidth="1.5"
          />
          <rect x="18" y="34" width="25" height="19" rx="2" fill="#f8f0d4" />
          <path d="M26 43l4-5 5 5-5 6Z" fill="#b89d5a" />
        </svg>
      )}
    </span>
  );
}
