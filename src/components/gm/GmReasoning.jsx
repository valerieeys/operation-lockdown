import React from "react";
import { useGame } from "../../context/GameContext";
import {
  agents, reasoningEntry, spyAnswer, pName, pColor
} from "../../utils/derivations";
import { SUSPECTS } from "../../config/gameData";

export function GmReasoning() {
  const { players, log, gmApproveReasoning } = useGame();
  const allAgents = agents(players);

  const pending = allAgents
    .map(p => reasoningEntry(log, p.id))
    .filter(Boolean)
    .filter(e => !e.data.approved);

  const done = allAgents
    .map(p => reasoningEntry(log, p.id))
    .filter(Boolean)
    .filter(e => e.data.approved);

  if (!pending.length && !done.length) return null;

  return (
    <div className="panel stack g12">
      <div className="row spread">
        <span className="label">English reasoning</span>
        {pending.length ? (
          <span className="chip amber blink">{pending.length} to mark</span>
        ) : (
          <span className="chip on">all marked</span>
        )}
      </div>

      {pending.map(e => {
        const sp = spyAnswer(log, e.data.pid);
        return (
          <div key={e.id} className="stack g8" style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
            <div className="row">
              <span className="pdot" style={{ background: pColor(e.data.pid) }}></span>
              <strong>{pName(players, e.data.pid)}</strong>
              {sp && (
                <span className={`chip ${sp.ok ? "on" : "off"}`}>
                  {SUSPECTS.find(x => x.id === sp.suspect)?.name.replace("Agent ", "")}
                </span>
              )}
            </div>
            <p style={{ fontSize: ".9rem" }}>{e.data.text}</p>
            <button
              className="btn sm primary"
              onClick={() => gmApproveReasoning(e.data.pid)}
              style={{ alignSelf: "flex-start" }}
            >
              Accept the English &middot; +200
            </button>
          </div>
        );
      })}

      {done.length > 0 && (
        <div className="row wrapping" style={{ gap: 6, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
          {done.map(e => (
            <span key={e.id} className="chip on">
              {pName(players, e.data.pid)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
