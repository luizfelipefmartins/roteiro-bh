# Roteiro BH

Site do roteiro da viagem a Belo Horizonte, Ouro Preto, Mariana e Inhotim (30/10 a 03/11/2026), para abrir no celular durante a viagem.

## Regra do repositório

Repositório público: não entram voucher, valores pagos, telefones, endereço do hotel nem documentos.

## Estrutura

- `js/dados.js`: conteúdo do roteiro (dias, horários, atrações, cenários de chuva, voo sem número). Para mudar o roteiro, edite só este arquivo.
- `js/app.js`: telas (Início, Dia, Dias, Avisos, Créditos), gavetas de lugar e de tempo, previsão do [Open-Meteo](https://open-meteo.com/).
- `js/icones.js`: ícones em SVG.
- `css/estilo.css`: direção visual (uma cor por dia, em dois tons).
- `sw.js`: guarda o site no celular para abrir sem sinal.
- `img/`: fotos dos lugares, do Wikimedia Commons. Autor e licença de cada uma em `img/creditos.json`.

## Rodar no computador

```
npx http-server -p 8123 -c-1
```

Abrir `http://localhost:8123`. Para ver o site como se fosse outro dia: `http://localhost:8123/?hoje=2026-10-31`.

Ao mudar arquivos depois de publicado, suba a `VERSAO` em `sw.js` para os celulares baixarem a cópia nova das fotos.
