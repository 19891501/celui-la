#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  encodePossible,
  parsePossible,
  classify,
  isPossible,
  schemaErrors,
} from "./possible.mjs";

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
} else if (cmd === "validate") {
  const raw = rest[0] && rest[0] !== "-" ? rest[0] : stdin();
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    let json;
    try {
      json = JSON.parse(trimmed);
    } catch (e) {
      console.error("killed: json");
      process.exit(2);
    }
    if (isPossible(json)) {
      console.log("ok");
      process.exit(0);
    }
    const err = schemaErrors(json);
    console.error("killed: schema");
    if (err) console.error(JSON.stringify(err, null, 2));
    process.exit(2);
  }
  const kind = classify(raw);
  if (kind === "possible") {
    console.log("ok");
    process.exit(0);
  }
  console.error(`killed: ${kind}`);
  process.exit(2);
} else if (cmd === "encode") {
  const json = JSON.parse(stdin());
  if (!isPossible(json)) {
    console.error("killed: not a possible");
    process.exit(2);
  }
  process.stdout.write(encodePossible(json));
} else {
  console.error("usage: cli.mjs parse|classify|validate|encode");
  process.exit(1);
}
