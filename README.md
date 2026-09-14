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

Os dois riscos que ficaram registrados nessa mesma auditoria — `overflow-x: hidden` no body e `scroll-margin-top` fixo em pixel — foram corrigidos na rodada seguinte, abaixo.

## Mapa de componentes para o portal (10/09/2026)

Dois estudos de benchmark (24 sites concorrentes) foram cruzados com o CSS atual. O resultado — **17 → ~57 componentes**, 15 lacunas de token e 13 tensões entre o que o estudo pede e as regras duras da marca — está em [`13-roadmap.html`](13-roadmap.html) e, em mais detalhe, em `MAPA-COMPONENTES_DESIGN-SYSTEM.md` (pasta acima).

Três das tensões travavam a construção porque definiam propriedades do componente mais repetido do site. Foram decididas com um critério único, fixado pelo usuário: **melhor prática de UX/CRO acima de preservar o status quo**, mesmo quando isso reescreve uma leitura anterior do próprio sistema.

- **T1 — o preço vermelho numa vitrine de 32 cards.** Decidido: o preço continua vermelho, e passa a ser o único que continua. Selo de prova social vira `asa-tag--outline`; CTA de listagem vira `asa-btn--outline` (vermelho cheio só na tela de carro único); rótulo de categoria vira `--asa-ink-3`.
- **T2 — a proporção 40/25/20/15 num site de 70 páginas.** Decidido: passa a variar por `<body data-page-mode="marketing|transactional|informational">` — menos amarelo em página transacional (menos ruído decorativo = mais conversão) e quase nenhum em página institucional/jurídica.
- **T9 — a escala tipográfica já estava furada.** Decidido: nasce uma escala de **UI** de 8 degraus ao lado da escala de conteúdo, com o mesmo piso de 12px — `--asa-fs-subtitle` (17px) e `--asa-fs-body-dense` (14px) viram degraus legítimos; os usos que estavam em 11px sobem para 12px em vez de virar exceção.

### Fundação de F1 construída nesta rodada

Tokens novos em `asa-tokens.css`: canal de atenção (`--asa-warn`, `--asa-warn-bg`), camada e sobreposição (`--asa-z-*`, `--asa-scrim`, `--asa-surface-float`), superfícies de interação (`--asa-surface-hover`, `--asa-surface-selected`, `--asa-line-strong`), offset de header (`--asa-header-h`), ícone denso (`--asa-icon-dense`) e easing de saída (`--asa-ease-in`). Densidade (`.asa-dense`) e o orçamento de amarelo por arquétipo de página (T2) em `asa-utilities.css`.

Sete componentes novos em `asa-components.css` — a camada flutuante que não existia (Lacuna 1): `asa-overlay`, `asa-modal`, `asa-sheet`, `asa-popover`, `asa-menu`, `asa-disclosure`, `asa-skiplink`. Todos sobre `--asa-surface-float` (creme, por decisão de T3 — branco sobre branco seria invisível), nenhuma sombra, nenhuma rotação (o disclosure troca de ícone, não gira), saída mais rápida que a entrada.

Extensões: `asa-tag` ganhou `--outline`/`--neutral`/`--warn`; `asa-btn` ganhou `--icon`/`--link`; `asa-alert` ganhou `--warn`/`--compact`.

### Navegação e motor de busca construídos (10/09/2026, mesmo dia)

Fechando a fundação de F1: a navegação de produto que não existia (`asa-doc-nav` é chrome desta documentação, não vai para produção) e o motor de busca completo.

**Navegação** — `asa-utilitybar` (camada superior, não sticky, escondida abaixo de 768px — telefone e idioma cabem no navdrawer), `asa-navbar` (sticky, é ela quem `--asa-header-h` mede) e `asa-navdrawer` (substituto mobile, mesmo par overlay+painel do modal).

**Motor de busca** — `asa-combobox` (quatro tipos de lugar com ícone + código IATA, dentro de um `asa-popover`), `asa-datepicker` + `asa-timeselect` (calendário de intervalo; a diária de 27h só é vendável se a hora entrar na busca), `asa-chip` (`[aria-pressed]`, radius 8px — nunca pill, a regra de forma não abre exceção) e `asa-booking-lookup` (o mesmo bloco no header, no widget e em `/minha-reserva`, com variante `--plain` para quando já mora dentro de outra moldura). `asa-search` ganhou `__tabs`/`__row`/`__chips`/`__aside` — o grid de 4 colunas virou `__row`, e as 3 instâncias existentes (`06-componentes.html`, `08-fluxo-reserva.html` ×2) foram migradas sem mudança visual.

