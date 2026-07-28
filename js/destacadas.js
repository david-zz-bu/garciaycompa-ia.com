// ============================================================
// Propiedades destacadas del inicio.
// Toma automáticamente las propiedades con los id indicados
// en IDS_DESTACADOS desde data/propiedades.json — no hay que
// editar index.html nunca más al cambiar esos datos.
// ============================================================

const IDS_DESTACADOS = [1, 2, 3];

function formatoPrecioDestacada(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function tarjetaDestacada(p) {
  const fondo = p.imagen
    ? `background-image:url('${p.imagen}'); background-size:cover; background-position:center;`
    : `background-color:${p.color || "#c9c2b3"};`;

  const detalleAlcobasBanos = (p.alcobas > 0 || p.banos > 0)
    ? `<span>${p.alcobas} hab · ${p.banos} baños</span>`
    : `<span>${p.tipo}</span>`;

  const etiquetaNegocio = p.negocio === "Arriendo" ? "/mes" : "";

  return `
    <div class="col-md-6 col-lg-4">
      <a href="propiedad-detalle.html?id=${p.id}" class="card-propiedad-link">
        <div class="card-propiedad h-100">
          <div class="foto" style="${fondo}">
            <span class="tag-zona">${p.ciudad} · ${p.barrio}</span>
            <span class="tag-negocio">${p.negocio}</span>
          </div>
          <div class="cuerpo">
            <h3>${p.titulo}</h3>
            <div class="precio">${formatoPrecioDestacada(p.precio)}${etiquetaNegocio}</div>
            <div class="detalles d-flex justify-content-between">
              <span>${p.area_m2.toLocaleString("es-CO")} m²</span>
              ${detalleAlcobasBanos}
            </div>
          </div>
        </div>
      </a>
    </div>`;
}

document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("destacadas-propiedades");
  if (!contenedor) return;

  fetch("data/propiedades.json")
    .then(resp => resp.json())
    .then(datos => {
      const seleccionadas = IDS_DESTACADOS
        .map(id => datos.find(p => p.id === id))
        .filter(Boolean); // descarta ids que ya no existan en el JSON

      contenedor.innerHTML = seleccionadas.length
        ? seleccionadas.map(tarjetaDestacada).join("")
        : `<div class="col-12"><p class="sin-resultados">No se encontraron las propiedades destacadas configuradas.</p></div>`;
    })
    .catch(err => console.error("No se pudo cargar data/propiedades.json:", err));
});
