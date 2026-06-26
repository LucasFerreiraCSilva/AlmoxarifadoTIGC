/* ============================================
   ALMOXARIFADO TI — utils/helpers.js
   Funções utilitárias gerais
   ============================================ */

/**
 * Escapa caracteres HTML especiais para evitar XSS.
 * @param {*} s - valor a escapar
 * @returns {string}
 */
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Retorna o próximo ID inteiro disponível em um array de objetos {id}.
 * @param {Array} arr
 * @returns {number}
 */
function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

/**
 * Exibe uma mensagem de feedback em um elemento container.
 * @param {string} elementId - id do elemento container
 * @param {'error'|'success'} type
 * @param {string} msg - texto da mensagem
 */
function showMsg(elementId, type, msg) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const cls  = type === 'error' ? 'alert-box' : 'success-box';
  const icon = type === 'error' ? '❌' : '✅';
  el.innerHTML = `<div class="${cls}">${icon} ${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, CONFIG.MSG_TIMEOUT);
}

/**
 * Limpa as mensagens de feedback de todas as páginas.
 */
function clearMsgs() {
  ['cad-msg', 'mov-msg', 'edit-msg', 'rem-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
}
