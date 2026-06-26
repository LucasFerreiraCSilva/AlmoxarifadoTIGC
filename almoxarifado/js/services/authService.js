/* ============================================
   ALMOXARIFADO TI — services/authService.js
   Autenticação de usuário
   ============================================ */

const AuthService = {
  currentUser: null,

  /**
   * Tenta autenticar com usuário e senha.
   * @param {string} usuario
   * @param {string} senha
   * @returns {boolean}
   */
  login(usuario, senha) {
    if (CONFIG.USERS[usuario] === senha) {
      this.currentUser = usuario;
      return true;
    }
    return false;
  },

  /** Encerra a sessão atual. */
  logout() {
    this.currentUser = null;
  },

  /** Retorna true se há sessão ativa. */
  isLoggedIn() {
    return this.currentUser !== null;
  }
};
