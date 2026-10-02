# Site Asa · páginas de produção

As páginas do novo site, montadas só com a biblioteca de `css/` e com as regras de [15 · Composição](../15-composicao.html). Cada página nasce de um arquivo de copy de `novo-site/copy-v2/`, adaptado às regras do sistema antes de virar código.

## Como abrir

```bash
python3 scripts/servir-site.py
```

Depois abra <http://localhost:8766/blog>. As páginas usam os endereços de produção (`/blog`, `/frota`, `/css/asa-tokens.css`), e o servidor monta essa árvore a partir do repositório. Links para páginas que ainda não existem caem no 404 do site: é esperado.

## Estrutura

```
site/
├── _parciais/
│   ├── cabecalho.html   utility bar, navbar com submenus, menu do celular
│   └── rodape.html      rodapé em seis grupos, lojas, pagamento e o botão do WhatsApp
├── site.css             a cola entre as páginas e a biblioteca (nada de cor nova)
├── site.js              menus, rodapé, WhatsApp, busca compacta e eventos de GA4
├── 404.html             404 do site
└── blog/
    ├── index.html       /blog, também /blog/categoria/<slug> e ?pagina=N
    ├── blog.js          filtro por categoria e paginação do hub
    ├── 404.html         404 do blog
    └── qual-carro-alugar-para-ir-a-porto-de-galinhas/
        └── index.html   o modelo de artigo
```

## Cabeçalho e rodapé

Os dois existem uma vez só, em `_parciais/`. Cada página marca onde eles entram (`<!-- parcial:cabecalho -->` … `<!-- /parcial:cabecalho -->`), e o script copia o conteúdo para todas:

```bash
python3 scripts/parciais.py           # atualiza todas as páginas
python3 scripts/parciais.py --check   # só confere
```

Uma página que declara `<meta name="asa:secao" content="/frota">` ganha o item do menu marcado como atual.

## Página nova, na ordem

1. Ler a copy e listar o que não segue o sistema (sobretítulo, travessão, fórmula de IA, card fora da vitrine, fato fora de `00a-fonte-de-verdade.md`).
2. Escolher o arquétipo no `<body data-page-mode>`: `marketing` (amarelo abre e fecha), `transactional` (amarelo funcional) ou `informational` (amarelo só no cabeçalho e no logo).
3. Montar as faixas com as estruturas de 06 Componentes, sem repetir estrutura nem fundo em sequência.
4. Foto ainda inexistente vira `.asa-photo` com o briefing na legenda e o alt em `aria-label`.
5. Rodar `python3 scripts/parciais.py` e `python3 scripts/auditar.py site/<pagina>/index.html`, e olhar em 375 e 1440px.

## O que ainda é protótipo

- A busca não segue para o motor de reservas: mostra uma linha "Protótipo" no lugar.
- Cards, datas e tempos de leitura do blog são exemplo; em produção vêm do CMS.
- Fotos são placeholders. Produção exige foto real da Asa ou licença.
- O banner de cookies (`asa-consent`) e a barra de primeira locação ainda não entram: a barra depende das regras do cupom BEMVINDOASA.
- Texto entre colchetes (`[CONFIRMAR]`, `[VERIFICAR]`) é pendência de fato e não vai ao ar assim.
