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

// Função auxiliar para carregar e processar um CSV
async function loadCSV(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Erro ao carregar o arquivo CSV: ${path}`);
    const data = await response.text();
    const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '');
    
    // Assume que a primeira linha é o cabeçalho e deve ser ignorada para os dados
    if (lines.length > 0) lines.shift(); 
    return lines.map(line => line.split(',').map(val => val?.trim()));
  } catch (error) {
    console.error(`Erro ao carregar CSV: ${path}`, error);
    return []; // Retorna array vazio em caso de erro
  }
}

// Modificação principal na função carregarRanking
async function carregarRanking() {
  const basePath = `${location.origin}/desafio-html-info1-ifpr/assets`;
  const csvPaths = {
    atividades: `${basePath}/atividades/points_atividades.csv`,
    quiz: `${basePath}/atividades/points_quiz.csv`,
    resgate_coletivo: `${basePath}/resgates/resgate_coletivo.csv`,
    resgate_individual: `${basePath}/resgates/resgate_individual.csv`,
  };

  // 1. Carregar todos os dados
  const [data_atividades, data_quiz, data_resgate_coletivo, data_resgate_individual] = await Promise.all([
    loadCSV(csvPaths.atividades),
    loadCSV(csvPaths.quiz),
    loadCSV(csvPaths.resgate_coletivo),
    loadCSV(csvPaths.resgate_individual),
  ]);

  // 2. Mapear e Consolidar Dados Iniciais (Atividades)
  let alunosMap = new Map();

  data_atividades.forEach(line => {
    // Corrigido: Mapeamento de colunas com base no CSV (assumindo que a ordem é fixa)
    const [
      email, nickname, atv1, atv2, atv3, atv4, atv5, atv6, atv7, atv8, atv9, atv10, atv11, atv12, atv13, atv14
    ] = line;

    // Inicializa a pontuação base (apenas atividades)
    const pontos_atividades = [atv1, atv2, atv3, atv4, atv5, atv6, atv7, atv8, atv9, atv10, atv11, atv12, atv13, atv14].reduce((sum, val) => sum + toInt(val), 0);

    alunosMap.set(email, {
      email, nickname,
      atv1: toInt(atv1), atv2: toInt(atv2), atv3: toInt(atv3), atv4: toInt(atv4),
      atv5: toInt(atv5), atv6: toInt(atv6), atv7: toInt(atv7), atv8: toInt(atv8),
      atv9: toInt(atv9), atv10: toInt(atv10), atv11: toInt(atv11), atv12: toInt(atv12),
      atv13: toInt(atv13), atv14: toInt(atv14),
      quiz1: 0, quiz2: 0,
      resg1: 0, resg2: 0, resg3: 0, resg4: 0,
      total_pontos_calculado: pontos_atividades,
      total_resgate_calculado: 0,
      total_calculado: pontos_atividades,
    });
  });

  // 3. Adicionar dados do Quiz (assumindo [email, nickname, quiz1, quiz2])
  data_quiz.forEach(line => {
    const [email, quiz1, quiz2] = line;
    const aluno = alunosMap.get(email);
    if (aluno) {
      aluno.quiz1 = toInt(quiz1);
      aluno.quiz2 = toInt(quiz2);
      aluno.total_pontos_calculado += aluno.quiz1 + aluno.quiz2;
    }
  });
  
  // 4. Adicionar dados de Resgate Individual (assumindo [email, resg1, resg3, resg4])
  // Obs: O código original tinha resg, resg2, quiz1, quiz2. Ajustado para resg1, resg3, resg4 (Doces, Madeleine, Balas Lua Cheia)
  data_resgate_individual.forEach(line => {
    // Adapte os índices conforme a estrutura real do seu CSV de resgate individual
    const [email, resg1, resg2, resg3] = line; 
    const aluno = alunosMap.get(email);
    if (aluno) {
      aluno.resg1 = toInt(resg1); // Resgate Doces
      aluno.resg3 = toInt(resg2); // Resgate Madeleine
      aluno.resg4 = toInt(resg3); // Resgate Balas Lua Cheia
    }
  });

  // 5. Adicionar dados de Resgate Coletivo (assumindo [email, resg2])
  data_resgate_coletivo.forEach(line => {
    // Adapte o índice conforme a estrutura real do seu CSV de resgate coletivo
    const [email, resg_col_1] = line; 
    const aluno = alunosMap.get(email);
    if (aluno) {
      aluno.resg2 = toInt(resg_col_1); // Resgate Coletivo (1)
    }
  });
  
  // 6. Finalizar cálculo e construir RANKING_CACHE
  RANKING_CACHE = Array.from(alunosMap.values()).map(aluno => {
    aluno.total_resgate_calculado = aluno.resg1 + aluno.resg2 + aluno.resg3 + aluno.resg_col_1;
    // O total_pontos_calculado já inclui quiz
    aluno.total_calculado = aluno.total_pontos_calculado - aluno.total_resgate_calculado;
    return aluno;
  });

  // 7. Ordenar (descomentado e habilitado)
  RANKING_CACHE.sort((a, b) => b.total_calculado - a.total_calculado);

  // 8. Inserir na Tabela (lógica de renderização ajustada)
  const rankingTable = document.querySelector('#rankingTable');
  if (!rankingTable) {
    document.querySelector('#rankingTable')?.insertAdjacentHTML('afterend', '<p style="color: red;">❌ Tabela com ID "rankingTable" não encontrada.</p>');
    return;
  }
  rankingTable.innerHTML = ''; // Limpa conteúdo anterior
  // Cria e insere o cabeçalho (<thead>)
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>N.</th>
      <th>Player</th>
      <th>Pontos</th>
      <th>Resgates</th>
      <th>Total</th>
    </tr>
  `;
  rankingTable.appendChild(thead);

  // Cria o corpo (<tbody>) para receber as linhas de dados
  const tbody = document.createElement('tbody');
  
  let total_geral = 0;

  RANKING_CACHE.forEach((aluno, index) => {
    let foguinho = index < 3 ? ' 🔥' : ''; // Top 3 com fogo
    const isPrimeiroLugar = index === 0;
    const row = document.createElement('tr');

    if (isPrimeiroLugar) {
      row.style.backgroundColor = '#fff8e1';
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
      <td>-${aluno.total_resgate_calculado}</td>
      <td class="highlight">${aluno.total_calculado}${foguinho}</td>
    `;
    tbody.appendChild(row);
    total_geral += aluno.total_calculado;
  });

  rankingTable.appendChild(tbody);

  // Linha de Total Geral (ajusta colspan de acordo com o nº de colunas exibidas)
  const row2 = document.createElement('tr');
  row2.style.fontWeight = 'bold';
  row2.innerHTML = `<td colspan="4" style="text-align:right;">Total Geral</td><td class="highlight">${total_geral}</td>`;
  rankingTable.appendChild(row2);

  // 9. Listener único para abrir modal ao clicar no nickname (mantido)
  rankingTable.removeEventListener('click', handleNicknameClick); // Remove o antigo se existir
  rankingTable.addEventListener('click', handleNicknameClick);
}

// Função de Callback para o Listener de clique no nickname
function handleNicknameClick(e) {
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
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 1 - Como Criar o Repositório...</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv1}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 2 - Passo a Passo: Publicando...</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv2}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 3 - Criar arquivo index.html...</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv3}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 4 - Estrutura HTML com UTF-8</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv4}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 5 - Pesquisa, Criação e Revisão...</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv5}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 6 - Checklist de Revisão...</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv6}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 7 - EscapeRoom</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv7}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 8 - Investigador de Código HTML</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv8}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Quiz 1 - HMTML</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.quiz1}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Quiz 2 - Quiz Charada</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.quiz2}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 9 - Criação do Email Profissional</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv9}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 10 - Criação do Avatar e Nickname (20 IFPRPoints)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv10}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 11 - CTF – Capture the Flag (Web) (20 IFPRPoints)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv11}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 12 - [CSS] Estilos Inline (10 IFPRPoints)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv12}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 13 - [CSS] Estilos Interno (10 IFPRPoints)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv13}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Atividade 14 - [CSS] Estilos Externo (10 IFPRPoints)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">${aluno.atv14}</td></tr>
        
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Resgate Doces</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">-${aluno.resg1}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Resgate Coletivo (1)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">-${aluno.resg2}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Resgate Madeleine</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">-${aluno.resg3}</td></tr>
        <tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">Resgate Balas Lua Cheia</td><td style="padding:6px 8px;border-bottom:1px solid #eee;">-${aluno.resg4}</td></tr>
        
        <tr><td style="padding:6px 8px;border-top:2px solid #ddd;font-weight:700;">Total de Pontos (Atividades + Quiz)</td><td style="padding:6px 8px;border-top:2px solid #ddd;font-weight:700;">${aluno.total_pontos_calculado}</td></tr>
        <tr><td style="padding:6px 8px;font-weight:700;">Total de Resgates (Subtraído)</td><td style="padding:6px 8px;font-weight:700;">-${aluno.total_resgate_calculado}</td></tr>
        <tr><td style="padding:6px 8px;border-top:2px solid #000;font-weight:800;">Total Final</td><td style="padding:6px 8px;border-top:2px solid #000;font-weight:800;">${aluno.total_calculado}</td></tr>
      </tbody>
    </table>
  `;

  openModal(detalheHTML, `Detalhes — ${aluno.nickname}`);
}
