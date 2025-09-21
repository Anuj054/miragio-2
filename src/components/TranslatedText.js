// src/components/TranslatedText.js
import React from 'react';
import { Text } from 'react-native';
import { useTranslatedText } from '../hooks/useTranslatedText';

export const TranslatedText = ({ children, style, ...props }) => {
  const { translatedText } = useTranslatedText(children);

  return (
    <Text style={style} {...props}>
      {translatedText}
    </Text>
  );
};

// Alternative component for when you want to pass both English and Hindi directly
export const BilingualText = ({ english, hindi, style, ...props }) => {
  const { currentLanguage } = useTranslation();

  const text = currentLanguage === 'hi' ? hindi : english;

  return (
    <Text style={style} {...props}>
      {text}
    </Text>
  );
};

export default TranslatedText;
