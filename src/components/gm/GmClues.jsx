import React from "react";
import { useGame } from "../../context/GameContext";
import {
  EXTRA_CLUES, SUSPECTS, CULPRIT, VAULT_PASSWORD, PUZZLES
} from "../../config/gameData";
import { speak } from "../../utils/derivations";

export function GmClues() {
  const { game, gmRevealClue } = useGame();
  const revealed = game?.revealed || [];
  const audioPuzzle = PUZZLES.find(p => p.audio);
  const thief = SUSPECTS.find(s => s.id === CULPRIT);

  return (
    <div className="panel stack g10">
      <span className="label">Spy Mission clues</span>
      {EXTRA_CLUES.map(c => {
        const isRevealed = revealed.indexOf(c.id) >= 0;
        return (
          <div key={c.id} className="stack g6" style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: ".85rem" }} dangerouslySetInnerHTML={{ __html: c.text }} />
            {isRevealed ? (
              <span className="chip on">revealed to everyone</span>
            ) : (
              <button
                className="btn sm"
                onClick={() => gmRevealClue(c.id)}
                style={{ alignSelf: "flex-start" }}
              >
                Reveal to everyone
              </button>
            )}
          </div>
        );
      })}

      <hr className="rule" />
      <span className="label">Answer key</span>
      <dl className="kv">
        <dt>Thief</dt>
        <dd>{thief?.name} (Archives)</dd>
        <dt>Vault</dt>
        <dd className="mono" style={{ color: "var(--amber)", letterSpacing: ".15em" }}>
          {VAULT_PASSWORD}
        </dd>
        {PUZZLES.map((p, i) => (
          <React.Fragment key={p.id}>
            <dt>P{i + 1}</dt>
            <dd>
              {p.type === "mcq" ? `${"ABCD"[p.answer]}. ${p.options[p.answer]}` : p.accept[0]}{" "}
              <span className="mono" style={{ color: "var(--amber)" }}>&rarr; {p.digit}</span>
            </dd>
          </React.Fragment>
        ))}
      </dl>

      <hr className="rule" />
      <span className="label">Listening script</span>
      <p style={{ fontSize: ".85rem" }}>{audioPuzzle?.transcript}</p>
      <button
        className="btn sm ghost"
        onClick={() => audioPuzzle && speak(audioPuzzle.transcript)}
        style={{ alignSelf: "flex-start" }}
      >
        &#9654;&nbsp; Play it
      </button>
      <span className="tiny">If a phone cannot play the audio, read this aloud twice.</span>
    </div>
  );
}
