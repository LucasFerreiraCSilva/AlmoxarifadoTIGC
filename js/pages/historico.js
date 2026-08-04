async function renderHistorico() {
  const q       = document.getElementById('hist-search').value.toLowerCase();
  const tipo    = document.getElementById('hist-tipo').value;
  const dataIni = document.getElementById('hist-data-ini').value;
  const dataFim = document.getElementById('hist-data-fim').value;
  const isAdmin = AuthService.isAdmin();

  const enriched = await MovementService.getEnriched();

  const filtered = enriched.filter(m => {
    const matchQ  = !q    || (m.item_nome + m.responsavel + m.item_codigo).toLowerCase().includes(q);
    const matchT  = !tipo || m.tipo === tipo;
    const d       = new Date(m.data);
    const matchD1 = !dataIni || d >= new Date(dataIni);
    const matchD2 = !dataFim || d <= new Date(dataFim + 'T23:59:59');
    return matchQ && matchT && matchD1 && matchD2;
  }).sort((a, b) => new Date(b.data) - new Date(a.data));

  const tbody = document.getElementById('hist-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="${isAdmin ? 7 : 6}">
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div>${enriched.length ? 'Nenhum registro com esses filtros.' : 'Nenhuma movimentação ainda.'}</div>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(m => `
    <tr>
      <td style="color:var(--muted);white-space:nowrap">${fmtDate(m.data)}</td>
      <td>
        <strong>${esc(m.item_nome)}</strong><br>
        <span style="font-size:11px;color:var(--muted)">${esc(m.item_codigo)}</span>
      </td>
      <td>
        <span class="badge ${m.tipo === 'entrada' ? 'badge-green' : 'badge-red'}">
          ${m.tipo === 'entrada' ? '📥 Entrada' : '📤 Saída'}
        </span>
      </td>
      <td style="font-weight:600">${m.quantidade}</td>
      <td>${esc(m.responsavel) || '<span style="color:var(--muted)">—</span>'}</td>
      <td style="color:var(--muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${esc(m.observacao) || '—'}
      </td>
      ${isAdmin ? `
      <td>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-ghost btn-sm" onclick="abrirEditarMovimento(${m.id}, '${esc(m.responsavel)}', '${esc(m.observacao)}')">
            ✏️ Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmarRemoverMovimento(${m.id})">
            🗑️
          </button>
        </div>
      </td>` : ''}
    </tr>
  `).join('');

  // Mostra/oculta coluna de ações
  const thAcoes = document.getElementById('hist-th-acoes');
  if (thAcoes) thAcoes.style.display = isAdmin ? '' : 'none';
}

function abrirEditarMovimento(id, responsavel, observacao) {
  document.getElementById('edit-mov-id').value           = id;
  document.getElementById('edit-mov-resp').value         = responsavel || '';
  document.getElementById('edit-mov-obs').value          = observacao  || '';
  document.getElementById('edit-mov-msg').innerHTML      = '';
  document.getElementById('modal-edit-mov').classList.add('open');
}

async function salvarEdicaoMovimento() {
  const id          = parseInt(document.getElementById('edit-mov-id').value);
  const responsavel = document.getElementById('edit-mov-resp').value.trim();
  const observacao  = document.getElementById('edit-mov-obs').value.trim();

  const { error } = await db
    .from('movements')
    .update({ responsavel, observacao })
    .eq('id', id);

  if (error) {
    document.getElementById('edit-mov-msg').innerHTML =
      `<div class="alert-box" style="margin-bottom:0">❌ Erro ao salvar: ${error.message}</div>`;
    return;
  }

  fecharEditarMovimento();
  showMsg('hist-msg', 'success', 'Movimentação atualizada com sucesso!');
  renderHistorico();
}

function fecharEditarMovimento() {
  document.getElementById('modal-edit-mov').classList.remove('open');
}

async function confirmarRemoverMovimento(id) {
  openModal(
    'Remover movimentação',
    'Tem certeza que deseja remover este registro? Esta ação não pode ser desfeita.',
    async () => {
      const { error } = await db.from('movements').delete().eq('id', id);
      if (error) {
        showMsg('hist-msg', 'error', 'Erro ao remover: ' + error.message);
        return;
      }
      showMsg('hist-msg', 'success', 'Movimentação removida!');
      renderHistorico();
    }
  );
}