/* ============================================
   ALMOXARIFADO TI — pages/dashboard.js
   Lógica do Painel (visão geral do estoque)
   ============================================ */

function renderPainel() {
  const items  = ItemService.getAll();
  const q      = document.getElementById('painel-search').value.toLowerCase();
  const cat    = document.getElementById('painel-cat').value;
  const baixo  = items.filter(i => i.quantidade < i.estoque_minimo);

  /* --- Cards de resumo --- */
  document.getElementById('stat-cards').innerHTML = `
    <div class="stat-card">
      <div class="s-label">Total de itens</div>
      <div class="s-val">${items.length}</div>
      <div class="s-sub">cadastrados</div>
    </div>
    <div class="stat-card">
      <div class="s-label">Unidades em estoque</div>
      <div class="s-val">${items.reduce((a, i) => a + i.quantidade, 0)}</div>
      <div class="s-sub">total</div>
    </div>
    <div class="stat-card">
      <div class="s-label">Abaixo do mínimo</div>
      <div class="s-val val-${baixo.length ? 'amber' : 'green'}">${baixo.length}</div>
      <div class="s-sub">itens críticos</div>
    </div>
    <div class="stat-card">
      <div class="s-label">Movimentações</div>
      <div class="s-val">${MovementService.getAll().length}</div>
      <div class="s-sub">registradas</div>
    </div>
  `;

  /* --- Badge no menu lateral --- */
  const badge = document.getElementById('badge-alerta');
  badge.style.display = baixo.length ? 'inline-flex' : 'none';
  if (baixo.length) badge.textContent = baixo.length;

  /* --- Faixa de alerta --- */
  document.getElementById('alert-strip').innerHTML = baixo.length
    ? `<div class="alert-box">
        <div class="pulse"></div>
        ${baixo.length} item(ns) com quantidade abaixo do estoque mínimo:
        ${baixo.map(i => `<strong>${esc(i.nome || i.codigo)}</strong>`).join(', ')}
       </div>`
    : '';

  /* --- Tabela (filtrada) --- */
  const filtered = items.filter(i => {
    const matchQ   = !q   || (i.codigo + i.nome + i.categoria + i.localizacao).toLowerCase().includes(q);
    const matchCat = !cat || i.categoria === cat;
    return matchQ && matchCat;
  });

  const tbody = document.getElementById('painel-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <div>${items.length
          ? 'Nenhum item encontrado com esses filtros.'
          : 'Nenhum item cadastrado ainda. Vá em <strong>Cadastrar Item</strong>.'}
        </div>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(i => {
    const alert = i.quantidade < i.estoque_minimo;
    return `<tr class="${alert ? 'row-alert' : ''}">
      <td><span class="badge badge-blue">${esc(i.codigo)}</span></td>
      <td style="font-weight:500">${esc(i.nome)}</td>
      <td>${i.categoria ? `<span class="badge badge-gray">${esc(i.categoria)}</span>` : '-'}</td>
      <td style="color:var(--muted)">${esc(i.localizacao) || '-'}</td>
      <td style="font-weight:600;color:${alert ? 'var(--amber)' : 'var(--text)'}">${i.quantidade}</td>
      <td style="color:var(--muted)">${i.estoque_minimo}</td>
      <td>${badgeStatus(i)}</td>
    </tr>`;
  }).join('');

  refreshCatList();
}
