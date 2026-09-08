export const START_MONEY = 500;

export const AGENT_COLORS = [
  "#4FD1A5", "#7BA7E8", "#D98BC8", "#F2A93B",
  "#E5533D", "#8FD14F", "#B79BF0", "#4FC3D1"
];

export const BRIEFING = [
  "At 21:00 last night the Nightingale File was taken from Room 4 of this building.",
  "Every exit is now sealed. The building is in lockdown, and so are you.",
  "You have one hour of oxygen, a wallet of operational funds, and a very poor excuse.",
  "Solve the six English puzzles to recover the vault digits. Identify the thief to recover the vault letter. Open the vault, and the doors open with it.",
  "Everyone works alone. Your score is yours."
];

export const ITEMS = [
  { id: "masterkey", name: "Master Key", effect: "Skip one puzzle. You get its vault digit, but no points for it.", start: 120 },
  { id: "intel",     name: "Intel",      effect: "Unlock one extra clue in the Spy Mission.",                       start: 100 },
  { id: "timeboost", name: "Time Boost", effect: "Add 60 seconds to your own clock.",                                start: 80 },
  { id: "shield",    name: "Shield",     effect: "Absorb one penalty. Used automatically on your next wrong answer.",start: 100 },
  { id: "hint",      name: "Hint",       effect: "Reveal the stronger hint on one puzzle, with no point penalty.",   start: 80 }
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export const PUZZLES = [
  {
    id: "p1", kind: "Vocabulary", type: "mcq", digit: "4",
    prompt: "A witness statement reads: “The answer she gave was deliberate.” What does <em>deliberate</em> mean here?",
    options: [
      "Done by accident",
      "Done on purpose",
      "Done very quickly",
      "Done politely"
    ],
    answer: 1,
    hint: "It is the opposite of “accidental”.",
    strong: "Think of the sentence “she deliberately lied” — she meant to do it."
  },
  {
    id: "p2", kind: "Grammar", type: "text", digit: "8",
    prompt: "Rewrite this line from the incident report so the grammar is correct:<br><strong>“The documents was stolen last night.”</strong>",
    placeholder: "Type the corrected sentence",
    accept: ["the documents were stolen last night", "documents were stolen last night"],
    hint: "Check subject–verb agreement.",
    strong: "“Documents” is plural, so the verb must be <em>were</em>, not <em>was</em>."
  },
  {
    id: "p3", kind: "Riddle", type: "text", digit: "1",
    prompt: "Scratched into the door frame:<br><em>“I have keys but open no locks. I have space but no room. You can enter, but you cannot go outside. What am I?”</em>",
    placeholder: "One word",
    accept: ["keyboard", "a keyboard", "the keyboard"],
    hint: "You are probably touching one right now.",
    strong: "It has an Enter key and a Space bar."
  },
  {
    id: "p4", kind: "Word Puzzle", type: "text", digit: "9",
    prompt: "Unscramble the letters on the keypad label:<br><span class=\"mono\" style=\"font-size:1.5rem;letter-spacing:.35em\">T E V L A U</span><br><span class=\"tiny\">Clue: a strong room where valuable things are kept.</span>",
    placeholder: "Five letters",
    accept: ["vault", "the vault"],
    hint: "Five letters, and it is in the name of this mission.",
    strong: "V _ U _ T"
  },
  {
    id: "p5", kind: "Listening", type: "mcq", digit: "2", audio: true,
    transcript: "At nine fifteen last night, a guard saw a person in a grey coat leave the east wing carrying a black case. The alarm did not sound.",
    prompt: "Play the guard's recorded statement, then answer:<br><strong>What time did the guard see the person?</strong>",
    options: ["9:50 p.m.", "9:15 p.m.", "8:15 p.m.", "9:05 p.m."],
    answer: 1,
    hint: "Play it again and listen for the numbers at the very start.",
    strong: "“Nine fifteen” is written as 9:15."
  },
  {
    id: "p6", kind: "Reading", type: "mcq", digit: "6",
    prompt: "<div class=\"panel lift\" style=\"margin-bottom:12px;font-size:.9rem\"><span class=\"label\">Internal Memo</span><br>All staff must return their access cards to Reception before leaving the building. Cards that are not returned by 6:00 p.m. will be deactivated. Staff who need after-hours access must request written approval from the Head of Security at least one day in advance.</div><strong>According to the memo, what must a staff member do in order to work after 6:00 p.m.?</strong>",
    options: [
      "Return the access card to Reception",
      "Get written approval from the Head of Security a day earlier",
      "Ask a colleague to keep the card overnight",
      "Wait for the card to be deactivated"
    ],
    answer: 1,
    hint: "Find the sentence about after-hours access.",
    strong: "“Request written approval … at least one day in advance.”"
  }
];

export const VAULT_DIGITS = PUZZLES.map(p => p.digit).join("");

export const SUSPECTS = [
  { id: "falcon",  name: "Agent Falcon",  role: "Logistics",   letter: "F" },
  { id: "kestrel", name: "Agent Kestrel", role: "Archives",    letter: "K" },
  { id: "heron",   name: "Agent Heron",   role: "Security",    letter: "H" },
  { id: "magpie",  name: "Agent Magpie",  role: "IT Support",  letter: "M" }
];

export const CULPRIT = "kestrel";
export const VAULT_LETTER = SUSPECTS.find(s => s.id === CULPRIT).letter;
export const VAULT_PASSWORD = VAULT_LETTER + VAULT_DIGITS;

export const CASE_TEXT = "The Nightingale File left Room 4 between 21:00 and 22:00 last night. Four agents were inside the building. Read the clues, then name the thief and explain your reasoning in English.";

export const CLUES = [
  { id: "c1", base: true,  text: "The thief used the east stairs. That door opens only with an <strong>Archives</strong> card or a <strong>Security</strong> card." },
  { id: "c2", base: true,  text: "The camera in Room 4 was switched off from the IT room at 20:55." },
  { id: "c3", base: true,  text: "Agent Heron was on a video call with the night manager from 20:50 until 22:10. The call log confirms it." },
  { id: "c4", base: true,  text: "A grey coat was found in the Archives locker room. The guard saw the thief wearing a grey coat." },
  { id: "c5", base: true,  text: "Agent Falcon signed out of the building at 19:30 and never signed back in." },
  { id: "c6", base: false, text: "Agent Magpie's IT account was used at 20:55 — but Magpie's phone was connected to a WiFi network two kilometres away from 20:40 until 23:00." },
  { id: "c7", base: false, text: "Only two people borrowed an Archives card that week: Agent Kestrel and Agent Heron. Heron returned it on Monday morning." }
];

export const EXTRA_CLUES = CLUES.filter(c => !c.base);

export const SCORE = { correct: 150, hint: -50, wrong: -50, spy: 300, reasoning: 200, vault: 500 };

export const PHASES = [
  { id: "lobby",    name: "Lobby",         mins: 0 },
  { id: "briefing", name: "Briefing",      mins: 2 },
  { id: "auction",  name: "Auction",       mins: 4 },
  { id: "escape",   name: "Escape Room",   mins: 7 },
  { id: "spy",      name: "Spy Mission",   mins: 5 },
  { id: "vault",    name: "Final Vault",   mins: 2 },
  { id: "results",  name: "Results",       mins: 0 }
];

export const PHASE_BY_ID = Object.fromEntries(PHASES.map(p => [p.id, p]));
