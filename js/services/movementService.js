const MovementService = {
  async getAll() {
    const { data } = await db
      .from('movements')
      .select('*, items(nome, codigo)')
      .order('created_at', { ascending: false });
    return data || [];
  },

  async register({ item_id, tipo, quantidade, responsavel, observacao }) {
    const qv = validateQty(quantidade);
    if (!qv.valid) return { success: false, error: qv.error };

    const delta = tipo === 'entrada' ? quantidade : -quantidade;
    const result = await ItemService.adjustQuantity(item_id, delta);
    if (!result.success) return result;

    const { error } = await db.from('movements').insert({
      item_id, tipo, quantidade, responsavel, observacao
    });

    if (error) return { success: false, error: 'Erro ao registrar movimentação: ' + error.message };
    return { success: true, newQty: result.newQty };
  },

  async getEnriched() {
    const movs = await this.getAll();
    return movs.map(m => ({
      ...m,
      data:        m.created_at,
      item_nome:   m.items ? m.items.nome   : '[removido]',
      item_codigo: m.items ? m.items.codigo : '—'
    }));
  }
};
