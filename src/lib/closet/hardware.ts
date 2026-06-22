import { Closet, Herraje } from './types';

let _hid = 0;
function hid() { return `h${++_hid}`; }

export function generarHerrajes(closet: Closet): Herraje[] {
  _hid = 0;
  const h: Herraje[] = [];

  let totalRepisas = 0;
  let totalBarrasCm = 0;
  let totalBisagras = 0;
  let totalCajones = 0;
  const correderasMap: Record<number, number> = {};

  for (const col of closet.columnas) {
    for (const elem of col.elementos) {
      switch (elem.tipo) {
        case 'repisa':
          totalRepisas += elem.cantidad;
          break;
        case 'barra':
          totalBarrasCm += col.ancho;
          break;
        case 'cajonera':
          totalCajones += elem.cajones.length;
          correderasMap[elem.profundidadCorredera] =
            (correderasMap[elem.profundidadCorredera] ?? 0) + elem.cajones.length;
          break;
      }
    }
  }

  // Puertas
  if (closet.acabados.puertas !== 'ninguna') {
    const nPuertas = closet.columnas.length;
    totalBisagras = nPuertas * 4;
    h.push({
      id: hid(), nombre: 'Bisagra de copete',
      cantidad: totalBisagras, unidad: 'pza',
      descripcion: 'Para puertas abatibles, incluye tornillos',
    });
    if (closet.acabados.puertas === 'corredizas') {
      h.push({
        id: hid(), nombre: 'Kit guía corredera puertas deslizantes',
        cantidad: 1, unidad: 'kit',
        descripcion: 'Perfil aluminio superior e inferior + rodamientos',
      });
    }
  }

  // Repisas
  if (totalRepisas > 0) {
    h.push({
      id: hid(), nombre: 'Clavija soporte de repisa (Ø5mm)',
      cantidad: totalRepisas * 4, unidad: 'pza',
      descripcion: 'Soporte metálico ajustable en cremallera',
    });
  }

  // Barras de colgar
  if (totalBarrasCm > 0) {
    h.push({
      id: hid(), nombre: 'Tubo barra redondo Ø25mm cromado',
      cantidad: Math.ceil(totalBarrasCm / 100 * 10) / 10, unidad: 'm',
      descripcion: 'Tubo de acero cromado para colgar',
    });
    const nBarras = closet.columnas.filter(c => c.elementos.some(e => e.tipo === 'barra')).length;
    h.push({
      id: hid(), nombre: 'Soporte de barra lateral',
      cantidad: nBarras * 2, unidad: 'par',
      descripcion: 'Soporte roscado para fijar barra al panel',
    });
  }

  // Correderas
  for (const [tipo, cant] of Object.entries(correderasMap)) {
    h.push({
      id: hid(), nombre: `Corredera telescópica extracción total ${tipo} mm`,
      cantidad: cant, unidad: 'par',
      descripcion: 'Con cierre suave (soft-close)',
    });
  }

  // Tiradores
  if (closet.acabados.tirador !== 'ninguno') {
    const totalTiradores =
      (closet.acabados.puertas !== 'ninguna' ? closet.columnas.length : 0) + totalCajones;
    if (totalTiradores > 0) {
      h.push({
        id: hid(), nombre: `Tirador tipo ${closet.acabados.tirador}`,
        cantidad: totalTiradores, unidad: 'pza',
        descripcion: 'Incluye tornillo de fijación',
      });
    }
  }

  // Tornillos y confirmats
  const nPaneles = (closet.columnas.length + 1) * 2 + closet.columnas.length * 2;
  h.push({
    id: hid(), nombre: 'Tornillo Euroscrew 5×50mm',
    cantidad: nPaneles * 6, unidad: 'pza',
    descripcion: 'Para uniones estructurales panel a panel',
  });
  h.push({
    id: hid(), nombre: 'Tornillo aglomerado 3.5×16mm',
    cantidad: totalRepisas * 8 + 30, unidad: 'pza',
    descripcion: 'Para accesorios y acabados',
  });

  // Tarugos / clavijas de unión
  h.push({
    id: hid(), nombre: 'Tarugo madera Ø8×35mm',
    cantidad: nPaneles * 4, unidad: 'pza',
    descripcion: 'Para alinear uniones horizontales',
  });

  return h;
}
