import React from "react";
import { useGame } from "../../context/GameContext";
import { agents, pName } from "../../utils/derivations";

export function PlayerLobby() {
  const { session, players } = useGame();
  const all = agents(players);

  return (
    <div className="stack g14">
      <span className="label hot">Standing by</span>
      <h2>Agent {pName(players, session.playerId)}</h2>
      <p className="lede">You are inside. The Game Master starts the briefing once everybody has checked in.</p>
      <div className="panel stack g10">
        <span className="label">
          {all.length} agent{all.length === 1 ? "" : "s"} in the building
        </span>
        <div className="row wrapping">
          {all.map(p => (
            <span
              key={p.id}
              className={`chip ${p.id === session.playerId ? " amber" : ""}`}
            >
              {p.data.nickname}
              {p.id === session.playerId ? " · you" : ""}
            </span>
          ))}
        </div>
      </div>
      <div className="panel flat stack g8">
        <span className="label">Rules of engagement</span>
        <p className="tiny" style={{ fontSize: ".87rem", color: "var(--muted)" }}>
          Everybody works alone. You may talk to the person next to you, but you may not show them your screen, and every answer you send counts against your own score.
        </p>
      </div>
      <span className="label blink">Waiting for the Game Master…</span>
    </div>
  );
}
