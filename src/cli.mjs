#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { structuralId } from "./branch.mjs";

const raw = readFileSync(0, "utf8");
let taken, abandoned, condition;
const trimmed = raw.trim();
if (trimmed.startsWith("{")) {
  const json = JSON.parse(trimmed);
  ({ taken, abandoned, condition } = json);
} else {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  [taken, abandoned, condition] = lines;
}
const id = structuralId(taken, abandoned, condition);
if (!id) {
  console.log("NULL");
  process.exit(2);
}
console.log(id);
