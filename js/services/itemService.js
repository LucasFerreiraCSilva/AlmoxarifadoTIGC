const ItemService = {
  async getAll() {
    const { data } = await db
      .from('items')
      .select('*')
      .order('nome');
    return data || [];
  },

  async findById(id) {
    const { data } = await db
      .from('items')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return data;
  },

  async findByCodigo(codigo) {
    const { data } = await db
      .from('items')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();
    return data;
  },

  async codigoExiste(codigo) {
    return !!(await this.findByCodigo(codigo));
  },

  async create({ codigo, nome, categoria, localizacao, quantidade, estoque_minimo, observacao }) {
    const v = validateCodigo(codigo);
    if (!v.valid) return { success: false, error: v.error };

    const { error } = await db.from('items').insert({
      codigo, nome, categoria, localizacao, quantidade, estoque_minimo, observacao
    });

    if (error) {
      const msg = error.code === '23505'
        ? 'Já existe um item com esse código!'
        : 'Erro ao cadastrar: ' + error.message;
      return { success: false, error: msg };
    }
    return { success: true };
  },

  async update(id, { codigo, nome, categoria, localizacao, estoque_minimo, observacao }) {
    const v = validateCodigo(codigo);
    if (!v.valid) return { success: false, error: v.error };

    const { error } = await db
      .from('items')
      .update({ codigo, nome, categoria, localizacao, estoque_minimo, observacao })
      .eq('id', id);

    if (error) {
      const msg = error.code === '23505'
        ? 'Já existe outro item com esse código!'
        : 'Erro ao atualizar: ' + error.message;
      return { success: false, error: msg };
    }
    return { success: true };
  },

  async adjustQuantity(id, delta) {
    const item = await this.findById(id);
    if (!item) return { success: false, error: 'Item não encontrado!' };

    const newQty = item.quantidade + delta;
    if (newQty < 0) {
      const v = validateSaldo(item.quantidade, Math.abs(delta));
      return { success: false, error: v.error };
    }

    const { error } = await db
      .from('items')
      .update({ quantidade: newQty })
      .eq('id', id);

    if (error) return { success: false, error: 'Erro ao atualizar estoque: ' + error.message };
    return { success: true, newQty };
  },

  async remove(id) {
    const { error } = await db.from('items').delete().eq('id', id);
    if (error) return { success: false, error: 'Erro ao remover: ' + error.message };
    return { success: true };
  },

  async getCategories() {
    const items = await this.getAll();
    return [...new Set(items.map(i => i.categoria).filter(Boolean))];
  }
};
