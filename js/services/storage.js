/* ============================================
   ALMOXARIFADO TI — services/storage.js
   Cliente Supabase centralizado
   ============================================ */

const db = supabasejs.createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);
