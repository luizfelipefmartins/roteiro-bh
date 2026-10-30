// Guarda o site no celular para abrir sem sinal (Inhotim, estrada para Ouro Preto).
// Textos e código: rede primeiro, cópia guardada se não houver sinal.
// Fotos e fontes: cópia guardada primeiro. A previsão do tempo nunca é guardada.

// Ao publicar uma mudança, troque a VERSAO aqui e o ?v= dos links no index.html.
const VERSAO = "roteiro-v15";

// Fotos que ficam guardadas no celular para abrir sem sinal.
const FOTOS = [
  "andujar", "capa", "casa-do-baile", "casa-fiat", "casa-kubitschek", "ccbb-bh",
  "igrejinha-pampulha", "inhotim", "magic-square", "mariana", "mercado-central",
  "mirante-mangabeiras", "narcissus", "praca-da-liberdade", "praca-do-papa",
  "sao-francisco-op", "varejao", "viewing-machine", "beam-drop", "troca-troca",
  "xapuri", "pilar", "mina-chico-rei", "inconfidencia", "pedra-sabao", "inhotim-lago",
  "inhotim-jardim", "penone-rotterdam",
].map((f) => `img/${f}.jpg`);

const ARQUIVOS = [
  "./", "index.html", "css/estilo.css?v=15", "js/dados.js?v=15", "js/icones.js?v=15", "js/app.js?v=15", "js/scrapbook.js?v=15",
  "img/creditos.json", "img/icone.svg", "img/icone-192.png", "img/icone-512.png",
  "img/icone-maskable-512.png", "img/logo-andancas.svg", "manifest.webmanifest", ...FOTOS,
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function redePrimeiro(req) {
  const cache = await caches.open(VERSAO);
  try {
    const resp = await fetch(req);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    return (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}

async function guardadoPrimeiro(req) {
  const cache = await caches.open(VERSAO);
  const guardado = await cache.match(req);
  if (guardado) return guardado;
  const resp = await fetch(req);
  if (resp.ok || resp.type === "opaque") cache.put(req, resp.clone());
  return resp;
}

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    ev.respondWith(guardadoPrimeiro(req));
    return;
  }
  if (url.origin !== location.origin) return;

  ev.respondWith(req.destination === "image" ? guardadoPrimeiro(req) : redePrimeiro(req));
});
