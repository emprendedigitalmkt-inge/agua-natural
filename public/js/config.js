/* =========================================================
   AGUA NATURAL · Life balance — Configuración del negocio
   Todo lo editable vive aquí. No hace falta tocar el HTML.
   ========================================================= */
window.NATURAL = {
  nombre: "Agua Natural",

  // WhatsApp que recibe los pedidos: 52 + 10 dígitos, sin espacios.
  // PENDIENTE confirmar: tomado del diseño (477 774 5359).
  whatsapp: "524777745359",
  telefonoVisible: "477 774 5359",

  // Producto que se pide en el sitio. precio: null = se confirma por WhatsApp.
  producto: { nombre: "Garrafón 20 L", detalle: "Agua purificada", precio: null },

  // Días y horario de entrega (0 = domingo … 6 = sábado). [apertura, cierre] en horas 24 h.
  horario: { 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: [8, 14] },
  bloqueHoras: 2,          // tamaño de cada ventana de entrega
  anticipacionHoras: 1,    // tiempo mínimo entre el pedido y la ventana
  diasAMostrar: 7,

  // Punto de llenado
  sucursal: {
    nombre: "Punto de llenado San José del Consuelo",
    direccion: "C. Plata de San José #416, San José del Consuelo, León, Gto.",
    mapa: "https://www.google.com/maps/search/?api=1&query=C.+Plata+de+San+Jos%C3%A9+416,+San+Jos%C3%A9+del+Consuelo,+Le%C3%B3n,+Gto."
  },

  // Redes (déjalas vacías para ocultar los íconos)
  redes: { facebook: "", instagram: "" }
};
