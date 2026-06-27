/* ============================================
   ALMOXARIFADO TI — services/authService.js
   ============================================ */

const AuthService = {
  currentUser: null,
  currentRole: null,

  async login(username, password) {
    try {
      const response = await supabase
        .from('usuarios')
        .select('username, role')
        .eq('username', username)
        .eq('password', password)
        .limit(1);

      console.log('Login response:', response);

      if (response.error) {
        console.error('Supabase error:', response.error);
        return false;
      }

      const rows = response.data;
      if (!rows || rows.length === 0) return false;

      const user = rows[0];
      this.currentUser = user.username;
      this.currentRole = user.role;
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
