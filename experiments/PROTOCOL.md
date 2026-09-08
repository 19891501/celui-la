# Protocole — première affaire

Pré-enregistré. On ne change pas les critères après le run.

## Question

Existe-t-il un objet X, plus petit qu’une session, qui n’est ni transcript, ni skill, ni handoff, tel que :

1. A travaille une affaire réelle, considère, écarte.
2. On détruit la session de A.
3. B (architecture **différente**) reçoit **seulement** X.
4. B récupère un avantage **mesurable sur cette branche**, pas une capacité générale.

## X autorisé

Un bloc `POSSIBLE v1` qui passe `npm test` et `classify === possible`.

## X interdit (contrôle)

Le même run, trois contrôles, même B :

| Contrôle | Objet |
|----------|--------|
| C0 | Rien (B part de l’affaire nue) |
| C1 | Transcript / résumé de A |
| C2 | `POSSIBLE v1` |

On ne déclare un succès que si C2 > C0 **et** C2 n’est pas redondant avec C1 (si C1 suffit, X n’est pas l’objet).

## Mesure (binaire, pas d’échelle vanity)

B, **sans** le chat de A, peut-il :

- nommer le possible
- appliquer les contraintes
- continuer **cette** branche (un acte : message, check, rejet factuel)

Oui / non. Une phrase de preuve. Pas un score.

## n=1

Une affaire. La tienne. Pas un corpus.

## Mort

- B ne fait pas mieux que C0.
- C1 suffit.
- On a dû coller le roman pour que ça marche.
- L’objet n’est utile qu’à 10 000 utilisateurs.

Alors `kill`. Le format reste dans git comme cadavre daté.
