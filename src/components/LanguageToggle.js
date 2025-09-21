// src/components/LanguageToggle.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from '../context/TranslationContext';

export const LanguageToggle = ({ style, compact = false }) => {
  const { currentLanguage, toggleLanguage, isLoading } = useTranslation();

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={toggleLanguage}
        disabled={isLoading}
      >
        <Text style={styles.compactText}>
          {currentLanguage === 'hi' ? 'EN' : 'हि'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleLanguage}
      disabled={isLoading}
    >
      <View style={styles.toggle}>
        <Text
          style={[styles.language, currentLanguage === 'en' && styles.active]}
        >
          EN
        </Text>
        <Text style={styles.separator}>|</Text>
        <Text
          style={[styles.language, currentLanguage === 'hi' && styles.active]}
        >
          हि
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Language selector with flags
export const LanguageSelector = ({ onSelect, style }) => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  ];

  const handleSelect = async languageCode => {
    await changeLanguage(languageCode);
    if (onSelect) onSelect(languageCode);
  };

  return (
    <View style={[styles.selectorContainer, style]}>
      {languages.map(language => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageOption,
            currentLanguage === language.code && styles.selectedOption,
          ]}
          onPress={() => handleSelect(language.code)}
        >
          <Text style={styles.flag}>{language.flag}</Text>
          <View style={styles.languageInfo}>
            <Text
              style={[
                styles.languageName,
                currentLanguage === language.code && styles.selectedText,
              ]}
            >
              {language.name}
            </Text>
            <Text style={styles.nativeText}>{language.native}</Text>
          </View>
          {currentLanguage === language.code && (
            <Text style={styles.checkMark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compactContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  compactText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  language: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  active: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  separator: {
    marginHorizontal: 8,
    color: '#ccc',
  },
  selectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedText: {
    color: '#007AFF',
  },
  nativeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkMark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
