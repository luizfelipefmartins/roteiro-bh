// Scrapbook da viagem: colagem com as fotos do casal e adesivos do app.
// As fotos ficam só neste celular (IndexedDB); a posição de cada peça, no localStorage.
// "Salvar imagem" desenha a colagem num canvas e gera um PNG para guardar ou compartilhar.

const SCRAP = {
  chave: "scrapbook:pecas",
  proporcao: 600 / 358, // altura / largura da folha, como no Figma
  pecas: [],
  selecionada: null,
};

// ---------- Fotos no IndexedDB ----------

function bancoFotos() {
  return new Promise((ok, erro) => {
    const req = indexedDB.open("andancas", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("fotos");
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });
}

async function fotoGuardar(id, blob) {
  const db = await bancoFotos();
  // Guarda os bytes da foto (ArrayBuffer): algumas versões do Safari falham ao guardar Blob no IndexedDB.
  const dados = { buf: await blob.arrayBuffer(), tipo: blob.type || "image/jpeg" };
  await new Promise((ok, erro) => { const tx = db.transaction("fotos", "readwrite"); tx.objectStore("fotos").put(dados, id); tx.oncomplete = ok; tx.onerror = () => erro(tx.error); tx.onabort = () => erro(tx.error); });
}

async function fotoLer(id) {
  const db = await bancoFotos();
  return new Promise((ok) => {
    const r = db.transaction("fotos").objectStore("fotos").get(id);
    r.onsuccess = () => { const v = r.result; ok(!v ? null : v instanceof Blob ? v : new Blob([v.buf], { type: v.tipo })); };
    r.onerror = () => ok(null);
  });
}

async function fotoApagar(id) {
  const db = await bancoFotos();
  db.transaction("fotos", "readwrite").objectStore("fotos").delete(id);
}

// Reduz a foto (lado maior 1000 px) para não encher o espaço do celular.
async function reduzirFoto(arquivo) {
  const url = URL.createObjectURL(arquivo);
  const img = new Image();
  await new Promise((ok, erro) => { img.onload = ok; img.onerror = erro; img.src = url; });
  const k = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return { blob: await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.82)), proporcao: c.height / c.width };
}

// ---------- Adesivos (SVG, para a tela e para o PNG ficarem iguais) ----------

const FONTE = "DM Sans, system-ui, sans-serif";
const CORES_DIA = { azulejo: ["#DCE7FF", "#1A4396"], terracota: ["#FFE2D3", "#9A3412"], ouro: ["#FFF0C2", "#6E4B00"], mata: ["#D7F2E3", "#145234"] };

