import React from "react";
import { useGame } from "../../context/GameContext";
import {
  agents, reasoningEntry, spyAnswer, pName, pColor
} from "../../utils/derivations";
import { SUSPECTS } from "../../config/gameData";

export function GmReasoning() {
  const { players, log, gmApproveReasoning, gmDeclineReasoning } = useGame();
  const allAgents = agents(players);

  const pending = allAgents
    .map(p => reasoningEntry(log, p.id))
    .filter(Boolean)
    .filter(e => !e.data.reviewed);

  const done = allAgents
    .map(p => reasoningEntry(log, p.id))
    .filter(Boolean)
    .filter(e => e.data.reviewed);

  return (
    <div className="panel stack g12">
      <div className="row spread">
        <span className="label">Spy Mission responses</span>
        {pending.length ? (
          <span className="chip amber blink">{pending.length} to mark</span>
        ) : (
          <span className="chip on">all marked</span>
        )}
      </div>

      {!pending.length && !done.length && (
        <span className="tiny">Answers and English explanations will appear here as agents submit them.</span>
      )}

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
            {sp?.ok ? (
              <div className="row wrapping">
                <button
                  className="btn sm primary"
                  onClick={() => gmApproveReasoning(e.data.pid)}
                >
                  Clear and correct &middot; +200
                </button>
                <button className="btn sm ghost" onClick={() => gmDeclineReasoning(e.data.pid)}>
                  No bonus
                </button>
              </div>
            ) : sp ? (
              <button className="btn sm ghost" onClick={() => gmDeclineReasoning(e.data.pid)} style={{ alignSelf: "flex-start" }}>
                Mark reviewed, no bonus
              </button>
            ) : (
              <span className="tiny" style={{ color: "var(--alarm)" }}>
                Waiting for the accusation to sync.
              </span>
            )}
          </div>
        );
      })}

      {done.length > 0 && (
        <div className="row wrapping" style={{ gap: 6, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
          {done.map(e => (
            <span key={e.id} className={`chip ${e.data.approved ? "on" : "off"}`}>
              {pName(players, e.data.pid)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