Os 7 primitivos flutuantes da rodada anterior, a navegação e o motor de busca agora estão catalogados visualmente em `06-componentes.html` (seções **Camada flutuante**, **Navegação**, **Motor de busca**); os tokens de fundação, em `10-tokens.html` (seção **Fundação de F1**). De brinde: corrigido um `font-size: 10px` (abaixo do piso de 12px) que a própria auditoria de T9 tinha introduzido em `13-roadmap.html`.

### Fundação de F1 completa — vitrine, funil, pós-venda e confiança (10/09/2026, mesmo dia)

Os quatro elos finais, fechando os sete no total.

**Vitrine** — `asa-filters` (`__group`/`__option`/`__count`; contagem zero desabilita o input, nunca esconde a opção), `asa-resultbar`, `asa-speclist`, `asa-rating` (sem estrela por padrão — T12: o amarelo não pode virar cor de avaliação) e `asa-emptystate`. Extensões: `asa-card-vehicle` ganhou `__badge`, `__policy`, `__actions` (dois CTAs), `[data-state="soldout"]` e `--horizontal`; `asa-price` ganhou `__daily`/`__installment`/`__pix`; `asa-choice--card` (bloco selecionável com borda inteira via `:has(:checked)`). Token novo: `--asa-sidebar-w` e `.asa-layout-2col` em `asa-base.css` (Lacuna 8), que empilha abaixo de 1024px.

**Funil** — `asa-summary` (`--sticky`/`--bar` convivem no mesmo markup, a troca é só CSS por breakpoint), `asa-upsell`, `asa-comparison` (`--asa-comparison-cols` para número de planos — `auto-fit` não serve aqui, o número de colunas é decisão de quem monta a tela, não do espaço disponível), `asa-pricebreakdown` (reaproveita `asa-summary__row` dentro de um `asa-disclosure`) e `asa-paymethod` (Pix turquesa isolado — T11, único lugar do sistema com cor de terceiro).

**Pós-venda e confiança** — `asa-card-booking`, `asa-tasklist`, `asa-reassurance`, `asa-consent` (`__banner`/`__prefs`), `asa-stickybar` e `asa-figure` (o modo "foto real" ao lado de `asa-photo`).

Todos catalogados visualmente em `06-componentes.html` (seções **Vitrine**, **Funil**, **Pós-venda e confiança**). Verificado nas 14 páginas em 375/768/1440 sem regressão; dois bugs pegos na própria verificação e corrigidos antes do commit: `asa-comparison__row` usava `repeat(auto-fit, ...)` misturado com uma coluna `1.4fr`, que colapsava para 1 coluna em vez de grade — virou `repeat(var(--asa-comparison-cols, 3), ...)`; e duas instâncias de `.asa-summary__row--total` esqueceram a classe base `.asa-summary__row`, perdendo o `display:flex`.

**Fundação de F1 concluída** — os sete elos (tokens, camada flutuante, navegação, motor de busca, vitrine, funil, pós-venda/confiança) estão todos construídos e documentados. Ainda pendentes, fora do design system: a tabela de preços (RMS, dependência de negócio) e a convenção de hooks de medição do GA4 (Lacuna 15).

### F2/F3 construídos — navegação estendida, conteúdo e conta (10/09/2026, mesmo dia)

Os 12 componentes que o mapa deixava para depois de F1, agora fechados na mesma rodada.

**Navegação estendida** — `asa-footer` (`__tabs` alternando Aeroportos/Cidades/Destinos sobre `__linkhub`, a única superfície do sistema em `--asa-bg-deep` além do vídeo — aqui não há flutuação a resolver, é chão de página, não T3), `asa-breadcrumb` (último item não é link, mesma regra de `aria-current` do navbar), `asa-tabs` (linha para categoria de conteúdo, `--segmented` para a alternância binária Alugar\|Comprar — preenchimento neutro, nunca vermelho, dois lados de peso igual não disputam com o CTA) e `asa-tabbar`, promovido do chrome ilustrativo de `12-app-nativo.html` (`asa-phone__tabbar`, que continua só documentação) a componente de produto real.

**Conteúdo** — `asa-shelf` (`__track` com rolagem nativa por `overflow-x`, sem seta nem bolinha de página: "nada gira" também cobre indicador de carrossel que pulsa), os quatro cartões que a home e os hubs de página precisavam além do card de veículo (`asa-card-destination`, `asa-card-offer`, `asa-card-store`, `asa-card-article` — todos herdando o mesmo corte de 8° do card de veículo), `asa-pagination` (página atual em preenchimento ink, nunca vermelho — é posição, não ação), `asa-prose` (o bloco de texto corrido que ~70 páginas de conteúdo longo exigiam, com o sistema definindo antes só h1/h2/h3/p/small soltos), `asa-accordion` (agrupador de `asa-disclosure` para FAQ — reuso, não um quarto padrão de expansível) e `asa-testimonial`.

