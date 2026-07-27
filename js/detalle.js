// ============================================================
// Página de detalle de propiedad.
// Lee ?id=X de la URL, busca esa propiedad en propiedades.json
// y arma el contenido dinámicamente. No existe un archivo HTML
// por propiedad: esta misma plantilla sirve para todas.
// ============================================================

function formatoPrecioDetalle(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function fotoGaleria(valor, esActiva) {
  const esColor = valor.startsWith("#");
  const fondo = esColor ? `background-color:${valor};` : `background-image:url('${valor}'); background-size:cover; background-position:center;`;
  return `<div class="foto-galeria-item ${esActiva ? "activa" : ""}" style="${fondo}"></div>`;
}

function renderizarDetalle(p) {
  document.getElementById("titulo-pagina").textContent = `${p.titulo} | García & Compañía`;
  document.getElementById("detalle-titulo").textContent = p.titulo;

  const etiquetaNegocio = p.negocio === "Arriendo" ? "/mes" : "";
  const fotos = (p.fotos && p.fotos.length ? p.fotos : [p.color || "#c9c2b3"]);

  const detalleAlcobasBanos = (p.alcobas > 0 || p.banos > 0)
    ? `<div class="col-6 col-md-3"><div class="ficha-num">${p.alcobas}</div><div class="ficha-label">Alcobas</div></div>
       <div class="col-6 col-md-3"><div class="ficha-num">${p.banos}</div><div class="ficha-label">Baños</div></div>`
    : "";

  document.getElementById("detalle-contenido").innerHTML = `
    <div class="row g-5">
      <div class="col-lg-7">
        <div class="galeria-principal" id="galeria-principal" style="${fotos[0].startsWith("#") ? `background-color:${fotos[0]};` : `background-image:url('${fotos[0]}'); background-size:cover; background-position:center;`}"></div>
        <div class="galeria-miniaturas">
          ${fotos.map((f, i) => fotoGaleria(f, i === 0)).join("")}
        </div>
      </div>
      <div class="col-lg-5">
        <div class="eyebrow-sec mb-2">${p.ciudad} · ${p.barrio}</div>
        <div class="precio-detalle mb-3">${formatoPrecioDetalle(p.precio)}${etiquetaNegocio}</div>
        <div class="tag-negocio-detalle mb-4">${p.negocio}</div>
        <div class="row g-3 mb-4 ficha-tecnica">
          <div class="col-6 col-md-3"><div class="ficha-num">${p.area_m2.toLocaleString("es-CO")}</div><div class="ficha-label">m²</div></div>
          ${detalleAlcobasBanos}
        </div>
        <p class="descripcion-propiedad">${p.descripcion || ""}</p>
        <a href="https://wa.me/57" target="_blank" class="btn btn-primario w-100 mt-3">Preguntar por esta propiedad</a>
      </div>
    </div>`;

  // Clic en una miniatura cambia la foto principal
  document.querySelectorAll(".foto-galeria-item").forEach((el, i) => {
    el.addEventListener("click", () => {
      const galeriaPrincipal = document.getElementById("galeria-principal");
      const valor = fotos[i];
      if (valor.startsWith("#")) {
        galeriaPrincipal.style.backgroundImage = "";
        galeriaPrincipal.style.backgroundColor = valor;
      } else {
        galeriaPrincipal.style.backgroundColor = "";
        galeriaPrincipal.style.backgroundImage = `url('${valor}')`;
      }
      document.querySelectorAll(".foto-galeria-item").forEach(t => t.classList.remove("activa"));
      el.classList.add("activa");
    });
  });
}

function mostrarNoEncontrada() {
  document.getElementById("detalle-titulo").textContent = "Propiedad no encontrada";
  document.getElementById("detalle-contenido").innerHTML = `
    <p class="sin-resultados">No encontramos esta propiedad. Puede que el enlace esté incompleto o la propiedad ya no esté disponible.
    <a href="propiedades.html">Volver al listado completo</a>.</p>`;
}

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  if (!id) {
    mostrarNoEncontrada();
    return;
  }

  fetch("data/propiedades.json")
    .then(resp => resp.json())
    .then(datos => {
      const propiedad = datos.find(p => p.id === id);
      if (propiedad) {
        renderizarDetalle(propiedad);
      } else {
        mostrarNoEncontrada();
      }
    })
    .catch(() => mostrarNoEncontrada());
});
