
<<<<<<< HEAD
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
=======
/* =========================================
   PORTAL DA COMUNIDADE ESCOLAR
   JAVASCRIPT - ADICIONAR AMIGO
========================================= */

// ELEMENTOS DA PÁGINA

const campoUsuario = document.getElementById("campoUsuario");
const btnPesquisar = document.getElementById("btnPesquisar");
const resultadoPesquisa = document.getElementById("resultadoPesquisa");

// BANCO DE USUÁRIOS DE EXEMPLO
// Depois podemos integrar com os usuários cadastrados no sistema.

const usuarios = [
    {
        id: 1,
        nome: "Ana Clara",
        usuario: "anaclara",
        turma: "3º Ano A"
    },
    {
        id: 2,
        nome: "Pedro Henrique",
        usuario: "pedrohenrique",
        turma: "2º Ano B"
    },
    {
        id: 3,
        nome: "Mariana Souza",
        usuario: "mariana",
        turma: "3º Ano A"
    },
    {
        id: 4,
        nome: "Lucas Oliveira",
        usuario: "lucasoliveira",
        turma: "1º Ano C"
    },
    {
        id: 5,
        nome: "Julia Santos",
        usuario: "juliasantos",
        turma: "2º Ano A"
    },
    {
        id: 6,
        nome: "Gabriel Costa",
        usuario: "gabrielcosta",
        turma: "3º Ano B"
    }
];

// RECUPERAR SOLICITAÇÕES SALVAS

let solicitacoes = JSON.parse(
    localStorage.getItem("solicitacoesAmizade")
) || [];

// RECUPERAR USUÁRIO LOGADO

function obterUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || null;
}

// IDENTIFICAR USUÁRIO ATUAL

const usuarioLogado = obterUsuarioLogado();

// ATUALIZAR PERFIL

function atualizarPerfil() {
    const avatar = document.getElementById("avatarUsuario");
    const nome = document.getElementById("nomeUsuario");
    const status = document.getElementById("statusUsuario");

    if (usuarioLogado) {
        const nomeUsuario = usuarioLogado.nome || usuarioLogado.usuario || "Usuário";

        if (avatar) {
            avatar.textContent = nomeUsuario.charAt(0).toUpperCase();
        }

        if (nome) {
            nome.textContent = nomeUsuario;
        }

        if (status) {
            status.textContent = "Conectado";
        }
    }
}

// SALVAR SOLICITAÇÕES

function salvarSolicitacoes() {
    localStorage.setItem(
        "solicitacoesAmizade",
        JSON.stringify(solicitacoes)
    );
}

// VERIFICAR SE JÁ EXISTE SOLICITAÇÃO

function solicitacaoEnviada(idUsuario) {
    return solicitacoes.some(solicitacao =>
        solicitacao.destinatarioId === idUsuario &&
        solicitacao.remetente === (usuarioLogado?.usuario || "visitante")
    );
}

// CRIAR RESULTADO

function criarResultado(usuario) {
    const resultado = document.createElement("div");
    resultado.className = "resultado";

    const info = document.createElement("div");
    info.className = "usuario-info";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = usuario.nome.charAt(0).toUpperCase();

    const detalhes = document.createElement("div");

    const nome = document.createElement("h3");
    nome.textContent = usuario.nome;

    const turma = document.createElement("p");
    turma.textContent = "@" + usuario.usuario + " • " + usuario.turma;

    detalhes.appendChild(nome);
    detalhes.appendChild(turma);

    info.appendChild(avatar);
    info.appendChild(detalhes);

    resultado.appendChild(info);

    const jaEnviado = solicitacaoEnviada(usuario.id);

    const botao = document.createElement("button");

    if (jaEnviado) {
        botao.className = "btn-enviado";
        botao.textContent = "Solicitação enviada";
        botao.disabled = true;
    } else {
        botao.className = "btn-adicionar";
        botao.textContent = "Adicionar amigo";

        botao.addEventListener("click", function () {
            enviarSolicitacao(usuario);
        });
    }

    resultado.appendChild(botao);

    return resultado;
}

// PESQUISAR USUÁRIOS

function pesquisarUsuarios() {
    const pesquisa = campoUsuario.value.trim().toLowerCase();

    resultadoPesquisa.innerHTML = "";

    if (pesquisa === "") {
        mostrarMensagem("Digite um nome de usuário para pesquisar.");
        campoUsuario.focus();
        return;
    }

    const encontrados = usuarios.filter(usuario => {
        const nome = usuario.nome.toLowerCase();
        const nomeUsuario = usuario.usuario.toLowerCase();

        const ehUsuarioAtual =
            usuarioLogado &&
            nomeUsuario === (usuarioLogado.usuario || "").toLowerCase();

        return (
            !ehUsuarioAtual &&
            (nome.includes(pesquisa) || nomeUsuario.includes(pesquisa))
        );
    });

    if (encontrados.length === 0) {
        mostrarMensagem("Nenhum colega encontrado. Verifique o nome digitado.");
>>>>>>> f65aaf43854a2dc02b51ae048d636d07beaaa2bb
        return;
    }

    encontrados.forEach(usuario => {
<<<<<<< HEAD
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
=======
        resultadoPesquisa.appendChild(criarResultado(usuario));
    });
}

// ENVIAR SOLICITAÇÃO

function enviarSolicitacao(usuario) {
    const remetente = usuarioLogado?.usuario || "visitante";

    if (solicitacaoEnviada(usuario.id)) {
        mostrarMensagem("Você já enviou uma solicitação para esse colega.");
        return;
    }

    const novaSolicitacao = {
        id: Date.now(),
        remetente: remetente,
        destinatarioId: usuario.id,
        destinatario: usuario.usuario,
        nomeDestinatario: usuario.nome,
        data: new Date().toISOString(),
        status: "pendente"
    };

    solicitacoes.push(novaSolicitacao);

    salvarSolicitacoes();

    pesquisarUsuarios();

    mostrarAviso("Solicitação enviada para " + usuario.nome + "!");
}

// MOSTRAR MENSAGEM

function mostrarMensagem(texto) {
    const mensagem = document.createElement("div");
    mensagem.className = "mensagem";
    mensagem.textContent = texto;

    resultadoPesquisa.appendChild(mensagem);
}

// AVISO TEMPORÁRIO

function mostrarAviso(texto) {
    const avisoAnterior = document.getElementById("avisoAmizade");

    if (avisoAnterior) {
        avisoAnterior.remove();
    }

    const aviso = document.createElement("div");
    aviso.id = "avisoAmizade";
    aviso.className = "mensagem";
    aviso.textContent = texto;

    resultadoPesquisa.prepend(aviso);
}

// EVENTOS

btnPesquisar.addEventListener("click", pesquisarUsuarios);

campoUsuario.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        pesquisarUsuarios();
    }
});

// INICIALIZAÇÃO

atualizarPerfil();
>>>>>>> f65aaf43854a2dc02b51ae048d636d07beaaa2bb
