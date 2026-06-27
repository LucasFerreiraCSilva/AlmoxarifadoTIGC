/* ============================================
   ALMOXARIFADO TI — utils/validators.js
   Funções de validação de entrada
   ============================================ */

/**
 * Valida se um código de item é válido (não vazio).
 * @param {string} codigo
 * @returns {{ valid: boolean, error?: string }}
 */
function validateCodigo(codigo) {
  if (!codigo || !codigo.trim())
    return { valid: false, error: 'O código é obrigatório!' };
  return { valid: true };
}

/**
 * Valida se uma quantidade de movimentação é válida.
 * @param {number} qty
 * @returns {{ valid: boolean, error?: string }}
 */
function validateQty(qty) {
  if (!qty || qty < 1)
    return { valid: false, error: 'Quantidade deve ser maior que zero!' };
  return { valid: true };
}

/**
 * Valida se há saldo suficiente para uma saída.
 * @param {number} current - estoque atual
 * @param {number} qty     - quantidade a retirar
 * @returns {{ valid: boolean, error?: string }}
 */
function validateSaldo(current, qty) {
  if (current - qty < 0)
    return { valid: false, error: `Quantidade insuficiente! Estoque atual: ${current}` };
  return { valid: true };
}
