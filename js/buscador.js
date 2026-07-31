// ============================================================
// Buscador de propiedades — lee desde Supabase y filtra
// en el navegador (requiere supabase-config.js cargado antes).
// ============================================================

let TODAS_LAS_PROPIEDADES = [];

function formatoPrecio(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function etiquetaEstado(estado) {
  if (!estado || estado === "disponible") return "";
  const textos = { vendido: "VENDIDO", arrendado: "ARRENDADO", reservado: "RESERVADO" };
  const texto = textos[estado] || estado.toUpperCase();
  return `<span class="tag-estado tag-estado-${estado}">${texto}</span>`;
}

function tarjetaPropiedad(p) {
  const portada = p.fotos && p.fotos.length > 0 ? p.fotos[0] : null;
  const fondo = portada
    ? `background-image:url('${portada}'); background-size:cover; background-position:center;`
    : `background-color:#c9c2b3;`;

  const detalleHabitacionesBanos = (p.habitaciones > 0 || p.banos > 0)
    ? `<span>${p.habitaciones} hab · ${p.banos} baños</span>`
    : `<span>${p.tipo}</span>`;

  const tiposNegocio = p.tipo_negocio || [];
  const etiquetaNegocioTexto = tiposNegocio
    .map(t => t.charAt(0).toUpperCase() + t.slice(1))
    .join(" / ");
  const etiquetaSufijo = tiposNegocio.includes("arriendo") && !tiposNegocio.includes("venta") ? "/mes" : "";

  return `
    <div class="col-md-6 col-lg-4">
      <a href="propiedad-detalle.html?id=${p.id}" class="card-propiedad-link">
        <div class="card-propiedad h-100">
          <div class="foto" style="${fondo}">
            ${etiquetaEstado(p.estado)}
            <span class="tag-zona">${p.ciudad}${p.barrio ? " · " + p.barrio : ""}</span>
            <span class="tag-negocio">${etiquetaNegocioTexto}</span>
          </div>
          <div class="cuerpo">
            <h3>${p.titulo}</h3>
            <div class="precio">${formatoPrecio(p.precio)}${etiquetaSufijo}</div>
            <div class="detalles d-flex justify-content-between">
              <span>${Number(p.area).toLocaleString("es-CO")} m²</span>
              ${detalleHabitacionesBanos}
            </div>
          </div>
        </div>
      </a>
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
  const negocio = document.getElementById("f-negocio")?.value.toLowerCase() || "";
  const habitaciones = parseInt(document.getElementById("f-alcobas")?.value || "0", 10);
  const precioDesde = parseFloat(document.getElementById("f-precio-desde")?.value || "0");
  const precioHasta = parseFloat(document.getElementById("f-precio-hasta")?.value || "0");

  const filtradas = TODAS_LAS_PROPIEDADES.filter(p => {
    if (ciudad && p.ciudad !== ciudad) return false;
    if (tipo && p.tipo !== tipo) return false;
    if (negocio && !(p.tipo_negocio || []).includes(negocio)) return false;
    if (habitaciones && p.habitaciones < habitaciones) return false;
    if (precioDesde && p.precio < precioDesde) return false;
    if (precioHasta && p.precio > precioHasta) return false;
    return true;
  });

  renderizarPropiedades(filtradas);
}

async function inicializarBuscador() {
  const formulario = document.getElementById("form-buscador");
  if (!formulario) return;

  const contenedor = document.getElementById("resultados-propiedades");

  const { data, error } = await supabaseClient
    .from("propiedades")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("No se pudieron cargar las propiedades desde Supabase:", error);
    if (contenedor) {
      contenedor.innerHTML = `<div class="col-12"><p class="sin-resultados">
        No se pudieron cargar las propiedades.
      </p></div>`;
    }
    return;
  }

  TODAS_LAS_PROPIEDADES = data;
  poblarSelectCiudades();
  renderizarPropiedades(TODAS_LAS_PROPIEDADES);

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    aplicarFiltros();
  });
}

document.addEventListener("DOMContentLoaded", inicializarBuscador);
