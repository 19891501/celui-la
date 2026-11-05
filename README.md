# Celui-là

Pas de bifurcation, pas d'identité. Pas d'identité, pas d'objet.

Le dépôt ne transporte pas encore de capsule, de chiffre, ni de langage. Il fixe l'identité d'une bifurcation.

## Triplet

| Place | Rôle |
|---|---|
| `taken` | Suite choisie |
| `abandoned` | Suite non choisie |
| `condition` | Ce qui rend les deux suites incompatibles |

Les trois textes sont toute l'identité. Rien d'autre n'entre dans le hash.

## Deux validations

La validation structurelle est le code. Trois textes non vides, Unicode NFC, espaces réduits, chemins distincts, JSON canonique sans espace, SHA-256. Si une case manque : `NULL`. Pas de remplacement.

La validation sémantique est extérieure. Même affaire, deux suites alternatives, incompatibilité réelle, pas une simple reformulation. Le SHA-256 ne la juge pas. `birth` refuse l'objet si le témoin fourni n'est pas explicitement vrai. Le code n'invente pas ce témoin.

## Vecteur

```
taken:      envoyer 100 USDC à Alice.
abandoned:  envoyer 100 USDC à Bob.
condition:  une transaction unique de 100 USDC ne peut avoir qu'un seul destinataire.
BRANCH-ID:  9127abef7d4c96e60f2329543ee6c96346dabd9fe89ae141a80cb66caa41bd79
```

`162054c3…` est un autre triplet, structurellement hashable, refusé comme objet : il nomme le système. `3d5e2427…` ne correspond pas à cette canonisation. Ce n'est pas un vecteur de référence.

## Travail

```
npm test
```

Trois lignes sur l'entrée standard, dans l'ordre pris, laissé, condition :

```
npm run id
```
