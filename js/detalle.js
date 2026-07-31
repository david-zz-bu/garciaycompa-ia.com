// ============================================================
// Página de detalle de propiedad.
// Lee ?id=X de la URL, busca esa propiedad en Supabase
// y arma el contenido dinámicamente. No existe un archivo HTML
// por propiedad: esta misma plantilla sirve para todas.
// ============================================================

const MAX_FOTOS_GRID = 6;
const COLOR_FALLBACK = "#c9c2b3";
let FOTOS_ACTUALES = [];
let INDICE_LIGHTBOX = 0;

function htmlDescripcion(descripcion) {
  const parrafos = Array.isArray(descripcion) ? descripcion : [descripcion || ""];
  return parrafos
    .filter(Boolean)
    .map(p => `<p class="descripcion-propiedad">${p}</p>`)
    .join("");
}

function formatoPrecioDetalle(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function estiloFondo(valor) {
  return valor.startsWith("#")
    ? `background-color:${valor};`
    : `background-image:url('${valor}'); background-size:cover; background-position:center;`;
}

function tileGaleria(valor, index, esUltimaVisible, restantes) {
  const overlay = (esUltimaVisible && restantes > 0)
    ? `<div class="overlay-mas-fotos">+${restantes} fotos</div>`
    : "";
  return `<div class="galeria-tile" style="${estiloFondo(valor)}" data-index="${index}">${overlay}</div>`;
}

function etiquetaEstadoDetalle(estado) {
  if (!estado || estado === "disponible") return "";
  const textos = { vendido: "VENDIDO", arrendado: "ARRENDADO", reservado: "RESERVADO" };
  const texto = textos[estado] || estado.toUpperCase();
  return `<span class="tag-estado tag-estado-${estado} tag-estado-detalle">${texto}</span>`;
}

function renderizarDetalle(p) {
  document.getElementById("titulo-pagina").textContent = `${p.titulo} | García & Compañía`;
  document.getElementById("detalle-titulo").textContent = p.titulo;

  const tiposNegocio = p.tipo_negocio || [];
  const etiquetaNegocioTexto = tiposNegocio
    .map(t => t.charAt(0).toUpperCase() + t.slice(1))
    .join(" / ");
  const etiquetaSufijo = tiposNegocio.includes("arriendo") && !tiposNegocio.includes("venta") ? "/mes" : "";

  FOTOS_ACTUALES = (p.fotos && p.fotos.length ? p.fotos : [COLOR_FALLBACK]);

  const visibles = FOTOS_ACTUALES.slice(0, MAX_FOTOS_GRID);
  const restantes = FOTOS_ACTUALES.length - MAX_FOTOS_GRID;

  const tilesHtml = visibles.map((f, i) => {
    const esUltimaVisible = i === visibles.length - 1;
    return tileGaleria(f, i, esUltimaVisible, restantes);
  }).join("");

  // Ficha técnica: m² siempre se muestra; el resto solo si el dato existe
  const itemsFicha = [
    { num: Number(p.area).toLocaleString("es-CO"), label: "m²" }
  ];
  if (p.habitaciones > 0) itemsFicha.push({ num: p.habitaciones, label: "Alcobas" });
  if (p.banos > 0) itemsFicha.push({ num: p.banos, label: "Baños" });
  if (p.area_construida) itemsFicha.push({ num: Number(p.area_construida).toLocaleString("es-CO"), label: "m² construidos" });
  if (p.parqueaderos) itemsFicha.push({ num: p.parqueaderos, label: "Parqueaderos" });
  if (p.estrato) itemsFicha.push({ num: p.estrato, label: "Estrato" });
  if (p.antiguedad) itemsFicha.push({ num: p.antiguedad, label: "Año construcción" });
  if (p.pisos) itemsFicha.push({ num: p.pisos, label: "Pisos" });

  const fichaTecnicaHtml = itemsFicha.map(item =>
    `<div class="col-6 col-md-3"><div class="ficha-num">${item.num}</div><div class="ficha-label">${item.label}</div></div>`
  ).join("");

  const codigoHtml = p.codigo
    ? `<div class="codigo-inmueble">Cód. ${p.codigo}</div>`
    : "";

  const adminHtml = p.administracion
    ? `<div class="admin-inmueble">Administración: ${formatoPrecioDetalle(p.administracion)}/mes</div>`
    : "";
  const precioArriendoHtml = p.precio_arriendo
    ? `<div class="precio-arriendo-extra">También disponible en arriendo: ${formatoPrecioDetalle(p.precio_arriendo)}/mes</div>`
    : "";
  const tour360Html = p.tour360
    ? `<a href="${p.tour360}" target="_blank" class="btn-tour360"><i class="bi bi-arrows-fullscreen"></i> Ver tour 360°</a>`
    : "";

  // Mapa de ubicación — solo se muestra si la propiedad ya tiene lat/lng cargados
  const mapaHtml = (p.lat && p.lng)
    ? `<h3 class="titulo-caracteristicas mt-4 mb-3">Ubicación</h3>
       <iframe width="100%" height="350" style="border:0; border-radius:8px;" loading="lazy"
         src="https://www.google.com/maps?q=${p.lat},${p.lng}&output=embed"></iframe>`
    : "";

  const listaCaracteristicasExternas = (p.caracteristicas_externas && p.caracteristicas_externas.length)
    ? `<h3 class="titulo-caracteristicas mt-4 mb-3">Características Externas</h3>
       <ul class="lista-caracteristicas">
         ${p.caracteristicas_externas.map(c => `<li><i class="bi bi-check2"></i>${c}</li>`).join("")}
       </ul>`
    : "";
  const listaCaracteristicasInternas = (p.caracteristicas_internas && p.caracteristicas_internas.length)
    ? `<h3 class="titulo-caracteristicas mt-4 mb-3">Características Internas</h3>
       <ul class="lista-caracteristicas">
         ${p.caracteristicas_internas.map(c => `<li><i class="bi bi-check2"></i>${c}</li>`).join("")}
       </ul>`
    : "";

  document.getElementById("detalle-contenido").innerHTML = `
    <div class="row g-5">
      <div class="col-lg-7">
        <div class="galeria-grid">${tilesHtml}</div>
        ${etiquetaEstadoDetalle(p.estado)}
        ${tour360Html}
        ${listaCaracteristicasExternas}
        ${listaCaracteristicasInternas}
        ${mapaHtml}
      </div>
      <div class="col-lg-5">
        <div class="eyebrow-sec mb-2">${p.ciudad}${p.barrio ? " · " + p.barrio : ""}</div>
        ${codigoHtml}
        <div class="precio-detalle mb-1">${formatoPrecioDetalle(p.precio)}${etiquetaSufijo}</div>
        ${precioArriendoHtml}
        ${adminHtml}
        <div class="tag-negocio-detalle mb-4 mt-2">${etiquetaNegocioTexto}</div>
        <div class="row g-3 mb-4 ficha-tecnica">
          ${fichaTecnicaHtml}
        </div>
        ${htmlDescripcion(p.descripcion)}
        <a href="https://wa.me/573128078855" target="_blank" class="btn btn-primario w-100 mt-3">Preguntar por esta propiedad</a>
      </div>
    </div>`;

  document.querySelectorAll(".galeria-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      abrirLightbox(parseInt(tile.dataset.index, 10));
    });
  });
}

