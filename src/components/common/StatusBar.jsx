import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { pInfo, pMoney, pScore, secsLeft, mmss } from "../../utils/derivations";

export function StatusBar() {
  const { session, game, players, log } = useGame();
  const [seconds, setSeconds] = useState(() => secsLeft(log, game, session.playerId));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(secsLeft(log, game, session.playerId));
    }, 1000);
    return () => clearInterval(interval);
  }, [log, game, session.playerId]);

  const t = pInfo(players, session.playerId);
  const low = seconds !== null && seconds <= 30;

  return (
    <div id="status">
      <div className="inner">
        <span className="pdot" style={{ background: t.color }}></span>
        <div className="stat grow">
          <span className="label">Agent</span>
          <b style={{ fontFamily: "var(--display)", letterSpacing: ".04em" }}>{t.name}</b>
        </div>
        <div className="stat">
          <span className="label">Funds</span>
          <b>${pMoney(log, session.playerId)}</b>
        </div>
        <div className="stat">
          <span className="label">Score</span>
          <b>{pScore(log, session.playerId)}</b>
        </div>
        <div className="stat">
          <span className="label">Clock</span>
          <b className={`js-timer ${low ? "timer-low" : ""}`}>{mmss(seconds)}</b>
        </div>
      </div>
    </div>
  );
}
