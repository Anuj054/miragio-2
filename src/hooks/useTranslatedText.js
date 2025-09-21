// src/hooks/useTranslatedText.js
import { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';

// Hook for translating single text (instant for offline)
export const useTranslatedText = (text, dependencies = []) => {
  const { translate, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (!text) {
      setTranslatedText(text);
      return;
    }

    // Offline translation is instant, no async needed
    const translated = translate(text);
    setTranslatedText(translated);
  }, [text, currentLanguage, translate, ...dependencies]);

  return {
    translatedText,
    isTranslating: false, // Always false for offline translation
  };
};

// Hook for translating multiple texts (batch)
export const useTranslatedTexts = (texts, dependencies = []) => {
  const { translate, currentLanguage } = useTranslation();
  const [translatedTexts, setTranslatedTexts] = useState(texts || []);

  useEffect(() => {
    if (!texts || texts.length === 0) {
      setTranslatedTexts(texts);
      return;
    }

    // Translate all texts instantly
    const translated = texts.map(text => translate(text));
    setTranslatedTexts(translated);
  }, [texts, currentLanguage, translate, ...dependencies]);

  return {
    translatedTexts,
    isTranslating: false, // Always false for offline translation
  };
};

// Hook for object translation (useful for forms, labels, etc.)
export const useTranslatedObject = (obj, dependencies = []) => {
  const { translate, currentLanguage } = useTranslation();
  const [translatedObject, setTranslatedObject] = useState(obj || {});

  useEffect(() => {
    if (!obj) {
      setTranslatedObject(obj);
      return;
    }

    // Translate object values instantly
    const translatedObj = {};
    Object.keys(obj).forEach(key => {
      translatedObj[key] = translate(obj[key]);
    });

    setTranslatedObject(translatedObj);
  }, [obj, currentLanguage, translate, ...dependencies]);

  return {
    translatedObject,
    isTranslating: false, // Always false for offline translation
  };
};

// Hook for conditional text based on language
export const useLanguageText = (englishText, hindiText) => {
  const { currentLanguage } = useTranslation();

  return currentLanguage === 'hi' ? hindiText : englishText;
};

// Hook for getting placeholder text in current language
export const usePlaceholder = (englishPlaceholder, hindiPlaceholder) => {
  const { currentLanguage } = useTranslation();

  return currentLanguage === 'hi' ? hindiPlaceholder : englishPlaceholder;
};
