// ============================================================
// Panel de administración — García & Compañía
// Requiere supabase-config.js cargado antes.
// ============================================================

let FOTOS_PENDIENTES = []; // archivos elegidos en el input, antes de subir
let FOTOS_YA_SUBIDAS = []; // URLs ya guardadas (al editar una propiedad existente)

// ---------------- Autenticación ----------------

async function verificarSesion() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    mostrarPanel();
  } else {
    mostrarLogin();
  }
}

function mostrarLogin() {
  document.getElementById("vista-login").classList.remove("oculto");
  document.getElementById("vista-panel").classList.add("oculto");
}

function mostrarPanel() {
  document.getElementById("vista-login").classList.add("oculto");
  document.getElementById("vista-panel").classList.remove("oculto");
  cargarListado();
}

document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorBox = document.getElementById("login-error");
  errorBox.classList.add("oculto");

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    errorBox.textContent = "Correo o contraseña incorrectos.";
    errorBox.classList.remove("oculto");
    return;
  }
  mostrarPanel();
});

document.getElementById("btn-logout").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  mostrarLogin();
});

// ---------------- Listado de propiedades ----------------

function formatoPrecioAdmin(valor) {
  return valor ? "$" + Math.round(valor).toLocaleString("es-CO") : "—";
}

async function cargarListado() {
  const contenedor = document.getElementById("listado-propiedades");
  contenedor.innerHTML = "<p>Cargando...</p>";

  const { data, error } = await supabaseClient
    .from("propiedades")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    contenedor.innerHTML = `<p class="msg-error">Error cargando propiedades: ${error.message}</p>`;
    return;
  }

  contenedor.innerHTML = data.map(p => {
    const portada = p.fotos && p.fotos.length ? p.fotos[0] : "";
    return `
      <div class="fila-propiedad">
        <img src="${portada}" alt="">
        <div class="info">
          <div class="titulo">${p.titulo}</div>
          <div class="meta">${p.ciudad} · ${formatoPrecioAdmin(p.precio)} · Estado: ${p.estado}</div>
        </div>
        <button class="btn btn-sm btn-secundario" style="border-color:var(--piedra); color:var(--piedra);" onclick="editarPropiedad(${p.id})">Editar</button>
        <button class="btn btn-sm btn-secundario" style="border-color:#b23b3b; color:#b23b3b;" onclick="borrarPropiedad(${p.id})">Borrar</button>
      </div>`;
  }).join("") || "<p>No hay propiedades todavía.</p>";
}

// ---------------- Mostrar/ocultar formulario ----------------

document.getElementById("btn-nueva-propiedad").addEventListener("click", () => {
  limpiarFormulario();
  document.getElementById("titulo-formulario").textContent = "Nueva propiedad";
  document.getElementById("caja-formulario").classList.remove("oculto");
});

document.getElementById("btn-cancelar-form").addEventListener("click", () => {
  document.getElementById("caja-formulario").classList.add("oculto");
});

function limpiarFormulario() {
  document.getElementById("form-propiedad").reset();
  document.getElementById("f-id").value = "";
  FOTOS_PENDIENTES = [];
  FOTOS_YA_SUBIDAS = [];
  document.getElementById("previsualizacion-fotos").innerHTML = "";
  document.getElementById("form-error").classList.add("oculto");
  document.getElementById("form-ok").classList.add("oculto");
}

// ---------------- Editar propiedad existente ----------------

