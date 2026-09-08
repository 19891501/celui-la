import { test } from "node:test";
import assert from "node:assert/strict";
import {
  encodePossible,
  parsePossible,
  isPossible,
  MAX_BYTES,
} from "./possible.mjs";

const open = {
  v: 1,
  affair: "Vélo cargo d'occasion à Lyon avant le 20 septembre",
  constraints: ["budget ≤ 1800 €", "largeur < 80 cm"],
  name: "Babboe Mini-E 2022, 3e arr.",
  ref: "leboncoin.fr/164821",
  state: "open",
  predicate: null,
};

const closed = {
  v: 1,
  affair: "Vélo cargo d'occasion à Lyon avant le 20 septembre",
  constraints: ["budget ≤ 1800 €"],
  name: "Riese & Müller Load 75",
  ref: "leboncoin.fr/201144",
  state: "closed-here",
  predicate: "2450 € > 1800 €",
};

test("roundtrip open", () => {
  const text = encodePossible(open);
  assert.match(text, /^POSSIBLE v1\n/);
  const back = parsePossible(text);
  assert.deepEqual(back, open);
});

test("roundtrip closed-here requires a factual predicate", () => {
  const text = encodePossible(closed);
  assert.match(text, /fait: 2450/);
  assert.deepEqual(parsePossible(text), closed);
});

test("open with a predicate is not a possible", () => {
  assert.equal(isPossible({ ...open, predicate: "still thinking" }), false);
});

test("closed-here without predicate is not a possible", () => {
  assert.equal(isPossible({ ...closed, predicate: null }), false);
  assert.equal(isPossible({ ...closed, predicate: "  " }), false);
});

test("missing name is not a possible", () => {
  assert.equal(isPossible({ ...open, name: "" }), false);
  assert.equal(parsePossible("POSSIBLE v1\naffaire: x\nétat: ouvert\n"), null);
});

test("pasteable: encoded size stays under MAX_BYTES", () => {
  const text = encodePossible(open);
  assert.ok(new TextEncoder().encode(text).length <= MAX_BYTES);
});

test("too large to parse", () => {
  const huge = "POSSIBLE v1\naffaire: x\nétat: ouvert\nnom: y\n" + "a".repeat(MAX_BYTES);
  assert.equal(parsePossible(huge), null);
});

test("one object: no list of items in the text", () => {
  const text = encodePossible(open);
  assert.doesNotMatch(text, /^ouvert:/m);
  assert.doesNotMatch(text, /^-\s/m);
});
