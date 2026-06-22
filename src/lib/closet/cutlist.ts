import { Closet, CortePieza, Elemento, PlanchaLayout } from './types';

let _pid = 0;
function pid() { return `p${++_pid}`; }

function mm(cm: number): number { return Math.round(cm * 10); }

export function generarDespiece(closet: Closet): CortePieza[] {
  _pid = 0;
  const piezas: CortePieza[] = [];
  const esp = closet.espesorTablero;
  const A = mm(closet.ancho);
  const H = mm(closet.alto);
  const P = mm(closet.profundidad);
  const nCols = closet.columnas.length;
  const mat = closet.acabados.material === 'melamina' ? 'Melamina' : 'MDF';

  // Laterales externos
  piezas.push({
    id: pid(), nombre: 'Panel lateral exterior',
    largo: H, ancho: P, espesor: esp, cantidad: 2,
    cantos: ['Frente'], modulo: 'Estructura', material: mat,
  });

  // Techo
  piezas.push({
    id: pid(), nombre: 'Panel superior (techo)',
    largo: A - 2 * esp, ancho: P, espesor: esp, cantidad: 1,
    cantos: ['Frente'], modulo: 'Estructura', material: mat,
  });

  // Base
  piezas.push({
    id: pid(), nombre: 'Panel inferior (base)',
    largo: A - 2 * esp, ancho: P, espesor: esp, cantidad: 1,
    cantos: ['Frente'], modulo: 'Estructura', material: mat,
  });

  // Divisiones internas
  if (nCols > 1) {
    piezas.push({
      id: pid(), nombre: 'División vertical interior',
      largo: H - 2 * esp, ancho: P, espesor: esp, cantidad: nCols - 1,
      cantos: ['Frente'], modulo: 'Estructura', material: mat,
    });
  }

  // Fondo trasero (6mm HDF)
  piezas.push({
    id: pid(), nombre: 'Fondo trasero',
    largo: A, ancho: H, espesor: 6, cantidad: 1,
    cantos: [], modulo: 'Estructura', material: 'HDF 6mm',
  });

  // Elementos por columna
  for (let i = 0; i < closet.columnas.length; i++) {
    const col = closet.columnas[i];
    const label = `Columna ${i + 1}`;
    const anchoIntMm = mm(col.ancho);

    for (const elem of col.elementos) {
      generarPiezasElemento(elem, anchoIntMm, P, esp, mat, label, piezas);
    }
  }

  return piezas;
}

function generarPiezasElemento(
  elem: Elemento,
  anchoInt: number,
  prof: number,
  esp: number,
  mat: string,
  colLabel: string,
  piezas: CortePieza[],
) {
  switch (elem.tipo) {
    case 'repisa':
      piezas.push({
        id: pid(), nombre: 'Repisa / Balda',
        largo: anchoInt, ancho: prof - esp, espesor: esp, cantidad: elem.cantidad,
        cantos: ['Frente'], modulo: colLabel, material: mat,
      });
      break;

    case 'cajonera': {
      const holgura = 25; // 12.5mm each side x2
      const anchoCajon = anchoInt - holgura - 2 * esp;
      const profCajon = elem.profundidadCorredera;

      for (const cajon of elem.cajones) {
        const altFrente = Math.round(cajon.altura * 10);
        const altInterior = altFrente - esp;

        piezas.push({
          id: pid(), nombre: 'Frente de cajón',
          largo: anchoInt, ancho: altFrente, espesor: esp, cantidad: 1,
          cantos: ['Todo el perímetro'], modulo: colLabel, material: mat,
        });
        piezas.push({
          id: pid(), nombre: 'Lateral de cajón',
          largo: profCajon, ancho: altInterior, espesor: esp, cantidad: 2,
          cantos: [], modulo: colLabel, material: mat,
        });
        piezas.push({
          id: pid(), nombre: 'Base de cajón',
          largo: anchoCajon, ancho: profCajon, espesor: 6, cantidad: 1,
          cantos: [], modulo: colLabel, material: 'HDF 6mm',
        });
        piezas.push({
          id: pid(), nombre: 'Frontal interior cajón',
          largo: anchoCajon, ancho: altInterior, espesor: esp, cantidad: 1,
          cantos: [], modulo: colLabel, material: mat,
        });
      }
      break;
    }

    case 'zapatera':
      piezas.push({
        id: pid(), nombre: `Repisa zapatera${elem.tipoZapatera === 'inclinada' ? ' (inclinada)' : ''}`,
        largo: anchoInt, ancho: Math.round(prof * 0.75), espesor: esp,
        cantidad: elem.niveles,
        cantos: ['Frente'], modulo: colLabel, material: mat,
      });
      break;

    case 'barra':
    case 'espacioLibre':
      break;
  }
}

export function calcularPlanchas(
  piezas: CortePieza[],
  anchoPlancha: number,
  altoPlancha: number,
): { planchas: PlanchaLayout[]; desperdicioPct: number } {
  const W = anchoPlancha * 10;
  const H = altoPlancha * 10;
  const GAP = 4;

  const expandidas: { nombre: string; w: number; h: number }[] = [];
  for (const p of piezas) {
    if (p.espesor < 10) continue; // skip thin HDF
    for (let i = 0; i < p.cantidad; i++) {
      const w = Math.max(p.largo, p.ancho);
      const h = Math.min(p.largo, p.ancho);
      if (w <= W && h <= H) {
        expandidas.push({ nombre: p.nombre, w, h });
      }
    }
  }

  expandidas.sort((a, b) => b.h - a.h || b.w - a.w);

  const planchas: PlanchaLayout[] = [];
  let cur: PlanchaLayout | null = null;
  let cx = 0, cy = 0, rowH = 0;
  let totalPiezasArea = 0;

  const newPlancha = (): PlanchaLayout => ({
    numero: planchas.length + 1,
    anchoPlancha: W, altoPlancha: H,
    piezas: [], areaPiezas: 0, areaTotal: W * H,
  });

  cur = newPlancha();

  for (const p of expandidas) {
    if (cx + p.w + GAP > W) {
      cy += rowH + GAP;
      cx = 0;
      rowH = 0;
    }
    if (cy + p.h + GAP > H) {
      planchas.push(cur);
      cur = newPlancha();
      cx = 0; cy = 0; rowH = 0;
    }
    cur.piezas.push({ nombre: p.nombre, x: cx, y: cy, w: p.w, h: p.h });
    cur.areaPiezas += p.w * p.h;
    totalPiezasArea += p.w * p.h;
    cx += p.w + GAP;
    rowH = Math.max(rowH, p.h);
  }

  if (cur && cur.piezas.length > 0) planchas.push(cur);

  const totalSheetArea = planchas.length * W * H;
  const desperdicioPct = totalSheetArea > 0
    ? Math.round(((totalSheetArea - totalPiezasArea) / totalSheetArea) * 100)
    : 0;

  return { planchas, desperdicioPct };
}
