/* ============================================
   ALMOXARIFADO TI — services/storage.js
   Cliente Supabase centralizado
   ============================================ */

const supabase = supabasejs.createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);
