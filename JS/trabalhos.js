
/* =====================================
   PORTAL DA COMUNIDADE ESCOLAR
   SISTEMA DE TRABALHOS
===================================== */

const CHAVE_TRABALHOS = "trabalhosEscolares";

let filtroAtual = "todos";


// =====================================
// ARMAZENAMENTO
// =====================================

function obterTrabalhos() {

    try {
        return JSON.parse(
            localStorage.getItem(CHAVE_TRABALHOS) || "[]"
        );
    } catch (erro) {
        return [];
    }

}


function salvarTrabalhos(trabalhos) {

    localStorage.setItem(
        CHAVE_TRABALHOS,
        JSON.stringify(trabalhos)
    );

    // Atualiza outras partes do portal
    window.dispatchEvent(
        new Event("trabalhosAtualizados")
    );

}


// =====================================
// CADASTRAR TRABALHO
// =====================================

const formulario = document.getElementById("formTrabalho");

if (formulario) {

    formulario.addEventListener("submit", function(event) {

        event.preventDefault();

        const titulo = document.getElementById("titulo").value.trim();
        const materia = document.getElementById("materia").value;
        const dataEntrega = document.getElementById("dataEntrega").value;
        const grupo = document.getElementById("grupo").value.trim();
        const descricao = document.getElementById("descricao").value.trim();

        if (!titulo || !materia || !dataEntrega) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const novoTrabalho = {
            id: Date.now().toString(),
            titulo,
            materia,
            dataEntrega,
            grupo,
            descricao,
            status: "andamento"
        };

        const trabalhos = obterTrabalhos();

        trabalhos.push(novoTrabalho);

        salvarTrabalhos(trabalhos);

        formulario.reset();

        atualizarPagina();

        alert("Trabalho cadastrado com sucesso!");

    });

}


// =====================================
// CONTADORES
// =====================================

function atualizarContadores() {

    const trabalhos = obterTrabalhos();

    const total = trabalhos.length;

    const concluidos = trabalhos.filter(
        trabalho => trabalho.status === "concluido"
    ).length;

    const andamento = total - concluidos;

    const totalElemento = document.getElementById("totalTrabalhos");
    const andamentoElemento = document.getElementById("emAndamento");
    const concluidosElemento = document.getElementById("concluidos");

    if (totalElemento) {
        totalElemento.textContent = total;
    }

    if (andamentoElemento) {
        andamentoElemento.textContent = andamento;
    }

    if (concluidosElemento) {
        concluidosElemento.textContent = concluidos;
    }

}


// =====================================
// FORMATAR DATA
// =====================================

function formatarData(data) {

    if (!data) return "Data não informada";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;

}


// =====================================
// EXIBIR TRABALHOS
// =====================================

function mostrarTrabalhos() {

    const lista = document.getElementById("listaTrabalhos");

    if (!lista) return;

    let trabalhos = obterTrabalhos();

    // FILTRO EM ANDAMENTO
    if (filtroAtual === "andamento") {

        trabalhos = trabalhos.filter(
            trabalho => trabalho.status === "andamento"
        );

    }

    // FILTRO CONCLUÍDOS
    if (filtroAtual === "concluido") {

        trabalhos = trabalhos.filter(
            trabalho => trabalho.status === "concluido"
        );

    }

    lista.innerHTML = "";

    if (trabalhos.length === 0) {

        const mensagem = document.createElement("p");

        mensagem.className = "mensagem-vazia";

        mensagem.textContent = "Nenhum trabalho encontrado.";

        lista.appendChild(mensagem);

        return;

    }

    // ORGANIZAR PELA DATA DE ENTREGA
    trabalhos.sort((a, b) =>
        (a.dataEntrega || "").localeCompare(b.dataEntrega || "")
    );


    trabalhos.forEach(trabalho => {

        const card = document.createElement("article");

        card.className = "trabalho-card";


        // TÍTULO E STATUS
        const topo = document.createElement("div");

        topo.className = "trabalho-topo";

        const titulo = document.createElement("h3");

        titulo.textContent = trabalho.titulo || "Sem título";

        const status = document.createElement("span");

        status.className =
            trabalho.status === "concluido"
                ? "status concluido"
                : "status andamento";

        status.textContent =
            trabalho.status === "concluido"
                ? "Concluído"
                : "Em andamento";

        topo.append(titulo, status);


        // MATÉRIA
        const materia = document.createElement("p");

        materia.textContent =
            "📚 Matéria: " + (trabalho.materia || "Não informada");


        // DATA DE ENTREGA
        const entrega = document.createElement("p");

        entrega.textContent =
            "📅 Entrega: " + formatarData(trabalho.dataEntrega);

        card.append(topo, materia, entrega);


        // GRUPO
        if (trabalho.grupo) {

            const grupo = document.createElement("p");

            grupo.textContent = "👥 Grupo: " + trabalho.grupo;

            card.appendChild(grupo);

        }


        // DESCRIÇÃO
        if (trabalho.descricao) {

            const descricao = document.createElement("p");

            descricao.textContent = trabalho.descricao;

            descricao.className = "descricao-trabalho";

            card.appendChild(descricao);

        }


        // BOTÕES
        const botoes = document.createElement("div");

        botoes.className = "acoes-trabalho";


        // ALTERAR STATUS
        const botaoStatus = document.createElement("button");

        botaoStatus.className = "btn-status";

        botaoStatus.textContent =
            trabalho.status === "concluido"
                ? "Reabrir trabalho"
                : "Marcar como concluído";

        botaoStatus.addEventListener("click", function() {

            alterarStatus(trabalho.id);

        });


        // EXCLUIR
        const botaoExcluir = document.createElement("button");

        botaoExcluir.className = "btn-excluir";

        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {

            excluirTrabalho(trabalho.id);

        });


        botoes.append(botaoStatus, botaoExcluir);

        card.appendChild(botoes);

        lista.appendChild(card);

    });

}


// =====================================
// ALTERAR STATUS
// =====================================

function alterarStatus(id) {

    const trabalhos = obterTrabalhos();

    const atualizados = trabalhos.map(trabalho => {

        if (trabalho.id === id) {

            trabalho.status =
                trabalho.status === "concluido"
                    ? "andamento"
                    : "concluido";

        }

        return trabalho;

    });

    salvarTrabalhos(atualizados);

    atualizarPagina();

}


// =====================================
// EXCLUIR TRABALHO
// =====================================

function excluirTrabalho(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este trabalho?"
    );

    if (!confirmar) return;

    const trabalhos = obterTrabalhos().filter(
        trabalho => trabalho.id !== id
    );

    salvarTrabalhos(trabalhos);

    atualizarPagina();

}


// =====================================
// FILTROS
// =====================================

document.querySelectorAll(".filtro").forEach(botao => {

    botao.addEventListener("click", function() {

        document.querySelectorAll(".filtro").forEach(item => {
            item.classList.remove("ativo");
        });

        this.classList.add("ativo");

        filtroAtual = this.dataset.filtro;

        mostrarTrabalhos();

    });

});


// =====================================
// ATUALIZAR PÁGINA
// =====================================

function atualizarPagina() {

    atualizarContadores();

    mostrarTrabalhos();

}


// =====================================
// SINCRONIZAÇÃO
// =====================================

// Atualiza quando os trabalhos mudarem em outra aba
window.addEventListener("storage", function(event) {

    if (event.key === CHAVE_TRABALHOS) {
        atualizarPagina();
    }

});


// =====================================
// INICIALIZAÇÃO
// =====================================

atualizarPagina();
