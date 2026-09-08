import React from "react";
import { useGame } from "../../context/GameContext";
import { ITEMS, ITEM_BY_ID } from "../../config/gameData";
import { pInfo } from "../../utils/derivations";

export function GmAuction() {
  const { game, players, bids, gmOpenAuction, gmCloseAuction } = useGame();
  const a = game?.auction || {};

  const roundBids = bids
    .filter(b => b.data.round === a.round)
    .sort((x, y) => y.data.amount - x.data.amount || x.data.ts - y.data.ts);

  const top = roundBids[0];
  const curAmount = top ? top.data.amount : (a.price || 0);

  return (
    <div className="panel stack g12">
      <div className="row spread">
        <span className="label">Auction desk</span>
        <span className={`chip ${a.status === "open" ? "amber blink" : ""}`}>
          {a.status === "open" ? `lot ${a.round} open` : a.status === "closed" ? `lot ${a.round} closed` : "idle"}
        </span>
      </div>

      {a.status === "open" ? (
        <div className="stack g10">
          <strong style={{ fontFamily: "var(--display)", textTransform: "uppercase", letterSpacing: ".04em" }}>
            {ITEM_BY_ID[a.itemId]?.name}
          </strong>
          <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
            <span className="mono" style={{ fontSize: "2rem", color: "var(--amber)" }}>
              ${curAmount}
            </span>
            {top ? (
              <span className="row" style={{ gap: 6 }}>
                <span className="pdot" style={{ background: pInfo(players, top.data.pid).color }}></span>
                <span className="tiny">{pInfo(players, top.data.pid).name}</span>
              </span>
            ) : (
              <span className="tiny">no bids</span>
            )}
          </div>
          <div className="feed" style={{ maxHeight: 150 }}>
            {roundBids.map(b => (
              <div key={b.id} className="ev">
                <span className="pdot" style={{ background: pInfo(players, b.data.pid).color }}></span>
                <span className="grow">{pInfo(players, b.data.pid).name}</span>
                <span className="mono">${b.data.amount}</span>
              </div>
            ))}
          </div>
          <button className="btn primary block" onClick={gmCloseAuction}>
            Going once, going twice — close the lot
          </button>
        </div>
      ) : (
        <div className="stack g8">
          <span className="tiny">Choose a lot to put up for bidding.</span>
          {ITEMS.map(i => (
            <button
              key={i.id}
              className="btn sm"
              onClick={() => gmOpenAuction(i.id)}
              style={{ textAlign: "left" }}
            >
              Open {i.name} <span className="mono" style={{ opacity: 0.6 }}>· from ${i.start}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
