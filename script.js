
  // Inicializa EmailJS
  (function () {
      emailjs.init("WSd1r845dx2RUVYXu"); 
  })();

  // Configuração Firebase
  const firebaseConfig = {
      apiKey: "AIzaSyCxlZC1CSRwnPNGqDrdyUFsHVXiN8rgXv",
      authDomain: "listapresentes-d0bcd.firebaseapp.com",
      databaseURL: "https://listapresentes-d0bcd-default-rtdb.firebaseio.com/",
      projectId: "listapresentes-d0bcd",
      storageBucket: "listapresentes-d0bcd.appspot.com",
      messagingSenderId: "365621748326",
      appId: "1:365621748326:web:2637e88cc820e2669a83a7"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const dbRef = db.ref("presentes");

  let listaPresentes = [];

  function validarNomeCompleto(nome) {
      return nome.trim().split(" ").length >= 2;
  }

  function mostrarLista() {
      const ul = document.getElementById("itens");
      ul.innerHTML = "";
      if (!listaPresentes || listaPresentes.length === 0) {
          ul.innerHTML = "<p style='text-align:center;color:gray;'>Nenhum presente disponível</p>";
          return;
      }
      listaPresentes.forEach((item, i) => {
          const li = document.createElement("div");
          li.className = "presente-card";
          const botaoEscolher = item.escolhido
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

  function salvarNoFirebase() {
      dbRef.set(listaPresentes)
          .then(() => console.log("Lista atualizada no Firebase"))
          .catch(err => console.error(err));
  }

  function escolherPresente(index) {
      const nomePessoa = document.getElementById("nomePessoa").value.trim();
      const emailPessoa = document.getElementById("emailPessoa").value.trim();
      if (!nomePessoa || !validarNomeCompleto(nomePessoa)) { alert("Digite nome completo!"); return; }
      if (!emailPessoa) { alert("Digite e-mail!"); return; }

      const presente = listaPresentes[index];

      emailjs.send("service_8d53mgc", "template_m1chzjv", {
          pessoa_nome: nomePessoa,
          presente_nome: presente.nome,
          email_pessoa: emailPessoa
      }).then(() => {
          alert(`🎉 Você escolheu "${presente.nome}"!`);
          listaPresentes[index].escolhido = true;
          listaPresentes[index].pessoa = nomePessoa.toLowerCase();
          mostrarLista();
          salvarNoFirebase();
      }, (error) => {
          alert("Erro ao enviar e-mail: " + JSON.stringify(error));
      });
  }

  function desfazerEscolha() {
      const nomeAtual = document.getElementById("nomePessoa").value.trim().toLowerCase();
      if (!nomeAtual || !validarNomeCompleto(nomeAtual)) { alert("Digite seu nome completo!"); return; }

      const index = listaPresentes.findIndex(item => item.escolhido && item.pessoa === nomeAtual);
      if (index === -1) { alert("Nenhum presente encontrado."); return; }

      listaPresentes[index].escolhido = false;
      listaPresentes[index].pessoa = null;
      mostrarLista();
      salvarNoFirebase();
      alert(`Sua escolha do presente "${listaPresentes[index].nome}" foi desfeita!`);
  }

  // Inicializar exibição
  window.onload = () => {
      dbRef.once("value", snapshot => {
          if (snapshot.exists()) {
              // Firebase já tem dados
              listaPresentes = snapshot.val();
              mostrarLista();
          } else {
              // Firebase vazio: carregar do JSON do GitHub
            fetch("https://raw.githubusercontent.com/Geovana-Manu/lista-presentes/acc3f682e04412ad4c374bde27b85aefcd0b0e9c/presentes.json")
            .then(res => res.json())
            .then(data => {
            listaPresentes = data.map(p => ({ ...p, escolhido: false, pessoa: null }));
            mostrarLista();
            salvarNoFirebase(); // salva no Firebase
    })
    .catch(err => console.error("Erro ao carregar JSON:", err));

          }
      });
  };

