import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { availableLanguages, changeLanguage, getCurrentLanguage } from '../i18n';
import { ShieldCheck, User, Lock, AlertCircle, Loader2, Globe } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const { t } = useTranslation();
    const { login, isLoading } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    const currentLang = getCurrentLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const success = await login(username, password);

        if (!success) {
            setError(t('login.error'));
        }

        setIsSubmitting(false);
    };

    const handleLanguageChange = (code: string) => {
        changeLanguage(code);
        setShowLangMenu(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 pt-10">
                    {/* Shield Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-1">
                            {t('login.title')}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {t('login.subtitle')}
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {t('login.username')}
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="CENV"
                                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                                    required
                                    autoComplete="username"
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {t('login.password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" strokeWidth={1.5} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                                    required
                                    autoComplete="current-password"
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading || !username || !password}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-blue-600/25 flex items-center justify-center gap-2 mt-6"
                        >
                            {(isSubmitting || isLoading) ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('login.submitting')}
                                </>
                            ) : (
                                t('login.submit')
                            )}
                        </button>
                    </form>

                    {/* Language Selector */}
                    <div className="flex justify-center mt-8">
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-sm font-medium uppercase">{currentLang}</span>
                            </button>

                            {/* Language Dropdown */}
                            {showLangMenu && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                                    {availableLanguages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 ${currentLang === lang.code ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'
                                                }`}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-600 text-xs mt-8">
                        © 2025 NetSecure Systems Inc.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
