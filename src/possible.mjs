/** Un possible. Pas un champ. Pas une session. Pas une skill. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";

export const VERSION = 1;
export const MAX_BYTES = 2048;

export const STATES = Object.freeze(["open", "closed-here"]);

const KEY = /^(possible(\s+v1)?|affaire:|contraintes:|état:|etat:|nom:|où:|ou:|fait:)/i;
const AVIS = /\b(trop|peu|probab|devrait|je pense|on devrait|fiable|mieux)\b|%|\bP\s*=/i;

const schema = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../schema/possible.v1.json"), "utf8"),
);
const validateSchema = new Ajv({ allErrors: true }).compile(schema);

/**
 * @typedef {{
 *   v: 1,
 *   affair: string,
 *   constraints: string[],
 *   name: string,
 *   ref: string | null,
 *   state: "open" | "closed-here",
 *   predicate: string | null
 * }} Possible
 */

export function isFact(s) {
  if (typeof s !== "string" || !s.trim()) return false;
  if (AVIS.test(s)) return false;
  return /\d/.test(s) || /[><=≤≥]/.test(s);
}

export function schemaErrors(value) {
  if (validateSchema(value)) return null;
  return validateSchema.errors ?? [];
}

export function isPossible(value) {
  if (!validateSchema(value)) return false;
  const p = value;
  if (!p.constraints.every((c) => !AVIS.test(c))) return false;
  if (p.state === "closed-here" && !isFact(p.predicate)) return false;
  return true;
}

export function encodePossible(p) {
  if (!isPossible(p)) throw new Error("not a possible");
  const lines = [
    "POSSIBLE v1",
    `affaire: ${p.affair.trim()}`,
    `contraintes: ${p.constraints.map((c) => c.trim()).join(" · ")}`,
    `état: ${p.state === "open" ? "ouvert" : "clos-ici"}`,
    `nom: ${p.name.trim()}`,
    p.ref ? `où: ${p.ref.trim()}` : "",
    p.predicate ? `fait: ${p.predicate.trim()}` : "",
  ].filter(Boolean);
  const text = lines.join("\n") + "\n";
  if (byteSize(text) > MAX_BYTES) throw new Error("too large to paste");
  return text;
}

export function parsePossible(raw) {
  if (typeof raw !== "string") return null;
  if (byteSize(raw) > MAX_BYTES) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const j = JSON.parse(trimmed);
      if (j && Array.isArray(j.items)) return null;
      return isPossible(j) ? j : null;
    } catch {
      return null;
    }
  }
  const body = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!/^POSSIBLE(\s+v1)?$/i.test(body[0] ?? "")) return null;
  const extra = body.slice(1).filter((l) => !KEY.test(l));
  if (extra.length) return null;

  const get = (key) => {
    const line = body.find((l) => l.toLowerCase().startsWith(key.toLowerCase()));
    if (!line) return "";
    return line.slice(key.length).trim();
  };

  const name = get("nom:");
  if (!name) return null;
  const etat = get("état:") || get("etat:");
  const state = /clos/i.test(etat) ? "closed-here" : "open";
  const predicateRaw = get("fait:");
  if (state === "open" && predicateRaw) return null;
  /** @type {Possible} */
  const p = {
    v: 1,
    affair: get("affaire:"),
    constraints: (get("contraintes:") || "")
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean),
    name,
    ref: get("où:") || get("ou:") || null,
    state,
    predicate: state === "closed-here" ? predicateRaw || null : null,
  };
  if (p.ref === "") p.ref = null;
  return isPossible(p) ? p : null;
}

function byteSize(s) {
  return new TextEncoder().encode(s).length;
}

/**
 * @returns {"possible" | "transcript" | "skill" | "handoff" | "field" | "agents-md" | "session-jsonl" | "unknown"}
 */
export function classify(raw) {
  if (typeof raw !== "string" || !raw.trim()) return "unknown";
  if (parsePossible(raw)) return "possible";
  const t = raw.trim();
  if (/^---\s*\n[\s\S]*\n---/.test(t) && /name:\s*.+/i.test(t) && /description:\s*.+/i.test(t)) {
    return "skill";
  }
  if (/^#\s*SKILL\.md/m.test(t) || (/^##\s*Instructions/m.test(t) && /allowed-tools/i.test(t))) {
    return "skill";
  }
  if (/^CHAMP(\s+v1)?/i.test(t) || (t.startsWith("{") && /"items"\s*:\s*\[/.test(t))) {
    return "field";
  }
  if (/^\s*\{"type"\s*:\s*"(user|assistant|progress|system)"/.test(t) || (/\.jsonl\b/.test(t) && /"parentUuid"/.test(t))) {
    return "session-jsonl";
  }
  if (/^(User|Human|Assistant|Claude|GPT|Utilisateur)\s*:/m.test(t)) {
    return "transcript";
  }
  if (/^#\s*Handoff/i.test(t) || /\b(SBAR|Situation|Background|Assessment|Recommendation)\s*:/i.test(t)) {
    return "handoff";
  }
  if (/Goal:\s*\nStatus:/i.test(t) || /##\s*Next safe action/i.test(t) || /SESSION_HANDOFF/i.test(t)) {
    return "handoff";
  }
  if (/^#\s*(Résumé|Resume|Summary)\b/im.test(t) || /^Résumé\s*:/im.test(t)) {
    return "handoff";
  }
  if (/^#\s*AGENTS\.md/m.test(t) || /^You are an interactive CLI/.test(t)) {
    return "agents-md";
  }
  return "unknown";
}

export function assertNotImpostor(raw) {
  const kind = classify(raw);
  if (kind !== "possible") {
    throw new Error(`killed: ${kind}`);
  }
  return parsePossible(raw);
}
