 
 // Função chamada automaticamente quando o script é carregado
document.addEventListener("DOMContentLoaded", carregarRanking);

 function carregarRanking() {
  // Caminho absoluto para o CSV baseado na origem do site
  const csvPath = `${location.origin}/assets/ranking_info1_2025.csv`;
  console.log(csvPath);

  // Requisição do arquivo CSV
  fetch(csvPath)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar o arquivo CSV');
      return response.text();
    })
    .then(data => {
      // Divide o conteúdo em linhas e remove espaços
      const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '');

      // Verifica se o corpo da tabela existe; se não, cria
      let tbody = document.querySelector('#rankingTable tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        document.querySelector('#rankingTable').appendChild(tbody);
      }

      tbody.innerHTML = ''; // Limpa conteúdo anterior

      // Processa cada linha do CSV
      for (const line of lines) {
        const [email, atv1, atv2, atv3, resg] = line.split(',').map(item => item.trim());

        // Cálculo do total: soma das atividades menos o resgate
        const total = (parseInt(atv1) || 0) + (parseInt(atv2) || 0) + (parseInt(atv3) || 0) - (parseInt(resg) || 0);

        // Cria nova linha da tabela com os dados
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${email}</td>
          <td>${atv1}</td>
          <td>${atv2}</td>
          <td>${atv3}</td>
          <td>${resg}</td>
          <td class="highlight">${total}</td>
        `;
        tbody.appendChild(row);
      }
    })
    .catch(error => {
      console.error('Erro ao processar o CSV:', error);
      document.querySelector('#rankingTable').insertAdjacentHTML(
        'afterend',
        `<p style="color: red;">❌ Erro ao carregar os dados do ranking. Verifique o caminho do arquivo CSV.</p>`
      );
    });
}