
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
        return;
    }

    encontrados.forEach(usuario => {
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
