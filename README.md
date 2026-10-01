# Sistema de Design Asa Rent a Car · v3.2

A identidade da Asa Rent a Car em código. São duas coisas num pacote só:

1. **Uma biblioteca CSS** (`css/`): quatro arquivos, sem build, sem dependência, portável para qualquer stack.
2. **Uma documentação navegável** (16 páginas HTML) que consome essa mesma biblioteca. A documentação é também o teste de que a biblioteca funciona.

A v3.2 (amarelo dominante) é a variante canônica para todo produto digital B2C. A v3.1 (vermelho dominante) é a variante B2B; as duas compartilham escala, grade, geometria e componentes e divergem só na proporção de cor.

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
├── 01-fundamentos.html     marca, as duas variantes, geometria de 8°
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
