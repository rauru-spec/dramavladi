import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Closet, Columna, Elemento, Acabados, Units, TableroEspesor, BarraTipo, ZapateraTipo, CorrederaLargo } from './types';

let _id = 0;
export function genId() { return `${Date.now().toString(36)}${(++_id).toString(36)}`; }

function calcColumnaAncho(totalAncho: number, nCols: number, esp: number): number {
  const interior = totalAncho - (nCols + 1) * esp;
  return Math.round((interior / nCols) * 10) / 10;
}

export function defaultCloset(): Closet {
  const esp = 1.8; // 18mm in cm
  const total = 240;
  const nCols = 3;
  const colAncho = calcColumnaAncho(total, nCols, esp);

  return {
    unidades: 'cm',
    ancho: total,
    alto: 220,
    profundidad: 58,
    espesorTablero: 18,
    tipo: 'empotrado',
    columnas: [
      {
        id: genId(),
        ancho: colAncho,
        elementos: [
          { id: genId(), tipo: 'barra', alturaLibre: 155, tipoBarra: 'larga' as BarraTipo },
        ],
      },
      {
        id: genId(),
        ancho: colAncho,
        elementos: [
          { id: genId(), tipo: 'barra', alturaLibre: 110, tipoBarra: 'media' as BarraTipo },
          {
            id: genId(), tipo: 'cajonera',
            cajones: [
              { id: genId(), altura: 18 },
              { id: genId(), altura: 18 },
              { id: genId(), altura: 18 },
            ],
            profundidadCorredera: 450 as CorrederaLargo,
          },
        ],
      },
      {
        id: genId(),
        ancho: colAncho,
        elementos: [
          { id: genId(), tipo: 'repisa', cantidad: 5, separacion: 35 },
          { id: genId(), tipo: 'zapatera', niveles: 3, tipoZapatera: 'plana' as ZapateraTipo },
        ],
      },
    ],
    acabados: {
      material: 'melamina',
      colorId: 'blanco-perla',
      tipoCanto: 'pvc',
      puertas: 'ninguna',
      tirador: 'barra',
    },
    precioTablero: 950,
    anchoPlancha: 244,
    altoPlancha: 122,
  };
}

interface ClosetStore {
  closet: Closet;
  activeColumnId: string | null;
  viewMode: '2d' | '3d';
  showCotas: boolean;
  doorsOpen: boolean;

  setUnidades: (u: Units) => void;
  setDimensiones: (ancho: number, alto: number, prof: number) => void;
  setEspesor: (e: TableroEspesor) => void;
  setTipo: (t: Closet['tipo']) => void;
  addColumna: () => void;
  removeColumna: (id: string) => void;
  updateColumnaAncho: (id: string, ancho: number) => void;
  distribuirColumnas: () => void;
  addElemento: (columnaId: string, elem: Elemento) => void;
  removeElemento: (columnaId: string, elemId: string) => void;
  updateElemento: (columnaId: string, elemId: string, data: Partial<Elemento>) => void;
  moveElemento: (columnaId: string, elemId: string, dir: 'up' | 'down') => void;
  setAcabados: (a: Partial<Acabados>) => void;
  setPrecioTablero: (p: number) => void;
  setTamañoPlancha: (ancho: number, alto: number) => void;
  setActiveColumn: (id: string | null) => void;
  setViewMode: (v: '2d' | '3d') => void;
  toggleCotas: () => void;
  toggleDoors: () => void;
  resetCloset: () => void;
}

