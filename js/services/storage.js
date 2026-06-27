/* ============================================
   ALMOXARIFADO TI — services/storage.js
   Cliente Supabase centralizado
   ============================================ */

const { createClient } = window.supabase;
const supabase = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);
