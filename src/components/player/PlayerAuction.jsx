import React from "react";
import { useGame } from "../../context/GameContext";
import { pMoney, pInfo } from "../../utils/derivations";
import { ITEMS, ITEM_BY_ID } from "../../config/gameData";
import { ItemTray } from "../common/ItemTray";

export function PlayerAuction() {
  const { session, game, log, bids, ui, setUi, placeBid, players } = useGame();
  const a = game?.auction || {};
  const money = pMoney(log, session.playerId);

  const roundBids = bids
    .filter(b => b.data.round === a.round)
    .sort((x, y) => y.data.amount - x.data.amount || x.data.ts - y.data.ts);

  const currentBid = () => {
    const top = roundBids[0];
    return top ? { amount: top.data.amount, pid: top.data.pid } : { amount: a.price || 0, pid: null };
  };

  const cur = currentBid();
  const leader = cur.pid ? pInfo(players, cur.pid) : null;
  const mine = cur.pid === session.playerId;

  if (a.status === "idle") {
    return (
      <div className="stack g14">
        <span className="label hot">Auction room</span>
        <h2>Lot preparing</h2>
        <p className="lede">
          You have <span className="mono" style={{ color: "var(--amber)" }}>${money}</span> of operational funds. The Game Master is choosing the next lot.
        </p>
        <div className="panel flat stack g10">
          <span className="label">Tonight's catalogue</span>
          {ITEMS.map(i => (
            <div key={i.id} className="stack g6" style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
              <div className="row spread">
                <strong>{i.name}</strong>
                <span className="mono tiny">from ${i.start}</span>
              </div>
              <span className="tiny">{i.effect}</span>
            </div>
          ))}
        </div>
        <ItemTray />
        <span className="label blink">Waiting…</span>
      </div>
    );
  }

  const it = ITEM_BY_ID[a.itemId];

  if (a.status === "closed") {
    const w = a.winnerPid ? pInfo(players, a.winnerPid) : null;
    return (
      <div className="stack g14">
        <span className="label hot">Lot {a.round} closed</span>
        <h2>{it?.name}</h2>
        {w ? (
          <div className="center" style={{ padding: "14px 0" }}>
            <span className={`stamp ${a.winnerPid === session.playerId ? "good" : "wait"}`}>
              {a.winnerPid === session.playerId ? "Yours" : `Sold to ${w.name}`} · ${a.winningBid}
            </span>
          </div>
        ) : (
          <div className="center" style={{ padding: "14px 0" }}>
            <span className="stamp bad">No bids</span>
          </div>
        )}
        <p className="lede">{it?.effect}</p>
        <ItemTray />
        <span className="label blink">Waiting for the next lot…</span>
      </div>
    );
  }

  const steps = [25, 50, 100].filter(s => cur.amount + s <= money);

  return (
    <div className="stack g14">
      <div className="row spread">
        <span className="label hot">Lot {a.round} · bidding open</span>
        <span className="chip amber">Opening ${a.price}</span>
      </div>
      <h2>{it?.name}</h2>
      <p className="lede">{it?.effect}</p>
      <div className="panel lift stack g6">
        <span className="label">Current bid</span>
        <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
          <span className="mono" style={{ fontSize: "2.4rem", fontWeight: 600, color: "var(--amber)" }}>
            ${cur.amount}
          </span>
          {leader ? (
            <span className="row" style={{ gap: 6 }}>
              <span className="pdot" style={{ background: leader.color }}></span>
              <span className="tiny">{mine ? "you are leading" : `${leader.name} is leading`}</span>
            </span>
          ) : (
            <span className="tiny">no bids yet</span>
          )}
        </div>
      </div>
      <div className="row wrapping">
        {steps.map(s => (
          <button
            key={s}
            className="btn"
            onClick={() => placeBid(cur.amount + s)}
          >
            ${cur.amount + s}
          </button>
        ))}
        {!steps.length && (
          <span className="tiny">Your funds cannot beat this bid. Sit this lot out.</span>
        )}
      </div>
      <div className="row">
        <input
          id="bidin"
          className="mono"
          inputMode="numeric"
          placeholder="Custom amount"
          value={ui.bidInput || ""}
          onChange={e => setUi(prev => ({ ...prev, bidInput: e.target.value.replace(/[^0-9]/g, "") }))}
        />
        <button className="btn" onClick={() => placeBid(Number(ui.bidInput || 0))}>
          Bid
        </button>
      </div>
      <div className="panel flat stack g6">
        <span className="label">Bid history</span>
        {roundBids.length ? (
          roundBids.slice(0, 8).map(b => {
            const t = pInfo(players, b.data.pid);
            return (
              <div key={b.id} className="row">
                <span className="pdot" style={{ background: t.color }}></span>
                <span className="grow tiny">
                  {t.name}
                  {b.data.pid === session.playerId ? " · you" : ""}
                </span>
                <span className="mono">${b.data.amount}</span>
              </div>
            );
          })
        ) : (
          <span className="tiny">Nobody has bid yet. Somebody has to go first.</span>
        )}
      </div>
      <ItemTray />
    </div>
  );
}