export const useClosetStore = create<ClosetStore>()(
  persist(
    (set, get) => ({
      closet: defaultCloset(),
      activeColumnId: null,
      viewMode: '2d',
      showCotas: true,
      doorsOpen: false,

      setUnidades: (u) => set((s) => ({ closet: { ...s.closet, unidades: u } })),

      setDimensiones: (ancho, alto, prof) =>
        set((s) => ({ closet: { ...s.closet, ancho, alto, profundidad: prof } })),

      setEspesor: (e) => set((s) => ({ closet: { ...s.closet, espesorTablero: e } })),

      setTipo: (t) => set((s) => ({ closet: { ...s.closet, tipo: t } })),

      addColumna: () =>
        set((s) => {
          const esp = s.closet.espesorTablero / 10;
          const nCols = s.closet.columnas.length + 1;
          const colAncho = calcColumnaAncho(s.closet.ancho, nCols, esp);
          const cols = s.closet.columnas.map((c) => ({ ...c, ancho: colAncho }));
          cols.push({ id: genId(), ancho: colAncho, elementos: [] });
          return { closet: { ...s.closet, columnas: cols } };
        }),

      removeColumna: (id) =>
        set((s) => {
          const cols = s.closet.columnas.filter((c) => c.id !== id);
          if (cols.length === 0) return s;
          const esp = s.closet.espesorTablero / 10;
          const nCols = cols.length;
          const colAncho = calcColumnaAncho(s.closet.ancho, nCols, esp);
          return {
            closet: { ...s.closet, columnas: cols.map((c) => ({ ...c, ancho: colAncho })) },
            activeColumnId: s.activeColumnId === id ? null : s.activeColumnId,
          };
        }),

      updateColumnaAncho: (id, ancho) =>
        set((s) => ({
          closet: {
            ...s.closet,
            columnas: s.closet.columnas.map((c) => (c.id === id ? { ...c, ancho } : c)),
          },
        })),

      distribuirColumnas: () =>
        set((s) => {
          const esp = s.closet.espesorTablero / 10;
          const nCols = s.closet.columnas.length;
          const colAncho = calcColumnaAncho(s.closet.ancho, nCols, esp);
          return {
            closet: {
              ...s.closet,
              columnas: s.closet.columnas.map((c) => ({ ...c, ancho: colAncho })),
            },
          };
        }),

      addElemento: (columnaId, elem) =>
        set((s) => ({
          closet: {
            ...s.closet,
            columnas: s.closet.columnas.map((c) =>
              c.id === columnaId ? { ...c, elementos: [...c.elementos, elem] } : c
            ),
          },
        })),

      removeElemento: (columnaId, elemId) =>
        set((s) => ({
          closet: {
            ...s.closet,
            columnas: s.closet.columnas.map((c) =>
              c.id === columnaId
                ? { ...c, elementos: c.elementos.filter((e) => e.id !== elemId) }
                : c
            ),
          },
        })),

      updateElemento: (columnaId, elemId, data) =>
        set((s) => ({
          closet: {
            ...s.closet,
            columnas: s.closet.columnas.map((c) =>
              c.id === columnaId
                ? {
                    ...c,
                    elementos: c.elementos.map((e) =>
                      e.id === elemId ? ({ ...e, ...data } as Elemento) : e
                    ),
                  }
                : c
            ),
          },
        })),

      moveElemento: (columnaId, elemId, dir) =>
        set((s) => ({
          closet: {
            ...s.closet,
            columnas: s.closet.columnas.map((c) => {
              if (c.id !== columnaId) return c;
              const elems = [...c.elementos];
              const idx = elems.findIndex((e) => e.id === elemId);
              if (idx < 0) return c;
              const target = dir === 'up' ? idx - 1 : idx + 1;
              if (target < 0 || target >= elems.length) return c;
              [elems[idx], elems[target]] = [elems[target], elems[idx]];
              return { ...c, elementos: elems };
            }),
          },
        })),

      setAcabados: (a) =>
        set((s) => ({ closet: { ...s.closet, acabados: { ...s.closet.acabados, ...a } } })),

      setPrecioTablero: (p) => set((s) => ({ closet: { ...s.closet, precioTablero: p } })),

      setTamañoPlancha: (ancho, alto) =>
        set((s) => ({ closet: { ...s.closet, anchoPlancha: ancho, altoPlancha: alto } })),

      setActiveColumn: (id) => set({ activeColumnId: id }),
      setViewMode: (v) => set({ viewMode: v }),
      toggleCotas: () => set((s) => ({ showCotas: !s.showCotas })),
      toggleDoors: () => set((s) => ({ doorsOpen: !s.doorsOpen })),
      resetCloset: () => set({ closet: defaultCloset(), activeColumnId: null }),
    }),
    { name: 'closet-planner-v1' }
  )
);
