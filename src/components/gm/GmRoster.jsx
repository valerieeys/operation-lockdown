import React from "react";
import { useGame } from "../../context/GameContext";
import {
  agents, ranked, pItems, spyAnswer, secsLeft, pBonus, mmss, vaultOpen
} from "../../utils/derivations";
import { ITEM_BY_ID, PUZZLES, SUSPECTS } from "../../config/gameData";

export function GmRoster() {
  const { players, log, game, gmAdjust } = useGame();
  const allAgents = agents(players);
  const rankedAgents = ranked(players, log);

  return (
    <div className="panel stack g10">
      <div className="row spread">
        <span className="label">Agents</span>
        <span className="chip">{allAgents.length} checked in</span>
      </div>

      {allAgents.length > 0 ? (
        <div className="scroll-x">
          <table className="data agents">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Score</th>
                <th>Funds</th>
                <th>Puzzles</th>
                <th>Kit</th>
                <th>Clock</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {rankedAgents.map(r => {
                const id = r.agent.id;
                const items = pItems(log, id);
                const sp = spyAnswer(log, id);
                const sec = secsLeft(log, game, id);
                const isVaultOpen = vaultOpen(log, id);

                return (
                  <tr key={id}>
                    <td>
                      <span className="row" style={{ gap: 8 }}>
                        <span className="pdot" style={{ background: r.agent.color }}></span>
                        <strong>{r.agent.name}</strong>
                        {isVaultOpen && <span className="chip on">vault</span>}
                      </span>
                      {sp && (
                        <div className="tiny" style={{ color: sp.ok ? "var(--signal)" : "var(--alarm)" }}>
                          accused {SUSPECTS.find(x => x.id === sp.suspect)?.name.replace("Agent ", "")}
                          {sp.ok ? ", correct" : ", wrong"}
                        </div>
                      )}
                    </td>
                    <td className="num" style={{ color: "var(--amber)", fontWeight: 600 }}>
                      {r.score}
                    </td>
                    <td className="num">${r.money}</td>
                    <td className="num">
                      {r.solved} / {PUZZLES.length}
                    </td>
                    <td>
                      {items.length ? (
                        items.map(i => (
                          <span key={i.inst} className="chip amber" style={{ marginRight: 4 }}>
                            {ITEM_BY_ID[i.item]?.name}
                          </span>
                        ))
                      ) : (
                        <span className="tiny">&mdash;</span>
                      )}
                    </td>
                    <td className="num">
                      {sec !== null ? (
                        <>
                          {mmss(sec)}
                          {pBonus(log, id) ? (
                            <span className="tiny" style={{ color: "var(--signal)" }}>
                              {" "}+{pBonus(log, id)}s
                            </span>
                          ) : null}
                        </>
                      ) : (
                        "&mdash;"
                      )}
                    </td>
                    <td>
                      <span className="row" style={{ gap: 5 }}>
                        <button className="btn sm" onClick={() => gmAdjust(id, 50)}>
                          +50
                        </button>
                        <button className="btn sm" onClick={() => gmAdjust(id, -50)}>
                          &minus;50
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <span className="tiny">Waiting for the first agent to type the room code.</span>
      )}
    </div>
  );
}
