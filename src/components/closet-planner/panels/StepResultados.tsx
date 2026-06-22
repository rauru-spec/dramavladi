'use client';

import { useClosetStore } from '@/lib/closet/store';
import { generarDespiece, calcularPlanchas } from '@/lib/closet/cutlist';
import { generarHerrajes } from '@/lib/closet/hardware';
import { CortePieza, Herraje } from '@/lib/closet/types';
import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';

function downloadCSV(piezas: CortePieza[], filename: string) {
  const header = 'Pieza,Largo (mm),Ancho (mm),Espesor (mm),Cantidad,Cantos,Módulo,Material\n';
  const rows = piezas.map(p =>
    `"${p.nombre}",${p.largo},${p.ancho},${p.espesor},${p.cantidad},"${p.cantos.join('; ')}","${p.modulo}","${p.material}"`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function TabBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 text-xs font-medium border-b-2 transition-colors px-1 ${
        active ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

export function StepResultados() {
  const { closet } = useClosetStore();
  const [tab, setTab] = useState<'despiece' | 'herrajes' | 'costo'>('despiece');

  const piezas = useMemo(() => generarDespiece(closet), [closet]);
  const herrajes = useMemo(() => generarHerrajes(closet), [closet]);
  const { planchas, desperdicioPct } = useMemo(
    () => calcularPlanchas(piezas, closet.anchoPlancha, closet.altoPlancha),
    [piezas, closet.anchoPlancha, closet.altoPlancha]
  );

  const costoTableros = planchas.length * closet.precioTablero;
  const costoTotal = costoTableros * 1.15; // +15% herrajes estimate

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">{piezas.length}</div>
            <div className="text-xs text-slate-500">piezas</div>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-600">{planchas.length}</div>
            <div className="text-xs text-slate-500">planchas</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-600">{desperdicioPct}%</div>
            <div className="text-xs text-slate-500">desperdicio</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-b border-slate-200">
        <TabBtn active={tab === 'despiece'} onClick={() => setTab('despiece')}>Despiece</TabBtn>
        <TabBtn active={tab === 'herrajes'} onClick={() => setTab('herrajes')}>Herrajes</TabBtn>
        <TabBtn active={tab === 'costo'} onClick={() => setTab('costo')}>Costo</TabBtn>
      </div>

      {tab === 'despiece' && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">{piezas.length} piezas en total</span>
            <button
              onClick={() => downloadCSV(piezas, 'despiece-closet.csv')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <Download size={12} /> CSV
            </button>
          </div>
          <div className="overflow-auto max-h-80 rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left px-2 py-2 text-slate-500 font-medium">Pieza</th>
                  <th className="text-right px-2 py-2 text-slate-500 font-medium">L×A mm</th>
                  <th className="text-right px-2 py-2 text-slate-500 font-medium">Esp</th>
                  <th className="text-right px-2 py-2 text-slate-500 font-medium">Cant</th>
                </tr>
              </thead>
              <tbody>
                {piezas.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-2 py-1.5 text-slate-700">
                      <div>{p.nombre}</div>
                      <div className="text-slate-400 text-[10px]">{p.modulo}</div>
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600">
                      {p.largo}×{p.ancho}
                    </td>
                    <td className="px-2 py-1.5 text-right text-slate-500">{p.espesor}</td>
                    <td className="px-2 py-1.5 text-right font-medium text-slate-700">×{p.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Planchas */}
          <div className="mt-2">
            <div className="text-xs font-medium text-slate-600 mb-2">
              Acomodo en planchas ({closet.anchoPlancha}×{closet.altoPlancha} cm)
            </div>
            {planchas.map(pl => (
              <div key={pl.numero} className="mb-2">
                <div className="text-xs text-slate-500 mb-1">
                  Plancha {pl.numero} — {Math.round((pl.areaPiezas / pl.areaTotal) * 100)}% aprovechamiento
                </div>
                <svg viewBox={`0 0 ${pl.anchoPlancha} ${pl.altoPlancha}`}
                  className="w-full border border-slate-200 rounded-lg"
                  style={{ maxHeight: 120 }}>
                  <rect width={pl.anchoPlancha} height={pl.altoPlancha} fill="#F8FAFC" stroke="#E2E8F0" strokeWidth={2} />
                  {pl.piezas.map((p, i) => (
                    <g key={i}>
                      <rect x={p.x} y={p.y} width={p.w} height={p.h}
                        fill="#BFDBFE" stroke="#3B82F6" strokeWidth={2} />
                      {p.w > 150 && p.h > 60 && (
                        <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 5}
                          textAnchor="middle" fontSize={Math.min(40, p.h * 0.35)}
                          fill="#1E40AF" fontFamily="system-ui">
                          {p.nombre.slice(0, 6)}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'herrajes' && (
        <div className="overflow-auto max-h-96 rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-2 py-2 text-slate-500 font-medium">Herraje</th>
                <th className="text-right px-2 py-2 text-slate-500 font-medium">Cant.</th>
                <th className="text-right px-2 py-2 text-slate-500 font-medium">Un.</th>
              </tr>
            </thead>
            <tbody>
              {herrajes.map((h, i) => (
                <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-2 py-1.5 text-slate-700">
                    <div>{h.nombre}</div>
                    {h.descripcion && <div className="text-slate-400 text-[10px]">{h.descripcion}</div>}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono font-medium text-slate-700">{h.cantidad}</td>
                  <td className="px-2 py-1.5 text-right text-slate-500">{h.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'costo' && (
        <div className="flex flex-col gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tableros ({planchas.length} planchas × ${closet.precioTablero})</span>
              <span className="font-medium text-slate-800">${costoTableros.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Herrajes y accesorios (estimado ~15%)</span>
              <span>${(costoTotal - costoTableros).toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-semibold text-slate-700">Total estimado materiales</span>
              <span className="font-bold text-blue-600 text-base">${Math.round(costoTotal).toLocaleString()} MXN</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            Esta estimación es solo de materiales. No incluye mano de obra, traslados ni herramienta.
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-600">
            <div className="font-medium text-slate-700 mb-1">Resumen de materiales</div>
            <div className="flex justify-between">
              <span>Tablero {closet.espesorTablero}mm {closet.acabados.material}</span>
              <span>{planchas.length} planchas</span>
            </div>
            <div className="flex justify-between">
              <span>Aprovechamiento</span>
              <span>{100 - desperdicioPct}% ({desperdicioPct}% desperdicio)</span>
            </div>
            <div className="flex justify-between">
              <span>Tamaño plancha</span>
              <span>{closet.anchoPlancha}×{closet.altoPlancha} cm</span>
            </div>
          </div>
        </div>
      )}

      {/* Print */}
      <button
        onClick={() => window.print()}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200
          text-slate-600 text-sm hover:bg-slate-50 transition-colors mt-2"
      >
        <Printer size={15} /> Imprimir / Guardar PDF
      </button>
    </div>
  );
}
