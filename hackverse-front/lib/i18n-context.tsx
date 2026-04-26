"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr";

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  dashboard: { en: "Dashboard", fr: "Tableau de Bord" },
  workspace: { en: "Workspace", fr: "Espace de Travail" },
  studentRadar: { en: "Student Radar", fr: "Radar Étudiant" },
  impactProfile: { en: "Impact Profile", fr: "Profil d'Impact" },
  networkEvents: { en: "Network & Events", fr: "Réseau & Événements" },
  platformAdmin: { en: "Platform Admin", fr: "Admin Plateforme" },
  settings: { en: "Settings", fr: "Paramètres" },
  welcomeBack: { en: "Welcome back", fr: "Bon retour" },
  scanningSignals: { en: "Scanning Campus Signals...", fr: "Analyse des Signaux du Campus..." },
  preferences: { en: "Preferences", fr: "Préférences" },
  interfaceTheme: { en: "Interface Theme", fr: "Thème d'Interface" },
  language: { en: "Language", fr: "Langue" },
  light: { en: "Light", fr: "Clair" },
  dark: { en: "Dark", fr: "Sombre" },
  system: { en: "System", fr: "Système" },
  saveChanges: { en: "Save Changes", fr: "Enregistrer" },
  cancel: { en: "Cancel", fr: "Annuler" },
  profileDetails: { en: "Profile Details", fr: "Détails du Profil" },
  discoveryPrivacy: { en: "Discovery & Privacy", fr: "Découverte & Vie Privée" },
  heroTitle: { en: "Unlock your true campus potential.", fr: "Libérez votre véritable potentiel sur le campus." },
  heroSubtitle: { en: "Stop missing out. Campus Radar intelligently connects you with the right peers.", fr: "Ne passez plus à côté. Campus Radar vous connecte intelligemment avec les bons pairs." },
  getStarted: { en: "Get Started", fr: "Commencer" },
  logIn: { en: "Log in", fr: "Connexion" },
  signUp: { en: "Sign up", fr: "S'inscrire" },
  privacyTerms: { en: "Privacy & Terms", fr: "Confidentialité & Conditions" },
  principle1Title: { en: "Connection moments", fr: "Moments de connexion" },
  principle1Text: { en: "The app proposes concrete actions: ask for help, attend together, join a micro-group, or discover an association.", fr: "L'application propose des actions concrètes : demander de l'aide, participer ensemble, rejoindre un micro-groupe ou découvrir une association." },
  principle2Title: { en: "Explainable recommendations", fr: "Recommandations explicables" },
  principle2Text: { en: "Every card shows the signals, confidence, and assumptions behind the suggestion.", fr: "Chaque carte montre les signaux, la confiance et les hypothèses derrière la suggestion." },
  principle3Title: { en: "Smart Peer Matching", fr: "Mise en relation intelligente" },
  principle3Text: { en: "Connect with students who share your academic interests and are free when you are.", fr: "Connectez-vous avec des étudiants qui partagent vos intérêts académiques et sont libres en même temps que vous." },
  radarLiveConnection: { en: "Live connection moment", fr: "Moment de connexion en direct" },
  radarFreeTime: { en: "45 minutes free near Block B.", fr: "45 minutes libres près du Bloc B." },
  radarDescription: {
    en: "6 new students are free, Robotics Club starts soon, and a verified mentor is available. Risk is low because assumptions are visible.",
    fr: "6 nouveaux étudiants sont libres, le Club de Robotique commence bientôt, et un mentor vérifié est disponible. Le risque est faible car les hypothèses sont visibles.",
  },
  radarRelevance: { en: "relevance", fr: "pertinence" },
  radarRisk: { en: "assumption risk", fr: "risque d'hypothèse" },
  radarLow: { en: "low", fr: "faible" },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "en" || saved === "fr")) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
