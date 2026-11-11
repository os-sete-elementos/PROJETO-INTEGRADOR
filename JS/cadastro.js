
const formulario = document.getElementById("formCadastro");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmar");

const campoFoto = document.getElementById("fotoCadastro");
const previewFoto = document.getElementById("previewFoto");
const iconeFoto = document.getElementById("iconeFoto");

let fotoAtual = null;

// PRÉ-VISUALIZAÇÃO DA FOTO
if (campoFoto) {
    campoFoto.addEventListener("change", function () {

        const arquivo = this.files[0];

        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            alert("Escolha uma imagem válida!");
            this.value = "";
            return;
        }

        if (arquivo.size > 1024 * 1024) {
            alert("A foto deve ter no máximo 1 MB!");
            this.value = "";
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (event) {
            fotoAtual = event.target.result;

            if (previewFoto) {
                previewFoto.src = fotoAtual;
                previewFoto.hidden = false;
            }

            if (iconeFoto) {
                iconeFoto.style.display = "none";
            }
        };

        leitor.onerror = function () {
            alert("Não foi possível carregar essa imagem.");
            campoFoto.value = "";
        };

        leitor.readAsDataURL(arquivo);
    });
}

// REALIZAR CADASTRO
if (formulario) {
    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim().toLowerCase();
        const senha = campoSenha.value;
        const confirmar = campoConfirmar.value;

        if (!nome || !email || !senha || !confirmar) {
            alert("Preencha todos os campos!");
            return;
        }

        if (senha !== confirmar) {
            alert("As senhas não coincidem!");
            campoConfirmar.focus();
            return;
        }

        let usuarios = [];

        try {
            usuarios = JSON.parse(
                localStorage.getItem("usuarios") || "[]"
            );

            if (!Array.isArray(usuarios)) {
                usuarios = [];
            }
        } catch (erro) {
            alert("Não foi possível acessar os cadastros salvos.");
            return;
        }

        const emailExiste = usuarios.some(usuario =>
            usuario.email &&
            usuario.email.toLowerCase() === email
        );

        if (emailExiste) {
            alert("Este e-mail já está cadastrado!");
            campoEmail.focus();
            return;
        }

        // Cria o usuário com a foto escolhida
        const novoUsuario = {
            nome: nome,
            email: email,
            usuario: email,
            senha: senha,
            foto: fotoAtual
        };

        usuarios.push(novoUsuario);

        try {
            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );
        } catch (erro) {
            alert("Não foi possível salvar o cadastro. Tente uma imagem menor.");
            return;
        }

        alert("Cadastro realizado com sucesso! 💙");

        window.location.href = "login.html";
    });
}
