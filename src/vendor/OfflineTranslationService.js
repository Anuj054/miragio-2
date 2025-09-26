// src/vendor/OfflineTranslationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_TRANSLATIONS } from '../constants/translations';

// Common app translations dictionary
const TRANSLATION_DICTIONARY = {
  // Navigation
  Home: 'होम',
  Profile: 'प्रोफाइल',
  Settings: 'सेटिंग्स',
  Back: 'वापस',
  Next: 'अगला',
  Cancel: 'रद्द करें',
  Save: 'सेव करें',
  Delete: 'डिलीट करें',
  Edit: 'एडिट करें',
  Search: 'खोजें',
  Filter: 'फिल्टर',
  Sort: 'सॉर्ट करें',

  // Authentication
  Login: 'लॉगिन',
  Logout: 'लॉगआउट',
  'Sign Up': 'साइन अप',
  'Sign In': 'साइन इन',
  Register: 'रजिस्टर करें',
  'Forgot Password': 'पासवर्ड भूल गए',
  'Reset Password': 'पासवर्ड रीसेट करें',
  'Change Password': 'पासवर्ड बदलें',

  // Common Actions
  Submit: 'सबमिट करें',
  Continue: 'जारी रखें',
  Confirm: 'कन्फर्म करें',
  'Try Again': 'फिर से कोशिश करें',
  Refresh: 'रिफ्रेश करें',
  Update: 'अपडेट करें',
  Upload: 'अपलोड करें',
  Download: 'डाउनलोड करें',
  Share: 'शेयर करें',
  Copy: 'कॉपी करें',
  Paste: 'पेस्ट करें',

  // Messages & Status
  'Loading...': 'लोड हो रहा है...',
  'Please wait...': 'कृपया प्रतीक्षा करें...',
  Success: 'सफल',
  Error: 'त्रुटि',
  Warning: 'चेतावनी',
  Information: 'जानकारी',
  'No data found': 'कोई डेटा नहीं मिला',
  'No results': 'कोई परिणाम नहीं',
  'Connection failed': 'कनेक्शन फेल',
  'Network error': 'नेटवर्क एरर',
  'Something went wrong': 'कुछ गलत हुआ',

  // Forms
  Name: 'नाम',
  'Full Name': 'पूरा नाम',
  'First Name': 'पहला नाम',
  'Last Name': 'अंतिम नाम',
  Email: 'ईमेल',
  'Email Address': 'ईमेल पता',
  Password: 'पासवर्ड',
  'Confirm Password': 'पासवर्ड कन्फर्म करें',
  Phone: 'फोन',
  'Phone Number': 'फोन नंबर',
  Mobile: 'मोबाइल',
  Address: 'पता',
  City: 'शहर',
  State: 'राज्य',
  Country: 'देश',
  Pincode: 'पिनकोड',
  'Date of Birth': 'जन्म तिथि',
  Gender: 'लिंग',
  Male: 'पुरुष',
  Female: 'महिला',
  Other: 'अन्य',

  // Validation Messages
  'Required field': 'आवश्यक फील्ड',
  'This field is required': 'यह फील्ड आवश्यक है',
  'Invalid email': 'अमान्य ईमेल',
  'Invalid phone number': 'अमान्य फोन नंबर',
  'Password too short': 'पासवर्ड बहुत छोटा',
  'Passwords do not match': 'पासवर्ड मैच नहीं करते',
  'Please enter valid data': 'कृपया वैध डेटा दर्ज करें',

  // Time & Date
  Today: 'आज',
  Yesterday: 'कल',
  Tomorrow: 'कल',
  Now: 'अभी',
  Date: 'तारीख',
  Time: 'समय',
  Morning: 'सुबह',
  Afternoon: 'दोपहर',
  Evening: 'शाम',
  Night: 'रात',
  Monday: 'सोमवार',
  Tuesday: 'मंगलवार',
  Wednesday: 'बुधवार',
  Thursday: 'गुरुवार',
  Friday: 'शुक्रवार',
  Saturday: 'शनिवार',
  Sunday: 'रविवार',

  // Numbers (common ones)
  One: 'एक',
  Two: 'दो',
  Three: 'तीन',
  Four: 'चार',
  Five: 'पांच',
  Ten: 'दस',
  Hundred: 'सौ',
  Thousand: 'हजार',

  // App specific (based on your folders)
  Task: 'कार्य',
  Tasks: 'कार्य',
  'My Tasks': 'मेरे कार्य',
  'Add Task': 'कार्य जोड़ें',
  'New Task': 'नया कार्य',
  'Task Title': 'कार्य शीर्षक',
  'Task Description': 'कार्य विवरण',
  Priority: 'प्राथमिकता',
  High: 'उच्च',
  Medium: 'मध्यम',
  Low: 'निम्न',
  Status: 'स्थिति',
  Pending: 'लंबित',
  'In Progress': 'प्रगति में',
  Completed: 'पूर्ण',
  'Due Date': 'नियत तारीख',

  Wallet: 'वॉलेट',
  Balance: 'बैलेंस',
  Transaction: 'लेनदेन',
  Payment: 'भुगतान',
  Amount: 'राशि',
  'Send Money': 'पैसे भेजें',
  'Receive Money': 'पैसे प्राप्त करें',
  Transfer: 'स्थानांतरण',

  More: 'और',
  About: 'के बारे में',
  Help: 'सहायता',
  Support: 'सपोर्ट',
  Contact: 'संपर्क',
  Terms: 'नियम',
  Privacy: 'गोपनीयता',
  Version: 'संस्करण',

  // Common Phrases
  Welcome: 'स्वागत है',
  'Welcome back': 'वापस स्वागत है',
  'Good morning': 'सुप्रभात',
  'Good afternoon': 'नमस्ते',
  'Good evening': 'शुभ संध्या',
  'Good night': 'शुभ रात्रि',
  'Thank you': 'धन्यवाद',
  Please: 'कृपया',
  Yes: 'हाँ',
  No: 'नहीं',
  OK: 'ठीक है',
  Done: 'हो गया',
  Close: 'बंद करें',
  Open: 'खोलें',
  View: 'देखें',
  Details: 'विवरण',
  Total: 'कुल',
  Count: 'गिनती',
  Select: 'चुनें',
  Choose: 'चुनें',
  Pick: 'चुनें',
  Language: 'भाषा',
};

