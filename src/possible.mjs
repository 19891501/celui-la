/** Un possible. Pas un champ. Pas une session. Pas une skill. */

export const VERSION = 1;
export const MAX_BYTES = 2048;

export const STATES = Object.freeze(["open", "closed-here"]);

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

export function isPossible(value) {
  if (!value || typeof value !== "object") return false;
  const p = value;
  if (p.v !== 1) return false;
  if (typeof p.affair !== "string" || !p.affair.trim()) return false;
  if (!Array.isArray(p.constraints) || !p.constraints.every((c) => typeof c === "string")) {
    return false;
  }
  if (typeof p.name !== "string" || !p.name.trim()) return false;
  if (p.ref !== null && typeof p.ref !== "string") return false;
  if (p.state !== "open" && p.state !== "closed-here") return false;
  if (p.state === "open" && p.predicate !== null) return false;
  if (p.state === "closed-here") {
    if (typeof p.predicate !== "string" || !p.predicate.trim()) return false;
  }
  return true;
}

export function encodePossible(p) {
  if (!isPossible(p)) throw new Error("not a possible");
  const lines = [
    "POSSIBLE v1",
    `affaire: ${p.affair.trim()}`,
    p.constraints.filter(Boolean).length
      ? `contraintes: ${p.constraints.filter(Boolean).map((c) => c.trim()).join(" · ")}`
      : "",
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
  const lines = raw.trim().split(/\r?\n/).map((l) => l.trimEnd());
  if (!/^POSSIBLE(\s+v1)?$/i.test(lines[0] ?? "")) return null;

  const get = (key) => {
    const line = lines.find((l) => l.toLowerCase().startsWith(key.toLowerCase()));
    if (!line) return "";
    return line.slice(key.length).trim();
  };

  const name = get("nom:");
  if (!name) return null;
  const etat = get("état:") || get("etat:");
  const state = /clos/i.test(etat) ? "closed-here" : "open";
  const predicateRaw = get("fait:");
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
 * Impostors: things people will paste instead of a possible.
 * @returns {"possible" | "transcript" | "skill" | "handoff" | "field" | "agents-md" | "session-jsonl" | "unknown"}
 */
export function classify(raw) {
  if (typeof raw !== "string" || !raw.trim()) return "unknown";
  if (parsePossible(raw)) return "possible";
  const t = raw.trim();
  if (/^---\s*\n[\s\S]*\n---/.test(t) && /name:\s*.+/i.test(t) && /description:\s*.+/i.test(t)) {
    return "skill";
  }
  if (/^#\s*SKILL\.md/m.test(t) || /^##\s*Instructions/m.test(t) && /allowed-tools/i.test(t)) {
    return "skill";
  }
  if (/^CHAMP(\s+v1)?/i.test(t) || (t.startsWith("{") && /"items"\s*:\s*\[/.test(t))) {
    return "field";
  }
  if (/^\s*\{"type"\s*:\s*"(user|assistant|progress|system)"/.test(t) || /\.jsonl\b/.test(t) && /"parentUuid"/.test(t)) {
    return "session-jsonl";
  }
  if (/^(User|Human|Assistant|Claude|GPT)\s*:/m.test(t) && (t.match(/\n(User|Human|Assistant)\s*:/g) || []).length >= 1) {
    return "transcript";
  }
  if (/^#\s*Handoff/i.test(t) || /\b(SBAR|Situation|Background|Assessment|Recommendation)\s*:/i.test(t)) {
    return "handoff";
  }
  if (/Goal:\s*\nStatus:/i.test(t) || /##\s*Next safe action/i.test(t) || /SESSION_HANDOFF/i.test(t)) {
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
