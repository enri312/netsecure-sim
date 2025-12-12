import { useState, useCallback, useMemo, useEffect } from 'react';
import { VLAN, ACLRule, SimulationLog, Protocol, UtmFeatures, ExecutionMode, ITrafficService } from '../types';
import { LocalTrafficService, DotNetTrafficService } from '../services/TrafficServiceFactory';
import { securityAnalyzer } from '../services/aiService';
import { backendService } from '../services/backendService';
import { useAuth } from '../contexts/AuthContext';

export const useNetworkSimulation = () => {
  const { isAuthenticated } = useAuth();

  // Application State
  const [vlans, setVlans] = useState<VLAN[]>([]);
  const [acls, setAcls] = useState<ACLRule[]>([]);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [utm, setUtm] = useState<UtmFeatures>({ ips: false, av: false, webFilter: false });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'ollama' | 'gemini' | 'none'>('none');

  // Architecture Configuration - Default to DOTNET_API
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('DOTNET_API');
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5009/api');

  // Load initial data from backend
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const topoData = await backendService.getTopology();
          setVlans(topoData.vlans);

          const aclData = await backendService.getAcls();
          setAcls(aclData);
        } catch (error) {
          console.error('Failed to load initial data:', error);
        }
      };
      loadData();
    }
  }, [isAuthenticated]);

  // Service Factory (Memoized)
  const trafficService: ITrafficService = useMemo(() => {
    if (executionMode === 'DOTNET_API') {
      return new DotNetTrafficService(apiUrl); // Pass the base API URL
    }
    return new LocalTrafficService();
  }, [executionMode, apiUrl]);

  // Actions
  const addAcl = useCallback(async (rule: Omit<ACLRule, 'id'>) => {
    try {
      if (executionMode === 'DOTNET_API') {
        const newRule = await backendService.addAcl(rule);
        setAcls(prev => [...prev, newRule]);
      } else {
        // Local fallback
        const newRule: ACLRule = { ...rule, id: `r${Date.now()}` };
        setAcls(prev => [...prev, newRule]);
      }
    } catch (error) {
      console.error('Failed to add ACL:', error);
      alert('Error al agregar regla ACL en el backend');
    }
  }, [executionMode]);

  const deleteAcl = useCallback(async (id: string | number) => {
    try {
      if (executionMode === 'DOTNET_API') {
        await backendService.deleteAcl(id);
        setAcls(prev => prev.filter(r => r.id !== id));
      } else {
        setAcls(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete ACL:', error);
      alert('Error al eliminar regla ACL');
    }
  }, [executionMode]);

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