import React from "react";
import { useGame } from "../../context/GameContext";
import { pInfo, ranked } from "../../utils/derivations";

export function GmFeed() {
  const { players, log } = useGame();
  const logs = log.slice().sort((x, y) => y.data.ts - x.data.ts).slice(0, 60);

  return (
    <div className="panel stack g10">
      <span className="label">Live feed</span>
      <div className="feed">
        {logs.length > 0 ? (
          logs.map(e => {
            const pts = Number(e.data.points) || 0;
            const cls = pts > 0 ? "plus" : pts < 0 ? "minus" : "zero";
            const money = Number(e.data.money) || 0;
            const t = pInfo(players, e.data.pid);
            return (
              <div key={e.id} className="ev">
                <span className="pdot" style={{ background: t.color, marginTop: 6 }}></span>
                <span className={`pts ${cls}`}>
                  {pts > 0 ? "+" : ""}
                  {pts}
                </span>
                <span className="grow">
                  <strong>{t.name}: </strong>
                  {e.data.label || e.data.kind}
                  {money ? (
                    <span className="mono tiny"> (${money})</span>
                  ) : null}
                </span>
              </div>
            );
          })
        ) : (
          <span className="tiny">Nothing has happened yet.</span>
        )}
      </div>
    </div>
  );
}

export function GmBoard() {
  const { players, log } = useGame();
  const rows = ranked(players, log);

  return (
    <div className="panel stack g10">
      <span className="label">Standings</span>
      <div className="board">
        {rows.length > 0 ? (
          rows.map((r, i) => (
            <div key={r.agent.id} className={`brow ${i === 0 ? "first" : ""}`}>
              <span className="rank">{i + 1}</span>
              <span className="pdot" style={{ background: r.agent.color }}></span>
              <span className="nm grow">{r.agent.name}</span>
              <span className="sc">{r.score}</span>
            </div>
          ))
        ) : (
          <span className="tiny">Nobody has checked in yet.</span>
        )}
      </div>
    </div>
  );
}
