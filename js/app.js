// Site do roteiro: telas montadas a partir de ROTEIRO (js/dados.js).
// Rotas: #/  ·  #/dia/<id>[/<plano>]  ·  #/dias  ·  #/avisos  ·  #/creditos
// Para testar outra data: ?hoje=2026-10-31

const R = ROTEIRO;
// Mesmo número do ?v= no index.html e da VERSAO no sw.js; aparece no rodapé para conferir se a versão nova chegou.
const VERSAO_APP = 19;
const app = document.getElementById("app");

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const estado = {
  abaVoo: null,
  creditos: null,
  tempo: {},
};

// ---------- Utilidades ----------

function esc(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function hojeISO() {
  const teste = new URLSearchParams(location.search).get("hoje");
  if (teste && /^\d{4}-\d{2}-\d{2}$/.test(teste)) return teste;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dataDe(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function diasEntre(de, ate) {
  return Math.round((dataDe(ate) - dataDe(de)) / 86400000);
}

function dataLonga(iso) {
  const d = dataDe(iso);
  return `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function dataCurta(iso) {
  const d = dataDe(iso);
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

function diaPorId(id) {
  return R.dias.find((d) => d.id === id);
}

function diaDeHoje() {
  return R.dias.find((d) => d.data === hojeISO()) || null;
}

function foto(nome) {
  return `img/${nome}.jpg`;
}

function linkMapa(busca) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
}

function linkUber(destino) {
  const base = "https://m.uber.com/ul/?action=setPickup&pickup=my_location";
  return destino ? `${base}&dropoff[formatted_address]=${encodeURIComponent(destino)}` : base;
}

function guardar(chave, valor) {
  try { localStorage.setItem(`roteiro:${chave}`, valor); } catch (e) { /* sem armazenamento: tudo bem */ }
}

function lembrar(chave) {
  try { return localStorage.getItem(`roteiro:${chave}`); } catch (e) { return null; }
}

// Quantas paradas foram marcadas como feitas (todas as linhas do tempo, inclusive as dos planos de tempo).
function paradasFeitas() {
  let n = 0;
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("roteiro:feito:") && localStorage.getItem(k) === "1") n++; } } catch (e) { /* sem armazenamento */ }
  return n;
}

function lerJSON(chave) {
  try { return JSON.parse(lembrar(chave)) || null; } catch (e) { return null; }
}

function somaDias(iso, n) {
  const d = dataDe(iso);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Voo e hotel: o que a pessoa digitou no app fica só neste celular, por cima dos valores do roteiro.
function vooDe(aba) {
  const base = R.voo[aba];
  const s = lerJSON(`voo:${aba}`) || {};
  return {
    ...base,
    data: /^\d{4}-\d{2}-\d{2}$/.test(s.data || "") ? s.data : base.data,
    numero: s.numero || "",
    conexao: s.conexao || base.conexao,
    de: { cod: s.deCod || base.de.cod, hora: s.deHora || base.de.hora, cidade: s.deCidade || base.de.cidade },
    para: { cod: s.paraCod || base.para.cod, hora: s.paraHora || base.para.hora, cidade: s.paraCidade || base.para.cidade },
    conex: { cod: s.conexCod || "", numero: s.conexNumero || "", chega: s.conexChega || "", sai: s.conexSai || "" },
  };
}

// Texto da conexão no card: "BSB · 1h25 de espera" (a espera sai das horas de chegada e saída).
function textoConexao(v) {
  if (v.conexao !== "Com conexão" || !v.conex.cod) return v.conexao;
  const min = (h) => { const m = /^(\d{2})h(\d{2})$/.exec(h || ""); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  const a = min(v.conex.chega), b = min(v.conex.sai);
  if (a === null || b === null) return v.conex.cod;
  const espera = (b - a + 1440) % 1440;
  return `${v.conex.cod} · ${Math.floor(espera / 60)}h${String(espera % 60).padStart(2, "0")} de espera`;
}

function hotel() {
  return lerJSON("hotel");
}

function lugaresDoDia(dia) {
  return dia.blocos
    .filter((b) => b.tipo === "cards" || b.tipo === "galerias")
    .flatMap((b) => b.itens.map((i) => ({ ...i, dentro: !!b.dentro })));
}

function cenariosDoDia(dia) {
  return dia.blocos.find((b) => b.tipo === "cenarios") || null;
}

// Horário em que o lugar aparece na linha do tempo do dia (ou no plano Sol).
function horaDe(dia, nome) {
  const alvo = nome.toLowerCase();
  for (const b of dia.blocos) {
    const itens = b.tipo === "linha" ? b.itens : b.tipo === "cenarios" ? b.opcoes[0].itens : [];
    const achou = itens.find((i) => /^\d/.test(i.hora) && i.texto.toLowerCase().includes(alvo));
    if (achou) return { hora: achou.hora, plano: b.tipo === "cenarios" ? b.opcoes[0].nome : null };
  }
  return null;
}

function pendencias() {
  return R.dias.flatMap((dia) =>
    dia.blocos.filter((b) => b.tipo === "pendencias").flatMap((b) => b.itens.map((i) => ({ ...i, dia }))),
  );
}

function contagem() {
  const hoje = hojeISO();
  if (hoje < R.inicio) {
    const n = diasEntre(hoje, R.inicio);
    return n === 1 ? "é amanhã!" : `faltam ${n} dias`;
  }
  if (hoje <= R.fim) return `dia ${diasEntre(R.inicio, hoje) + 1} de ${diasEntre(R.inicio, R.fim) + 1}`;
  return "até a próxima";
}

async function carregarCreditos() {
  if (estado.creditos) return estado.creditos;
  try {
    const r = await fetch("img/creditos.json");
    estado.creditos = r.ok ? await r.json() : {};
  } catch (e) {
    estado.creditos = {};
  }
  return estado.creditos;
}

// nota: quando a foto não é do próprio lugar (foto ilustrativa ou outra versão da obra).
function textoCredito(c, nota) {
  return `${nota ? `<strong>${esc(nota)}</strong> ` : ""}Foto: <a href="${esc(c.fonte)}" target="_blank" rel="noopener">${esc(c.autor)}</a>, ${esc(c.licenca)}, Wikimedia Commons`;
}

// ---------- Peças ----------

function bolasDosDias(atual) {
  return `<div class="dias-fileira">${R.dias
    .map((d) => {
      const n = dataDe(d.data).getDate();
      const marcado = d.id === atual ? ' aria-current="true"' : "";
      return `<a class="dia-bola cor-${d.cor}" href="#/dia/${d.id}"${marcado} aria-label="${esc(dataLonga(d.data))}: ${esc(d.titulo)}">
        <img src="${foto(d.foto)}" alt="" loading="lazy">
        <span>${d.semana} ${n}</span>
      </a>`;
    })
    .join("")}</div>`;
}

function acoesDoItem(item) {
  const botoes = [];
  if (item.mapa) botoes.push(`<a class="botao-mini" href="${linkMapa(item.mapa)}" target="_blank" rel="noopener">${icone("pino", 16)} Mapa</a>`);
  if (item.uber) {
    // "hotel" usa o endereço guardado no celular; sem ele, o Uber abre sem destino.
    const destino = item.uber === "hotel" ? hotel()?.endereco || null : typeof item.uber === "string" ? item.uber : null;
    botoes.push(`<a class="botao-mini" href="${linkUber(destino)}" target="_blank" rel="noopener">${icone("carro", 16)} Chamar Uber</a>`);
  }
  return botoes.length ? `<div class="acoes">${botoes.join("")}</div>` : "";
}

// Cada parada tem um check; o que foi marcado fica salvo no celular (chave = dia, bloco e posição).
function linhaDoTempo(itens, chave) {
  return `<ol class="linha-tempo">${itens
    .map((i, n) => {
      const id = `feito:${chave}:${n}`;
      const feito = lembrar(id) === "1";
      const classes = [i.destaque ? "destaque" : "", feito ? "feito" : ""].filter(Boolean).join(" ");
      return `<li${classes ? ` class="${classes}"` : ""}>
        <span class="hora">${esc(i.hora)}</span>
        <div class="texto"><span>${esc(i.texto)}</span>${acoesDoItem(i)}</div>
        <button type="button" class="check" data-acao="feito" data-id="${id}" aria-pressed="${feito}" aria-label="Marcar como feito: ${esc(i.texto)}">${icone("ok", 18)}</button>
      </li>`;
    })
    .join("")}</ol>`;
}

function cardLugar(dia, item, alto = false, ordem = null) {
  const imagem = item.foto
    ? `<img src="${foto(item.foto)}" alt="" loading="lazy">`
    : `<span class="sem-foto">${icone(item.icone, alto ? 64 : 44)}</span>`;
  let etiqueta = "";
  if (ordem) {
    const h = horaDe(dia, item.nome);
    etiqueta = `<span class="chip">${ordem}º${h ? ` · ${esc(h.hora)}` : ""}</span>`;
  }
  return `<button type="button" class="card-foto${alto ? " card-alto" : ""}" data-acao="lugar" data-dia="${dia.id}" data-id="${item.id}">
    ${imagem}${etiqueta}
    <span class="card-texto"><strong>${esc(item.nome)}</strong><span class="card-sub">${esc(item.sub)}</span></span>
  </button>`;
}

function blocoCenarios(dia, bloco, escolhido) {
  const atual = bloco.opcoes.find((o) => o.id === escolhido) || bloco.opcoes[0];
  return `<div class="cenarios" role="group" aria-label="Plano conforme o tempo">
      ${bloco.opcoes
        .map(
          (o) => `<button type="button" data-acao="cenario" data-dia="${dia.id}" data-id="${o.id}" aria-pressed="${o.id === atual.id}">
            ${icone(o.icone, 24)}<span>${esc(o.nome)}</span>
          </button>`,
        )
        .join("")}
    </div>
    <p class="legenda" style="font-size:15px">${esc(atual.descricao)}</p>
    ${atual.alerta ? `<div class="caixa-aviso">${icone("info", 22)}<p>${esc(atual.alerta)}</p></div>` : ""}
    ${linhaDoTempo(atual.itens, `${dia.id}:plano-${atual.id}`)}`;
}

function cenarioEscolhido(dia) {
  const bloco = cenariosDoDia(dia);
  const salvo = lembrar(`cenario:${dia.id}`);
  return bloco && bloco.opcoes.some((o) => o.id === salvo) ? salvo : bloco ? bloco.opcoes[0].id : null;
}

function negritarHoras(texto) {
  return esc(texto).replace(/(\d{2}h\d{2})/g, "<strong>$1</strong>");
}

// ---------- Blocos do dia ----------

function topoSecao(titulo, legenda) {
  return legenda
    ? `<div class="secao-topo"><h2>${esc(titulo)}</h2><span class="legenda">${esc(legenda)}</span></div>`
    : `<h2>${esc(titulo)}</h2>`;
}

const BLOCOS = {
  linha: (dia, b, n) => `<section class="secao">${topoSecao(b.titulo, b.legenda)}${linhaDoTempo(b.itens, `${dia.id}:${n}`)}</section>`,

  lista: (dia, b) => `<section class="secao">
      ${topoSecao(b.titulo, b.legenda)}
      <ul class="lista-regras">${b.itens.map((t) => `<li>${icone("ok", 18)}<span>${esc(t)}</span></li>`).join("")}</ul>
    </section>`,

  nota: (dia, b) => `<section class="secao">
      <div class="nota">${icone("info", 22)}<p><strong>${esc(b.titulo)}</strong>${esc(b.texto)}</p></div>
    </section>`,

  cards: (dia, b) => `<section class="secao">
      <div class="secao-topo"><h2>${esc(b.titulo)}</h2><span class="legenda">${b.itens.length} lugares</span></div>
      <div class="carrossel">${b.itens.map((i) => cardLugar(dia, i)).join("")}</div>
      ${b.fora ? `<p class="legenda">${esc(b.fora)}</p>` : ""}
    </section>`,

  cenarios: (dia, b) => `<section class="secao" id="cenarios-${dia.id}">
      <h2>${esc(b.titulo)}</h2>
      <div class="cenarios-corpo">${blocoCenarios(dia, b, cenarioEscolhido(dia))}</div>
    </section>`,

  regras: (dia, b) => `<section class="secao">
      <h2>${esc(b.titulo)}</h2>
      <ul class="lista-regras">${b.itens.map((t) => `<li>${icone("ok", 18)}<span>${negritarHoras(t)}</span></li>`).join("")}</ul>
    </section>`,

  pendencias: (dia, b) => `<section class="secao">
      <h2>${esc(b.titulo)}</h2>
      <div class="caixa-aviso" style="display:block">
        ${b.itens.map((i) => `<div class="pendencia">${icone("pendente", 18)}<span>${esc(i.texto)}</span></div>`).join("")}
      </div>
    </section>`,

  mochila: (dia, b) => `<section class="secao">
      <h2>${esc(b.titulo)}</h2>
      ${b.texto ? `<p>${esc(b.texto)}</p>` : ""}
      <div class="chips">${b.itens.map((t) => `<span class="chip chip-cor">${icone("mochila", 14)} ${esc(t)}</span>`).join("")}</div>
    </section>`,

  ingresso: (dia, b) => {
    const grandes = b.itens.slice(-2);
    const antes = b.itens.slice(0, -2);
    return `<section class="secao">
      <div class="bilhete">
        <div class="bilhete-topo">
          <span class="bolinha">${icone("onibus", 20)}</span>
          <div><strong>${esc(b.titulo)}</strong><span>ida e volta</span></div>
        </div>
        <div class="bilhete-horas">
          ${grandes
            .map(
              (i, n) => `${n ? icone("seta", 24) : ""}<div>
                <span class="grande">${esc(i.hora)}</span>
                <p>${negritarHoras(i.texto)}</p>
                ${i.mapa ? `<a class="botao-mini" href="${linkMapa(i.mapa)}" target="_blank" rel="noopener">${icone("pino", 16)} Mapa</a>` : ""}
              </div>`,
            )
            .join("")}
        </div>
        <div class="serrilha" aria-hidden="true"></div>
        <div class="bilhete-rodape">
          ${antes
            .map(
              (i) => `<div class="linha-uber">
                <span><strong>${esc(i.hora)}</strong> ${esc(i.texto)}</span>
                ${i.uber ? `<a class="botao-mini botao-mini-cheio" href="${linkUber(typeof i.uber === "string" ? i.uber : null)}" target="_blank" rel="noopener">${icone("carro", 16)} Uber</a>` : ""}
              </div>`,
            )
            .join("")}
          ${b.inclui ? `<p><strong style="color:var(--tinta)">Inclui:</strong> ${esc(b.inclui)}</p>` : ""}
          ${b.chegada ? `<p>${esc(b.chegada)}</p>` : ""}
          ${b.contatos ? `<p>${esc(b.contatos)}</p>` : ""}
        </div>
      </div>
      ${b.volta ? `<div class="caixa-aviso caixa-calma">${icone("relogio", 22)}<p>${negritarHoras(b.volta)}</p></div>` : ""}
    </section>`;
  },

  galerias: (dia, b) => `<section class="secao">
      <div class="secao-topo"><h2>${esc(b.titulo)}</h2><span class="legenda">na ordem da visita</span></div>
      <div class="carrossel">${b.itens.map((i, n) => cardLugar(dia, i, true, n + 1)).join("")}</div>
    </section>
    ${b.extras ? `<section class="secao">
      <h2>${esc(b.extras.titulo)}</h2>
      <ul class="lista-regras">${b.extras.itens.map((t) => `<li>${icone("estrela", 18)}<span>${esc(t)}</span></li>`).join("")}</ul>
    </section>` : ""}
    ${b.caminho ? `<section class="secao">
      <h2>${esc(b.caminho.titulo)}</h2>
      <div class="cartao caminho" data-dia="${dia.id}">${cartaoCaminho(b.caminho, 0)}</div>
    </section>` : ""}`,
};

// "Para fotografar no caminho": a obra escolhida aparece no topo, com o crédito da foto.
function cartaoCaminho(c, escolhida) {
  const obra = c.itens[escolhida];
  return `${obra.foto
      ? `<img src="${foto(obra.foto)}" alt="${esc(obra.nome)}" loading="lazy">`
      : `<span class="caminho-icone" role="img" aria-label="${esc(obra.nome)}: sem foto">${icone(obra.icone, 56)}</span>`}
    ${obra.foto ? `<p class="credito" data-credito="${obra.foto}"${obra.fotoNota ? ` data-nota="${esc(obra.fotoNota)}"` : ""}></p>` : ""}
    <ul class="caminho-lista">${c.itens
      .map((o, n) => `<li><button type="button" data-acao="obra" data-n="${n}" aria-pressed="${n === escolhida}">
        ${icone("camera", 18)}<span>${esc(o.nome)}</span></button></li>`)
      .join("")}</ul>`;
}

async function preencherCreditos(raiz = document) {
  const alvos = raiz.querySelectorAll("[data-credito]");
  if (!alvos.length) return;
  const creditos = await carregarCreditos();
  alvos.forEach((p) => { const c = creditos[p.dataset.credito]; if (c) p.innerHTML = textoCredito(c, p.dataset.nota); });
}

// ---------- Telas ----------

// Avisos da tela de início: antes da viagem, os marcados com "antes"; durante, só os de hoje e de amanhã.
function avisosDoInicio() {
  const h = hojeISO();
  if (h < R.inicio) return { titulo: "Atenção", textos: R.avisos.filter((a) => a.antes).map((a) => a.texto) };
  if (h > R.fim) return null;
  const deHoje = R.avisos.filter((a) => a.data === h && a.hoje).map((a) => a.hoje);
  const deAmanha = R.avisos.filter((a) => a.data === somaDias(h, 1) && a.amanha).map((a) => a.amanha);
  const titulo = deHoje.length && deAmanha.length ? "Hoje e amanhã" : deHoje.length ? "Hoje" : "Amanhã";
  return { titulo, textos: [...deHoje, ...deAmanha] };
}

function blocoAvisos() {
  const a = avisosDoInicio();
  if (!a || !a.textos.length) return "";
  return `<section class="secao">
      <div class="secao-topo"><h2>${a.titulo}</h2><a class="legenda" href="#/avisos">ver tudo</a></div>
      ${a.textos.map((t) => `<div class="caixa-aviso">${icone("alerta", 22)}<p>${negritarHoras(t)}</p></div>`).join("")}
    </section>`;
}

function blocoAntesDeIr() {
  const a = R.antesDeIr;
  return `<section class="secao">
      <div class="secao-topo"><h2>Antes de ir</h2><span class="legenda">${a.itens.length} para confirmar</span></div>
      <div class="caixa-aviso caixa-lista">
        ${a.itens
          .map((i) =>
            i.voo
              ? `<button type="button" class="pendencia pendencia-botao" data-acao="editar-voo">${icone("pendente", 18)}<span>${esc(i.texto)}</span>${icone("seta", 16)}</button>`
              : `<div class="pendencia">${icone("pendente", 18)}<span>${esc(i.texto)}</span></div>`,
          )
          .join("")}
      </div>
      <a class="botao" href="${esc(a.link.url)}" target="_blank" rel="noopener">${icone("externo", 18)} ${esc(a.link.texto)}</a>
    </section>
    <section class="secao">
      <div class="secao-topo"><h2>Para levar</h2><span class="legenda">junte antes de sair</span></div>
      <div class="chips">${R.paraLevar.map((t) => `<span class="chip chip-cor">${icone("mochila", 14)} ${esc(t)}</span>`).join("")}</div>
    </section>`;
}

function cardHotel() {
  const h = hotel();
  if (!h) {
    return `<div class="hotel cartao vazio">
        <div class="hotel-topo"><span class="bolinha">${icone("cama", 18)}</span><div><strong>Seu hotel</strong><span class="legenda">Nome e endereço ficam só neste celular.</span></div></div>
        <button type="button" class="botao" data-acao="editar-hotel">${icone("cama", 18)} Adicionar hotel</button>
      </div>`;
  }
  return `<div class="hotel cartao">
      <div class="hotel-topo"><span class="bolinha">${icone("cama", 18)}</span><div><strong>${esc(h.nome || "Seu hotel")}</strong><span class="legenda">${esc(h.endereco || "")}</span></div></div>
      <div class="botoes">
        <button type="button" class="botao" data-acao="copiar" data-texto="${esc(h.endereco || "")}">${icone("copiar", 18)} Copiar endereço</button>
        <a class="botao" href="${linkMapa(h.endereco || h.nome)}" target="_blank" rel="noopener">${icone("pino", 18)} Mapa</a>
      </div>
      <button type="button" class="link-editar" data-acao="editar-hotel">Editar dados do hotel</button>
    </div>`;
}

function blocoChegada(dia) {
  const c = dia.chegada;
  const h = hotel();
  return `<section class="secao">
      <div class="secao-topo"><h2>Ao chegar</h2><span class="legenda">${esc(c.legenda)}</span></div>
      ${cardHotel()}
      <a class="botao botao-cheio" href="${linkUber(h?.endereco || null)}" target="_blank" rel="noopener">${icone("carro", 20)} ${esc(c.uber)}</a>
      <div class="nota">${icone("panela", 22)}<p><strong>${esc(c.jantar.titulo)}</strong>${esc(c.jantar.texto)}</p></div>
      <a class="botao" href="${esc(c.jantar.url)}" target="_blank" rel="noopener">${icone("externo", 18)} ${esc(c.jantar.botao)}</a>
    </section>`;
}

// Hub "Suas andanças": o card de cada viagem e o convite para a próxima.
function telaHub() {
  const v = R.viagem;
  const h = hojeISO();
  const status = h < R.inicio ? contagem() : h <= R.fim ? `acontecendo agora · ${contagem()}` : "lembrança da viagem";
  const d = (iso) => iso.split("-").reverse().join("/");
  return `<header class="topo-simples">
      <img class="logo-marca" src="img/logo-andancas.svg" alt="Andanças" width="130" height="36">
      <h1>Suas andanças</h1>
    </header>
    <section class="secao">
      <a class="card-viagem cor-azulejo" href="#/viagem">
        <span class="chip chip-adesivo">aniversário de casamento</span>
        <strong>${esc(v.nome)}</strong>
        <span>${esc(v.onde)} · ${d(R.inicio)} a ${d(R.fim)}</span>
        <span class="card-viagem-rodape"><span class="trilha" aria-hidden="true"><i></i><i></i><i></i><b></b></span><span>${esc(status)}</span></span>
      </a>
      <div class="proxima"><strong>+ Próxima andança</strong><span class="legenda">em breve: guarde aqui o roteiro da próxima viagem</span></div>
    </section>`;
}

// Depois da viagem, o início vira lembrança: nome da viagem, números, os dias, o que vocês viram
// e o convite para a próxima andança (o app vai guardar todas as viagens).
function blocoLembranca(dias) {
  const v = R.viagem;
  const lugares = R.dias.flatMap((d) => lugaresDoDia(d).map((i) => ({ ...i, dia: d })));
  const feitas = paradasFeitas();
  const numeros = [[R.dias.length, "dias"], [v.cidades, "cidades"], [lugares.length, "lugares"]];
  if (feitas) numeros.push([feitas, "paradas feitas"]);
  const mosaico = v.lembranca.map(([diaId, itemId]) => lugares.find((l) => l.dia.id === diaId && l.id === itemId)).filter(Boolean);
  return `<section class="secao viagem-nome">
      <h2>${esc(v.nome)}</h2>
      <p class="legenda">${dataCurta(R.inicio)} – ${dataCurta(R.fim)} ${R.fim.slice(0, 4)} · ${esc(v.onde)}</p>
      <div class="numeros">${numeros.map(([n, l]) => `<div class="numero"><strong>${n}</strong><span>${l}</span></div>`).join("")}</div>
    </section>
    ${dias}
    <section class="secao">
      <h2>Scrapbook da viagem</h2>
      <a class="scrap-entrada" href="#/scrapbook">
        <span class="scrap-previa" aria-hidden="true">
          ${["igrejinha-pampulha", "sao-francisco-op", "narcissus"].map((f) => `<span class="polaroid"><img src="${foto(f)}" alt="" loading="lazy"></span>`).join("")}
          <span class="adesivo-mini">${icone("coracao", 13)} aniversário de casamento</span>
        </span>
        <span>Monte a colagem com as fotos de vocês, os lugares e os adesivos do app.</span>
        <span class="botao botao-cheio">Abrir scrapbook</span>
      </a>
    </section>
    <section class="secao">
      <div class="secao-topo"><h2>O que vocês viram</h2><span class="legenda">${lugares.length} lugares</span></div>
      <div class="mosaico">${mosaico
        .map((l) => `<button type="button" class="mosaico-foto" data-acao="lugar" data-dia="${l.dia.id}" data-id="${l.id}">
          <img src="${foto(l.foto)}" alt="" loading="lazy"><span>${esc(l.nome)}</span></button>`)
        .join("")}</div>
    </section>
    <section class="secao">
      <div class="proxima"><strong>+ Próxima andança</strong><span class="legenda">em breve: guarde aqui o roteiro da próxima viagem</span></div>
    </section>`;
}

function botaoTempo() {
  return `<button type="button" class="botao-tempo" data-acao="tempo" aria-label="Previsão do tempo">${icone("solNuvem", 24)}<span data-temp>--°</span></button>`;
}

function telaInicio() {
  const hoje = diaDeHoje();
  const antes = hojeISO() < R.inicio;
  const depois = hojeISO() > R.fim;

  const capa = `<div class="capa">
      <img src="${foto("capa")}" alt="Vista de Belo Horizonte">
      <span class="adesivo">${icone("coracao", 15)} aniversário de casamento</span>
      <span class="capa-local">${icone("pino", 14)} BH · Ouro Preto · Mariana · Inhotim</span>
    </div>`;

  const dias = `<section class="secao">
      <div class="secao-topo"><h2>Os dias</h2><span class="legenda">${dataCurta(R.inicio)} – ${dataCurta(R.fim)}</span></div>
      ${bolasDosDias(hoje ? hoje.id : null)}
    </section>`;

  // Durante a viagem: sem capa; o dia de hoje vem primeiro, com o botão para o roteiro.
  const corpo = hoje
    ? `<section class="secao secao-hoje">
        <a class="dia-grande cor-${hoje.cor}" href="#/dia/${hoje.id}">
          <img src="${foto(hoje.foto)}" alt="">
          <span class="chip">hoje</span>
          <span class="heroi-texto"><h2>${esc(hoje.titulo)}</h2><p>${esc(hoje.resumoInicio || hoje.resumo)}</p></span>
        </a>
      </section>
      ${dias}
      <section class="secao cor-${hoje.cor}"><a class="botao botao-cheio" href="#/dia/${hoje.id}">${icone("calendario", 20)} Ver o roteiro de hoje</a></section>
      ${hoje.voo ? `<section class="secao">${cardVoo(hoje.voo)}</section>` : ""}
      ${hoje.chegada ? blocoChegada(hoje) : ""}
      ${blocoAvisos()}`
    : depois
      ? `${capa}${blocoLembranca(dias)}`
      : `${capa}${dias}${antes ? blocoAntesDeIr() : ""}${blocoAvisos()}`;

  return `
    <header class="inicio-topo">
      <div class="inicio-titulo">
        <a class="link-hub" href="#/andancas">‹ Suas andanças</a>
        ${depois
          ? `<img class="logo-marca" src="img/logo-andancas.svg" alt="Andanças" width="150" height="41">`
          : `<span class="saudacao">Oi, vocês dois!</span><h1>${esc(R.titulo)}</h1>`}
        <span class="chip chip-aviso">${icone("ampulheta", 16)} ${esc(contagem())}</span>
      </div>
      ${depois ? "" : botaoTempo()}
    </header>
    ${corpo}
    <p class="creditos-link">${esc(R.subtitulo)}<br><a href="#/creditos">Créditos das fotos</a><br><span class="versao">versão ${VERSAO_APP}</span></p>`;
}

// Card do voo: só nos dias da ida e da volta (e na tela desses dois dias).
function cardVoo(aba) {
  estado.abaVoo = aba;
  const abas = `<div class="abas" role="group" aria-label="Ida ou volta">
        ${["ida", "volta"].map((a) => `<button type="button" data-acao="aba-voo" data-aba="${a}" aria-pressed="${a === aba}">${a === "ida" ? "Ida" : "Volta"}</button>`).join("")}
      </div>`;
  // Enquanto a pessoa não salvar o voo neste celular, o card fica vazio, com o convite para adicionar.
  if (!lerJSON(`voo:${aba}`)) {
    return `<div class="voo voo-vazio cor-azulejo" id="voo">
      <div class="voo-topo"><h2><span class="bolinha" style="width:36px;height:36px">${icone("decolar", 18)}</span>Seu voo</h2>${abas}</div>
      <div class="voo-convite">
        <span class="bolinha">${icone("aviao", 18)}</span>
        <strong>Adicione o voo de ${aba}</strong>
        <p class="legenda">Número, horários e aeroportos. Os dados ficam só neste celular.</p>
      </div>
      <button type="button" class="botao botao-cheio" data-acao="editar-voo" data-aba="${aba}">${icone("decolar", 20)} Adicionar voo</button>
    </div>`;
  }
  const v = vooDe(aba);
  const ponta = (p) => `<div class="rota-ponta">
      <span class="rota-cod${p.cod ? "" : " vazio"}">${p.cod ? esc(p.cod) : "???"}</span>
      <span class="rota-hora">${p.hora ? esc(p.hora) : "--h--"}</span>
      <span class="rota-cidade">${esc(p.cidade)}</span>
    </div>`;
  const d = dataDe(v.data);
  return `<div class="voo cor-azulejo" id="voo">
    <div class="voo-topo">
      <h2><span class="bolinha" style="width:36px;height:36px">${icone("decolar", 18)}</span>Seu voo</h2>
      <div class="abas" role="group" aria-label="Ida ou volta">
        ${["ida", "volta"].map((a) => `<button type="button" data-acao="aba-voo" data-aba="${a}" aria-pressed="${a === estado.abaVoo}">${a === "ida" ? "Ida" : "Volta"}</button>`).join("")}
      </div>
    </div>
    <div class="chips">
      <span class="chip">${SEMANA[d.getDay()].slice(0, 3).replace(/^./, (c) => c.toUpperCase())}, ${dataCurta(v.data)}</span>
      <span class="chip ${v.conexao === "a confirmar" ? "chip-aviso" : "chip-cor"}">${v.conexao === "a confirmar" ? "direto ou com conexão? a confirmar" : esc(textoConexao(v))}</span>
      ${v.numero ? `<span class="chip chip-borda">${esc(v.numero)}</span>` : ""}
    </div>
    <div class="rota">
      ${ponta(v.de)}
      <div class="rota-meio"><span class="bolinha">${icone("aviao", 18)}</span></div>
      ${ponta(v.para)}
    </div>
    <ul class="lista-detalhes">
      ${v.detalhes
        .map(
          (l) => `<li class="cor-${l.cor}">
            <span class="bolinha">${icone(l.icone, 16)}</span>
            <span>${esc(l.texto)}</span>
            <span class="chip chip-cor">${esc(l.icone === "conexao" ? textoConexao(v) : l.valor)}</span>
          </li>`,
        )
        .join("")}
    </ul>
    <a class="botao botao-cheio" href="${v.numero ? `https://www.flightradar24.com/data/flights/${encodeURIComponent(v.numero.replace(/\s+/g, ""))}` : v.acompanhar}" target="_blank" rel="noopener">${icone("radar", 20)} Acompanhar voo</a>
    <button type="button" class="link-editar" data-acao="editar-voo" data-aba="${aba}">Editar dados do voo</button>
  </div>`;
}

// ---------- Formulários (voo e hotel), guardados só neste celular ----------

function campo(nome, rotulo, valor, extra = "") {
  return `<label class="campo"><span>${esc(rotulo)}</span><input name="${nome}" value="${esc(valor || "")}" ${extra}></label>`;
}

function gavetaVoo(aba = "ida") {
  const v = vooDe(aba);
  const opcoes = ["a confirmar", "Direto", "Com conexão"];
  abrirGaveta(`<div class="gaveta-topo"><h2 id="gaveta-titulo">Dados do voo</h2>${botaoFechar()}</div>
    <div class="abas" role="group" aria-label="Ida ou volta">
      ${["ida", "volta"].map((a) => `<button type="button" data-acao="editar-voo" data-aba="${a}" aria-pressed="${a === aba}">${a === "ida" ? "Ida" : "Volta"}</button>`).join("")}
    </div>
    <form class="formulario" data-form="voo" data-aba="${aba}">
      ${campo("data", "Data", v.data, 'type="date" min="2026-01-01" max="2027-12-31"')}
      ${campo("numero", "Número do voo", v.numero, 'placeholder="ex.: AD 1234" autocomplete="off" autocapitalize="characters" maxlength="8" data-formato="voo"')}
      <div class="campos-dupla">${campo("deCod", "Sai de (aeroporto)", v.de.cod, 'placeholder="ex.: FOR" maxlength="3" autocapitalize="characters" data-formato="aeroporto"')}${campo("deHora", "Saída", v.de.hora, 'placeholder="ex.: 19h10" inputmode="numeric" maxlength="5" data-formato="hora"')}</div>
      ${campo("deCidade", "Cidade de saída", v.de.cidade === R.voo[aba].de.cidade && !R.voo[aba].de.cod ? "" : v.de.cidade)}
      <div class="campos-dupla">${campo("paraCod", "Chega em (aeroporto)", v.para.cod, 'placeholder="ex.: CNF" maxlength="3" autocapitalize="characters" data-formato="aeroporto"')}${campo("paraHora", "Chegada", v.para.hora, 'placeholder="ex.: 22h50" inputmode="numeric" maxlength="5" data-formato="hora"')}</div>
      ${campo("paraCidade", "Cidade de chegada", v.para.cidade === R.voo[aba].para.cidade && !R.voo[aba].para.cod ? "" : v.para.cidade)}
      <fieldset class="campo"><legend>Conexão</legend><div class="chips">
        ${opcoes.map((o) => `<label class="chip opcao"><input type="radio" name="conexao" value="${o}"${o === v.conexao ? " checked" : ""}> ${o === "a confirmar" ? "A confirmar" : o}</label>`).join("")}
      </div></fieldset>
      <div class="conexao-campos"${v.conexao === "Com conexão" ? "" : " hidden"}>
        <div class="campos-dupla">${campo("conexCod", "Aeroporto da conexão", v.conex.cod, 'placeholder="ex.: BSB" maxlength="3" autocapitalize="characters" data-formato="aeroporto"')}${campo("conexNumero", "Segundo voo", v.conex.numero, 'placeholder="ex.: AD 5678" autocomplete="off" autocapitalize="characters" maxlength="8" data-formato="voo"')}</div>
        <div class="campos-dupla">${campo("conexChega", "Chega na conexão", v.conex.chega, 'placeholder="ex.: 13h20" inputmode="numeric" maxlength="5" data-formato="hora"')}${campo("conexSai", "Sai da conexão", v.conex.sai, 'placeholder="ex.: 14h45" inputmode="numeric" maxlength="5" data-formato="hora"')}</div>
      </div>
      <div class="nota">${icone("info", 20)}<p>Fica só neste celular. Não vai para a internet.</p></div>
      <div class="botoes"><button type="button" class="botao" data-acao="fechar">Cancelar</button><button type="submit" class="botao botao-cheio">Salvar</button></div>
    </form>`, "azulejo");
}

function gavetaHotel() {
  const h = hotel() || {};
  abrirGaveta(`<div class="gaveta-topo"><h2 id="gaveta-titulo">Seu hotel</h2>${botaoFechar()}</div>
    <form class="formulario" data-form="hotel">
      ${campo("nome", "Nome do hotel", h.nome, 'autocomplete="off"')}
      ${campo("endereco", "Endereço", h.endereco, 'autocomplete="off"')}
      <div class="nota">${icone("info", 20)}<p>Fica só neste celular. O endereço é usado no Mapa e no Uber.</p></div>
      <div class="botoes"><button type="button" class="botao" data-acao="fechar">Cancelar</button><button type="submit" class="botao botao-cheio">Salvar</button></div>
    </form>`, "azulejo");
}

function salvarFormulario(form) {
  const dados = Object.fromEntries(new FormData(form).entries());
  for (const k of Object.keys(dados)) dados[k] = dados[k].trim();
  // Hora digitada pela metade vira hora cheia: "7" → "07h00", "19h3" → "19h30".
  for (const k of ["deHora", "paraHora", "conexChega", "conexSai"]) {
    const m = (dados[k] || "").match(/^(\d{1,2})(?:h(\d?))?$/);
    if (m) dados[k] = `${m[1].padStart(2, "0")}h${(m[2] || "0").padEnd(2, "0")}`;
  }
  if (form.dataset.form === "voo") guardar(`voo:${form.dataset.aba}`, JSON.stringify(dados));
  else guardar("hotel", JSON.stringify(dados));
  fecharGaveta();
  render();
}

function telaDia(dia, plano) {
  if (plano && cenariosDoDia(dia)?.opcoes.some((o) => o.id === plano)) guardar(`cenario:${dia.id}`, plano);
  const lugares = lugaresDoDia(dia).length;
  const cen = cenariosDoDia(dia);
  return `<div class="cor-${dia.cor}">
    <div class="heroi">
      <img src="${foto(dia.foto)}" alt="">
      <a class="redondo" href="${estado.origem || "#/viagem"}" aria-label="Voltar">${icone("voltar", 20)}</a>
      <div class="heroi-texto">
        <span class="heroi-data">${esc(dataLonga(dia.data))}</span>
        <h1>${esc(dia.titulo)}</h1>
        <div class="chips">
          ${lugares ? `<span class="chip chip-vidro">${lugares} lugares</span>` : ""}
          ${cen ? `<span class="chip chip-vidro">${cen.opcoes.length} planos de tempo</span>` : ""}
          ${dia.data === hojeISO() ? `<span class="chip" style="background:var(--adesivo);color:var(--tinta)">hoje</span>` : ""}
        </div>
      </div>
    </div>
    <div class="dias-barra">${bolasDosDias(dia.id)}</div>
    <p class="resumo">${esc(dia.resumo)}</p>
    ${dia.voo ? `<section class="secao">${cardVoo(dia.voo)}</section>` : ""}
    ${dia.chegada ? blocoChegada(dia) : ""}
    ${dia.blocos.map((b, n) => (BLOCOS[b.tipo] ? BLOCOS[b.tipo](dia, b, n) : "")).join("")}
  </div>`;
}

function telaDias() {
  const hoje = hojeISO();
  return `<header class="topo-simples"><span class="saudacao">${dataCurta(R.inicio)} – ${dataCurta(R.fim)}</span><h1>Os dias</h1></header>
    <section class="secao">
      ${R.dias
        .map(
          (d) => `<a class="dia-grande cor-${d.cor}" href="#/dia/${d.id}">
            <img src="${foto(d.foto)}" alt="" loading="lazy">
            ${d.data === hoje ? '<span class="chip">hoje</span>' : ""}
            <span class="heroi-texto">
              <span class="heroi-data">${esc(dataLonga(d.data))}</span>
              <h2>${esc(d.titulo)}</h2>
              <p>${esc(d.resumo)}</p>
            </span>
          </a>`,
        )
        .join("")}
    </section>`;
}

function telaAvisos() {
  const pend = pendencias();
  return `<header class="topo-simples"><span class="saudacao">O que pede atenção</span><h1>Avisos</h1></header>
    <section class="secao">
      ${R.avisos.map((a) => `<div class="caixa-aviso">${icone("alerta", 22)}<p>${negritarHoras(a.texto)}</p></div>`).join("")}
    </section>
    ${pend.length ? `<section class="secao">
      <h2>Falta confirmar</h2>
      <div class="cartao" style="padding:4px 16px">
        ${pend
          .map(
            (p) => `<div class="pendencia">${icone("pendente", 18)}<span>${esc(p.texto)}<br>
              <a class="legenda" href="#/dia/${p.dia.id}">${esc(p.dia.semana)}, ${esc(p.dia.titulo)}</a></span></div>`,
          )
          .join("")}
      </div>
    </section>` : ""}`;
}

function telaCreditos(creditos) {
  const itens = Object.entries(creditos);
  return `<header class="topo-simples"><span class="saudacao">Wikimedia Commons</span><h1>Créditos das fotos</h1></header>
    <section class="secao">
      <ul class="lista-regras">
        ${itens.length
          ? itens
              .map(
                ([nome, c]) => `<li>${icone("camera", 18)}<span><strong>${esc(nome)}</strong><br>
                  <a href="${esc(c.fonte)}" target="_blank" rel="noopener">${esc(c.autor)}</a>, ${esc(c.licenca)}</span></li>`,
              )
              .join("")
          : "<li>Não deu para carregar a lista agora.</li>"}
      </ul>
    </section>`;
}

// ---------- Gavetas ----------

const gaveta = document.querySelector(".gaveta");
const gavetaFundo = document.querySelector(".gaveta-fundo");
const gavetaConteudo = gaveta.querySelector(".gaveta-conteudo");
let gavetaAberta = false;
let focoAntes = null;

function abrirGaveta(html, cor) {
  gavetaConteudo.innerHTML = html;
  gaveta.className = `gaveta${cor ? ` cor-${cor}` : ""}`;
  if (!gavetaAberta) {
    focoAntes = document.activeElement;
    history.pushState({ gaveta: true }, "");
    gavetaAberta = true;
  }
  gaveta.hidden = false;
  gavetaFundo.hidden = false;
  document.body.classList.add("travado");
  gaveta.scrollTop = 0;
  gaveta.querySelector("[data-acao='fechar']")?.focus();
}

function fecharGaveta(peloHistorico = false) {
  if (!gavetaAberta) return;
  gavetaAberta = false;
  gaveta.hidden = true;
  gavetaFundo.hidden = true;
  document.body.classList.remove("travado");
  if (!peloHistorico) history.back();
  focoAntes?.focus?.();
}

function botaoFechar() {
  return `<button type="button" class="redondo" data-acao="fechar" aria-label="Fechar">${icone("fechar", 18)}</button>`;
}

async function gavetaLugar(diaId, itemId) {
  const dia = diaPorId(diaId);
  const item = dia && lugaresDoDia(dia).find((i) => i.id === itemId);
  if (!item) return;
  const creditos = item.foto ? await carregarCreditos() : {};
  const c = item.foto && creditos[item.foto];
  const g = item.guia || { sub: item.sub, chips: [], ver: [] };
  // Guia turístico do lugar. Dentro do Inhotim não tem Uber, só o mapa.
  const botoes = [];
  if (item.mapa) {
    botoes.push(`<a class="botao" href="${linkMapa(item.mapa)}" target="_blank" rel="noopener">${icone("pino", 20)} ${item.dentro ? "Ver no mapa do Inhotim" : "Mapa"}</a>`);
    if (!item.dentro) botoes.push(`<a class="botao botao-cheio" href="${linkUber(item.mapa)}" target="_blank" rel="noopener">${icone("carro", 20)} Chamar Uber</a>`);
  }
  abrirGaveta(
    `<div class="foto">${item.foto
      ? `<img src="${foto(item.foto)}" alt="${esc(item.nome)}">`
      : `<span class="foto-icone">${icone(item.icone, 64)}</span>`}${botaoFechar()}</div>
    <div class="guia-titulo">
      <h2 id="gaveta-titulo">${esc(item.nome)}</h2>
      <p class="legenda">${esc(g.sub)}</p>
    </div>
    ${g.chips.length ? `<div class="chips">${g.chips.map(([ic, t], n) => `<span class="chip ${n ? "chip-cor" : ""}">${icone(ic, 14)} ${esc(t)}</span>`).join("")}</div>` : ""}
    ${g.sobre ? `<p class="descricao">${esc(g.sobre)}</p>` : ""}
    ${g.ver.length ? `<div class="guia-ver"><h3>Não deixe de ver</h3>
      <ul class="lista-regras">${g.ver.map((t) => `<li>${icone("estrela", 18)}<span>${esc(t)}</span></li>`).join("")}</ul></div>` : ""}
    ${g.dica ? `<div class="nota">${icone("info", 22)}<p><strong>Dica</strong>${esc(g.dica)}</p></div>` : ""}
    ${botoes.length ? `<div class="botoes">${botoes.join("")}</div>` : ""}
    ${c ? `<p class="credito">${textoCredito(c, item.fotoNota)}</p>` : ""}`,
    dia.cor,
  );
}

// ---------- Tempo (Open-Meteo) ----------

function classificar(codigo, chance, noite) {
  let c;
  if (codigo >= 95) c = { grau: 4, palavra: "tempestade", icone: "raio" };
  else if (codigo >= 80) c = { grau: 3, palavra: "pancadas", icone: "nuvem" };
  else if (codigo >= 61) c = { grau: 3, palavra: "chuva", icone: "nuvem" };
  else if (codigo >= 51) c = { grau: 2, palavra: "garoa", icone: "nuvem" };
  else if (codigo >= 45) c = { grau: 1, palavra: "neblina", icone: "nublado" };
  else if (codigo === 3) c = { grau: 1, palavra: "nublado", icone: "nublado" };
  else if (codigo === 2) c = { grau: 0, palavra: noite ? "poucas nuvens" : "sol e nuvens", icone: noite ? "lua" : "solNuvem" };
  else c = { grau: 0, palavra: noite ? "céu limpo" : "sol", icone: noite ? "lua" : "sol" };
  // Chuva com pouca chance não vale o susto.
  if (c.grau >= 2 && c.grau < 4 && chance < 35) c = { grau: 1, palavra: "pode pingar", icone: "nublado" };
  return c;
}

async function previsao(dia) {
  const chave = `${dia.data}:${dia.local}`;
  if (estado.tempo[chave]) return estado.tempo[chave];
  const local = R.locais[dia.local] || R.locais.bh;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${local.lat}&longitude=${local.lon}`
    + `&hourly=weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min`
    + `&timezone=America%2FSao_Paulo&start_date=${dia.data}&end_date=${dia.data}`;
  // Sem internet: usa a última previsão guardada no celular, avisando de quando ela é.
  let j;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error("sem previsão");
    j = await r.json();
  } catch (e) {
    const salvo = lerJSON(`tempo:${chave}`);
    if (!salvo) throw e;
    estado.tempo[chave] = { ...salvo, offline: true };
    return estado.tempo[chave];
  }
  const horas = j.hourly.time.map((t, i) => ({ h: Number(t.slice(11, 13)), cod: j.hourly.weather_code[i], chance: j.hourly.precipitation_probability[i] ?? 0 }));
  const periodo = (nome, de, ate, noite) => {
    const trecho = horas.filter((x) => x.h >= de && x.h <= ate);
    const pior = trecho.reduce((a, x) => (classificar(x.cod, 100, noite).grau > classificar(a.cod, 100, noite).grau ? x : a), trecho[0]);
    const chance = Math.max(...trecho.map((x) => x.chance));
    return { nome, ...classificar(pior.cod, chance, noite) };
  };
  const p = {
    local: local.nome,
    max: Math.round(j.daily.temperature_2m_max[0]),
    min: Math.round(j.daily.temperature_2m_min[0]),
    periodos: [periodo("Manhã", 6, 11, false), periodo("Tarde", 12, 17, false), periodo("Noite", 18, 23, true)],
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h"),
  };
  estado.tempo[chave] = p;
  guardar(`tempo:${chave}`, JSON.stringify(p));
  return p;
}

function diaDoTempo() {
  // Antes da viagem, a previsão é a do dia da chegada: ainda não estamos em BH.
  return diaDeHoje() || R.dias[0];
}

function fraseTempo(periodos) {
  const [m, t, n] = periodos;
  if (m.palavra === t.palavra && t.palavra === n.palavra) return `${m.palavra} o dia todo`;
  return `${m.palavra} de manhã, ${t.palavra} à tarde, ${n.palavra} à noite`;
}

function planoParaOTempo(dia, p) {
  const grau = Math.max(p.periodos[0].grau, p.periodos[1].grau);
  const cen = cenariosDoDia(dia);
  if (cen) {
    const id = grau >= 4 ? "C" : grau >= 2 ? "B" : "A";
    const op = cen.opcoes.find((o) => o.id === id) || cen.opcoes[0];
    const titulo = id === "A" ? "Tempo firme." : "Tem plano pra isso.";
    return { texto: `<strong>${titulo}</strong> ${esc(op.descricao)}`, link: `#/dia/${dia.id}/${op.id}`, botao: `Ver plano ${op.nome}` };
  }
  if (grau >= 2 && dia.chuva) return { texto: `<strong>Tem plano pra isso.</strong> ${esc(dia.chuva)}`, link: `#/dia/${dia.id}`, botao: "Ver o dia" };
  return { texto: "<strong>Tempo bom.</strong> Segue o roteiro.", link: `#/dia/${dia.id}`, botao: "Ver o dia" };
}

async function gavetaTempo(diaId) {
  const dia = diaPorId(diaId) || diaDoTempo();
  const local = R.locais[dia.local] || R.locais.bh;
  const escolha = `<div class="tempo-dias" role="group" aria-label="Escolher o dia">
      ${R.dias.map((d) => `<button type="button" class="chip" data-acao="tempo" data-dia="${d.id}" aria-pressed="${d.id === dia.id}">${d.semana} ${dataDe(d.data).getDate()}</button>`).join("")}
    </div>`;
  const topo = `<div class="gaveta-topo">
      <div><span class="legenda" style="font-size:14px">${dia.data === hojeISO() ? "Tempo de hoje" : "Previsão"}</span>
      <h2 id="gaveta-titulo" style="font-size:26px">${esc(SEMANA[dataDe(dia.data).getDay()].replace(/^./, (c) => c.toUpperCase()))} em ${esc(local.nome)}</h2></div>
      ${botaoFechar()}
    </div>`;
  const links = `<div class="links-tempo">
      <a href="https://www.rainviewer.com/map.html?loc=${local.lat},${local.lon},9" target="_blank" rel="noopener">${icone("radar", 16)} Radar</a>
      <a href="https://alertas2.inmet.gov.br/" target="_blank" rel="noopener">${icone("alerta", 16)} Alertas oficiais</a>
    </div>`;

  abrirGaveta(`${topo}${escolha}<p class="carregando">Buscando a previsão…</p>${links}`);

  let corpo;
  try {
    const p = await previsao(dia);
    const plano = planoParaOTempo(dia, p);
    const classe = (x) => (x.grau >= 3 ? "forte" : x.grau === 0 ? "seco" : "");
    corpo = `<div class="tempo-resumo">
        <span class="bolinha">${icone(p.periodos[1].icone, 40)}</span>
        <div><strong>${p.max}°</strong><span>${esc(fraseTempo(p.periodos))} · mín ${p.min}°</span></div>
      </div>
      <ul class="periodos">
        ${p.periodos.map((x) => `<li class="${classe(x)}"><strong>${x.nome}</strong>${icone(x.icone, 26)}<span>${esc(x.palavra)}</span></li>`).join("")}
      </ul>
      <div class="plano">
        <div>${icone("ok", 22)}<p>${plano.texto}</p></div>
        <a class="botao" href="${plano.link}">${esc(plano.botao)}</a>
      </div>
      ${links}
      ${p.offline
        ? `<p class="caixa-aviso caixa-calma">${icone("info", 20)}<span>Sem internet agora. Esta é a previsão guardada, atualizada às ${p.hora}.</span></p>`
        : `<p class="credito">Previsão do <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>, buscada às ${p.hora}.</p>`}`;
  } catch (e) {
    corpo = `<p class="carregando">A previsão para este dia ainda não saiu, ou estamos sem internet. Quando o sinal voltar, ela aparece aqui.</p>${links}`;
  }
  if (gavetaAberta) abrirGaveta(`${topo}${escolha}${corpo}`);
}

async function atualizarBotaoTempo() {
  const alvo = app.querySelector("[data-temp]");
  if (!alvo) return;
  // O botão mostra sempre a data de hoje; fora da viagem, com o tempo de BH.
  const h = hojeISO();
  const dia = diaDeHoje() || { data: h, local: "bh" };
  const semana = SEMANA[dataDe(h).getDay()].slice(0, 3).replace(/^./, (c) => c.toUpperCase());
  const rotulo = `${semana} ${dataDe(h).getDate()}`;
  alvo.textContent = `${rotulo} · --°`;
  try {
    const p = await previsao(dia);
    alvo.textContent = `${rotulo} · ${p.max}°`;
    alvo.parentElement.setAttribute("aria-label", `Tempo de ${SEMANA[dataDe(dia.data).getDay()]} em ${p.local}: máxima de ${p.max} graus. Abrir previsão`);
  } catch (e) {
    alvo.textContent = `${rotulo} · tempo`;
  }
}

// ---------- Rotas ----------

function atualizarNav(rota, id) {
  const hoje = diaDeHoje();
  const nav = document.querySelectorAll(".nav a");
  const qtd = R.avisos.length + pendencias().length;
  nav[0].href = hoje ? `#/dia/${hoje.id}` : "#/viagem";
  nav[0].innerHTML = `${icone("sol", 18)} Hoje`;
  nav[1].innerHTML = `${icone("calendario", 18)} Dias`;
  nav[2].innerHTML = `${icone("alerta", 18)} Avisos${qtd ? ` <span class="contagem">${qtd}</span>` : ""}`;
  // Um dia que não é hoje pertence a "Dias"; o dia de hoje e o início, a "Hoje".
  const ativo = rota === "avisos" ? 2 : rota === "creditos" ? -1
    : rota === "dias" || (rota === "dia" && id !== hoje?.id) ? 1 : 0;
  nav.forEach((a, i) => (i === ativo ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
}

async function render() {
  if (gavetaAberta) fecharGaveta(true);
  const [, rota = "", id, plano] = location.hash.replace(/^#/, "").split("/");
  // A seta de voltar da tela do dia leva para a última tela fora dos dias (início, Os dias, Avisos).
  // Trocar de dia pela fileira não muda esse destino.
  if (rota !== "dia") estado.origem = rota === "" ? "#/viagem" : location.hash;
  let html;
  let titulo = `${R.titulo} · Andanças`;

  if (rota === "dia" && diaPorId(id)) {
    const dia = diaPorId(id);
    html = telaDia(dia, plano);
    titulo = `${dia.titulo} · ${R.titulo}`;
  } else if (rota === "dias") {
    html = telaDias();
    titulo = `Os dias · ${R.titulo}`;
  } else if (rota === "avisos") {
    html = telaAvisos();
    titulo = `Avisos · ${R.titulo}`;
  } else if (rota === "creditos") {
    html = telaCreditos(await carregarCreditos());
    titulo = `Créditos · ${R.titulo}`;
  } else if (rota === "scrapbook") {
    html = telaScrapbook();
    titulo = "Scrapbook · Andanças";
  } else if (rota === "andancas" || (rota === "" && !diaDeHoje())) {
    // Fora da viagem, o app abre no hub; durante a viagem, direto no "hoje".
    html = telaHub();
    titulo = "Suas andanças · Andanças";
  } else {
    html = telaInicio();
  }

  app.innerHTML = html;
  // No scrapbook a barra de navegação some: ela cobriria os botões de baixo (+ Foto, Salvar imagem).
  document.body.classList.toggle("sem-nav", rota === "scrapbook");
  if (rota === "scrapbook") iniciarScrapbook();
  document.title = titulo;
  atualizarNav(rota, id);

  if (plano && document.getElementById(`cenarios-${id}`)) {
    document.getElementById(`cenarios-${id}`).scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
  atualizarBotaoTempo();
  preencherCreditos(app);
}

// ---------- Eventos ----------

document.addEventListener("click", (ev) => {
  const ferramenta = ev.target.closest("[data-scrap]");
  if (ferramenta) { acaoScrapbook(ferramenta.dataset.scrap); return; }
  const alvo = ev.target.closest("[data-acao]");
  if (alvo) {
    const { acao, dia, id } = alvo.dataset;
    if (acao === "fechar") fecharGaveta();
    else if (acao === "lugar") gavetaLugar(dia, id);
    else if (acao === "tempo") gavetaTempo(dia);
    else if (acao === "aba-voo") {
      document.getElementById("voo").outerHTML = cardVoo(alvo.dataset.aba);
      document.querySelector(`[data-acao="aba-voo"][data-aba="${estado.abaVoo}"]`)?.focus();
    } else if (acao === "editar-voo") gavetaVoo(alvo.dataset.aba || estado.abaVoo || "ida");
    else if (acao === "editar-hotel") gavetaHotel();
    else if (acao === "scrap-adesivo") gavetaAdesivos();
    else if (acao === "scrap-colar") { colarAdesivo(Number(alvo.dataset.n)); desenharFolha(); }
    else if (acao === "scrap-salvar") salvarScrapbook(alvo);
    else if (acao === "scrap-montar") montarSozinho();
    else if (acao === "obra") {
      const cartao = alvo.closest(".caminho");
      const bloco = diaPorId(cartao.dataset.dia).blocos.find((x) => x.caminho);
      const n = Number(alvo.dataset.n);
      cartao.innerHTML = cartaoCaminho(bloco.caminho, n);
      preencherCreditos(cartao);
      cartao.querySelector(`[data-acao="obra"][data-n="${n}"]`)?.focus();
    }
    else if (acao === "feito") {
      const feito = alvo.getAttribute("aria-pressed") !== "true";
      guardar(id, feito ? "1" : "0");
      alvo.setAttribute("aria-pressed", String(feito));
      alvo.closest("li").classList.toggle("feito", feito);
    } else if (acao === "copiar") {
      const texto = alvo.dataset.texto;
      const pronto = () => { alvo.lastChild.textContent = " Copiado!"; setTimeout(() => (alvo.lastChild.textContent = " Copiar endereço"), 2000); };
      navigator.clipboard?.writeText(texto).then(pronto, () => prompt("Copie o endereço:", texto));
    } else if (acao === "cenario") {
      const d = diaPorId(dia);
      guardar(`cenario:${d.id}`, id);
      alvo.closest(".cenarios-corpo").innerHTML = blocoCenarios(d, cenariosDoDia(d), id);
      document.querySelector(`[data-acao="cenario"][data-id="${id}"]`)?.focus();
    }
    return;
  }
  if (ev.target === gavetaFundo) fecharGaveta();
});

// Carrossel com mouse: no celular o dedo já rola; no computador, arrastar com o mouse.
let arrasto = null;
document.addEventListener("pointerdown", (ev) => {
  const c = ev.target.closest(".carrossel");
  if (!c || ev.pointerType !== "mouse" || ev.button !== 0) return;
  arrasto = { c, x: ev.clientX, inicio: c.scrollLeft, moveu: false };
});
document.addEventListener("pointermove", (ev) => {
  if (!arrasto) return;
  const dx = ev.clientX - arrasto.x;
  if (Math.abs(dx) > 5 && !arrasto.moveu) {
    arrasto.moveu = true;
    arrasto.c.classList.add("arrastando");
  }
  if (arrasto.moveu) arrasto.c.scrollLeft = arrasto.inicio - dx;
});
document.addEventListener("pointerup", () => {
  if (!arrasto) return;
  const { c, moveu } = arrasto;
  arrasto = null;
  c.classList.remove("arrastando");
  // Depois de arrastar, o clique não abre o card.
  if (moveu) c.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); }, { capture: true, once: true });
});

// Campos do voo se formatam enquanto a pessoa digita: "ad1234" → "AD 1234", "gru" → "GRU", "1910" → "19h10".
const FORMATOS = {
  voo: (t) => {
    const s = t.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cia = s.match(/^[A-Z0-9]{2}/)?.[0] || s;
    const num = s.slice(cia.length).replace(/\D/g, "").slice(0, 4);
    return num ? `${cia} ${num}` : cia;
  },
  aeroporto: (t) => t.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3),
  hora: (t) => {
    let n = t.replace(/\D/g, "").slice(0, 4);
    if (n.length <= 2) return n;
    if (n.length === 3 && Number(n[0]) > 2) n = `0${n}`; // "910" → 09h10
    const h = Math.min(Number(n.slice(0, 2)), 23);
    const m = n.slice(2);
    return `${String(h).padStart(2, "0")}h${m.length === 2 ? String(Math.min(Number(m), 59)).padStart(2, "0") : m}`;
  },
};
// Os campos da conexão só aparecem quando a pessoa escolhe "Com conexão".
document.addEventListener("change", (ev) => {
  if (ev.target.name !== "conexao") return;
  const campos = ev.target.form?.querySelector(".conexao-campos");
  if (campos) campos.hidden = ev.target.value !== "Com conexão";
});

document.addEventListener("input", (ev) => {
  const f = FORMATOS[ev.target.dataset?.formato];
  if (!f || ev.inputType === "deleteContentBackward") return;
  ev.target.value = f(ev.target.value);
});

document.addEventListener("submit", (ev) => {
  const form = ev.target.closest("[data-form]");
  if (!form) return;
  ev.preventDefault();
  salvarFormulario(form);
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && gavetaAberta) fecharGaveta();
});

window.addEventListener("popstate", () => {
  if (gavetaAberta) fecharGaveta(true);
});

// Cada tela abre do topo; o navegador não restaura a rolagem antiga.
history.scrollRestoration = "manual";
window.addEventListener("hashchange", render);
render();

// Modo offline só no site publicado: em localhost o cache mostraria versões antigas durante os testes.
const local = ["localhost", "127.0.0.1"].includes(location.hostname);
if ("serviceWorker" in navigator && location.protocol === "https:" && !local) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// Abertura do Andanças: aparece ao abrir o app e some sozinha; não volta a cada troca de tela.
const abertura = document.getElementById("abertura");
if (abertura) {
  let jaViu = false;
  try { jaViu = sessionStorage.getItem("roteiro:abertura") === "1"; sessionStorage.setItem("roteiro:abertura", "1"); } catch (e) { /* tudo bem */ }
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tirar = () => { abertura.classList.add("saindo"); setTimeout(() => abertura.remove(), 500); };
  if (jaViu) abertura.remove();
  else setTimeout(tirar, calmo ? 600 : 1300);
  abertura.addEventListener("click", tirar);
}
