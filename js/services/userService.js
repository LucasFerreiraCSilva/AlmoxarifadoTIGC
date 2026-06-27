/* ============================================
   ALMOXARIFADO TI — services/userService.js
   Gerenciamento de usuários via Supabase
   ============================================ */

const UserService = {
  async getAll() {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at');
    return data || [];
  },

  async usernameExists(username) {
    const { data } = await supabase
      .from('usuarios')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    return !!data;
  },

  async create({ username, password, role }) {
    if (!username || !username.trim())
      return { success: false, error: 'O nome de usuário é obrigatório!' };
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return { success: false, error: 'Use apenas letras, números e underscore.' };
    if (!password || password.length < 4)
      return { success: false, error: 'A senha deve ter no mínimo 4 caracteres!' };

    const exists = await this.usernameExists(username);
    if (exists) return { success: false, error: 'Esse nome de usuário já está em uso!' };

    const { error } = await supabase
      .from('usuarios')
      .insert({ username: username.trim(), password, role: role || 'operador' });

    if (error) return { success: false, error: 'Erro ao criar usuário: ' + error.message };
    return { success: true };
  },

  async remove(id, currentUsername) {
    const users = await this.getAll();
    const target = users.find(u => u.id === id);

    if (!target) return { success: false, error: 'Usuário não encontrado!' };
    if (target.username === currentUsername)
      return { success: false, error: 'Você não pode remover sua própria conta!' };
    if (target.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1)
      return { success: false, error: 'Deve existir ao menos um administrador!' };

    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) return { success: false, error: 'Erro ao remover: ' + error.message };
    return { success: true };
  },

  async changePassword(id, newPassword) {
    if (!newPassword || newPassword.length < 4)
      return { success: false, error: 'A senha deve ter no mínimo 4 caracteres!' };

    const { error } = await supabase
      .from('usuarios')
      .update({ password: newPassword })
      .eq('id', id);

    if (error) return { success: false, error: 'Erro ao alterar senha: ' + error.message };
    return { success: true };
  }
};
