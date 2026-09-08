import React from "react";
import { useGame } from "../../context/GameContext";

export function FlashNotice() {
  const { ui } = useGame();
  if (!ui.flash) return null;
  const tone = ui.flash.tone === "good" ? "good" : ui.flash.tone === "bad" ? "bad" : "";

  return (
    <div className={`notice ${tone}`} style={{ marginBottom: 14 }}>
      {ui.flash.msg}
    </div>
  );
}

export function OfflineBanner() {
  const { storeReady } = useGame();
  if (storeReady) return null;

  return (
    <div className="notice" style={{ marginBottom: 14 }}>
      <strong>Practice mode.</strong> No shared room is reachable from here, so the game is running in this browser alone. Extra tabs on this same device still play together.
    </div>
  );
}
