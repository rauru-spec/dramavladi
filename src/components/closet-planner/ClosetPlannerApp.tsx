'use client';

import { useClosetStore } from '@/lib/closet/store';
import { validarCloset } from '@/lib/closet/validation';
import { ClosetView2D } from './ClosetView2D';
import { ClosetView3D } from './ClosetView3D';
import { Toolbar } from './Toolbar';
import { ValidationBar } from './ValidationBar';
import { StepDimensiones } from './panels/StepDimensiones';
import { StepEstructura } from './panels/StepEstructura';
import { StepContenido } from './panels/StepContenido';
import { StepAcabados } from './panels/StepAcabados';
import { StepResultados } from './panels/StepResultados';
import { useMemo, useState } from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = [
  { id: 0, label: 'Espacio',    shortLabel: '1. Espacio' },
  { id: 1, label: 'Estructura', shortLabel: '2. Estructura' },
  { id: 2, label: 'Contenido',  shortLabel: '3. Contenido' },
  { id: 3, label: 'Acabados',   shortLabel: '4. Acabados' },
  { id: 4, label: 'Resultado',  shortLabel: '5. Resultado' },
];

function StepPanel({ step }: { step: number }) {
  switch (step) {
    case 0: return <StepDimensiones />;
    case 1: return <StepEstructura />;
    case 2: return <StepContenido />;
    case 3: return <StepAcabados />;
    case 4: return <StepResultados />;
    default: return null;
  }
}

export function ClosetPlannerApp() {
  const { closet, activeColumnId, viewMode, showCotas, doorsOpen, setActiveColumn } = useClosetStore();
  const [step, setStep] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);

  const validations = useMemo(() => validarCloset(closet), [closet]);

  return (
    <div className="flex flex-col h-screen bg-slate-100" style={{ color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      <Toolbar />

      {/* Step navigator */}
      <div className="bg-white border-b border-slate-200 px-4 py-0 overflow-x-auto">
        <div className="flex">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`relative flex items-center gap-1 px-4 py-3 text-xs font-medium whitespace-nowrap
                border-b-2 transition-colors ${
                step === s.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                step === s.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>{i + 1}</span>
              <span className="hidden sm:block">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          <div className="flex-1 overflow-hidden relative p-3">
            <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center">
              {viewMode === '2d' ? (
                <ClosetView2D
                  closet={closet}
                  activeColumnId={activeColumnId}
                  showCotas={showCotas}
                  doorsOpen={doorsOpen}
                  onColumnClick={(id) => {
                    setActiveColumn(activeColumnId === id ? null : id);
                    if (step < 2) setStep(2); // jump to content step
                  }}
                />
              ) : (
                <ClosetView3D closet={closet} doorsOpen={doorsOpen} />
              )}
            </div>
          </div>
          <ValidationBar messages={validations} />
        </div>

        {/* Config panel */}
        <div className={`transition-all duration-200 flex flex-col bg-white border-l border-slate-200 ${
          panelOpen ? 'w-80 min-w-72' : 'w-0 min-w-0 overflow-hidden'
        }`}>
          {panelOpen && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">
                  {STEPS[step]?.label}
                </span>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <StepPanel step={step} />
              </div>
              <div className="border-t border-slate-100 px-4 py-3 flex gap-2">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200
                    text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors"
                >
                  <ChevronLeft size={13} /> Anterior
                </button>
                <button
                  onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
                  disabled={step === STEPS.length - 1}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg
                    bg-blue-500 text-white text-xs font-medium hover:bg-blue-600
                    disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {step === STEPS.length - 2 ? 'Ver resultados' : 'Siguiente'}
                  <ChevronRight size={13} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Panel toggle (when closed) */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-slate-200
              rounded-l-xl px-2 py-4 shadow-md text-slate-500 hover:text-blue-600 hover:border-blue-300
              transition-colors z-10"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
