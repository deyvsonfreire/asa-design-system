# Sistema de Design Asa Rent a Car — v3.2

Implementação em código do handoff de identidade que está na pasta acima. São duas coisas num pacote só:

1. **Uma biblioteca CSS** (`css/`) — quatro arquivos, sem build, sem dependência, portável para qualquer stack.
2. **Uma documentação navegável** (13 páginas HTML) que consome essa mesma biblioteca — ou seja, a documentação é também o teste de que a biblioteca funciona.

## Como abrir

**Precisa de servidor.** O Chrome bloqueia `@font-face` em `file://`, e sem isso a página cai no fallback e perde a BR Omny — que é justamente o que este pacote acrescenta ao handoff original.

```bash
cd "asa-design-system" && python3 -m http.server 8765
```

Depois abra <http://localhost:8765/index.html>.

## Estrutura

```
asa-design-system/
├── index.html              00 · capa e índice
├── 01-fundamentos.html     marca, v3.1 vs v3.2, geometria de 8°
├── 02-grid.html            12 colunas, container, dobra, espaçamento
├── 03-cor.html             paleta, proporção, contraste WCAG calculado
├── 04-tipografia.html      BR Omny real, 5 degraus, 2 registros
├── 05-icones.html          Feather 1.5px, 20 ícones, regras de uso
├── 06-componentes.html     a biblioteca inteira, com todos os estados
├── 07-hierarquia.html      as 5 ferramentas, com par certo/errado
├── 08-fluxo-reserva.html   8 telas de produto
├── 09-seguranca.html       segundo fator e consentimento LGPD
├── 10-tokens.html          mapa de variáveis e como consumir
├── 11-movimento.html       durações e o que nunca anima
├── 12-app-nativo.html      o que muda fora do navegador
├── 13-roadmap.html         o que falta para o portal (derivado do benchmark)
├── css/
│   ├── asa-tokens.css      @font-face + primitivos + semânticos
│   ├── asa-base.css        reset, defaults de elemento, layout, foco
│   ├── asa-components.css  a biblioteca de componentes
│   ├── asa-utilities.css   corte a 8°, hachura, auxiliares
│   └── asa-docs.css        só o chrome da documentação (não é produto)
└── assets/
    ├── fonts/              5 faces .otf da BR Omny
    └── img/                lockup e asa, copiados do handoff
```

## Para usar em outro projeto

Copie `css/` e `assets/` e carregue os quatro arquivos **nesta ordem** — sem build, é a cascata por ordem de origem que dispensa `!important`:

```html
<link rel="stylesheet" href="css/asa-tokens.css">
<link rel="stylesheet" href="css/asa-base.css">
<link rel="stylesheet" href="css/asa-components.css">
<link rel="stylesheet" href="css/asa-utilities.css">
```

`asa-docs.css` **não** vai junto: ele é o estilo desta documentação, não do produto.

## Cinco divergências conscientes do handoff

Estão documentadas em detalhe nas páginas correspondentes, mas resumidas aqui porque mudam o resultado visual:

