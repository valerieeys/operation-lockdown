import React from "react";
import { useGame } from "../../context/GameContext";
import { pItems } from "../../utils/derivations";
import { ITEM_BY_ID } from "../../config/gameData";

export function ItemTray({ currentRef }) {
  const { session, log, game, useItem } = useGame();
  const items = pItems(log, session.playerId);

  if (!items.length) return null;

  const usable = {
    masterkey: !!currentRef,
    hint: !!currentRef,
    timeboost: true,
    intel: game?.phase === "spy",
    shield: false
  };

  return (
    <div className="stack g8">
      <span className="label">Your kit</span>
      <div className="row wrapping">
        {items.map(g => {
          const it = ITEM_BY_ID[g.item];
          const can = usable[g.item];
          if (g.item === "shield") {
            return (
              <span key={g.inst} className="chip on" title={it.effect}>
                Shield · automatic
              </span>
            );
          }
          return (
            <button
              key={g.inst}
              className="btn sm"
              disabled={!can}
              title={it.effect}
              onClick={() => useItem(g.item, currentRef || null)}
            >
              Use {it.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
