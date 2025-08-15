// Inicializa EmailJS
(function () {
    emailjs.init("WSd1r845dx2RUVYXu"); // Sua Public Key
})();

// Lista inicial de presentes com imagem
let listaInicial = [
    { nome: "Chocolate", sugestao: "https://www.loja1.com/chocolate", imagem: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Chocolate.jpg", escolhido: false, pessoa: null },
    { nome: "Caneca personalizada", sugestao: "https://www.loja3.com/caneca", imagem: "https://via.placeholder.com/80", escolhido: false, pessoa: null },
    { nome: "Vale-presente", sugestao: "https://www.loja4.com/vale-presente", imagem: "https://via.placeholder.com/80", escolhido: false, pessoa: null }
];

// Carregar lista do localStorage ou usar a inicial
let listaPresentes = JSON.parse(localStorage.getItem("presentes")) || [...listaInicial];

// Salvar lista no localStorage
function salvarLista() {
    localStorage.setItem("presentes", JSON.stringify(listaPresentes));
}

// Validar se o usuário digitou nome completo (nome + sobrenome)
function validarNomeCompleto(nome) {
    return nome.trim().split(" ").length >= 2;
}

// Mostrar lista de presentes
function mostrarLista() {
    let ul = document.getElementById("itens");
    ul.innerHTML = "";

    if (listaPresentes.length === 0) {
        ul.innerHTML = "<p style='text-align:center;color:gray;'>Nenhum presente disponível</p>";
        return;
    }

    listaPresentes.forEach((item, i) => {
        let li = document.createElement("div");
        li.className = "presente-card";

        let botaoEscolher = item.escolhido
            ? `<p style="color:red; font-size:14px;">🎁 Este presente já foi escolhido</p>`
            : `<button onclick="escolherPresente(${i})">Escolher</button>`;

        li.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px;">
            <strong>${item.nome}</strong><br>
            ${botaoEscolher}
            <a href="${item.sugestao}" target="_blank">Ver sugestão</a>
        `;

        ul.appendChild(li);
    });
}

// Escolher presente
function escolherPresente(index) {
    let nomePessoa = document.getElementById("nomePessoa").value.trim();
    let emailPessoa = document.getElementById("emailPessoa").value.trim();

    if (!nomePessoa) { alert("Digite seu nome completo!"); return; }
    if (!validarNomeCompleto(nomePessoa)) { alert("Por favor, digite seu nome e sobrenome."); return; }
    if (!emailPessoa) { alert("Digite seu e-mail!"); return; }

    let presente = listaPresentes[index];

    emailjs.send("service_8d53mgc", "template_m1chzjv", {
        pessoa_nome: nomePessoa,
        presente_nome: presente.nome,
        email_pessoa: emailPessoa
    }).then(function () {
        alert(`🎉 Você escolheu "${presente.nome}"!`);
        listaPresentes[index].escolhido = true;
        listaPresentes[index].pessoa = nomePessoa.toLowerCase(); // salvar nome completo em minúsculas
        salvarLista();
        mostrarLista();
    }, function (error) {
        alert("Erro ao enviar e-mail: " + JSON.stringify(error));
    });
}

// Desfazer escolha
function desfazerEscolha() {
    let nomeAtual = document.getElementById("nomePessoa").value.trim().toLowerCase();
    if (!nomeAtual) { alert("Digite seu nome completo para desfazer a escolha."); return; }
    if (!validarNomeCompleto(nomeAtual)) { alert("Por favor, digite seu nome e sobrenome."); return; }

    let index = listaPresentes.findIndex(item => item.escolhido && item.pessoa === nomeAtual);

    if (index === -1) {
        alert("Você não possui nenhum presente escolhido ou digitou o nome completo incorretamente.");
        return;
    }

    listaPresentes[index].escolhido = false;
    listaPresentes[index].pessoa = null;
    salvarLista();
    mostrarLista();
    alert(`Sua escolha do presente "${listaPresentes[index].nome}" foi desfeita!`);
}

// Resetar lista (somente via código, sem botão para usuário)
function resetarLista() {
    listaPresentes = [...listaInicial];
    salvarLista();
    mostrarLista();
}

// Adicionar novo presente (somente via código)
function adicionarPresente(nome, link, imagem) {
    if (!imagem) imagem = "https://via.placeholder.com/80";
    listaPresentes.push({ nome: nome, sugestao: link, imagem: imagem, escolhido: false, pessoa: null });
    salvarLista();
    mostrarLista();
}

// Inicializar exibição
window.onload = () => {
    fetch('presentes.json')
        .then(res => res.json())
        .then(data => {
            // Carregar status salvos de escolhas anteriores
            const statusSalvo = JSON.parse(localStorage.getItem("presentes")) || [];

            // Mesclar: mantém status de escolhidos, mas traz todos os presentes do JSON
            listaPresentes = data.map(p => {
                const salvo = statusSalvo.find(s => s.nome === p.nome);
                return {
                    ...p,
                    escolhido: salvo ? salvo.escolhido : false,
                    pessoa: salvo ? salvo.pessoa : null
                };
            });

            salvarLista(); // atualiza localStorage com os presentes mesclados
            mostrarLista();
        })
        .catch(err => console.error("Erro ao carregar a lista de presentes:", err));
};


