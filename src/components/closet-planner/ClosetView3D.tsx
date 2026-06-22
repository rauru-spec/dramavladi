'use client';

import React from 'react';
import { Closet, Elemento } from '@/lib/closet/types';
import { getColorHex, adjustBrightness, REGLAS } from '@/lib/closet/constants';
import { alturaElemento } from '@/lib/closet/validation';

interface Props {
  closet: Closet;
  doorsOpen: boolean;
}

// Cabinet oblique projection
const ANGLE = 30 * (Math.PI / 180);
const DEPTH_FACTOR = 0.42;

interface Point2D { x: number; y: number }

function project(x: number, y: number, z: number, scale: number, ox: number, oy: number): Point2D {
  return {
    x: ox + x * scale + z * DEPTH_FACTOR * Math.cos(ANGLE) * scale,
    y: oy - y * scale - z * DEPTH_FACTOR * Math.sin(ANGLE) * scale,
  };
}

function pts(points: Point2D[]): string {
  return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function face(
  corners: [number, number, number][],
  scale: number, ox: number, oy: number
): string {
  return pts(corners.map(([x, y, z]) => project(x, y, z, scale, ox, oy)));
}

interface Props3D { closet: Closet; doorsOpen: boolean }

export function ClosetView3D({ closet, doorsOpen }: Props3D) {
  const esp = closet.espesorTablero / 10;
  const W = closet.ancho;
  const H = closet.alto;
  const D = closet.profundidad;
  const matColor = getColorHex(closet.acabados.colorId);
  const matFront = matColor;
  const matTop = adjustBrightness(matColor, 0.82);
  const matSide = adjustBrightness(matColor, 0.68);
  const matInner = adjustBrightness(matColor, 0.92);

  const VIEW_W = 640;
  const VIEW_H = 520;

  // Calculate scale to fit
  const maxW = W + D * DEPTH_FACTOR * Math.cos(ANGLE);
  const maxH = H + D * DEPTH_FACTOR * Math.sin(ANGLE);
  const scale = Math.min((VIEW_W * 0.72) / maxW, (VIEW_H * 0.8) / maxH);

  const ox = VIEW_W * 0.14;
  const oy = VIEW_H * 0.88;

  const P = (x: number, y: number, z: number) => project(x, y, z, scale, ox, oy);

  const elems: React.ReactNode[] = [];
  let k = 0;

  function addFace(corners: [number, number, number][], fill: string, stroke: string, opacity = 1) {
    const d = 'M ' + corners.map(([x, y, z]) => {
      const p = P(x, y, z);
      return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }).join(' L ') + ' Z';
    elems.push(
      <path key={`f${k++}`} d={d} fill={fill} stroke={stroke}
        strokeWidth={0.7} opacity={opacity} />
    );
  }

  // ── Back plane ─────────────────────────────────────────────────────────────
  addFace([[0, 0, D], [W, 0, D], [W, H, D], [0, H, D]], adjustBrightness(matColor, 0.5), '#334155');

  // ── Right side face ────────────────────────────────────────────────────────
  addFace([[W, 0, 0], [W, 0, D], [W, H, D], [W, H, 0]], matSide, '#334155');

  // ── Top face ───────────────────────────────────────────────────────────────
  addFace([[0, H, 0], [W, H, 0], [W, H, D], [0, H, D]], matTop, '#334155');

  // ── Front face (panels) ────────────────────────────────────────────────────
  // Left lateral
  addFace([[0, 0, 0], [esp, 0, 0], [esp, H, 0], [0, H, 0]], matFront, '#475569');
  // Right lateral
  addFace([[W - esp, 0, 0], [W, 0, 0], [W, H, 0], [W - esp, H, 0]], matFront, '#475569');
  // Top panel
  addFace([[esp, H - esp, 0], [W - esp, H - esp, 0], [W - esp, H, 0], [esp, H, 0]], matFront, '#475569');
  // Bottom panel
  addFace([[esp, 0, 0], [W - esp, 0, 0], [W - esp, esp, 0], [esp, esp, 0]], matFront, '#475569');

  // ── Bottom panel (top face visible) ────────────────────────────────────────
  addFace([[esp, esp, 0], [W - esp, esp, 0], [W - esp, esp, D], [esp, esp, D]], matTop, '#475569');

  // ── Column divisions (interior visible) ───────────────────────────────────
  let cxAcc = esp;
  for (let ci = 0; ci < closet.columnas.length; ci++) {
    const col = closet.columnas[ci];
    cxAcc += col.ancho;
    if (ci < closet.columnas.length - 1) {
      const dx = cxAcc;
      addFace(
        [[dx, esp, 0], [dx + esp, esp, 0], [dx + esp, H - esp, 0], [dx, H - esp, 0]],
        matFront, '#475569'
      );
      addFace(
        [[dx, H - esp, 0], [dx + esp, H - esp, 0], [dx + esp, H - esp, D], [dx, H - esp, D]],
        matTop, '#475569'
      );
      cxAcc += esp;
    }
  }

  // ── Interior shelves and elements (visible when open) ─────────────────────
  if (doorsOpen || closet.acabados.puertas === 'ninguna') {
    let colX = esp;
    for (let ci = 0; ci < closet.columnas.length; ci++) {
      const col = closet.columnas[ci];
      let elemY = esp;

      for (const elem of col.elementos) {
        const hCm = alturaElemento(elem, closet.espesorTablero);
        renderElem3D(elem, colX, elemY, col.ancho, hCm, D, esp, matColor, matInner, addFace, k);
        elemY += hCm;
      }

      colX += col.ancho + esp;
    }
  }

  // ── Doors ─────────────────────────────────────────────────────────────────
  if (closet.acabados.puertas !== 'ninguna' && !doorsOpen) {
    const doorFill = adjustBrightness(matColor, 0.97);
    let dx = esp;
    for (let ci = 0; ci < closet.columnas.length; ci++) {
      const col = closet.columnas[ci];
      addFace(
        [[dx, esp, -0.5], [dx + col.ancho, esp, -0.5],
          [dx + col.ancho, H - esp, -0.5], [dx, H - esp, -0.5]],
        doorFill, '#334155', 0.95
      );
      // Handle
      const hx = dx + col.ancho - 2;
      const hy = H / 2;
      addFace(
        [[hx, hy - 5, -0.8], [hx + 1.5, hy - 5, -0.8],
          [hx + 1.5, hy + 5, -0.8], [hx, hy + 5, -0.8]],
        '#64748B', '#334155'
      );
      dx += col.ancho + esp;
    }
  }

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full" style={{ maxHeight: '100%' }}>
      <defs>
        <linearGradient id="bg3d" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill="url(#bg3d)" />
      {elems}
      {/* Label */}
      <text x="12" y="22" fontSize="11" fill="#94A3B8" fontFamily="system-ui">
        Vista 3D — {closet.ancho}×{closet.alto}×{closet.profundidad} {closet.unidades}
      </text>
    </svg>
  );
}

