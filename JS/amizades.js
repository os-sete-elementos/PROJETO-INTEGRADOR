
const CHAVE_USUARIOS = "usuarios";
const CHAVE_PEDIDOS = "pedidosAmizade";
const CHAVE_AMIGOS = "amizades";

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

function usuarioAtual() {
    try {
        return JSON.parse(localStorage.getItem("usuarioLogado"));
    } catch {
        return null;
    }
}

function idUsuario(usuario) {
    if (!usuario) return "";

    return String(usuario.usuario || usuario.username || usuario.email || "")
        .trim()
        .replace(/^@/, "")
        .toLowerCase();
}

function nomeUsuario(usuario) {
    return usuario.nome || usuario.name || usuario.usuario ||
        usuario.username || "Usuário";
}

function carregarPerfil() {
    const usuario = usuarioAtual();

    if (!usuario) {
        alert("Faça login para acessar esta página.");
        window.location.href = "login.html";
        return false;
    }

    const nome = nomeUsuario(usuario);

    const nomeElemento = document.getElementById("nomeUsuario");
    const avatarElemento = document.getElementById("avatarUsuario");

    if (nomeElemento) nomeElemento.textContent = nome;

    if (avatarElemento) {
        avatarElemento.textContent = nome.charAt(0).toUpperCase();
    }

    return true;
}

function saoAmigos(a, b) {
    return ler(CHAVE_AMIGOS).some(item =>
        (item.a === a && item.b === b) ||
        (item.a === b && item.b === a)
    );
}

function pedidoExiste(de, para) {
    return ler(CHAVE_PEDIDOS).some(pedido =>
        pedido.status === "pendente" &&
        pedido.de === de &&
        pedido.para === para
    );
}

// ===============================
// ADICIONAR AMIGO
// ===============================

function pesquisarUsuarios() {
    const campo = document.getElementById("campoUsuario");
    const resultado = document.getElementById("resultadoPesquisa");

    if (!campo || !resultado) return;

    const busca = campo.value.trim().replace(/^@/, "").toLowerCase();

    if (!busca) {
        resultado.innerHTML = '<p class="mensagem">Digite um nome de usuário para pesquisar.</p>';
        return;
    }

    const atual = usuarioAtual();
    const meuId = idUsuario(atual);
    const usuarios = ler(CHAVE_USUARIOS);

    const encontrados = usuarios.filter(usuario => {
        const id = idUsuario(usuario);
        return id.includes(busca) && id !== meuId;
    });

    resultado.innerHTML = "";

    if (encontrados.length === 0) {
        resultado.innerHTML = '<p class="mensagem">Nenhum usuário encontrado.</p>';
        return;
    }

    encontrados.forEach(usuario => {
        const id = idUsuario(usuario);

        const card = document.createElement("div");
        card.className = "usuario-card";

        const info = document.createElement("div");
        info.className = "usuario-info";

        const avatar = document.createElement("div");
        avatar.className = "usuario-avatar";
        avatar.textContent = nomeUsuario(usuario).charAt(0).toUpperCase();

        const textos = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent = nomeUsuario(usuario);

        const usuarioTexto = document.createElement("small");
        usuarioTexto.textContent = "@" + id;

        textos.append(nome, usuarioTexto);
        info.append(avatar, textos);

        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const botao = document.createElement("button");

        if (saoAmigos(meuId, id)) {
            botao.textContent = "Já são amigos";
            botao.disabled = true;
            botao.className = "botao-recusar";
        } else if (pedidoExiste(meuId, id)) {
            botao.textContent = "Pedido enviado";
            botao.disabled = true;
            botao.className = "botao-recusar";
        } else if (pedidoExiste(id, meuId)) {
            botao.textContent = "Pedido recebido";
            botao.disabled = true;
            botao.className = "botao-recusar";
        } else {
            botao.textContent = "Adicionar";
            botao.className = "botao-aceitar";
            botao.addEventListener("click", () => enviarPedido(id, botao));
        }

        acoes.appendChild(botao);
        card.append(info, acoes);
        resultado.appendChild(card);
    });
}

