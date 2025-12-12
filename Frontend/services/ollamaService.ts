import { VLAN, ACLRule, UtmFeatures, ISecurityAnalyzer } from '../types';

/**
 * Ollama Security Analyzer - Uses local Ollama with phi4-mini model
 * Provides offline AI analysis capability
 */
export class OllamaSecurityAnalyzer implements ISecurityAnalyzer {
    private baseUrl: string;
    private model: string;

    constructor(baseUrl: string = 'http://localhost:11434', model: string = 'phi4-mini') {
        this.baseUrl = baseUrl;
        this.model = model;
    }

    /**
     * Check if Ollama is running and the model is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000) // 3 second timeout
            });

            if (!response.ok) return false;

            const data = await response.json();
            // Check if phi4-mini model is available
            const models = data.models || [];
            return models.some((m: { name: string }) =>
                m.name.toLowerCase().includes('phi4') || m.name.toLowerCase().includes('phi-4')
            );
        } catch (error) {
            console.log('Ollama not available:', error);
            return false;
        }
    }

    /**
     * Analyze network configuration using Ollama
     */
    async analyze(vlans: VLAN[], acls: ACLRule[], utm: UtmFeatures): Promise<string> {
        const context = {
            vlans: vlans.map(v => ({ id: v.vlanId, name: v.name, subnet: v.subnet, deviceCount: v.devices.length })),
            acls: acls.map(r => ({ src: r.srcVlanId, dst: r.dstVlanId, action: r.action, proto: r.protocol })),
            utmFeaturesEnabled: utm
        };

        const prompt = `Actúa como un ingeniero senior de seguridad de redes (CISO). 
Analiza la siguiente configuración de red de una pequeña empresa simulada.

Configuración (JSON):
${JSON.stringify(context, null, 2)}

Por favor proporciona:
1. Un análisis de vulnerabilidades potenciales basado en las reglas actuales (ACLs) y segmentación.
2. Recomendaciones específicas para mejorar la postura de seguridad (Zero Trust, Principio de menor privilegio).
3. Comentarios sobre la configuración del Firewall UTM.

Responde en formato Markdown, sé conciso pero profesional. Usa español.`;

        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 1024
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response || 'No se pudo generar el análisis.';
        } catch (error) {
            console.error('Error calling Ollama:', error);
            throw new Error('Error al conectar con Ollama. Verifique que esté ejecutándose.');
        }
    }
}

// Singleton instance
export const ollamaAnalyzer = new OllamaSecurityAnalyzer();