function renderElem3D(
  elem: Elemento,
  x: number, y: number,
  w: number, h: number,
  D: number, esp: number,
  matColor: string, matInner: string,
  addFace: (corners: [number, number, number][], fill: string, stroke: string, opacity?: number) => void,
  _k: number,
) {
  switch (elem.tipo) {
    case 'repisa': {
      const sep = elem.separacion;
      for (let i = 0; i <= elem.cantidad; i++) {
        const sy = y + i * (sep + esp / 10);
        // shelf top face
        addFace(
          [[x, sy, 0], [x + w, sy, 0], [x + w, sy, D - esp], [x, sy, D - esp]],
          adjustBrightness(matColor, 0.88), '#475569'
        );
        // shelf front face
        addFace(
          [[x, sy - esp / 10, 0], [x + w, sy - esp / 10, 0],
            [x + w, sy, 0], [x, sy, 0]],
          matColor, '#475569'
        );
      }
      break;
    }
    case 'cajonera': {
      let dy = y;
      for (const cajon of elem.cajones) {
        const ch = cajon.altura;
        const gapZ = 0.5; // slight offset showing the drawer
        addFace(
          [[x + 1, dy, gapZ], [x + w - 1, dy, gapZ],
            [x + w - 1, dy + ch, gapZ], [x + 1, dy + ch, gapZ]],
          adjustBrightness(matColor, 0.93), '#64748B'
        );
        // top face
        addFace(
          [[x + 1, dy + ch, gapZ], [x + w - 1, dy + ch, gapZ],
            [x + w - 1, dy + ch, gapZ + 0.5], [x + 1, dy + ch, gapZ + 0.5]],
          adjustBrightness(matColor, 0.78), '#475569'
        );
        dy += ch + esp / 10;
      }
      break;
    }
    case 'zapatera': {
      const sep = REGLAS.SEPARACION_ZAPATERA_CM;
      for (let i = 0; i < elem.niveles; i++) {
        const sy = y + i * sep;
        addFace(
          [[x, sy, 0], [x + w, sy, 0], [x + w, sy, D * 0.75], [x, sy, D * 0.75]],
          adjustBrightness(matColor, 0.88), '#475569'
        );
      }
      break;
    }
    case 'barra': {
      const barY = y + h - esp / 10 - 2;
      // Simplified bar as thin rect
      addFace(
        [[x + 1, barY, D * 0.2], [x + w - 1, barY, D * 0.2],
          [x + w - 1, barY + 0.5, D * 0.2], [x + 1, barY + 0.5, D * 0.2]],
        '#93C5FD', '#1D4ED8'
      );
      break;
    }
  }
}
