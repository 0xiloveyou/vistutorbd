"use client";

import { useEffect, useState } from "react";
import { pick, speak } from "./shared";

export default function MoneyShopRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const coins = data.coins ?? [1, 2, 5, 10];
  const mode = data.mode ?? "coins";
  const item = data.item ?? {
    emoji: "🧸",
    name: { en: "Teddy", bn: "টেডি" },
    price: 2,
  };
  const price = item.price ?? 2;
  const [paid, setPaid] = useState(0);

  useEffect(() => setPaid(0), [step]);

  const change = Math.max(0, paid - price);

  return (
    <div className="money-viz">
      {mode === "shop" ? (
        <div className="shop-item">
          <span className="shop-emoji" aria-hidden="true">
            {item.emoji}
          </span>
          <strong>{pick(item.name, lang)}</strong>
          <span className="shop-price">৳{price}</span>
        </div>
      ) : (
        <div className="money-intro">
          <span aria-hidden="true">🪙</span>
          <strong>{pick(data.caption, lang) || "Tap a coin to hear its value."}</strong>
        </div>
      )}

      <div className="coin-row">
        {coins.map((coin) => (
          <button
            key={coin}
            type="button"
            className={`money ${coin >= 10 ? "note" : "coin"}`}
            onClick={() => {
              setPaid((current) => current + coin);
              speak(`${coin} taka`, lang, sound);
            }}
            aria-label={`${coin} taka`}
          >
            ৳{coin}
          </button>
        ))}
      </div>

      <div className="money-total">
        <span>
          Paid <strong>৳{paid}</strong>
        </span>
        {mode === "shop" ? (
          <span className={change >= 0 ? "change" : ""}>
            Change <strong>৳{change}</strong>
          </span>
        ) : null}
      </div>
      <p className="oc-caption">{pick(data.caption, lang)}</p>
    </div>
  );
}
