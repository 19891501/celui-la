import { test } from "node:test";
import assert from "node:assert/strict";
import { birth, canonical, normalize, structuralId } from "./branch.mjs";

const taken = "envoyer 100 USDC à Alice.";
const abandoned = "envoyer 100 USDC à Bob.";
const condition = "une transaction unique de 100 USDC ne peut avoir qu'un seul destinataire.";
const witness = {
  sameAffair: true,
  alternatives: true,
  incompatibility: true,
  notWording: true,
};

const ALICE = "9127abef7d4c96e60f2329543ee6c96346dabd9fe89ae141a80cb66caa41bd79";

test("alice and bob share words and still fork", () => {
  assert.equal(structuralId(taken, abandoned, condition), ALICE);
  assert.equal(birth(taken, abandoned, condition, witness)?.branchId, ALICE);
});

test("normalization does not change the id", () => {
  assert.equal(
    structuralId(`  ${taken}  `, abandoned.replace(" ", "   "), `\n${condition}\n`),
    ALICE,
  );
  assert.equal(normalize("e\u0301"), "é");
});

test("a missing field is null, with no substitute", () => {
  assert.equal(structuralId(taken, "", condition), null);
  assert.equal(birth(taken, "", condition, witness), null);
});

test("identical paths are null", () => {
  assert.equal(structuralId(taken, taken, condition), null);
});

test("the hash does not accept the slogan", () => {
  const id = structuralId(
    "Conserver un chemin non pris, identifiable sans la session.",
    "Faire un paquet universel de reprise d'agent, comme un checkpoint.",
    "Un checkpoint garde ce qui était en cours. Ici on garde seulement ce qui n'a pas été choisi.",
  );
  assert.equal(id, "162054c3fa82d2f8a9f14ec174591b9d235cb0f0bba6481abb738efcb8af188d");
  assert.equal(birth(
    "Conserver un chemin non pris, identifiable sans la session.",
    "Faire un paquet universel de reprise d'agent, comme un checkpoint.",
    "Un checkpoint garde ce qui était en cours. Ici on garde seulement ce qui n'a pas été choisi.",
    { sameAffair: false, alternatives: false, incompatibility: false, notWording: false },
  ), null);
});

test("3d5e2427 is not this canonical vector", () => {
  assert.notEqual(structuralId(taken, abandoned, condition), "3d5e24274e8a0b6f3b3cd5b875330584d9db09465e53734819ef4320a1f26a51");
});

test("canonical payload is the whole identity", () => {
  assert.equal(
    canonical(taken, abandoned, condition),
    JSON.stringify({ abandoned, condition, taken }),
  );
});
