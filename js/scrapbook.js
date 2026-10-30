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
  await new Promise((ok, erro) => { const tx = db.transaction("fotos", "readwrite"); tx.objectStore("fotos").put(blob, id); tx.oncomplete = ok; tx.onerror = () => erro(tx.error); });
}

async function fotoLer(id) {
  const db = await bancoFotos();
  return new Promise((ok) => { const r = db.transaction("fotos").objectStore("fotos").get(id); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); });
}

async function fotoApagar(id) {
  const db = await bancoFotos();
  db.transaction("fotos", "readwrite").objectStore("fotos").delete(id);
}

// Reduz a foto (lado maior 1200 px) para não encher o espaço do celular.
async function reduzirFoto(arquivo) {
  const url = URL.createObjectURL(arquivo);
  const img = new Image();
  img.src = url;
  await img.decode();
  const k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return { blob: await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.85)), proporcao: c.height / c.width };
}

// ---------- Adesivos (SVG, para a tela e para o PNG ficarem iguais) ----------

const FONTE = "DM Sans, system-ui, sans-serif";
const CORES_DIA = { azulejo: ["#DCE7FF", "#1A4396"], terracota: ["#FFE2D3", "#9A3412"], ouro: ["#FFF0C2", "#6E4B00"], mata: ["#D7F2E3", "#145234"] };