function enviarPedido(destinatario, botao) {
    const atual = usuarioAtual();
    const remetente = idUsuario(atual);

    if (!remetente || !destinatario || remetente === destinatario) return;

    if (saoAmigos(remetente, destinatario) ||
        pedidoExiste(remetente, destinatario) ||
        pedidoExiste(destinatario, remetente)) {
        alert("Já existe uma amizade ou solicitação entre vocês.");
        pesquisarUsuarios();
        return;
    }

    const pedidos = ler(CHAVE_PEDIDOS);

    pedidos.push({
        de: remetente,
        para: destinatario,
        status: "pendente"
    });

    salvar(CHAVE_PEDIDOS, pedidos);

    botao.textContent = "Pedido enviado";
    botao.disabled = true;
    botao.className = "botao-recusar";

    alert("Solicitação de amizade enviada!");
}

// ===============================
// SOLICITAÇÕES RECEBIDAS
// ===============================

function carregarSolicitacoes() {
    const lista = document.getElementById("listaSolicitacoes");

    if (!lista) return;

    const atual = usuarioAtual();
    const meuId = idUsuario(atual);

    const pedidos = ler(CHAVE_PEDIDOS);
    const usuarios = ler(CHAVE_USUARIOS);

    const recebidos = pedidos.filter(pedido =>
        pedido.para === meuId &&
        pedido.status === "pendente"
    );

    lista.innerHTML = "";

    if (recebidos.length === 0) {
        lista.innerHTML = '<p class="mensagem">Você não tem solicitações de amizade.</p>';
        return;
    }

    recebidos.forEach(pedido => {
        const remetente = usuarios.find(usuario =>
            idUsuario(usuario) === pedido.de
        );

        const nome = remetente ? nomeUsuario(remetente) : pedido.de;

        const card = document.createElement("div");
        card.className = "solicitacao-card";

        const info = document.createElement("div");
        info.className = "usuario-info";

        const avatar = document.createElement("div");
        avatar.className = "usuario-avatar";
        avatar.textContent = nome.charAt(0).toUpperCase();

        const textos = document.createElement("div");

        const nomeElemento = document.createElement("strong");
        nomeElemento.textContent = nome;

        const usuarioTexto = document.createElement("small");
        usuarioTexto.textContent = "@" + pedido.de;

        textos.append(nomeElemento, usuarioTexto);
        info.append(avatar, textos);

        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const aceitar = document.createElement("button");
        aceitar.textContent = "Aceitar";
        aceitar.className = "botao-aceitar";
        aceitar.addEventListener("click", () => aceitarPedido(pedido));

        const recusar = document.createElement("button");
        recusar.textContent = "Recusar";
        recusar.className = "botao-recusar";
        recusar.addEventListener("click", () => recusarPedido(pedido));

        acoes.append(aceitar, recusar);
        card.append(info, acoes);
        lista.appendChild(card);
    });
}

function aceitarPedido(pedido) {
    const pedidos = ler(CHAVE_PEDIDOS);

    const encontrado = pedidos.find(item =>
        item.de === pedido.de &&
        item.para === pedido.para &&
        item.status === "pendente"
    );

    if (!encontrado) return;

    encontrado.status = "aceito";
    salvar(CHAVE_PEDIDOS, pedidos);

    const amigos = ler(CHAVE_AMIGOS);

    const jaExiste = amigos.some(item =>
        (item.a === pedido.de && item.b === pedido.para) ||
        (item.a === pedido.para && item.b === pedido.de)
    );

    if (!jaExiste) {
        amigos.push({
            a: pedido.de,
            b: pedido.para
        });
    }

    salvar(CHAVE_AMIGOS, amigos);

    alert("Solicitação aceita!");
    carregarSolicitacoes();
}

function recusarPedido(pedido) {
    const pedidos = ler(CHAVE_PEDIDOS);

    const atualizados = pedidos.filter(item =>
        !(item.de === pedido.de &&
          item.para === pedido.para &&
          item.status === "pendente")
    );

    salvar(CHAVE_PEDIDOS, atualizados);

    alert("Solicitação recusada.");
    carregarSolicitacoes();
}

// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    if (!carregarPerfil()) return;

    const botaoPesquisar = document.getElementById("btnPesquisar");
    const campo = document.getElementById("campoUsuario");

    if (botaoPesquisar) {
        botaoPesquisar.addEventListener("click", pesquisarUsuarios);
    }

    if (campo) {
        campo.addEventListener("keydown", evento => {
            if (evento.key === "Enter") {
                pesquisarUsuarios();
            }
        });
    }

    carregarSolicitacoes();
});
