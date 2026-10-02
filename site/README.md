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
├── PENDENCIAS.md         tudo o que falta decidir ou confirmar nas páginas já feitas
├── quem-somos/          marca: hero com foto, equipe, avaliações, missão (rascunho)
├── contato/             canais, atalhos, lojas com o NAP do Google e o formulário (rascunho)
├── empresas/           B2B: casos, terceirização, setor público, formulário de proposta (empresas.js), prova (rascunho)
├── duvidas/            os sete temas numa faixa, com busca ao digitar (duvidas.js) e FAQPage só das respostas completas (rascunho)
├── diaria-27-horas/    a regra, a busca com a dica de horário-limite, exemplos com voo (rascunho)
├── protecoes-e-taxas/  como o preço é montado, comparação (tabela no desktop, cards no celular), taxa de 12%, adicionais (rascunho)
├── caucao-e-requisitos/ os três requisitos, documentos, pré-autorização, sem cartão (#sem-cartao), outra pessoa (rascunho)
├── regras-de-locacao/   da retirada à devolução, em dez seções com índice; regras de hoje em laranja (rascunho)
├── assistencia-24h/     o número, a emergência, pane, acidente e situações comuns; barra de ligação no celular (rascunho)
├── prevencao-a-fraudes/ canais oficiais, golpes comuns, o que a Asa nunca pede, como denunciar (rascunho)
├── acessibilidade/      compromisso WCAG 2.2 AA, recursos, balcão, carros e o canal de relato (rascunho)
├── ofertas/             vitrine de ofertas com cupom, "como usar" e dúvidas (rascunho)
│   ├── ofertas.js       estados da página: ?vazio, ?pausado, ?encerrada
│   ├── primeira-locacao/   BEMVINDOASA: código, busca com o cupom aplicado, regras, prova (rascunho)
│   ├── carnaval/        campanha de temporada: oferta, cuidados, balcão, diária, roteiros, carros (rascunho, noindex)
│   ├── sao-joao/        campanha: roteiro do interior a partir de Recife (rascunho, noindex)
│   └── reveillon/       campanha: roteiros em abas Pernambuco e Ceará (rascunho, noindex)
├── relacoes-com-investidores/   RI: a empresa, os 14 documentos publicados, contato (rascunho, noindex)
├── politica-de-privacidade/     política em 13 seções, com índice (rascunho para revisão jurídica)
├── politica-de-termos-e-condicoes/  termos em 14 seções, com índice e impressão (rascunho)
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

A lista completa, com quem decide cada item, está em [PENDENCIAS.md](PENDENCIAS.md).

- A busca não segue para o motor de reservas: mostra uma linha "Protótipo" no lugar. O campo "Tenho um cupom" só aceita o BEMVINDOASA, para mostrar os estados de válido e inválido.
- As páginas de oferta trazem os dois estados no mesmo HTML (`data-temporada` e `data-fora`). Em produção o CMS entrega só um; no protótipo, o outro abre pela URL: `/ofertas?vazio`, `/ofertas/primeira-locacao?pausado`, `/ofertas/carnaval?encerrada` (e São João, Réveillon).
- Cards, datas e tempos de leitura do blog são exemplo; em produção vêm do CMS.
- Fotos são placeholders. Produção exige foto real da Asa ou licença.
- O banner de cookies (`asa-consent`) e a barra de primeira locação ainda não entram: a barra depende das regras do cupom BEMVINDOASA.
- Texto entre colchetes (`[CONFIRMAR]`, `[VERIFICAR]`, `[REVISÃO JURÍDICA]`) é pendência de fato e não vai ao ar assim. Nas páginas que dependem da empresa ou do jurídico (RI, privacidade, termos), a pendência aparece em laranja (`.site-pending`) e um aviso de rascunho abre a página, para quem revisa achar tudo no navegador. Nas demais, ela fica em comentário HTML.
