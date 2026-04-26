# TWIST 02 : Gestion des Profils Incomplets

Ce document explique comment notre architecture gère les utilisateurs qui ne fournissent pas ou peu d'informations personnelles (Profils Vides).

## Le Problème du "Missing Data"

Beaucoup d'utilisateurs hésitent à remplir leur profil par manque de temps ou souci de confidentialité. Un système classique s'arrête de fonctionner ou affiche "Pas de recommandations".

## Notre Solution : L'Assumption Engine

Nous avons implémenté un **Moteur d'Assomptions** (`lib/assumption-engine.ts`) qui permet au système de rester "Actionnable" même avec 0 data utilisateur :

1. **Inférence de repli (Fallback Inference)** : Si les "Intérêts" sont vides, le système utilise le `department` comme pivot de confiance.
2. **Estimation de l'Emploi du Temps** : Si l'étudiant n'a pas déclaré ses disponibilités, le système les estime en croisant les données de son département et les horaires classiques des cours.
3. **Calcul du Score de Confiance** : Chaque recommandation générée pour un profil vide reçoit un score de confiance réduit, ce qui prévient l'utilisateur que le résultat est fondé sur une intuition système et non sur des faits prouvés.

## Interface Transparente

Plutôt que de cacher ces suppositions, l'interface du Dashboard affiche les **Cartes d'Assomptions**. L'étudiant peut cliquer sur "Confirmer" pour valider une supposition du système, transformant ainsi une donnée "système" en une donnée "utilisateur vérifiée" sans avoir à remplir un long formulaire.

---
*Implémenté dans `hackverse-back/lib/scoring-engine.ts` et `lib/assumption-engine.ts`*
