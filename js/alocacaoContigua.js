//' API
// * Funções utilitarias
// filtro da funcao .sort() que ordena um array de objetos com base na propriedade tamanho
function maiorTamanho(a, b) {
  if (a.tamanho > b.tamanho) {
    return -1;
  }
  if (a.tamanho < b.tamanho) {
    return 1;
  }
  return 0;
}

// * Armazena a estrutura da memória física
class MemoriaContigua {
  constructor(quantidadeBloco) {
    // quantidade total de blocos presentes na memoria
    this.quantidadeBloco = quantidadeBloco;
    // o disco inicialmente é criado vazio, sem nenhum bloco integrado, e posteriormente populado com a funcao popularBlocos()
    // disco físico da memória
    this.disco = new Array();
    // armazena em memoria o nome (id) do ultimo arquivo gravado em disco
    this.idArquivo = 0;
    // armazena o tipo de alocação
    this.tipoAlocacao = "alocacaoContigua";
  }

  // * Checa o espaco disponivel na memoria
  checarEspaco() {
    // conta quantos blocos vazios existem
    let contador = 0;
    // itera por todos os blocos da memoria
    for (let i = 0; i < this.quantidadeBloco; i++) {
      // checa se o bloco está vazio e incrementa o contador
      if (this.disco[i] == undefined) {
        contador++;
      }
    }
    return contador;
  }

  // * Checa o primeiro espaco ininterrupto na memoria e retorna o maior deles
  primeiroEspacoDisponivel(tamanhoArquivo) {
    // armazena os dados referentes aos espacos vazios da memoria
    let espacos = [];

    // armazena os dados de um unico espaco vazio da memoria
    let espaco = {
      inicio: undefined,
      tamanho: 0,
    };

    // itera por todos os blocos da memoria
    for (let i = 0; i < this.quantidadeBloco; i++) {
      // checa se o espaço já é suficiente
      if (espaco.tamanho == tamanhoArquivo) {
        break;
      }
      if (this.disco[i] == undefined) {
        // armazena o indice do inicio do espaco
        if (espaco.inicio == undefined) {
          espaco.inicio = i;
        }
        // conta quantos blocos estao disponiveis
        espaco.tamanho++;
      } else {
        // armazena o espaco vazio e seus dados
        espacos.push(espaco);
        // reseta a variavel
        espaco = {
          inicio: undefined,
          tamanho: 0,
        };
      }
    }
    espacos.push(espaco);

    // filtra o array espacos com base no tamanho de cada espaco, resultado em ordem decrescente
    espacos.sort(maiorTamanho);

    return espacos[0];
  }

  // * Método responsavel pela alocação contígua
  criarArquivo(tamanhoArquivo) {
    // checa se o arquivo tem o tamanho mínimo necessário
    if (tamanhoArquivo <= 0) {
      throw "O arquivo precisa ter no mínimo 1 bloco de tamanho";
    }
    // checa se a memória é capaz de receber o arquivo
    if (
      this.primeiroEspacoDisponivel(tamanhoArquivo).tamanho < tamanhoArquivo
    ) {
      throw "Não é possível gravar o arquivo, espaço insuficiente";
    }

    // busca onde gravar o arquivo
    let espaco = this.primeiroEspacoDisponivel(tamanhoArquivo);

    // grava o arquivo no disco
    for (let i = 0; i < tamanhoArquivo; i++) {
      // grava o bloco
      this.disco[espaco.inicio] = this.idArquivo;

      // itera para o proximo bloco da memoria
      espaco.inicio++;
    }

    // incrementa o id do arquivo
    this.idArquivo++;

    return this;
  }

  // * Método responsável por deletar um arquivo da memoria
  deletarArquivo(idArquivo) {
    // checa se o arquivo existe na memoria
    let existe = false;
    for (let i = 0; i < this.quantidadeBloco; i++) {
      if (this.disco[i] == idArquivo) {
        existe = true;
        break;
      }
    }
    // emite erro caso o arquivo nao exista
    if (!existe) {
      throw "Esse arquivo não existe na memória";
    }

    // itera por todos os blocos da memoria
    for (let i = 0; i < this.quantidadeBloco; i++) {
      // bloco de alocacaoContigua
      // checa se o bloco está ocupado pelo arquivo desejado
      if (this.disco[i] == idArquivo) {
        // esvazia o bloco
        this.disco[i] = undefined;
      }
    }
    return this;
  }
}

var memoriaContigua;