async function editarPropiedad(id) {
  const { data: p, error } = await supabaseClient
    .from("propiedades")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !p) {
    alert("No se pudo cargar la propiedad.");
    return;
  }

  limpiarFormulario();
  document.getElementById("titulo-formulario").textContent = `Editar: ${p.titulo}`;
  document.getElementById("f-id").value = p.id;
  document.getElementById("f-titulo").value = p.titulo || "";
  document.getElementById("f-codigo").value = p.codigo || "";
  document.getElementById("f-ciudad").value = p.ciudad || "";
  document.getElementById("f-barrio").value = p.barrio || "";
  document.getElementById("f-estrato").value = p.estrato || "";
  document.getElementById("f-tipo").value = p.tipo || "Casa";
  document.getElementById("f-estado").value = p.estado || "disponible";
  document.getElementById("f-precio").value = p.precio || "";
  document.getElementById("f-precio-arriendo").value = p.precio_arriendo || "";
  document.getElementById("f-administracion").value = p.administracion || "";
  document.getElementById("f-area").value = p.area || "";
  document.getElementById("f-area-construida").value = p.area_construida || "";
  document.getElementById("f-habitaciones").value = p.habitaciones || 0;
  document.getElementById("f-banos").value = p.banos || 0;
  document.getElementById("f-parqueaderos").value = p.parqueaderos || 0;
  document.getElementById("f-pisos").value = p.pisos || "";
  document.getElementById("f-antiguedad").value = p.antiguedad || "";
  document.getElementById("f-destacada").checked = !!p.destacada;
  document.getElementById("f-descripcion").value = (p.descripcion || []).join("\n");
  document.getElementById("f-caracteristicas-internas").value = (p.caracteristicas_internas || []).join(", ");
  document.getElementById("f-caracteristicas-externas").value = (p.caracteristicas_externas || []).join(", ");
  document.getElementById("f-lat").value = p.lat || "";
  document.getElementById("f-lng").value = p.lng || "";
  document.getElementById("f-tour360").value = p.tour360 || "";

  const tiposNegocio = p.tipo_negocio || [];
  document.getElementById("f-negocio-venta").checked = tiposNegocio.includes("venta");
  document.getElementById("f-negocio-arriendo").checked = tiposNegocio.includes("arriendo");
  document.getElementById("f-negocio-permuta").checked = tiposNegocio.includes("permuta");

  FOTOS_YA_SUBIDAS = p.fotos || [];
  pintarPrevisualizacion();

  document.getElementById("caja-formulario").classList.remove("oculto");
  window.scrollTo({ top: document.getElementById("caja-formulario").offsetTop - 20, behavior: "smooth" });
}

// ---------------- Borrar propiedad ----------------

async function borrarPropiedad(id) {
  if (!confirm("¿Seguro que quieres borrar esta propiedad? Esta acción no se puede deshacer.\n\nSi prefieres solo marcarla como vendida/arrendada sin perder el registro, usa 'Editar' y cambia el Estado en vez de borrar.")) {
    return;
  }
  const { error } = await supabaseClient.from("propiedades").delete().eq("id", id);
  if (error) {
    alert("Error al borrar: " + error.message);
    return;
  }
  cargarListado();
}

// ---------------- Subida de fotos ----------------

document.getElementById("f-fotos-nuevas").addEventListener("change", (e) => {
  FOTOS_PENDIENTES = FOTOS_PENDIENTES.concat(Array.from(e.target.files));
  pintarPrevisualizacion();
  e.target.value = ""; // permite volver a elegir más archivos después
});

function pintarPrevisualizacion() {
  const contenedor = document.getElementById("previsualizacion-fotos");
  const yaSubidasHtml = FOTOS_YA_SUBIDAS.map((url) =>
    `<img src="${url}" class="miniatura-subida" title="Ya guardada">`
  ).join("");
  const pendientesHtml = FOTOS_PENDIENTES.map((archivo) =>
    `<img src="${URL.createObjectURL(archivo)}" class="miniatura-subida" title="Pendiente por subir">`
  ).join("");
  contenedor.innerHTML = yaSubidasHtml + pendientesHtml;
}

async function subirFotosPendientes(propiedadId) {
  const urlsSubidas = [];
  for (const archivo of FOTOS_PENDIENTES) {
    const nombreArchivo = `${propiedadId}/${Date.now()}-${archivo.name}`;
    const { error } = await supabaseClient.storage
      .from("fotos-propiedades")
      .upload(nombreArchivo, archivo);

    if (error) {
      console.error("Error subiendo foto:", error);
      continue;
    }

    const { data: urlData } = supabaseClient.storage
      .from("fotos-propiedades")
      .getPublicUrl(nombreArchivo);

    urlsSubidas.push(urlData.publicUrl);
  }
  return urlsSubidas;
}

// ---------------- Guardar (crear o actualizar) ----------------

