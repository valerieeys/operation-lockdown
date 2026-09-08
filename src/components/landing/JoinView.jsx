import React from "react";
import { useGame } from "../../context/GameContext";
import { ClassBar } from "../common/ClassBar";
import { OfflineBanner, FlashNotice } from "../common/Notice";

export function JoinView() {
  const { setScreen, ui, setUi, joinRoom } = useGame();

  const code = ui.joinCode || "";
  const nick = ui.joinNick || "";
  const ready = code.length === 4 && nick.trim().length >= 2;

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
    setUi(prev => ({ ...prev, joinCode: val }));
  };

  const handleNickChange = (e) => {
    setUi(prev => ({ ...prev, joinNick: e.target.value }));
  };

  return (
    <>
      <ClassBar text="Agent Check-In" />
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
        <h2>Report for duty</h2>
        <div className="stack g8">
          <label className="label" htmlFor="jc">Room code</label>
          <input
            id="jc"
            className="code-in"
            maxLength={4}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="XXXX"
            value={code}
            onChange={handleCodeChange}
          />
        </div>
        <div className="stack g8">
          <label className="label" htmlFor="jn">Your codename</label>
          <input
            id="jn"
            maxLength={18}
            autoComplete="off"
            placeholder="e.g. Rani"
            value={nick}
            onChange={handleNickChange}
          />
        </div>
        <p className="tiny">You play on your own. Your funds, your clock and your score belong to you alone.</p>
        <button
          className="btn primary block"
          disabled={!ready}
          onClick={() => joinRoom(code, nick.trim())}
        >
          Enter the building
        </button>
      </div>
    </>
  );
}
