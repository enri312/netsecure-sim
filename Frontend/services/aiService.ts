import { VLAN, ACLRule, UtmFeatures, ISecurityAnalyzer } from '../types';
import { OllamaSecurityAnalyzer } from './ollamaService';
import { GeminiSecurityAnalyzer } from './geminiService';

export type AIProvider = 'ollama' | 'gemini' | 'none';

/**
 * AI Analyzer Factory - Selects the best available AI provider
 * Priority: Ollama (local/offline) > Gemini (online)
 */
export class AIAnalyzerFactory {
    private ollamaAnalyzer: OllamaSecurityAnalyzer;
    private geminiAnalyzer: GeminiSecurityAnalyzer | null = null;
    private lastProvider: AIProvider = 'none';

    constructor() {
        this.ollamaAnalyzer = new OllamaSecurityAnalyzer();

        // Only create Gemini analyzer if API key is available
        try {
            this.geminiAnalyzer = new GeminiSecurityAnalyzer();
        } catch (error) {
            console.log('Gemini API key not configured, will use Ollama only');
        }
    }

    /**
     * Get the best available analyzer
     * Returns the analyzer and which provider it is
     */
    async getAnalyzer(): Promise<{ analyzer: ISecurityAnalyzer; provider: AIProvider }> {
        // Priority 1: Ollama (local, no internet needed)
        if (await this.ollamaAnalyzer.isAvailable()) {
            this.lastProvider = 'ollama';
            return { analyzer: this.ollamaAnalyzer, provider: 'ollama' };
        }

        // Priority 2: Gemini (requires internet and API key)
        if (this.geminiAnalyzer) {
            try {
                // Simple check - if we can create the client, assume it works
                this.lastProvider = 'gemini';
                return { analyzer: this.geminiAnalyzer, provider: 'gemini' };
            } catch (error) {
                console.log('Gemini not available');
            }
        }

        this.lastProvider = 'none';
        throw new Error('No hay motor de IA disponible. Instale Ollama o configure la API de Gemini.');
    }

    /**
     * Get the last used provider
     */
    getLastProvider(): AIProvider {
        return this.lastProvider;
    }

    /**
     * Check which providers are available
     */
    async checkAvailability(): Promise<{ ollama: boolean; gemini: boolean }> {
        const ollamaAvailable = await this.ollamaAnalyzer.isAvailable();
        const geminiAvailable = this.geminiAnalyzer !== null;

        return {
            ollama: ollamaAvailable,
            gemini: geminiAvailable
        };
    }
}

/**
 * Unified Security Analyzer - Uses the best available AI
 */
export class UnifiedSecurityAnalyzer implements ISecurityAnalyzer {
    private factory: AIAnalyzerFactory;
    private _lastProvider: AIProvider = 'none';

    constructor() {
        this.factory = new AIAnalyzerFactory();
    }

    get lastProvider(): AIProvider {
        return this._lastProvider;
    }

    async analyze(vlans: VLAN[], acls: ACLRule[], utm: UtmFeatures): Promise<string> {
        try {
            const { analyzer, provider } = await this.factory.getAnalyzer();
            this._lastProvider = provider;

            console.log(`Using AI provider: ${provider}`);

            const result = await analyzer.analyze(vlans, acls, utm);

            // Add provider info header
            const providerInfo = provider === 'ollama'
                ? '🖥️ *Análisis generado localmente con Ollama (phi4-mini)*\n\n'
                : '☁️ *Análisis generado con Google Gemini API*\n\n';

            return providerInfo + result;
        } catch (error) {
            console.error('AI analysis error:', error);
            throw error;
        }
    }

    async checkProviders(): Promise<{ ollama: boolean; gemini: boolean }> {
        return this.factory.checkAvailability();
    }
}

// Export singleton instance
export const securityAnalyzer = new UnifiedSecurityAnalyzer();
