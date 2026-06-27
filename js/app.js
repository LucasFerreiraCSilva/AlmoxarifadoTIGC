/* ============================================
   ALMOXARIFADO TI — app.js
   ============================================ */

let pendingAction = null;

async function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;

  const btn = document.querySelector('.btn-primary');
  btn.textContent = 'Entrando…';
  btn.disabled = true;

  const ok = await AuthService.login(username, password);

  btn.textContent = 'Entrar';
  btn.disabled = false;

  if (ok) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display          = 'flex';
    document.getElementById('login-error').style.display  = 'none';
    document.getElementById('user-display').textContent   = username;
    document.getElementById('user-avatar').textContent    = username.slice(0,2).toUpperCase();
    document.getElementById('user-role-badge').textContent= AuthService.isAdmin() ? '🔑 Admin' : '👤 Operador';
    document.getElementById('nav-usuarios').style.display = AuthService.isAdmin() ? 'flex' : 'none';
    refreshAll();
    goTo('painel', document.querySelector('[data-page="painel"]'));
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

function doLogout() {
  AuthService.logout();
  document.getElementById('app').style.display          = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-user').value           = '';
  document.getElementById('login-pass').value           = '';
}

document.getElementById('login-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
document.getElementById('login-user').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('login-pass').focus(); });

function goTo(page, el) {
  if (page === 'usuarios' && !AuthService.isAdmin()) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  if (el) el.classList.add('active');
  if (page==='painel')       renderPainel();
  if (page==='movimentacao') populateMovSelect();
  if (page==='editar')       populateEditSelect();
  if (page==='remover')      populateRemSelect();
  if (page==='historico')    renderHistorico();
  if (page==='usuarios')     renderUsuarios();
  clearMsgs();
}

function openModal(title, body, action) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML    = body;
  pendingAction = action;
  document.getElementById('modal-confirm').classList.add('open');
}
function closeModal() {
  document.getElementById('modal-confirm').classList.remove('open');
  pendingAction = null;
}
async function execModal() {
  if (pendingAction) await pendingAction();
  closeModal();
}

async function refreshAll() {
  renderPainel();
  populateMovSelect();
  populateEditSelect();
  populateRemSelect();
  refreshCatList();
}

async function refreshCatList() {
  const cats = await ItemService.getCategories();
  const dl   = document.getElementById('cat-list');
  if (dl) dl.innerHTML = cats.map(c=>`<option value="${esc(c)}">`).join('');
  const pcat = document.getElementById('painel-cat');
  if (pcat) {
    const cur = pcat.value;
    pcat.innerHTML = '<option value="">Todas as categorias</option>' +
      cats.map(c=>`<option value="${esc(c)}"${c===cur?' selected':''}>${esc(c)}</option>`).join('');
  }
}
