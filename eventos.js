// ============================================
// DANFER SEXSHOP - SISTEMA DE EVENTOS
// ============================================

// Lista de eventos configurables
const eventos = [
  {
    id: 'rebaja_global_abril',
    titulo: '🔥DISPONIBLE HASTA EL 15 DE ABRIL🔥',
    mensaje: '¡10% de descuento en TODOS los productos!',
    descuento: 10, // porcentaje
    fechaInicio: '2026-04-01',
    fechaFin: '2026-04-15',
    activo: true,   // si es false, se ignora aunque esté en fechas
    tipo: 'descuento_global'
  }
  // Puedes agregar más eventos aquí
];

// Obtener evento activo (el primero que cumpla condiciones)
function getEventoActivo() {
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  
  for (const ev of eventos) {
    if (!ev.activo) continue;
    const inicio = new Date(ev.fechaInicio);
    const fin = new Date(ev.fechaFin);
    inicio.setHours(0,0,0,0);
    fin.setHours(23,59,59,999);
    
    if (hoy >= inicio && hoy <= fin) {
      return ev;
    }
  }
  return null;
}

// Verificar si hay descuento global activo
function hayDescuentoGlobal() {
  const ev = getEventoActivo();
  return ev && ev.tipo === 'descuento_global' ? ev.descuento : 0;
}

// Obtener el mensaje del evento activo (para mostrar banner)
function getEventoMensaje() {
  const ev = getEventoActivo();
  if (ev) {
    return { titulo: ev.titulo, mensaje: ev.mensaje };
  }
  return null;
}
