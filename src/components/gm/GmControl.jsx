import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { PHASES } from "../../config/gameData";
import { mmss } from "../../utils/derivations";

export function GmControl() {
  const {
    game, storeReady, storeKind, gmSetPhase, gmAddTime, gmRestartTimer, gmStopTimer
  } = useGame();

  const [seconds, setSeconds] = useState(() =>
    game?.timerEndsAt ? Math.max(0, Math.round((game.timerEndsAt - Date.now()) / 1000)) : null
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(
        game?.timerEndsAt ? Math.max(0, Math.round((game.timerEndsAt - Date.now()) / 1000)) : null
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [game]);

  const low = seconds !== null && seconds <= 30;
  const storeLabel = storeKind === "supabase"
    ? "shared room · supabase"
    : storeKind === "db"
    ? "shared room · artifact database"
    : "this browser only";

  return (
    <div className="panel stack g14 sticky">
      <div className="stack g6">
        <span className="label">Room code</span>
        <div
          className="mono"
          style={{
            fontSize: "2.6rem",
            fontWeight: 600,
            letterSpacing: ".22em",
            color: "var(--amber)",
            lineHeight: 1
          }}
        >
          {game?.code}
        </div>
        <span className="tiny">
          Players open this page, tap “Join as an agent”, and type these four letters. Control PIN{" "}
          <span className="mono">{game?.gmPin}</span>.
        </span>
        <div className="row" style={{ gap: 6 }}>
          <span className={`chip ${storeReady ? "on" : "off"}`}>{storeLabel}</span>
        </div>
      </div>
      <hr className="rule" />
      <div className="stack g8">
        <span className="label">Stage</span>
        {PHASES.map(p => (
          <button
            key={p.id}
            className={`btn sm ${game?.phase === p.id ? "primary" : ""}`}
            onClick={() => gmSetPhase(p.id)}
            style={{ textAlign: "left" }}
          >
            {p.name}
            {p.mins ? (
              <span className="mono" style={{ opacity: 0.6 }}>
                {" "}· {p.mins} min
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <hr className="rule" />
      <div className="stack g8">
        <span className="label">Clock</span>
        <div
          className="mono js-timer"
          style={{
            fontSize: "2.2rem",
            fontWeight: 600,
            color: low ? "var(--alarm)" : undefined
          }}
        >
          {mmss(seconds)}
        </div>
        <div className="row wrapping">
          <button className="btn sm" onClick={() => gmAddTime(60)}>+60s</button>
          <button className="btn sm" onClick={() => gmAddTime(-60)}>&minus;60s</button>
          <button className="btn sm" onClick={gmRestartTimer}>Restart</button>
          <button className="btn sm ghost" onClick={gmStopTimer}>Off</button>
        </div>
      </div>
    </div>
  );
}
