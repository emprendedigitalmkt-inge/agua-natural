/* NATURAL LIFE BALANCE · catálogo, pedido y envío a WhatsApp */
(function () {
  "use strict";
  const C = window.OCEAN23;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => "$" + n.toLocaleString("es-MX");
  const byId = Object.fromEntries(C.productos.map(p => [p.id, p]));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- estado ----------
  let cart = sanitize(store.get("o23-cart")) || {};
  function sanitize(obj) {
    if (!obj || typeof obj !== "object") return null;
    const out = {};
    for (const [id, q] of Object.entries(obj)) if (byId[id] && q > 0) out[id] = Math.min(99, q | 0);
    return out;
  }
  const units = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(cart).reduce((a, [id, q]) => a + byId[id].precio * q, 0);

  // ---------- catálogo ----------
  const grid = $("#products");
  grid.innerHTML = C.productos.map(p => `
    <article class="card prod prod--${p.color}" data-id="${p.id}">
      <img class="prod__img" src="${p.img}" alt="${p.nombre} ${p.detalle} Natural" loading="lazy" width="414" height="498">
      <h3>${p.nombre}</h3>
      <p class="prod__det">${p.detalle}</p>
      <p class="prod__price" style="margin:0">${money(p.precio)}</p>
      <div class="qty" aria-label="Cantidad">
        <button type="button" data-step="-1" aria-label="Menos">−</button>
        <span class="js-q" aria-live="polite">1</span>
        <button type="button" data-step="1" aria-label="Más">+</button>
      </div>
      <button type="button" class="btn btn--add"><svg class="ico"><use href="#i-cart"/></svg><span>Agregar</span></button>
    </article>`).join("");

  grid.addEventListener("click", e => {
    const card = e.target.closest(".prod"); if (!card) return;
    const qEl = $(".js-q", card);
    const step = e.target.closest("[data-step]");
    if (step) { qEl.textContent = Math.max(1, Math.min(99, +qEl.textContent + +step.dataset.step)); return; }
    const add = e.target.closest(".btn--add");
    if (add) {
      const id = card.dataset.id;
      cart[id] = Math.min(99, (cart[id] || 0) + +qEl.textContent);
      qEl.textContent = "1";
      add.classList.add("is-added"); $("span", add).textContent = "Agregado";
      setTimeout(() => { add.classList.remove("is-added"); $("span", add).textContent = "Agregar"; }, 1200);
      toast(`${byId[id].nombre} · ${byId[id].detalle} agregado`);
      render();
    }
  });

  // ---------- carrito ----------
  const list = $("#cart-items");
  list.addEventListener("click", e => {
    const li = e.target.closest(".citem"); if (!li) return;
    const id = li.dataset.id;
    const step = e.target.closest("[data-step]");
    if (step) cart[id] = Math.max(0, Math.min(99, cart[id] + +step.dataset.step));
    if (e.target.closest(".citem__del")) cart[id] = 0;
    if (!cart[id]) delete cart[id];
    render();
  });

  function render() {
    const entries = Object.entries(cart);
    list.innerHTML = entries.map(([id, q]) => {
      const p = byId[id];
      return `<li class="citem" data-id="${id}">
        <img src="${p.img}" alt="">
        <span class="citem__name">${p.nombre}<small>${p.detalle}</small></span>
        <span class="qty"><button type="button" data-step="-1" aria-label="Menos">−</button><span>${q}</span><button type="button" data-step="1" aria-label="Más">+</button></span>
        <span class="citem__sum">${money(p.precio * q)}</span>
        <button type="button" class="citem__del" aria-label="Quitar ${p.nombre}"><svg class="ico"><use href="#i-trash"/></svg></button>
      </li>`;
    }).join("");
    const n = units(), t = total();
    const label = n === 1 ? "1 producto" : `${n} productos`;
    $("#cart-empty").hidden = n > 0;
    $("#cart-count").textContent = label;
    $("#cart-total").textContent = money(t);
    $("#mbar-count").textContent = label;
    $("#mbar-total").textContent = money(t);
    $("#mbar").hidden = false;
    $("#mbar").classList.toggle("is-on", n > 0 && !cartVisible);
    document.body.classList.toggle("has-mbar", n > 0);
    store.set("o23-cart", cart);
    updatePreview();
  }

  // ---------- horarios ----------
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const hh = h => { const ap = h < 12 ? "a.m." : "p.m."; const x = h % 12 || 12; return `${x}:00 ${ap}`; };
  function buildSlots() {
    const sel = $("#f-horario"), now = new Date(), prev = sel.value;
    sel.length = 1;
    let added = 0;
    for (let d = 0; d < 7 && added < 8; d++) {
      const day = new Date(now); day.setDate(now.getDate() + d);
      if (C.diasSinServicio.includes(day.getDay())) continue;
      if (d === 0 && now.getHours() >= C.horaCorte) continue;
      const name = d === 0 ? "Hoy" : d === 1 ? "Mañana" : DIAS[day.getDay()][0].toUpperCase() + DIAS[day.getDay()].slice(1) + " " + day.getDate();
      const opts = C.ventanas.filter(([a]) => d > 0 || a >= now.getHours() + now.getMinutes() / 60 + C.anticipacionHoras);
      if (!opts.length) continue;
      const g = document.createElement("optgroup"); g.label = name;
      opts.forEach(([a, b]) => { const o = new Option(`${name}, ${hh(a)} a ${hh(b)}`, `${name}, de ${hh(a)} a ${hh(b)}`); g.append(o); });
      sel.append(g); added++;
      if (added >= 3) break;
    }
    if (prev) sel.value = prev;
  }
  buildSlots();
  setInterval(buildSlots, 5 * 60 * 1000);

  // ---------- formulario ----------
  const form = $("#order-form");
  const f = name => form.elements[name];
  const draft = store.get("o23-datos") || {};
  ["direccion", "referencias"].forEach(k => { if (draft[k]) f(k).value = draft[k]; });

  function message() {
    const lines = Object.entries(cart).map(([id, q]) => {
      const p = byId[id]; return `• ${q} ${p.nombre} (${p.detalle}) — ${money(p.precio * q)}`;
    });
    return [
      `Hola ${C.nombre}, quiero hacer un pedido:`,
      ...(lines.length ? lines : ["• (sin productos)"]),
      `Total estimado: ${money(total())}`,
      "",
      `Dirección: ${f("direccion").value.trim() || "[tu dirección]"}`,
      `Referencias: ${f("referencias").value.trim() || "—"}`,
      `Horario: ${f("horario").value || "[tu horario]"}`,
      ...(geo ? [`Ubicación: https://maps.google.com/?q=${geo.lat},${geo.lng}`] : []),
      `Notas: ${f("notas").value.trim() || "—"}`
    ].join("\n");
  }
  function updatePreview() {
    $("#msg-preview").textContent = message();
    const d = new Date(); $("#msg-time").textContent = d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  form.addEventListener("input", e => { e.target.classList.remove("is-invalid"); updatePreview(); });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#cart-error"); err.textContent = "";
    $$(".is-invalid", form).forEach(x => x.classList.remove("is-invalid"));
    const problems = [];
    if (!units()) problems.push("Agrega al menos un producto.");
    else if (total() < C.pedidoMinimo) problems.push(`El pedido mínimo es de ${money(C.pedidoMinimo)}.`);
    if (!f("direccion").value.trim()) { problems.push("Escribe tu dirección de entrega."); f("direccion").classList.add("is-invalid"); }
    if (!f("horario").value) { problems.push("Selecciona un horario de entrega."); f("horario").classList.add("is-invalid"); }
    if (problems.length) { err.textContent = problems.join(" "); (form.querySelector(".is-invalid") || err).focus?.(); return; }

    store.set("o23-datos", { direccion: f("direccion").value.trim(), referencias: f("referencias").value.trim() });
    store.set("o23-ultimo", cart);
    window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(message())}`, "_blank", "noopener");
    toast("Abriendo WhatsApp…");
    refreshRepeat();
  });

  // ---------- ubicación del cliente ----------
  let geo = null;
  const geoBtn = $("#geo-btn"), geoStatus = $("#geo-status");
  function kmBetween(a, b) {
    const R = 6371, rad = x => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  if (!("geolocation" in navigator)) geoBtn.hidden = true;
  geoBtn.addEventListener("click", () => {
    geoBtn.disabled = true; geoStatus.className = "geo__status"; geoStatus.textContent = "Obteniendo tu ubicación…";
    navigator.geolocation.getCurrentPosition(pos => {
      geo = { lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) };
      const s = C.sucursales.principal, km = kmBetween(geo, s);
      geoBtn.disabled = false; geoBtn.classList.add("is-ok"); $("span", geoBtn).textContent = "Ubicación agregada ✓";
      if (km > s.coberturaKm) {
        geoStatus.className = "geo__status is-warn";
        geoStatus.textContent = `Estás a ${km.toFixed(1)} km de la sucursal, fuera de la zona de reparto (${s.coberturaKm} km). Puedes enviar tu pedido y te confirmamos por WhatsApp.`;
      } else {
        geoStatus.className = "geo__status is-ok";
        geoStatus.textContent = "Se enviará un enlace a tu ubicación junto con el pedido.";
      }
      updatePreview();
    }, err => {
      geoBtn.disabled = false;
      geoStatus.className = "geo__status is-warn";
      geoStatus.textContent = err.code === 1
        ? "No diste permiso de ubicación. Puedes activarlo en tu navegador o enviar solo la dirección."
        : "No pudimos obtener tu ubicación. Envía tu dirección y referencias.";
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });

  // ---------- repetir último pedido ----------
  function refreshRepeat() {}
  $$(".js-repeat").forEach(b => b.addEventListener("click", () => {
    const last = sanitize(store.get("o23-ultimo"));
    if (!last || !Object.keys(last).length) {
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
      toast("Aún no tienes pedidos anteriores en este teléfono");
      return;
    }
    cart = { ...last }; render();
    document.getElementById("pedido").scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Cargamos tu último pedido");
  }));
  refreshRepeat();

  // ---------- botones de WhatsApp sin carrito ----------
  // El botón del encabezado abre un chat directo; los demás CTA llevan al catálogo.
  $$(".js-wa-direct").forEach(a => {
    a.href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(`Hola ${C.nombre}, quiero hacer un pedido de agua a domicilio.`)}`;
    a.target = "_blank"; a.rel = "noopener";
  });

  // ---------- barra móvil: ocultar cuando el carrito está a la vista ----------
  let cartVisible = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { cartVisible = en.isIntersecting; $("#mbar").classList.toggle("is-on", units() > 0 && !cartVisible); })
      .observe($("#pedido"));
  }

  // ---------- nav activo ----------
  const links = $$(".topbar__nav a");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(ents => ents.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["inicio", "como-pedir", "catalogo", "cobertura", "contacto"].forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ---------- mapa ----------
  function initMap() {
    const s = C.sucursales.principal;
    if (!window.L) return;
    const map = L.map("map", { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([s.lat, s.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(map);
    const circle = L.circle([s.lat, s.lng], { radius: s.coberturaKm * 1000, color: "#1e88ef", weight: 2, fillColor: "#1e88ef", fillOpacity: .18 }).addTo(map);
    const pin = L.divIcon({ className: "", html: '<svg width="30" height="38" viewBox="0 0 24 30"><path fill="#0d3590" d="M12 0a10 10 0 0 0-10 10c0 7.5 10 20 10 20s10-12.5 10-20A10 10 0 0 0 12 0Z"/><circle cx="12" cy="10" r="4" fill="#fff"/></svg>', iconSize: [30, 38], iconAnchor: [15, 38] });
    L.marker([s.lat, s.lng], { icon: pin, title: s.nombre }).addTo(map).bindTooltip("San José del Consuelo", { permanent: true, direction: "right", offset: [8, -20] });
    map.fitBounds(circle.getBounds(), { padding: [10, 10] });
  }
  const mapEl = $("#map");
  if ("IntersectionObserver" in window) {
    const mo = new IntersectionObserver(([en]) => { if (en.isIntersecting) { mo.disconnect(); initMap(); } }, { rootMargin: "300px" });
    mo.observe(mapEl);
  } else initMap();

  // ---------- util ----------
  let tt;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("is-on"), 1800); }
  $("#year").textContent = new Date().getFullYear();

  render();
})();
