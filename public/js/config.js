/* =========================================================
   NATURAL LIFE BALANCE · Configuración del negocio
   Todo lo editable del sitio vive aquí: productos, precios,
   WhatsApp, horarios y cobertura. No hace falta tocar el HTML.
   ========================================================= */
window.OCEAN23 /* config compartida */ = {
  // Número de WhatsApp que recibe los pedidos: 52 + 10 dígitos, sin espacios.
  whatsapp: "524778429100", // PENDIENTE: poner el WhatsApp real de Natural,

  nombre: "Agua Natural",

  // Reglas de entrega
  pedidoMinimo: 30,       // PENDIENTE confirmar          // MXN
  horaCorte: 18,             // 18 = 6:00 p.m. (pedidos después se agendan al día siguiente)
  anticipacionHoras: 1,      // horas mínimas entre el pedido y la ventana de entrega
  diasSinServicio: [0],  // domingo cerrado       // 0 = domingo … 6 = sábado. Ej.: [0] si no reparten en domingo
  ventanas: [                // ventanas de entrega [inicio, fin] en horas de 24h
    [8, 10], [10, 12], [12, 14], [14, 16], [16, 18]
  ],

  // Catálogo (precios en MXN). img: ruta de la foto del producto.
  productos: [   // PRECIOS PENDIENTES DE CONFIRMAR CON EL CLIENTE
    { id: "garrafon-20l",   nombre: "Garrafón 20 L",       detalle: "Rellenado · agua purificada", precio: 30,  img: "img/prod-garrafon-azul.jpg", color: "azul" },
    { id: "garrafon-nuevo", nombre: "Garrafón 20 L nuevo", detalle: "Envase + agua purificada",    precio: 120, img: "img/prod-garrafon-rosa.jpg", color: "rosa" },
    { id: "paquete-3",      nombre: "Paquete hogar",       detalle: "3 garrafones de 20 L",        precio: 85,  img: "img/prod-paquete.jpg",       color: "azul" }
  ],

  // Sucursales
  sucursales: {
    principal: {
      nombre: "Natural San José del Consuelo",
      etiqueta: "Punto de llenado y entrega a domicilio",
      direccion: "C. Plata de San José #416, San José del Consuelo, 37200 León de los Aldama, Gto.",
      lat: 21.16037, lng: -101.66149,   // aproximado (centro de la colonia); confirmar
      coberturaKm: 3                    // PENDIENTE confirmar
    }
  }
};
