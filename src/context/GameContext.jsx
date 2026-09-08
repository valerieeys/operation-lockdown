import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { LocalStore } from "../store/localStore";
import { SupabaseStore } from "../store/supabaseStore";
import {
  PUZZLES, ITEM_BY_ID, CULPRIT, VAULT_LETTER, VAULT_PASSWORD,
  SCORE, PHASE_BY_ID, SUSPECTS
} from "../config/gameData";
import {
  rid, roomCode, now, hasItem, solved, hintUsed, spyAnswer,
  reasoningEntry, vaultOpen, pMoney, pScore, currentBid, roundBids,
  applyPenaltyHelper
} from "../utils/derivations";

const SESS_KEY = "operation_lockdown_session";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESS_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function saveSession(sess) {
  try {
    localStorage.setItem(SESS_KEY, JSON.stringify(sess));
  } catch (e) {}
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [session, setSession] = useState(() => ({
    role: null, code: null, pid: null, playerId: null, nickname: null, gmPin: null,
    ...loadSession()
  }));

  const [screen, setScreen] = useState(() => (session.role && session.code ? "loading" : "landing"));
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [log, setLog] = useState([]);
  const [bids, setBids] = useState([]);
  const [storeKind, setStoreKind] = useState("local");
  const [storeReady, setStoreReady] = useState(false);

  const [ui, setUi] = useState({
    puzzleIdx: 0,
    picked: null,
    suspect: null,
    reasoning: "",
    joinCode: "",
    joinNick: "",
    gmPinInput: "",
    answerDraft: "",
    vaultDraft: "",
    audioNote: "",
    flash: null,
    busy: false,
    bidInput: ""
  });

  const storeRef = useRef(LocalStore());
  const unsubsRef = useRef([]);

  const updateSession = (patch) => {
    setSession(prev => {
      const next = { ...prev, ...patch };
      saveSession(next);
      return next;
    });
  };

  const flashNotice = (msg, tone = "") => {
    setUi(prev => ({ ...prev, flash: { msg, tone, at: now() } }));
    setTimeout(() => {
      setUi(prev => {
        if (prev.flash && now() - prev.flash.at >= 3400) {
          return { ...prev, flash: null };
        }
        return prev;
      });
    }, 3600);
  };

  const disconnect = () => {
    unsubsRef.current.forEach(u => {
      try { u(); } catch (e) {}
    });
    unsubsRef.current = [];
  };

  const connect = (code) => {
    disconnect();
    setGame(null);
    setPlayers([]);
    setLog([]);
    setBids([]);

    const st = storeRef.current;
    const gamePath = "games/" + code;
    const colPath = (c, sub) => "games/" + c + "/" + sub;

    unsubsRef.current.push(st.watchDoc(gamePath, g => setGame(g)));
    unsubsRef.current.push(st.watchCol(colPath(code, "players"), r => setPlayers(r)));
    unsubsRef.current.push(st.watchCol(colPath(code, "log"), r => setLog(r)));
    unsubsRef.current.push(st.watchCol(colPath(code, "bids"), r => setBids(r)));
  };

  // Initialize Store
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const sb = await SupabaseStore();
      if (sb && isMounted) {
        storeRef.current = sb;
        setStoreKind("supabase");
        setStoreReady(true);
      } else if (isMounted) {
        storeRef.current = LocalStore();
        setStoreKind("local");
        setStoreReady(false);
      }

      if (session.role && session.code) {
        const g = await storeRef.current.getDoc("games/" + session.code);
        if (g && isMounted) {
          setScreen(session.role === "gm" ? "gm" : "play");
          connect(session.code);
        } else if (isMounted) {
          updateSession({ role: null, code: null });
          setScreen("landing");
        }
      }
    })();

    return () => {
      isMounted = false;
      disconnect();
    };
  }, []);

  /* ---- Database Write Helpers ---- */
  const writeLog = async (id, data) => {
    if (!game) return;
    await storeRef.current.setDoc("games/" + game.code + "/log/" + id, { ts: now(), ...data });
  };

  const patchGame = async (patch) => {
    if (!game) return;
    await storeRef.current.updateDoc("games/" + game.code, patch);
  };

  const applyPenalty = async (pid, id, label, ref) => {
    const shield = hasItem(log, pid, "shield");
    if (shield) {
      await writeLog("item_used_" + shield.inst, {
        pid, kind: "item_used", inst: shield.inst, item: "shield", ref: ref || null, points: 0,
        label: "Shield absorbed: " + label
      });
      return "shielded";
    }
    await writeLog(id, { pid, kind: "penalty", ref: ref || null, points: SCORE.wrong, label });
    return "penalty";
  };

  /* ---- Room Operations ---- */
  const createRoom = async () => {
    let code = roomCode();
    for (let i = 0; i < 5; i++) {
      const ex = await storeRef.current.getDoc("games/" + code);
      if (!ex) break;
      code = roomCode();
    }
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    await storeRef.current.setDoc("games/" + code, {
      code, gmPin: pin, createdAt: now(), phase: "lobby",
      timerEndsAt: 0, revealed: [], auctionRound: 0,
      auction: { status: "idle", itemId: null, price: 0, round: 0, winnerPid: null, winningBid: 0 }
    });
    updateSession({ role: "gm", code, gmPin: pin });
    setScreen("gm");
    connect(code);
  };

  const joinRoom = async (code, nickname) => {
    const g = await storeRef.current.getDoc("games/" + code);
    if (!g) {
      const hint = storeKind === "local"
        ? "Room not found. Note: Supabase is not connected — rooms created on other devices are not visible. Check your environment variables."
        : "Room " + code + " was not found. Check the four letters with your Game Master.";
      flashNotice(hint, "bad");
      return;
    }
    const pid = session.playerId || ("pl_" + rid(7));
    updateSession({ role: "player", code, playerId: pid, nickname });
    await storeRef.current.setDoc("games/" + code + "/players/" + pid, { nickname, ts: now() });
    setScreen("play");
    connect(code);
  };

  const leaveRoom = () => {
    disconnect();
    updateSession({ role: null, code: null, playerId: null });
    setScreen("landing");
    setGame(null);
    setPlayers([]);
    setLog([]);
    setBids([]);
  };

  const gmRejoin = async () => {
    const code = (ui.joinCode || "").toUpperCase();
    const g = await storeRef.current.getDoc("games/" + code);
    if (!g) {
      flashNotice("Room " + code + " was not found.", "bad");
      return;
    }
    if (String(g.gmPin) !== String(ui.gmPinInput)) {
      flashNotice("That control PIN does not match room " + code + ".", "bad");
      return;
    }
    updateSession({ role: "gm", code, gmPin: g.gmPin });
    setScreen("gm");
    connect(code);
  };

  /* ---- Player Actions ---- */
  const answerPuzzle = async (p, value) => {
    const me = session.playerId;
    if (!me || solved(log, me, p.id)) return;

    let ok = false;
    if (p.type === "mcq") ok = (value === p.answer);
    else ok = p.accept.indexOf(String(value || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim()) >= 0;

    if (ok) {
      await writeLog("p_" + me + "_" + p.id, {
        pid: me, kind: "puzzle", ref: p.id, ok: true,
        answer: String(value || ""), points: SCORE.correct,
        label: p.kind + " answer: “" + String(value || "") + "” — digit " + p.digit + " recovered"
      });
      setUi(prev => ({ ...prev, picked: null, answerDraft: "" }));
      flashNotice("Correct. Vault digit " + p.digit + " recovered.", "good");
    } else {
      const n = log.filter(e => e.data.pid === me && e.data.kind === "penalty" && e.data.ref === p.id).length;
      const r = await applyPenalty(
        me,
        "w_" + me + "_" + p.id + "_" + n,
        "Wrong " + p.kind + " answer: “" + String(value || "") + "”",
        p.id
      );
      flashNotice(r === "shielded" ? "Wrong — but your Shield absorbed the penalty." : "Not correct. −50 points. Try again.", "bad");
    }
  };

  const takeHint = async (p) => {
    const me = session.playerId;
    if (!me || hintUsed(log, me, p.id) || solved(log, me, p.id)) return;
    await writeLog("h_" + me + "_" + p.id, { pid: me, kind: "hint", ref: p.id, points: SCORE.hint, label: "Hint used on " + p.kind });
  };

  const useItem = async (itemId, ref) => {
    const me = session.playerId;
    if (!me) return;
    const g = hasItem(log, me, itemId);
    if (!g) return;
    const base = { pid: me, kind: "item_used", inst: g.inst, item: itemId, ref: ref || null, points: 0 };

    if (itemId === "timeboost") {
      await writeLog("item_used_" + g.inst, { ...base, bonusSec: 60, label: "Time Boost — 60 seconds added" });
      flashNotice("Time Boost used. Your clock gained 60 seconds.", "good");
    } else if (itemId === "intel") {
      await writeLog("item_used_" + g.inst, { ...base, label: "Intel — one extra clue unlocked" });
      flashNotice("Intel used. One more clue is now visible to you.", "good");
    } else if (itemId === "hint") {
      await writeLog("item_used_" + g.inst, { ...base, label: "Hint item used on " + ref });
    } else if (itemId === "masterkey") {
      const p = PUZZLES.find(x => x.id === ref);
      if (!p || solved(log, me, ref)) return;
      await writeLog("item_used_" + g.inst, { ...base, label: "Master Key used on " + p.kind });
      await writeLog("p_" + me + "_" + p.id, {
        pid: me, kind: "puzzle", ref: p.id, ok: true, skipped: true, points: 0,
        label: p.kind + " skipped with Master Key — digit " + p.digit + " recovered, no points"
      });
      flashNotice("Master Key used. Digit " + p.digit + " recovered, no points awarded.", "");
    }
  };

  const placeBid = async (amount) => {
    const me = session.playerId;
    if (!me || !game) return;
    const a = game.auction || {};
    if (a.status !== "open") return;
    if (amount > pMoney(log, me)) {
      flashNotice("You only have $" + pMoney(log, me) + ".", "bad");
      return;
    }
    const rBids = bids.filter(b => b.data.round === a.round).sort((x, y) => y.data.amount - x.data.amount || x.data.ts - y.data.ts);
    const top = rBids[0];
    const curAmt = top ? top.data.amount : (a.price || 0);

    if (amount <= curAmt) {
      flashNotice("Bid higher than $" + curAmt + ".", "bad");
      return;
    }

    await storeRef.current.setDoc("games/" + game.code + "/bids/" + "b_" + a.round + "_" + rid(8), {
      pid: me, amount, round: a.round, ts: now()
    });
    setUi(prev => ({ ...prev, bidInput: "" }));
  };

  const submitSpy = async () => {
    const me = session.playerId;
    if (!me || spyAnswer(log, me)) return;
    if (!ui.suspect) {
      flashNotice("Choose a suspect first.", "bad");
      return;
    }
    const text = (ui.reasoning || "").trim();
    if (text.split(/\s+/).filter(Boolean).length < 8) {
      flashNotice("Write at least one full English sentence explaining your choice.", "bad");
      return;
    }
    const ok = ui.suspect === CULPRIT;
    const s = SUSPECTS.find(x => x.id === ui.suspect);
    await writeLog("s_" + me, {
      pid: me, kind: "spy", suspect: ui.suspect, ok,
      points: ok ? SCORE.spy : SCORE.wrong,
      label: ok ? "Spy Mission: " + s.name + " identified" : "Spy Mission: wrong suspect (" + s.name + ")"
    });
    await writeLog("r_" + me, {
      pid: me, kind: "reasoning", text, approved: false, points: 0,
      label: "Reasoning submitted, awaiting Game Master review"
    });
    flashNotice(ok ? "Correct. The vault letter is " + VAULT_LETTER + "." : "That is not the thief. −50 points.", ok ? "good" : "bad");
  };

  const submitVault = async (value) => {
    const me = session.playerId;
    if (!me || vaultOpen(log, me)) return;
    const v = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (v === VAULT_PASSWORD) {
      await writeLog("v_" + me, {
        pid: me, kind: "vault", ok: true, answer: v, points: SCORE.vault,
        label: "Final Vault password “" + v + "” accepted"
      });
      flashNotice("Vault open. The doors are unlocked.", "good");
      return true;
    } else {
      const n = log.filter(e => e.data.pid === me && e.data.kind === "penalty" && e.data.ref === "vault").length;
      const r = await applyPenalty(me, "wv_" + me + "_" + n, "Wrong vault password: “" + v + "”", "vault");
      flashNotice(r === "shielded" ? "Wrong password — Shield absorbed the penalty." : "Wrong password. −50 points.", "bad");
      return false;
    }
  };

  /* ---- Game Master Actions ---- */
  const gmSetPhase = async (id) => {
    const ph = PHASE_BY_ID[id];
    const patch = { phase: id, timerEndsAt: ph.mins ? now() + ph.mins * 60000 : 0 };
    await patchGame(patch);
  };

  const gmAddTime = async (sec) => {
    if (!game || !game.timerEndsAt) return;
    await patchGame({ timerEndsAt: game.timerEndsAt + sec * 1000 });
  };

  const gmStopTimer = async () => {
    await patchGame({ timerEndsAt: 0 });
  };

  const gmRestartTimer = async () => {
    const ph = PHASE_BY_ID[game.phase];
    await patchGame({ timerEndsAt: now() + (ph.mins || 5) * 60000 });
  };

  const gmOpenAuction = async (itemId) => {
    const round = (game.auctionRound || 0) + 1;
    const it = ITEM_BY_ID[itemId];
    await patchGame({
      phase: "auction",
      timerEndsAt: now() + PHASE_BY_ID.auction.mins * 60000,
      auctionRound: round,
      auction: { status: "open", itemId, price: it.start, round, winnerPid: null, winningBid: 0 }
    });
  };

  const gmCloseAuction = async () => {
    const a = game.auction || {};
    if (a.status !== "open") return;
    const rBids = bids.filter(b => b.data.round === a.round).sort((x, y) => y.data.amount - x.data.amount || x.data.ts - y.data.ts);
    const top = rBids[0];

    if (!top) {
      await patchGame({ auction: { ...a, status: "closed", winnerPid: null, winningBid: 0 } });
      return;
    }
    const inst = "a" + a.round;
    await writeLog("a_" + a.round, {
      pid: top.data.pid, kind: "item", inst, item: a.itemId,
      money: -top.data.amount, points: 0,
      label: ITEM_BY_ID[a.itemId].name + " won at $" + top.data.amount
    });
    await patchGame({ auction: { ...a, status: "closed", winnerPid: top.data.pid, winningBid: top.data.amount } });
    for (const b of bids.filter(x => x.data.round === a.round)) {
      await storeRef.current.deleteDoc("games/" + game.code + "/bids/" + b.id);
    }
  };

  const gmGrantItem = async (pid, itemId) => {
    const inst = "gm" + rid(6);
    await writeLog("gi_" + inst, {
      pid, kind: "item", inst, item: itemId, points: 0, money: 0,
      label: ITEM_BY_ID[itemId].name + " granted by Game Master"
    });
  };

  const gmRevealClue = async (clueId) => {
    const cur = (game.revealed || []).slice();
    if (cur.indexOf(clueId) < 0) cur.push(clueId);
    await patchGame({ revealed: cur });
  };

  const gmApproveReasoning = async (pid) => {
    const e = reasoningEntry(log, pid);
    if (!e || e.data.reviewed) return;
    await storeRef.current.setDoc("games/" + game.code + "/log/" + e.id, {
      ...e.data, reviewed: true, approved: true, points: SCORE.reasoning,
      label: "English reasoning accepted by Game Master"
    });
  };

  const gmDeclineReasoning = async (pid) => {
    const e = reasoningEntry(log, pid);
    if (!e || e.data.reviewed) return;
    await storeRef.current.setDoc("games/" + game.code + "/log/" + e.id, {
      ...e.data, reviewed: true, approved: false, points: 0,
      label: "English reasoning reviewed: no bonus awarded"
    });
  };

  const gmAdjust = async (pid, points) => {
    await writeLog("g_" + rid(8), {
      pid, kind: "adjust", points,
      label: (points >= 0 ? "Bonus" : "Deduction") + " from Game Master"
    });
  };

  const gmResetRoom = async () => {
    if (!game) return;
    const code = game.code;
    for (const c of ["log", "bids"]) {
      const rows = await storeRef.current.listCol("games/" + code + "/" + c);
      for (const r of rows) {
        await storeRef.current.deleteDoc("games/" + code + "/" + c + "/" + r.id);
      }
    }
    await patchGame({
      phase: "lobby", timerEndsAt: 0, revealed: [], auctionRound: 0,
      auction: { status: "idle", itemId: null, price: 0, round: 0, winnerPid: null, winningBid: 0 }
    });
    flashNotice("Scores and auction history cleared. Everybody stays joined.", "good");
  };

  const gmCloseRoom = async () => {
    if (!game) return;
    const code = game.code;
    for (const c of ["log", "bids", "players"]) {
      const rows = await storeRef.current.listCol("games/" + code + "/" + c);
      for (const r of rows) {
        await storeRef.current.deleteDoc("games/" + code + "/" + c + "/" + r.id);
      }
    }
    await storeRef.current.deleteDoc("games/" + code);
    leaveRoom();
  };

  const value = {
    session, screen, setScreen, game, players, log, bids, storeKind, storeReady, ui, setUi,
    flashNotice, createRoom, joinRoom, leaveRoom, gmRejoin,
    answerPuzzle, takeHint, useItem, placeBid, submitSpy, submitVault,
    gmSetPhase, gmAddTime, gmStopTimer, gmRestartTimer, gmOpenAuction, gmCloseAuction,
    gmGrantItem, gmRevealClue, gmApproveReasoning, gmDeclineReasoning, gmAdjust, gmResetRoom, gmCloseRoom
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
