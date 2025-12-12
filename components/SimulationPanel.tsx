import React, { useState } from 'react';
    import { VLAN, Device, Protocol, UtmFeatures, ExecutionMode } from '../types';
    import { Play, Activity, Shield, Settings, Server, Globe } from 'lucide-react';
    
    interface SimulationPanelProps {
      vlans: VLAN[];
      onSimulate: (srcId: string, dstId: string, protocol: Protocol) => void;
      utm: UtmFeatures;
      setUtm: React.Dispatch<React.SetStateAction<UtmFeatures>>;
      isSimulating: boolean;
      simulationError: string | null;
      executionMode: ExecutionMode;
      setExecutionMode: (mode: ExecutionMode) => void;
      apiUrl: string;
      setApiUrl: (url: string) => void;
    }
    
    export const SimulationPanel: React.FC<SimulationPanelProps> = ({ 
      vlans, 
      onSimulate, 
      utm, 
      setUtm,
      isSimulating,
      simulationError,
      executionMode,
      setExecutionMode,
      apiUrl,
      setApiUrl
    }) => {
      const [srcId, setSrcId] = useState<string>('');
      const [dstId, setDstId] = useState<string>('');
      const [protocol, setProtocol] = useState<Protocol>(Protocol.ICMP);
      const [showSettings, setShowSettings] = useState(false);
    
      // Flatten devices for easy selection
      const allDevices = vlans.flatMap(v => v.devices.map(d => ({ ...d, vlanId: v.vlanId, vlanName: v.name })));
    
      const handleSimulate = () => {
        if (!srcId || !dstId) return;
        onSimulate(srcId, dstId, protocol);
      };
    
      const toggleUtm = (key: keyof UtmFeatures) => {
        setUtm(prev => ({ ...prev, [key]: !prev[key] }));
      };
    
      return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="text-blue-400" />
                Simulador
              </h2>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${showSettings ? 'text-blue-400 bg-slate-700' : 'text-slate-400'}`}
                title="Configuración de Ejecución (.NET)"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Configuración de Backend (.NET) */}
            {showSettings && (
              <div className="mb-4 p-3 bg-slate-900/80 rounded border border-slate-600 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Motor de Ejecución</label>
                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={() => setExecutionMode('LOCAL')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded text-xs font-bold border ${executionMode === 'LOCAL' ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-800'}`}
                  >
                    <Globe className="w-3 h-3" /> Browser (JS)
                  </button>
                  <button 
                    onClick={() => setExecutionMode('DOTNET_API')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded text-xs font-bold border ${executionMode === 'DOTNET_API' ? 'bg-blue-900/40 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-800'}`}
                  >
                    <Server className="w-3 h-3" /> .NET Core
                  </button>
                </div>
                
                {executionMode === 'DOTNET_API' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">URL API .NET</label>
                    <input 
                      type="text" 
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs p-2 rounded text-slate-300 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Controles Principales */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Origen (Source)</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500"
                  value={srcId}
                  onChange={(e) => setSrcId(e.target.value)}
                >
                  <option value="">Seleccionar dispositivo...</option>
                  {allDevices.map(d => (
                    <option key={d.id} value={d.id}>[{d.vlanId}] {d.name} ({d.ip})</option>
                  ))}
                </select>
              </div>
    
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Destino (Dest)</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500"
                  value={dstId}
                  onChange={(e) => setDstId(e.target.value)}
                >
                  <option value="">Seleccionar dispositivo...</option>
                  {allDevices.map(d => (
                    <option key={d.id} value={d.id}>[{d.vlanId}] {d.name} ({d.ip})</option>
                  ))}
                </select>
              </div>
    
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Protocolo</label>
                <div className="flex gap-2">
                  {Object.values(Protocol).filter(p => p !== Protocol.ANY).map(p => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                        protocol === p 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
    
              <button 
                onClick={handleSimulate}
                disabled={!srcId || !dstId || isSimulating}
                className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all shadow-lg ${
                  isSimulating 
                    ? 'bg-blue-400 scale-95' 
                    : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Play className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} fill="currentColor" />
                {isSimulating ? 'PROCESANDO...' : `EJECUTAR (${executionMode === 'LOCAL' ? 'JS' : '.NET'})`}
              </button>

              {simulationError && (
                 <div className="text-xs text-red-400 bg-red-950/30 p-2 rounded border border-red-900 mt-2">
                    Error: {simulationError}
                 </div>
              )}
            </div>
          </div>
    
          <div className="border-t border-slate-700 pt-4 mt-auto">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-300">
              <Shield className="w-4 h-4 text-purple-400" />
              Módulos UTM Firewall
            </h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-700 cursor-pointer hover:bg-slate-900">
                <span className="text-sm text-slate-400">IPS (Intrusion Prev.)</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${utm.ips ? 'bg-purple-600' : 'bg-slate-700'}`} onClick={() => toggleUtm('ips')}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${utm.ips ? 'left-6' : 'left-1'}`} />
                </div>
              </label>
              <label className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-700 cursor-pointer hover:bg-slate-900">
                <span className="text-sm text-slate-400">Anti-Virus (Gateway)</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${utm.av ? 'bg-purple-600' : 'bg-slate-700'}`} onClick={() => toggleUtm('av')}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${utm.av ? 'left-6' : 'left-1'}`} />
                </div>
              </label>
               <label className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-700 cursor-pointer hover:bg-slate-900">
                <span className="text-sm text-slate-400">Web Filter</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${utm.webFilter ? 'bg-purple-600' : 'bg-slate-700'}`} onClick={() => toggleUtm('webFilter')}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${utm.webFilter ? 'left-6' : 'left-1'}`} />
                </div>
              </label>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
              *En modo .NET, estos flags se envían al backend para que el motor C# decida el bloqueo.
            </p>
          </div>
        </div>
      );
    };