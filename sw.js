// Guarda o site no celular para abrir sem sinal (Inhotim, estrada para Ouro Preto).
// Textos e código: rede primeiro, cópia guardada se não houver sinal.
// Fotos e fontes: cópia guardada primeiro. A previsão do tempo nunca é guardada.

// Ao publicar uma mudança, troque a VERSAO para os celulares buscarem a cópia nova.
const VERSAO = "roteiro-v2";

// magic-square fica fora: a foto saiu do card "Para fotografar" (volta na v2).
const FOTOS = [
  "andujar", "capa", "casa-do-baile", "casa-fiat", "casa-kubitschek", "ccbb-bh",
  "igrejinha-pampulha", "inhotim", "mariana", "mercado-central",
  "mirante-mangabeiras", "narcissus", "praca-da-liberdade", "praca-do-papa",
  "sao-francisco-op", "varejao",
].map((f) => `img/${f}.jpg`);

const ARQUIVOS = [
  "./", "index.html", "css/estilo.css", "js/dados.js", "js/icones.js", "js/app.js",
  "img/creditos.json", "img/icone.svg", "img/icone-192.png", "img/icone-512.png",
  "img/icone-maskable-512.png", "manifest.webmanifest", ...FOTOS,
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
