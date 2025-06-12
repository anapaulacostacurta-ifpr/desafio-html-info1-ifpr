 
 // Função chamada automaticamente quando o script é carregado
document.addEventListener("DOMContentLoaded", carregarRanking);

 function carregarRanking() {
  const csvPath = `${location.origin}/desafio-html-info1-ifpr/assets/ranking_info1_2025.csv`;

  fetch(csvPath)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar o arquivo CSV');
      return response.text();
    })
    .then(data => {
      const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '');
      let tbody = document.querySelector('#rankingTable tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        document.querySelector('#rankingTable').appendChild(tbody);
      }
      tbody.innerHTML = ''; // Limpa conteúdo anterior

      // Converte o CSV em um array de objetos com total calculado
      const ranking = lines.map(line => {
        const [email, atv1, atv2, atv3, atv4, resg, total] = line.split(',').map(val => val.trim());
        const total_calculado = (parseInt(atv1) || 0) + (parseInt(atv2) || 0) + (parseInt(atv3) || 0) + (parseInt(atv4) || 0)- (parseInt(resg) || 0);
        console.log(total)
        return { email, atv1, atv2, atv3, atv4, resg, total_calculado, total };
      });

      // Ordena do maior para o menor total
      ranking.sort((a, b) => b.total_calculado - a.total_calculado);

      // Monta cada linha da tabela
      ranking.forEach((aluno, index) => {
        const foguinho = index < 3 ? ' 🔥' : ''; // Top 3 com fogo
        const row = document.createElement('tr');

        
        // Se for o primeiro colocado, aplica estilo especial
        if (isPrimeiroLugar) {
          row.style.backgroundColor = '#fff8e1'; // fundo amarelo claro
          row.style.fontWeight = 'bold';
        }

        row.innerHTML = `
          <td>${aluno.email}</td>
          <td>${aluno.atv1}</td>
          <td>${aluno.atv2}</td>
          <td>${aluno.atv3}</td>
          <td>-${aluno.resg}</td>
          <td>${aluno.atv4}</td>
          <td class="highlight">${aluno.total_calculado}${foguinho}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro ao processar o CSV:', error);
      document.querySelector('#rankingTable').insertAdjacentHTML(
        'afterend',
        `<p style="color: red;">❌ Erro ao carregar os dados do ranking. Verifique o caminho do arquivo CSV.</p>`
      );
    });
}