// Função chamada automaticamente quando o script é carregado
document.addEventListener("DOMContentLoaded", carregarRanking);

 function carregarRanking() {
  const csvPath = `${location.origin}/desafio-html-info1-ifpr/assets/ranking_geral.csv`;

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
        const [email, nickname, atv1, atv2, atv3, resg, atv4, quiz1, quiz2, atv5, atv6, atv7, atv8, resg2, total] = line.split(',').map(val => val.trim());
        const total_calculado = (parseInt(atv1) || 0) + (parseInt(atv2) || 0) + (parseInt(atv3) || 0) + (parseInt(atv4) || 0) + (parseInt(atv5) || 0) +(parseInt(atv6) || 0)+(parseInt(atv7) || 0)+(parseInt(atv8) || 0)+(parseInt(quiz1) || 0) + (parseInt(quiz2) || 0)- (parseInt(resg) || 0)- (parseInt(resg2) || 0);
        console.log(total)
        return { email, nickname, atv1, atv2, atv3, atv4, atv5, atv6, atv7, atv8, resg, resg2, quiz1, quiz2,total_calculado, total};
      });

      // Ordena do maior para o menor total
      //ranking.sort((a, b) => b.total_calculado - a.total_calculado);
      var total_geral = 0;
      // Monta cada linha da tabela
      ranking.forEach((aluno, index) => {
        var foguinho = index < 3 ? ' 🔥' : ''; // Top 3 com fogo
        const isPrimeiroLugar = index === 0;
        const row = document.createElement('tr');

        // Se for o primeiro colocado, aplica estilo especial
        if (isPrimeiroLugar) {
          //foguinho = '🥇';
          row.style.backgroundColor = '#fff8e1'; // fundo amarelo claro
          row.style.fontWeight = 'bold';
        }

        row.innerHTML = `
          <td>${index+1}</td>
          <td><img src="./images/avatar/${aluno.nickname}.png" alt="Avatar"> <br> ${aluno.nickname}</td>
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
          <td>-${aluno.resg}</td>
          <td>-${aluno.resg2}</td>
          <td class="highlight">${aluno.total_calculado}${foguinho}</td>
        `;
        tbody.appendChild(row);
        total_geral = total_geral + aluno.total_calculado;
      });
      const row2 = document.createElement('tr')
      row2.innerHTML = `<td colspan="14">Total Geral</td><td>${total_geral}</td>`;
      tbody.appendChild(row2);
    })
    .catch(error => {
      console.error('Erro ao processar o CSV:', error);
      document.querySelector('#rankingTable').insertAdjacentHTML(
        'afterend',
        `<p style="color: red;">❌ Erro ao carregar os dados do ranking. Verifique o caminho do arquivo CSV.</p>`
      );
    });
}