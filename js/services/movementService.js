/* ============================================
   ALMOXARIFADO TI — services/movementService.js
   Registro e consulta de movimentações
   ============================================ */

const MovementService = {
  /** Retorna todas as movimentações. */
  getAll() {
    return StorageService.getMov();
  },

  /**
   * Registra uma nova movimentação e ajusta o estoque do item.
   * @param {object} params
   * @returns {{ success: boolean, error?: string, newQty?: number }}
   */
  register({ item_id, tipo, quantidade, responsavel, observacao }) {
    const qv = validateQty(quantidade);
    if (!qv.valid) return { success: false, error: qv.error };

    const delta = tipo === 'entrada' ? quantidade : -quantidade;
    const result = ItemService.adjustQuantity(item_id, delta);
    if (!result.success) return result;

    const movs = this.getAll();
    movs.push({
      id: nextId(movs),
      item_id,
      tipo,
      quantidade,
      responsavel,
      data: new Date().toISOString(),
      observacao
    });
    StorageService.saveMov(movs);

    return { success: true, newQty: result.newQty };
  },

  /**
   * Retorna movimentações enriquecidas com dados do item.
   * @returns {Array}
   */
  getEnriched() {
    const items = ItemService.getAll();
    return this.getAll().map(m => {
      const item = items.find(i => i.id === m.item_id);
      return {
        ...m,
        item_nome:   item ? item.nome   : '[removido]',
        item_codigo: item ? item.codigo : '—'
      };
    });
  }
};
