'use client';

import { useClosetStore } from '@/lib/closet/store';
import { RotateCcw, Layers, Eye, EyeOff, DoorOpen, DoorClosed, Ruler, Info } from 'lucide-react';

function ToolBtn({ active, onClick, children, title }: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium
        transition-all border ${
          active
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        }`}
    >
      {children}
    </button>
  );
}

export function Toolbar() {
  const {
    viewMode, setViewMode,
    showCotas, toggleCotas,
    doorsOpen, toggleDoors,
    closet,
    resetCloset,
  } = useClosetStore();

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-3 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-sm font-semibold text-slate-800 hidden sm:block">Planificador de Clósets</span>
      </div>

      <div className="flex gap-1.5">
        <ToolBtn
          active={viewMode === '2d'}
          onClick={() => setViewMode('2d')}
          title="Vista frontal 2D"
        >
          <Layers size={14} />
          <span>2D</span>
        </ToolBtn>

        <ToolBtn
          active={viewMode === '3d'}
          onClick={() => setViewMode('3d')}
          title="Vista 3D"
        >
          <Eye size={14} />
          <span>3D</span>
        </ToolBtn>

        <ToolBtn
          active={showCotas}
          onClick={toggleCotas}
          title="Mostrar / ocultar cotas"
        >
          <Ruler size={14} />
          <span>Cotas</span>
        </ToolBtn>

        {closet.acabados.puertas !== 'ninguna' && (
          <ToolBtn
            active={doorsOpen}
            onClick={toggleDoors}
            title="Abrir / cerrar puertas"
          >
            {doorsOpen ? <DoorOpen size={14} /> : <DoorClosed size={14} />}
            <span>Puertas</span>
          </ToolBtn>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Info badge */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 shrink-0">
        <span>{closet.ancho}×{closet.alto}×{closet.profundidad} {closet.unidades}</span>
        <span>·</span>
        <span>{closet.columnas.length} col.</span>
        <span>·</span>
        <span>{closet.espesorTablero}mm</span>
      </div>

      <button
        onClick={() => {
          if (confirm('¿Reiniciar el diseño desde cero?')) resetCloset();
        }}
        title="Reiniciar diseño"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500
          hover:bg-slate-100 hover:text-slate-700 transition-colors ml-2 shrink-0"
      >
        <RotateCcw size={13} />
        <span className="hidden sm:block">Reiniciar</span>
      </button>
    </div>
  );
}
