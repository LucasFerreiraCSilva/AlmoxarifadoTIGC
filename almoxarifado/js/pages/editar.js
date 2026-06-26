/* ============================================
   ALMOXARIFADO TI — pages/editar.js
   Lógica da página Editar Item
   ============================================ */

let editingId = null;

function populateEditSelect() {
  const items = ItemService.getAll();
  const sel   = document.getElementById('edit-select');
  sel.innerHTML =
    '<option value="">Selecione…</option>' +
    items.map(i => `<option value="${i.id}">${esc(i.codigo)} — ${esc(i.nome)}</option>`).join('');
  document.getElementById('edit-form').style.display = 'none';
}

function loadEditForm() {
  const id = parseInt(document.getElementById('edit-select').value);
  if (!id) { showMsg('edit-msg', 'error', 'Selecione um item!'); return; }

  const item = ItemService.findById(id);
  if (!item) { showMsg('edit-msg', 'error', 'Item não encontrado.'); return; }

  editingId = id;
  document.getElementById('edit-codigo').value    = item.codigo;
  document.getElementById('edit-nome').value      = item.nome        || '';
  document.getElementById('edit-categoria').value = item.categoria   || '';
  document.getElementById('edit-local').value     = item.localizacao || '';
  document.getElementById('edit-min').value       = item.estoque_minimo || 0;
  document.getElementById('edit-obs').value       = item.observacao  || '';
  document.getElementById('edit-form').style.display = 'block';
  document.getElementById('edit-msg').innerHTML   = '';
}

function salvarEdicao() {
  if (!editingId) return;

  const result = ItemService.update(editingId, {
    codigo:         document.getElementById('edit-codigo').value.trim(),
    nome:           document.getElementById('edit-nome').value.trim(),
    categoria:      document.getElementById('edit-categoria').value.trim(),
    localizacao:    document.getElementById('edit-local').value.trim(),
    estoque_minimo: parseInt(document.getElementById('edit-min').value) || 0,
    observacao:     document.getElementById('edit-obs').value.trim()
  });

  if (!result.success) {
    showMsg('edit-msg', 'error', result.error);
    return;
  }

  showMsg('edit-msg', 'success', 'Item atualizado com sucesso!');
  document.getElementById('edit-form').style.display = 'none';
  editingId = null;
  refreshAll();
}

function cancelarEdicao() {
  document.getElementById('edit-form').style.display = 'none';
  editingId = null;
}
