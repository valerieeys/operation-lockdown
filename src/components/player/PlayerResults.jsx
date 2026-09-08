import React from "react";
import { useGame } from "../../context/GameContext";
import {
  ranked, plog, VAULT_PASSWORD, SUSPECTS, CULPRIT
} from "../../utils/derivations";

export function PlayerResults() {
  const { session, players, log } = useGame();
  const rows = ranked(players, log);
  const pEvents = plog(log, session.playerId).sort((a, b) => b.data.ts - a.data.ts);
  const thief = SUSPECTS.find(s => s.id === CULPRIT);

  return (
    <div className="stack g18">
      <span className="label hot">Debrief</span>
      <h2>Final standings</h2>

      <div className="board">
        {rows.map((r, i) => (
          <div key={r.agent.id} className={`brow ${i === 0 ? "first" : ""}`}>
            <span className="rank">{i + 1}</span>
            <span className="pdot" style={{ background: r.agent.color }}></span>
            <span className="nm grow">
              {r.agent.name}
              {r.agent.id === session.playerId ? (
                <span className="tiny"> (you)</span>
              ) : null}
            </span>
            <span className="sc">{r.score}</span>
          </div>
        ))}
      </div>

      <div className="panel flat stack g8">
        <span className="label">Vault password</span>
        <div className="row" style={{ gap: 6 }}>
          {VAULT_PASSWORD.split("").map((c, i) => (
            <div key={i} className="slot filled">
              {c}
            </div>
          ))}
        </div>
        <p className="tiny">
          The thief was {thief?.name}, Archives. The grey coat and the Archives card were the two clues that mattered.
        </p>
      </div>

      <div className="panel flat stack g6">
        <span className="label">Your record</span>
        <div className="feed">
          {pEvents.map(e => {
            const pts = Number(e.data.points) || 0;
            const cls = pts > 0 ? "plus" : pts < 0 ? "minus" : "zero";
            const money = Number(e.data.money) || 0;
            return (
              <div key={e.id} className="ev">
                <span className={`pts ${cls}`}>
                  {pts > 0 ? "+" : ""}
                  {pts}
                </span>
                <span className="grow">
                  {e.data.label || e.data.kind}
                  {money ? (
                    <span className="mono tiny"> (${money})</span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
