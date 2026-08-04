/* ============================================
   ALMOXARIFADO TI — pages/movimentacao.js
   ============================================ */

let itensMovimentacao = [];
let _numeroSaida = parseInt(localStorage.getItem('alm_num_saida') || '0');

const SERVIDOR_IMPRESSAO = 'http://localhost:3000';

async function populateMovSelect() {
  const items = await ItemService.getAll();
  window._movItems = items;
  itensMovimentacao = [];
  renderLinhasMovimentacao();
  adicionarLinhaMovimentacao();
}

function renderLinhasMovimentacao() {
  const container = document.getElementById('mov-linhas');
  container.innerHTML = '';
  itensMovimentacao.forEach((linha, idx) => {
    const options = (window._movItems || []).map(i =>
      `<option value="${i.id}" ${i.id == linha.item_id ? 'selected' : ''}>${esc(i.codigo)} — ${esc(i.nome)}</option>`
    ).join('');

    container.innerHTML += `
      <div class="mov-linha" id="mov-linha-${idx}"
        style="display:grid;grid-template-columns:1fr 140px 36px;gap:.75rem;align-items:end;margin-bottom:.75rem">
        <div>
          ${idx === 0 ? '<label style="display:block;font-size:12px;font-weight:500;color:var(--muted);margin-bottom:.4rem">Item</label>' : ''}
          <select onchange="atualizarLinha(${idx}, 'item_id', this.value)"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:.6rem .75rem;color:var(--text);font-size:14px;font-family:inherit;outline:none">
            <option value="">Selecione um item…</option>
            ${options}
          </select>
        </div>
        <div>
          ${idx === 0 ? '<label style="display:block;font-size:12px;font-weight:500;color:var(--muted);margin-bottom:.4rem">Quantidade</label>' : ''}
          <div class="qty-controls">
            <button class="qty-btn" onclick="adjQtyLinha(${idx}, -1)">−</button>
            <input class="qty-input" type="number" value="${linha.quantidade}" min="1"
              onchange="atualizarLinha(${idx}, 'quantidade', parseInt(this.value)||1)"
              style="width:60px">
            <button class="qty-btn" onclick="adjQtyLinha(${idx}, 1)">+</button>
          </div>
        </div>
        <div style="padding-bottom:2px">
          ${itensMovimentacao.length > 1
            ? `<button class="qty-btn" onclick="removerLinha(${idx})" title="Remover"
                style="color:var(--red);border-color:var(--red)">✕</button>`
            : '<div style="width:36px"></div>'}
        </div>
      </div>
    `;
  });
}

function adicionarLinhaMovimentacao() {
  itensMovimentacao.push({ item_id: '', quantidade: 1 });
  renderLinhasMovimentacao();
}

function removerLinha(idx) {
  itensMovimentacao.splice(idx, 1);
  renderLinhasMovimentacao();
}

function atualizarLinha(idx, campo, valor) {
  itensMovimentacao[idx][campo] = valor;
}

function adjQtyLinha(idx, delta) {
  const nova = Math.max(1, itensMovimentacao[idx].quantidade + delta);
  itensMovimentacao[idx].quantidade = nova;
  renderLinhasMovimentacao();
}

function updateItemInfo() {}
function adjQty(d) {}

