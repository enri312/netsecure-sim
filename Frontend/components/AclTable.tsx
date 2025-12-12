import React, { useState } from 'react';
import { ACLRule, Action, Protocol, VLAN } from '../types';
import { ShieldAlert, ShieldCheck, Plus, Trash2 } from 'lucide-react';

interface AclTableProps {
  rules: ACLRule[];
  vlans: VLAN[];
  onAddRule: (rule: Omit<ACLRule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
}

export const AclTable: React.FC<AclTableProps> = ({ rules, vlans, onAddRule, onDeleteRule }) => {
  const [newRule, setNewRule] = useState<Partial<ACLRule>>({
    protocol: Protocol.TCP,
    action: Action.ALLOW
  });

  const handleAdd = () => {
    if (newRule.srcVlanId && newRule.dstVlanId && newRule.action && newRule.protocol) {
      onAddRule({
        srcVlanId: newRule.srcVlanId,
        dstVlanId: newRule.dstVlanId,
        action: newRule.action,
        protocol: newRule.protocol,
        description: newRule.description || 'Regla definida por usuario'
      });
      setNewRule({ ...newRule, description: '' });
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 backdrop-blur-sm z-10">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <ShieldCheck className="text-emerald-400" />
          Políticas de Firewall (ACLs)
        </h2>
        
        {/* Simple Add Form */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end bg-slate-900/50 p-3 rounded-lg border border-slate-700">
          <div className="sm:col-span-1">
            <label className="text-[10px] uppercase text-slate-400 font-bold">Origen</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5 focus:ring-1 focus:ring-blue-500"
              onChange={(e) => setNewRule({...newRule, srcVlanId: Number(e.target.value)})}
              value={newRule.srcVlanId || ''}
            >
              <option value="">Seleccionar</option>
              {vlans.map(v => <option key={v.id} value={v.vlanId}>VLAN {v.vlanId} ({v.name})</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="text-[10px] uppercase text-slate-400 font-bold">Destino</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5 focus:ring-1 focus:ring-blue-500"
              onChange={(e) => setNewRule({...newRule, dstVlanId: Number(e.target.value)})}
              value={newRule.dstVlanId || ''}
            >
              <option value="">Seleccionar</option>
              {vlans.map(v => <option key={v.id} value={v.vlanId}>VLAN {v.vlanId} ({v.name})</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="text-[10px] uppercase text-slate-400 font-bold">Protocolo</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5 focus:ring-1 focus:ring-blue-500"
              onChange={(e) => setNewRule({...newRule, protocol: e.target.value as Protocol})}
              value={newRule.protocol}
            >
              {Object.values(Protocol).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
           <div className="sm:col-span-1">
            <label className="text-[10px] uppercase text-slate-400 font-bold">Acción</label>
            <select 
              className={`w-full border border-slate-700 text-xs rounded p-1.5 font-bold ${newRule.action === Action.ALLOW ? 'text-emerald-400 bg-emerald-950/30' : 'text-red-400 bg-red-950/30'}`}
              onChange={(e) => setNewRule({...newRule, action: e.target.value as Action})}
              value={newRule.action}
            >
              {Object.values(Action).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
             <label className="text-[10px] uppercase text-slate-400 font-bold">Descripción</label>
             <input 
               type="text" 
               className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5"
               placeholder="Motivo..."
               value={newRule.description || ''}
               onChange={(e) => setNewRule({...newRule, description: e.target.value})}
             />
          </div>
          <button 
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded p-1.5 flex justify-center items-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {rules.length === 0 ? (
           <div className="text-center text-slate-500 py-8 italic">No hay reglas definidas. Tráfico implícitamente denegado.</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-700">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Origen</th>
                <th className="py-2 px-2">Destino</th>
                <th className="py-2 px-2">Proto</th>
                <th className="py-2 px-2">Acción</th>
                <th className="py-2 px-2 hidden md:table-cell">Descripción</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, idx) => (
                <tr key={rule.id} className="border-b border-slate-800 hover:bg-slate-700/50 transition-colors">
                  <td className="py-2 px-2 font-mono text-slate-500 text-xs">{idx + 1}</td>
                  <td className="py-2 px-2">VLAN {rule.srcVlanId}</td>
                  <td className="py-2 px-2">VLAN {rule.dstVlanId}</td>
                  <td className="py-2 px-2 font-mono text-xs">{rule.protocol}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rule.action === Action.ALLOW ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400 text-xs hidden md:table-cell truncate max-w-[150px]">{rule.description}</td>
                  <td className="py-2 px-2 text-right">
                    <button 
                      onClick={() => onDeleteRule(rule.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-900/50">
                <td className="py-2 px-2 font-mono text-slate-500 text-xs">*</td>
                <td className="py-2 px-2 text-slate-500">ANY</td>
                <td className="py-2 px-2 text-slate-500">ANY</td>
                <td className="py-2 px-2 font-mono text-xs text-slate-500">ANY</td>
                <td className="py-2 px-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-red-900/10 text-red-500 border-red-900/30 opacity-70">
                    IMPLICIT DENY
                  </span>
                </td>
                <td className="py-2 px-2 text-slate-600 text-xs hidden md:table-cell italic">Regla por defecto</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};