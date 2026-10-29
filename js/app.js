// Site do roteiro: telas montadas a partir de ROTEIRO (js/dados.js).
// Rotas: #/  ·  #/dia/<id>[/<plano>]  ·  #/dias  ·  #/avisos  ·  #/creditos
// Para testar outra data: ?hoje=2026-10-31

const R = ROTEIRO;
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

function lugaresDoDia(dia) {
  return dia.blocos.filter((b) => b.tipo === "cards" || b.tipo === "galerias").flatMap((b) => b.itens);
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

function textoCredito(c) {
  return `Foto: <a href="${esc(c.fonte)}" target="_blank" rel="noopener">${esc(c.autor)}</a>, ${esc(c.licenca)}, Wikimedia Commons`;
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
    const destino = typeof item.uber === "string" ? item.uber : null;
    botoes.push(`<a class="botao-mini" href="${linkUber(destino)}" target="_blank" rel="noopener">${icone("carro", 16)} Chamar Uber</a>`);
  }
  return botoes.length ? `<div class="acoes">${botoes.join("")}</div>` : "";
}

function linhaDoTempo(itens) {
  return `<ol class="linha-tempo">${itens
    .map(
      (i) => `<li${i.destaque ? ' class="destaque"' : ""}>
        <span class="hora">${esc(i.hora)}</span>
        <div class="texto"><span>${esc(i.texto)}</span>${acoesDoItem(i)}</div>
      </li>`,
    )
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
    ${atual.alerta ? `<div class="caixa-aviso">${icone("alerta", 22)}<p>${esc(atual.alerta)}</p></div>` : ""}
    ${linhaDoTempo(atual.itens)}`;
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

const BLOCOS = {
  linha: (dia, b) => `<section class="secao"><h2>${esc(b.titulo)}</h2>${linhaDoTempo(b.itens)}</section>`,

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
      ${b.volta ? `<div class="caixa-aviso">${icone("relogio", 22)}<p>${negritarHoras(b.volta)}</p></div>` : ""}
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
      <div class="cartao caminho">
        ${b.caminho.foto ? `<img src="${foto(b.caminho.foto)}" alt="" loading="lazy">` : ""}
        <ul class="lista-regras">${b.caminho.itens.map((t) => `<li>${icone("camera", 18)}<span>${esc(t)}</span></li>`).join("")}</ul>
      </div>
    </section>` : ""}`,
};

// ---------- Telas ----------

function telaInicio() {
  const hoje = diaDeHoje();
  const depois = hojeISO() > R.fim;
  const avisos = R.avisos.map((a) => `<div class="caixa-aviso">${icone("alerta", 22)}<p>${negritarHoras(a.texto)}</p></div>`).join("");

  return `
    <header class="inicio-topo">
      <div>
        <span class="saudacao">Oi, vocês dois!</span>
        <h1>${esc(R.titulo)}</h1>
      </div>
      <div class="topo-direita">
        <span class="chip chip-aviso">${icone("ampulheta", 16)} ${esc(contagem())}</span>
        ${depois ? "" : `<button type="button" class="botao-tempo" data-acao="tempo" aria-label="Previsão do tempo">${icone("solNuvem", 24)}<span data-temp>--°</span></button>`}
      </div>
    </header>

    <div class="capa">
      <img src="${foto("capa")}" alt="Vista de Belo Horizonte">
      <span class="adesivo">${icone("coracao", 15)} aniversário de casamento</span>
      <span class="capa-local">${icone("pino", 14)} BH · Ouro Preto · Mariana · Inhotim</span>
    </div>

    ${hoje ? `<section class="secao">
      <a class="dia-grande cor-${hoje.cor}" href="#/dia/${hoje.id}">
        <img src="${foto(hoje.foto)}" alt="">
        <span class="chip">hoje</span>
        <span class="heroi-texto"><h2>${esc(hoje.titulo)}</h2><p>${esc(hoje.resumo)}</p></span>
      </a>
    </section>` : ""}

    <section class="secao">
      <div class="secao-topo"><h2>Os dias</h2><span class="legenda">${dataCurta(R.inicio)} – ${dataCurta(R.fim)}</span></div>
      ${bolasDosDias(hoje ? hoje.id : null)}
    </section>

    <section class="secao">${cardVoo()}</section>

    ${avisos ? `<section class="secao"><div class="secao-topo"><h2>Atenção</h2><a class="legenda" href="#/avisos">ver tudo</a></div>${avisos}</section>` : ""}

    <p class="creditos-link">${esc(R.subtitulo)}<br><a href="#/creditos">Créditos das fotos</a></p>`;
}

function cardVoo() {
  if (!estado.abaVoo) estado.abaVoo = hojeISO() > R.voo.ida.data ? "volta" : "ida";
  const v = R.voo[estado.abaVoo];
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
      ${v.conexao ? `<span class="chip chip-aviso">${esc(v.conexao)}</span>` : ""}
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
            <span class="chip chip-cor">${esc(l.valor)}</span>
          </li>`,
        )
        .join("")}
    </ul>
    <a class="botao botao-cheio" href="${v.acompanhar}" target="_blank" rel="noopener">${icone("radar", 20)} Acompanhar voo</a>
  </div>`;
}

function telaDia(dia, plano) {
  if (plano && cenariosDoDia(dia)?.opcoes.some((o) => o.id === plano)) guardar(`cenario:${dia.id}`, plano);
  const lugares = lugaresDoDia(dia).length;
  const cen = cenariosDoDia(dia);
  return `<div class="cor-${dia.cor}">
    <div class="heroi">
      <img src="${foto(dia.foto)}" alt="">
      <a class="redondo" href="#/" aria-label="Voltar ao início">${icone("voltar", 20)}</a>
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
    ${dia.blocos.map((b) => (BLOCOS[b.tipo] ? BLOCOS[b.tipo](dia, b) : "")).join("")}
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
  const h = horaDe(dia, item.nome);
  const botoes = [];
  if (item.mapa) {
    botoes.push(`<a class="botao" href="${linkMapa(item.mapa)}" target="_blank" rel="noopener">${icone("pino", 20)} Mapa</a>`);
    botoes.push(`<a class="botao botao-cheio" href="${linkUber(item.mapa)}" target="_blank" rel="noopener">${icone("carro", 20)} Chamar Uber</a>`);
  }
  abrirGaveta(
    `${item.foto
      ? `<div class="foto"><img src="${foto(item.foto)}" alt="${esc(item.nome)}">${botaoFechar()}</div>`
      : `<div class="gaveta-topo"><span class="bolinha" style="width:64px;height:64px;border-radius:20px">${icone(item.icone, 32)}</span>${botaoFechar()}</div>`}
    <div class="chips">
      <span class="chip chip-borda">${esc(dia.semana)}, ${esc(dia.titulo)}</span>
      ${h ? `<span class="chip chip-cor">${esc(h.hora)}${h.plano ? ` no plano ${esc(h.plano)}` : ""}</span>` : ""}
      ${item.aoAr ? `<span class="chip chip-aviso">${icone("sol", 14)} ao ar livre</span>` : ""}
    </div>
    <h2 id="gaveta-titulo">${esc(item.nome)}</h2>
    <p class="descricao">${esc(item.sub)}</p>
    ${botoes.length ? `<div class="botoes">${botoes.join("")}</div>` : ""}
    ${c ? `<p class="credito">${textoCredito(c)}</p>` : ""}`,
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
  const r = await fetch(url);
  if (!r.ok) throw new Error("sem previsão");
  const j = await r.json();
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
  return p;
}

function diaDoTempo() {
  return diaDeHoje() || R.dias.find((d) => d.data >= hojeISO() && cenariosDoDia(d)) || R.dias[0];
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
      <p class="credito">Previsão do <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>, buscada às ${p.hora}.</p>`;
  } catch (e) {
    corpo = `<p class="carregando">A previsão para este dia ainda não saiu, ou estamos sem internet. O radar e os alertas abrem no navegador.</p>${links}`;
  }
  if (gavetaAberta) abrirGaveta(`${topo}${escolha}${corpo}`);
}