| # | O handoff dizia | Aqui | Por quê |
|---|---|---|---|
| 1 | Três receitas de `clip-path` com porcentagem | Uma fórmula em `cqw` (`--asa-rise: 14.05cqw`) | Porcentagem é relativa à altura, então o mesmo valor dava ângulos diferentes por proporção — o card em 16:9 cortava a 4,5°, não a 8°. Agora dá 8° em qualquer caixa. |
| 2 | Label de campo em 9px | 12px | A regra dura do próprio handoff é "nenhum texto abaixo de 12px", e a escala tem cinco degraus "nada entre eles". A regra geral vence a spec do componente. |
| 3 | Vermelho sobre amarelo a partir do corpo de destaque | Nunca vermelho como texto sobre amarelo | Medido, o par dá 2,94:1 — reprova até no mínimo de 3:1 para texto grande. O preço já vivia no campo claro do vão; agora isso é regra, não coincidência. |
| 4 | `--asa-radius: 4px` em botão, card e campo | `--asa-radius: 8px` | Feedback de revisão do usuário, depois de ver o sistema implementado nas 13 páginas: pediu um arredondamento levemente mais suave. Token único — cascata automática para todos os componentes que o consomem. Etiqueta de benefício continua com radius zero, e avatar com 50%; nenhum dos dois usa esse token. |
| 5 | `--asa-cream: #FFF7E3` como tom, e como fundo padrão de toda tela (`body`) | `--asa-cream: #FFFBF0`, e deixa de ser o fundo padrão de `body` | Dois ajustes do mesmo feedback. **Tom:** mais claro, não mais escuro — luminância relativa sobe de 0,933 para 0,965 (correção de uma tentativa anterior que tinha ido na direção errada). **Frequência:** o creme era literalmente o canvas de toda página (`body` + a maioria dos mockups de tela), bem além dos 15% que o próprio token documenta como proporção-alvo. Branco (`--asa-bg-elevated`) virou o fundo padrão; creme passou a aparecer só em composição deliberada (uma seção por página na documentação, campo de busca e placa de número nas telas de produto). Todos os pares de contraste contra ele foram recalculados em `03-cor.html` — nenhum veredito WCAG mudou, e a maioria melhorou por estar mais afastada dos tons escuros de texto. |

## Defeitos corrigidos após auditoria (10/09/2026)

Uma derivação independente do CSS, feita ao cruzar o sistema com o estudo de benchmark de 24 sites, encontrou três violações de regras que o próprio sistema declara. Todas verificadas linha a linha antes de corrigir:

1. **Foco e erro de campo usavam a mesma cor.** `.asa-input:focus` e `.asa-input[aria-invalid="true"]` pintavam a borda com `--asa-action-hover`. Num campo focado *e* inválido — o estado normal de quem errou e voltou para corrigir — o sinal de erro sumia. Como a paleta é fechada e não tem canal de atenção, o erro ganhou um segundo canal não-cromático: `border-width: 2px` contra os 1.5px dos demais estados.
2. **Legenda de foto em 10px**, abaixo do piso de 12px que a marca declara como regra dura — a mesma regra que já tinha subido o label de campo de 9px para 12px. Agora usa `--asa-fs-label`.
3. **`scroll-behavior: smooth` ignorava `prefers-reduced-motion`.** O bloco de reduced-motion em `asa-tokens.css` zera as quatro durações, mas não alcança propriedade de elemento. Ganhou regra própria em `asa-base.css`.

**Dois riscos registrados, ainda não corrigidos** (a correção depende do header de produto existir):
- `body { overflow-x: hidden }` é causa conhecida de quebra em `position: sticky`, e o portal novo depende de sticky em cinco lugares. Correção de uma linha: `overflow-x: clip`.
- `scroll-margin-top: 70px` está calibrado para a navbar desta documentação (54px). O header de produto terá ~110px e precisa virar `--asa-header-h`.

## Dívida técnica registrada

- **Fontes em `.otf`** (~75KB por face). Para produção, converter para `woff2` e subsetar para latim + diacríticos pt-BR leva a ~25KB por face. As ferramentas de conversão (`fontTools`, `brotli`, `woff2_compress`) não estavam disponíveis na máquina onde este pacote foi montado — por isso ficou como dívida, não pré-requisito. `.otf` funciona em todos os navegadores atuais.
- **Navbar duplicada nas 13 páginas.** Escolha deliberada: markup estático funciona sem JS. Mudar a navegação exige editar os 13 arquivos.

## Pendência que depende de decisão de negócio

O nível de verificação exigido no pagamento da caução depende do gateway/adquirente escolhido — se ele já impuser 3D Secure, o segundo fator do produto vira redundante. Detalhes em `09-seguranca.html`.

E os textos de consentimento LGPD, embora aprovados para seguir adiante, precisam de parecer jurídico antes de qualquer publicação.
# asa-design-system
