// src/context/TranslationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import OfflineTranslationService from '../vendor/OfflineTranslationService';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeTranslation();
  }, []);

  const initializeTranslation = async () => {
    setIsLoading(true);
    try {
      await OfflineTranslationService.init();
      const language = OfflineTranslationService.getCurrentLanguage();
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Translation initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async languageCode => {
    if (languageCode !== 'en' && languageCode !== 'hi') return;

    setIsLoading(true);
    try {
      await OfflineTranslationService.setLanguage(languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Language change failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = async () => {
    setIsLoading(true);
    try {
      const newLanguage = await OfflineTranslationService.toggleLanguage();
      setCurrentLanguage(newLanguage);
      return newLanguage;
    } catch (error) {
      console.error('Language toggle failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const translate = text => {
    if (!text) return text;
    return OfflineTranslationService.translateText(text, currentLanguage);
  };

  const addCustomTranslation = async (english, hindi) => {
    await OfflineTranslationService.addCustomTranslation(english, hindi);
  };

  const value = {
    currentLanguage,
    isLoading,
    changeLanguage,
    toggleLanguage,
    translate,
    addCustomTranslation,
    isEnglish: currentLanguage === 'en',
    isHindi: currentLanguage === 'hi',
    // Utility functions
    hasTranslation: OfflineTranslationService.hasTranslation.bind(
      OfflineTranslationService,
    ),
    getAllTranslations: OfflineTranslationService.getAllTranslations.bind(
      OfflineTranslationService,
    ),
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
