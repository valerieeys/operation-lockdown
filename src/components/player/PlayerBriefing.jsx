import React from "react";
import { BRIEFING, PUZZLES } from "../../config/gameData";

export function PlayerBriefing() {
  return (
    <div className="stack g14">
      <span className="label hot">Mission briefing</span>
      <h2>The Nightingale File</h2>
      {BRIEFING.map((l, i) => (
        <p key={i} className="lede">{l}</p>
      ))}
      <div className="panel stack g10">
        <span className="label">Vault combination</span>
        <div className="row g6" style={{ gap: 6 }}>
          <div className="slot">?</div>
          {PUZZLES.map((_, i) => (
            <div key={i} className="slot">?</div>
          ))}
        </div>
        <p className="tiny">
          One letter from the Spy Mission, six digits from the Escape Room. Nothing is unlocked yet.
        </p>
      </div>
      <div className="panel flat stack g8">
        <span className="label">Scoring</span>
        <div className="scroll-x">
          <table className="data">
            <tbody>
              <tr>
                <td>Puzzle solved with no hint</td>
                <td className="mono" style={{ color: "var(--signal)" }}>+150</td>
              </tr>
              <tr>
                <td>Puzzle solved after a hint</td>
                <td className="mono" style={{ color: "var(--signal)" }}>+100</td>
              </tr>
              <tr>
                <td>Thief correctly identified</td>
                <td className="mono" style={{ color: "var(--signal)" }}>+300</td>
              </tr>
              <tr>
                <td>English reasoning accepted</td>
                <td className="mono" style={{ color: "var(--signal)" }}>+200</td>
              </tr>
              <tr>
                <td>Final Vault opened</td>
                <td className="mono" style={{ color: "var(--signal)" }}>+500</td>
              </tr>
              <tr>
                <td>Wrong answer</td>
                <td className="mono" style={{ color: "var(--alarm)" }}>&minus;50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <span className="label blink">Waiting for the auction to open…</span>
    </div>
  );
}
