// Conteúdo do roteiro. Para mudar horários, textos ou fotos, edite só este arquivo.
// Repositório público: não colocar voucher, valores pagos, telefones nem endereço do hotel.

const ROTEIRO = {
  titulo: "BH a dois",
  casal: "Luiz & Lucas",
  inicio: "2026-10-30",
  fim: "2026-11-03",
  subtitulo: "Aniversário de casamento entre pão de queijo, Niemeyer, barroco e arte contemporânea.",

  avisos: [
    {
      id: "aviso-inhotim-volta",
      texto: "Volta do Inhotim: a atendente disse 16h30 e o voucher diz 17h30 em feriados (02/11 é Finados). Até a Belvitur confirmar por escrito, vale 16h30.",
    },
    {
      id: "aviso-ouro-preto",
      texto: "Ouro Preto: falta o horário e o local exatos de embarque.",
    },
  ],

  // Sem número de voo: com a data, ele mostra quando a casa fica vazia.
  // "Acompanhar voo" abre o painel de chegadas ou partidas de Confins.
  voo: {
    ida: {
      data: "2026-10-30",
      de: { cod: null, hora: null, cidade: "origem a confirmar" },
      para: { cod: "CNF", hora: "22h50", cidade: "Confins, BH" },
      conexao: "direto ou com conexão? a confirmar",
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
      conexao: "direto ou com conexão? a confirmar",
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
      chuva: "Chuva não muda nada: do aeroporto, Uber direto para o hotel.",
      resumo: "Pouso em Confins à noite e direto para o hotel.",
      blocos: [
        {
          tipo: "linha",
          titulo: "A noite",
          itens: [
            { hora: "22h50", texto: "Pouso previsto em Confins." },
            { hora: "depois", texto: "Retirar as malas e só então chamar o Uber direto para o hotel na Savassi.", uber: true },
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
            { id: "mercado", nome: "Mercado Central", sub: "café da manhã", foto: "mercado-central", mapa: "Mercado Central Belo Horizonte" },
            { id: "papa", nome: "Praça do Papa", sub: "e Rua do Amendoim", foto: "praca-do-papa", mapa: "Praça do Papa Belo Horizonte", aoAr: true },
            { id: "mirante", nome: "Mirante do Mangabeiras", sub: "BH inteira lá embaixo", foto: "mirante-mangabeiras", mapa: "Mirante do Mangabeiras", aoAr: true },
            { id: "baile", nome: "Casa do Baile", sub: "Niemeyer na lagoa", foto: "casa-do-baile", mapa: "Casa do Baile Pampulha" },
            { id: "igrejinha", nome: "Igrejinha da Pampulha", sub: "azulejos de Portinari", foto: "igrejinha-pampulha", mapa: "Igreja São Francisco de Assis Pampulha" },
            { id: "jk", nome: "Casa Kubitschek", sub: "primeira a sair se atrasar", foto: "casa-kubitschek", mapa: "Museu Casa Kubitschek" },
            { id: "xapuri", nome: "Xapuri", sub: "almoço mineiro", mapa: "Restaurante Xapuri Belo Horizonte", icone: "panela" },
            { id: "liberdade", nome: "Praça da Liberdade", sub: "Circuito Liberdade", foto: "praca-da-liberdade", mapa: "Praça da Liberdade Belo Horizonte" },
            { id: "fiat", nome: "Casa Fiat de Cultura", sub: "painel de Portinari", foto: "casa-fiat", mapa: "Casa Fiat de Cultura" },
            { id: "ccbb", nome: "CCBB BH", sub: "Circuito Liberdade", foto: "ccbb-bh", mapa: "CCBB Belo Horizonte" },
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
                { hora: "11h00", texto: "Uber para a Pampulha.", uber: "Casa do Baile Pampulha" },
                { hora: "11h45", texto: "Casa do Baile." },
                { hora: "12h30", texto: "Igrejinha da Pampulha." },
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
                { hora: "09h30", texto: "Olhar o radar. Janela segura de 90 min ou mais: fazer Mangabeiras. Continua chovendo: ir direto para a Pampulha." },
                { hora: "Pampulha", texto: "Priorizar o que é coberto e usar Uber entre as atrações." },
                { hora: "tarde", texto: "Depois do almoço, Casa Fiat e CCBB." },
                { hora: "até 17h", texto: "Mangabeiras só entra se o radar estiver limpo." },
              ],
            },
            {
              id: "C",
              nome: "Tempestade",
              icone: "raio",
              descricao: "Chuva forte, raios ou alerta: só lugares cobertos.",
              itens: [
                { hora: "08h00", texto: "Mercado Central, sem pressa." },
                { hora: "10h00", texto: "Uber para o Circuito Liberdade.", uber: "Casa Fiat de Cultura" },
                { hora: "10h30", texto: "Casa Fiat de Cultura." },
                { hora: "12h00", texto: "CCBB." },
                { hora: "13h30", texto: "Almoço coberto na Centro-Sul ou Savassi." },
                { hora: "tarde", texto: "Outro museu aberto do Circuito Liberdade." },
              ],
              alerta: "Nada de Mirante, Praça do Papa, Rua do Amendoim ou orla da Pampulha durante a tempestade. Se melhorar de verdade, só Igrejinha e Casa do Baile, de Uber.",
            },
          ],
        },
        {
          tipo: "regras",
          titulo: "Regras do dia",
          itens: [
            "07h00: conferir previsão por hora, radar, alertas da Defesa Civil e do INMET, se as atrações abrem e o trânsito no app.",
            "Conferir de novo ao sair do Mercado Central.",
            "Raios, vento forte ou chuva intensa: nada de mirantes, praças arborizadas ou orla da lagoa.",
            "Atrasou? Não correr. Cortar primeiro a Casa Kubitschek. Preservar Mercado, Igrejinha, Casa do Baile, Xapuri e Circuito Liberdade.",
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
      chuva: "Quem manda no ritmo é a agência. Capa de chuva e calçado antiderrapante: as ladeiras ficam escorregadias.",
      resumo: "Barroco, ladeiras de pedra e uma mina de ouro.",
      blocos: [
        {
          tipo: "nota",
          titulo: "Como vai ser",
          texto: "Passeio compartilhado com a Turismo Ouro Preto, com saída e volta em Belo Horizonte. É a agência que manda no ritmo do dia.",
        },
        {
          tipo: "cards",
          titulo: "No caminho",
          itens: [
            { id: "pilar", nome: "Igreja do Pilar", sub: "ouro por todo lado", mapa: "Igreja Matriz Nossa Senhora do Pilar Ouro Preto", icone: "igreja" },
            { id: "mina", nome: "Mina de ouro", sub: "qual? a confirmar", icone: "picareta" },
            { id: "sfop", nome: "São Francisco de Assis", sub: "Aleijadinho e Ataíde", foto: "sao-francisco-op", mapa: "Igreja São Francisco de Assis Ouro Preto" },
            { id: "inconfidencia", nome: "Museu da Inconfidência", sub: "Praça Tiradentes", mapa: "Museu da Inconfidência", icone: "coluna" },
            { id: "pedrasabao", nome: "Pedra-sabão", sub: "artesanato", icone: "pote" },
            { id: "mariana", nome: "Mariana", sub: "Praça da Sé", foto: "mariana", mapa: "Catedral da Sé Mariana" },
          ],
        },
        {
          tipo: "pendencias",
          titulo: "Falta confirmar",
          itens: [
            { id: "op-embarque", texto: "Horário e local exatos de embarque." },
            { id: "op-mina", texto: "Qual mina será visitada." },
            { id: "op-ingressos", texto: "Valores dos ingressos pagos à parte." },
          ],
        },
        {
          tipo: "mochila",
          titulo: "Se chover",
          texto: "Seguir a agência. Ladeiras e pedras ficam escorregadias.",
          itens: ["Capa de chuva leve", "Calçado antiderrapante", "Proteção para celular e documentos"],
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
      chuva: "Com chuva forte ou raios: menos obras ao ar livre, mais galerias cobertas e carrinho quando liberado.",
      resumo: "Arquitetura, design e instalações imersivas. Sem tentar ver tudo.",
      blocos: [
        {
          tipo: "ingresso",
          titulo: "Transfer Belvitur",
          itens: [
            { hora: "07h20", texto: "Sair do hotel de Uber.", uber: "Holiday Inn Savassi Rua Professor Moraes 600" },
            { hora: "07h45", texto: "Apresentação no Holiday Inn Savassi (Rua Professor Moraes, 600). O ônibus para do outro lado da rua.", mapa: "Holiday Inn Savassi Rua Professor Moraes 600" },
            { hora: "08h00", texto: "Saída. Limite: 08h05." },
          ],
          inclui: "Transfer ida e volta, duas meias-entradas e dois carrinhos compartilhados.",
          chegada: "Na chegada, retirar ingressos e pulseiras do carrinho no quiosque da Belvitur, à esquerda da entrada. Os dois precisam do documento de meia-entrada.",
          volta: "Volta: estar no estacionamento às 16h15 para sair às 16h30, até a Belvitur confirmar outro horário por escrito.",
          contatos: "Telefones da Belvitur: no voucher e no WhatsApp.",
        },
        {
          tipo: "galerias",
          titulo: "Imperdíveis",
          itens: [
            { id: "kusama", nome: "Yayoi Kusama", sub: "Duas instalações imersivas. Ir primeiro: fila por ordem de chegada.", foto: "narcissus" },
            { id: "cosmococa", nome: "Cosmococa", sub: "Ambientes de Hélio Oiticica e Neville D'Almeida, ao lado da Kusama.", icone: "espiral" },
            { id: "varejao", nome: "Adriana Varejão", sub: "Concreto suspenso sobre espelho-d'água.", foto: "varejao" },
            { id: "pape", nome: "Lygia Pape", sub: "Ttéia 1C: fios metálicos, luz e escuridão.", icone: "fios" },
            { id: "tunga", nome: "Psicoativa Tunga", sub: "Pavilhão de vidro no meio da mata.", icone: "vidro" },
            { id: "andujar", nome: "Claudia Andujar", sub: "Maxita Yano, o povo Yanomami. Sem pressa.", foto: "andujar" },
          ],
          extras: {
            titulo: "Se der tempo",
            itens: [
              "Cildo Meireles, obrigatória se reaberta: Desvio para o Vermelho e Através.",
              "Sonic Pavilion, de Doug Aitken: sons a 202 m de profundidade.",
              "Miguel Rio Branco: prédio meio suspenso, meio subterrâneo.",
              "Matthew Barney, De lama lâmina: impactante, mas longe.",
            ],
          },
          caminho: {
            titulo: "Para fotografar no caminho",
            foto: "magic-square",
            itens: ["Magic Square #5, Hélio Oiticica", "Viewing Machine, Olafur Eliasson", "Beam Drop, Chris Burden", "Troca-troca, Jarbas Lopes", "Narcissus Garden, Yayoi Kusama", "Elevazione, Giuseppe Penone"],
          },
        },
        {
          tipo: "linha",
          titulo: "Hora a hora",
          itens: [
            { hora: "09h30", texto: "Ingressos, pulseiras, banheiro, água e mapa. Confirmar horário do ônibus e o que está fechado." },
            { hora: "10h00", texto: "Galeria Yayoi Kusama." },
            { hora: "10h30", texto: "Cosmococa e Magic Square." },
            { hora: "11h15", texto: "Adriana Varejão." },
            { hora: "12h00", texto: "Cildo Meireles, se aberta. Senão, Lygia Pape." },
            { hora: "12h45", texto: "Almoço rápido, uns 45 min. Reconfirmar o ônibus." },
            { hora: "13h30", texto: "Carrinho para Psicoativa Tunga e Claudia Andujar." },
            { hora: "15h10", texto: "Lygia Pape, se faltou. Senão, um só extra: Miguel Rio Branco, Sonic Pavilion ou Matthew Barney." },
            { hora: "15h45", texto: "Voltar para a entrada. Nenhuma parada longe." },
            { hora: "16h00", texto: "Loja Design e banheiro." },
            { hora: "16h15", texto: "No estacionamento.", destaque: true },
          ],
        },
        {
          tipo: "regras",
          titulo: "Plano B no Inhotim",
          itens: [
            "Os carrinhos têm rotas fixas, não são porta a porta. Perguntar à equipe a melhor sequência.",
            "Fila longa na Kusama: fazer primeiro a sala mais concorrida. Não sair da região sem a Cosmococa.",
            "Galeria em manutenção: não ir até a porta. Trocar por Lygia Pape, Miguel Rio Branco ou mais tempo na Andujar.",
            "30 min de atraso: tirar Matthew Barney e Miguel Rio Branco.",
            "60 min de atraso: manter Kusama, Cosmococa, Varejão e Lygia Pape, e só uma entre Tunga e Andujar.",
            "Chuva forte ou raios: menos obras externas, galerias cobertas e carrinho quando liberado.",
            "Se confirmarem 17h30 por escrito, aí sim ampliar. Não presumir a hora extra.",
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
      chuva: "Chuva de madrugada deixa o trânsito mais lento: sair no horário, sem esticar.",
      resumo: "Madrugada no aeroporto. Voo às 06h00.",
      blocos: [
        {
          tipo: "linha",
          titulo: "Madrugada",
          itens: [
            { hora: "02h40", texto: "Sair do hotel (até 02h50), de transfer privativo ou Uber agendado na véspera.", destaque: true },
            { hora: "06h00", texto: "Voo saindo de Confins." },
          ],
        },
        {
          tipo: "nota",
          titulo: "Na véspera",
          texto: "Agendar o Uber ou o transfer e deixar as malas prontas antes de dormir.",
        },
      ],
    },
  ],
};
