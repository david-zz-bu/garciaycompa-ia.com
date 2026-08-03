// ============================================================
// Configuración del cliente de Supabase.
// Debe incluirse DESPUÉS del script de Supabase y ANTES de
// buscador.js / destacadas.js / detalle.js en cada HTML:
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="js/supabase-config.js"></script>
//   <script src="js/buscador.js"></script>  (o el que corresponda)
// ============================================================

const SUPABASE_URL = 'https://uqnvrqiiehgvchyanldj.supabase.co'; // Settings > API > Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbnZycWlpZWhndmNoeWFubGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTkzNjUsImV4cCI6MjEwMTA3NTM2NX0.teQsR9vswhXA2JqA-HDjDwLVr-y1T0IQYniy16wHJ20';    // Settings > API > anon public key

const supabaseClient = window.supabase.createClient(https://uqnvrqiiehgvchyanldj.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbnZycWlpZWhndmNoeWFubGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTkzNjUsImV4cCI6MjEwMTA3NTM2NX0.teQsR9vswhXA2JqA-HDjDwLVr-y1T0IQYniy16wHJ20);
