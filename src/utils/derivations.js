import {
  START_MONEY, AGENT_COLORS, PUZZLES, CLUES, EXTRA_CLUES, VAULT_PASSWORD, SUSPECTS, CULPRIT
} from "../config/gameData";

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

export function now() {
  return Date.now();
}

export function rid(n) {
  const a = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < (n || 6); i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function roomCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function normalize(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

export function plog(log, pid) {
  return log.filter(e => e.data.pid === pid);
}

export function pScore(log, pid) {
  return plog(log, pid).reduce((n, e) => n + (Number(e.data.points) || 0), 0);
}

export function pMoney(log, pid) {
  return START_MONEY + plog(log, pid).reduce((n, e) => n + (Number(e.data.money) || 0), 0);
}

export function pBonus(log, pid) {
  return plog(log, pid).reduce((n, e) => n + (Number(e.data.bonusSec) || 0), 0);
}

export function pItems(log, pid) {
  const granted = plog(log, pid)
    .filter(e => e.data.kind === "item")
    .map(e => ({ inst: e.data.inst, item: e.data.item }));
  const used = new Set(
    plog(log, pid).filter(e => e.data.kind === "item_used").map(e => e.data.inst)
  );
  return granted.filter(g => !used.has(g.inst));
}

export function hasItem(log, pid, itemId) {
  return pItems(log, pid).find(g => g.item === itemId) || null;
}

export function solved(log, pid, qid) {
  return plog(log, pid).find(e => e.data.kind === "puzzle" && e.data.ref === qid) || null;
}

export function hintUsed(log, pid, qid) {
  return !!plog(log, pid).find(e => e.data.kind === "hint" && e.data.ref === qid);
}

export function strongShown(log, pid, qid) {
  return !!plog(log, pid).find(e => e.data.kind === "item_used" && e.data.item === "hint" && e.data.ref === qid);
}

export function solvedCount(log, pid) {
  return PUZZLES.filter(p => solved(log, pid, p.id)).length;
}

export function knownDigits(log, pid) {
  return PUZZLES.map(p => solved(log, pid, p.id) ? p.digit : null);
}

export function spyAnswer(log, pid) {
  const e = plog(log, pid).find(x => x.data.kind === "spy");
  return e ? e.data : null;
}

export function reasoningEntry(log, pid) {
  return log.find(e => e.data.kind === "reasoning" && e.data.pid === pid) || null;
}

export function vaultOpen(log, pid) {
  return !!plog(log, pid).find(e => e.data.kind === "vault" && e.data.ok);
}

export function intelCount(log, pid) {
  return plog(log, pid).filter(e => e.data.kind === "item_used" && e.data.item === "intel").length;
}

export function visibleClues(log, game, pid) {
  const revealed = (game && game.revealed) || [];
  const extras = EXTRA_CLUES.slice(0, intelCount(log, pid));
  return CLUES.filter(c => c.base || revealed.indexOf(c.id) >= 0 || extras.indexOf(c) >= 0);
}

export function pDeadline(log, game, pid) {
  if (!game || !game.timerEndsAt) return 0;
  return game.timerEndsAt + pBonus(log, pid) * 1000;
}

export function secsLeft(log, game, pid) {
  const d = pDeadline(log, game, pid);
  return d ? Math.max(0, Math.round((d - now()) / 1000)) : null;
}

export function mmss(sec) {
  if (sec == null) return "--:--";
  const m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

export function timeUp(log, game, pid) {
  const s = secsLeft(log, game, pid);
  return s !== null && s <= 0;
}

export function pName(players, pid) {
  const p = players.find(x => x.id === pid);
  return p ? p.data.nickname : "Left the building";
}

export function pColor(pid) {
  let h = 0;
  const t = String(pid);
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
  return AGENT_COLORS[Math.abs(h) % AGENT_COLORS.length];
}

export function pInfo(players, pid) {
  return { id: pid, name: pName(players, pid), color: pColor(pid) };
}

export function agents(players) {
  return players.slice().sort((a, b) => a.data.ts - b.data.ts);
}

export function ranked(players, log) {
  return agents(players).map(p => ({
    agent: pInfo(players, p.id),
    score: pScore(log, p.id),
    money: pMoney(log, p.id),
    solved: solvedCount(log, p.id),
    vault: vaultOpen(log, p.id)
  })).sort((a, b) => b.score - a.score || b.solved - a.solved);
}

export function speak(text) {
  try {
    if (!("speechSynthesis" in window)) throw new Error("no tts");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    u.rate = 0.88;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
    return true;
  } catch (e) {
    return false;
  }
}

// Re-export vault password, suspects, and culprit for convenience
export { VAULT_PASSWORD, SUSPECTS, CULPRIT };

// Helper to get current highest bid for a round
export function currentBid(bids, round, defaultPrice = 0) {
  const roundBids = bids.filter(b => b.data.round === round)
    .sort((x, y) => y.data.amount - x.data.amount || x.data.ts - y.data.ts);
  const top = roundBids[0];
  return top ? { amount: top.data.amount, pid: top.data.pid } : { amount: defaultPrice, pid: null };
}

// Helper to retrieve bids for a specific round
export function roundBids(bids, round) {
  return bids.filter(b => b.data.round === round)
    .sort((x, y) => y.data.amount - x.data.amount || x.data.ts - y.data.ts);
}

// Placeholder penalty helper (can be implemented later)
export function applyPenaltyHelper(...args) {
  console.warn("applyPenaltyHelper called but not implemented");
  return null;
}