// ---------------- Lightbox (vista completa de todas las fotos) ----------------

function crearLightboxSiNoExiste() {
  if (document.getElementById("lightbox-galeria")) return;
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox-galeria";
  lightbox.className = "lightbox-galeria";
  lightbox.innerHTML = `
    <button class="lightbox-cerrar" aria-label="Cerrar">&times;</button>
    <button class="lightbox-flecha lightbox-anterior" aria-label="Anterior">&#8249;</button>
    <div class="lightbox-imagen" id="lightbox-imagen"></div>
    <button class="lightbox-flecha lightbox-siguiente" aria-label="Siguiente">&#8250;</button>
    <div class="lightbox-contador" id="lightbox-contador"></div>
  `;
  document.body.appendChild(lightbox);

  lightbox.querySelector(".lightbox-cerrar").addEventListener("click", cerrarLightbox);
  lightbox.querySelector(".lightbox-anterior").addEventListener("click", () => moverLightbox(-1));
  lightbox.querySelector(".lightbox-siguiente").addEventListener("click", () => moverLightbox(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target.id === "lightbox-galeria") cerrarLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!document.getElementById("lightbox-galeria").classList.contains("visible")) return;
    if (e.key === "Escape") cerrarLightbox();
    if (e.key === "ArrowLeft") moverLightbox(-1);
    if (e.key === "ArrowRight") moverLightbox(1);
  });
}

function abrirLightbox(index) {
  crearLightboxSiNoExiste();
  INDICE_LIGHTBOX = index;
  pintarLightbox();
  document.getElementById("lightbox-galeria").classList.add("visible");
  document.body.style.overflow = "hidden";
}

function cerrarLightbox() {
  document.getElementById("lightbox-galeria").classList.remove("visible");
  document.body.style.overflow = "";
}

function moverLightbox(delta) {
  INDICE_LIGHTBOX = (INDICE_LIGHTBOX + delta + FOTOS_ACTUALES.length) % FOTOS_ACTUALES.length;
  pintarLightbox();
}

function pintarLightbox() {
  const valor = FOTOS_ACTUALES[INDICE_LIGHTBOX];
  document.getElementById("lightbox-imagen").style.cssText = estiloFondo(valor);
  document.getElementById("lightbox-contador").textContent = `${INDICE_LIGHTBOX + 1} / ${FOTOS_ACTUALES.length}`;
}

function mostrarNoEncontrada() {
  document.getElementById("detalle-titulo").textContent = "Propiedad no encontrada";
  document.getElementById("detalle-contenido").innerHTML = `
    <p class="sin-resultados">No encontramos esta propiedad. Puede que el enlace esté incompleto o la propiedad ya no esté disponible.
    <a href="propiedades.html">Volver al listado completo</a>.</p>`;
}

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  if (!id) {
    mostrarNoEncontrada();
    return;
  }

  const { data: propiedad, error } = await supabaseClient
    .from("propiedades")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !propiedad) {
    mostrarNoEncontrada();
    return;
  }

  renderizarDetalle(propiedad);
});
