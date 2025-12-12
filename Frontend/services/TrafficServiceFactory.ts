import { ITrafficService, TrafficContext, SimulationLog, EvaluationResult } from '../types';
import { TrafficEngine } from '../core/TrafficEngine';

/**
 * Servicio Local: Ejecuta la lógica en el navegador usando TypeScript.
 * Útil para pruebas offline y latencia cero.
 */
export class LocalTrafficService implements ITrafficService {
  private engine: TrafficEngine;

  constructor() {
    this.engine = new TrafficEngine();
  }

  async simulate(context: TrafficContext): Promise<SimulationLog> {
    // Simulamos un pequeño delay para imitar asincronía real
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.engine.simulate(context);
  }
}

/**
 * Servicio .NET: Envía los datos a una API REST en C# .NET 10.
 * Espera que el backend esté corriendo en localhost:5000 por defecto.
 */
export class DotNetTrafficService implements ITrafficService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5009/api') {
    this.baseUrl = baseUrl;
  }

  async simulate(context: TrafficContext): Promise<SimulationLog> {
    try {
      const storedAuth = localStorage.getItem('netsecure_auth');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (storedAuth) {
        const { token } = JSON.parse(storedAuth);
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Append specific endpoint
      const response = await fetch(`${this.baseUrl}/simulation`, {
        method: 'POST',
        headers,
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor .NET: ${response.statusText}`);
      }

      const result: SimulationLog = await response.json();
      return result;
    } catch (error) {
      console.error("Error conectando con .NET API:", error);
      throw error;
    }
  }
}