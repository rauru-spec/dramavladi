export const REGLAS = {
  VANO_MAX_18MM: 90,
  VANO_MAX_15MM: 80,
  SEPARACION_MIN_ROPA_DOBLADA: 30,

  ALTURA_MIN_BARRA_LARGA: 150,
  ALTURA_MIN_BARRA_MEDIA: 110,
  ALTURA_MIN_BARRA_DOBLE: 90,
  PROFUNDIDAD_MIN_COLGAR: 50,
  ALTURA_MAX_BARRA: 200,
  LARGO_MAX_BARRA_SIN_SOPORTE: 90,

  ANCHO_MIN_CAJON: 40,
  ANCHO_MAX_CAJON: 90,
  CORREDERAS_STD: [300, 350, 400, 450, 500] as const,
  ALTURA_MIN_CAJON_FRENTE: 10,
  ALTURA_MAX_CAJON_FRENTE: 30,

  SEPARACION_ZAPATERA_CM: 17,

  PROFUNDIDAD_MIN: 50,
  ALTO_MAX: 250,
  ANCHO_MAX_MODULO: 90,
} as const;

export const COLORES_TABLERO = [
  { id: 'blanco-perla',  nombre: 'Blanco Perla',  hex: '#F2EFEA' },
  { id: 'gris-platino',  nombre: 'Gris Platino',  hex: '#C8C8C8' },
  { id: 'negro-mate',    nombre: 'Negro Mate',     hex: '#2D2D2D' },
  { id: 'roble-natural', nombre: 'Roble Natural',  hex: '#C49A5A' },
  { id: 'nogal-oscuro',  nombre: 'Nogal Oscuro',   hex: '#6B3F2A' },
  { id: 'pino-nordico',  nombre: 'Pino Nórdico',   hex: '#D4A85F' },
  { id: 'gris-cemento',  nombre: 'Gris Cemento',   hex: '#8A8A8A' },
  { id: 'azul-marino',   nombre: 'Azul Marino',    hex: '#1E3A5F' },
] as const;

export type ColorId = (typeof COLORES_TABLERO)[number]['id'];

export function getColorHex(colorId: string): string {
  return COLORES_TABLERO.find(c => c.id === colorId)?.hex ?? '#F2EFEA';
}

export function getColorNombre(colorId: string): string {
  return COLORES_TABLERO.find(c => c.id === colorId)?.nombre ?? 'Blanco Perla';
}

export function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toHex = (v: number) => Math.min(255, Math.round(v * factor)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
