import { useState, useCallback, useMemo } from 'react';
import { VLAN, ACLRule, SimulationLog, Protocol, UtmFeatures, ExecutionMode, ITrafficService } from '../types';
import { INITIAL_VLANS, INITIAL_ACLS } from '../constants';
import { LocalTrafficService, DotNetTrafficService } from '../services/TrafficServiceFactory';
import { securityAnalyzer } from '../services/aiService';

export const useNetworkSimulation = () => {
  // Application State
  const [vlans] = useState<VLAN[]>(INITIAL_VLANS);
  const [acls, setAcls] = useState<ACLRule[]>(INITIAL_ACLS);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [utm, setUtm] = useState<UtmFeatures>({ ips: false, av: false, webFilter: false });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'ollama' | 'gemini' | 'none'>('none');

  // Architecture Configuration
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('LOCAL');
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api/simulation');

  // Service Factory (Memoized)
  const trafficService: ITrafficService = useMemo(() => {
    if (executionMode === 'DOTNET_API') {
      return new DotNetTrafficService(apiUrl);
    }
    return new LocalTrafficService();
  }, [executionMode, apiUrl]);

  // Actions
  const addAcl = useCallback((rule: Omit<ACLRule, 'id'>) => {
    const newRule: ACLRule = { ...rule, id: `r${Date.now()}` };
    setAcls(prev => [...prev, newRule]);
  }, []);

  const deleteAcl = useCallback((id: string) => {
    setAcls(prev => prev.filter(r => r.id !== id));
  }, []);

  const runSimulation = useCallback(async (srcId: string, dstId: string, protocol: Protocol) => {
    setIsSimulating(true);
    setSimulationError(null);
    try {
      // Build Context DTO
      const context = {
        srcId,
        dstId,
        protocol,
        vlans,
        acls,
        utm
      };

      // Call Service (Local or DotNet)
      const log = await trafficService.simulate(context);

      setLogs(prev => [log, ...prev].slice(0, 50));
    } catch (e) {
      console.error("Simulation failed", e);
      setSimulationError(e instanceof Error ? e.message : "Error desconocido en simulación");
    } finally {
      setIsSimulating(false);
    }
  }, [trafficService, vlans, acls, utm]);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    setAiProvider('none');

    try {
      const result = await securityAnalyzer.analyze(vlans, acls, utm);
      setAiAnalysis(result);
      setAiProvider(securityAnalyzer.lastProvider);
    } catch (error) {
      console.error('AI Analysis error:', error);
      setAiAnalysis(error instanceof Error
        ? `Error: ${error.message}`
        : 'Error al ejecutar análisis de IA. Verifique Ollama o la API de Gemini.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [vlans, acls, utm]);

  const clearAnalysis = useCallback(() => setAiAnalysis(''), []);

  return {
    // Data
    vlans,
    acls,
    logs,
    utm,
    aiAnalysis,
    aiProvider,

    // Status
    isAnalyzing,
    isSimulating,
    simulationError,

    // Config
    executionMode,
    apiUrl,
    setExecutionMode,
    setApiUrl,

    // Actions
    setUtm,
    addAcl,
    deleteAcl,
    runSimulation,
    runAnalysis,
    clearAnalysis
  };
};