import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import es from './es.json';
import en from './en.json';

const resources = {
    es: { translation: es },
    en: { translation: en }
};

i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Init i18next
    .init({
        resources,
        fallbackLng: 'es', // Default to Spanish
        supportedLngs: ['es', 'en'],

        // Language detection options
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: 'netsecure_language',
            caches: ['localStorage']
        },

        interpolation: {
            escapeValue: false // React already escapes values
        },

        react: {
            useSuspense: false // Disable suspense for better SSR compatibility
        }
    });

export default i18n;

// Helper to get available languages
export const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
];

// Helper to change language
export const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('netsecure_language', lng);
};

// Get current language
export const getCurrentLanguage = () => i18n.language || 'es';
