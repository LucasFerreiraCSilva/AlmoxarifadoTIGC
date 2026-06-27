/* ============================================
   ALMOXARIFADO TI — services/itemService.js
   Operações CRUD sobre itens do estoque
   ============================================ */

const ItemService = {
  /** Retorna todos os itens. */
  getAll() {
    return StorageService.getItems();
  },

  /** Busca um item pelo código. Retorna o objeto ou undefined. */
  findByCodigo(codigo) {
    return this.getAll().find(i => i.codigo === codigo);
  },

  /** Busca um item pelo id. Retorna o objeto ou undefined. */
  findById(id) {
    return this.getAll().find(i => i.id === id);
  },

  /** Verifica se já existe um item com o código informado. */
  codigoExiste(codigo) {
    return !!this.findByCodigo(codigo);
  },

  /**
   * Cria um novo item.
   * @returns {{ success: boolean, error?: string }}
   */
  create({ codigo, nome, categoria, localizacao, quantidade, estoque_minimo, observacao }) {
    const v = validateCodigo(codigo);
    if (!v.valid) return { success: false, error: v.error };

    const items = this.getAll();
    if (items.find(i => i.codigo === codigo))
      return { success: false, error: 'Já existe um item com esse código!' };

    const id = nextId(items);
    items.push({ id, codigo, nome, categoria, localizacao, quantidade, estoque_minimo, observacao });
    StorageService.saveItems(items);
    return { success: true };
  },

  /**
   * Atualiza os dados cadastrais de um item (não altera quantidade).
   * @param {number} id
   * @param {object} data
   * @returns {{ success: boolean, error?: string }}
   */
  update(id, { codigo, nome, categoria, localizacao, estoque_minimo, observacao }) {
    const v = validateCodigo(codigo);
    if (!v.valid) return { success: false, error: v.error };

    const items = this.getAll();
    const dup = items.find(i => i.codigo === codigo && i.id !== id);
    if (dup) return { success: false, error: 'Já existe outro item com esse código!' };

    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return { success: false, error: 'Item não encontrado!' };

    items[idx] = { ...items[idx], codigo, nome, categoria, localizacao, estoque_minimo, observacao };
    StorageService.saveItems(items);
    return { success: true };
  },

  /**
   * Ajusta a quantidade de um item (delta positivo = entrada, negativo = saída).
   * @param {number} id
   * @param {number} delta
   * @returns {{ success: boolean, error?: string, newQty?: number }}
   */
  adjustQuantity(id, delta) {
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return { success: false, error: 'Item não encontrado!' };

    const newQty = items[idx].quantidade + delta;
    if (newQty < 0) {
      const v = validateSaldo(items[idx].quantidade, Math.abs(delta));
      return { success: false, error: v.error };
    }
    items[idx].quantidade = newQty;
    StorageService.saveItems(items);
    return { success: true, newQty };
  },

  /**
   * Remove um item pelo id.
   * @param {number} id
   * @returns {{ success: boolean }}
   */
  remove(id) {
    const items = this.getAll().filter(i => i.id !== id);
    StorageService.saveItems(items);
    return { success: true };
  },

  /** Retorna todas as categorias únicas cadastradas. */
  getCategories() {
    return [...new Set(this.getAll().map(i => i.categoria).filter(Boolean))];
  }
};
