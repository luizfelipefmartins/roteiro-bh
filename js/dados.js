// Conteúdo do roteiro. Para mudar horários, textos ou fotos, edite só este arquivo.
// Repositório público: não colocar voucher, valores pagos, telefones nem endereço do hotel.
// Voo e hotel são preenchidos no app e ficam guardados só no celular.

const ROTEIRO = {
  titulo: "BH a dois",
  casal: "Luiz & Lucas",
  inicio: "2026-10-30",
  fim: "2026-11-03",
  subtitulo: "Aniversário de casamento entre pão de queijo, Niemeyer, barroco e arte contemporânea.",

  // Tela de lembrança (depois da viagem). "lembranca" lista [dia, lugar] das fotos do mosaico.
  viagem: {
    nome: "Roteiro Mineiro a Dois",
    onde: "BH, Ouro Preto, Mariana e Inhotim",
    cidades: 4,
    lembranca: [["d31", "igrejinha"], ["d31", "mercado"], ["d01", "sfop"], ["d01", "mariana"], ["d02", "kusama"], ["d02", "varejao"]],
  },

  // Na tela de início aparecem só os avisos de hoje e de amanhã (campos "hoje" e "amanha").
  // Antes da viagem, os que têm "antes": true. A tela Avisos mostra todos, com "texto".
  avisos: [
    {
      id: "aviso-ouro-preto",
      data: "2026-11-01",
      texto: "Ouro Preto: a van busca no hotel entre 07h e 08h. Falta confirmar o horário exato e qual mina.",
      amanha: "Ouro Preto: a van busca no hotel entre 07h e 08h. Falta confirmar o horário exato e qual mina.",
    },
    {
      id: "aviso-inhotim-volta",
      data: "2026-11-02",
      antes: true,
      texto: "Volta do Inhotim: a atendente disse 16h30 e o voucher diz 17h30 em feriados (02/11 é Finados). Até a Belvitur confirmar por escrito, vale 16h30.",
      amanha: "Inhotim: o transfer volta às 16h30 por causa do feriado. Combinem de estar no estacionamento às 16h15.",
      hoje: "Hoje: o transfer do Inhotim volta às 16h30. Combinem de estar no estacionamento às 16h15.",
    },
    {
      id: "aviso-volta",
      data: "2026-11-03",
      texto: "Volta: saída do hotel às 02h40 do dia 03, de transfer ou Uber agendado na véspera.",
      amanha: "Amanhã cedo: saída do hotel às 02h40 para o aeroporto. Vale deixar as malas prontas hoje à noite.",
    },
  ],

  // Tela de início antes da viagem: o que resolver e o que separar.
  antesDeIr: {
    itens: [
      { id: "antes-voo", texto: "Voo: origem, horário de saída e se há conexão.", voo: true },
      { id: "op-embarque", texto: "Ouro Preto: horário exato da busca no hotel (entre 07h e 08h)." },
      { id: "op-mina", texto: "Ouro Preto: qual mina será visitada." },
    ],
    link: { texto: "Site da agência de Ouro Preto", url: "https://turismoouropreto.com/passeio/city-tour-ouro-preto-e-mariana/" },
  },
  paraLevar: ["Documento de meia-entrada (os dois)", "Calçado antiderrapante", "Agasalho", "Capa de chuva leve", "Proteção para celular e documentos"],

  // Valores de partida do card do voo. A pessoa completa no app ("Editar dados do voo").
  // Sem número de voo: com a data, ele mostra quando a casa fica vazia.
  voo: {
    ida: {
      data: "2026-10-30",
      de: { cod: null, hora: null, cidade: "origem a confirmar" },
      para: { cod: "CNF", hora: "22h50", cidade: "Confins, BH" },
      conexao: "a confirmar",
      detalhes: [
        { icone: "conexao", texto: "Conexão", valor: "a confirmar", cor: "ouro" },
        { icone: "carro", texto: "Na chegada", valor: "malas e Uber", cor: "terracota" },
      ],
      acompanhar: "https://www.flightradar24.com/data/airports/cnf/arrivals",
    },
    volta: {
      data: "2026-11-03",
      de: { cod: "CNF", hora: "06h00", cidade: "Confins, BH" },
      para: { cod: null, hora: null, cidade: "destino a confirmar" },
      conexao: "a confirmar",
      detalhes: [
        { icone: "relogio", texto: "Sair do hotel", valor: "02h40", cor: "terracota" },
        { icone: "carro", texto: "Ir de", valor: "Uber agendado", cor: "mata" },
      ],
      acompanhar: "https://www.flightradar24.com/data/airports/cnf/departures",
    },
  },

  // Onde buscar a previsão do tempo de cada dia (Open-Meteo).
  locais: {
    bh: { nome: "BH", lat: -19.92, lon: -43.94 },
    ouroPreto: { nome: "Ouro Preto", lat: -20.385, lon: -43.503 },
    inhotim: { nome: "Inhotim", lat: -20.125, lon: -44.22 },
  },

  dias: [
    {
      id: "d30",
      data: "2026-10-30",
      semana: "Sex",
      titulo: "Chegada",
      cor: "azulejo",
      foto: "capa",
      local: "bh",
      voo: "ida",
      chuva: "Chuva não muda nada: do aeroporto, Uber direto para o hotel.",
      resumo: "Pouso em Confins à noite e direto para o hotel.",
      // Bloco "Ao chegar" da tela de início: hotel (guardado no celular) e jantar.
      chegada: {
        legenda: "pouso às 22h50",
        uber: "Chamar Uber de Confins ao hotel",
        jantar: {
          titulo: "Jantar no quarto: pastel",
          texto: "Sugestão: Rei do Pastel Savassi, aberto 24 h e no iFood. Peça ainda em Confins, enquanto pegam as malas, e confirme no app se a entrega está ativa a essa hora.",
          botao: "Rei do Pastel no iFood",
          url: "https://www.ifood.com.br/busca?q=rei%20do%20pastel%20savassi",
        },
      },
      blocos: [
        {
          tipo: "linha",
          titulo: "A noite",
          itens: [
            { hora: "22h50", texto: "Pouso previsto em Confins." },
            { hora: "depois", texto: "Retirar as malas e só então chamar o Uber direto para o hotel na Savassi.", uber: "hotel" },
          ],
        },
        {
          tipo: "nota",
          titulo: "Para lembrar",
          texto: "O café da manhã não está incluído no hotel. Amanhã o café é no Mercado Central.",
        },
      ],
    },

    {
      id: "d31",
      data: "2026-10-31",
      semana: "Sáb",
      titulo: "Belo Horizonte",
      cor: "terracota",
      foto: "igrejinha-pampulha",
      local: "bh",
      resumo: "Mercado, Pampulha de Niemeyer, mirante e Circuito Liberdade.",
      blocos: [
        {
          tipo: "cards",
          titulo: "O que não perder",
          itens: [
            {
              id: "mercado", nome: "Mercado Central", sub: "café da manhã", foto: "mercado-central", mapa: "Mercado Central Belo Horizonte",
              guia: {
                sub: "Centro · desde 1929",
                chips: [["relogio", "Sáb 8h–18h"], ["panela", "Cozinhas podem fechar às 17h"]],
                sobre: "O mercado mais famoso de BH: centenas de lojas de queijo, doces, cachaça, temperos, ervas e artesanato, com botecos no meio dos corredores.",
                ver: ["Empadas do Ponto da Empada.", "Fígado acebolado com jiló nos bares do mercado.", "Queijos da Canastra e do Serro, doce de leite e goiabada para levar."],
                dica: "Sábado enche. Coma primeiro e compre depois, para não andar carregando sacolas.",
              },
            },
            {
              id: "papa", nome: "Praça do Papa", sub: "e Rua do Amendoim", foto: "praca-do-papa", mapa: "Praça do Papa Belo Horizonte",
              guia: {
                sub: "Mangabeiras · e Rua do Amendoim",
                chips: [["sol", "Ao ar livre"], ["estrela", "Grátis"]],
                sobre: "Ganhou o nome depois da missa de João Paulo II, em 1980. Do alto da praça se vê o centro de BH com a Serra do Curral atrás.",
                ver: ["A Rua do Amendoim (Rua Professor Otávio Magalhães): uma ilusão de ótica faz o carro parecer subir a ladeira sozinho.", "O monumento ao papa e a vista da cidade."],
                dica: "Na Rua do Amendoim o efeito aparece com o carro em ponto morto. De Uber, vale pedir para o motorista mostrar.",
              },
            },
            {
              id: "mirante", nome: "Mirante do Mangabeiras", sub: "BH inteira lá embaixo", foto: "mirante-mangabeiras", mapa: "Mirante do Mangabeiras",
              guia: {
                sub: "Mangabeiras · uns 1.170 m de altitude",
                chips: [["relogio", "8h–21h"], ["estrela", "Grátis"]],
                sobre: "Mirante da prefeitura no alto do Mangabeiras, com a cidade inteira lá embaixo. Fica pertinho da Praça do Papa.",
                ver: ["A vista de 180° da cidade.", "A luneta do mirante."],
                dica: "A entrada de carros é restrita; o Uber deixa na portaria. Confira o horário no dia, porque pode mudar em manutenção.",
              },
            },
            {
              id: "baile", nome: "Casa do Baile", sub: "Niemeyer na lagoa", foto: "casa-do-baile", mapa: "Casa do Baile Pampulha",
              guia: {
                sub: "Pampulha · Niemeyer, 1943",
                chips: [["relogio", "Qua–dom, 10h–18h"], ["estrela", "Grátis"]],
                sobre: "Antigo salão de dança projetado por Niemeyer numa ilhota da lagoa, com a marquise curva acompanhando a margem. Hoje é centro de referência de urbanismo, arquitetura e design.",
                ver: ["A marquise ondulada sobre a água.", "Os jardins de Burle Marx.", "A exposição em cartaz."],
                dica: "Da Casa do Baile dá para ver a Igrejinha do outro lado da lagoa.",
              },
            },
            {
              id: "igrejinha", nome: "Igrejinha da Pampulha", sub: "azulejos de Portinari", foto: "igrejinha-pampulha", mapa: "Igreja São Francisco de Assis Pampulha",
              guia: {
                sub: "Igreja São Francisco de Assis · Pampulha",
                chips: [["relogio", "8h–12h e 13h–17h"], ["estrela", "Patrimônio da Humanidade"]],
                sobre: "Projetada por Oscar Niemeyer nos anos 1940, com curvas de concreto à beira da lagoa. Faz parte do Conjunto Moderno da Pampulha, Patrimônio Mundial da UNESCO desde 2016. Os jardins são de Burle Marx.",
                ver: ["O painel de azulejos azuis e brancos de Portinari na fachada de trás, com cenas da vida de São Francisco.", "O mural de Portinari atrás do altar, dentro da igreja.", "A igreja vista do outro lado da lagoa, com as curvas refletidas na água."],
                dica: "A visitação para das 12h às 13h. O ingresso é simbólico; confira o valor no local.",
              },
            },
            {
              id: "jk", nome: "Casa Kubitschek", sub: "primeira a sair se atrasar", foto: "casa-kubitschek", mapa: "Museu Casa Kubitschek",
              guia: {
                sub: "Pampulha · casa de fim de semana de JK",
                chips: [["relogio", "Qua–dom, 10h–18h (entrada até 17h30)"], ["estrela", "Grátis"]],
                sobre: "Casa de Juscelino Kubitschek projetada por Niemeyer, com jardins de Burle Marx. Mostra como se morava nos anos 1940 e tem exposições sobre a Pampulha.",
                ver: ["Os jardins de Burle Marx.", "Os móveis e o desenho modernista da casa.", "A exposição em cartaz."],
                dica: "É a primeira parada a cortar se o dia atrasar.",
              },
            },
            {
              id: "xapuri", nome: "Xapuri", sub: "almoço mineiro", foto: "xapuri", mapa: "Restaurante Xapuri Belo Horizonte",
              guia: {
                sub: "Pampulha · comida mineira no fogão a lenha",
                chips: [["relogio", "Sáb 11h–22h"], ["estrela", "Música ao vivo no almoço"]],
                sobre: "Restaurante de comida mineira feita no fogão a lenha, um dos mais conhecidos de BH. Tem loja de artesanato e um bufê com mais de 30 doces caseiros.",
                ver: ["Frango com quiabo.", "O bufê de doces caseiros."],
                dica: "A fila costuma ser longa no sábado: chegue cedo ou reserve.",
              },
            },
            {
              id: "liberdade", nome: "Praça da Liberdade", sub: "Circuito Liberdade", foto: "praca-da-liberdade", mapa: "Praça da Liberdade Belo Horizonte",
              guia: {
                sub: "Funcionários · Circuito Liberdade",
                chips: [["sol", "Ao ar livre"], ["estrela", "Museus grátis"]],
                sobre: "Planejada no fim do século XIX como centro do governo de Minas, tem jardins, coretos e fontes. Em volta, uns 15 museus e centros culturais formam o Circuito Liberdade.",
                ver: ["O Palácio da Liberdade (sáb 10h–18h, grátis).", "O Edifício Niemeyer, visto de fora.", "O MM Gerdau – Museu das Minas e do Metal."],
                dica: "Casa Fiat, CCBB e Palácio ficam a poucos passos um do outro.",
              },
            },
            {
              id: "fiat", nome: "Casa Fiat de Cultura", sub: "exposições gratuitas", foto: "casa-fiat", mapa: "Casa Fiat de Cultura",
              guia: {
                sub: "Praça da Liberdade, 10",
                chips: [["relogio", "Sáb 10h–18h"], ["estrela", "Grátis"]],
                sobre: "Centro cultural na Praça da Liberdade com exposições de arte e programação gratuita.",
                ver: ["A exposição em cartaz.", "A programação gratuita do dia."],
                dica: "Fecha às 18h no sábado: não deixe para o fim do dia.",
              },
            },
            {
              id: "ccbb", nome: "CCBB BH", sub: "Circuito Liberdade", foto: "ccbb-bh", mapa: "CCBB Belo Horizonte",
              guia: {
                sub: "Praça da Liberdade, 450",
                chips: [["relogio", "Sáb 10h–22h"], ["estrela", "Exposições grátis"]],
                sobre: "Centro Cultural Banco do Brasil num prédio histórico da Praça da Liberdade, com exposições, teatro e cinema.",
                ver: ["A exposição de longa duração, no 2º andar.", "A programação do dia (alguns shows são pagos)."],
                dica: "Fecha às 22h: bom para deixar por último.",
              },
            },
          ],
          fora: "Fora do roteiro: Mineirão e futebol; Museu de Arte da Pampulha (em reforma).",
        },
        {
          tipo: "cenarios",
          titulo: "Como está o tempo?",
          opcoes: [
            {
              id: "A",
              nome: "Sol",
              icone: "sol",
              descricao: "Tempo firme: roteiro completo.",
              itens: [
                { hora: "08h00", texto: "Mercado Central e café da manhã." },
                { hora: "09h30", texto: "Uber para Mangabeiras.", uber: "Praça do Papa Belo Horizonte" },
                { hora: "10h00", texto: "Praça do Papa, Rua do Amendoim e Mirante." },
                { hora: "11h00", texto: "Uber para a Pampulha.", uber: "Igreja São Francisco de Assis Pampulha" },
                { hora: "11h45", texto: "Igrejinha da Pampulha (a visitação para das 12h às 13h)." },
                { hora: "12h30", texto: "Casa do Baile." },
                { hora: "13h15", texto: "Museu Casa Kubitschek." },
                { hora: "14h00", texto: "Almoço no Xapuri." },
                { hora: "15h20", texto: "Uber para a Praça da Liberdade.", uber: "Praça da Liberdade Belo Horizonte" },
                { hora: "16h00", texto: "Casa Fiat, Praça da Liberdade e CCBB." },
                { hora: "17h45", texto: "Volta ao hotel." },
              ],
            },
            {
              id: "B",
              nome: "Chuva leve",
              icone: "nuvem",
              descricao: "Chuva passageira ou intermitente: decidir pelo radar.",
              itens: [
                { hora: "08h00", texto: "Mercado Central e café da manhã." },
                { hora: "09h30", texto: "Dar uma olhada no radar. Se abrir uma janela de uns 90 min, dá para fazer Mangabeiras. Se continuar chovendo, siga direto para a Pampulha." },
                { hora: "Pampulha", texto: "Prefira o que é coberto e use Uber entre as atrações." },
                { hora: "tarde", texto: "Depois do almoço, Casa Fiat e CCBB." },
                { hora: "até 17h", texto: "Mangabeiras entra se o radar estiver limpo." },
              ],
            },
            {
              id: "C",
              nome: "Tempestade",
              icone: "raio",
              descricao: "Chuva forte: dia de lugares cobertos.",
              itens: [
                { hora: "08h00", texto: "Mercado Central, sem pressa." },
                { hora: "10h00", texto: "Uber para o Circuito Liberdade.", uber: "Casa Fiat de Cultura" },
                { hora: "10h30", texto: "Casa Fiat de Cultura." },
                { hora: "12h00", texto: "CCBB." },
                { hora: "13h30", texto: "Almoço coberto na Centro-Sul ou Savassi." },
                { hora: "tarde", texto: "Outro museu aberto do Circuito Liberdade." },
              ],
              alerta: "Com tempestade, o Mirante, a Praça do Papa, a Rua do Amendoim e a orla da Pampulha ficam para outro momento. Se melhorar de verdade, dá para ir à Igrejinha e à Casa do Baile, de Uber.",
            },
          ],
        },
        {
          tipo: "regras",
          titulo: "Regras do dia",
          itens: [
            "07h00: dar uma olhada na previsão e no trânsito antes de sair.",
            "Conferir de novo ao sair do Mercado Central.",
            "Se o tempo fechar, troque para o plano Tempestade em \"Como está o tempo?\": os mirantes e a orla da lagoa ficam para outro momento.",
            "Atrasou? Sem correria. Se precisar cortar, a primeira a sair é a Casa Kubitschek; o Mercado, a Igrejinha, a Casa do Baile, o Xapuri e o Circuito Liberdade ficam.",
          ],
        },
      ],
    },

    {
      id: "d01",
      data: "2026-11-01",
      semana: "Dom",
      titulo: "Ouro Preto e Mariana",
      cor: "ouro",
      foto: "sao-francisco-op",
      local: "ouroPreto",
      chuva: "Se o tempo fechar, a agência ajusta a ordem das paradas. Capa de chuva e calçado antiderrapante para as ladeiras.",
      resumo: "Barroco, ladeiras de pedra e uma mina de ouro.",
      resumoInicio: "Igrejas barrocas, mina de ouro, Museu da Inconfidência e Mariana.",
      blocos: [
        {
          tipo: "nota",
          titulo: "Como vai ser",
          texto: "Passeio da Turismo Ouro Preto com guia e van: buscam no hotel em BH e trazem de volta. A ordem das paradas pode mudar com o tempo.",
        },
        {
          tipo: "linha",
          titulo: "Como vai ser o dia",
          legenda: "110 km de BH",
          itens: [
            { hora: "07h–08h", texto: "A van busca no hotel. Café rápido no caminho." },
            { hora: "manhã", texto: "Matriz do Pilar, com o Museu de Arte Sacra." },
            { hora: "manhã", texto: "Mina de ouro do século XVIII." },
            { hora: "manhã", texto: "Igreja de São Francisco de Assis, de Aleijadinho e Ataíde." },
            { hora: "almoço", texto: "Em Ouro Preto, não incluso no passeio." },
            { hora: "tarde", texto: "Museu da Inconfidência, na Praça Tiradentes." },
            { hora: "tarde", texto: "Loja de pedra-sabão." },
            { hora: "fim da tarde", texto: "Mariana: Praça Minas Gerais e Catedral da Sé." },
            { hora: "18h30–19h30", texto: "Volta ao hotel." },
          ],
        },
        {
          tipo: "cards",
          titulo: "No caminho",
          itens: [
            {
              id: "pilar", nome: "Igreja do Pilar", sub: "ouro por todo lado", foto: "pilar", mapa: "Igreja Matriz Nossa Senhora do Pilar Ouro Preto",
              guia: {
                sub: "Ouro Preto · Basílica de Nossa Senhora do Pilar",
                chips: [["relogio", "Dom 9h–10h45 e 12h–16h45"], ["estrela", "Ingresso com Museu de Arte Sacra"]],
                sobre: "Uma das igrejas mais ricas do barroco mineiro, com a talha coberta de ouro. O mesmo ingresso dá acesso ao Museu de Arte Sacra, no subsolo.",
                ver: ["A talha dourada da nave e do altar-mor.", "O Museu de Arte Sacra, no subsolo."],
                dica: "Pilar + Museu de Arte Sacra: R$ 30 (meia R$ 15), segundo a agência. A visitação tem pausa entre 10h45 e 12h.",
              },
            },
            {
              id: "mina", nome: "Mina de ouro", sub: "a agência confirma qual", foto: "mina-chico-rei", fotoNota: "Foto ilustrativa: Mina do Chico Rei, em Ouro Preto. A agência confirma qual mina.",
              guia: {
                sub: "Mina do século XVIII · qual? a confirmar",
                chips: [["estrela", "Ingresso R$ 80 (agência)"], ["mochila", "Leve agasalho"]],
                sobre: "O passeio inclui uma mina de ouro do século XVIII, com explicação sobre a mineração. A agência ainda não informou qual é.",
                ver: ["A explicação de como o ouro era tirado da montanha."],
                dica: "Dentro da mina costuma ser úmido e mais frio: vá de calçado fechado e leve um agasalho.",
              },
            },
            {
              id: "sfop", nome: "São Francisco de Assis", sub: "Aleijadinho e Ataíde", foto: "sao-francisco-op", mapa: "Igreja São Francisco de Assis Ouro Preto",
              guia: {
                sub: "Ouro Preto · Aleijadinho e Ataíde",
                chips: [["relogio", "Dom 8h30–12h e 13h30–17h"], ["estrela", "Ingresso com Museu do Aleijadinho"]],
                sobre: "Obra-prima do barroco mineiro: Aleijadinho projetou a igreja e fez a talha, e Mestre Ataíde pintou o teto da nave.",
                ver: ["A pintura do teto da nave, de Mestre Ataíde.", "A fachada e a portada esculpidas por Aleijadinho.", "A feira de pedra-sabão em frente, no Largo de Coimbra."],
                dica: "São Francisco + Museu do Aleijadinho: R$ 30 (meia R$ 15), e vale também para a Igreja do Carmo.",
              },
            },
            {
              id: "inconfidencia", nome: "Museu da Inconfidência", sub: "Praça Tiradentes", foto: "inconfidencia", mapa: "Museu da Inconfidência",
              guia: {
                sub: "Praça Tiradentes",
                chips: [["relogio", "Dom 10h–18h (entrada até 17h)"], ["estrela", "Grátis"]],
                sobre: "No antigo prédio da Casa de Câmara e Cadeia, começado em 1785. Conta a história da Inconfidência Mineira e guarda arte sacra e objetos dos séculos XVIII e XIX.",
                ver: ["O Panteão dos Inconfidentes.", "Obras atribuídas a Aleijadinho e a Mestre Ataíde."],
                dica: "Fecha às segundas. No domingo, abre das 10h às 18h.",
              },
            },
            {
              id: "pedrasabao", nome: "Pedra-sabão", sub: "artesanato", foto: "pedra-sabao", mapa: "Feira de pedra-sabão Largo de Coimbra Ouro Preto",
              guia: {
                sub: "Largo de Coimbra · feira de artesanato",
                chips: [["sol", "Ao ar livre"], ["relogio", "Todo dia, horário a confirmar"]],
                sobre: "Dezenas de barracas em frente à Igreja de São Francisco, com peças de pedra-sabão: esculturas, panelas, objetos de decoração e bijuterias.",
                ver: ["As panelas de pedra-sabão, típicas de Minas.", "Esculturas e lembranças da cidade."],
                dica: "Pedra-sabão pesa: deixe as compras para o fim do passeio.",
              },
            },
            {
              id: "mariana", nome: "Mariana", sub: "Praça Minas Gerais e Sé", foto: "mariana", mapa: "Catedral da Sé Mariana",
              guia: {
                sub: "Praça Minas Gerais e Catedral da Sé",
                chips: [["estrela", "Primeira capital de Minas"], ["relogio", "Fim do passeio"]],
                sobre: "Primeira capital de Minas. Na Praça Minas Gerais ficam duas igrejas lado a lado, o pelourinho e a Casa de Câmara e Cadeia. A Catedral da Sé guarda um órgão alemão do século XVIII.",
                ver: ["A Praça Minas Gerais, com as igrejas de São Francisco e do Carmo lado a lado.", "O órgão Arp Schnitger da Catedral da Sé."],
                dica: "Os concertos do órgão acontecem em sábados marcados; no domingo, o mais provável é ver o instrumento sem concerto.",
              },
            },
          ],
        },
        {
          tipo: "lista",
          titulo: "Ingressos",
          legenda: "pagos à parte",
          itens: [
            "Igreja de São Francisco + Museu do Aleijadinho: R$ 30 (meia R$ 15). Vale também para a Igreja do Carmo.",
            "Matriz do Pilar + Museu de Arte Sacra: R$ 30 (meia R$ 15).",
            "Mina de ouro: R$ 80.",
            "Museu da Inconfidência: grátis.",
            "Almoço e despesas pessoais não estão inclusos.",
          ],
        },
        {
          tipo: "pendencias",
          titulo: "Falta confirmar",
          itens: [
            { id: "op-embarque", texto: "Horário exato da busca no hotel (a agência fala em 07h a 08h)." },
            { id: "op-mina", texto: "Qual mina vai ser visitada." },
          ],
        },
        {
          tipo: "mochila",
          titulo: "Se chover",
          texto: "Se o tempo fechar, a agência ajusta a ordem das paradas. Nas ladeiras de pedra molhada, vá com calma.",
          itens: ["Capa de chuva leve", "Calçado antiderrapante", "Proteção para celular e documentos", "Agasalho para a mina e o fim da tarde"],
        },
      ],
    },

    {
      id: "d02",
      data: "2026-11-02",
      semana: "Seg",
      titulo: "Inhotim",
      cor: "mata",
      foto: "narcissus",
      local: "inhotim",
      chuva: "Se chover forte: prefira as galerias cobertas e use o carrinho quando ele estiver rodando.",
      resumo: "Arquitetura, design e instalações imersivas. Sem tentar ver tudo.",
      resumoInicio: "Arte contemporânea no meio do jardim: Kusama, Cosmococa, Varejão e mais.",
      blocos: [
        {
          tipo: "ingresso",
          titulo: "Transfer Belvitur",
          itens: [
            { hora: "07h20", texto: "Sair do hotel de Uber.", uber: "Holiday Inn Savassi Rua Professor Moraes 600" },
            { hora: "07h45", texto: "Apresentação no Holiday Inn Savassi (Rua Professor Moraes, 600). O ônibus para do outro lado da rua.", mapa: "Holiday Inn Savassi Rua Professor Moraes 600" },
            { hora: "08h00", texto: "Saída às 08h00. O ônibus espera até 08h05." },
          ],
          inclui: "Transfer ida e volta, duas meias-entradas e dois carrinhos compartilhados.",
          chegada: "Na chegada, retirar ingressos e pulseiras do carrinho no quiosque da Belvitur, à esquerda da entrada. Os dois precisam do documento de meia-entrada.",
          volta: "Volta: estar no estacionamento às 16h15 para sair às 16h30, até a Belvitur confirmar outro horário por escrito.",
          contatos: "Telefones da Belvitur: no voucher e no WhatsApp.",
        },
        {
          tipo: "galerias",
          titulo: "Imperdíveis",
          // Dentro do Inhotim não tem Uber: o guia só mostra o mapa.
          dentro: true,
          itens: [
            {
              id: "kusama", nome: "Yayoi Kusama", sub: "Duas instalações imersivas. É a primeira do dia, porque costuma ter fila.", foto: "narcissus", mapa: "Galeria Yayoi Kusama Inhotim",
              guia: {
                sub: "Eixo Laranja · perto da Cosmococa",
                chips: [["relogio", "Inhotim no feriado: 9h30–17h30"], ["estrela", "Uma das mais concorridas"]],
                sobre: "Inaugurada em 2023, a galeria reúne duas instalações da artista japonesa. Na entrada, um jardim com milhares de bromélias lembra as bolinhas do trabalho dela.",
                ver: ["I'm Here, But Nothing (2000): uma casa comum sob luz negra, coberta de pontos fluorescentes.", "Aftermath of Obliteration of Eternity (2009): lanternas e espelhos que parecem não ter fim.", "Narcissus Garden, do lado de fora: esferas de aço sobre a água."],
                dica: "Costuma ter fila. Por isso ela é a primeira do dia.",
              },
            },
            {
              id: "cosmococa", nome: "Cosmococa", sub: "Ambientes de Hélio Oiticica e Neville D'Almeida, ao lado da Kusama.", foto: "inhotim-lago", fotoNota: "Foto ilustrativa: lago do Inhotim. Não há foto livre da galeria Cosmococa.", mapa: "Galeria Cosmococa Inhotim",
              guia: {
                sub: "Hélio Oiticica e Neville D'Almeida",
                chips: [["estrela", "Ao lado da Kusama"], ["relogio", "Uns 40 min no roteiro"]],
                sobre: "Os Quasi-Cinemas que os dois criaram em 1973: salas com projeções de slides, trilha sonora e coisas para tocar e sentir. A ideia é deitar, mexer e participar.",
                ver: ["As salas com colchões e projeções, para ver deitado.", "Magic Square #5, de Hélio Oiticica, ali perto."],
                dica: "É uma obra para viver com o corpo: vá sem pressa e siga as orientações da equipe em cada sala.",
              },
            },
            {
              id: "varejao", nome: "Adriana Varejão", sub: "Concreto suspenso sobre espelho-d'água.", foto: "varejao", mapa: "Galeria Adriana Varejão Inhotim",
              guia: {
                sub: "Tacoa Arquitetos · 2008",
                chips: [["estrela", "O \"edifício cego\""], ["relogio", "Uns 45 min no roteiro"]],
                sobre: "Uma caixa de concreto suspensa sobre um espelho-d'água, que reflete a paisagem. Dentro, obras da artista carioca, conhecida pelos azulejos e pelas referências ao barroco e à história do Brasil.",
                ver: ["O prédio refletido no espelho-d'água.", "As obras com azulejos da artista."],
                dica: "Vale dar a volta por fora: o prédio é tão marcante quanto as obras.",
              },
            },
            {
              id: "pape", nome: "Lygia Pape", sub: "Ttéia 1 C: fios dourados, luz e escuridão.", foto: "inhotim-jardim", fotoNota: "Foto ilustrativa: jardins do Inhotim. Não há foto livre da galeria Lygia Pape.", mapa: "Galeria Lygia Pape Inhotim",
              guia: {
                sub: "Ttéia 1 C (2002) · Rizoma Arquitetura, 2012",
                chips: [["estrela", "Uma obra só, numa sala escura"], ["relogio", "Visita rápida"]],
                sobre: "A galeria foi feita para uma única obra: fios dourados esticados do teto ao chão, que aparecem e somem conforme a luz e o lugar de onde se olha.",
                ver: ["Os fios mudando com a luz: ande devagar pela sala."],
                dica: "Dê um tempo para os olhos se acostumarem ao escuro.",
              },
            },
            {
              id: "tunga", nome: "Psicoativa Tunga", sub: "Pavilhão de vidro no meio da mata.", foto: "inhotim", fotoNota: "Foto ilustrativa: Jardim Botânico do Inhotim. Não há foto livre da galeria Psicoativa Tunga.", mapa: "Galeria Psicoativa Tunga Inhotim",
              guia: {
                sub: "Rizoma Arquitetura · 2012",
                chips: [["estrela", "Uma das maiores galerias"], ["carro", "Ir de carrinho"]],
                sobre: "Uma caixa de vidro no meio da mata, com obras do artista pernambucano Tunga. Ele também tem a primeira galeria do Inhotim, a True Rouge, aberta em 2002.",
                ver: ["A mata vista através do vidro.", "As esculturas e instalações de Tunga."],
                dica: "Fica mais longe da entrada: o roteiro já prevê ir de carrinho.",
              },
            },
            {
              id: "andujar", nome: "Claudia Andujar", sub: "Maxita Yano, o povo Yanomami. Sem pressa.", foto: "andujar", mapa: "Galeria Claudia Andujar Inhotim",
              guia: {
                sub: "Maxita Yano · Arquitetos Associados, 2015",
                chips: [["estrela", "Mais de 400 fotografias"], ["relogio", "Sem pressa"]],
                sobre: "Galeria dedicada à fotógrafa nascida na Suíça que passou boa parte da vida registrando o povo Yanomami e defendendo seus direitos. Os Yanomami chamaram o prédio de Maxita Yano, \"casa de terra\".",
                ver: ["Os retratos dos Yanomami.", "O próprio prédio, integrado ao jardim."],
                dica: "São muitas salas: reserve tempo e vá no seu ritmo.",
              },
            },
          ],
          extras: {
            titulo: "Se der tempo",
            itens: [
              "Cildo Meireles, se estiver aberta: Desvio para o Vermelho e Através.",
              "Sonic Pavilion, de Doug Aitken: sons a 202 m de profundidade.",
              "Miguel Rio Branco: prédio meio suspenso, meio subterrâneo.",
              "Matthew Barney, De lama lâmina: impactante, mas longe.",
            ],
          },
          // Tocar numa obra troca a foto do topo. Todo card tem foto; quando não é a do lugar, a fotoNota avisa.
          caminho: {
            titulo: "Para fotografar no caminho",
            itens: [
              { nome: "Magic Square #5, Hélio Oiticica", foto: "magic-square" },
              { nome: "Viewing Machine, Olafur Eliasson", foto: "viewing-machine" },
              { nome: "Beam Drop, Chris Burden", foto: "beam-drop" },
              { nome: "Troca-troca, Jarbas Lopes", foto: "troca-troca" },
              { nome: "Narcissus Garden, Yayoi Kusama", foto: "narcissus" },
              { nome: "Elevazione, Giuseppe Penone", foto: "penone-rotterdam", fotoNota: "Outra Elevazione de Penone, em Rotterdam: não há foto livre da obra do Inhotim." },
            ],
          },
        },
        {
          tipo: "linha",
          titulo: "Hora a hora",
          itens: [
            { hora: "09h30", texto: "Ingressos, pulseiras, banheiro, água e mapa. Vale perguntar o horário do ônibus e se alguma galeria está fechada." },
            { hora: "10h00", texto: "Galeria Yayoi Kusama." },
            { hora: "10h30", texto: "Cosmococa e Magic Square." },
            { hora: "11h15", texto: "Adriana Varejão." },
            { hora: "12h00", texto: "Cildo Meireles, se aberta. Senão, Lygia Pape." },
            { hora: "12h45", texto: "Almoço rápido, uns 45 min. Bom momento para conferir o horário do ônibus." },
            { hora: "13h30", texto: "Carrinho até a Psicoativa Tunga." },
            { hora: "em seguida", texto: "Claudia Andujar, sem pressa." },
            { hora: "15h10", texto: "Lygia Pape, se faltou. Senão, um só extra: Miguel Rio Branco, Sonic Pavilion ou Matthew Barney." },
            { hora: "15h45", texto: "Começar a voltar para a entrada, com calma e sem paradas longe." },
            { hora: "16h00", texto: "Loja Design e banheiro." },
            { hora: "16h15", texto: "No estacionamento.", destaque: true },
          ],
        },
        {
          tipo: "regras",
          titulo: "Plano B no Inhotim",
          itens: [
            "Os carrinhos têm rotas fixas, não são porta a porta. Perguntar à equipe a melhor sequência.",
            "Fila longa na Kusama: comece pela sala mais concorrida. A Cosmococa fica ao lado, vale aproveitar antes de sair dali.",
            "Alguma galeria em manutenção? Confira na entrada e troque por Lygia Pape, Miguel Rio Branco ou mais tempo na Andujar.",
            "Atrasou uns 30 min? Deixe Matthew Barney e Miguel Rio Branco para uma próxima vez.",
            "Atrasou uma hora? Fique com Kusama, Cosmococa, Varejão e Lygia Pape, e escolha entre Tunga e Andujar.",
            "Se chover forte: prefira as galerias cobertas e use o carrinho quando ele estiver rodando.",
            "Se a Belvitur confirmar 17h30 por escrito, dá para ficar mais uma hora. Até lá, vale 16h30.",
          ],
        },
      ],
    },

    {
      id: "d03",
      data: "2026-11-03",
      semana: "Ter",
      titulo: "Até logo, Minas",
      cor: "azulejo",
      foto: "mirante-mangabeiras",
      local: "bh",
      voo: "volta",
      chuva: "Chuva de madrugada deixa o trânsito mais lento: vale sair no horário.",
      resumo: "Madrugada no aeroporto. Voo às 06h00.",
      blocos: [
        {
          tipo: "linha",
          titulo: "Madrugada",
          itens: [
            { hora: "02h40", texto: "Sair do hotel às 02h40 (dá para esperar até 02h50), de transfer ou Uber agendado na véspera.", destaque: true },
            { hora: "06h00", texto: "Voo saindo de Confins." },
          ],
        },
        {
          tipo: "nota",
          titulo: "Na véspera",
          texto: "Antes de dormir: agendar o Uber ou o transfer e deixar as malas prontas.",
        },
      ],
    },
  ],
};
