function desbloquear(senha) {
    if (senha === "senha_revelar") {
        const conteudo = document.getElementById("conteudoOculto");
        conteudo.hidden = false;
        console.log("🎉 Conteúdo revelado com sucesso!");
    } else {
        console.log("❌ Senha incorreta. Tente novamente.");
    }
}