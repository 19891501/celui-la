#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { encodePossible, parsePossible, classify, isPossible } from "./possible.mjs";

const [, , cmd, ...rest] = process.argv;
const stdin = () => readFileSync(0, "utf8");

if (cmd === "parse") {
  const raw = rest[0] && rest[0] !== "-" ? rest[0] : stdin();
  const kind = classify(raw);
  if (kind !== "possible") {
    console.error(`killed: ${kind}`);
    process.exit(2);
  }
  console.log(JSON.stringify(parsePossible(raw), null, 2));
} else if (cmd === "classify") {
  const raw = rest[0] && rest[0] !== "-" ? rest[0] : stdin();
  console.log(classify(raw));
} else if (cmd === "encode") {
  const json = JSON.parse(stdin());
  if (!isPossible(json)) {
    console.error("killed: not a possible");
    process.exit(2);
  }
  process.stdout.write(encodePossible(json));
} else {
  console.error("usage: cli.mjs parse|classify|encode");
  process.exit(1);
}
