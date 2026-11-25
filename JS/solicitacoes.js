
/* =========================================
   PORTAL DA COMUNIDADE ESCOLAR
   JAVASCRIPT - SOLICITAÇÕES DE AMIZADE
========================================= */

const listaSolicitacoes = document.getElementById("listaSolicitacoes");
const contadorSolicitacoes = document.getElementById("contadorSolicitacoes");

// USUÁRIO LOGADO
function obterUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || null;
}

const usuarioLogado = obterUsuarioLogado();

// CARREGAR SOLICITAÇÕES
function carregarSolicitacoes() {
    return JSON.parse(
        localStorage.getItem("solicitacoesAmizade")
    ) || [];
}

// SALVAR SOLICITAÇÕES
function salvarSolicitacoes(solicitacoes) {
    localStorage.setItem(
        "solicitacoesAmizade",
        JSON.stringify(solicitacoes)
    );
}

// CARREGAR AMIGOS
function carregarAmigos() {
    return JSON.parse(localStorage.getItem("amigos")) || [];
}

// SALVAR AMIGOS
function salvarAmigos(amigos) {
    localStorage.setItem("amigos", JSON.stringify(amigos));
}

// ATUALIZAR PERFIL
function atualizarPerfil() {
    const avatar = document.getElementById("avatarUsuario");
    const nome = document.getElementById("nomeUsuario");
    const status = document.getElementById("statusUsuario");

    if (usuarioLogado) {
        const nomeUsuario =
            usuarioLogado.nome ||
            usuarioLogado.usuario ||
            "Usuário";

        avatar.textContent = nomeUsuario.charAt(0).toUpperCase();
        nome.textContent = nomeUsuario;
        status.textContent = "Conectado";
    }
}

// MOSTRAR SOLICITAÇÕES
function mostrarSolicitacoes() {

    const todasSolicitacoes = carregarSolicitacoes();

    const usuarioAtual = usuarioLogado?.usuario?.toLowerCase();

    if (!usuarioAtual) {
        contadorSolicitacoes.textContent = "0";

        listaSolicitacoes.innerHTML = `
            <div class="mensagem">
                <strong>Faça login para continuar!</strong>
                Entre na sua conta para receber e gerenciar
                solicitações de amizade.
            </div>
        `;

        return;
    }

    // FILTRAR PEDIDOS RECEBIDOS PELO USUÁRIO LOGADO
    const recebidas = todasSolicitacoes.filter(solicitacao =>
        solicitacao.destinatario?.toLowerCase() === usuarioAtual &&
        solicitacao.status === "pendente"
    );

    contadorSolicitacoes.textContent = recebidas.length;

    listaSolicitacoes.innerHTML = "";

    if (recebidas.length === 0) {
        listaSolicitacoes.innerHTML = `
            <div class="mensagem">
                <strong>Nenhuma solicitação por enquanto!</strong>
                Quando alguém enviar um pedido de amizade,
                ele aparecerá aqui.
            </div>
        `;

        return;
    }

    recebidas.forEach(solicitacao => {

        const cartao = document.createElement("div");
        cartao.className = "solicitacao";

        const usuarioInfo = document.createElement("div");
        usuarioInfo.className = "usuario-info";

        const avatar = document.createElement("div");
        avatar.className = "avatar";

        avatar.textContent =
            (solicitacao.remetente || "?")
            .charAt(0)
            .toUpperCase();

        const detalhes = document.createElement("div");

        const nome = document.createElement("h3");
        nome.textContent =
            solicitacao.nomeRemetente ||
            solicitacao.remetente;

        const usuario = document.createElement("p");
        usuario.textContent =
            "@" + solicitacao.remetente + " deseja ser seu amigo.";

        detalhes.appendChild(nome);
        detalhes.appendChild(usuario);

        usuarioInfo.appendChild(avatar);
        usuarioInfo.appendChild(detalhes);

        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const aceitar = document.createElement("button");
        aceitar.className = "btn-aceitar";
        aceitar.textContent = "Aceitar";

        aceitar.addEventListener("click", () => {
            aceitarSolicitacao(solicitacao.id);
        });

        const recusar = document.createElement("button");
        recusar.className = "btn-recusar";
        recusar.textContent = "Recusar";

        recusar.addEventListener("click", () => {
            recusarSolicitacao(solicitacao.id);
        });

        acoes.appendChild(aceitar);
        acoes.appendChild(recusar);

        cartao.appendChild(usuarioInfo);
        cartao.appendChild(acoes);

        listaSolicitacoes.appendChild(cartao);
    });
}

// ACEITAR SOLICITAÇÃO
function aceitarSolicitacao(id) {

    const solicitacoes = carregarSolicitacoes();

    const solicitacao = solicitacoes.find(item =>
        item.id === id
    );

    if (!solicitacao) {
        alert("Solicitação não encontrada.");
        return;
    }

    const amigos = carregarAmigos();

    // EVITAR ADICIONAR O MESMO AMIGO DUAS VEZES
    const jaExiste = amigos.some(amigo =>
        amigo.usuario === solicitacao.remetente
    );

    if (!jaExiste) {
        amigos.push({
            nome: solicitacao.nomeRemetente || solicitacao.remetente,
            usuario: solicitacao.remetente
        });

        salvarAmigos(amigos);
    }

    // ATUALIZAR STATUS DO PEDIDO
    const atualizadas = solicitacoes.filter(item =>
        item.id !== id
    );

    salvarSolicitacoes(atualizadas);

    alert("Solicitação aceita! Agora vocês são amigos.");

    mostrarSolicitacoes();
}

// RECUSAR SOLICITAÇÃO
function recusarSolicitacao(id) {

    const confirmar = confirm(
        "Tem certeza que deseja recusar esta solicitação?"
    );

    if (!confirmar) {
        return;
    }

    const solicitacoes = carregarSolicitacoes();

    const atualizadas = solicitacoes.filter(item =>
        item.id !== id
    );

    salvarSolicitacoes(atualizadas);

    alert("Solicitação recusada.");

    mostrarSolicitacoes();
}

// INICIALIZAÇÃO
atualizarPerfil();
mostrarSolicitacoes();
