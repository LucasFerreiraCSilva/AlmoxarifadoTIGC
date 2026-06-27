/* ============================================
   ALMOXARIFADO TI — pages/cadastro.js
   Lógica da página Cadastrar Item
   ============================================ */

function cadastrarItem() {
  const codigo         = document.getElementById('cad-codigo').value.trim();
  const nome           = document.getElementById('cad-nome').value.trim();
  const categoria      = document.getElementById('cad-categoria').value.trim();
  const localizacao    = document.getElementById('cad-local').value.trim();
  const quantidade     = parseInt(document.getElementById('cad-qty').value) || 0;
  const estoque_minimo = parseInt(document.getElementById('cad-min').value) || 0;
  const observacao     = document.getElementById('cad-obs').value.trim();

  const result = ItemService.create({ codigo, nome, categoria, localizacao, quantidade, estoque_minimo, observacao });

  if (!result.success) {
    showMsg('cad-msg', 'error', result.error);
    return;
  }

  showMsg('cad-msg', 'success', `Item "${nome || codigo}" cadastrado com sucesso!`);
  limparCadastro();
  refreshAll();
}

function limparCadastro() {
  ['cad-codigo', 'cad-nome', 'cad-categoria', 'cad-local', 'cad-obs']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('cad-qty').value = 0;
  document.getElementById('cad-min').value = 0;
}