function escSvg(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Datas do carimbo a partir do roteiro: "30.10 — 03.11" e "MINAS · 2026".
function datasCarimbo() {
  const dm = (iso) => iso.slice(8, 10) + "." + iso.slice(5, 7);
  return [`${dm(R.inicio)} — ${dm(R.fim)}`, `${(R.viagem.regiao || "").toUpperCase()} · ${R.fim.slice(0, 4)}`];
}

// Fonte de "letra de mão" para post-its (Marker Felt e Noteworthy existem no iPhone).
const MAO = "Marker Felt, Noteworthy, Bradley Hand, Comic Sans MS, cursive";

// Quebra o texto em linhas de até "max" letras.
function quebrar(texto, max) {
  const linhas = [];
  for (const palavra of String(texto).split(" ")) {
    const ult = linhas[linhas.length - 1];
    if (ult && (ult + " " + palavra).length <= max) linhas[linhas.length - 1] = ult + " " + palavra;
    else linhas.push(palavra);
  }
  return linhas;
}

function linhasSVG(linhas, x, y0, passo, attrs) {
  return linhas.map((l, i) => `<text x="${x}" y="${y0 + i * passo}" ${attrs}>${escSvg(l)}</text>`).join("");
}

// Cada adesivo é um SVG, para a tela e o PNG ficarem iguais.
function adesivoSVG(p) {
  const [bg, cor] = CORES_DIA[p.cor] || CORES_DIA.azulejo;
  const t = p.texto || "";
  if (p.tipo === "aniversario") {
    const texto = `♥ ${t || R.viagem.motivo}`;
    const w = Math.round(30 + texto.length * 8.4);
    return { w, h: 40, svg: `<rect width="${w}" height="40" rx="12" fill="#FFD95A"/><text x="${w / 2}" y="26" font-family="${FONTE}" font-size="15" font-weight="700" fill="#2B2340" text-anchor="middle">${escSvg(texto)}</text>` };
  }
  if (p.tipo === "etiqueta") {
    const w = Math.round(28 + t.length * 8.2);
    return { w, h: 32, svg: `<rect width="${w}" height="32" rx="16" fill="${bg}"/><text x="${w / 2}" y="21" font-family="${FONTE}" font-size="14" font-weight="700" fill="${cor}" text-anchor="middle">${escSvg(t)}</text>` };
  }
  if (p.tipo === "selo") {
    // Selo postal com picote: as bordas são recortadas por bolinhas (máscara).
    const furos = [];
    for (let x = 6; x <= 98; x += 11.5) furos.push(`<circle cx="${x}" cy="0" r="4"/><circle cx="${x}" cy="124" r="4"/>`);
    for (let y = 6; y <= 118; y += 11.2) furos.push(`<circle cx="0" cy="${y}" r="4"/><circle cx="104" cy="${y}" r="4"/>`);
    const linhas = quebrar(t.toUpperCase(), 10);
    return { w: 104, h: 124, svg: `<mask id="picote"><rect width="104" height="124" fill="#fff"/><g fill="#000">${furos.join("")}</g></mask>`
      + `<rect width="104" height="124" fill="#fff" mask="url(#picote)"/><rect x="11" y="11" width="82" height="102" fill="${bg}"/>`
      + `<path d="M52 26c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14z" fill="${cor}"/><circle cx="52" cy="40" r="5" fill="${bg}"/>`
      + linhasSVG(linhas, 52, 82, 13, `font-family="${FONTE}" font-size="11.5" font-weight="800" fill="${cor}" text-anchor="middle"`)
      + `<text x="52" y="106" font-family="${FONTE}" font-size="8" font-weight="700" fill="${cor}" opacity=".7" text-anchor="middle">${escSvg(datasCarimbo()[1])}</text>` };
  }
  if (p.tipo === "bagagem") {
    // Etiqueta de bagagem de papel kraft, com o furo do barbante.
    const w = Math.max(150, Math.round(52 + (p.sub || "").length * 6.6));
    return { w, h: 64, svg: `<path d="M20 1 H${w - 1} V63 H20 L1 32 Z" fill="#E8C9A0" stroke="#C9A47A" stroke-width="2"/><circle cx="20" cy="32" r="5" fill="#FFF8EE" stroke="#C9A47A" stroke-width="2"/>`
      + `<text x="36" y="29" font-family="${FONTE}" font-size="20" font-weight="800" fill="#5A3B12">${escSvg(t.toUpperCase())}</text>`
      + `<text x="36" y="48" font-family="${FONTE}" font-size="11" font-weight="700" fill="#7A5524">${escSvg(p.sub || "")}</text>` };
  }
  if (p.tipo === "postit") {
    const linhas = quebrar(t, 12).slice(0, 4);
    return { w: 124, h: 116, svg: `<path d="M0 0 H124 V96 L104 116 H0 Z" fill="#FFEFA0"/><path d="M104 116 V96 H124 Z" fill="#E8D47C"/>`
      + linhasSVG(linhas, 12, 32, 22, `font-family="${MAO}" font-size="18" fill="#5A4A12"`) };
  }
  if (p.tipo === "pin") {
    const w = Math.round(46 + t.length * 7.8);
    return { w, h: 36, svg: `<rect x="1" y="1" width="${w - 2}" height="34" rx="17" fill="#fff" stroke="#EFE5D8" stroke-width="2"/>`
      + `<path d="M20 7c-5 0-9 4-9 9 0 7 9 14 9 14s9-7 9-14c0-5-4-9-9-9z" fill="#C2410C"/><circle cx="20" cy="16" r="3.2" fill="#fff"/>`
      + `<text x="36" y="23" font-family="${FONTE}" font-size="13" font-weight="700" fill="#2B2340">${escSvg(t)}</text>` };
  }
  if (p.tipo === "washi") {
    // Fita adesiva escrita, com as pontas picotadas.
    const w = Math.round(40 + t.length * 8);
    const zig = (x, dir) => Array.from({ length: 5 }, (_, i) => `${x + (i % 2 ? dir * 5 : 0)},${i * 7.5}`).join(" ");
    return { w, h: 30, svg: `<polygon points="${zig(0, 1)} ${zig(w, -1).split(" ").reverse().join(" ")}" fill="${bg}" opacity=".9"/>`
      + `<text x="${w / 2}" y="20" font-family="${MAO}" font-size="15" fill="${cor}" text-anchor="middle">${escSvg(t)}</text>` };
  }
  if (p.tipo === "coracao") {
    return { w: 64, h: 58, svg: `<path d="M32 56 C10 40 2 28 2 17 2 8 9 2 17 2 c7 0 12 4 15 10 3-6 8-10 15-10 8 0 15 6 15 15 0 11-8 23-30 39z" fill="#E5484D" stroke="#fff" stroke-width="3"/>` };
  }
  if (p.tipo === "estrela") {
    const pts = Array.from({ length: 24 }, (_, i) => { const r = i % 2 ? 34 : 48; const a = (i * Math.PI) / 12; return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`; }).join(" ");
    const linhas = quebrar(t || "uau!", 6).slice(0, 2);
    return { w: 100, h: 100, svg: `<polygon points="${pts}" fill="#FFD95A" stroke="#2B2340" stroke-width="2.5"/>`
      + linhasSVG(linhas, 50, linhas.length > 1 ? 47 : 56, 15, `font-family="${FONTE}" font-size="${linhas.length > 1 ? 12 : 17}" font-weight="800" fill="#2B2340" text-anchor="middle"`) };
  }
  if (p.tipo === "aviao") {
    return { w: 150, h: 64, svg: `<path d="M6 54 C40 60 70 10 118 18" fill="none" stroke="#2B2340" stroke-width="2.5" stroke-dasharray="6 6" stroke-linecap="round"/>`
      + `<g transform="translate(128 16) rotate(-15)"><path d="M-14 -2 L10 -2 L16 0 L10 2 L-14 2 Z M-2 -2 L-8 -12 L-4 -12 L6 -2 Z M-2 2 L-8 12 L-4 12 L6 2 Z M-12 -2 L-15 -7 L-12 -7 L-8 -2 Z M-12 2 L-15 7 L-12 7 L-8 2 Z" fill="#2459C4"/></g>` };
  }
  if (p.tipo === "sol") {
    const raios = Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<line x1="${(36 + 22 * Math.cos(a)).toFixed(1)}" y1="${(36 + 22 * Math.sin(a)).toFixed(1)}" x2="${(36 + 33 * Math.cos(a)).toFixed(1)}" y2="${(36 + 33 * Math.sin(a)).toFixed(1)}"/>`; }).join("");
    return { w: 72, h: 72, svg: `<g stroke="#F59E0B" stroke-width="4" stroke-linecap="round">${raios}</g><circle cx="36" cy="36" r="16" fill="#FFD95A" stroke="#F59E0B" stroke-width="3"/>` };
  }
  if (p.tipo === "bilhete") {
    const q = { titulo: "", texto: "", ...p };
    const w = Math.max(170, Math.round(28 + Math.max(q.titulo.length * 7.4, q.texto.length * 12.5)));
    return { w, h: 70, svg: `<rect x="1" y="1" width="${w - 2}" height="68" rx="12" fill="#fff" stroke="#EFE5D8" stroke-width="2" stroke-dasharray="5 4"/><text x="14" y="24" font-family="${FONTE}" font-size="11" font-weight="700" fill="#6B6480">${escSvg(q.titulo)}</text><text x="14" y="52" font-family="${FONTE}" font-size="22" font-weight="800" fill="#2B2340">${escSvg(q.texto)}</text>` };
  }
  if (p.tipo === "carimbo") {
    const [l1, l2] = datasCarimbo();
    return { w: 124, h: 124, svg: `<circle cx="62" cy="62" r="58" fill="none" stroke="#C2410C" stroke-width="4" opacity=".85"/><circle cx="62" cy="62" r="49" fill="none" stroke="#C2410C" stroke-width="1.5" opacity=".6"/><text x="62" y="60" font-family="${FONTE}" font-size="13.5" font-weight="700" fill="#C2410C" text-anchor="middle">${escSvg(l1)}</text><text x="62" y="80" font-family="${FONTE}" font-size="12" font-weight="700" fill="#C2410C" text-anchor="middle">${escSvg(l2)}</text>` };
  }
  // trilha da cedilha
  return { w: 120, h: 30, svg: `<g fill="#2B2340"><circle cx="8" cy="15" r="6"/><circle cx="30" cy="15" r="6"/><circle cx="52" cy="15" r="6"/><circle cx="74" cy="15" r="6"/></g><circle cx="102" cy="15" r="12" fill="#FFD95A" stroke="#2B2340" stroke-width="4"/>` };
}

function adesivoURL(p) {
  const a = adesivoSVG(p);
  return { ...a, url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${a.w}" height="${a.h}" viewBox="0 0 ${a.w} ${a.h}">${a.svg}</svg>`)}` };
}

// Adesivos gerados a partir do roteiro, para servir a qualquer andança. Cada tipo de informação ganha um formato:
// cidades viram selos postais; dias, etiquetas de bagagem ou post-its; lugares alternam etiqueta, alfinete e fita escrita.
function adesivosDaViagem() {
  const v = R.viagem;
  const corDe = (cidade) => (R.dias.find((d) => d.titulo.includes(cidade) || R.locais[d.local]?.nome === cidade) || R.dias[0]).cor;
  const bilhetes = R.dias.flatMap((d) => d.blocos.filter((b) => b.tipo === "ingresso").map((b) => {
    const [a, z] = b.itens.slice(-2);
    return { tipo: "bilhete", titulo: b.titulo.toUpperCase(), texto: `${a.hora} → ${z.hora}` };
  }));
  for (const aba of ["ida", "volta"]) {
    if (!lerJSON(`voo:${aba}`)) continue;
    const x = vooDe(aba);
    const ponta = aba === "ida" ? x.para : x.de;
    if (ponta.hora) bilhetes.push({ tipo: "bilhete", titulo: `${aba.toUpperCase()} · ${(ponta.cod || ponta.cidade || "").toUpperCase()}`, texto: `${ponta.hora} ✈` });
  }
  const cidades = v.onde.split(/, | e /).map((c) => ({ tipo: "selo", texto: c, cor: corDe(c) }));
  const dias = R.dias.map((d, i) => i % 2
    ? { tipo: "postit", texto: `${d.semana} ${Number(d.data.slice(8))}: ${d.titulo}` }
    : { tipo: "bagagem", texto: `${d.semana} ${Number(d.data.slice(8))}`, sub: d.titulo });
  const estilos = ["etiqueta", "pin", "washi"];
  const lugares = R.dias.flatMap((d) => lugaresDoDia(d)).map((l, i) => ({ tipo: estilos[i % 3], texto: l.nome, cor: R.dias.find((d) => lugaresDoDia(d).some((x) => x.id === l.id))?.cor }));
  const feitas = paradasFeitas();
  const selo = feitas ? [{ tipo: "estrela", texto: `${feitas} paradas` }] : [];
  const enfeites = [{ tipo: "coracao" }, { tipo: "estrela", texto: "uau!" }, { tipo: "aviao" }, { tipo: "sol" }, { tipo: "postit", texto: `${v.nome} ♥` }];
  return { base: [{ tipo: "aniversario", texto: v.motivo }, { tipo: "carimbo" }, { tipo: "trilha" }], bilhetes, cidades, dias, lugares, selo, enfeites };
}

function catalogoAdesivos() {
  const a = adesivosDaViagem();
  return [...a.base, ...a.enfeites, ...a.selo, ...a.bilhetes, ...a.cidades, ...a.dias, ...a.lugares];
}

// "Montar sozinho": espalha as fotos em leque pela folha e cola os adesivos da viagem entre elas.
function montarSozinho() {
  const fotos = SCRAP.pecas.filter((p) => p.tipo === "foto");
  const a = adesivosDaViagem();
  const sorte = (n) => Math.round((Math.random() * 2 - 1) * n);
  const vagasFotos = [[0.25, 0.13], [0.72, 0.15], [0.48, 0.3], [0.2, 0.42], [0.76, 0.44], [0.47, 0.58], [0.22, 0.72], [0.74, 0.74], [0.5, 0.86]];
  const novas = fotos.map((p, i) => {
    const [x, y] = vagasFotos[i % vagasFotos.length];
    return { ...p, x: x + sorte(3) / 100, y: y + sorte(3) / 100, rot: sorte(8), esc: fotos.length > 6 ? 0.85 : 1, fita: i % 3 };
  });
  const lembranca = R.viagem.lembranca.map(([d, id]) => a.lugares.find((l) => l.texto === lugaresDoDia(diaPorId(d)).find((x) => x.id === id)?.nome)).filter(Boolean);
  // Uma mistura de formatos: selos das cidades, uma etiqueta de bagagem, um post-it, enfeites e lugares.
  const mistura = [...a.selo, a.cidades[0], a.dias[0], a.cidades[1], lembranca[0], a.enfeites[0], lembranca[1], a.dias[1], a.enfeites[1], lembranca[2]].filter(Boolean);
  const vagas = [[0.14, 0.24], [0.86, 0.3], [0.5, 0.45], [0.86, 0.6], [0.16, 0.6], [0.62, 0.74], [0.4, 0.8], [0.12, 0.86], [0.66, 0.22], [0.35, 0.36]];
  const adesivos = [
    [{ tipo: "aniversario", texto: R.viagem.motivo }, 0.5, 0.05],
    [{ tipo: "carimbo" }, 0.82, 0.88],
    [{ tipo: "trilha" }, 0.3, 0.96],
    [a.enfeites[2], 0.6, 0.965],
    ...a.bilhetes.slice(0, 2).map((b, i) => [b, i ? 0.7 : 0.28, i ? 0.62 : 0.54]),
    ...mistura.slice(0, vagas.length).map((e, i) => [e, ...vagas[i]]),
  ].map(([dados, x, y], i) => ({ id: `m${i}${Date.now().toString(36)}`, ...dados, x, y, rot: sorte(8), esc: dados.tipo === "selo" || dados.tipo === "postit" ? 0.8 : 1 }));
  SCRAP.pecas = [...novas, ...adesivos];
  SCRAP.selecionada = null;
  salvarPecas();
  desenharFolha();
}

// ---------- Peças guardadas ----------

function carregarPecas() {
  const salvas = lerJSON(SCRAP.chave);
  // Primeira vez: a folha já começa com o adesivo, o carimbo e a trilha.
  SCRAP.pecas = Array.isArray(salvas) ? salvas : [
    { id: "a1", tipo: "aniversario", x: 0.5, y: 0.12, rot: -5, esc: 1 },
    { id: "a2", tipo: "carimbo", x: 0.78, y: 0.82, rot: 12, esc: 1 },
    { id: "a3", tipo: "trilha", x: 0.32, y: 0.92, rot: 0, esc: 1 },
  ];
}

function salvarPecas() {
  guardar(SCRAP.chave, JSON.stringify(SCRAP.pecas));
}

function novaPeca(dados) {
  const peca = { id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, x: 0.25 + Math.random() * 0.5, y: 0.2 + Math.random() * 0.55, rot: Math.round(Math.random() * 14 - 7), esc: 1, ...dados };
  SCRAP.pecas.push(peca);
  salvarPecas();
  return peca;
}

// ---------- Tela ----------

// Molduras tracejadas da folha vazia: tocar abre a galeria e a foto entra naquele lugar.
const VAGAS_VAZIA = [
  { left: 12, top: 24, rot: -5, x: 0.31, y: 0.334 },
  { left: 54, top: 27, rot: 6, x: 0.73, y: 0.364 },
  { left: 28, top: 52, rot: 3, x: 0.47, y: 0.614 },
];

function telaScrapbook() {
  return `<header class="topo-simples">
      <a class="link-hub" href="#/viagem">‹ Lembrança</a>
      <h1>Scrapbook</h1>
      <span class="legenda">Monte a colagem da viagem com as suas fotos.</span>
    </header>
    <section class="secao">
      <ul class="scrap-dicas" aria-label="Como mexer nas peças">
        <li><b>☝</b> Arraste para mover</li>
        <li><b>✌</b> Dois dedos: girar e mudar o tamanho</li>
        <li><b>👆</b> Toque numa peça para mais opções</li>
      </ul>
      <div class="folha" id="folha" aria-label="Colagem da viagem"></div>
      <div class="scrap-ferramentas" id="scrap-ferramentas" hidden>
        <p class="legenda">Peça selecionada</p>
        <div class="scrap-botoes">
          <button type="button" data-scrap="girar-"><span aria-hidden="true">↺</span>Girar</button>
          <button type="button" data-scrap="girar+"><span aria-hidden="true">↻</span>Girar</button>
          <button type="button" data-scrap="menor"><span aria-hidden="true">−</span>Menor</button>
          <button type="button" data-scrap="maior"><span aria-hidden="true">+</span>Maior</button>
          <button type="button" data-scrap="frente"><span aria-hidden="true">⬆</span>Na frente</button>
          <button type="button" data-scrap="tirar" class="perigo"><span aria-hidden="true">✕</span>Tirar</button>
        </div>
      </div>
      <button type="button" class="botao botao-montar" data-acao="scrap-montar">✨ Montar sozinho com os adesivos da viagem</button>
      <div class="scrap-acoes">
        <label class="botao botao-arquivo">+ Foto<input type="file" accept="image/*" multiple id="scrap-foto" aria-label="Adicionar fotos"></label>
        <button type="button" class="botao" data-acao="scrap-adesivo">+ Adesivo</button>
        <button type="button" class="botao botao-cheio" data-acao="scrap-salvar">Salvar imagem</button>
      </div>
      <p class="scrap-aviso" id="scrap-aviso" role="status" hidden></p>
      <p class="legenda" style="text-align:center">Fica só neste celular. Salve a imagem para guardar.</p>
    </section>`;
}

// Endereço de cada foto já lida do IndexedDB, para não reler todas a cada mudança.
SCRAP.urls = {};

async function urlDaFoto(id) {
  if (SCRAP.urls[id]) return SCRAP.urls[id];
  const blob = await fotoLer(id);
  if (!blob) return null;
  SCRAP.urls[id] = URL.createObjectURL(blob);
  return SCRAP.urls[id];
}

// Largura da peça em % da folha: foto 42%; adesivo pelo tamanho do desenho.
function larguraPeca(p) {
  return p.tipo === "foto" ? 42 * p.esc : (adesivoSVG(p).w / 358) * 100 * p.esc;
}

function posicionar(el, p) {
  el.style.width = `${larguraPeca(p)}%`;
  el.style.left = `${p.x * 100}%`;
  el.style.top = `${p.y * 100}%`;
  el.style.transform = `translate(-50%, -50%) rotate(${p.rot}deg)`;
}

async function desenharFolha() {
  const folha = document.getElementById("folha");
  if (!folha) return;
  const pedaco = document.createDocumentFragment();
  for (const p of SCRAP.pecas) {
    const el = document.createElement("div");
    el.className = `peca peca-${p.tipo}${SCRAP.selecionada === p.id ? " selecionada" : ""}`;
    el.dataset.id = p.id;
    if (p.tipo === "foto") {
      const u = await urlDaFoto(p.foto);
      if (!u) continue;
      el.innerHTML = `<span class="fita fita-${p.fita || 0}"></span><img src="${u}" alt="Foto da viagem">`;
    } else {
      el.innerHTML = `<img src="${adesivoURL(p).url}" alt="">`;
    }
    posicionar(el, p);
    pedaco.appendChild(el);
  }
  folha.innerHTML = "";
  if (!SCRAP.pecas.some((p) => p.tipo === "foto")) {
    folha.insertAdjacentHTML("afterbegin", VAGAS_VAZIA.map((v, i) => `<label for="scrap-foto" class="espaco-foto" data-vaga="${i}" style="left:${v.left}%;top:${v.top}%;--rot:${v.rot}deg" aria-label="Adicionar foto aqui">+</label>`).join(""));
    folha.insertAdjacentHTML("beforeend", `<p class="folha-vazia">Toque em <strong>+</strong> ou em <strong>+ Foto</strong> para começar.</p>`);
  }
  folha.appendChild(pedaco);
  document.getElementById("scrap-ferramentas").hidden = !SCRAP.selecionada;
}

function avisoScrap(texto) {
  const p = document.getElementById("scrap-aviso");
  if (!p) return;
  p.textContent = texto;
  p.hidden = !texto;
}

function iniciarScrapbook() {
  carregarPecas();
  SCRAP.selecionada = null;
  SCRAP.vaga = null;
  desenharFolha();
  const folha = document.getElementById("folha");
  const toques = new Map();
  let arrasto = null;
  let gesto = null;
  const medir = () => {
    const [a, b] = [...toques.values()];
    return { d: Math.hypot(b.x - a.x, b.y - a.y), ang: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
  };
  // Moldura tracejada: guarda o lugar para a próxima foto e deixa o <label> abrir a galeria.
  folha.addEventListener("click", (ev) => {
    const vaga = ev.target.closest(".espaco-foto");
    if (vaga) SCRAP.vaga = VAGAS_VAZIA[Number(vaga.dataset.vaga)];
  });
  folha.addEventListener("pointerdown", (ev) => {
    if (ev.target.closest(".espaco-foto")) return;
    toques.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    // Segundo dedo: começa a girar e mudar o tamanho da peça que está sendo segurada.
    if (toques.size === 2 && arrasto) {
      const m = medir();
      gesto = { ...m, esc0: arrasto.p.esc, rot0: arrasto.p.rot };
      arrasto.moveu = true;
      return;
    }
    const el = ev.target.closest(".peca");
    if (!el) {
      if (toques.size === 1 && SCRAP.selecionada) { SCRAP.selecionada = null; desenharFolha(); }
      return;
    }
    const r = folha.getBoundingClientRect();
    const p = SCRAP.pecas.find((x) => x.id === el.dataset.id);
    arrasto = { p, el, r, x0: ev.clientX, y0: ev.clientY, dx: ev.clientX - (r.left + p.x * r.width), dy: ev.clientY - (r.top + p.y * r.height), moveu: false };
    try { folha.setPointerCapture(ev.pointerId); } catch (e) { /* tudo bem */ }
    ev.preventDefault();
  });
  folha.addEventListener("pointermove", (ev) => {
    if (!toques.has(ev.pointerId)) return;
    toques.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (!arrasto) return;
    const { p, el, r } = arrasto;
    if (gesto && toques.size >= 2) {
      const m = medir();
      p.esc = Math.min(2.6, Math.max(0.35, gesto.esc0 * (m.d / gesto.d)));
      p.rot = Math.round(gesto.rot0 + (m.ang - gesto.ang));
      posicionar(el, p);
      return;
    }
    if (gesto) return;
    p.x = Math.min(1, Math.max(0, (ev.clientX - arrasto.dx - r.left) / r.width));
    p.y = Math.min(1, Math.max(0, (ev.clientY - arrasto.dy - r.top) / r.height));
    posicionar(el, p);
    if (Math.hypot(ev.clientX - arrasto.x0, ev.clientY - arrasto.y0) > 4) arrasto.moveu = true;
  });
  const soltar = (ev) => {
    toques.delete(ev.pointerId);
    if (!arrasto) return;
    if (gesto) {
      if (toques.size < 2) { gesto = null; arrasto = null; toques.clear(); salvarPecas(); }
      return;
    }
    const { p, moveu } = arrasto;
    arrasto = null;
    if (moveu) salvarPecas();
    else { SCRAP.selecionada = SCRAP.selecionada === p.id ? null : p.id; desenharFolha(); }
  };
  folha.addEventListener("pointerup", soltar);
  folha.addEventListener("pointercancel", soltar);
  document.getElementById("scrap-foto").addEventListener("change", async (ev) => {
    const arquivos = [...ev.target.files];
    ev.target.value = "";
    if (!arquivos.length) return;
    let falhas = 0;
    // Uma foto por vez, aparecendo na folha assim que fica pronta.
    for (const [i, arquivo] of arquivos.entries()) {
      avisoScrap(arquivos.length > 1 ? `Colando ${i + 1} de ${arquivos.length}…` : "Colando a foto…");
      try {
        const { blob } = await reduzirFoto(arquivo);
        const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
        await fotoGuardar(id, blob);
        SCRAP.urls[id] = URL.createObjectURL(blob);
        const lugar = SCRAP.vaga ? { x: SCRAP.vaga.x, y: SCRAP.vaga.y, rot: SCRAP.vaga.rot } : {};
        SCRAP.vaga = null;
        novaPeca({ tipo: "foto", foto: id, fita: Math.floor(Math.random() * 3), ...lugar });
        await desenharFolha();
      } catch (e) {
        falhas++;
      }
    }
    avisoScrap(falhas
      ? `Não deu para guardar ${falhas > 1 ? `${falhas} fotos` : "uma foto"} neste celular. Se estiver numa aba anônima, abra fora dela e tente de novo.`
      : "");
  });
}

function acaoScrapbook(acao) {
  const p = SCRAP.pecas.find((x) => x.id === SCRAP.selecionada);
  if (!p) return;
  if (acao === "girar-") p.rot -= 8;
  else if (acao === "girar+") p.rot += 8;
  else if (acao === "menor") p.esc = Math.max(0.4, p.esc - 0.15);
  else if (acao === "maior") p.esc = Math.min(2.2, p.esc + 0.15);
  else if (acao === "frente") { SCRAP.pecas = SCRAP.pecas.filter((x) => x !== p); SCRAP.pecas.push(p); }
  else if (acao === "tirar") {
    SCRAP.pecas = SCRAP.pecas.filter((x) => x !== p);
    if (p.tipo === "foto") fotoApagar(p.foto);
    SCRAP.selecionada = null;
  }
  salvarPecas();
  desenharFolha();
}

function gavetaAdesivos() {
  abrirGaveta(`<div class="gaveta-topo"><h2 id="gaveta-titulo">Adesivos</h2>${botaoFechar()}</div>
    <p class="legenda">Toque para colar na folha.</p>
    <div class="adesivos">${catalogoAdesivos()
      .map((a, n) => `<button type="button" class="adesivo-opcao" data-acao="scrap-colar" data-n="${n}"><img src="${adesivoURL(a).url}" alt="${escSvg(a.texto || a.tipo)}"></button>`)
      .join("")}</div>`);
}

function colarAdesivo(n) {
  const a = catalogoAdesivos()[n];
  if (!a) return;
  SCRAP.selecionada = novaPeca({ ...a }).id;
  fecharGaveta();
}

// ---------- Salvar como imagem ----------

async function salvarScrapbook(botao) {
  botao.disabled = true;
  const W = 1074;
  const H = Math.round(W * SCRAP.proporcao);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#F5EEE4";
  g.fillRect(0, 0, W, H);
  const carregar = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  const FITAS = ["rgba(255,217,90,.75)", "rgba(169,194,245,.75)", "rgba(154,221,184,.75)"];
  for (const p of SCRAP.pecas) {
    g.save();
    g.translate(p.x * W, p.y * H);
    g.rotate((p.rot * Math.PI) / 180);
    if (p.tipo === "foto") {
      const blob = await fotoLer(p.foto);
      if (!blob) { g.restore(); continue; }
      const u = URL.createObjectURL(blob);
      const img = await carregar(u);
      URL.revokeObjectURL(u);
      if (!img) { g.restore(); continue; }
      const w = W * 0.42 * p.esc;
      const ih = w * (img.naturalHeight / img.naturalWidth);
      const borda = w * 0.05;
      const h = ih + borda * 2;
      g.shadowColor = "rgba(43,35,64,.18)";
      g.shadowBlur = 24;
      g.shadowOffsetY = 8;
      g.fillStyle = "#fff";
      g.fillRect(-w / 2 - borda, -h / 2, w + borda * 2, h);
      g.shadowColor = "transparent";
      g.drawImage(img, -w / 2, -h / 2 + borda, w, ih);
      g.fillStyle = FITAS[p.fita || 0];
      g.fillRect(-w * 0.2, -h / 2 - 18, w * 0.4, 36);
    } else {
      const a = adesivoURL(p);
      const img = await carregar(a.url);
      if (img) {
        const w = (a.w / 358) * W * p.esc;
        const h = w * (a.h / a.w);
        g.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
    g.restore();
  }
  const blob = await new Promise((ok) => c.toBlob(ok, "image/png"));
  const nome = "andancas-roteiro-mineiro-a-dois.png";
  const arquivo = new File([blob], nome, { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [arquivo] })) await navigator.share({ files: [arquivo], title: "Roteiro Mineiro a Dois" });
    else throw new Error("sem compartilhar");
  } catch (e) {
    if (e?.name !== "AbortError") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nome;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
  }
  botao.disabled = false;
}
