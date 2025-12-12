import React from 'react';
import { VLAN, Device } from '../types';
import { Network, Server, Laptop, Printer, Video } from 'lucide-react';

interface VlanDisplayProps {
  vlans: VLAN[];
}

const getDeviceIcon = (type: Device['type']) => {
  switch (type) {
    case 'SERVER': return <Server className="w-5 h-5" />;
    case 'PRINTER': return <Printer className="w-5 h-5" />;
    case 'IOT': return <Video className="w-5 h-5" />;
    case 'PC':
    default: return <Laptop className="w-5 h-5" />;
  }
};

export const VlanDisplay: React.FC<VlanDisplayProps> = ({ vlans }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {vlans.map((vlan) => (
        <div key={vlan.id} className={`rounded-lg border border-slate-700 bg-slate-800/50 p-4 relative overflow-hidden`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${vlan.color}`} />
          <div className="flex justify-between items-center mb-3 pl-2">
            <div>
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Network className="w-4 h-4 text-slate-400" />
                VLAN {vlan.vlanId}: {vlan.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{vlan.subnet}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-700`}>
              {vlan.devices.length} Disp.
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {vlan.devices.map((device) => (
              <div key={device.id} className="flex flex-col items-center bg-slate-900 p-2 rounded border border-slate-700 hover:border-blue-500 transition-colors">
                <div className="text-blue-400 mb-1">
                  {getDeviceIcon(device.type)}
                </div>
                <span className="text-xs font-medium text-center truncate w-full">{device.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{device.ip}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};