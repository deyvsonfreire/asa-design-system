# Sistema de Design Asa Locadora · v3.3 (texto) sobre o visual v3.2

A identidade da Asa Locadora (logo ASA RENT A CAR) em código. São duas coisas num pacote só:

1. **Uma biblioteca CSS** (`css/`): quatro arquivos, sem build, sem dependência, portável para qualquer stack.
2. **Uma documentação navegável** (16 páginas HTML) que consome essa mesma biblioteca. A documentação é também o teste de que a biblioteca funciona.

A v3.2 (amarelo dominante) é a variante única, para todo produto e toda peça. A antiga v3.1 B2B (vermelho dominante) foi descontinuada em 21/10/2026 (M14). Os textos seguem a **v3.3** (21/10/2026), descrita abaixo.

## Versão v3.3 de texto (21/10/2026)

A v3.3 muda só texto e regras escritas; o visual da v3.2 (cores, tipografia, geometria, componentes) continua igual. Fonte: `DOCUMENTOS CONSOLIDADOS/` (documento mestre v03 de 21/10, §5, §6 e §10) e as decisões de marca M01–M35 respondidas pelo dono em 21/10/2026. Commitado em 7c8640a e na revisão geral seguinte (branch site-destinos), sem push nem publicação: a publicação espera confirmação (M19).

Decisões aplicadas nesta cópia:

