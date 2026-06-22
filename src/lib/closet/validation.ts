import { Closet, Columna, Elemento, ValidationMessage } from './types';
import { REGLAS } from './constants';

let _seq = 0;
function vid() { return `v${++_seq}`; }

function vanoMax(espesor: 15 | 18): number {
  return espesor === 18 ? REGLAS.VANO_MAX_18MM : REGLAS.VANO_MAX_15MM;
}

export function alturaElemento(elem: Elemento, esp: number): number {
  // returns height in cm occupied by this element
  switch (elem.tipo) {
    case 'barra':      return elem.alturaLibre + esp / 10;
    case 'repisa':     return elem.cantidad * (elem.separacion + esp / 10);
    case 'cajonera':   return elem.cajones.reduce((s, c) => s + c.altura + esp / 10, 0);
    case 'zapatera':   return elem.niveles * REGLAS.SEPARACION_ZAPATERA_CM;
    case 'espacioLibre': return elem.altura;
  }
}

export function alturaColumna(columna: Columna, esp: number): number {
  return columna.elementos.reduce((s, e) => s + alturaElemento(e, esp), 0);
}

export function alturaInterior(closet: Closet): number {
  const esp = closet.espesorTablero / 10;
  return closet.alto - 2 * esp;
}

export function anchoInterior(closet: Closet): number {
  const esp = closet.espesorTablero / 10;
  return closet.ancho - (closet.columnas.length + 1) * esp;
}