**Conta** — `asa-upload` (`__dropzone`, `[data-state="dragover"/"error"/"done"]`, mesmo tratamento de superfície de `asa-field` para não parecer plugin de terceiro), `asa-codeinput` (cada dígito é literalmente um `.asa-input` — herda foco, inválido e desabilitado de graça, sem reabrir a discussão de redundância de sinal do defeito #1) e `asa-card-plan` (F3, reaproveita `asa-card` + `asa-price` — o preço segue vermelho, mesmo sinal único de T1 — em vez de uma quarta variação de cartão de preço; sem gamificação, o benefício é desconto e cancelamento, nunca pontos ou selo de nível).

Todos catalogados visualmente em `06-componentes.html` (seções **Navegação estendida**, **Conteúdo**, **Conta**) e marcados "✓ Construído" em `13-roadmap.html`. Verificado em 375/768/1440 sem regressão — inclusive sem overflow horizontal introduzido pelo `asa-shelf`, que deliberadamente estoura a própria trilha mas nunca a página.

**A biblioteca de componentes do portal está completa** (F1 + F2/F3). Seguem fora do design system: a tabela de preços (RMS), a convenção de hooks de medição do GA4 (Lacuna 15) e um catálogo formal dos ícones novos usados inline (ainda não cadastrados em `05-icones.html`). Seguem como dívida dentro do sistema, sem bloquear nada: as 14 extensões menores do mapa que não pertenciam a F1 nem F2/F3 (`asa-stepper` com "Editar" por etapa, `asa-numberplate--inline`, `asa-field` com cupom inline, `asa-skeleton`/`asa-avatar` de forma).

## Revisão de cor — creme sai de circulação (12/09/2026)

Feedback de revisão: mesmo corrigido (`#FFF7E3` → `#FFFBF0`, ver divergência #5), o creme ainda lia como "amarelo diluído" em toda superfície que o usava — seção de composição, vitrine de componente na documentação, e a camada flutuante inteira do produto (modal, sheet, popover, menu, navdrawer). Nasce `--asa-mist` (`#F4F4F3`), um cinza ultraclaro sem viés de matiz, que assume os dois papéis que o creme cumpria (`--asa-bg` e `--asa-surface-float`). `--asa-cream` continua existindo como primitivo — histórico, documentado em `10-tokens.html` — mas nenhuma superfície viva do sistema o consome mais. Amarelo cheio (`--asa-yellow`) fica intocado: continua reservado a acento deliberado (capa, badge, assinatura).

De brinde, o scan determinístico rodado durante esta correção achou um bug anterior e não relacionado: `.asa-doc-nav` usava um `rgba(255, 247, 227, .94)` hardcoded — o creme **antigo**, de antes da correção de tom de 2026, nunca atualizado quando o resto do sistema migrou. Virou `rgba(255, 255, 255, .94)`. E um segundo, em `01-fundamentos.html`: um `.asa-doc-block` solto dentro de `.asa-doc-section--dense` herdava `--asa-ink-3` (cor de legenda para fundo claro) sobre fundo preto — 2,7:1, reprovando AA. Corrigido em `asa-docs.css` com uma regra de seção que cobre qualquer glosa "solta" numa seção escura, sem tocar nos cards que já tinham tratamento próprio.

Todos os pares de contraste que citavam creme foram recalculados contra `--asa-mist` em `03-cor.html` — nenhum veredito WCAG mudou.

## Dívida técnica registrada

- **Fontes em `.otf`** (~75KB por face). Para produção, converter para `woff2` e subsetar para latim + diacríticos pt-BR leva a ~25KB por face. As ferramentas de conversão (`fontTools`, `brotli`, `woff2_compress`) não estavam disponíveis na máquina onde este pacote foi montado — por isso ficou como dívida, não pré-requisito. `.otf` funciona em todos os navegadores atuais.
- **Navbar duplicada nas 13 páginas.** Escolha deliberada: markup estático funciona sem JS. Mudar a navegação exige editar os 13 arquivos.

## Pendência que depende de decisão de negócio

O nível de verificação exigido no pagamento da caução depende do gateway/adquirente escolhido — se ele já impuser 3D Secure, o segundo fator do produto vira redundante. Detalhes em `09-seguranca.html`.

E os textos de consentimento LGPD, embora aprovados para seguir adiante, precisam de parecer jurídico antes de qualquer publicação.
# asa-design-system
