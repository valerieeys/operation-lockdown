import React from "react";
import { useGame } from "../../context/GameContext";
import { ClassBar } from "../common/ClassBar";
import { OfflineBanner, FlashNotice } from "../common/Notice";
import { PHASES } from "../../config/gameData";

export function LandingView() {
  const { setScreen } = useGame();

  return (
    <>
      <ClassBar text="Classified // Operation Lockdown // Eyes Only" />
      <div className="wrap stack g24" style={{ paddingTop: 44 }}>
        <OfflineBanner />
        <FlashNotice />
        <div className="stack g14">
          <span className="label hot">English Class Field Operation</span>
          <h1>Operation<br />Lockdown</h1>
          <p className="lede">
            Six English puzzles hide six vault digits. One of four agents stole the Nightingale File, and their codename hides the vault letter. Bid for advantages, solve the file, open the vault before the clock runs out.
          </p>
        </div>
        <div className="stack g10">
          <button className="btn primary block" onClick={() => setScreen("join")}>
            Join as an agent
          </button>
          <button className="btn block" onClick={() => setScreen("gmenter")}>
            I am the Game Master
          </button>
        </div>
        <hr className="rule" />
        <div className="stack g10">
          <span className="label">How a session runs</span>
          <div className="scroll-x">
            <table className="data">
              <tbody>
                {PHASES.filter(p => p.mins > 0).map(p => (
                  <tr key={p.id}>
                    <td style={{ width: "9ch" }}>
                      <span className="mono" style={{ color: "var(--amber)" }}>
                        {p.mins} min
                      </span>
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tiny">
            Around 20 minutes for two or three teams. Every player needs a phone; the Game Master needs one laptop.
          </p>
        </div>
      </div>
    </>
  );
}
