import React from "react";
import { useGame } from "../../context/GameContext";
import { ClassBar } from "../common/ClassBar";
import { OfflineBanner, FlashNotice } from "../common/Notice";
import { PHASE_BY_ID, BRIEFING } from "../../config/gameData";
import { GmControl } from "./GmControl";
import { GmAuction } from "./GmAuction";
import { GmRoster } from "./GmRoster";
import { GmReasoning } from "./GmReasoning";
import { GmClues } from "./GmClues";
import { GmFeed, GmBoard } from "./GmFeed";

export function GmContainer() {
  const { game, leaveRoom, gmResetRoom, gmCloseRoom } = useGame();

  const briefPanel = (game?.phase === "briefing" || game?.phase === "lobby") ? (
    <div className="panel stack g8">
      <span className="label">Read this aloud</span>
      {BRIEFING.map((l, i) => (
        <p key={i} style={{ fontSize: ".9rem" }}>{l}</p>
      ))}
    </div>
  ) : null;

  return (
    <>
      <ClassBar text={`Control Room // Room ${game?.code} // ${PHASE_BY_ID[game?.phase]?.name}`} />
      <div className="wrap wide stack g14" style={{ paddingTop: 16 }}>
        <OfflineBanner />
        <FlashNotice />
        <div className="gmgrid">
          <div className="stack g14">
            <GmControl />
          </div>
          <div className="stack g14">
            {briefPanel}
            <GmAuction />
            <GmReasoning />
            <GmRoster />
          </div>
          <div className="stack g14">
            <GmBoard />
            <GmFeed />
            <GmClues />
            <div className="panel stack g8">
              <span className="label">Room</span>
              <button
                className="btn sm danger block"
                onClick={() => {
                  if (confirm("Clear every score, item and bid in this room? Everybody stays checked in.")) {
                    gmResetRoom();
                  }
                }}
              >
                Clear scores, keep agents
              </button>
              <button
                className="btn sm danger block"
                onClick={() => {
                  if (confirm("Delete this room completely? Everyone is disconnected.")) {
                    gmCloseRoom();
                  }
                }}
              >
                Close and delete this room
              </button>
              <button className="btn sm ghost block" onClick={leaveRoom}>
                Leave the control room
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
