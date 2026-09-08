import React from "react";
import { useGame } from "../../context/GameContext";
import { ClassBar } from "../common/ClassBar";
import { OfflineBanner, FlashNotice } from "../common/Notice";

export function GmEnterView() {
  const { setScreen, ui, setUi, createRoom, gmRejoin } = useGame();

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
    setUi(prev => ({ ...prev, joinCode: val }));
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setUi(prev => ({ ...prev, gmPinInput: val }));
  };

  return (
    <>
      <ClassBar text="Control Room" />
      <div className="wrap stack g18" style={{ paddingTop: 30 }}>
        <OfflineBanner />
        <FlashNotice />
        <button
          className="btn ghost sm"
          onClick={() => setScreen("landing")}
          style={{ alignSelf: "flex-start" }}
        >
          &larr; Back
        </button>
        <h2>Game Master</h2>
        <p className="lede">Open a new room, or take back control of a room you started on this device.</p>
        <button className="btn primary block" onClick={createRoom}>
          Create a new room
        </button>
        <hr className="rule" />
        <div className="stack g8">
          <label className="label" htmlFor="gc">Rejoin a room</label>
          <input
            id="gc"
            className="code-in"
            maxLength={4}
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="XXXX"
            value={ui.joinCode || ""}
            onChange={handleCodeChange}
          />
          <input
            id="gp"
            className="mono"
            inputMode="numeric"
            maxLength={4}
            placeholder="Control PIN"
            value={ui.gmPinInput || ""}
            onChange={handlePinChange}
          />
          <button className="btn block" onClick={gmRejoin}>
            Take control
          </button>
        </div>
      </div>
    </>
  );
}
