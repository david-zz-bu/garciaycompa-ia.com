// ============================================================
// Buscador de propiedades — lee data/propiedades.json y filtra
// en el navegador, sin necesidad de servidor ni base de datos.
// ============================================================

let TODAS_LAS_PROPIEDADES = [];

function formatoPrecio(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function tarjetaPropiedad(p) {
  const fondo = p.imagen
    ? `background-image:url('${p.imagen}'); background-size:cover; background-position:center;`
    : `background-color:${p.color || "#c9c2b3"};`;

  const detalleAlcobasBanos = (p.alcobas > 0 || p.banos > 0)
    ? `<span>${p.alcobas} hab · ${p.banos} baños</span>`
    : `<span>${p.tipo}</span>`;

  const etiquetaNegocio = p.negocio === "Arriendo" ? "/mes" : "";

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card-propiedad h-100">
        <div class="foto" style="${fondo}">
          <span class="tag-zona">${p.ciudad} · ${p.barrio}</span>
          <span class="tag-negocio">${p.negocio}</span>
        </div>
        <div class="cuerpo">
          <h3>${p.titulo}</h3>
          <div class="precio">${formatoPrecio(p.precio)}${etiquetaNegocio}</div>
          <div class="detalles d-flex justify-content-between">
            <span>${p.area_m2.toLocaleString("es-CO")} m²</span>
            ${detalleAlcobasBanos}
          </div>
        </div>
      </div>
    </div>`;
}

function renderizarPropiedades(lista) {
  const contenedor = document.getElementById("resultados-propiedades");
  const contador = document.getElementById("contador-resultados");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <p class="sin-resultados">No encontramos propiedades con esos filtros. Prueba ampliando el rango de precio o quitando algún filtro.</p>
      </div>`;
  } else {
    contenedor.innerHTML = lista.map(tarjetaPropiedad).join("");
  }

  if (contador) {
    contador.textContent = `${lista.length} propiedad${lista.length === 1 ? "" : "es"} encontrada${lista.length === 1 ? "" : "s"}`;
  }
}

function poblarSelectCiudades() {
  const selectCiudad = document.getElementById("f-ciudad");
  if (!selectCiudad) return;
  const ciudades = [...new Set(TODAS_LAS_PROPIEDADES.map(p => p.ciudad))].sort();
  ciudades.forEach(ciudad => {
    const opt = document.createElement("option");
    opt.value = ciudad;
    opt.textContent = ciudad;
    selectCiudad.appendChild(opt);
  });
}

function aplicarFiltros() {
  const ciudad = document.getElementById("f-ciudad")?.value || "";
  const tipo = document.getElementById("f-tipo")?.value || "";
  const negocio = document.getElementById("f-negocio")?.value || "";
  const alcobas = parseInt(document.getElementById("f-alcobas")?.value || "0", 10);
  const precioDesde = parseFloat(document.getElementById("f-precio-desde")?.value || "0");
  const precioHasta = parseFloat(document.getElementById("f-precio-hasta")?.value || "0");

  const filtradas = TODAS_LAS_PROPIEDADES.filter(p => {
    if (ciudad && p.ciudad !== ciudad) return false;
    if (tipo && p.tipo !== tipo) return false;
    if (negocio && p.negocio !== negocio) return false;
    if (alcobas && p.alcobas < alcobas) return false;
    if (precioDesde && p.precio < precioDesde) return false;
    if (precioHasta && p.precio > precioHasta) return false;
    return true;
  });

  renderizarPropiedades(filtradas);
}

function inicializarBuscador() {
  const formulario = document.getElementById("form-buscador");
  if (!formulario) return;

  fetch("data/propiedades.json")
    .then(resp => resp.json())
    .then(datos => {
      TODAS_LAS_PROPIEDADES = datos;
      poblarSelectCiudades();
      renderizarPropiedades(TODAS_LAS_PROPIEDADES);
    })
    .catch(err => {
      console.error("No se pudo cargar data/propiedades.json:", err);
      const contenedor = document.getElementById("resultados-propiedades");
      if (contenedor) {
        contenedor.innerHTML = `<div class="col-12"><p class="sin-resultados">
          No se pudieron cargar las propiedades. Si estás probando el sitio abriendo el archivo
          directamente en el navegador (file://), necesitas un servidor local (ej. <code>python -m http.server</code>)
          para que la carga del JSON funcione — una vez el sitio esté publicado en un hosting normal, esto no será problema.
        </p></div>`;
      }
    });

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    aplicarFiltros();
  });
}

document.addEventListener("DOMContentLoaded", inicializarBuscador);
