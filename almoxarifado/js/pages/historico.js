/* ============================================
   ALMOXARIFADO TI — pages/historico.js
   Lógica da página Histórico
   ============================================ */

function renderHistorico() {
  const q       = document.getElementById('hist-search').value.toLowerCase();
  const tipo    = document.getElementById('hist-tipo').value;
  const dataIni = document.getElementById('hist-data-ini').value;
  const dataFim = document.getElementById('hist-data-fim').value;

  const enriched = MovementService.getEnriched();

  const filtered = enriched
    .filter(m => {
      const matchQ  = !q    || (m.item_nome + m.responsavel + m.item_codigo).toLowerCase().includes(q);
      const matchT  = !tipo || m.tipo === tipo;
      const d       = new Date(m.data);
      const matchD1 = !dataIni || d >= new Date(dataIni);
      const matchD2 = !dataFim || d <= new Date(dataFim + 'T23:59:59');
      return matchQ && matchT && matchD1 && matchD2;
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const tbody = document.getElementById('hist-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div>${enriched.length
          ? 'Nenhum registro encontrado com esses filtros.'
          : 'Nenhuma movimentação registrada ainda.'}
        </div>
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
    </tr>
  `).join('');
}
