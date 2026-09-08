# Comment on travaille

Ce dépôt est un **chantier**, pas une conversation.

## Une unité

Une PR, une hypothèse. Si ça ressemble à un produit, on ne merge pas.

## Massacre avant merge

Toute chose collée qui n’est pas `POSSIBLE v1` doit échouer `classify` ≠ `possible`.

Interdit d’ajouter :

- un transcript
- un `SKILL.md`
- un handoff / SBAR
- un champ (plusieurs items)
- un JSONL de session
- une UI, un compte, un protocole réseau

avant qu’une **affaire réelle** ait été courue (`experiments/runs/`).

## Semaine 1

1. Une affaire **déjà vraie** (pas une démo).
2. Extraire **un** possible écarté.
3. Détruire la session.
4. Le donner à un **autre** modèle, objet seul.
5. Noter dans `experiments/runs/` : B reprend-il **cette** branche ?

Si non : issue `kill`, on ferme.

## Issues

| Label | Sens |
|-------|------|
| `gate` | Bloque tout le reste |
| `experiment` | Une course, un run |
| `kill` | Preuve que c’est faux |
| `forbid` | On ne construira pas ça |
| `object` | Le format v1 |

Pas de milestone « app ». Pas de projet AION ici.
