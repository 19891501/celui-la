import { createHash } from "node:crypto";

export function normalize(value) {
  if (typeof value !== "string") return "";
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

/** Structural identity only. Null if a field is empty or the two paths match. */
export function canonical(taken, abandoned, condition) {
  const t = normalize(taken);
  const a = normalize(abandoned);
  const c = normalize(condition);
  if (!t || !a || !c || t === a) return null;
  return JSON.stringify({ abandoned: a, condition: c, taken: t });
}

export function structuralId(taken, abandoned, condition) {
  const payload = canonical(taken, abandoned, condition);
  if (!payload) return null;
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Semantic acceptance is supplied, never inferred.
 * It is not part of the hash. A false flag refuses the object.
 */
export function birth(taken, abandoned, condition, semantic) {
  const branchId = structuralId(taken, abandoned, condition);
  if (!branchId || !accepted(semantic)) return null;
  return { branchId };
}

function accepted(semantic) {
  return Boolean(
    semantic &&
      semantic.sameAffair === true &&
      semantic.alternatives === true &&
      semantic.incompatibility === true &&
      semantic.notWording === true,
  );
}