export function validarCloset(closet: Closet): ValidationMessage[] {
  const msgs: ValidationMessage[] = [];
  const vmax = vanoMax(closet.espesorTablero);
  const esp = closet.espesorTablero / 10;

  if (closet.profundidad < REGLAS.PROFUNDIDAD_MIN) {
    msgs.push({
      id: vid(), tipo: 'error',
      mensaje: `Profundidad insuficiente (${closet.profundidad} cm).`,
      sugerencia: `Mínimo recomendado: ${REGLAS.PROFUNDIDAD_MIN} cm.`,
    });
  }

  if (closet.alto > REGLAS.ALTO_MAX) {
    msgs.push({
      id: vid(), tipo: 'advertencia',
      mensaje: `Altura inusual (${closet.alto} cm).`,
      sugerencia: `El máximo habitual es ${REGLAS.ALTO_MAX} cm.`,
    });
  }

  const sumaColumnas = closet.columnas.reduce((s, c) => s + c.ancho, 0);
  const dispInterior = anchoInterior(closet);
  if (Math.abs(sumaColumnas - dispInterior) > 1.5) {
    msgs.push({
      id: vid(), tipo: 'advertencia',
      mensaje: `Las columnas suman ${sumaColumnas.toFixed(1)} cm, pero el espacio interior disponible es ${dispInterior.toFixed(1)} cm.`,
      sugerencia: 'Ajusta los anchos de columna para que coincidan.',
    });
  }

  const altInt = alturaInterior(closet);

  for (const col of closet.columnas) {
    if (col.ancho > REGLAS.ANCHO_MAX_MODULO) {
      msgs.push({
        id: vid(), tipo: 'advertencia', columnaId: col.id,
        mensaje: `Columna de ${col.ancho} cm supera el vano máximo sin división.`,
        sugerencia: `Máximo: ${REGLAS.ANCHO_MAX_MODULO} cm.`,
      });
    }

    const altCol = alturaColumna(col, closet.espesorTablero);
    if (altCol > altInt + 1) {
      msgs.push({
        id: vid(), tipo: 'error', columnaId: col.id,
        mensaje: `El contenido de la columna (${altCol.toFixed(0)} cm) supera el espacio disponible (${altInt.toFixed(0)} cm).`,
        sugerencia: 'Reduce alturas o elimina elementos.',
      });
    }

    for (const elem of col.elementos) {
      switch (elem.tipo) {
        case 'barra': {
          if (closet.profundidad < REGLAS.PROFUNDIDAD_MIN_COLGAR) {
            msgs.push({
              id: vid(), tipo: 'error', columnaId: col.id, elementoId: elem.id,
              mensaje: `Profundidad insuficiente para barra de colgar (${closet.profundidad} cm).`,
              sugerencia: `Mínimo: ${REGLAS.PROFUNDIDAD_MIN_COLGAR} cm.`,
            });
          }
          const altMin = elem.tipoBarra === 'larga'
            ? REGLAS.ALTURA_MIN_BARRA_LARGA
            : elem.tipoBarra === 'media'
            ? REGLAS.ALTURA_MIN_BARRA_MEDIA
            : REGLAS.ALTURA_MIN_BARRA_DOBLE;
          if (elem.alturaLibre < altMin) {
            msgs.push({
              id: vid(), tipo: 'error', columnaId: col.id, elementoId: elem.id,
              mensaje: `Altura libre insuficiente (${elem.alturaLibre} cm) para barra ${elem.tipoBarra}.`,
              sugerencia: `Mínimo: ${altMin} cm.`,
            });
          }
          if (col.ancho > REGLAS.LARGO_MAX_BARRA_SIN_SOPORTE) {
            msgs.push({
              id: vid(), tipo: 'advertencia', columnaId: col.id, elementoId: elem.id,
              mensaje: `Barra de ${col.ancho} cm puede pandear.`,
              sugerencia: `Máximo sin soporte central: ${REGLAS.LARGO_MAX_BARRA_SIN_SOPORTE} cm.`,
            });
          }
          break;
        }
        case 'repisa': {
          if (col.ancho > vmax) {
            msgs.push({
              id: vid(), tipo: 'advertencia', columnaId: col.id, elementoId: elem.id,
              mensaje: `Repisas de ${col.ancho} cm pueden pandear (máx. ${vmax} cm para tablero de ${closet.espesorTablero} mm).`,
              sugerencia: 'Añade una división vertical intermedia o usa tablero más grueso.',
            });
          }
          if (elem.separacion < REGLAS.SEPARACION_MIN_ROPA_DOBLADA) {
            msgs.push({
              id: vid(), tipo: 'advertencia', columnaId: col.id, elementoId: elem.id,
              mensaje: `Separación entre repisas de ${elem.separacion} cm es baja para ropa doblada.`,
              sugerencia: `Mínimo recomendado: ${REGLAS.SEPARACION_MIN_ROPA_DOBLADA} cm.`,
            });
          }
          break;
        }
        case 'cajonera': {
          if (col.ancho < REGLAS.ANCHO_MIN_CAJON) {
            msgs.push({
              id: vid(), tipo: 'error', columnaId: col.id, elementoId: elem.id,
              mensaje: `Columna de ${col.ancho} cm es muy estrecha para cajones.`,
              sugerencia: `Mínimo: ${REGLAS.ANCHO_MIN_CAJON} cm.`,
            });
          }
          const profCorredera = elem.profundidadCorredera / 10;
          if (profCorredera > closet.profundidad - 5) {
            msgs.push({
              id: vid(), tipo: 'error', columnaId: col.id, elementoId: elem.id,
              mensaje: `Corredera de ${profCorredera} cm no cabe en profundidad de ${closet.profundidad} cm.`,
              sugerencia: `Usa corredera de ${Math.floor((closet.profundidad - 5) / 5) * 5} cm o menos.`,
            });
          }
          for (const c of elem.cajones) {
            if (c.altura < REGLAS.ALTURA_MIN_CAJON_FRENTE) {
              msgs.push({
                id: vid(), tipo: 'advertencia', columnaId: col.id, elementoId: elem.id,
                mensaje: `Frente de cajón de ${c.altura} cm es muy pequeño.`,
                sugerencia: `Mínimo recomendado: ${REGLAS.ALTURA_MIN_CAJON_FRENTE} cm.`,
              });
            }
          }
          break;
        }
      }
    }
  }

  return msgs;
}
