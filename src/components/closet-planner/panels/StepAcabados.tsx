'use client';

import { useClosetStore } from '@/lib/closet/store';
import { COLORES_TABLERO } from '@/lib/closet/constants';

function OptButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white border-blue-500'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

export function StepAcabados() {
  const { closet, setAcabados } = useClosetStore();
  const { acabados } = closet;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-slate-500">
        Elige el material, color y herrajes de tu clóset.
      </p>

      {/* Color selector */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-2">Color del tablero</label>
        <div className="grid grid-cols-4 gap-2">
          {COLORES_TABLERO.map(c => (
            <button
              key={c.id}
              onClick={() => setAcabados({ colorId: c.id })}
              className={`aspect-square rounded-xl border-2 relative transition-all ${
                acabados.colorId === c.id
                  ? 'border-blue-500 scale-105 shadow-md'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
              style={{ background: c.hex }}
              title={c.nombre}
            >
              {acabados.colorId === c.id && (
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                  style={{ color: c.hex < '#808080' ? '#fff' : '#1e293b' }}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Seleccionado: {COLORES_TABLERO.find(c => c.id === acabados.colorId)?.nombre ?? 'Blanco Perla'}
        </p>
      </div>

      {/* Material */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-2">Material</label>
        <div className="flex gap-2">
          <OptButton active={acabados.material === 'melamina'} onClick={() => setAcabados({ material: 'melamina' })}>
            Melamina
          </OptButton>
          <OptButton active={acabados.material === 'mdf'} onClick={() => setAcabados({ material: 'mdf' })}>
            MDF lacado
          </OptButton>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {acabados.material === 'melamina'
            ? 'Económica, resistente a la humedad, gran variedad de colores y texturas.'
            : 'Acabado premium, pintable en cualquier color RAL, borde sin poros.'}
        </p>
      </div>

      {/* Canto */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-2">Tipo de canto</label>
        <div className="flex gap-2">
          <OptButton active={acabados.tipoCanto === 'pvc'} onClick={() => setAcabados({ tipoCanto: 'pvc' })}>
            PVC
          </OptButton>
          <OptButton active={acabados.tipoCanto === 'madera'} onClick={() => setAcabados({ tipoCanto: 'madera' })}>
            Madera
          </OptButton>
          <OptButton active={acabados.tipoCanto === 'sin-canto'} onClick={() => setAcabados({ tipoCanto: 'sin-canto' })}>
            Sin canto
          </OptButton>
        </div>
      </div>

      {/* Puertas */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-2">Puertas</label>
        <div className="flex gap-2">
          <OptButton active={acabados.puertas === 'ninguna'} onClick={() => setAcabados({ puertas: 'ninguna' })}>
            Sin puertas
          </OptButton>
          <OptButton active={acabados.puertas === 'abatibles'} onClick={() => setAcabados({ puertas: 'abatibles' })}>
            Abatibles
          </OptButton>
          <OptButton active={acabados.puertas === 'corredizas'} onClick={() => setAcabados({ puertas: 'corredizas' })}>
            Corredizas
          </OptButton>
        </div>
      </div>

      {/* Tirador */}
      {acabados.puertas !== 'ninguna' && (
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-2">Tirador</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'barra', label: 'Barra (tubular)' },
              { id: 'boton', label: 'Botón' },
              { id: 'perfil', label: 'Perfil integrado' },
              { id: 'ninguno', label: 'Sin tirador' },
            ] as const).map(t => (
              <OptButton
                key={t.id}
                active={acabados.tirador === t.id}
                onClick={() => setAcabados({ tirador: t.id })}
              >
                {t.label}
              </OptButton>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-2">
          Precio por plancha de {closet.espesorTablero}mm (para estimación)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">$</span>
          <input
            type="number"
            min={100} max={5000} step={10}
            value={closet.precioTablero}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) useClosetStore.getState().setPrecioTablero(v);
            }}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
              focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-xs text-slate-400">MXN</span>
        </div>
        <div className="flex gap-2 mt-2">
          <label className="text-xs text-slate-500">Plancha estándar:</label>
          <select
            value={`${closet.anchoPlancha}x${closet.altoPlancha}`}
            onChange={(e) => {
              const [a, b] = e.target.value.split('x').map(Number);
              useClosetStore.getState().setTamañoPlancha(a, b);
            }}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800
              focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="244x122">244 × 122 cm</option>
            <option value="244x183">244 × 183 cm</option>
            <option value="280x183">280 × 183 cm</option>
          </select>
        </div>
      </div>
    </div>
  );
}
