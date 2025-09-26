// === Utilidades ===
function toInt(v) {
  // Garante número inteiro (inclusive negativos), caindo para 0
  const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

// Cria/garante estrutura do modal apenas uma vez
function ensureModal() {
  if (document.getElementById('playerModal')) return;

  const modal = document.createElement('div');
  modal.id = 'playerModal';
  modal.style.cssText = `
    position: fixed; inset: 0; display: none; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.5); z-index: 9999;
  `;

  modal.innerHTML = `
    <div id="playerModalContent" role="dialog" aria-modal="true" aria-labelledby="playerModalTitle"
         style="background:#fff; max-width:720px; width:calc(100% - 32px); border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.2); overflow:hidden;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#f6f6f9; border-bottom:1px solid #ececf1;">
        <h3 id="playerModalTitle" style="margin:0; font:600 1.1rem/1.2 system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial;">Detalhes do Jogador</h3>
        <button id="playerModalClose" aria-label="Fechar" style="border:none; background:transparent; font-size:20px; cursor:pointer;">✕</button>
      </div>
      <div id="playerModalBody" style="padding:16px; max-height:70vh; overflow:auto;"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Fechar no X
  modal.querySelector('#playerModalClose').addEventListener('click', () => closeModal());
  // Fechar clicando fora
  modal.addEventListener('click', (e) => {
    const content = document.getElementById('playerModalContent');
    if (!content.contains(e.target)) closeModal();
  });
  // Fechar por ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(html, titleText = 'Detalhes do Jogador') {
  ensureModal();
  const modal = document.getElementById('playerModal');
  const body = document.getElementById('playerModalBody');
  const title = document.getElementById('playerModalTitle');
  title.textContent = titleText;
  body.innerHTML = html;
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('playerModal');
  if (modal) modal.style.display = 'none';
}

// Função chamada automaticamente quando o script é carregado
document.addEventListener("DOMContentLoaded", carregarRanking);

// Mantém em escopo para uso nos cliques
let RANKING_CACHE = [];

// (Opcional) Função antiga ajustada caso queira montar linha completa com todas colunas
function carregarRankingIndividual(aluno, index) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>
      <img src="./images/avatar/${aluno.nickname}.png" alt="Avatar" style="width:40px;height:40px;object-fit:cover;border-radius:50%;"><br>
      <button class="nickname-btn" data-index="${index}" aria-haspopup="dialog"
              style="background:none;border:none;color:#2b6cb0;cursor:pointer;text-decoration:underline;">
        ${aluno.nickname}
      </button>
    </td>
    <td>${aluno.atv1}</td>
    <td>${aluno.atv2}</td>
    <td>${aluno.atv3}</td>
    <td>${aluno.atv4}</td>
    <td>${aluno.atv5}</td>
    <td>${aluno.atv6}</td>
    <td>${aluno.atv7}</td>
    <td>${aluno.atv8}</td>
    <td>${aluno.quiz1}</td>
    <td>${aluno.quiz2}</td>
    <td>-${aluno.resg1}</td>
    <td>-${aluno.resg2}</td>
    <td>-${aluno.resg3}</td>
    <td class="highlight">${aluno.total_calculado}</td>
  `;
  return row;
}

function carregarRanking() {
  const csvPath = `${location.origin}/desafio-html-info1-ifpr/assets/ranking_geral.csv`;

  fetch(csvPath)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar o arquivo CSV');
      return response.text();
    })
    .then(data => {
      const lines = data
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');

      let tbody = document.querySelector('#rankingTable tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        document.querySelector('#rankingTable').appendChild(tbody);
      }
      tbody.innerHTML = ''; // Limpa conteúdo anterior

      // Converte o CSV em um array de objetos com total calculado
      RANKING_CACHE = lines.map(line => {
        // Atenção: mantém a ordem das colunas exatamente como no CSV
        const [
          email, nickname, atv1, atv2, atv3, resg,
          atv4, quiz1, quiz2, atv5, atv6, atv7, atv8, resg2, resg3, total
        ] = line.split(',').map(val => val?.trim());

        const total_pontos_calculado =
          toInt(atv1) + toInt(atv2) + toInt(atv3) + toInt(atv4) +
          toInt(atv5) + toInt(atv6) + toInt(atv7) + toInt(atv8) +
          toInt(quiz1) + toInt(quiz2);

        const total_resgate_calculado = toInt(resg) + toInt(resg2), toInt(resg3);

        const total_calculado = total_pontos_calculado - total_resgate_calculado;

        return {
          email, nickname,
          atv1, atv2, atv3, atv4, atv5, atv6, atv7, atv8,
          resg, resg2, quiz1, quiz2,
          total_pontos_calculado, total_resgate_calculado,
          total_calculado, total
        };
      });

      // Se desejar ordenar do maior para o menor total, descomente:
      // RANKING_CACHE.sort((a, b) => b.total_calculado - a.total_calculado);

      let total_geral = 0;

      // Monta cada linha da tabela (vista resumida)
      RANKING_CACHE.forEach((aluno, index) => {
        let foguinho = index < 3 ? ' 🔥' : ''; // Top 3 com fogo
        const isPrimeiroLugar = index === 0;
        const row = document.createElement('tr');

        if (isPrimeiroLugar) {
          row.style.backgroundColor = '#fff8e1'; // fundo amarelo claro
          row.style.fontWeight = 'bold';
        }

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>
            <img src="./images/avatar/${aluno.nickname}.png" alt="Avatar" style="width:40px;height:40px;object-fit:cover;border-radius:50%;"><br>
            <button class="nickname-btn" data-index="${index}" aria-haspopup="dialog"
                    style="background:none;border:none;color:#2b6cb0;cursor:pointer;text-decoration:underline;">
              ${aluno.nickname}
            </button>
          </td>
          <td>${aluno.total_pontos_calculado}</td>
          <td>${aluno.total_resgate_calculado}</td>
          <td class="highlight">${aluno.total_calculado}${foguinho}</td>
        `;
        tbody.appendChild(row);
        total_geral += aluno.total_calculado;
      });

      // Linha de Total Geral (ajusta colspan de acordo com o nº de colunas exibidas)
      const row2 = document.createElement('tr');
      row2.innerHTML = `<td colspan="4" style="text-align:right;font-weight:600;">Total Geral</td><td>${total_geral}</td>`;
      tbody.appendChild(row2);

      // Listener único para abrir modal ao clicar no nickname
      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.nickname-btn');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        const aluno = RANKING_CACHE[idx];
        if (!aluno) return;

        const detalheHTML = `
          <div style="display:flex; gap:16px; align-items:center; margin-bottom:12px;">
            <img src="./images/avatar/${aluno.nickname}.png" alt="Avatar"
                 style="width:64px;height:64px;object-fit:cover;border-radius:50%;border:1px solid #eee;">
            <div>
              <div style="font-weight:700; font-size:1.05rem;">${aluno.nickname}</div>
            </div>
          </div>

          <table style="width:100%; border-collapse:collapse;">
            <tbody>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 1</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv1)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 2</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv2)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 3</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv3)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 4</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv4)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 5</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv5)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 6</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv6)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 7</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv7)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 8</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.atv8)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Quiz 1</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.quiz1)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Quiz 2</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${toInt(aluno.quiz2)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Resgate Doces</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">-${toInt(aluno.resg1)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Resgate Coletivo (1)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">-${toInt(aluno.resg2)}</td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Resgate Madeleine</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">-${toInt(aluno.resg3)}</td></tr>
              <tr><td style="padding:6px 8px;border-top:2px solid #ddd;font-weight:700;">Total de Pontos</td><td style="padding:6px 8px;border-top:2px solid #ddd;font-weight:700;">${toInt(aluno.total_pontos_calculado)}</td></tr>
              <tr><td style="padding:6px 8px;font-weight:700;">Total de Resgates</td><td style="padding:6px 8px;font-weight:700;">-${toInt(aluno.total_resgate_calculado)}</td></tr>
              <tr><td style="padding:6px 8px;border-top:2px solid #000;font-weight:800;">Total Final</td><td style="padding:6px 8px;border-top:2px solid #000;font-weight:800;">${toInt(aluno.total_calculado)}</td></tr>
            </tbody>
          </table>
        `;

        openModal(detalheHTML, `Detalhes — ${aluno.nickname}`);
      });
    })
    .catch(error => {
      console.error('Erro ao processar o CSV:', error);
      const table = document.querySelector('#rankingTable');
      if (table) {
        table.insertAdjacentHTML(
          'afterend',
          `<p style="color: red;">❌ Erro ao carregar os dados do ranking. Verifique o caminho do arquivo CSV.</p>`
        );
      }
    });
}
