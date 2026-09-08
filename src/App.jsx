import React from "react";
import { useGame } from "./context/GameContext";
import { LandingView } from "./components/landing/LandingView";
import { JoinView } from "./components/landing/JoinView";
import { GmEnterView } from "./components/landing/GmEnterView";
import { PlayerContainer } from "./components/player/PlayerContainer";
import { GmContainer } from "./components/gm/GmContainer";
import { OfflineBanner } from "./components/common/Notice";

function LoadingView() {
  const { session, leaveRoom } = useGame();

  return (
    <div className="wrap stack g14" style={{ paddingTop: 70 }}>
      <OfflineBanner />
      <span className="label blink">Establishing secure link…</span>
      <p className="lede">Room {session?.code || ""}</p>
      <button type="button" className="btn ghost" onClick={leaveRoom} style={{ alignSelf: "flex-start" }}>
        Cancel
      </button>
    </div>
  );
}

export default function App() {
  const { screen, game } = useGame();

  if (screen === "landing") return <LandingView />;
  if (screen === "join") return <JoinView />;
  if (screen === "gmenter") return <GmEnterView />;
  if (!game) return <LoadingView />;
  if (screen === "gm") return <GmContainer />;
  return <PlayerContainer />;
}
