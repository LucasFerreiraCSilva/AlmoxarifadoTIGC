/* ============================================
   ALMOXARIFADO TI — services/authService.js
   ============================================ */

const AuthService = {
  currentUser: null,
  currentRole: null,

  async login(username, password) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();   // retorna null em vez de erro quando não encontra

      if (!data) return false;

      this.currentUser = data.username;
      this.currentRole = data.role;
      return true;
    } catch (e) {
      console.error('Erro no login:', e);
      return false;
    }
  },

  logout() {
    this.currentUser = null;
    this.currentRole = null;
  },

  isLoggedIn() { return this.currentUser !== null; },
  isAdmin()    { return this.currentRole === 'admin'; }
};
