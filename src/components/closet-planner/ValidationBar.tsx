'use client';

import { ValidationMessage } from '@/lib/closet/types';
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
  messages: ValidationMessage[];
}

export function ValidationBar({ messages }: Props) {
  const [expanded, setExpanded] = useState(false);

  const errors = messages.filter(m => m.tipo === 'error');
  const warnings = messages.filter(m => m.tipo === 'advertencia');

  if (messages.length === 0) {
    return (
      <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center gap-2">
        <span className="text-green-600 text-xs font-medium">✓ Diseño viable — sin advertencias</span>
      </div>
    );
  }

  return (
    <div className={`border-t ${errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <button
        className="w-full px-4 py-2 flex items-center gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {errors.length > 0 ? (
          <AlertCircle size={14} className="text-red-500 shrink-0" />
        ) : (
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
        )}
        <span className={`text-xs font-medium flex-1 ${errors.length > 0 ? 'text-red-700' : 'text-amber-700'}`}>
          {errors.length > 0
            ? `${errors.length} error${errors.length > 1 ? 'es' : ''} de viabilidad`
            : `${warnings.length} advertencia${warnings.length > 1 ? 's' : ''}`}
        </span>
        {expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2 max-h-48 overflow-y-auto">
          {messages.map(m => (
            <div key={m.id} className={`rounded-lg p-2.5 text-xs ${
              m.tipo === 'error'
                ? 'bg-red-100 border border-red-200 text-red-800'
                : 'bg-amber-100 border border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-start gap-1.5">
                {m.tipo === 'error'
                  ? <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  : <AlertTriangle size={12} className="shrink-0 mt-0.5" />}
                <div>
                  <div>{m.mensaje}</div>
                  {m.sugerencia && (
                    <div className="mt-0.5 opacity-75">{m.sugerencia}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
