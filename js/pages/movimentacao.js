async function populateMovSelect() {
  const items = await ItemService.getAll();
  const sel   = document.getElementById('mov-item');
  sel.innerHTML = '<option value="">Selecione um item…</option>' +
    items.map(i=>`<option value="${i.id}">${esc(i.codigo)} — ${esc(i.nome)}</option>`).join('');
  updateItemInfo();
}

async function updateItemInfo() {
  const id  = parseInt(document.getElementById('mov-item').value);
  const box = document.getElementById('mov-info-box');
  if (!id) { box.style.display='none'; return; }
  const item = await ItemService.findById(id);
  if (!item) { box.style.display='none'; return; }
  box.style.display='grid';
  document.getElementById('info-codigo').textContent = item.codigo;
  document.getElementById('info-qty').textContent    = item.quantidade;
  document.getElementById('info-min').textContent    = item.estoque_minimo;
}

function adjQty(delta) {
  const el = document.getElementById('mov-qty');
  el.value = Math.max(1,(parseInt(el.value)||1)+delta);
}

async function registrarMovimento() {
  const item_id    = parseInt(document.getElementById('mov-item').value);
  const tipo       = document.getElementById('mov-tipo').value;
  const quantidade = parseInt(document.getElementById('mov-qty').value)||0;
  const responsavel= document.getElementById('mov-resp').value.trim();
  const observacao = document.getElementById('mov-obs').value.trim();

  if (!item_id) { showMsg('mov-msg','error','Selecione um item!'); return; }

  const result = await MovementService.register({ item_id, tipo, quantidade, responsavel, observacao });
  if (!result.success) { showMsg('mov-msg','error',result.error); return; }

  showMsg('mov-msg','success',`Movimentação registrada! Novo estoque: ${result.newQty} un.`);
  document.getElementById('mov-qty').value = 1;
  document.getElementById('mov-obs').value = '';
  updateItemInfo();
  refreshAll();
}
