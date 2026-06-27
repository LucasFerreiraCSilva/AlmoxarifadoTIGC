/* ============================================
   ALMOXARIFADO TI — services/storage.js
   Abstração do localStorage
   ============================================ */

const StorageService = {
  /** Retorna todos os itens do estoque. */
  getItems() {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.ITEMS) || '[]');
  },

  /** Persiste o array de itens. */
  saveItems(data) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.ITEMS, JSON.stringify(data));
  },

  /** Retorna todas as movimentações. */
  getMov() {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.MOVEMENTS) || '[]');
  },

  /** Persiste o array de movimentações. */
  saveMov(data) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.MOVEMENTS, JSON.stringify(data));
  }
};
