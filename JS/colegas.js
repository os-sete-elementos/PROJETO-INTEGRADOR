
const CHAVE_USUARIOS = "usuarios";
const CHAVE_PEDIDOS = "pedidosAmizade";
const CHAVE_AMIGOS = "amizades";

// Recupera o usuário que fez login
function usuarioAtual() {
    try {
        return JSON.parse(localStorage.getItem("usuarioLogado"));
    } catch {
        return null;
    }
}

function nomeUsuario(usuario) {
    return usuario?.usuario || usuario?.username || "";
}

function idUsuario(usuario) {
    return nomeUsuario(usuario).toLowerCase().replace(/^@/, "");
}

function ler(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || [];
    } catch {
        return [];
    }
}

function salvar(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function todosUsuarios() {
    return ler(CHAVE_USUARIOS);
}

let atual = usuarioAtual();

// Exibe o perfil
function carregarPerfil() {
    if (!atual) {
        document.getElementById("nomeUsuario").textContent = "Visitante";
        document.getElementById("statusUsuario").textContent =
            "Faça login para continuar";
        return;
    }

    document.getElementById("nomeUsuario").textContent =
        atual.nome || atual.usuario;

    document.getElementById("avatarUsuario").textContent =
        (atual.nome || atual.usuario || "?").charAt(0).toUpperCase();

    document.getElementById("statusUsuario").textContent = "Online";
}

// Identifica se dois alunos já são amigos
function saoAmigos(a, b) {
    return ler(CHAVE_AMIGOS).some(p =>
        (p.a === a && p.b === b) ||
        (p.a === b && p.b === a)
    );
}

// Alternar abas
document.querySelectorAll(".aba").forEach(botao => {
    botao.addEventListener("click", () => {
        document.querySelectorAll(".aba").forEach(b =>
            b.classList.remove("ativa")
        );

        document.querySelectorAll(".painel").forEach(p =>
            p.classList.add("escondido")
        );

        botao.classList.add("ativa");

        document.getElementById(
            botao.dataset.aba
        ).classList.remove("escondido");

        atualizarTudo();
    });
});

// Criar cartão de usuário
function criarCartao(usuario, botaoTexto, acao, classe = "") {
    const card = document.createElement("div");
    card.className = "usuario-card";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent =
        (usuario.nome || usuario.usuario || "?").charAt(0).toUpperCase();

    const info = document.createElement("div");
    info.className = "usuario-info";

    const nome = document.createElement("strong");
    nome.textContent = usuario.nome || usuario.usuario;

    const identificacao = document.createElement("span");
    identificacao.textContent = "@" + nomeUsuario(usuario);

    info.append(nome, identificacao);

    const botao = document.createElement("button");
    botao.className = "btn-acao " + classe;
    botao.textContent = botaoTexto;
    botao.addEventListener("click", acao);

    card.append(avatar, info, botao);

    return card;
}

// PESQUISAR ALUNO
document.getElementById("btnPesquisar").addEventListener("click", pesquisar);

document.getElementById("campoUsuario").addEventListener("keydown", e => {
    if (e.key === "Enter") pesquisar();
});

function pesquisar() {
    const campo = document.getElementById("campoUsuario");
    const resultado = document.getElementById("resultadoPesquisa");

    resultado.replaceChildren();

    if (!atual) {
        resultado.textContent = "Faça login para adicionar amigos.";
        return;
    }

    const busca = campo.value.trim().replace(/^@/, "").toLowerCase();

    if (!busca) {
        resultado.textContent = "Digite um nome de usuário.";
        return;
    }

    const encontrado = todosUsuarios().find(usuario =>
        idUsuario(usuario) === busca
    );

    if (!encontrado) {
        resultado.textContent = "Nenhum estudante encontrado.";
        return;
    }

    if (idUsuario(encontrado) === idUsuario(atual)) {
        resultado.textContent = "Você não pode adicionar a si mesmo!";
        return;
    }

    if (saoAmigos(idUsuario(atual), idUsuario(encontrado))) {
        resultado.textContent = "Vocês já são amigos!";
        return;
    }

    const pedidos = ler(CHAVE_PEDIDOS);

    const recebido = pedidos.find(p =>
        p.de === idUsuario(encontrado) &&
        p.para === idUsuario(atual) &&
        p.status === "pendente"
    );

    if (recebido) {
        resultado.appendChild(
            criarCartao(encontrado, "Aceitar pedido", () => {
                aceitarPedido(recebido);
            })
        );
        return;
    }

    const existente = pedidos.some(p =>
        p.de === idUsuario(atual) &&
        p.para === idUsuario(encontrado) &&
        p.status === "pendente"
    );

    if (existente) {
        resultado.textContent = "Você já enviou uma solicitação!";
        return;
    }

    resultado.appendChild(
        criarCartao(encontrado, "Adicionar", () => {
            enviarPedido(encontrado);
        })
    );
}

// ENVIAR SOLICITAÇÃO
function enviarPedido(usuario) {
    if (!atual) return;

    const pedidos = ler(CHAVE_PEDIDOS);

    pedidos.push({
        de: idUsuario(atual),
        para: idUsuario(usuario),
        status: "pendente"
    });

    salvar(CHAVE_PEDIDOS, pedidos);

    document.getElementById("resultadoPesquisa").textContent =
        "Solicitação enviada com sucesso! 💙";

    atualizarTudo();
}

// ACEITAR SOLICITAÇÃO
function aceitarPedido(pedido) {
    if (!atual) return;

    const pedidos = ler(CHAVE_PEDIDOS);

    const indice = pedidos.findIndex(p =>
        p.de === pedido.de &&
        p.para === pedido.para &&
        p.status === "pendente"
    );

    if (indice === -1) return;

    pedidos[indice].status = "aceito";
    salvar(CHAVE_PEDIDOS, pedidos);

    const amigos = ler(CHAVE_AMIGOS);

    if (!saoAmigos(pedido.de, pedido.para)) {
        amigos.push({
            a: pedido.de,
            b: pedido.para
        });
        salvar(CHAVE_AMIGOS, amigos);
    }

    atualizarTudo();
}

// RECUSAR SOLICITAÇÃO
function recusarPedido(pedido) {
    const pedidos = ler(CHAVE_PEDIDOS).filter(p =>
        !(p.de === pedido.de && p.para === pedido.para &&
          p.status === "pendente")
    );

    salvar(CHAVE_PEDIDOS, pedidos);
    atualizarTudo();
}

// MOSTRAR SOLICITAÇÕES
function carregarSolicitacoes() {
    const lista = document.getElementById("listaSolicitacoes");
    lista.replaceChildren();

    if (!atual) return;

    const pedidos = ler(CHAVE_PEDIDOS).filter(p =>
        p.para === idUsuario(atual) &&
        p.status === "pendente"
    );

    document.getElementById("contadorPedidos").textContent =
        pedidos.length;

    if (pedidos.length === 0) {
        lista.innerHTML =
            '<p class="mensagem">Você não tem solicitações no momento.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const usuario = todosUsuarios().find(u =>
            idUsuario(u) === pedido.de
        );

        if (!usuario) return;

        const card = document.createElement("div");
        card.className = "usuario-card solicitacao-card";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent =
            (usuario.nome || usuario.usuario).charAt(0).toUpperCase();

        const info = document.createElement("div");
        info.className = "usuario-info";

        const nome = document.createElement("strong");
        nome.textContent = usuario.nome || usuario.usuario;

        const username = document.createElement("span");
        username.textContent = "@" + nomeUsuario(usuario);

        info.append(nome, username);

        const aceitar = document.createElement("button");
        aceitar.className = "btn-acao";
        aceitar.textContent = "Aceitar";
        aceitar.onclick = () => aceitarPedido(pedido);

        const recusar = document.createElement("button");
        recusar.className = "btn-acao btn-remover";
        recusar.textContent = "Recusar";
        recusar.onclick = () => recusarPedido(pedido);

        card.append(avatar, info, aceitar, recusar);
        lista.appendChild(card);
    });
}

