async function populateRemSelect() {
  const items = await ItemService.getAll();
  const sel   = document.getElementById('rem-select');
  sel.innerHTML = '<option value="">Selecione…</option>' +
    items.map(i=>`<option value="${i.id}">${esc(i.codigo)} — ${esc(i.nome)}</option>`).join('');
  sel.onchange = () => {
    const id   = parseInt(sel.value);
    const prev = document.getElementById('rem-preview');
    if (!id) { prev.style.display='none'; return; }
    const item = items.find(i=>i.id===id);
    if (!item) { prev.style.display='none'; return; }
    prev.style.display='grid';
    document.getElementById('rem-codigo').textContent = item.codigo;
    document.getElementById('rem-qty').textContent    = item.quantidade;
    document.getElementById('rem-cat').textContent    = item.categoria||'—';
  };
}

async function confirmarRemocao() {
  const id = parseInt(document.getElementById('rem-select').value);
  if (!id) { showMsg('rem-msg','error','Selecione um item!'); return; }
  const item = await ItemService.findById(id);
  if (!item) { showMsg('rem-msg','error','Item não encontrado!'); return; }
  openModal(
    'Remover item',
    `Tem certeza que deseja remover "<strong>${esc(item.nome||item.codigo)}</strong>"? Esta ação não pode ser desfeita.`,
    async () => {
      const result = await ItemService.remove(id);
      if (!result.success) { showMsg('rem-msg','error',result.error); return; }
      showMsg('rem-msg','success','Item removido com sucesso!');
      refreshAll();
    }
  );
}
