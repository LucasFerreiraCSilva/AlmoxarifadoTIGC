/* ============================================
   ALMOXARIFADO TI — services/userService.js
   Gerenciamento de usuários (admin only)
   ============================================ */

const UserService = {
  STORAGE_KEY: 'alm_users',

  /**
   * Retorna a lista de usuários persistida.
   * Na primeira execução, inicializa com os usuários padrão do config.
   */
  getAll() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    // Primeira vez: migra os usuários fixos do config para o storage
    const initial = Object.entries(CONFIG.USERS).map(([username, password], i) => ({
      id:       i + 1,
      username,
      password, // plain-text (uso local/offline)
      role:     username === 'admin' ? 'admin' : 'operador',
      createdAt: new Date().toISOString()
    }));
    this._save(initial);
    return initial;
  },

  _save(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  /** Verifica credenciais. Retorna o objeto usuário ou null. */
  authenticate(username, password) {
    return this.getAll().find(u => u.username === username && u.password === password) || null;
  },

  /** Verifica se um username já existe. */
  usernameExists(username) {
    return !!this.getAll().find(u => u.username === username);
  },

  /**
   * Cria um novo usuário.
   * @returns {{ success: boolean, error?: string }}
   */
  create({ username, password, role }) {
    if (!username || !username.trim())
      return { success: false, error: 'O nome de usuário é obrigatório!' };
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return { success: false, error: 'Use apenas letras, números e underscore.' };
    if (!password || password.length < 4)
      return { success: false, error: 'A senha deve ter no mínimo 4 caracteres!' };
    if (this.usernameExists(username))
      return { success: false, error: 'Esse nome de usuário já está em uso!' };

    const users = this.getAll();
    users.push({
      id:        nextId(users),
      username:  username.trim(),
      password,
      role:      role || 'operador',
      createdAt: new Date().toISOString()
    });
    this._save(users);
    return { success: true };
  },

  /**
   * Remove um usuário pelo id.
   * Impede remover o próprio usuário logado e o último admin.
   */
  remove(id, currentUsername) {
    const users = this.getAll();
    const target = users.find(u => u.id === id);

    if (!target)
      return { success: false, error: 'Usuário não encontrado!' };
    if (target.username === currentUsername)
      return { success: false, error: 'Você não pode remover sua própria conta!' };
    if (target.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1)
      return { success: false, error: 'Deve existir ao menos um administrador!' };

    this._save(users.filter(u => u.id !== id));
    return { success: true };
  },

  /**
   * Altera a senha de um usuário.
   */
  changePassword(id, newPassword) {
    if (!newPassword || newPassword.length < 4)
      return { success: false, error: 'A senha deve ter no mínimo 4 caracteres!' };

    const users = this.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx < 0) return { success: false, error: 'Usuário não encontrado!' };

    users[idx].password = newPassword;
    this._save(users);
    return { success: true };
  }
};
