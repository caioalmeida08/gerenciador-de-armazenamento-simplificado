$(() => {
  var memoria = memoriaContigua;
  // ações a tomar quando um botão de 'simulador', das seções 'sobre', for clicado
  $("#sobre_contigua").on("click", () => {
    $("#tipo_alocacao").val("memoriaContigua");
    $([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#tipo_alocacao").offset().top - 100,
      },
      1000
    );
  });
  $("#sobre_encadeada").on("click", () => {
    $("#tipo_alocacao").val("memoriaEncadeada");
    $([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#tipo_alocacao").offset().top - 100,
      },
      1000
    );
  });
  $("#sobre_indexada").on("click", () => {
    $("#tipo_alocacao").val("memoriaIndexada");
    $([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#tipo_alocacao").offset().top - 100,
      },
      1000
    );
  });

  $("#tipo_alocacao").on("change", () => {
    try {
      // busca a memoria desejada
      memoria =
        mudarMemoria($("#tipo_alocacao").val()) ||
        novaMemoria($("#tipo_alocacao").val(), 32);
      // tenta renderizar a resposta
      renderizar(memoria);
    } catch (error) {
      // checa se é um pedido de get com memória não iniciada
      if (error.error.includes("inicializada")) {
        // deleta o conteudo da ta bela
        let tbody = document.getElementById("tabela-body");
        tbody.innerHTML = "";

        // popula cada linha da tabela
        let linha = document.createElement("tr");
        let numeroLinha = document.createElement("th");
        numeroLinha.scope = "row";
        numeroLinha.innerHTML = "Vazio";
        let conteudoLinha = document.createElement("td");
        conteudoLinha.innerHTML = "Crie uma memória";
        let deletarLinha = document.createElement("td");

        linha.appendChild(numeroLinha);
        linha.appendChild(conteudoLinha);
        linha.appendChild(deletarLinha);
        tbody.appendChild(linha);
      }
      mostrarErro(error);
    }
  });
  // Função utilizada para comunicar a criação de uma nova memória
  $("#criar_memoria").on("click", () => {
    try {
      // coleta os dados do input
      let tamanhoMemoria = $("input[name='tamanho_memoria']").val();

      if (tamanhoMemoria < 1) {
        throw "Tamanho mínimo da memória não atingido (deve ser maior que 0)";
      }

      memoria = novaMemoria($("#tipo_alocacao").val(), tamanhoMemoria);
      // tenta renderizar a resposta
      renderizar(memoria);
    } catch (error) {
      mostrarErro(error);
    }
  });
  // Função utilizada para comunicar a criação de um novo arquivo
  $("#criar_arquivo").on("click", () => {
    // coleta os dados do input
    let tamanhoArquivo = $("input[name='tamanho_arquivo']").val();

    try {
      // envia os dados ao back-end e aguarda resposta
      memoria = mudarMemoria($("#tipo_alocacao").val());
      memoria.criarArquivo(tamanhoArquivo);
      // tenta renderizar a resposta
      renderizar(memoria);
    } catch (error) {
      mostrarErro(error);
    }
  });
});

// Função utilizada para comunicar a deleção de um arquivo
let deletar = (idArquivo) => {
  try {
    memoria = mudarMemoria($("#tipo_alocacao").val());
    memoria.deletarArquivo(idArquivo);
    // tenta renderizar a resposta
    renderizar(memoria);
  } catch (error) {
    mostrarErro(error);
  }
};

// tenta mudarMemoria os dados ao back-end
let mudarMemoria = (tipoMemoria) => {
  var memoria;
  switch (tipoMemoria) {
    case "memoriaContigua":
      memoria = memoriaContigua;
      break;

    case "memoriaEncadeada":
      memoria = memoriaEncadeada;
      break;

    case "memoriaIndexada":
      memoria = memoriaIndexada;
      break;
  }
  return memoria;
};

let novaMemoria = (tipoMemoria, tamanhoMemoria) => {
  switch (tipoMemoria) {
    case "memoriaContigua":
      memoriaContigua = new MemoriaContigua(tamanhoMemoria);
      memoria = memoriaContigua;
      break;

    case "memoriaEncadeada":
      memoriaEncadeada = new MemoriaEncadeada(tamanhoMemoria);
      memoria = memoriaEncadeada;
      break;

    case "memoriaIndexada":
      memoriaIndexada = new MemoriaIndexada(tamanhoMemoria);
      memoria = memoriaIndexada;
      break;
  }
  return memoria;
};

