import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, parsePossible, assertNotImpostor } from "./possible.mjs";

test("a possible is a possible", () => {
  const raw = `POSSIBLE v1
affaire: Vélo cargo à Lyon
contraintes: ≤ 1800 €
état: ouvert
nom: Babboe Mini-E 2022
où: leboncoin.fr/164821
`;
  assert.equal(classify(raw), "possible");
  assert.ok(parsePossible(raw));
});

test("kill transcript", () => {
  const raw = `User: trouve-moi un vélo cargo
Assistant: Voici trois options...
User: et le Babboe ?
Assistant: Il est à 1650 €.`;
  assert.equal(classify(raw), "transcript");
  assert.equal(parsePossible(raw), null);
});

test("kill SKILL.md", () => {
  const raw = `---
name: cargo-bike-search
description: How to search for cargo bikes
---
# SKILL.md
## Instructions
Always search Leboncoin first.`;
  assert.equal(classify(raw), "skill");
});

test("kill SBAR / handoff", () => {
  const sbar = `Situation: buying a cargo bike
Background: budget 1800
Assessment: three listings remain
Recommendation: take the Babboe`;
  assert.equal(classify(sbar), "handoff");

  const handoff = `# Handoff: cargo bike
Goal: buy before Sept 20
Status: researched
Next safe action: message the seller`;
  assert.equal(classify(handoff), "handoff");
});

test("kill field (several items) — the object is one", () => {
  const champ = `CHAMP v1
affaire: Vélo cargo
ouvert:
- Babboe
- Urban Arrow
clos-ici:
- Load 75 · trop cher`;
  assert.equal(classify(champ), "field");
  assert.equal(parsePossible(champ), null);
});

test("kill session JSONL", () => {
  const raw = `{"type":"user","message":{"role":"user","content":[{"type":"text","text":"hi"}]},"parentUuid":null}
{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"ok"}]}}`;
  assert.equal(classify(raw), "session-jsonl");
});

test("kill AGENTS.md", () => {
  const raw = `# AGENTS.md
You are an interactive CLI that helps with software engineering.`;
  assert.equal(classify(raw), "agents-md");
});

test("assertNotImpostor throws on anything but a possible", () => {
  assert.throws(() => assertNotImpostor("User: hi\nAssistant: hello"), /killed: transcript/);
  const ok = assertNotImpostor(`POSSIBLE v1
affaire: test
contraintes: ≤ 1
état: ouvert
nom: X
`);
  assert.equal(ok.name, "X");
});

test("kill avis in fait", () => {
  const raw = `POSSIBLE v1
affaire: vélo
contraintes: ≤ 1800 €
état: clos-ici
nom: X
fait: trop cher
`;
  assert.equal(parsePossible(raw), null);
  assert.notEqual(classify(raw), "possible");
});

test("kill roman after header", () => {
  const raw = `POSSIBLE v1
affaire: vélo
contraintes: ≤ 1800 €
état: ouvert
nom: Babboe

User: et ensuite?
Assistant: je cherche
`;
  assert.equal(parsePossible(raw), null);
  assert.equal(classify(raw), "transcript");
});

test("kill open with a fait line", () => {
  const raw = `POSSIBLE v1
affaire: vélo
contraintes: ≤ 1800 €
état: ouvert
nom: X
fait: 2450 € > 1800 €
`;
  assert.equal(parsePossible(raw), null);
});

test("accept JSON mirror of one possible", () => {
  const raw = JSON.stringify({
    v: 1,
    affair: "vélo",
    constraints: ["≤ 1800 €"],
    name: "Babboe",
    ref: "leboncoin.fr/1",
    state: "open",
    predicate: null,
  });
  assert.equal(classify(raw), "possible");
});

test("accept indented keys", () => {
  const raw = `POSSIBLE v1
  affaire: vélo
  contraintes: ≤ 1800 €
  état: ouvert
  nom: Babboe
`;
  assert.equal(classify(raw), "possible");
});

test("empty is unknown, not a possible", () => {
  assert.equal(classify(""), "unknown");
  assert.equal(classify("   "), "unknown");
});