function escSvg(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function adesivoSVG(p) {
  if (p.tipo === "aniversario") {
    return { w: 230, h: 40, svg: `<rect width="230" height="40" rx="12" fill="#FFD95A"/><text x="115" y="26" font-family="${FONTE}" font-size="15" font-weight="700" fill="#2B2340" text-anchor="middle">♥ aniversário de casamento</text>` };
  }
  if (p.tipo === "etiqueta") {
    const [bg, cor] = CORES_DIA[p.cor] || CORES_DIA.azulejo;
    const w = Math.round(28 + p.texto.length * 8.2);
    return { w, h: 32, svg: `<rect width="${w}" height="32" rx="16" fill="${bg}"/><text x="${w / 2}" y="21" font-family="${FONTE}" font-size="14" font-weight="700" fill="${cor}" text-anchor="middle">${escSvg(p.texto)}</text>` };
  }
  if (p.tipo === "bilhete") {
    return { w: 190, h: 70, svg: `<rect x="1" y="1" width="188" height="68" rx="12" fill="#fff" stroke="#EFE5D8" stroke-width="2" stroke-dasharray="5 4"/><text x="14" y="24" font-family="${FONTE}" font-size="11" font-weight="700" fill="#6B6480">TRANSFER BELVITUR</text><text x="14" y="52" font-family="${FONTE}" font-size="22" font-weight="800" fill="#2B2340">07h45 → 08h00</text>` };
  }
  if (p.tipo === "carimbo") {
    return { w: 124, h: 124, svg: `<circle cx="62" cy="62" r="58" fill="none" stroke="#C2410C" stroke-width="4" opacity=".85"/><text x="62" y="60" font-family="${FONTE}" font-size="15" font-weight="700" fill="#C2410C" text-anchor="middle">30.10 — 03.11</text><text x="62" y="80" font-family="${FONTE}" font-size="12" font-weight="700" fill="#C2410C" text-anchor="middle">MINAS · 2026</text>` };
  }
  // trilha da cedilha
  return { w: 120, h: 30, svg: `<g fill="#2B2340"><circle cx="8" cy="15" r="6"/><circle cx="30" cy="15" r="6"/><circle cx="52" cy="15" r="6"/><circle cx="74" cy="15" r="6"/></g><circle cx="102" cy="15" r="12" fill="#FFD95A" stroke="#2B2340" stroke-width="4"/>` };
}

function adesivoURL(p) {
  const a = adesivoSVG(p);
  return { ...a, url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${a.w}" height="${a.h}" viewBox="0 0 ${a.w} ${a.h}">${a.svg}</svg>`)}` };
}

// Lista do "+ Adesivo": peças fixas e uma etiqueta por lugar e por cidade.
function catalogoAdesivos() {
  const base = [{ tipo: "aniversario" }, { tipo: "carimbo" }, { tipo: "bilhete" }, { tipo: "trilha" }];
  const cidades = [["Belo Horizonte", "terracota"], ["Ouro Preto", "ouro"], ["Mariana", "ouro"], ["Inhotim", "mata"]].map(([texto, cor]) => ({ tipo: "etiqueta", texto, cor }));
  const lugares = R.dias.flatMap((d) => lugaresDoDia(d).map((l) => ({ tipo: "etiqueta", texto: l.nome, cor: d.cor })));
  return [...base, ...cidades, ...lugares];
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

function telaScrapbook() {
  return `<header class="topo-simples">
      <a class="link-hub" href="#/viagem">‹ Lembrança</a>
      <h1>Scrapbook</h1>
      <span class="legenda">Monte a colagem da viagem com as suas fotos. Arraste as peças; toque numa para girar, mudar o tamanho ou tirar.</span>
    </header>
    <section class="secao">
      <div class="folha" id="folha" aria-label="Colagem da viagem"></div>
      <div class="scrap-ferramentas" id="scrap-ferramentas" hidden>
        <button type="button" data-scrap="girar-" aria-label="Girar para a esquerda">⟲</button>
        <button type="button" data-scrap="girar+" aria-label="Girar para a direita">⟳</button>
        <button type="button" data-scrap="menor" aria-label="Diminuir">−</button>
        <button type="button" data-scrap="maior" aria-label="Aumentar">+</button>
        <button type="button" data-scrap="frente" aria-label="Trazer para a frente">▲</button>
        <button type="button" data-scrap="tirar" aria-label="Tirar da colagem">${icone("fechar", 18)}</button>
      </div>
      <div class="scrap-acoes">
        <label class="botao">+ Foto<input type="file" accept="image/*" multiple id="scrap-foto" hidden></label>
        <button type="button" class="botao" data-acao="scrap-adesivo">+ Adesivo</button>
        <button type="button" class="botao botao-cheio" data-acao="scrap-salvar">Salvar imagem</button>
      </div>
      <p class="legenda" style="text-align:center">Fica só neste celular. Salve a imagem para guardar.</p>
    </section>`;
}

async function desenharFolha() {
  const folha = document.getElementById("folha");
  if (!folha) return;
  const urls = [];
  folha.innerHTML = "";
  for (const p of SCRAP.pecas) {
    const el = document.createElement("div");
    el.className = `peca peca-${p.tipo}${SCRAP.selecionada === p.id ? " selecionada" : ""}`;
    el.dataset.id = p.id;
    if (p.tipo === "foto") {
      const blob = await fotoLer(p.foto);
      if (!blob) continue;
      const u = URL.createObjectURL(blob);
      urls.push(u);
      el.innerHTML = `<span class="fita fita-${p.fita || 0}"></span><img src="${u}" alt="Foto da viagem">`;
      el.style.width = `${42 * p.esc}%`;
    } else {
      const a = adesivoURL(p);
      el.innerHTML = `<img src="${a.url}" alt="">`;
      el.style.width = `${(a.w / 358) * 100 * p.esc}%`;
    }
    el.style.left = `${p.x * 100}%`;
    el.style.top = `${p.y * 100}%`;
    el.style.transform = `translate(-50%, -50%) rotate(${p.rot}deg)`;
    folha.appendChild(el);
  }
  if (!SCRAP.pecas.some((p) => p.tipo === "foto")) {
    folha.insertAdjacentHTML("beforeend", `<p class="folha-vazia">Toque em <strong>+ Foto</strong> para começar a colagem.</p>`);
  }
  document.getElementById("scrap-ferramentas").hidden = !SCRAP.selecionada;
  folha._urls?.forEach((u) => URL.revokeObjectURL(u));
  folha._urls = urls;
}

function iniciarScrapbook() {
  carregarPecas();
  SCRAP.selecionada = null;
  desenharFolha();
  const folha = document.getElementById("folha");
  let arrasto = null;
  folha.addEventListener("pointerdown", (ev) => {
    const el = ev.target.closest(".peca");
    if (!el) { SCRAP.selecionada = null; desenharFolha(); return; }
    const r = folha.getBoundingClientRect();
    const p = SCRAP.pecas.find((x) => x.id === el.dataset.id);
    arrasto = { p, el, r, dx: ev.clientX - (r.left + p.x * r.width), dy: ev.clientY - (r.top + p.y * r.height), moveu: false };
    el.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  folha.addEventListener("pointermove", (ev) => {
    if (!arrasto) return;
    const { p, el, r } = arrasto;
    p.x = Math.min(1, Math.max(0, (ev.clientX - arrasto.dx - r.left) / r.width));
    p.y = Math.min(1, Math.max(0, (ev.clientY - arrasto.dy - r.top) / r.height));
    el.style.left = `${p.x * 100}%`;
    el.style.top = `${p.y * 100}%`;
    arrasto.moveu = true;
  });
  folha.addEventListener("pointerup", () => {
    if (!arrasto) return;
    const { p, moveu } = arrasto;
    arrasto = null;
    if (moveu) salvarPecas();
    else { SCRAP.selecionada = SCRAP.selecionada === p.id ? null : p.id; desenharFolha(); }
  });
  document.getElementById("scrap-foto").addEventListener("change", async (ev) => {
    for (const arquivo of ev.target.files) {
      const { blob } = await reduzirFoto(arquivo);
      const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
      await fotoGuardar(id, blob);
      novaPeca({ tipo: "foto", foto: id, fita: Math.floor(Math.random() * 3) });
    }
    ev.target.value = "";
    desenharFolha();
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