document.getElementById("form-propiedad").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorBox = document.getElementById("form-error");
  const okBox = document.getElementById("form-ok");
  const progresoBox = document.getElementById("subida-progreso");
  errorBox.classList.add("oculto");
  okBox.classList.add("oculto");

  const id = document.getElementById("f-id").value;

  const tipoNegocio = [];
  if (document.getElementById("f-negocio-venta").checked) tipoNegocio.push("venta");
  if (document.getElementById("f-negocio-arriendo").checked) tipoNegocio.push("arriendo");
  if (document.getElementById("f-negocio-permuta").checked) tipoNegocio.push("permuta");

  if (tipoNegocio.length === 0) {
    errorBox.textContent = "Selecciona al menos un tipo de negocio (venta, arriendo o permuta).";
    errorBox.classList.remove("oculto");
    return;
  }

  let propiedadId = id ? parseInt(id, 10) : null;

  const datosBase = {
    codigo: document.getElementById("f-codigo").value || null,
    titulo: document.getElementById("f-titulo").value,
    precio: parseFloat(document.getElementById("f-precio").value) || 0,
    precio_arriendo: document.getElementById("f-precio-arriendo").value ? parseFloat(document.getElementById("f-precio-arriendo").value) : null,
    tipo_negocio: tipoNegocio,
    ciudad: document.getElementById("f-ciudad").value,
    barrio: document.getElementById("f-barrio").value || null,
    estrato: document.getElementById("f-estrato").value ? parseInt(document.getElementById("f-estrato").value, 10) : null,
    tipo: document.getElementById("f-tipo").value,
    area: parseFloat(document.getElementById("f-area").value) || 0,
    area_construida: document.getElementById("f-area-construida").value ? parseFloat(document.getElementById("f-area-construida").value) : null,
    antiguedad: document.getElementById("f-antiguedad").value ? parseInt(document.getElementById("f-antiguedad").value, 10) : null,
    habitaciones: parseInt(document.getElementById("f-habitaciones").value, 10) || 0,
    banos: parseInt(document.getElementById("f-banos").value, 10) || 0,
    parqueaderos: parseInt(document.getElementById("f-parqueaderos").value, 10) || 0,
    pisos: document.getElementById("f-pisos").value ? parseInt(document.getElementById("f-pisos").value, 10) : null,
    administracion: document.getElementById("f-administracion").value ? parseFloat(document.getElementById("f-administracion").value) : null,
    destacada: document.getElementById("f-destacada").checked,
    estado: document.getElementById("f-estado").value,
    descripcion: document.getElementById("f-descripcion").value.split("\n").map(s => s.trim()).filter(Boolean),
    caracteristicas_internas: document.getElementById("f-caracteristicas-internas").value.split(",").map(s => s.trim()).filter(Boolean),
    caracteristicas_externas: document.getElementById("f-caracteristicas-externas").value.split(",").map(s => s.trim()).filter(Boolean),
    lat: document.getElementById("f-lat").value ? parseFloat(document.getElementById("f-lat").value) : null,
    lng: document.getElementById("f-lng").value ? parseFloat(document.getElementById("f-lng").value) : null,
    tour360: document.getElementById("f-tour360").value || null,
  };

  try {
    if (!propiedadId) {
      // Propiedad nueva: la creamos primero con array de fotos vacío para obtener su id
      const { data: creada, error: errorCrear } = await supabaseClient
        .from("propiedades")
        .insert({ ...datosBase, fotos: [] })
        .select()
        .single();
      if (errorCrear) throw errorCrear;
      propiedadId = creada.id;
    }

    // Subir fotos nuevas (si hay) usando el id ya confirmado
    let fotosFinal = FOTOS_YA_SUBIDAS;
    if (FOTOS_PENDIENTES.length > 0) {
      progresoBox.classList.remove("oculto");
      const nuevasUrls = await subirFotosPendientes(propiedadId);
      fotosFinal = fotosFinal.concat(nuevasUrls);
      progresoBox.classList.add("oculto");
    }

    // Si no se subió ninguna foto, usar la imagen genérica de "no disponible"
    if (fotosFinal.length === 0) {
      fotosFinal = ["images/no-disponible.png"];
    }

    const { error: errorActualizar } = await supabaseClient
      .from("propiedades")
      .update({ ...datosBase, fotos: fotosFinal })
      .eq("id", propiedadId);
    if (errorActualizar) throw errorActualizar;

    okBox.textContent = "Propiedad guardada correctamente.";
    okBox.classList.remove("oculto");
    cargarListado();
    setTimeout(() => {
      document.getElementById("caja-formulario").classList.add("oculto");
    }, 1200);

  } catch (err) {
    console.error(err);
    errorBox.textContent = "Error guardando la propiedad: " + err.message;
    errorBox.classList.remove("oculto");
  }
});

// ---------------- Arranque ----------------
document.addEventListener("DOMContentLoaded", verificarSesion);
