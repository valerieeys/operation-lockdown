import React from "react";
import { useGame } from "../../context/GameContext";
import { ClassBar } from "../common/ClassBar";
import { StatusBar } from "../common/StatusBar";
import { OfflineBanner, FlashNotice } from "../common/Notice";
import { PHASE_BY_ID } from "../../config/gameData";
import { PlayerLobby } from "./PlayerLobby";
import { PlayerBriefing } from "./PlayerBriefing";
import { PlayerAuction } from "./PlayerAuction";
import { PlayerEscape } from "./PlayerEscape";
import { PlayerSpy } from "./PlayerSpy";
import { PlayerVault } from "./PlayerVault";
import { PlayerResults } from "./PlayerResults";

export function PlayerContainer() {
  const { game, leaveRoom } = useGame();
  const ph = game?.phase || "lobby";

  let body;
  if (ph === "lobby") body = <PlayerLobby />;
  else if (ph === "briefing") body = <PlayerBriefing />;
  else if (ph === "auction") body = <PlayerAuction />;
  else if (ph === "escape") body = <PlayerEscape />;
  else if (ph === "spy") body = <PlayerSpy />;
  else if (ph === "vault") body = <PlayerVault />;
  else body = <PlayerResults />;

  return (
    <>
      <ClassBar text={`${PHASE_BY_ID[ph]?.name || ph} // Room ${game?.code}`} />
      <StatusBar />
      <div className="wrap stack g18" style={{ paddingTop: 18 }}>
        <OfflineBanner />
        <FlashNotice />
        {body}
        <hr className="rule" />
        <button
          className="btn ghost sm"
          onClick={leaveRoom}
          style={{ alignSelf: "flex-start" }}
        >
          Leave room
        </button>
      </div>
    </>
  );
}
