/* AGUA NATURAL · pedido y envío a WhatsApp */
(function () {
  "use strict";
  const C = window.NATURAL;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const P = C.producto;
  const money = n => "$" + n.toLocaleString("es-MX");
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const waLink = text => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;

  // ---------- estado ----------
  let qty = 0;            // garrafones en el pedido
  let pick = 1;           // selector del producto
  let recurrente = false;
  let geo = null;
  const form = $("#order-form");
  const f = n => form.elements[n];

  // ---------- producto ----------
  $("#prod-name").textContent = P.nombre;
  $("#prod-price").textContent = P.precio ? `${money(P.precio)} por garrafón` : "Precio y disponibilidad se confirman por WhatsApp.";
  $(".prod .qty").addEventListener("click", e => {
    const b = e.target.closest("[data-step]"); if (!b) return;
    pick = Math.max(1, Math.min(50, pick + +b.dataset.step)); $("#prod-q").textContent = pick;
  });
  $("#prod-add").addEventListener("click", e => {
    qty = Math.min(50, qty + pick); pick = 1; $("#prod-q").textContent = 1;
    const btn = e.currentTarget; btn.classList.add("is-added"); $("span", btn).textContent = "Agregado";
    setTimeout(() => { btn.classList.remove("is-added"); $("span", btn).textContent = "Agregar"; }, 1200);
    toast(`${qty} ${qty === 1 ? "garrafón" : "garrafones"} en tu pedido`);
    render();
  });
  $("#cart-qty").addEventListener("click", e => {
    const b = e.target.closest("[data-cstep]"); if (!b) return;
    qty = Math.max(0, Math.min(50, qty + +b.dataset.cstep)); render();
  });

  function render() {
    const has = qty > 0;
    $("#cart-sum").classList.toggle("is-empty", !has);
    $("#cart-qty").hidden = !has;
    $("#cart-q").textContent = qty;
    $("#cart-line").textContent = has
      ? `${P.nombre}${P.precio ? " · " + money(P.precio * qty) : ""}`
      : "Agrega tus garrafones";
    $("#mbar-txt").textContent = has ? `Enviar pedido (${qty})` : "Hacer pedido";
  }

  // ---------- servicios ----------
  const recBtn = $("#svc-rec");
  function setRec(on) {
    recurrente = on; recBtn.setAttribute("aria-pressed", on); $("#rec-field").hidden = !on;
  }
  recBtn.addEventListener("click", () => {
    setRec(!recurrente);
    if (recurrente) { if (!qty) { qty = 1; render(); } toast("Elige cada cuánto quieres tu entrega"); }
  });
  $("#svc-biz").href = waLink(`Hola ${C.nombre}, me interesa el abastecimiento de agua para mi negocio. ¿Me pueden dar información?`);
  $("#svc-biz").target = "_blank"; $("#svc-biz").rel = "noopener";

  // ---------- días y horarios ----------
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const hh = h => { const ap = h < 12 ? "a.m." : "p.m."; return `${h % 12 || 12}:00 ${ap}`; };
  function windowsFor(date, isToday) {
    const r = C.horario[date.getDay()]; if (!r) return [];
    const now = new Date(), out = [];
    for (let a = r[0]; a < r[1]; a += C.bloqueHoras) {
      const b = Math.min(r[1], a + C.bloqueHoras);
      if (isToday && a < now.getHours() + now.getMinutes() / 60 + C.anticipacionHoras) continue;
      out.push([a, b]);
    }
    return out;
  }
  const days = [];
  function buildDays() {
    const sel = f("dia"), prev = sel.value, now = new Date();
    sel.length = 1; days.length = 0;
    for (let d = 0; days.length < C.diasAMostrar && d < 21; d++) {
      const day = new Date(now); day.setDate(now.getDate() + d);
      const w = windowsFor(day, d === 0); if (!w.length) continue;
      const name = d === 0 ? "Hoy" : d === 1 ? "Mañana" : DIAS[day.getDay()][0].toUpperCase() + DIAS[day.getDay()].slice(1);
      const label = `${name} ${day.getDate()} ${MESES[day.getMonth()]}`;
      days.push({ label, w });
      sel.append(new Option(label, label));
    }
    if (prev && days.some(x => x.label === prev)) sel.value = prev;
    buildHours();
  }
  function buildHours() {
    const sel = f("horario"), prev = sel.value, day = days.find(x => x.label === f("dia").value);
    sel.length = 1;
    if (day) day.w.forEach(([a, b]) => sel.append(new Option(`${hh(a)} a ${hh(b)}`, `${hh(a)} a ${hh(b)}`)));
    sel.disabled = !day;
    if (prev && [...sel.options].some(o => o.value === prev)) sel.value = prev;
  }
  f("dia").addEventListener("change", buildHours);
  buildDays();
  setInterval(buildDays, 5 * 60 * 1000);

  // ---------- borrador ----------
  const draft = store.get("nat-datos") || {};
  ["direccion", "referencias"].forEach(k => { if (draft[k]) f(k).value = draft[k]; });

  // ---------- mensaje ----------
  function message() {
    return [
      `Hola ${C.nombre}, quiero hacer un pedido:`,
      `• ${qty} ${qty === 1 ? "garrafón" : "garrafones"} de 19 L (${P.detalle.toLowerCase()})${P.precio ? " — " + money(P.precio * qty) : ""}`,
      ...(recurrente ? [`• Servicio recurrente: ${f("frecuencia").value.toLowerCase()}`] : []),
      "",
      `Dirección: ${f("direccion").value.trim()}`,
      `Referencias: ${f("referencias").value.trim() || "—"}`,
      `Entrega: ${f("dia").value}, de ${f("horario").value}`,
      ...(geo ? [`Ubicación: https://maps.google.com/?q=${geo.lat},${geo.lng}`] : [])
    ].join("\n");
  }

  form.addEventListener("input", e => e.target.classList.remove("is-invalid"));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#cart-error"); err.textContent = "";
    $$(".is-invalid", form).forEach(x => x.classList.remove("is-invalid"));
    const probs = [];
    if (!qty) probs.push("Agrega al menos un garrafón.");
    if (!f("direccion").value.trim()) { probs.push("Escribe tu dirección."); f("direccion").classList.add("is-invalid"); }
    if (!f("dia").value) { probs.push("Elige el día de entrega."); f("dia").classList.add("is-invalid"); }
    else if (!f("horario").value) { probs.push("Elige el horario."); f("horario").classList.add("is-invalid"); }
    if (probs.length) {
      err.textContent = probs.join(" ");
      if (!qty) document.getElementById("pedidos").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    store.set("nat-datos", { direccion: f("direccion").value.trim(), referencias: f("referencias").value.trim() });
    store.set("nat-ultimo", { qty, recurrente, frecuencia: f("frecuencia").value });
    window.open(waLink(message()), "_blank", "noopener");
    toast("Abriendo WhatsApp…");
  });

  // ---------- ubicación ----------
  const geoBtn = $("#geo-btn");
  if (!("geolocation" in navigator)) geoBtn.hidden = true;
  geoBtn.addEventListener("click", () => {
    $("span", geoBtn).textContent = "Obteniendo tu ubicación…";
    navigator.geolocation.getCurrentPosition(pos => {
      geo = { lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) };
      geoBtn.classList.add("is-ok"); $("span", geoBtn).textContent = "Ubicación agregada ✓";
    }, () => {
      $("span", geoBtn).textContent = "No se pudo obtener; envía solo tu dirección";
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });

  // ---------- repetir pedido ----------
  $$(".js-repeat").forEach(b => b.addEventListener("click", () => {
    const last = store.get("nat-ultimo");
    if (!last || !last.qty) {
      document.getElementById("pedidos").scrollIntoView({ behavior: "smooth", block: "start" });
      toast("Aún no tienes pedidos anteriores en este teléfono");
      return;
    }
    qty = Math.min(50, last.qty | 0); setRec(!!last.recurrente);
    if (last.frecuencia) f("frecuencia").value = last.frecuencia;
    render();
    document.getElementById("pedido").scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Cargamos tu último pedido: solo elige día y horario");
  }));

  // ---------- contacto ----------
  $$(".js-wa-direct").forEach(a => {
    a.href = waLink(`Hola ${C.nombre}, quiero pedir agua a domicilio.`); a.target = "_blank"; a.rel = "noopener";
  });
  $("#tel-visible").textContent = C.telefonoVisible;
  const s = C.sucursal;
  $("#suc-nombre").textContent = s.nombre; $("#suc-dir").textContent = s.direccion; $("#suc-map").href = s.mapa;
  const soc = $("#social");
  [["facebook", "i-fb", "Facebook"], ["instagram", "i-ig", "Instagram"]].forEach(([k, ic, lbl]) => {
    if (C.redes[k]) soc.insertAdjacentHTML("beforeend", `<a href="${C.redes[k]}" target="_blank" rel="noopener" aria-label="${lbl}"><svg><use href="#${ic}"/></svg></a>`);
  });

  // ---------- barra móvil ----------
  const mbar = $("#mbar");
  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver(ents => {
      ents.forEach(en => en.isIntersecting ? seen.add(en.target.id) : seen.delete(en.target.id));
      mbar.classList.toggle("is-on", !seen.has("pedido") && !seen.has("inicio"));
    });
    ["inicio", "pedido"].forEach(id => io.observe(document.getElementById(id)));
  }

  // ---------- menú activo ----------
  const links = $$(".top__nav a");
  if ("IntersectionObserver" in window) {
    const io2 = new IntersectionObserver(ents => ents.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["inicio", "como-funciona", "pedidos", "cobertura", "contacto"].forEach(id => io2.observe(document.getElementById(id)));
  }

  let tt;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("is-on"), 2000); }
  $("#year").textContent = new Date().getFullYear();
  render();
})();
