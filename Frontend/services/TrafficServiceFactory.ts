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
  private apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:5000/api/simulation') {
    this.apiUrl = apiUrl;
  }

  async simulate(context: TrafficContext): Promise<SimulationLog> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Mapeamos el contexto al DTO que espera C#
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