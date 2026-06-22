export type Units = 'cm' | 'in';
export type TableroEspesor = 15 | 18;
export type ClosetTipo = 'empotrado' | 'esquina' | 'exento';
export type MaterialTipo = 'melamina' | 'mdf';
export type CantoTipo = 'pvc' | 'madera' | 'sin-canto';
export type PuertasTipo = 'corredizas' | 'abatibles' | 'ninguna';
export type TiradorTipo = 'barra' | 'boton' | 'perfil' | 'ninguno';
export type BarraTipo = 'larga' | 'media' | 'doble';
export type ZapateraTipo = 'plana' | 'inclinada';
export type CorrederaLargo = 300 | 350 | 400 | 450 | 500;

export interface ElementoBarra {
  id: string;
  tipo: 'barra';
  alturaLibre: number;
  tipoBarra: BarraTipo;
}

export interface ElementoRepisa {
  id: string;
  tipo: 'repisa';
  cantidad: number;
  separacion: number;
}

export interface ElementoCajon {
  id: string;
  altura: number;
}

export interface ElementoCajonera {
  id: string;
  tipo: 'cajonera';
  cajones: ElementoCajon[];
  profundidadCorredera: CorrederaLargo;
}

export interface ElementoZapatera {
  id: string;
  tipo: 'zapatera';
  niveles: number;
  tipoZapatera: ZapateraTipo;
}

export interface ElementoEspacio {
  id: string;
  tipo: 'espacioLibre';
  altura: number;
}

export type Elemento =
  | ElementoBarra
  | ElementoRepisa
  | ElementoCajonera
  | ElementoZapatera
  | ElementoEspacio;

export interface Columna {
  id: string;
  ancho: number;
  elementos: Elemento[];
}

export interface Acabados {
  material: MaterialTipo;
  colorId: string;
  tipoCanto: CantoTipo;
  puertas: PuertasTipo;
  tirador: TiradorTipo;
}

export interface Closet {
  unidades: Units;
  ancho: number;
  alto: number;
  profundidad: number;
  espesorTablero: TableroEspesor;
  tipo: ClosetTipo;
  columnas: Columna[];
  acabados: Acabados;
  precioTablero: number;
  anchoPlancha: number;
  altoPlancha: number;
}

export interface ValidationMessage {
  id: string;
  tipo: 'error' | 'advertencia';
  mensaje: string;
  sugerencia?: string;
  columnaId?: string;
  elementoId?: string;
}

export interface CortePieza {
  id: string;
  nombre: string;
  largo: number;
  ancho: number;
  espesor: number;
  cantidad: number;
  cantos: string[];
  modulo: string;
  material: string;
}

export interface Herraje {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  descripcion?: string;
}

export interface PlanchaLayout {
  numero: number;
  anchoPlancha: number;
  altoPlancha: number;
  piezas: { nombre: string; x: number; y: number; w: number; h: number }[];
  areaPiezas: number;
  areaTotal: number;
}