async function registrarMovimento() {
  const tipo        = document.getElementById('mov-tipo').value;
  const responsavel = document.getElementById('mov-resp').value.trim();
  const observacao  = document.getElementById('mov-obs').value.trim();

  const linhasValidas = itensMovimentacao.filter(l => l.item_id);
  if (!linhasValidas.length) {
    showMsg('mov-msg', 'error', 'Selecione ao menos um item!');
    return;
  }

  const erros    = [];
  const sucessos = [];

  for (const linha of linhasValidas) {
    const result = await MovementService.register({
      item_id:    parseInt(linha.item_id),
      tipo,
      quantidade: linha.quantidade,
      responsavel,
      observacao
    });

    const item = (window._movItems || []).find(i => i.id == linha.item_id);

    if (!result.success) {
      erros.push(`${item ? item.nome : linha.item_id}: ${result.error}`);
    } else {
      sucessos.push({
        nome:       item ? item.nome : '?',
        quantidade: linha.quantidade,
        newQty:     result.newQty
      });
    }
  }

  if (erros.length) {
    showMsg('mov-msg', 'error', 'Erros: ' + erros.join(' | '));
    return;
  }

  showMsg('mov-msg', 'success', `${sucessos.length} item(ns) registrado(s) com sucesso!`);

  if (tipo === 'saida') {
    await imprimirCupom(sucessos, responsavel, observacao);
  }

  document.getElementById('mov-obs').value = '';
  itensMovimentacao = [];
  populateMovSelect();
  refreshAll();
}

async function imprimirCupom(itens, responsavel, observacao) {
  _numeroSaida++;
  localStorage.setItem('alm_num_saida', _numeroSaida);

  const agora = new Date();
  const data  = agora.toLocaleDateString('pt-BR');
  const hora  = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const num   = String(_numeroSaida).padStart(6, '0');

  function linha2col(esq, dir, largura = 48) {
    const espaco = largura - esq.length - dir.length;
    return esq + ' '.repeat(Math.max(1, espaco)) + dir;
  }

  const SEP  = '-'.repeat(48);
  const SEP2 = '='.repeat(48);

  let cupom = [];
  cupom.push('\x1B\x40');
  cupom.push('\x1B\x61\x01');
  cupom.push('\x1B\x21\x30');
  cupom.push('ALMOXARIFADO TI\n');
  cupom.push('\x1B\x21\x00');
  cupom.push('Comprovante de Saida\n');
  cupom.push('\x1B\x61\x00');
  cupom.push(SEP2 + '\n');
  cupom.push(linha2col('No Pedido:', '#' + num) + '\n');
  cupom.push(linha2col('Data:', data) + '\n');
  cupom.push(linha2col('Hora:', hora) + '\n');
  cupom.push(SEP + '\n');
  cupom.push('Retirado por: ' + (responsavel || '—') + '\n');
  if (observacao) cupom.push('Obs: ' + observacao + '\n');
  cupom.push(SEP + '\n');
  cupom.push('\x1B\x45\x01');
  cupom.push(linha2col('ITEM', 'QTD') + '\n');
  cupom.push('\x1B\x45\x00');
  cupom.push(SEP + '\n');

  let totalQtd = 0;
  itens.forEach(i => {
    const qtdStr  = i.quantidade + ' un.';
    const nomeMax = 48 - qtdStr.length - 1;
    const nome    = i.nome.length > nomeMax ? i.nome.substring(0, nomeMax - 1) + '.' : i.nome;
    cupom.push(linha2col(nome, qtdStr) + '\n');
    totalQtd += i.quantidade;
  });

  cupom.push(SEP2 + '\n');
  cupom.push('\x1B\x45\x01');
  cupom.push(linha2col('TOTAL:', totalQtd + ' un.') + '\n');
  cupom.push('\x1B\x45\x00');
  cupom.push(SEP + '\n');
  cupom.push('\n\n\n\n');
  cupom.push(SEP + '\n');
  cupom.push('\x1B\x61\x01');
  cupom.push('Assinatura do responsavel\n');
  cupom.push('\x1B\x61\x00');
  cupom.push('\n\n');
  cupom.push('\x1D\x56\x41\x03');

  const bytes = new TextEncoder().encode(cupom.join(''));

  try {
    const response = await fetch(`${SERVIDOR_IMPRESSAO}/imprimir`, {
      method: 'POST',
      body:   bytes
    });

    const result = await response.json();

    if (!result.success) {
      alert('Erro ao imprimir: ' + result.error);
    }
  } catch (e) {
    alert('Servidor de impressão não está rodando!\nRode "node server.js" no servidor e tente novamente.');
  }
}