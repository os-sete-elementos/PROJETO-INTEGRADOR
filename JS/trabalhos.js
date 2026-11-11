
const CHAVE_TRABALHOS = "trabalhosEscolares";

// Recuperar os trabalhos salvos
function carregarDados() {
    try {
        return JSON.parse(
            localStorage.getItem(CHAVE_TRABALHOS)
        ) || [];
    } catch {
        return [];
    }
}

// Salvar trabalhos
function salvarDados(trabalhos) {
    localStorage.setItem(
        CHAVE_TRABALHOS,
        JSON.stringify(trabalhos)
    );
}

// Identificar o aluno conectado
function usuarioLogado() {
    try {
        return JSON.parse(
            localStorage.getItem("usuarioLogado")
        );
    } catch {
        return null;
    }
}

const usuario = usuarioLogado();

let filtroAtual = "todos";

// Perfil do aluno
function carregarPerfil() {
    const nome = document.getElementById("nomeUsuario");
    const avatar = document.getElementById("avatarUsuario");
    const status = document.getElementById("statusUsuario");

    if (usuario) {
        nome.textContent = usuario.nome || usuario.usuario;
        avatar.textContent =
            (usuario.nome || usuario.usuario || "?")
            .charAt(0).toUpperCase();

        status.textContent = "Conectado";
    } else {
        nome.textContent = "Visitante";
        avatar.textContent = "?";
        status.textContent = "Não conectado";
    }
}

// Data formatada
function formatarData(data) {
    if (!data) return "Sem data";

    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Criar trabalho
document.getElementById("formTrabalho")
.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!usuario) {
        alert("Faça login para criar um trabalho!");
        return;
    }

    const titulo = document.getElementById("titulo").value.trim();
    const materia = document.getElementById("materia").value;
    const data = document.getElementById("dataEntrega").value;
    const grupo = document.getElementById("grupo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();

    if (!titulo || !materia || !data) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    if (data < new Date().toLocaleDateString("en-CA")) {
        alert("Escolha uma data de entrega válida!");
        return;
    }

    const trabalhos = carregarDados();

    const novoTrabalho = {
        id: Date.now().toString(),
        autor: usuario.usuario,
        titulo,
        materia,
        data,
        grupo,
        descricao,
        concluido: false
    };

    trabalhos.push(novoTrabalho);

    salvarDados(trabalhos);

    this.reset();

    alert("Trabalho criado com sucesso! 💙");

    atualizarPagina();
});

// Mostrar trabalhos
function mostrarTrabalhos() {

    const lista = document.getElementById("listaTrabalhos");
    lista.replaceChildren();

    if (!usuario) {
        const aviso = document.createElement("p");
        aviso.className = "mensagem-vazia";
        aviso.textContent =
            "Entre na sua conta para visualizar seus trabalhos.";

        lista.appendChild(aviso);
        atualizarResumo([]);
        return;
    }

    const trabalhos = carregarDados().filter(t =>
        t.autor === usuario.usuario
    );

    atualizarResumo(trabalhos);

    let filtrados = trabalhos;

    if (filtroAtual === "andamento") {
        filtrados = trabalhos.filter(t => !t.concluido);
    }

    if (filtroAtual === "concluido") {
        filtrados = trabalhos.filter(t => t.concluido);
    }

    filtrados.sort((a, b) =>
        a.data.localeCompare(b.data)
    );

    if (filtrados.length === 0) {
        const aviso = document.createElement("p");
        aviso.className = "mensagem-vazia";

        aviso.textContent = trabalhos.length === 0
            ? "Você ainda não adicionou nenhum trabalho. 📚"
            : "Nenhum trabalho encontrado nesta categoria.";

        lista.appendChild(aviso);
        return;
    }

    filtrados.forEach(trabalho => {

        const card = document.createElement("article");
        card.className = "trabalho-card";

        const topo = document.createElement("div");
        topo.className = "trabalho-topo";

        const titulo = document.createElement("h3");
        titulo.textContent = trabalho.titulo;

        const status = document.createElement("span");
        status.className = "status-trabalho";

        if (trabalho.concluido) {
            status.textContent = "Concluído";
            status.classList.add("concluido");
        } else {
            status.textContent = "Em andamento";
        }

        topo.append(titulo, status);

        const materia = document.createElement("span");
        materia.className = "materia";
        materia.textContent = trabalho.materia;

        const descricao = document.createElement("p");
        descricao.className = "trabalho-descricao";
        descricao.textContent =
            trabalho.descricao || "Nenhuma descrição adicionada.";

        const detalhes = document.createElement("div");
        detalhes.className = "trabalho-detalhes";

        const data = document.createElement("span");
        data.textContent = "📅 Entrega: " + formatarData(trabalho.data);

        detalhes.appendChild(data);

        if (trabalho.grupo) {
            const grupo = document.createElement("span");
            grupo.textContent = "👥 " + trabalho.grupo;
            detalhes.appendChild(grupo);
        }

        const acoes = document.createElement("div");
        acoes.className = "trabalho-acoes";

        const concluir = document.createElement("button");
        concluir.className = "btn-concluir";

        concluir.textContent = trabalho.concluido
            ? "Reabrir trabalho"
            : "✓ Marcar como concluído";

        concluir.addEventListener("click", () => {
            alterarStatus(trabalho.id);
        });

        const excluir = document.createElement("button");
        excluir.className = "btn-excluir";
        excluir.textContent = "Excluir";

        excluir.addEventListener("click", () => {
            excluirTrabalho(trabalho.id);
        });

        acoes.append(concluir, excluir);

        card.append(topo, materia, descricao, detalhes, acoes);

        lista.appendChild(card);
    });
}

// Atualizar os números do resumo
function atualizarResumo(trabalhos) {

    document.getElementById("totalTrabalhos").textContent =
        trabalhos.length;

    document.getElementById("emAndamento").textContent =
        trabalhos.filter(t => !t.concluido).length;

    document.getElementById("concluidos").textContent =
        trabalhos.filter(t => t.concluido).length;
}

// Marcar ou reabrir trabalho
function alterarStatus(id) {

    const trabalhos = carregarDados();

    const trabalho = trabalhos.find(t =>
        t.id === id &&
        t.autor === usuario.usuario
    );

    if (!trabalho) return;

    trabalho.concluido = !trabalho.concluido;

    salvarDados(trabalhos);

    atualizarPagina();
}

// Excluir trabalho
function excluirTrabalho(id) {

    if (!confirm("Tem certeza que deseja excluir este trabalho?")) {
        return;
    }

    const trabalhos = carregarDados().filter(t =>
        !(t.id === id && t.autor === usuario.usuario)
    );

    salvarDados(trabalhos);

    atualizarPagina();
}

// Filtros
document.querySelectorAll(".filtro").forEach(botao => {

    botao.addEventListener("click", () => {

        document.querySelectorAll(".filtro").forEach(b =>
            b.classList.remove("ativo")
        );

        botao.classList.add("ativo");

        filtroAtual = botao.dataset.filtro;

        mostrarTrabalhos();
    });

});

// Atualizar página
function atualizarPagina() {
    mostrarTrabalhos();
}

window.addEventListener("storage", atualizarPagina);

carregarPerfil();
atualizarPagina();
