// Ícones em traço (24×24), herdam a cor do texto.

const ICONES = {
  voltar: '<path d="M15 18l-6-6 6-6"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ampulheta: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  coracao: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  pino: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  aviao: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  decolar: '<path d="M2 16l20-6-2.5-2L13 10 7 4H5l3.5 7.5L4 13l-2-1.5z"/><path d="M3 21h18"/>',
  radar: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
  conexao: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H14a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5.5"/>',
  carro: '<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
  onibus: '<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M8 17v3M16 17v3"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  solNuvem: '<path d="M8 3v1M3.5 5.5l.7.7M2 10h1"/><path d="M5.6 12.4A4 4 0 1 1 11.5 7"/><path d="M9 20a4 4 0 1 1 .9-7.9A5.5 5.5 0 0 1 20.5 14 3 3 0 0 1 20 20z"/>',
  nublado: '<path d="M7 18a4.5 4.5 0 1 1 1-8.9A6 6 0 0 1 19.5 11 3.5 3.5 0 0 1 19 18z"/>',
  nuvem: '<path d="M7 15a4 4 0 1 1 .9-7.9A5.5 5.5 0 0 1 18.5 9 3.5 3.5 0 0 1 18 16H7z"/><path d="M9 19l-1 2M13 19l-1 2M17 19l-1 2"/>',
  raio: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  lua: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  alerta: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>',
  ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
  pendente: '<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>',
  mochila: '<path d="M6 8a6 6 0 0 1 12 0v12H6z"/><path d="M9 4.5V3h6v1.5M9 13h6"/>',
  estrela: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  panela: '<path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M2 11h20M9 7c0-1 1-1 1-2M14 7c0-1 1-1 1-2"/>',
  igreja: '<path d="M12 2v4M10 4h4M6 21V11l6-5 6 5v10"/><path d="M10 21v-4a2 2 0 0 1 4 0v4M3 21h18"/>',
  picareta: '<path d="M3 7c4-4 10-4 14 0"/><path d="M10 5l-6 16"/><path d="M14 12l7 9"/>',
  coluna: '<path d="M3 21h18M5 18h14M4 7h16L12 3z"/><path d="M7 10v8M12 10v8M17 10v8"/>',
  pote: '<path d="M8 4h8M9 4v3c-3 1-4 3.5-4 6.5A6.5 6.5 0 0 0 11.5 20h1a6.5 6.5 0 0 0 6.5-6.5c0-3-1-5.5-4-6.5V4"/>',
  espiral: '<path d="M12 12a1.5 1.5 0 1 1 1.5-1.5A3 3 0 1 1 10.5 7.5 4.5 4.5 0 1 1 16.5 12 6 6 0 1 1 10.5 4"/>',
  fios: '<path d="M4 3l8 18M10 3l2 18M14 3l-2 18M20 3l-8 18"/>',
  vidro: '<path d="M3 10l9-6 9 6v10H3z"/><path d="M9 20v-6h6v6M3 10h18"/>',
  externo: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  copiar: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  cama: '<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10.5" r="1.5"/>',
};

function icone(nome, tamanho = 20, classe = "") {
  const desenho = ICONES[nome] || ICONES.estrela;
  return `<svg class="ic ${classe}" aria-hidden="true" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${desenho}</svg>`;
}
