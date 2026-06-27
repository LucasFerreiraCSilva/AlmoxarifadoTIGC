/* ============================================
   ALMOXARIFADO TI — pages/usuarios.js
   Lógica da página Gerenciar Usuários (admin)
   ============================================ */

function renderUsuarios() {
  const users = UserService.getAll();

  document.getElementById('user-count').textContent = users.length;

  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = users.map(u => {
    const isMe      = u.username === AuthService.currentUser;
    const isLastAdm = u.role === 'admin' && users.filter(x => x.role === 'admin').length <= 1;
    const canDelete = !isMe && !isLastAdm;

    return `<tr>
      <td style="font-weight:500">${esc(u.username)} ${isMe ? '<span class="badge badge-blue">você</span>' : ''}</td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-amber' : 'badge-gray'}">
        ${u.role === 'admin' ? '🔑 Admin' : '👤 Operador'}
      </span></td>
      <td style="color:var(--muted)">${fmtDate(u.createdAt)}</td>
      <td>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-ghost btn-sm" onclick="abrirTrocaSenha(${u.id}, '${esc(u.username)}')">
            🔒 Senha
          </button>
          ${canDelete
            ? `<button class="btn btn-danger btn-sm" onclick="confirmarRemocaoUser(${u.id}, '${esc(u.username)}')">
                🗑️
               </button>`
            : `<button class="btn btn-ghost btn-sm" disabled style="opacity:.3;cursor:not-allowed" title="${isMe ? 'Não pode remover a si mesmo' : 'Último admin'}">🗑️</button>`
          }
        </div>
      </td>
    </tr>`;
  }).join('');
}

function criarUsuario() {
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;
  const role     = document.getElementById('new-role').value;

  const result = UserService.create({ username, password, role });

  if (!result.success) {
    showMsg('user-msg', 'error', result.error);
    return;
  }

  showMsg('user-msg', 'success', `Usuário "${username}" criado com sucesso!`);
  document.getElementById('new-username').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('new-role').value     = 'operador';
  document.getElementById('pwd-strength').textContent = '';
  renderUsuarios();
}

function confirmarRemocaoUser(id, username) {
  openModal(
    'Remover usuário',
    `Tem certeza que deseja remover o usuário <strong>${esc(username)}</strong>? Esta ação não pode ser desfeita.`,
    () => {
      const result = UserService.remove(id, AuthService.currentUser);
      if (!result.success) {
        showMsg('user-msg', 'error', result.error);
        return;
      }
      showMsg('user-msg', 'success', `Usuário "${username}" removido.`);
      renderUsuarios();
    }
  );
}

/* --- Troca de senha via modal inline --- */
function abrirTrocaSenha(id, username) {
  document.getElementById('pwd-modal-title').textContent = `Alterar senha — ${username}`;
  document.getElementById('pwd-modal-new').value    = '';
  document.getElementById('pwd-modal-confirm').value= '';
  document.getElementById('pwd-modal-msg').innerHTML= '';
  document.getElementById('pwd-modal-id').value     = id;
  document.getElementById('modal-pwd').classList.add('open');
}

function salvarNovaSenha() {
  const id      = parseInt(document.getElementById('pwd-modal-id').value);
  const nova    = document.getElementById('pwd-modal-new').value;
  const confirm = document.getElementById('pwd-modal-confirm').value;

  if (nova !== confirm) {
    document.getElementById('pwd-modal-msg').innerHTML =
      `<div class="alert-box" style="margin-bottom:0">❌ As senhas não coincidem!</div>`;
    return;
  }

  const result = UserService.changePassword(id, nova);
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

/* --- Indicador de força de senha --- */
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
