# TWIST 04 : Optimisation Temporelle (Navetteurs)

Ce document explique comment l'algorithme gère la contrainte de temps des étudiants navetteurs.

## Détection
Le système identifie les navetteurs via le flag `is_commuter` (issu des données du Sujet 9).

## Logique de Scoring (`lib/scoring-engine.ts`)

Pour un étudiant identifié comme navetteur :
1. **Événements Longs (> 60 min)** : Le score d'accessibilité subit un malus de 40%. Nous estimons qu'un événement long est incompatible avec les pauses de 35-50 min spécifiques aux navetteurs.
2. **Flash Interaction (<= 45 min)** : Toute recommandation d'une durée courte recevant un "Yes" sur l'overlap d'emploi du temps est boostée à un score de 1.0 (Priorité absolue).

## Transparence
Le moteur d'explication informe spécifiquement l'utilisateur que le Radar a privilégié des formats courts adaptés à son mode de déplacement.
