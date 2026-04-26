# TWIST 01 : Accueil des Nouveaux Étudiants

Ce document explique comment nous avons implémenté la recommandation intelligente pour les nouveaux arrivants sur le campus.

## Détection du Mode "Nouvel Étudiant"

Nous utilisons un algorithme de détection basé sur deux facteurs clés dans `lib/recommendation-service.ts` :
1. **Complétion du Profil** : Si le profil est complété à moins de 50%, le système considère l'étudiant comme ayant besoin d'exploration guidée.
2. **Ancienneté** : Tout compte créé il y a moins de 14 jours déclenche automatiquement le mode "Nouvel Étudiant".

## Stratégie de Mixage (Remixing)

Pour un nouvel étudiant, le score de similarité pur n'est pas suffisant car nous avons peu de données ("Cold Start problem"). Nous appliquons donc une stratégie de frontloading :

```typescript
const orderedTypes: RecommendationType[] = ["event", "association", "student", "help_opportunity"];
```

Le système réorganise les résultats pour garantir que les premières recommandations soient diversifiées :
1. **Événement phare** (pour l'intégration sociale immédiate).
2. **Association pertinente** (pour l'engagement à long terme).
3. **Étudiant mentor/pair** (pour le support académique).
4. **Opportunité d'aide** (pour valoriser les compétences dès l'arrivée).

## Moteur d'Assomption (Assumption Engine)

Comme les nouveaux étudiants n'ont souvent pas encore rempli leurs "Intérêts", notre moteur génère des **Assomptions de Départ** basées sur le département académique pour éviter une page vide et encourager la découverte par sérendipité.

---
*Implémenté dans `hackverse-back/lib/recommendation-service.ts`*
