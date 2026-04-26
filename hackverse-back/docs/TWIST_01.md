# TWIST 01 : Accueil des Nouveaux Étudiants

Ce document explique comment nous avons implémenté la recommandation intelligente pour les nouveaux arrivants sur le campus.

## Détection du Mode "Nouvel Étudiant"
Nous utilisons un algorithme de détection basé sur deux facteurs :
1. **Complétion du Profil** : < 50%.
2. **Ancienneté** : Créé il y a moins de 14 jours.

## Stratégie de Mixage
Le système réorganise les résultats pour garantir que les premières recommandations soient diversifiées (Événement, Association, Mentor).
