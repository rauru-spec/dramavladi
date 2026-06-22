'use client';

import React from 'react';
import { Closet, Elemento } from '@/lib/closet/types';
import { REGLAS, getColorHex, adjustBrightness } from '@/lib/closet/constants';
import { alturaElemento, alturaInterior } from '@/lib/closet/validation';

interface Props {
  closet: Closet;
  activeColumnId: string | null;
  showCotas: boolean;
  doorsOpen: boolean;
  onColumnClick?: (id: string) => void;
}

const MARGIN = { left: 52, right: 16, top: 16, bottom: 44 };

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function dimColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},0.15)`;
}

const ELEM_COLORS: Record<string, string> = {
  barra: '#BFDBFE',
  repisa: '#FEF9C3',
  cajonera: '#FED7AA',
  zapatera: '#BBF7D0',
  espacioLibre: '#F1F5F9',
};

const ELEM_STROKE: Record<string, string> = {
  barra: '#3B82F6',
  repisa: '#CA8A04',
  cajonera: '#EA580C',
  zapatera: '#16A34A',
  espacioLibre: '#CBD5E1',
};

function elemLabel(tipo: string): string {
  switch (tipo) {
    case 'barra': return 'Barra';
    case 'repisa': return 'Repisas';
    case 'cajonera': return 'Cajones';
    case 'zapatera': return 'Zapatera';
    case 'espacioLibre': return 'Espacio libre';
    default: return tipo;
  }
}

export function ClosetView2D({ closet, activeColumnId, showCotas, doorsOpen, onColumnClick }: Props) {
  const W_MM = closet.ancho * 10;
  const H_MM = closet.alto * 10;
  const esp = closet.espesorTablero;
  const matColor = getColorHex(closet.acabados.colorId);
  const matDark = adjustBrightness(matColor, 0.75);
  const matLight = adjustBrightness(matColor, 0.90);

  const VIEW_W = 640;
  const VIEW_H = 520;
  const avW = VIEW_W - MARGIN.left - MARGIN.right;
  const avH = VIEW_H - MARGIN.top - MARGIN.bottom;

  const scale = Math.min(avW / W_MM, avH / H_MM);

  const drawW = W_MM * scale;
  const drawH = H_MM * scale;
  const ox = MARGIN.left + (avW - drawW) / 2;
  const oy = MARGIN.top + (avH - drawH) / 2;

  function tx(x_mm: number) { return ox + x_mm * scale; }
  function ty(y_mm: number) { return oy + drawH - y_mm * scale; }
  function ts(mm: number)   { return mm * scale; }

  // Column x-start positions (in mm from left edge)
  const colXMm: number[] = [];
  let curX = esp;
  for (const col of closet.columnas) {
    colXMm.push(curX);
    curX += col.ancho * 10 + esp;
  }

  const altInt = alturaInterior(closet);

  const elements: React.ReactNode[] = [];
  let kk = 0;

  // ── Background ──────────────────────────────────────────────────────────────
  elements.push(
    <rect key="bg" x={tx(0)} y={ty(H_MM)} width={drawW} height={drawH}
      fill="#F8FAFC" stroke="#E2E8F0" strokeWidth={1} />
  );

  // ── Outer panels ────────────────────────────────────────────────────────────
  // Left lateral
  elements.push(
    <rect key="lat-l" x={tx(0)} y={ty(H_MM)} width={ts(esp)} height={drawH}
      fill={matColor} stroke={matDark} strokeWidth={1} />
  );
  // Right lateral
  elements.push(
    <rect key="lat-r" x={tx(W_MM - esp)} y={ty(H_MM)} width={ts(esp)} height={drawH}
      fill={matColor} stroke={matDark} strokeWidth={1} />
  );
  // Base
  elements.push(
    <rect key="base" x={tx(esp)} y={ty(esp)} width={ts(W_MM - 2 * esp)} height={ts(esp)}
      fill={matLight} stroke={matDark} strokeWidth={1} />
  );
  // Techo
  elements.push(
    <rect key="techo" x={tx(esp)} y={ty(H_MM)} width={ts(W_MM - 2 * esp)} height={ts(esp)}
      fill={matLight} stroke={matDark} strokeWidth={1} />
  );

  // ── Divisions and column content ─────────────────────────────────────────────
  for (let ci = 0; ci < closet.columnas.length; ci++) {
    const col = closet.columnas[ci];
    const colX = colXMm[ci];
    const colWMm = col.ancho * 10;
    const isActive = col.id === activeColumnId;

    // Column divider (left side, except for first)
    if (ci > 0) {
      elements.push(
        <rect key={`div-${ci}`}
          x={tx(colX - esp)} y={ty(H_MM - esp)} width={ts(esp)} height={ts(H_MM - 2 * esp)}
          fill={matColor} stroke={matDark} strokeWidth={1} />
      );
    }

    // Active column highlight
    if (isActive) {
      elements.push(
        <rect key={`active-${ci}`}
          x={tx(colX)} y={ty(H_MM - esp)}
          width={ts(colWMm)} height={ts((H_MM - 2 * esp))}
          fill="rgba(59,130,246,0.07)" stroke="#3B82F6" strokeWidth={1.5}
          strokeDasharray="4 3" rx={2} />
      );
    }

    // Clickable column area
    elements.push(
      <rect key={`click-${ci}`}
        x={tx(colX)} y={ty(H_MM - esp)}
        width={ts(colWMm)} height={ts(H_MM - 2 * esp)}
        fill="transparent" className="cursor-pointer"
        onClick={() => onColumnClick?.(col.id)}
      />
    );

    // ── Elements in column ──────────────────────────────────────────────────
    let elemY = esp; // starts above base, in mm from bottom

    for (const elem of col.elementos) {
      const hCm = alturaElemento(elem, esp);
      const hMm = hCm * 10;

      const ex = colX;
      const ey = elemY;
      const ew = colWMm;
      const eh = hMm;

      const fill = ELEM_COLORS[elem.tipo];
      const stroke = ELEM_STROKE[elem.tipo];

      elements.push(
        <rect key={`elem-bg-${kk}`}
          x={tx(ex)} y={ty(ey + eh)}
          width={ts(ew)} height={ts(eh)}
          fill={fill} stroke={stroke} strokeWidth={0.8} />
      );

      // Element-specific details
      elements.push(...renderElementDetails(elem, ex, ey, ew, eh, esp, scale, tx, ty, ts, matColor, matDark, kk));

      // Label (only if element is tall enough)
      if (ts(eh) > 20) {
        elements.push(
          <text key={`elem-label-${kk}`}
            x={tx(ex + ew / 2)} y={ty(ey + eh / 2) + 4}
            textAnchor="middle" fontSize={Math.min(10, ts(eh) * 0.3)}
            fill={stroke} fontFamily="system-ui" fontWeight="500" pointerEvents="none">
            {elemLabel(elem.tipo)}
          </text>
        );
      }

      elemY += hMm;
      kk++;
    }

    // Remaining space indicator
    const usedCm = col.elementos.reduce((s, e) => s + alturaElemento(e, esp), 0);
    const remainingCm = altInt - usedCm;
    if (remainingCm > 5) {
      const remMm = remainingCm * 10;
      elements.push(
        <rect key={`rem-${ci}`}
          x={tx(colX)} y={ty(elemY + remMm)}
          width={ts(colWMm)} height={ts(remMm)}
          fill="none" stroke="#CBD5E1" strokeWidth={0.5} strokeDasharray="3 3" />
      );
      if (ts(remMm) > 16) {
        elements.push(
          <text key={`rem-label-${ci}`}
            x={tx(colX + colWMm / 2)} y={ty(elemY + remMm / 2) + 4}
            textAnchor="middle" fontSize={9}
            fill="#94A3B8" fontFamily="system-ui" fontStyle="italic" pointerEvents="none">
            {remainingCm.toFixed(0)} cm libres
          </text>
        );
      }
    }
  }

  // ── Doors (if applicable) ───────────────────────────────────────────────────
  if (closet.acabados.puertas !== 'ninguna' && !doorsOpen) {
    elements.push(
      <rect key="doors"
        x={tx(esp)} y={ty(H_MM - esp)}
        width={ts(W_MM - 2 * esp)} height={ts(H_MM - 2 * esp)}
        fill={dimColor(matColor)} stroke={matDark} strokeWidth={1.5} />
    );
    // Door lines
    for (let i = 0; i < closet.columnas.length; i++) {
      const xLine = tx(colXMm[i] + closet.columnas[i].ancho * 10);
      if (i < closet.columnas.length - 1) {
        elements.push(
          <line key={`door-line-${i}`} x1={xLine} y1={ty(H_MM - esp)} x2={xLine} y2={ty(esp)}
            stroke={matDark} strokeWidth={1.5} />
        );
      }
    }
    // Handle
    for (let i = 0; i < closet.columnas.length; i++) {
      const hx = tx(colXMm[i] + closet.columnas[i].ancho * 10 - 8);
      const hmid = ty(H_MM / 2);
      elements.push(
        <rect key={`handle-${i}`} x={hx - 2} y={hmid - 15}
          width={4} height={30} rx={2}
          fill={matDark} opacity={0.6} />
      );
    }
  }

  // ── Cotas (dimensions) ─────────────────────────────────────────────────────
  if (showCotas) {
    // Width cota
    elements.push(
      <g key="cota-w">
        <line x1={tx(0)} y1={ty(-20)} x2={tx(W_MM)} y2={ty(-20)} stroke="#64748B" strokeWidth={0.8} />
        <line x1={tx(0)} y1={ty(-15)} x2={tx(0)} y2={ty(-25)} stroke="#64748B" strokeWidth={0.8} />
        <line x1={tx(W_MM)} y1={ty(-15)} x2={tx(W_MM)} y2={ty(-25)} stroke="#64748B" strokeWidth={0.8} />
        <text x={tx(W_MM / 2)} y={ty(-20) - 4} textAnchor="middle"
          fontSize={10} fill="#475569" fontFamily="system-ui">
          {closet.ancho} {closet.unidades}
        </text>
      </g>
    );

    // Height cota
    elements.push(
      <g key="cota-h">
        <line x1={tx(-30)} y1={ty(0)} x2={tx(-30)} y2={ty(H_MM)} stroke="#64748B" strokeWidth={0.8} />
        <line x1={tx(-35)} y1={ty(0)} x2={tx(-25)} y2={ty(0)} stroke="#64748B" strokeWidth={0.8} />
        <line x1={tx(-35)} y1={ty(H_MM)} x2={tx(-25)} y2={ty(H_MM)} stroke="#64748B" strokeWidth={0.8} />
        <text x={tx(-30) - 4} y={ty(H_MM / 2)} textAnchor="middle"
          fontSize={10} fill="#475569" fontFamily="system-ui"
          transform={`rotate(-90, ${tx(-30) - 4}, ${ty(H_MM / 2)})`}>
          {closet.alto} {closet.unidades}
        </text>
      </g>
    );

    // Column widths
    for (let ci = 0; ci < closet.columnas.length; ci++) {
      const col = closet.columnas[ci];
      const cx1 = colXMm[ci];
      const cx2 = cx1 + col.ancho * 10;
      const cotaY = ty(H_MM + 18);
      elements.push(
        <g key={`cota-col-${ci}`}>
          <line x1={tx(cx1)} y1={cotaY - 4} x2={tx(cx2)} y2={cotaY - 4} stroke="#94A3B8" strokeWidth={0.7} />
          <line x1={tx(cx1)} y1={cotaY - 7} x2={tx(cx1)} y2={cotaY - 1} stroke="#94A3B8" strokeWidth={0.7} />
          <line x1={tx(cx2)} y1={cotaY - 7} x2={tx(cx2)} y2={cotaY - 1} stroke="#94A3B8" strokeWidth={0.7} />
          <text x={tx(cx1 + col.ancho * 5)} y={cotaY + 6} textAnchor="middle"
            fontSize={9} fill="#64748B" fontFamily="system-ui">
            {col.ancho}
          </text>
        </g>
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-full"
      style={{ maxHeight: '100%', display: 'block' }}
    >
      <defs>
        <pattern id="wood-grain" patternUnits="userSpaceOnUse" width="8" height="40" patternTransform="rotate(85)">
          <rect width="8" height="40" fill={matColor} />
          <line x1="3" y1="0" x2="3" y2="40" stroke={matDark} strokeWidth="0.5" opacity="0.3" />
          <line x1="6" y1="0" x2="6" y2="40" stroke={matDark} strokeWidth="0.3" opacity="0.2" />
        </pattern>
      </defs>
      {elements}
    </svg>
  );
}

function renderElementDetails(
  elem: Elemento,
  ex: number, ey: number, ew: number, eh: number,
  esp: number,
  scale: number,
  tx: (x: number) => number,
  ty: (y: number) => number,
  ts: (mm: number) => number,
  matColor: string,
  matDark: string,
  key: number,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  switch (elem.tipo) {
    case 'barra': {
      // Bar line near top of space
      const barY = ey + eh - esp - 20;
      if (ts(eh) > 30) {
        nodes.push(
          <line key={`bar-line-${key}`}
            x1={tx(ex + 10)} y1={ty(barY)} x2={tx(ex + ew - 10)} y2={ty(barY)}
            stroke="#1D4ED8" strokeWidth={2.5} strokeLinecap="round" />
        );
        // Hanger symbols
        const nHangers = Math.min(4, Math.floor(ew / 80));
        for (let i = 0; i < nHangers; i++) {
          const hx = ex + 40 + i * (ew / nHangers);
          nodes.push(
            <g key={`hanger-${key}-${i}`}>
              <line x1={tx(hx)} y1={ty(barY)} x2={tx(hx)} y2={ty(barY - 30)} stroke="#60A5FA" strokeWidth={1} />
              <line x1={tx(hx - 15)} y1={ty(barY - 120)} x2={tx(hx + 15)} y2={ty(barY - 120)} stroke="#60A5FA" strokeWidth={1.5} />
              <line x1={tx(hx - 15)} y1={ty(barY - 120)} x2={tx(hx)} y2={ty(barY - 30)} stroke="#60A5FA" strokeWidth={1} />
              <line x1={tx(hx + 15)} y1={ty(barY - 120)} x2={tx(hx)} y2={ty(barY - 30)} stroke="#60A5FA" strokeWidth={1} />
            </g>
          );
        }
      }
      break;
    }
    case 'repisa': {
      // Draw each shelf panel
      const sepMm = elem.separacion * 10;
      for (let i = 0; i <= elem.cantidad; i++) {
        const shelfY = ey + i * (sepMm + esp);
        if (i < elem.cantidad) {
          nodes.push(
            <rect key={`shelf-${key}-${i}`}
              x={tx(ex)} y={ty(shelfY + esp)}
              width={ts(ew)} height={ts(esp)}
              fill={matColor} stroke={matDark} strokeWidth={0.8} />
          );
        }
      }
      break;
    }
    case 'cajonera': {
      // Draw drawer fronts
      let dy = ey;
      for (let i = 0; i < elem.cajones.length; i++) {
        const cajon = elem.cajones[i];
        const cajonH = cajon.altura * 10;
        nodes.push(
          <rect key={`cajon-front-${key}-${i}`}
            x={tx(ex + 4)} y={ty(dy + cajonH)}
            width={ts(ew - 8)} height={ts(cajonH - 2)}
            fill={matColor} stroke={matDark} strokeWidth={0.8} rx={1} />
        );
        // Handle
        if (ts(cajonH) > 10) {
          nodes.push(
            <rect key={`cajon-handle-${key}-${i}`}
              x={tx(ex + ew / 2 - 20)} y={ty(dy + cajonH / 2 + 5)}
              width={ts(40)} height={ts(8)} rx={1}
              fill="#94A3B8" />
          );
        }
        dy += cajonH + esp;
      }
      break;
    }
    case 'zapatera': {
      const sepMm = REGLAS.SEPARACION_ZAPATERA_CM * 10;
      for (let i = 0; i < elem.niveles; i++) {
        const shelfY = ey + i * sepMm;
        const angle = elem.tipoZapatera === 'inclinada' ? 12 : 0;
        const rightDrop = ts(ew) * Math.sin((angle * Math.PI) / 180);
        const shelfPx = { x: tx(ex), y: ty(shelfY + esp / 2) };
        if (elem.tipoZapatera === 'inclinada') {
          nodes.push(
            <line key={`zap-${key}-${i}`}
              x1={shelfPx.x} y1={shelfPx.y}
              x2={shelfPx.x + ts(ew)} y2={shelfPx.y - rightDrop}
              stroke="#16A34A" strokeWidth={ts(esp)} strokeLinecap="round" />
          );
        } else {
          nodes.push(
            <rect key={`zap-${key}-${i}`}
              x={shelfPx.x} y={shelfPx.y - ts(esp / 2)}
              width={ts(ew)} height={ts(esp)}
              fill={matColor} stroke={matDark} strokeWidth={0.8} />
          );
        }
      }
      break;
    }
  }

  return nodes;
}