- **D02 · nome**: "Asa Locadora" em todos os textos, títulos, `<title>`, `alt` e rodapés. O lettering do logo continua ASA RENT A CAR.
- **D08 · 27 horas**: "diária de 27 horas" deixou de ser fato, etiqueta ou diferencial; no lugar, "Devolução com 3 horas de tolerância".
- **D09 · minutos**: nenhuma promessa de tempo ("8 minutos", "10 minutos"); no lugar, "Retirada no saguão do desembarque" e "Balcão dentro do saguão do desembarque".
- **D27, M10, M11 · taxas e absolutos**: saíram "taxa de aeroporto: não cobramos", "preço já inclui taxas", "sem letra miúda", "cancele grátis", "sem van", "sem fila" e "sem transfer". Os resumos de preço mostram a "Taxa administrativa (12%)" em reais. Cancelamento: "reserva com pagamento na retirada cancela sem custo; a pré-paga segue a regra dos Termos".
- **Números oficiais**: Google 4,7 (Recife) e 4,9 (Fortaleza), Reclame Aqui 9,3, "desde 2004". Saíram 9,4, "+4.500", "mais de 3 mil avaliações", "mais de 20 anos" e a comparação com concorrentes.
- **Dados inventados (06)**: "+1.200 reservas em 48h", "Clube Asa R$ 19/ano" e o depoimento "Retirei o carro em 10 minutos" viraram exemplos neutros (notas oficiais, comparação de proteções, depoimento real a copiar). "Portão A5" saiu.
- **D19 · logo sobre amarelo**: versão colorida (símbolo vermelho + lettering preto). O contraste do símbolo sobre o amarelo (2,94:1) é exceção de marca registrada na v3.3. Ver `01-fundamentos.html#logo`.
- **M14**: a variante v3.1 B2B (vermelho dominante, ação amarela, fundo #FFF2F2) foi extinta da documentação; a v3.2/v3.3 vale para tudo.
- **M15**: `03-cor.html#extensoes` lista as extensões de interface (#4A4C50, #5A5C60, #8A8C90/#A8AAAE, #A35200 sobre #FDF1E4, #EAB227, WhatsApp #25D366). A paleta oficial continua com 8 cores. O rodapé é Preto Profundo; vermelho é só ação.
- **M16**: o contorno vermelho (`.asa-btn--action-outline`) é exceção de lista, documentada em 06 e 08; a opção marcada (`.asa-choice--accent`) voltou ao preto #141517.
- **M17**: respiro de uma letra do lettering, mínimo impresso de 2,0 cm e mínimo digital de 24 px de altura do lockup (`01-fundamentos.html#logo`).
- **M18**: `--asa-fs-mono` subiu de 11 para 12px, e os textos de 10–11px de `asa-docs.css` e os estilos inline das páginas (rótulos de 03 Cor, legendas e maquetes do guia de parceiros) foram para 12px. Nenhum texto abaixo de 12px.
- **M23**: o wordmark "ASA" isolado saiu da lista de downloads (14).
- **Revisão geral (21/10)**: dados de exemplo de 06, 08 e 12 alinhados ao contrato (proteção básica R$ 19,90/dia, franquia de R$ 6.000 e coparticipação de até R$ 3.000; total de exemplo R$ 701,90; caução por grupo, a partir de R$ 800; desbloqueio na devolução com prazo do banco de até 30 dias, A01); ofertas, cupons e depoimentos de exemplo viraram placeholders; 0800 080 0015; Fortaleza com balcão no saguão; etiqueta caixa alta com +0.1em; SVG dos downloads iguais aos do brand kit v02; `_versoes-anteriores/` fora do git, do deploy e da publicação do guia.

## Como abrir

Precisa de servidor: o Chrome bloqueia `@font-face` em `file://`, e sem isso a página perde a BR Omny.

```bash
cd "asa-design-system" && python3 -m http.server 8765
```

Depois abra <http://localhost:8765/index.html>. A versão publicada fica em <https://asalocadora.deyvsonfreire.com.br/design-system> (deploy automático da `main`).

## Estrutura

```
asa-design-system/
├── index.html              00 · capa e índice
├── 01-fundamentos.html     marca, logo (respiro, mínimo, fundo amarelo), geometria de 8°
├── 02-grid.html            12 colunas, container, dobra, espaçamento
├── 03-cor.html             paleta, proporção, contraste WCAG calculado
├── 04-tipografia.html      BR Omny, 5 degraus, 2 registros
├── 05-icones.html          Feather 1.5px, regras de uso
├── 06-componentes.html     a biblioteca inteira, com todos os estados, e as faixas de página
├── 07-hierarquia.html      as 6 ferramentas, com par certo/errado
├── 08-fluxo-reserva.html   8 telas de produto montadas com os componentes
├── 09-seguranca.html       segundo fator e consentimento LGPD
├── 10-tokens.html          mapa de variáveis e como consumir
├── 11-movimento.html       durações e o que nunca anima
├── 12-app-nativo.html      o que muda fora do navegador
├── 13-roadmap.html         o que falta para o portal, em ordem de dependência
├── 14-downloads.html       brand kit, logos, fontes, ícones, templates
├── 15-composicao.html      a página inteira: faixas, variação, foto, checklist de vícios
├── asa-home/               versão anterior da home, mantida para comparação
├── asa-home-v2/            a home de referência, exemplo vivo de 15 · Composição
├── guia-parceiros/         as mesmas páginas, sem jargão, para agências e fornecedores
├── scripts/auditar.py      conta os vícios do checklist de 15 em qualquer página
├── scripts/nav.py          regenera a navegação de todas as páginas
├── scripts/publicar-guia.py sincroniza o guia com o site do GitHub Pages
├── css/
│   ├── asa-tokens.css      @font-face + primitivos + semânticos
│   ├── asa-base.css        reset, defaults de elemento, layout, foco
│   ├── asa-components.css  a biblioteca de componentes e as faixas de página
│   ├── asa-utilities.css   corte a 8°, hachura, marca d'água, auxiliares
│   └── asa-docs.css        só o chrome da documentação (não é produto)
└── assets/
    ├── fonts/              5 faces .otf da BR Omny
    └── img/                lockup e asa
```

## Para usar em outro projeto

Copie `css/` e `assets/` e carregue os quatro arquivos nesta ordem. Sem build: é a cascata por ordem de origem que dispensa `!important`.

```html
<link rel="stylesheet" href="css/asa-tokens.css">
<link rel="stylesheet" href="css/asa-base.css">
<link rel="stylesheet" href="css/asa-components.css">
<link rel="stylesheet" href="css/asa-utilities.css">
```

`asa-docs.css` não vai junto: ele é o estilo desta documentação, não do produto.

## As regras que não se negociam

Estão explicadas e medidas nas páginas; aqui, o resumo que cabe num bloco.

| Regra | Valor |
|---|---|
| Vermelho é só ação | `--asa-action`, um botão vermelho por composição, nunca mais de ~20% de área |
| Vermelho como texto sobre amarelo | nunca (2,94:1) |
| Superfícies | branco (padrão), cinza mist `#F4F4F3` (composição e camada flutuante), amarelo, preto |
| Registro 1 (caixa alta itálica) | só no H1, no preço e na placa de número |
| Título de seção | Registro 2: 700, caixa baixa, uma palavra em vermelho (`h2 em`) |
| Rótulo e legenda | 14px, caixa baixa; `.asa-tag` é a única caixa alta restante |
| Piso de texto | nenhum texto abaixo de 12px em tela |
| Forma | raio 8px em botão, card e campo; 0 na etiqueta; 50% no avatar; nenhuma sombra |
| O ângulo | 8°, sempre subindo à direita, via `--asa-rise: 14.05cqw` |
| Movimento | teto de 400ms; nada gira, nada pulsa, número aparece inteiro |
| Respiro entre faixas | `--asa-section-pad-y`: 72px no celular, 120px no desktop |
| Página | uma estrutura por faixa, fundo alternado, foto antes de ícone, card só onde há produto (ver 15) |

## Medir antes de entregar

```bash
python3 scripts/auditar.py asa-home-v2/index.html
```

Conta, por página, o que o checklist de `15-composicao.html` manda contar: blocos em caixa alta, sobretítulos, ícones fora de controle, cards com borda, fundos iguais em sequência, marcas d'água, fotos e travessões no texto visível.

## Guia para parceiros

`guia-parceiros/` é a versão das mesmas páginas para fornecedores e agências: mesmo CSS, mesmos componentes, texto sem jargão de implementação (tokens, ARIA, código, decisões internas de produto). As páginas de segurança, tokens, app e roadmap aparecem lá reduzidas ao que interessa a quem produz uma peça. Link: `guia-parceiros/index.html`.

O guia é publicado à parte, em <https://deyvsonfreire.github.io/asa-guia-parceiros/>, a partir do repositório `deyvsonfreire/asa-guia-parceiros`. Depois de mudar `guia-parceiros/` ou `css/`, sincronize um clone daquele repositório e faça push na `main` dele; o GitHub Pages republica sozinho:

```bash
python3 scripts/publicar-guia.py /caminho/do/clone/asa-guia-parceiros
```

## Fora do sistema

- **Fontes em `.otf`** (~75KB por face). Em site público, converter para `woff2` com subset latino + diacríticos pt-BR (~25KB por face).
- **Navegação duplicada nas páginas** da documentação: markup estático, funciona sem JS. Mudar a navegação é editar os arquivos (`scripts/nav.py` regenera o bloco em todas).
- **Tabela de preços** (RMS) e **convenção de hooks de medição** do GA4: dependem de negócio, não do design system.
- **Caução e segundo fator**: o nível de verificação depende do gateway escolhido; se ele impuser 3D Secure, o segundo fator do produto fica redundante. Detalhes em `09-seguranca.html`.
- **Textos de consentimento LGPD** precisam de parecer jurídico antes de qualquer publicação.
- **Fotos**: `asa-home-v2/img/` contém comps de visualização de banco de imagem, sem licença. Produção exige foto real da Asa ou licença.
