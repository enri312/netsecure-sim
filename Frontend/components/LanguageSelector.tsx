import React from 'react';
import { useTranslation } from 'react-i18next';
import { availableLanguages, changeLanguage, getCurrentLanguage } from '../i18n';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
    className?: string;
    showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    className = '',
    showLabel = false
}) => {
    const { t } = useTranslation();
    const currentLang = getCurrentLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        changeLanguage(e.target.value);
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && (
                <label className="text-xs text-slate-400 uppercase font-bold">
                    {t('settings.language')}
                </label>
            )}
            <div className="relative flex items-center">
                <Globe className="absolute left-2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                    value={currentLang}
                    onChange={handleChange}
                    className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-8 pr-8 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                    {availableLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;
