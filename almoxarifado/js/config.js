/* ============================================
   ALMOXARIFADO TI — config.js
   Configurações globais e constantes
   ============================================ */

const CONFIG = {
  /** Credenciais (texto simples para uso offline/local).
   *  Em produção, substitua por autenticação server-side. */
  USERS: {
    admin: '24022922',
    ti:    'L0c4l#4dm!n'
  },

  /** Chaves do localStorage */
  STORAGE_KEYS: {
    ITEMS:    'alm_items',
    MOVEMENTS:'alm_mov'
  },

  /** Tempo (ms) que mensagens de feedback ficam visíveis */
  MSG_TIMEOUT: 5000
};
