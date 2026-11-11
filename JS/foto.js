
document.addEventListener("DOMContentLoaded", function () {

    // ELEMENTOS DA PÁGINA
    const foto = document.getElementById("fotoPerfil");
    const icone = document.getElementById("iconePerfil");
    const fotoCabecalho = document.getElementById("fotoCabecalho");
    const iconeCabecalho = document.getElementById("iconeCabecalho");

    const nome = document.getElementById("nomePerfil");
    const email = document.getElementById("emailPerfil");
    const novoNome = document.getElementById("novoNome");
    const mensagem = document.getElementById("mensagemPerfil");

    const arquivoFoto = document.getElementById("arquivoFoto");
    const btnSalvarNome = document.getElementById("btnSalvarNome");
    const btnSair = document.getElementById("btnSair");

    // BUSCAR USUÁRIO LOGADO
    let usuarioLogado;

    try {
        usuarioLogado = JSON.parse(
            localStorage.getItem("usuarioLogado") || "null"
        );
    } catch (erro) {
        usuarioLogado = null;
    }

    if (!usuarioLogado) {
        alert("Você precisa entrar na sua conta!");
        window.location.href = "login.html";
        return;
    }

    // ATUALIZAR FOTO NA PÁGINA E NO CABEÇALHO
    function atualizarFoto() {

        if (usuarioLogado.foto) {

            if (foto) {
                foto.src = usuarioLogado.foto;
                foto.style.display = "block";
            }

            if (icone) {
                icone.style.display = "none";
            }

            if (fotoCabecalho) {
                fotoCabecalho.src = usuarioLogado.foto;
                fotoCabecalho.style.display = "block";
            }

            if (iconeCabecalho) {
                iconeCabecalho.style.display = "none";
            }

        } else {

            if (foto) {
                foto.style.display = "none";
            }

            if (icone) {
                icone.style.display = "inline";
                icone.textContent = "👤";
            }

            if (fotoCabecalho) {
                fotoCabecalho.style.display = "none";
            }

            if (iconeCabecalho) {
                iconeCabecalho.style.display = "inline";
                iconeCabecalho.textContent = "👤";
            }
        }
    }

    // SALVAR DADOS NO LOCALSTORAGE
    function salvarDados() {

        try {
            let usuarios = JSON.parse(
                localStorage.getItem("usuarios") || "[]"
            );

            if (!Array.isArray(usuarios)) {
                usuarios = [];
            }

            const indice = usuarios.findIndex(usuario =>
                usuario.email === usuarioLogado.email
            );

            if (indice === -1) {
                mensagem.textContent = "Cadastro não encontrado!";
                return false;
            }

            // Atualiza nome e foto sem apagar a senha
            usuarios[indice].nome = usuarioLogado.nome;
            usuarios[indice].foto = usuarioLogado.foto || null;

            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuarioLogado)
            );

            return true;

        } catch (erro) {
            mensagem.textContent = "Erro ao salvar! Tente novamente.";
            return false;
        }
    }

    // MOSTRAR INFORMAÇÕES DO USUÁRIO
    if (nome) {
        nome.textContent = usuarioLogado.nome || "Nome não informado";
    }

    if (email) {
        email.textContent = usuarioLogado.email || "E-mail não informado";
    }

    atualizarFoto();

    // ALTERAR FOTO DE PERFIL
    if (arquivoFoto) {

        arquivoFoto.addEventListener("change", function () {

            const arquivo = this.files[0];

            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                mensagem.textContent = "Escolha uma imagem válida!";
                this.value = "";
                return;
            }

            if (arquivo.size > 1024 * 1024) {
                mensagem.textContent = "A foto deve ter no máximo 1 MB!";
                this.value = "";
                return;
            }

            const leitor = new FileReader();

            leitor.onload = function (event) {

                const fotoAnterior = usuarioLogado.foto;

                usuarioLogado.foto = event.target.result;

                if (salvarDados()) {
                    atualizarFoto();
                    mensagem.textContent = "Foto alterada com sucesso! 💙";
                } else {
                    usuarioLogado.foto = fotoAnterior;
                }
            };

            leitor.onerror = function () {
                mensagem.textContent = "Não foi possível carregar a foto.";
            };

            leitor.readAsDataURL(arquivo);
        });
    }

    // ALTERAR NOME
    if (btnSalvarNome) {

        btnSalvarNome.addEventListener("click", function () {

            const nomeDigitado = novoNome.value.trim();

            if (!nomeDigitado) {
                mensagem.textContent = "Digite seu novo nome!";
                return;
            }

            if (nomeDigitado.length < 2) {
                mensagem.textContent = "Digite um nome válido!";
                return;
            }

            if (nomeDigitado === usuarioLogado.nome) {
                mensagem.textContent = "Esse já é seu nome atual!";
                return;
            }

            const nomeAnterior = usuarioLogado.nome;

            usuarioLogado.nome = nomeDigitado;

            if (salvarDados()) {

                nome.textContent = nomeDigitado;
                novoNome.value = "";

                mensagem.textContent = "Nome alterado com sucesso! 💙";

            } else {

                usuarioLogado.nome = nomeAnterior;
            }
        });
    }

    // SAIR DA CONTA
    if (btnSair) {

        btnSair.addEventListener("click", function () {

            if (confirm("Tem certeza que deseja sair da sua conta?")) {

                localStorage.removeItem("usuarioLogado");

                window.location.href = "index.html";
            }
        });
    }

});

