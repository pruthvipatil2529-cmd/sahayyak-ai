import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';
import mrTranslations from '../locales/mr.json';

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations,
};

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('sahayyak_text_size') || 'normal';
  });

  const [contrastMode, setContrastMode] = useState(() => {
    return localStorage.getItem('sahayyak_contrast_mode') || 'light';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sahayyak_language') || 'en';
  });

  // Apply font size class to html root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-normal', 'text-large', 'text-extralarge');
    root.classList.add(`text-${textSize}`);
    localStorage.setItem('sahayyak_text_size', textSize);
  }, [textSize]);

  // Apply contrast mode class to html root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('mode-light', 'mode-high-contrast', 'mode-dark', 'dark');
    if (contrastMode === 'high-contrast') {
      root.classList.add('mode-high-contrast', 'dark');
    } else if (contrastMode === 'dark') {
      root.classList.add('mode-dark', 'dark');
    } else {
      root.classList.add('mode-light');
    }
    localStorage.setItem('sahayyak_contrast_mode', contrastMode);
  }, [contrastMode]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('sahayyak_language', language);
  }, [language]);

  // Translation lookup helper with fallback to English
  const t = (key) => {
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    return translations.en[key] || key;
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        contrastMode,
        setContrastMode,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
