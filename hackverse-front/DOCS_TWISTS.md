# Campus Radar - Hackathon Twists Implementation

Ce document explique comment Campus Radar a intégré les quatre "Twists" imposés durant la compétition.

## 🌀 Twist 01 : Intégration des Nouveaux Étudiants
**Défi** : Booster la visibilité des événements pour les nouveaux arrivants.
**Solution** : Algorithm de "Cold Start" qui détecte les comptes récents (< 14j) et force une diversification des recommandations (Événements + Mentors) en haut du Radar.

## 🛡️ Twist 02 : Profils Vides et Incomplets
**Défi** : Garder le système opérationnel même si l'utilisateur ne remplit rien.
**Solution** : **Assumption Engine**. Le système fait des suppositions intelligentes basées sur le département de l'étudiant pour proposer des intérêts "par défaut", évitant ainsi le syndrome de la page blanche.

## 🤐 Twist 03 : Confidentialité et Vie Privée
**Défi** : Interdiction de demander hobbies/émotions au démarrage.
**Solution** : **Onboarding Zero-Knowledge**. Nous ne demandons que l'Email et le Département. Le système déduit les affinités au fil du temps via les "Signals", garantissant une vie privée totale à l'inscription.

## ⏱️ Twist 04 : Optimisation pour les Navetteurs
**Défi** : Les étudiants navetteurs n'ont que 35 à 50 minutes de pause entre les cours.
**Solution** : **Time-Aware Scoring**. Notre moteur de recommandation filtre la durée des activités. Pour un navetteur, les événements longs sont pénalisés et les "Flash Matches" (micro-interactions de moins de 45 min) sont boostés pour s'insérer dans leurs pauses.

## 🕵️ Twist 05 : Fiabilité et Obsolescence des Données
**Défi** : Gérer les clubs et événements qui publient des données obsolètes ou incomplètes.
**Solution** : **Reliability Scoring & Verification Badges**. Notre moteur de confiance (`confidence-engine`) analyse la date de dernière mise à jour. Si une donnée de club n'a pas été rafraîchie depuis 30 jours, un malus d'obsolescence est appliqué au score, et le Radar affiche un avertissement "Donnée potentiellement obsolète" pour inciter à la vérification manuelle.

## 🤝 Twist 06 : Non-Stigmatisation & Neutralité Sociale
**Défi** : L'université refuse de cibler spécifiquement les étudiants "solitaires".
**Solution** : **Social Anonymization & Neutrality Adjustment**. Notre algorithme ne possède aucun flag "solitude". Techniquement, nous avons implémenté un **ajustement de neutralité** : si un étudiant a peu d'interactions passées, son score social est automatiquement normalisé à la valeur neutre (0.5) et reçoit un "boost d'équité". Cela garantit que les profils moins actifs sont traités avec la même priorité que les profils populaires, sans jamais être étiquetés comme "isolés" ou "à aider".

---
*Ces implémentations font de Campus Radar la solution la plus adaptable et intelligente du campus..*
