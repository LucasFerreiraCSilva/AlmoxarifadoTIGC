/* ============================================
   ALMOXARIFADO TI — app.js
   Controlador principal: login, navegação,
   modal de confirmação e refresh global
   ============================================ */

let pendingAction = null;

/* ---------- LOGIN ---------- */
function doLogin() {
  const usuario = document.getElementById('login-user').value.trim();
  const senha   = document.getElementById('login-pass').value;

  if (AuthService.login(usuario, senha)) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display          = 'flex';
    document.getElementById('login-error').style.display  = 'none';

    document.getElementById('user-display').textContent = usuario;
    document.getElementById('user-avatar').textContent  = usuario.slice(0, 2).toUpperCase();

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

/* Teclas de atalho no login */
document.getElementById('login-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
document.getElementById('login-user').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-pass').focus();
});

/* ---------- NAVEGAÇÃO ---------- */
function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');
  if (el) el.classList.add('active');

  /* Inicializa a página ao entrar */
  if (page === 'painel')       renderPainel();
  if (page === 'movimentacao') populateMovSelect();
  if (page === 'editar')       populateEditSelect();
  if (page === 'remover')      populateRemSelect();
  if (page === 'historico')    renderHistorico();

  clearMsgs();
}

/* ---------- MODAL DE CONFIRMAÇÃO ---------- */
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

function execModal() {
  if (pendingAction) pendingAction();
  closeModal();
}

/* ---------- REFRESH GLOBAL ---------- */
function refreshAll() {
  renderPainel();
  populateMovSelect();
  populateEditSelect();
  populateRemSelect();
  refreshCatList();
}

function refreshCatList() {
  const cats = ItemService.getCategories();

  /* datalist no cadastro */
  const dl = document.getElementById('cat-list');
  if (dl) dl.innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');

  /* select no painel */
  const pcat = document.getElementById('painel-cat');
  if (pcat) {
    const cur = pcat.value;
    pcat.innerHTML =
      '<option value="">Todas as categorias</option>' +
      cats.map(c => `<option value="${esc(c)}"${c === cur ? ' selected' : ''}>${esc(c)}</option>`).join('');
  }
}
