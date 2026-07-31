// ============================================================
// Configuración del cliente de Supabase.
// Debe incluirse DESPUÉS del script de Supabase y ANTES de
// buscador.js / destacadas.js / detalle.js en cada HTML:
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="js/supabase-config.js"></script>
//   <script src="js/buscador.js"></script>  (o el que corresponda)
// ============================================================

const SUPABASE_URL = 'PEGA_AQUI_TU_URL_DE_PROYECTO'; // Settings > API > Project URL
const SUPABASE_ANON_KEY = 'PEGA_AQUI_TU_ANON_KEY';    // Settings > API > anon public key

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
