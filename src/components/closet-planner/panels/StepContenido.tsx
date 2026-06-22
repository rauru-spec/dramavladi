'use client';

import { useClosetStore, genId } from '@/lib/closet/store';
import { alturaElemento, alturaInterior, alturaColumna } from '@/lib/closet/validation';
import { Elemento, BarraTipo, ZapateraTipo, CorrederaLargo } from '@/lib/closet/types';
import { Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const ELEM_ICONS: Record<string, string> = {
  barra: '🧥', repisa: '📚', cajonera: '📦', zapatera: '👟', espacioLibre: '⬜',
};

const ELEM_COLORS: Record<string, string> = {
  barra: 'bg-blue-50 border-blue-200 text-blue-700',
  repisa: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  cajonera: 'bg-orange-50 border-orange-200 text-orange-700',
  zapatera: 'bg-green-50 border-green-200 text-green-700',
  espacioLibre: 'bg-slate-50 border-slate-200 text-slate-600',
};

function NumField({ label, value, min, max, step = 1, onChange, unit }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-500 shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
          className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-xs text-right
            text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {unit && <span className="text-slate-400 w-6">{unit}</span>}
      </div>
    </label>
  );
}

function ElementEditor({ elem, columnaId, onClose }: {
  elem: Elemento; columnaId: string; onClose: () => void;
}) {
  const { updateElemento, addElemento } = useClosetStore();
  const upd = (data: Partial<Elemento>) => updateElemento(columnaId, elem.id, data);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mt-2 space-y-2.5">
      {elem.tipo === 'barra' && (
        <>
          <NumField label="Altura libre" value={elem.alturaLibre} min={50} max={210}
            onChange={(v) => upd({ alturaLibre: v } as Partial<Elemento>)} unit="cm" />
          <label className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Tipo de barra</span>
            <select
              value={elem.tipoBarra}
              onChange={(e) => upd({ tipoBarra: e.target.value as BarraTipo } as Partial<Elemento>)}
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="larga">Larga (abrigos, vestidos)</option>
              <option value="media">Media (camisas, pantalones)</option>
              <option value="doble">Doble barra</option>
            </select>
          </label>
        </>
      )}

      {elem.tipo === 'repisa' && (
        <>
          <NumField label="Cantidad de repisas" value={elem.cantidad} min={1} max={12}
            onChange={(v) => upd({ cantidad: v } as Partial<Elemento>)} />
          <NumField label="Separación entre repisas" value={elem.separacion} min={15} max={80}
            onChange={(v) => upd({ separacion: v } as Partial<Elemento>)} unit="cm" />
        </>
      )}

      {elem.tipo === 'cajonera' && (
        <>
          <label className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Corredera</span>
            <select
              value={elem.profundidadCorredera}
              onChange={(e) => upd({ profundidadCorredera: parseInt(e.target.value) as CorrederaLargo } as Partial<Elemento>)}
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {[300, 350, 400, 450, 500].map(v => (
                <option key={v} value={v}>{v} mm ({v / 10} cm)</option>
              ))}
            </select>
          </label>
          <div className="space-y-1.5">
            <div className="text-xs text-slate-500 font-medium">Cajones</div>
            {elem.cajones.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-12">#{i + 1}</span>
                <input
                  type="number" value={c.altura} min={8} max={40} step={1}
                  onChange={(ev) => {
                    const v = parseFloat(ev.target.value);
                    if (!isNaN(v)) {
                      const cajones = elem.cajones.map((x) => x.id === c.id ? { ...x, altura: v } : x);
                      upd({ cajones } as Partial<Elemento>);
                    }
                  }}
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-right
                    text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-xs text-slate-400">cm</span>
                <button
                  onClick={() => {
                    const cajones = elem.cajones.filter((x) => x.id !== c.id);
                    if (cajones.length > 0) upd({ cajones } as Partial<Elemento>);
                  }}
                  className="ml-auto text-slate-300 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const cajones = [...elem.cajones, { id: genId(), altura: 18 }];
                upd({ cajones } as Partial<Elemento>);
              }}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={11} /> Añadir cajón
            </button>
          </div>
        </>
      )}

      {elem.tipo === 'zapatera' && (
        <>
          <NumField label="Niveles" value={elem.niveles} min={1} max={8}
            onChange={(v) => upd({ niveles: v } as Partial<Elemento>)} />
          <label className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Tipo</span>
            <select
              value={elem.tipoZapatera}
              onChange={(e) => upd({ tipoZapatera: e.target.value as ZapateraTipo } as Partial<Elemento>)}
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="plana">Plana horizontal</option>
              <option value="inclinada">Inclinada</option>
            </select>
          </label>
        </>
      )}

      {elem.tipo === 'espacioLibre' && (
        <NumField label="Altura libre" value={elem.altura} min={5} max={200}
          onChange={(v) => upd({ altura: v } as Partial<Elemento>)} unit="cm" />
      )}
    </div>
  );
}

