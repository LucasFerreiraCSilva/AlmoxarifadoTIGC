/* ============================================
   ALMOXARIFADO TI — utils/formatters.js
   Funções de formatação para exibição
   ============================================ */

/**
 * Formata uma string ISO 8601 para data/hora legível em pt-BR.
 * @param {string} iso
 * @returns {string} ex: "26/06/2026 14:35"
 */
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' +
         d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Retorna o HTML de um badge de status de estoque.
 * @param {object} item - objeto do item com quantidade e estoque_minimo
 * @returns {string} HTML do badge
 */
function badgeStatus(item) {
  if (item.quantidade === 0)
    return `<span class="badge badge-red">Sem estoque</span>`;
  if (item.quantidade < item.estoque_minimo)
    return `<span class="badge badge-amber">Crítico</span>`;
  return `<span class="badge badge-green">Normal</span>`;
}