async function atualizarBotaoTempo() {
  const alvo = app.querySelector("[data-temp]");
  if (!alvo) return;
  const dia = diaDoTempo();
  try {
    const p = await previsao(dia);
    alvo.textContent = `${p.max}°`;
    alvo.parentElement.setAttribute("aria-label", `Tempo de ${SEMANA[dataDe(dia.data).getDay()]} em ${p.local}: máxima de ${p.max} graus. Abrir previsão`);
  } catch (e) {
    alvo.textContent = "tempo";
  }
}

// ---------- Rotas ----------

function atualizarNav(rota, id) {
  const hoje = diaDeHoje();
  const nav = document.querySelectorAll(".nav a");
  const qtd = R.avisos.length + pendencias().length;
  nav[0].href = hoje ? `#/dia/${hoje.id}` : "#/";
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
  let html;
  let titulo = R.titulo;

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
  } else {
    html = telaInicio();
  }

  app.innerHTML = html;
  document.title = titulo;
  atualizarNav(rota, id);

  if (plano && document.getElementById(`cenarios-${id}`)) {
    document.getElementById(`cenarios-${id}`).scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
  atualizarBotaoTempo();
}

// ---------- Eventos ----------

document.addEventListener("click", (ev) => {
  const alvo = ev.target.closest("[data-acao]");
  if (alvo) {
    const { acao, dia, id } = alvo.dataset;
    if (acao === "fechar") fecharGaveta();
    else if (acao === "lugar") gavetaLugar(dia, id);
    else if (acao === "tempo") gavetaTempo(dia);
    else if (acao === "aba-voo") {
      estado.abaVoo = alvo.dataset.aba;
      document.getElementById("voo").outerHTML = cardVoo();
      document.querySelector(`[data-acao="aba-voo"][data-aba="${estado.abaVoo}"]`)?.focus();
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

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
