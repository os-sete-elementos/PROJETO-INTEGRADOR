
const formulario = document.getElementById("formLogin");

if (formulario) {

    formulario.addEventListener("submit", function(event) {

        event.preventDefault();

        // Pega os dados digitados
        const email = document.getElementById("email")
            .value.trim().toLowerCase();

        const senha = document.getElementById("senha").value;

        // Busca os usuários cadastrados
        let usuarios = [];

        try {
            usuarios = JSON.parse(
                localStorage.getItem("usuarios") || "[]"
            );
        } catch (erro) {
            alert("Erro ao acessar os usuários cadastrados!");
            return;
        }

        // Procura o usuário
        const usuarioEncontrado = usuarios.find(usuario =>
            usuario.email &&
            usuario.email.toLowerCase() === email &&
            usuario.senha === senha
        );

        // Verifica se encontrou
        if (!usuarioEncontrado) {
            alert("E-mail ou senha incorretos!");
            return;
        }

        // Salva os dados, incluindo a foto de perfil
        const usuarioLogado = {
            nome: usuarioEncontrado.nome,
            email: usuarioEncontrado.email,
            usuario: usuarioEncontrado.usuario || usuarioEncontrado.email,
            foto: usuarioEncontrado.foto || null
        };

        localStorage.setItem(
            "usuarioLogado",
            JSON.stringify(usuarioLogado)
        );

        alert("Login realizado com sucesso! 💙");

        // Vai para a página inicial
        window.location.href = "index2.html";

    });

}
