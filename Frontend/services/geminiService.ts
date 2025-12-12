import { GoogleGenAI } from "@google/genai";
import { VLAN, ACLRule, UtmFeatures, ISecurityAnalyzer } from "../types";

export class GeminiSecurityAnalyzer implements ISecurityAnalyzer {
  private apiKey: string;

  constructor() {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API Key is missing.");
    this.apiKey = key;
  }

  private getClient() {
    return new GoogleGenAI({ apiKey: this.apiKey });
  }

  async analyze(vlans: VLAN[], acls: ACLRule[], utm: UtmFeatures): Promise<string> {
    try {
      const ai = this.getClient();
      
      const context = {
        vlans: vlans.map(v => ({ id: v.vlanId, name: v.name, subnet: v.subnet })),
        acls: acls.map(r => ({ src: r.srcVlanId, dst: r.dstVlanId, action: r.action, proto: r.protocol })),
        utmFeaturesEnabled: utm
      };

      const prompt = `
        Actúa como un ingeniero senior de seguridad de redes (CISO). 
        Analiza la siguiente configuración de red de una pequeña empresa simulada.
        
        Configuración (JSON):
        ${JSON.stringify(context, null, 2)}
        
        Por favor proporciona:
        1. Un análisis de vulnerabilidades potenciales basado en las reglas actuales (ACLs) y segmentación.
        2. Recomendaciones específicas para mejorar la postura de seguridad (Zero Trust, Principio de menor privilegio).
        3. Comentarios sobre la configuración del Firewall UTM.
        
        Responde en formato Markdown, sé conciso pero profesional. Usa español.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      return response.text || "No se pudo generar el análisis.";
    } catch (error) {
      console.error("Error calling Gemini:", error);
      return "Error al conectar con el asistente de IA. Verifique su clave API.";
    }
  }
}

// Singleton instance or factory could be exported, but class allows DI.
export const securityAnalyzer = new GeminiSecurityAnalyzer();