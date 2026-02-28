"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

type Language = "en" | "kn";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (translations: { en: string; kn: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = Cookies.get("lang") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "kn")) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    Cookies.set("lang", newLang, { expires: 365 });
  };

  const t = (translations: { en: string; kn: string }) => {
    return translations[lang] || translations["en"];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
