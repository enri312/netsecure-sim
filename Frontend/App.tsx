import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { useNetworkSimulation } from './hooks/useNetworkSimulation';
import { VlanDisplay } from './components/VlanDisplay';
import { AclTable } from './components/AclTable';
import { SimulationPanel } from './components/SimulationPanel';
import { Terminal, ShieldCheck, BrainCircuit, XCircle, CheckCircle, AlertTriangle, LogOut, User } from 'lucide-react';

// Import i18n configuration
import './i18n';

// Main Application Content (after login)
function AppContent() {
  const { t } = useTranslation();
  const { user, logout, hasPermission } = useAuth();

  // Use Custom Hook (Controller)
  const {
    vlans,
    acls,
    logs,
    utm,
    aiAnalysis,
    isAnalyzing,
    isSimulating,
    simulationError,
    executionMode,
    setExecutionMode,
    apiUrl,
    setApiUrl,
    setUtm,
    addAcl,
    deleteAcl,
    runSimulation,
    runAnalysis,
    clearAnalysis
  } = useNetworkSimulation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              {t('common.appName')}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">{t('common.appSubtitle')}</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          {/* AI Analysis Button */}
          {hasPermission('analyze:ai') && (
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-lg font-medium transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 text-white"
            >
              <BrainCircuit className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
              {isAnalyzing ? t('header.analyzing') : t('header.aiAnalysis')}
            </button>
          )}

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{user?.username}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${user?.role === 'admin' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                {t(`header.role.${user?.role === 'admin' ? 'admin' : 'technician'}`)}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Network & Simulation (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Network Visualization */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-300">{t('vlans.title')}</h2>
            <VlanDisplay vlans={vlans} />
          </section>

          {/* ACL Management */}
          <section className="h-[400px]">
            <AclTable rules={acls} vlans={vlans} onAddRule={addAcl} onDeleteRule={deleteAcl} />
          </section>

        </div>

        {/* Right Column: Controls & Logs (4 cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">

          {/* Controls */}
          <section className="flex-shrink-0">
            <SimulationPanel
              vlans={vlans}
              onSimulate={runSimulation}
              utm={utm}
              setUtm={setUtm}
              isSimulating={isSimulating}
              simulationError={simulationError}
              executionMode={executionMode}
              setExecutionMode={setExecutionMode}
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
            />
          </section>

          {/* Console Output */}
          <section className="flex-1 min-h-[300px] bg-slate-900 rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-inner shadow-black/50">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h3 className="font-mono text-sm font-bold text-slate-300">{t('logs.title')}</h3>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${executionMode === 'DOTNET_API' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                {executionMode === 'LOCAL' ? t('logs.localEngine') : t('logs.dotnetEngine')}
              </span>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2 font-mono text-xs">
              {logs.length === 0 && (
                <div className="text-slate-600 text-center mt-10">{t('logs.waiting')}</div>
              )}
              {logs.map(log => (
                <div key={log.id} className="p-2 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>[{log.timestamp}]</span>
                    <span className="font-bold">{log.protocol}</span>
                  </div>
                  <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mb-1">
                    <span className="text-blue-300 truncate">{log.srcDevice}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-purple-300 truncate text-right">{log.dstDevice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.result === 'SUCCESS' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                    {log.result === 'BLOCKED' && <XCircle className="w-3 h-3 text-red-500" />}
                    {log.result === 'UTM_BLOCKED' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                    <span className={`
                      ${log.result === 'SUCCESS' ? 'text-emerald-500' : ''}
                      ${log.result === 'BLOCKED' ? 'text-red-500' : ''}
                      ${log.result === 'UTM_BLOCKED' ? 'text-yellow-500' : ''}
                    `}>
                      {t(`simulation.result.${log.result === 'SUCCESS' ? 'success' : log.result === 'BLOCKED' ? 'blocked' : 'utmBlocked'}`)}: {log.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* AI Analysis Modal / Overlay */}
      {aiAnalysis && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-600 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-xl">
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <BrainCircuit /> {t('ai.title')}
              </h2>
              <button onClick={clearAnalysis} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto text-slate-300 prose prose-invert prose-sm max-w-none leading-relaxed">
              {aiAnalysis.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-blue-300 mt-3 mb-1">{line.replace('### ', '')}</h3>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-slate-500">{line.replace('- ', '')}</li>;
                if (line.match(/^\d\./)) return <li key={i} className="ml-4 list-decimal marker:text-slate-500">{line.replace(/^\d\.\s/, '')}</li>;
                return <p key={i} className="mb-2">{line}</p>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Root App Component with Auth Check
function AppWithAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main app
  return <AppContent />;
}

// Main App Component with Providers
export default function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}