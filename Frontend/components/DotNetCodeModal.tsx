import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { generateCSharpCode } from '../utils/dotnetGenerator';

interface DotNetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DotNetCodeModal: React.FC<DotNetCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  
  if (!isOpen) return null;

  const code = generateCSharpCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
              Integración .NET 10 (C#)
            </h2>
            <p className="text-xs text-slate-400">Modelos y Controlador compatibles con este frontend</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative flex-1 overflow-hidden bg-[#1e1e1e]">
          <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-2 border border-slate-600 transition-all z-10"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar Código'}
          </button>
          
          <pre className="p-6 overflow-auto h-full text-sm font-mono leading-relaxed text-gray-300">
            <code>{code}</code>
          </pre>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 text-xs text-slate-500 rounded-b-xl">
          Instrucciones: Crea un proyecto "ASP.NET Core Web API", pega estos modelos y asegura que el puerto coincida con la configuración del frontend (default: 5000).
        </div>
      </div>
    </div>
  );
};