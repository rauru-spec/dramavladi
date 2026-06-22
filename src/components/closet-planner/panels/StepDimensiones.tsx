'use client';

import { useClosetStore } from '@/lib/closet/store';
import { anchoInterior } from '@/lib/closet/validation';

function NumInput({ label, value, min, max, step = 1, onChange, unit }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
            focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
        {unit && <span className="text-xs text-slate-400 whitespace-nowrap">{unit}</span>}
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500 h-1.5"
      />
    </div>
  );
}

export function StepDimensiones() {
  const { closet, setDimensiones, setEspesor, setTipo, setUnidades } = useClosetStore();

  const interior = anchoInterior(closet);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-slate-500 mb-3">
          Ingresa las medidas del hueco o espacio disponible para el clóset.
        </p>
        <div className="flex gap-2 mb-4">
          {(['cm', 'in'] as const).map(u => (
            <button
              key={u}
              onClick={() => setUnidades(u)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                closet.unidades === u
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {u === 'cm' ? 'Centímetros' : 'Pulgadas'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <NumInput
          label="Ancho total del hueco"
          value={closet.ancho} min={60} max={400} step={1}
          unit={closet.unidades}
          onChange={(v) => setDimensiones(v, closet.alto, closet.profundidad)}
        />
        <NumInput
          label="Alto total"
          value={closet.alto} min={100} max={260} step={1}
          unit={closet.unidades}
          onChange={(v) => setDimensiones(closet.ancho, v, closet.profundidad)}
        />
        <NumInput
          label="Profundidad"
          value={closet.profundidad} min={30} max={100} step={1}
          unit={closet.unidades}
          onChange={(v) => setDimensiones(closet.ancho, closet.alto, v)}
        />
      </div>

      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
        <div className="font-medium text-slate-700">Espacio interior disponible</div>
        <div className="flex justify-between">
          <span>Ancho útil para módulos:</span>
          <span className="font-mono font-medium text-blue-600">{interior.toFixed(1)} cm</span>
        </div>
        <div className="flex justify-between">
          <span>Alto interior:</span>
          <span className="font-mono font-medium text-blue-600">
            {(closet.alto - 2 * closet.espesorTablero / 10).toFixed(1)} cm
          </span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">Tipo de instalación</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'empotrado', label: 'Empotrado', icon: '▭' },
            { id: 'esquina', label: 'Esquina', icon: '◹' },
            { id: 'exento', label: 'Exento', icon: '□' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={`flex flex-col items-center py-2.5 rounded-xl border text-xs transition-colors ${
                closet.tipo === t.id
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl mb-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">Espesor del tablero</label>
        <div className="flex gap-2">
          {([15, 18] as const).map(e => (
            <button
              key={e}
              onClick={() => setEspesor(e)}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                closet.espesorTablero === e
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {e} mm
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          18 mm recomendado para vanos &gt;80 cm
        </p>
      </div>
    </div>
  );
}
