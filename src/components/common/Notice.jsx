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
    <div className="notice bad" style={{ marginBottom: 14 }}>
      <strong>⚠ Offline mode — players on other devices cannot join.</strong>{" "}
      Supabase is not connected. Fill in <code>VITE_SUPABASE_URL</code> and{" "}
      <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file (or Vercel
      environment variables) and redeploy. Until then this room only works in this
      browser tab.
    </div>
  );
}