function ElemRow({ elem, columnaId, idx, total }: {
  elem: Elemento; columnaId: string; idx: number; total: number;
}) {
  const [open, setOpen] = useState(false);
  const { removeElemento, moveElemento } = useClosetStore();

  const altH = alturaElemento(elem, 18);

  return (
    <div className={`rounded-xl border ${ELEM_COLORS[elem.tipo]} overflow-hidden`}>
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm">{ELEM_ICONS[elem.tipo]}</span>
        <span className="text-xs font-medium flex-1">
          {{
            barra: `Barra ${(elem as any).tipoBarra}`,
            repisa: `${(elem as any).cantidad} repisas`,
            cajonera: `${(elem as any).cajones?.length} cajones`,
            zapatera: `Zapatera ${(elem as any).niveles} niv.`,
            espacioLibre: `Espacio libre`,
          }[elem.tipo]}
        </span>
        <span className="text-xs opacity-60">{altH.toFixed(0)} cm</span>
        <div className="flex gap-0.5 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); moveElemento(columnaId, elem.id, 'up'); }}
            disabled={idx === 0}
            className="p-0.5 rounded hover:bg-black/10 disabled:opacity-30"
          >
            <ArrowUp size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); moveElemento(columnaId, elem.id, 'down'); }}
            disabled={idx === total - 1}
            className="p-0.5 rounded hover:bg-black/10 disabled:opacity-30"
          >
            <ArrowDown size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeElemento(columnaId, elem.id); }}
            className="p-0.5 rounded hover:bg-red-100 text-current opacity-60 hover:opacity-100"
          >
            <Trash2 size={11} />
          </button>
        </div>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </div>
      {open && <div className="px-3 pb-3">
        <ElementEditor elem={elem} columnaId={columnaId} onClose={() => setOpen(false)} />
      </div>}
    </div>
  );
}

const QUICK_ADD = [
  { tipo: 'barra' as const, label: '+ Barra', icon: '🧥' },
  { tipo: 'repisa' as const, label: '+ Repisas', icon: '📚' },
  { tipo: 'cajonera' as const, label: '+ Cajones', icon: '📦' },
  { tipo: 'zapatera' as const, label: '+ Zapatera', icon: '👟' },
  { tipo: 'espacioLibre' as const, label: '+ Espacio', icon: '⬜' },
];

function makeDefaultElement(tipo: Elemento['tipo']): Elemento {
  const id = genId();
  switch (tipo) {
    case 'barra':       return { id, tipo, alturaLibre: 110, tipoBarra: 'media' };
    case 'repisa':      return { id, tipo, cantidad: 3, separacion: 35 };
    case 'cajonera':    return { id, tipo, cajones: [{ id: genId(), altura: 18 }, { id: genId(), altura: 18 }], profundidadCorredera: 450 };
    case 'zapatera':    return { id, tipo, niveles: 3, tipoZapatera: 'plana' };
    case 'espacioLibre':return { id, tipo, altura: 40 };
  }
}

export function StepContenido() {
  const { closet, activeColumnId, setActiveColumn, addElemento } = useClosetStore();

  const col = closet.columnas.find(c => c.id === activeColumnId) ?? closet.columnas[0];
  const altInt = alturaInterior(closet);
  const altUsada = col ? alturaColumna(col, closet.espesorTablero) : 0;
  const pct = col ? Math.min(100, (altUsada / altInt) * 100) : 0;
  const libre = Math.max(0, altInt - altUsada);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Selecciona una columna y añade los elementos que quieres en ella.
      </p>

      {/* Column selector */}
      <div className="flex gap-1.5 flex-wrap">
        {closet.columnas.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveColumn(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              (activeColumnId ?? closet.columnas[0]?.id) === c.id
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Col. {i + 1} <span className="opacity-60">({c.ancho} cm)</span>
          </button>
        ))}
      </div>

      {col && (
        <>
          {/* Usage bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Espacio usado</span>
              <span className={libre < 5 ? 'text-amber-500' : 'text-slate-500'}>
                {altUsada.toFixed(0)} / {altInt.toFixed(0)} cm ({libre.toFixed(0)} cm libres)
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct > 95 ? 'bg-red-400' : pct > 80 ? 'bg-amber-400' : 'bg-blue-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Quick add buttons */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ADD.map(({ tipo, label, icon }) => (
              <button
                key={tipo}
                onClick={() => addElemento(col.id, makeDefaultElement(tipo))}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200
                  bg-white text-xs text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-colors"
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Elements list */}
          <div className="flex flex-col gap-2">
            {col.elementos.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                Ningún elemento todavía. <br /> Usa los botones de arriba para añadir.
              </div>
            )}
            {col.elementos.map((elem, i) => (
              <ElemRow
                key={elem.id}
                elem={elem}
                columnaId={col.id}
                idx={i}
                total={col.elementos.length}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
