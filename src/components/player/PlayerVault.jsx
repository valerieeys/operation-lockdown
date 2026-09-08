import React from "react";
import { useGame } from "../../context/GameContext";
import { VAULT_LETTER, VAULT_PASSWORD } from "../../config/gameData";
import {
  vaultOpen, spyAnswer, knownDigits
} from "../../utils/derivations";
import { ItemTray } from "../common/ItemTray";

export function PlayerVault() {
  const { session, log, ui, setUi, submitVault } = useGame();
  const me = session.playerId;
  const isOpen = vaultOpen(log, me);
  const spyData = spyAnswer(log, me);
  const letter = spyData && spyData.ok ? VAULT_LETTER : null;
  const digits = knownDigits(log, me);
  const known = [letter, ...digits];
  const vaultValue = (ui.vaultDraft || "").trim();

  const handleSubmit = async () => {
    if (!vaultValue) return;
    await submitVault(vaultValue);
    setUi(prev => ({ ...prev, vaultDraft: "" }));
  };

  if (isOpen) {
    return (
      <div className="stack g18 center" style={{ paddingTop: 20 }}>
        <span className="stamp good" style={{ fontSize: "1.6rem" }}>
          Vault open
        </span>
        <h2>The doors are unlocked</h2>
        <p className="lede">
          You recovered the Nightingale File and cleared the building. +500 points.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: 6 }}>
          {VAULT_PASSWORD.split("").map((c, i) => (
            <div key={i} className="slot filled">
              {c}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack g14">
      <span className="label hot">Final vault</span>
      <h2>Seven characters</h2>
      <p className="lede">
        One letter from the thief's codename, then the six digits in puzzle order. Missing pieces are still classified.
      </p>

      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
        {known.map((c, i) => (
          <div key={i} className={`slot ${c ? "filled" : ""}`}>
            {c || "?"}
          </div>
        ))}
      </div>

      <div className="stack g8">
        <label className="label" htmlFor="vault">Enter the password</label>
        <input
          id="vault"
          className="code-in"
          maxLength={10}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="•••••••"
          value={ui.vaultDraft || ""}
          onChange={e => setUi(prev => ({ ...prev, vaultDraft: e.target.value }))}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button
          type="button"
          className="btn primary block"
          onClick={handleSubmit}
          disabled={!vaultValue}
        >
          Open the vault
        </button>
        <p className="tiny">A wrong password costs 50 points.</p>
      </div>

      <ItemTray />
    </div>
  );
}