class OfflineTranslationService {
  constructor() {
    this.dictionary = APP_TRANSLATIONS;
    this.currentLanguage = 'en';
    this.customTranslations = new Map();
  }

  async init() {
    try {
      const savedLanguage = await AsyncStorage.getItem('currentLanguage');
      const customTranslations = await AsyncStorage.getItem(
        'customTranslations',
      );

      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
        this.currentLanguage = savedLanguage;
      }

      if (customTranslations) {
        const parsed = JSON.parse(customTranslations);
        Object.entries(parsed).forEach(([key, value]) => {
          this.customTranslations.set(key, value);
        });
      }
    } catch (error) {
      console.error('Failed to load offline translations:', error);
    }
  }

  async setLanguage(languageCode) {
    if (languageCode !== 'en' && languageCode !== 'hi') {
      console.warn('Only English (en) and Hindi (hi) are supported');
      return;
    }
    this.currentLanguage = languageCode;
    await AsyncStorage.setItem('currentLanguage', languageCode);
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  translateText(text, targetLang = this.currentLanguage) {
    if (!text || typeof text !== 'string') return text;

    const cleanText = text.trim();
    if (!cleanText) return text;

    // If target is English, return as is for English text
    if (targetLang === 'en') {
      return this.isHindiText(cleanText)
        ? this.hindiToEnglish(cleanText)
        : text;
    }

    // If target is Hindi, translate English to Hindi
    if (targetLang === 'hi') {
      return this.isHindiText(cleanText)
        ? text
        : this.englishToHindi(cleanText);
    }

    return text;
  }

  englishToHindi(text) {
    const cleanText = text.trim();

    // Check custom translations first
    if (this.customTranslations.has(cleanText.toLowerCase())) {
      return this.customTranslations.get(cleanText.toLowerCase());
    }

    // Check dictionary
    if (this.dictionary[cleanText]) {
      return this.dictionary[cleanText];
    }

    // Try case-insensitive match
    const lowerText = cleanText.toLowerCase();
    const dictionaryKey = Object.keys(this.dictionary).find(
      key => key.toLowerCase() === lowerText,
    );

    if (dictionaryKey) {
      return this.dictionary[dictionaryKey];
    }

    // If no translation found, return original text
    return text;
  }

  hindiToEnglish(text) {
    const cleanText = text.trim();

    // Reverse lookup in dictionary
    const englishKey = Object.keys(this.dictionary).find(
      key => this.dictionary[key] === cleanText,
    );

    if (englishKey) {
      return englishKey;
    }

    // Check custom translations (reverse lookup)
    for (const [english, hindi] of this.customTranslations.entries()) {
      if (hindi === cleanText) {
        return english;
      }
    }

    return text;
  }

  async translateBatch(texts, targetLang = this.currentLanguage) {
    if (!texts || texts.length === 0) return texts;

    return texts.map(text => this.translateText(text, targetLang));
  }

  isHindiText(text) {
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text);
  }

  async toggleLanguage() {
    const newLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
    await this.setLanguage(newLanguage);
    return newLanguage;
  }

  // Add custom translation
  async addCustomTranslation(english, hindi) {
    this.customTranslations.set(english.toLowerCase(), hindi);
    await this.saveCustomTranslations();
  }

  async saveCustomTranslations() {
    try {
      const customObj = Object.fromEntries(this.customTranslations);
      await AsyncStorage.setItem(
        'customTranslations',
        JSON.stringify(customObj),
      );
    } catch (error) {
      console.error('Failed to save custom translations:', error);
    }
  }

  // Get all available translations
  getAllTranslations() {
    const all = { ...this.dictionary };
    for (const [key, value] of this.customTranslations.entries()) {
      all[key] = value;
    }
    return all;
  }

  // Check if translation exists
  hasTranslation(text) {
    const cleanText = text.trim().toLowerCase();
    return this.dictionary[cleanText] || this.customTranslations.has(cleanText);
  }
}

export default new OfflineTranslationService();
