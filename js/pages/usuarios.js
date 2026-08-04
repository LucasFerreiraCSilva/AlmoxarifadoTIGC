/* ============================================
   ALMOXARIFADO TI — pages/usuarios.js
   ============================================ */

async function renderUsuarios() {
  const users = await UserService.getAll();
  document.getElementById('user-count').textContent = users.length;
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = users.map(u => {
    const isMe      = u.username === AuthService.currentUser;
    const isLastAdm = u.role === 'admin' && users.filter(x => x.role === 'admin').length <= 1;
    const canDelete = !isMe && !isLastAdm;
    return `<tr>
      <td style="font-weight:500">${esc(u.username)} ${isMe ? '<span class="badge badge-blue">você</span>' : ''}</td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-amber' : 'badge-gray'}">${u.role === 'admin' ? '🔑 Admin' : '👤 Operador'}</span></td>
      <td style="color:var(--muted)">${fmtDate(u.created_at)}</td>
      <td><div style="display:flex;gap:.4rem">
        <button class="btn btn-ghost btn-sm" onclick="abrirTrocaSenha(${u.id}, '${esc(u.username)}')">🔒 Senha</button>
        ${canDelete
          ? `<button class="btn btn-danger btn-sm" onclick="confirmarRemocaoUser(${u.id}, '${esc(u.username)}')">🗑️</button>`
          : `<button class="btn btn-ghost btn-sm" disabled style="opacity:.3;cursor:not-allowed">🗑️</button>`}
      </div></td>
    </tr>`;
  }).join('');
}

async function criarUsuario() {
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;
  const role     = document.getElementById('new-role').value;

  // Se for admin, pede confirmação com senha do admin logado
  if (role === 'admin') {
    document.getElementById('confirm-admin-msg').innerHTML = '';
    document.getElementById('confirm-admin-pass').value   = '';
    document.getElementById('confirm-admin-user').textContent = username;
    document.getElementById('modal-confirm-admin').classList.add('open');

    // Guarda temporariamente para usar após confirmação
    window._pendingUser = { username, password, role };
    return;
  }

  await _executarCriarUsuario({ username, password, role });
}

async function confirmarCriacaoAdmin() {
  const senhaAdmin = document.getElementById('confirm-admin-pass').value;
  const { username, password, role } = window._pendingUser || {};

  if (!senhaAdmin) {
    document.getElementById('confirm-admin-msg').innerHTML =
      `<div class="alert-box" style="margin-bottom:0">❌ Digite sua senha para confirmar!</div>`;
    return;
  }

  // Verifica senha do admin logado
  const ok = await AuthService.login(AuthService.currentUser, senhaAdmin);
  if (!ok) {
    document.getElementById('confirm-admin-msg').innerHTML =
      `<div class="alert-box" style="margin-bottom:0">❌ Senha incorreta!</div>`;
    return;
  }

  fecharConfirmAdmin();
  await _executarCriarUsuario({ username, password, role });
}

function fecharConfirmAdmin() {
  document.getElementById('modal-confirm-admin').classList.remove('open');
  window._pendingUser = null;
}

async function _executarCriarUsuario({ username, password, role }) {
  const result = await UserService.create({ username, password, role });
  if (!result.success) { showMsg('user-msg', 'error', result.error); return; }

  showMsg('user-msg', 'success', `Usuário "${username}" criado com sucesso!`);
  document.getElementById('new-username').value        = '';
  document.getElementById('new-password').value        = '';
  document.getElementById('new-role').value            = 'operador';
  document.getElementById('pwd-strength').textContent  = '';
  renderUsuarios();
}

async function confirmarRemocaoUser(id, username) {
  openModal('Remover usuário',
    `Tem certeza que deseja remover o usuário <strong>${esc(username)}</strong>?`,
    async () => {
      const result = await UserService.remove(id, AuthService.currentUser);
      if (!result.success) { showMsg('user-msg', 'error', result.error); return; }
      showMsg('user-msg', 'success', `Usuário "${username}" removido.`);
      renderUsuarios();
    }
  );
}

function abrirTrocaSenha(id, username) {
  document.getElementById('pwd-modal-title').textContent = `Alterar senha — ${username}`;
  document.getElementById('pwd-modal-new').value         = '';
  document.getElementById('pwd-modal-confirm').value     = '';
  document.getElementById('pwd-modal-msg').innerHTML     = '';
  document.getElementById('pwd-modal-id').value          = id;
  document.getElementById('modal-pwd').classList.add('open');
}

async function salvarNovaSenha() {
  const id      = parseInt(document.getElementById('pwd-modal-id').value);
  const nova    = document.getElementById('pwd-modal-new').value;
  const confirm = document.getElementById('pwd-modal-confirm').value;

  if (nova !== confirm) {
    document.getElementById('pwd-modal-msg').innerHTML =
      `<div class="alert-box" style="margin-bottom:0">❌ As senhas não coincidem!</div>`;
    return;
  }

  const result = await UserService.changePassword(id, nova);
  if (!result.success) {
    document.getElementById('pwd-modal-msg').innerHTML =
      `<div class="alert-box" style="margin-bottom:0">❌ ${result.error}</div>`;
    return;
  }

  closePwdModal();
  showMsg('user-msg', 'success', 'Senha alterada com sucesso!');
}

function closePwdModal() {
  document.getElementById('modal-pwd').classList.remove('open');
}

function checkPwdStrength() {
  const val = document.getElementById('new-password').value;
  const el  = document.getElementById('pwd-strength');
  if (!val) { el.textContent = ''; return; }
  let score = 0;
  if (val.length >= 6)              score++;
  if (val.length >= 10)             score++;
  if (/[A-Z]/.test(val))           score++;
  if (/[0-9]/.test(val))           score++;
  if (/[^a-zA-Z0-9]/.test(val))    score++;
  const levels = [
    { label: 'Muito fraca', color: 'var(--red)'   },
    { label: 'Fraca',       color: 'var(--red)'   },
    { label: 'Razoável',    color: 'var(--amber)'  },
    { label: 'Boa',         color: 'var(--amber)'  },
    { label: 'Forte',       color: 'var(--green)'  },
    { label: 'Muito forte', color: 'var(--green)'  },
  ];
  const lvl = levels[Math.min(score, 5)];
  el.innerHTML = `<span style="color:${lvl.color};font-size:11px">● ${lvl.label}</span>`;
}