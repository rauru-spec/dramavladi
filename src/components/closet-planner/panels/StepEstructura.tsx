'use client';

import { useClosetStore } from '@/lib/closet/store';
import { anchoInterior } from '@/lib/closet/validation';
import { Trash2, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

export function StepEstructura() {
  const { closet, addColumna, removeColumna, updateColumnaAncho, distribuirColumnas, setActiveColumn, activeColumnId } = useClosetStore();

  const interior = anchoInterior(closet);
  const sumaColumnas = closet.columnas.reduce((s, c) => s + c.ancho, 0);
  const diff = Math.abs(sumaColumnas - interior);
  const diffOk = diff < 1.5;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Divide el interior del clóset en columnas verticales (módulos). Puedes ajustar el ancho de cada una.
      </p>

      <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
        <div className="flex justify-between font-medium text-slate-700">
          <span>Ancho interior disponible:</span>
          <span className="text-blue-600">{interior.toFixed(1)} cm</span>
        </div>
        <div className={`flex justify-between ${diffOk ? 'text-green-600' : 'text-amber-500'}`}>
          <span>Suma de columnas:</span>
          <span className="font-mono">{sumaColumnas.toFixed(1)} cm {diffOk ? '✓' : `(${diff > 0 ? '+' : ''}${(sumaColumnas - interior).toFixed(1)})`}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={addColumna}
          disabled={closet.columnas.length >= 8}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
            border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium
            hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} /> Añadir columna
        </button>
        <button
          onClick={distribuirColumnas}
          className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm
            hover:bg-slate-50 transition-colors"
        >
          Distribuir igual
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {closet.columnas.map((col, i) => (
          <div
            key={col.id}
            className={`rounded-xl border p-3 transition-all cursor-pointer ${
              activeColumnId === col.id
                ? 'border-blue-400 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-blue-200'
            }`}
            onClick={() => setActiveColumn(activeColumnId === col.id ? null : col.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Columna {i + 1}
                {closet.columnas[i].elementos.length > 0 && (
                  <span className="ml-2 text-xs text-slate-400">
                    ({closet.columnas[i].elementos.length} elemento{closet.columnas[i].elementos.length !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeColumna(col.id); }}
                disabled={closet.columnas.length <= 1}
                className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={25} max={200} step={0.5}
                value={col.ancho}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateColumnaAncho(col.id, parseFloat(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={25} max={200} step={0.5}
                  value={col.ancho}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) updateColumnaAncho(col.id, Math.min(200, Math.max(25, v)));
                  }}
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center
                    text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-xs text-slate-400">cm</span>
              </div>
            </div>

            {/* Width percentage bar */}
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (col.ancho / interior) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {((col.ancho / interior) * 100).toFixed(0)}% del ancho interior
            </div>
          </div>
        ))}
      </div>

      {!diffOk && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          <strong>Ajuste necesario:</strong> las columnas suman {sumaColumnas.toFixed(1)} cm pero el espacio interior es {interior.toFixed(1)} cm.
          Usa &quot;Distribuir igual&quot; o ajusta manualmente.
        </div>
      )}
    </div>
  );
}