// renderiza a tabela
let cores = new Array();
let renderizar = (memoria) => {
  try {
    cores.push(corAleatoria());
    // deleta o conteudo da ta bela
    let tbody = document.getElementById("tabela-body");
    tbody.innerHTML = "";
    // percorre todo o disco
    for (let i = 0; i < memoria.quantidadeBloco; i++) {
      // popula cada linha da tabela
      let numeroLinha = document.createElement("th");
      numeroLinha.scope = "row";
      numeroLinha.innerHTML = i;
      let conteudoLinha = document.createElement("td");
      let deletarLinha = document.createElement("td");

      deletarLinha.innerHTML = "deletar";
      deletarLinha.classList = "deletar-button";

      switch (memoria.tipoAlocacao) {
        case "alocacaoContigua":
          conteudoLinha.innerHTML =
            memoria.disco[i] == undefined
              ? "<i><small>Vazio</small></i>"
              : memoria.disco[i];
          conteudoLinha.idArquivo = memoria.disco[i];
          conteudoLinha.style.borderRight =
            cores[memoria.disco[i]] + " 10px solid";
          deletarLinha.dataset.idArquivo = memoria.disco[i];
          break;

        case "alocacaoEncadeada":
          if (typeof memoria.disco[i] == "object") {
            if (memoria.disco[i].conteudo != undefined) {
              conteudoLinha.innerHTML =
                memoria.disco[i].conteudo +
                " | " +
                (memoria.disco[i].proximo || "null");
            } else {
              conteudoLinha.innerHTML = "<i><small>Vazio</small></i>";
            }
            conteudoLinha.idArquivo = memoria.disco[i].conteudo;
            conteudoLinha.style.borderRight =
              cores[memoria.disco[i].conteudo] + " 10px solid";
            deletarLinha.dataset.idArquivo = memoria.disco[i].conteudo;
          } else {
            conteudoLinha.innerHTML = "<i><small>Vazio</small></i>";
          }
          break;

        case "alocacaoIndexada":
          if (memoria.disco[i] != undefined) {
            if (typeof memoria.disco[i] == "object") {
              conteudoLinha.innerHTML = memoria.disco[i].join();
              let proximo;
              for (let j = 0; j < memoria.quantidadeBloco; j++) {
                if (memoria.disco[j] == memoria.disco[memoria.disco[i][0]]) {
                  proximo = j;
                }
              }
              conteudoLinha.idArquivo = memoria.disco[proximo];
              conteudoLinha.style.borderRight =
                cores[memoria.disco[proximo]] + " 10px solid";
              deletarLinha.dataset.idArquivo = memoria.disco[proximo];
            } else {
              conteudoLinha.innerHTML =
                memoria.disco[i] == undefined
                  ? "<i><small>Vazio</small></i>"
                  : memoria.disco[i];
              conteudoLinha.idArquivo = memoria.disco[i];
              conteudoLinha.style.borderRight =
                cores[memoria.disco[i]] + " 10px solid";
              deletarLinha.dataset.idArquivo = memoria.disco[i];
            }
            break;
          } else {
            conteudoLinha.innerHTML = "<i><small>Vazio</small></i>";
          }
      }

      let linha = document.createElement("tr");
      linha.appendChild(numeroLinha);
      linha.appendChild(conteudoLinha);
      linha.appendChild(deletarLinha);
      tbody.appendChild(linha);
    }
    // adiciona a funcionalidade do botao deletar
    $(".deletar-button").on("click", (e) => {
      deletar(e.currentTarget.dataset.idArquivo);
    });
    // apaga mensagens de erro antigas
    $("#caixaDeErro").hide();
  } catch (error) {
    mostrarErro(error);
  }
};

// mostra erros que ocorreram
let mostrarErro = (erro) => {
  $("#caixaDeErro").show();
  let caixaDeErro = document.getElementById("caixaDeErro");
  caixaDeErro.innerHTML = erro.error || erro.memoriaText || erro;
};

let corAleatoria = () => {
  let possibilidades = "0123456789ABCDEF";
  let hexadecimal = new Array();

  for (let i = 0; i < 6; i++) {
    hexadecimal.push(possibilidades[Math.round(Math.random() * 15)]);
  }

  hexadecimal.unshift("#");
  return hexadecimal.join("");
};
