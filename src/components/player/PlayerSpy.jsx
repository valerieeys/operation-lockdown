import React from "react";
import { useGame } from "../../context/GameContext";
import {
  CASE_TEXT, CLUES, SUSPECTS, VAULT_LETTER
} from "../../config/gameData";
import {
  spyAnswer, visibleClues, reasoningEntry
} from "../../utils/derivations";
import { ItemTray } from "../common/ItemTray";

export function PlayerSpy() {
  const { session, game, log, ui, setUi, submitSpy } = useGame();
  const me = session.playerId;
  const ans = spyAnswer(log, me);
  const clues = visibleClues(log, game, me);
  const rEntry = reasoningEntry(log, me);
  const hidden = CLUES.length - clues.length;

  const currentSuspect = ans ? ans.suspect : ui.suspect;

  return (
    <div className="stack g14">
      <span className="label hot">Case file 04 / Nightingale</span>
      <h2>Name the thief</h2>
      <p className="lede">{CASE_TEXT}</p>

      <div className="panel stack g10">
        <span className="label">Evidence</span>
        {clues.map((c, i) => (
          <div key={c.id} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
            <span className="mono tiny" style={{ color: "var(--amber)", paddingTop: 2 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span dangerouslySetInnerHTML={{ __html: c.text }} />
          </div>
        ))}
        {hidden > 0 && (
          <>
            <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
              <span className="mono tiny" style={{ color: "var(--faint)", paddingTop: 2 }}>
                {String(clues.length + 1).padStart(2, "0")}
              </span>
              <span className="redact">
                <i></i>
                <i></i>
              </span>
            </div>
            <span className="tiny">
              {hidden} clue{hidden > 1 ? "s are" : " is"} still classified. Intel unlocks one.
            </span>
          </>
        )}
      </div>

      <div className="stack g8">
        <span className="label">Your accusation</span>
        <div className="suspects">
          {SUSPECTS.map(s => (
            <button
              key={s.id}
              className={`suspect ${currentSuspect === s.id ? "sel" : ""}`}
              disabled={!!ans}
              onClick={() => setUi(prev => ({ ...prev, suspect: s.id }))}
            >
              <div className="cn">{s.name.replace("Agent ", "")}</div>
              <div className="rl">{s.role}</div>
            </button>
          ))}
        </div>
      </div>

      {ans ? (
        <div className="stack g10">
          <div className="center" style={{ padding: "10px 0" }}>
            <span className={`stamp ${ans.ok ? "good" : "bad"}`}>
              {ans.ok ? `Correct · vault letter ${VAULT_LETTER}` : "Wrong suspect"}
            </span>
          </div>
          <div className="panel flat stack g6">
            <span className="label">Your reasoning</span>
            <p>{rEntry?.data?.text || ""}</p>
            {rEntry?.data?.approved ? (
              <span className="chip on">Accepted · +200</span>
            ) : (
              <span className="chip amber blink">Awaiting Game Master review</span>
            )}
          </div>
        </div>
      ) : (
        <div className="stack g8">
          <label className="label" htmlFor="reason">Explain in English</label>
          <textarea
            id="reason"
            placeholder="We think Agent … is the thief because …"
            value={ui.reasoning || ""}
            onChange={e => setUi(prev => ({ ...prev, reasoning: e.target.value }))}
          />
          <p className="tiny">
            One or two full sentences. Your Game Master awards +200 for clear English reasoning, in your own words.
          </p>
          <button className="btn primary block" onClick={submitSpy}>
            Submit the accusation
          </button>
        </div>
      )}

      <ItemTray />
    </div>
  );
}