// MOSTRAR AMIGOS
function carregarAmigos() {
    const lista = document.getElementById("listaAmigos");
    lista.replaceChildren();

    if (!atual) {
        lista.innerHTML =
            '<p class="mensagem">Entre na sua conta para visualizar seus amigos.</p>';
        return;
    }

    const busca = document.getElementById("filtroAmigos")
        .value.toLowerCase();

    const amigos = ler(CHAVE_AMIGOS);
    const usuarios = todosUsuarios();

    const meusAmigos = amigos
        .filter(p =>
            p.a === idUsuario(atual) ||
            p.b === idUsuario(atual)
        )
        .map(p => p.a === idUsuario(atual) ? p.b : p.a);

    const encontrados = usuarios.filter(u =>
        meusAmigos.includes(idUsuario(u)) &&
        (
            (u.nome || "").toLowerCase().includes(busca) ||
            idUsuario(u).includes(busca)
        )
    );

    if (encontrados.length === 0) {
        lista.innerHTML =
            '<p class="mensagem">Você ainda não tem amigos. Que tal adicionar alguém? 💙</p>';
        return;
    }

    encontrados.forEach(usuario => {
        const card = document.createElement("div");
        card.className = "usuario-card";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent =
            (usuario.nome || usuario.usuario).charAt(0).toUpperCase();

        const info = document.createElement("div");
        info.className = "usuario-info";

        const nome = document.createElement("strong");
        nome.textContent = usuario.nome || usuario.usuario;

        const username = document.createElement("span");
        username.textContent = "@" + nomeUsuario(usuario);

        info.append(nome, username);

        const remover = document.createElement("button");
        remover.className = "btn-acao btn-remover";
        remover.textContent = "Remover";

        remover.onclick = () => {
            if (!confirm("Deseja remover este amigo?")) return;

            salvar(CHAVE_AMIGOS, ler(CHAVE_AMIGOS).filter(p =>
                !(
                    (p.a === idUsuario(atual) && p.b === idUsuario(usuario)) ||
                    (p.b === idUsuario(atual) && p.a === idUsuario(usuario))
                )
            ));

            atualizarTudo();
        };

        card.append(avatar, info, remover);
        lista.appendChild(card);
    });
}

// FILTRAR AMIGOS
document.getElementById("filtroAmigos")
    .addEventListener("input", carregarAmigos);

// ATUALIZAR A PÁGINA
function atualizarTudo() {
    carregarPerfil();
    carregarAmigos();
    carregarSolicitacoes();
}

window.addEventListener("storage", atualizarTudo);

atualizarTudo();
