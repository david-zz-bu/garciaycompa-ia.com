// ============================================================
// Propiedades destacadas del inicio.
// Toma automáticamente las propiedades marcadas como destacada=true
// en Supabase — no hay que editar index.html ni código para
// cambiar cuáles se muestran, solo el checkbox en el Table Editor.
// ============================================================

function formatoPrecioDestacada(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function tarjetaDestacada(p) {
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
            <span class="tag-zona">${p.ciudad}${p.barrio ? " · " + p.barrio : ""}</span>
            <span class="tag-negocio">${etiquetaNegocioTexto}</span>
          </div>
          <div class="cuerpo">
            <h3>${p.titulo}</h3>
            <div class="precio">${formatoPrecioDestacada(p.precio)}${etiquetaSufijo}</div>
            <div class="detalles d-flex justify-content-between">
              <span>${Number(p.area).toLocaleString("es-CO")} m²</span>
              ${detalleHabitacionesBanos}
            </div>
          </div>
        </div>
      </a>
    </div>`;
}

document.addEventListener("DOMContentLoaded", async function () {
  const contenedor = document.getElementById("destacadas-propiedades");
  if (!contenedor) return;

  const { data, error } = await supabaseClient
    .from("propiedades")
    .select("*")
    .eq("destacada", true)
    .order("id", { ascending: true })
    .limit(3);

  if (error) {
    console.error("No se pudieron cargar las propiedades destacadas desde Supabase:", error);
    return;
  }

  contenedor.innerHTML = data.length
    ? data.map(tarjetaDestacada).join("")
    : `<div class="col-12"><p class="sin-resultados">No se encontraron propiedades destacadas configuradas.</p></div>`;
});
