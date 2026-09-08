import React from "react";
import { useGame } from "../../context/GameContext";
import { PUZZLES, SCORE } from "../../config/gameData";
import {
  solved, knownDigits, timeUp, hintUsed, strongShown, speak
} from "../../utils/derivations";
import { ItemTray } from "../common/ItemTray";

export function PlayerEscape() {
  const {
    session, game, log, ui, setUi, answerPuzzle, takeHint
  } = useGame();

  const me = session.playerId;
  const idx = Math.min(ui.puzzleIdx || 0, PUZZLES.length - 1);
  const p = PUZZLES[idx];
  const isDone = solved(log, me, p.id);
  const digits = knownDigits(log, me);
  const over = timeUp(log, game, me);
  const showStrong = strongShown(log, me, p.id);
  const showHint = hintUsed(log, me, p.id);

  const handleSelectTab = (i) => {
    setUi(prev => ({
      ...prev,
      puzzleIdx: i,
      picked: null,
      answerDraft: "",
      audioNote: ""
    }));
  };

  const handlePlayAudio = () => {
    const audioPuzzle = PUZZLES.find(item => item.audio);
    if (!audioPuzzle) return;
    const ok = speak(audioPuzzle.transcript);
    setUi(prev => ({
      ...prev,
      audioNote: ok
        ? "Playing. Tap again to repeat."
        : "This device cannot play it — ask your Game Master to read the statement aloud."
    }));
  };

  let answerBlock;
  if (isDone) {
    answerBlock = (
      <div className="center" style={{ padding: "16px 0" }}>
        <span className="stamp good">
          {isDone.data.skipped ? "Bypassed" : "Solved"} · digit {p.digit}
        </span>
      </div>
    );
  } else if (over) {
    answerBlock = (
      <div className="notice bad">Your clock has run out. Ask the Game Master for more time.</div>
    );
  } else if (p.type === "mcq") {
    answerBlock = (
      <>
        <div className="optlist">
          {p.options.map((o, i) => (
            <button
              key={i}
              className={`opt ${ui.picked === i ? "sel" : ""}`}
              onClick={() => setUi(prev => ({ ...prev, picked: i }))}
            >
              <span className="key">{"ABCD"[i]}</span>
              <span>{o}</span>
            </button>
          ))}
        </div>
        <button
          className="btn primary block"
          disabled={ui.picked === null}
          onClick={() => answerPuzzle(p, ui.picked)}
        >
          Submit answer
        </button>
      </>
    );
  } else {
    answerBlock = (
      <>
        <input
          id="ans"
          autoComplete="off"
          placeholder={p.placeholder || "Your answer"}
          value={ui.answerDraft || ""}
          onChange={e => setUi(prev => ({ ...prev, answerDraft: e.target.value }))}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              answerPuzzle(p, ui.answerDraft);
              setUi(prev => ({ ...prev, answerDraft: "" }));
            }
          }}
        />
        <button
          className="btn primary block"
          onClick={() => {
            answerPuzzle(p, ui.answerDraft);
            setUi(prev => ({ ...prev, answerDraft: "" }));
          }}
        >
          Submit answer
        </button>
      </>
    );
  }

  return (
    <div className="stack g14">
      <div className="stack g8">
        <span className="label hot">Vault digits recovered</span>
        <div className="row g6" style={{ gap: 6, flexWrap: "wrap" }}>
          {digits.map((d, i) => (
            <div key={i} className={`slot ${d ? "filled" : ""}`}>
              {d || "?"}
            </div>
          ))}
        </div>
      </div>
      <div className="tabs">
        {PUZZLES.map((q, i) => (
          <button
            key={q.id}
            className={`tab ${i === idx ? "cur" : ""} ${solved(log, me, q.id) ? "done" : ""}`}
            onClick={() => handleSelectTab(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="panel stack g12">
        <div className="row spread">
          <span className="label">Puzzle {idx + 1} · {p.kind}</span>
          {isDone ? (
            <span className="chip on">cleared</span>
          ) : (
            <span className="chip">{SCORE.correct} pts</span>
          )}
        </div>
        <div dangerouslySetInnerHTML={{ __html: p.prompt }} />
        {p.audio && (
          <>
            <button className="btn sm" onClick={handlePlayAudio} style={{ alignSelf: "flex-start" }}>
              &#9654;&nbsp; Play statement
            </button>
            <span className="tiny">{ui.audioNote}</span>
          </>
        )}
        {answerBlock}
        {showStrong ? (
          <div className="notice good">
            <strong>Hint:</strong> {p.strong}
          </div>
        ) : showHint ? (
          <div className="notice">
            <strong>Hint:</strong> {p.hint}
          </div>
        ) : !isDone && !over ? (
          <button
            className="btn ghost sm"
            onClick={() => takeHint(p)}
            style={{ alignSelf: "flex-start" }}
          >
            Take a hint (&minus;50)
          </button>
        ) : null}
      </div>
      <ItemTray currentRef={p.id} />
      <p className="tiny">
        Take the puzzles in any order. A wrong answer costs 50 points, so read it twice before you send it.
      </p>
    </div>
  );
}
