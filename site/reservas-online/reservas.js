/* ==========================================================================
   RESERVAS ONLINE · etapa 1, a vitrine.
   Lê a busca da URL (local, retirada, devolucao, cupom), monta o resumo,
   os cards, os filtros com contagem, a ordenação e os estados da copy
   (carregando, vazio por filtro, tudo esgotado, erro, sem busca, busca
   expirada). Os filtros também vivem na URL e sobrevivem ao recarregar.

   Protótipo: GRUPOS traz a frota de 00a-fonte-de-verdade, mas a tarifa e o
   esgotado são de exemplo. Em produção os dois vêm do motor de reservas.
   Roda antes do site.js (para a busca já abrir preenchida); o que depende
   do site.js espera o DOMContentLoaded.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var track = function (ev, p) { (window.asaTrack || function () {})(ev, p); };
  var LISO = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  /* ---------- Frota (00a, 25/09) e preço de exemplo ----------
     cats: os atalhos e o filtro de categoria. D e D+ são hatch automático:
     entram em "Hatch" (a copy lista só A, B e B+; ver PENDENCIAS.md).
     malas: 1–2 conta em "até 2"; 3–4 em "3 ou mais"; 2–3 nos dois, até a
     Asa decidir. tarifa: diária de exemplo, sem proteção e sem taxa. */
  var GRUPOS = [
    { g: 'A',  cat: 'Hatch econômico',  modelo: 'Fiat Mobi',                     cambio: 'Manual',     lugares: 5, portas: 4, malas: '1–2', cats: ['hatch'],             tarifa: 109 },
    { g: 'B',  cat: 'Hatch econômico',  modelo: 'Hyundai HB20 1.0',              cambio: 'Manual',     lugares: 5, portas: 4, malas: '2–3', cats: ['hatch'],             tarifa: 119, selo: 'Preferido do público' },
    { g: 'B+', cat: 'Hatch econômico',  modelo: 'Chevrolet Onix 1.0',            cambio: 'Manual',     lugares: 5, portas: 4, malas: '2–3', cats: ['hatch'],             tarifa: 125 },
    { g: 'C+', cat: 'Sedã',             modelo: 'Chevrolet Onix Plus 1.0',       cambio: 'Manual',     lugares: 5, portas: 4, malas: '2–3', cats: ['seda'],              tarifa: 135 },
    { g: 'D',  cat: 'Hatch automático', modelo: 'Citroën C3 Live Pack 1.6',      cambio: 'Automático', lugares: 5, portas: 4, malas: '1–2', cats: ['hatch'],             tarifa: 139 },
    { g: 'D+', cat: 'Hatch automático', modelo: 'Chevrolet Onix 1.0 Turbo',      cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['hatch'],             tarifa: 149 },
    { g: 'E+', cat: 'Sedã automático',  modelo: 'Chevrolet Onix Plus 1.0 Turbo', cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['seda'],              tarifa: 159 },
    { g: 'F+', cat: '7 lugares',        modelo: 'Chevrolet Spin 1.8',            cambio: 'Automático', lugares: 7, portas: 4, malas: '3–4', cats: ['7-lugares'],         tarifa: 189 },
    { g: 'G+', cat: 'SUV',              modelo: 'Chevrolet Tracker 1.0 Turbo',   cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['suv'],               tarifa: 179 },
    { g: 'H',  cat: 'Picape',           modelo: 'Fiat Strada 1.3',               cambio: 'Manual',     lugares: 2, portas: 2, malas: '3–4', cats: ['picape'],            tarifa: 169 },
    { g: 'I+', cat: 'SUV 7 lugares',    modelo: 'Jeep Commander 1.3',            cambio: 'Automático', lugares: 7, portas: 4, malas: '2–3', cats: ['suv', '7-lugares'],  tarifa: 259 },
    { g: 'J+', cat: 'SUV',              modelo: 'Jeep Compass 1.3',              cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['suv'],               tarifa: 239 },
    { g: 'N+', cat: 'Sedã automático',  modelo: 'Toyota Corolla 2.0',            cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['seda'],              tarifa: 229, esgotado: true },
    { g: 'O+', cat: 'Picape 4x4',       modelo: 'Fiat Toro 2.0',                 cambio: 'Automático', lugares: 5, portas: 4, malas: '3–4', cats: ['picape'],            tarifa: 279, x4: true },
    { g: 'P+', cat: 'Picape 4x4',       modelo: 'Chevrolet S10 2.8 CD',          cambio: 'Automático', lugares: 5, portas: 4, malas: '3–4', cats: ['picape'],            tarifa: 329, x4: true }
  ];
  var PROTECAO = 19.90;   // proteção básica por dia (FICHA, 08/09)
  var TAXA = 0.12;        // taxa administrativa sobre diárias + proteção
  var CUPONS = { BEMVINDOASA: 0.15 };

  var LOCAIS = {
    REC: { nome: 'Aeroporto do Recife', curto: 'no Aeroporto do Recife', balcao: 'Portão A5 de Desembarque, com o carro no pátio do aeroporto.', url: '/aluguel-de-carros/aeroporto-recife' },
    FOR: { nome: 'Aeroporto de Fortaleza', curto: 'no Aeroporto de Fortaleza', balcao: 'Área de Locadoras, no Terminal de Desembarque.', url: '/aluguel-de-carros/aeroporto-fortaleza' }
  };
  var CAT_NOME = { hatch: 'Hatch', seda: 'Sedã', suv: 'SUV', '7-lugares': '7 lugares', picape: 'Picape' };
  var FILTRO_NOME = { cambio: 'cambio', lugares: 'lugares', malas: 'malas', categoria: 'categoria' };

  /* ---------- Busca da URL ---------- */
  var q = new URLSearchParams(location.search);
  var estado = q.get('estado') || '';
  var local = q.get('local');
  var ini = q.get('retirada') ? new Date(q.get('retirada')) : null;
  var fim = q.get('devolucao') ? new Date(q.get('devolucao')) : null;
  var buscaOk = LOCAIS[local] && ini && fim && !isNaN(ini) && !isNaN(fim) && fim > ini;
  var codigo = (q.get('cupom') || '').toUpperCase();
  var desconto = CUPONS[codigo] || 0;
  if (!desconto) codigo = '';

  var HORA = 3600 * 1000, DIA = 24 * HORA;
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var toLocal = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  var hora = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var data = function (d) { return d.getDate() + ' ' + MESES[d.getMonth()]; };
  var dataCurta = function (d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var real = function (v) { return BRL.format(v); };

  // Diárias pela regra das 27 horas: as 3 primeiras horas além de cada 24 não abrem diária nova.
  var dias = buscaOk ? Math.max(1, Math.ceil((fim - ini - 3 * HORA) / DIA)) : 0;
  var limite = buscaOk ? new Date(ini.getTime() + dias * DIA + 3 * HORA) : null;

  GRUPOS.forEach(function (c) {
    c.cheio = Math.round((c.tarifa + PROTECAO) * dias * (1 + TAXA) * 100) / 100;
    c.total = Math.round(c.cheio * (1 - desconto) * 100) / 100;
    c.diaria = dias ? Math.round(c.total / dias * 100) / 100 : 0;
    c.malasMax = +c.malas.split('–')[1];
    c.malasOpt = c.malas === '1–2' ? ['ate2'] : c.malas === '3–4' ? ['3mais'] : ['ate2', '3mais'];
    c.motor = c.modelo.match(/\d\.\d( Turbo)?/) ? c.modelo.match(/\d\.\d( Turbo)?/)[0] : '';
    if (estado === 'esgotado') c.esgotado = true;
  });

  /* Preenche a busca de "Alterar busca" com a busca atual, antes do site.js. */
  var busca = $('[data-booking]');
  if (busca && buscaOk) {
    busca.elements.local.value = local;
    busca.elements.retirada.value = toLocal(ini);
    busca.elements.devolucao.value = toLocal(fim);
    if (codigo) busca.dataset.cupomInicial = codigo;
  }

  /* ---------- Filtros: estado e URL ---------- */
  var form = $('[data-form-filtros]');
  var sel = { cambio: [], lugares: [], malas: [], categoria: [] };
  var precoMin = Math.floor(Math.min.apply(null, GRUPOS.map(function (c) { return c.total; })) / 10) * 10;
  var precoMax = Math.ceil(Math.max.apply(null, GRUPOS.map(function (c) { return c.total; })) / 10) * 10;
  var faixa = { min: precoMin, max: precoMax };
  var ordem = q.get('ordem') || 'recomendado';
  var ultimo = [];   // pilha de filtros aplicados, para "Tirar o último filtro"

  Object.keys(sel).forEach(function (k) { if (q.get(k)) sel[k] = q.get(k).split(','); });
  if (q.get('pmin')) faixa.min = Math.max(precoMin, +q.get('pmin'));
  if (q.get('pmax')) faixa.max = Math.min(precoMax, +q.get('pmax'));

  function passa(c, ignorar) {
    if (ignorar !== 'cambio' && sel.cambio.length && sel.cambio.indexOf(c.cambio === 'Automático' ? 'automatico' : 'manual') === -1) return false;
    if (ignorar !== 'lugares' && sel.lugares.length && sel.lugares.indexOf(String(c.lugares)) === -1) return false;
    if (ignorar !== 'malas' && sel.malas.length && !c.malasOpt.some(function (m) { return sel.malas.indexOf(m) !== -1; })) return false;
    if (ignorar !== 'categoria' && sel.categoria.length && !c.cats.some(function (m) { return sel.categoria.indexOf(m) !== -1; })) return false;
    if (ignorar !== 'preco' && (c.total < faixa.min || c.total > faixa.max)) return false;
    return true;
  }
  function casa(c, grupo, valor) {
    if (grupo === 'cambio') return (c.cambio === 'Automático' ? 'automatico' : 'manual') === valor;
    if (grupo === 'lugares') return String(c.lugares) === valor;
    if (grupo === 'malas') return c.malasOpt.indexOf(valor) !== -1;
    if (grupo === 'categoria') return c.cats.indexOf(valor) !== -1;
    return false;
  }
  function ativos() {
    return Object.keys(sel).reduce(function (n, k) { return n + sel[k].length; }, 0) + (faixa.min > precoMin || faixa.max < precoMax ? 1 : 0);
  }
  function salvarUrl() {
    var u = new URLSearchParams(location.search);
    Object.keys(sel).forEach(function (k) { if (sel[k].length) u.set(k, sel[k].join(',')); else u.delete(k); });
    if (faixa.min > precoMin) u.set('pmin', faixa.min); else u.delete('pmin');
    if (faixa.max < precoMax) u.set('pmax', faixa.max); else u.delete('pmax');
    if (ordem !== 'recomendado') u.set('ordem', ordem); else u.delete('ordem');
    history.replaceState(null, '', location.pathname + '?' + u.toString() + location.hash);
  }

  /* ---------- Ordenação ---------- */
  function ordenar(lista) {
    var f = {
      menor: function (a, b) { return a.total - b.total; },
      maior: function (a, b) { return b.total - a.total; },
      lugares: function (a, b) { return b.lugares - a.lugares || a.total - b.total; },
      malas: function (a, b) { return b.malasMax - a.malasMax || a.total - b.total; },
      recomendado: function (a, b) { return a.total - b.total; }
    }[ordem];
    // Esgotado vai para o fim em qualquer ordem: o card continua, mas não disputa a escolha.
    return lista.slice().sort(function (a, b) { return (a.esgotado ? 1 : 0) - (b.esgotado ? 1 : 0) || f(a, b); });
  }

  /* ---------- Card ---------- */
  var CHECK = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function proxima(c) {
    var u = new URLSearchParams({ local: local, retirada: toLocal(ini), devolucao: toLocal(fim), grupo: c.g });
    if (codigo) u.set('cupom', codigo);
    return '/reservas-online/adicionais?' + u.toString();
  }
  function specs(c) {
    var s = [c.lugares + ' lugares', c.malas.replace('–', ' a ') + ' malas', c.cambio, 'Ar-condicionado', 'Km livre', c.portas + ' portas'];
    if (c.x4) s.push('4x4');
    return s.join(' · ');
  }
  function card(c, primeiro) {
    var alt = c.modelo + ', ' + c.cat.toLowerCase() + ' da frota Asa';
    // O selo vai sobre a foto, no canto baixo: acima do título ele seria sobretítulo.
    var selo = c.selo && !c.esgotado ? '<span class="asa-tag asa-tag--outline site-vcard__badge">' + c.selo + '</span>' : '';
    var preco;
    if (c.esgotado) {
      preco = '<div class="site-vcard__soldout"><span class="asa-tag asa-tag--neutral">Esgotado nesta data</span>' +
        '<p>Este grupo não tem carro livre para o seu período.</p>' +
        '<button class="asa-btn asa-btn--link asa-btn--sm" type="button" data-abrir-busca>Mudar as datas</button></div>';
    } else {
      var antes = desconto ? '<s class="site-vcard__old" aria-hidden="true">' + real(c.cheio) + '</s>' : '';
      var aria = desconto ? ' aria-label="Antes ' + real(c.cheio) + ', agora ' + real(c.total) + '"' : '';
      preco = '<div class="asa-price site-vcard__price">' +
        '<span class="asa-price__label">Total de ' + dias + (dias === 1 ? ' diária' : ' diárias') + '</span>' + antes +
        '<span class="asa-price__value"' + aria + '>' + real(c.total) + '</span>' +
        '<span class="asa-price__note">Preço final · proteção básica e taxa inclusas</span>' +
        '<span class="asa-price__daily">Diária ' + real(c.diaria) + '</span>' +
        (desconto ? '<span class="asa-price__installment">Com cupom ' + codigo + '</span>' : '') +
        '</div>' +
        '<p class="asa-card-vehicle__policy">' + CHECK + 'Cancele grátis até 24h antes da retirada</p>' +
        '<div class="asa-card-vehicle__actions">' +
        '<a class="asa-btn ' + (primeiro ? 'asa-btn--primary' : 'asa-btn--outline') + ' asa-btn--sm" href="' + proxima(c) + '" data-escolher>Escolher este carro</a>' +
        '<button class="asa-btn asa-btn--link asa-btn--sm" type="button" data-detalhes aria-haspopup="dialog">Ver detalhes<span class="site-sr"> do grupo ' + c.g + '</span></button>' +
        '</div>';
    }
    return '<li><article class="asa-card asa-card-vehicle site-vcard"' + (c.esgotado ? ' data-esgotado' : '') + ' data-grupo="' + c.g + '">' +
      '<div class="asa-cut site-vcard__media"><div class="asa-cut__media asa-photo" style="aspect-ratio:16/9" role="img" aria-label="' + esc(alt) + '">' +
      '<span class="asa-photo__caption">[ foto · ' + esc(c.modelo) + ', 3/4 frontal, fundo limpo ]</span></div>' + selo + '</div>' +
      '<div class="asa-card__body">' +
      '<h2 class="asa-card-vehicle__title">' + esc(c.modelo) + ' ou similar</h2>' +
      '<span class="asa-card-vehicle__category">Grupo ' + c.g + ' · ' + c.cat + '</span>' +
      '<p class="asa-card-vehicle__specs">' + specs(c) + '</p>' + preco +
      '</div></article></li>';
  }
  function item(c, i) {
    var it = { item_id: c.g, item_name: c.modelo, item_category: c.cat, item_variant: c.cambio, price: c.total, index: i, currency: 'BRL' };
    if (c.esgotado) it.item_category2 = 'esgotado';
    return it;
  }

  /* ---------- Desenho da lista ---------- */
  var ul = $('[data-resultados]');
  var vazio = $('[data-vazio]');
  var contador = $('[data-contador]');
  var anuncio = $('[data-anuncio]');
  var lista = [];

  var DIARIA_27 = function () {
    return '<li class="site-results__wide"><div class="asa-alert asa-alert--info">' +
      '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<div class="asa-alert__body"><span class="asa-alert__title">Diária de 27 horas</span>' +
      '<span class="asa-alert__text">Cada diária tem 3 horas de tolerância na devolução. Nesta busca, você devolve até as ' + hora(limite) + ' do dia ' + data(limite) +
      ' sem pagar outra diária. <a href="/diaria-27-horas">Como funciona a diária de 27 horas</a></span></div></div></li>';
  };

  function waLink(topico) {
    var texto = 'Olá! Quero reservar um carro ' + LOCAIS[local].curto + ', retirada no dia ' + dataCurta(ini) + ' às ' + hora(ini) +
      ', devolução no dia ' + dataCurta(fim) + ' às ' + hora(fim) + '.';
    return '<a class="asa-btn asa-btn--link" href="https://wa.me/5508000800015?text=' + encodeURIComponent(texto) + '" target="_blank" rel="noopener noreferrer" data-wa-vitrine="' + topico + '">' +
      (topico === 'disponibilidade' ? 'Consultar no WhatsApp' : 'Reservar pelo WhatsApp') + '<span class="site-sr"> (abre em nova aba)</span></a>';
  }
  function estadoVazio(titulo, texto, acoes) {
    vazio.innerHTML = '<div class="asa-emptystate site-empty"><h2 class="asa-emptystate__title">' + titulo + '</h2>' +
      '<p class="asa-emptystate__text">' + texto + '</p><div class="site-empty__actions">' + acoes + '</div></div>';
  }

  function contar() {
    // As contagens são de carros livres: o esgotado aparece na lista, mas não conta como opção.
    var GRUPOS = livresDe();
    $$('[data-conta]', form).forEach(function (span) {
      var par = span.dataset.conta.split(':');
      var n = GRUPOS.filter(function (c) { return passa(c, par[0]) && casa(c, par[0], par[1]); }).length;
      var input = span.parentNode.querySelector('input');
      span.textContent = n;
      input.checked = sel[par[0]].indexOf(par[1]) !== -1;
      // Opção com zero fica desabilitada, sem sumir (sumir muda o layout a cada clique).
      input.disabled = n === 0 && !input.checked;
    });
    $$('[data-chip]').forEach(function (b) {
      var v = b.dataset.chip, n;
      if (v === 'todos') n = GRUPOS.filter(function (c) { return passa(c, 'categoria') && passa(c, 'cambio'); }).length;
      else if (v === 'automatico') n = GRUPOS.filter(function (c) { return passa(c, 'cambio') && c.cambio === 'Automático'; }).length;
      else n = GRUPOS.filter(function (c) { return passa(c, 'categoria') && c.cats.indexOf(v) !== -1; }).length;
      $('[data-chip-conta]', b).textContent = '(' + n + ')';
      var on = v === 'todos' ? !sel.categoria.length && !sel.cambio.length
        : v === 'automatico' ? sel.cambio.length === 1 && sel.cambio[0] === 'automatico'
        : sel.categoria.length === 1 && sel.categoria[0] === v;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.disabled = n === 0 && !on;
    });
    var a = ativos();
    $('[data-limpar]').hidden = !a;
    $('[data-filtros-rotulo]').textContent = a ? 'Filtros (' + a + ')' : 'Filtros';
    $('[data-preco-min-txt]').textContent = real(faixa.min);
    $('[data-preco-max-txt]').textContent = real(faixa.max);
  }

  function livresDe() { return GRUPOS.filter(function (c) { return !c.esgotado; }); }

  function desenhar(motivo) {
    lista = ordenar(GRUPOS.filter(function (c) { return passa(c); }));
    var livres = lista.filter(function (c) { return !c.esgotado; });
    var todosLivres = GRUPOS.filter(function (c) { return !c.esgotado; }).length;
    contar();
    ul.removeAttribute('aria-busy');
    vazio.innerHTML = '';

    if (!todosLivres) {
      ul.innerHTML = '';
      contador.textContent = 'Nenhum carro livre';
      estadoVazio('Não há carro livre nessas datas', 'Os grupos estão reservados para esse período ' + LOCAIS[local].curto + '. Tente outro horário ou fale com a equipe no WhatsApp.',
        '<button class="asa-btn asa-btn--primary" type="button" data-abrir-busca>Mudar as datas</button>' + waLink('disponibilidade'));
      ligar();
      return;
    }
    if (!lista.length) {
      ul.innerHTML = '';
      contador.textContent = '0 carros com esses filtros';
      estadoVazio('Nenhum carro com esses filtros', 'Tire um filtro para ver mais opções. ' + todosLivres + ' carros estão disponíveis nas suas datas.',
        '<button class="asa-btn asa-btn--primary" type="button" data-limpar-todos>Limpar filtros</button>' +
        (ultimo.length ? '<button class="asa-btn asa-btn--link" type="button" data-tirar-ultimo>Tirar o último filtro</button>' : ''));
      anuncio.textContent = '0 carros com os filtros escolhidos.';
      ligar();
      return;
    }

    var html = [], vermelho = false;
    lista.forEach(function (c, i) {
      var primeiro = !vermelho && !c.esgotado;
      if (primeiro) vermelho = true;
      html.push(card(c, primeiro));
      if (i === 2) html.push(DIARIA_27());
    });
    if (lista.length < 3) html.push(DIARIA_27());
    ul.innerHTML = html.join('');
    contador.textContent = livres.length + (livres.length === 1 ? ' carro para as suas datas' : ' carros para as suas datas');
    if (motivo === 'filtro') anuncio.textContent = livres.length + (livres.length === 1 ? ' carro com os filtros escolhidos.' : ' carros com os filtros escolhidos.');
    track('view_item_list', { item_list_id: 'resultado_busca', item_list_name: 'Resultado da busca ' + local, items: lista.map(item) });
    ligar();
  }

  /* ---------- Ações dos cards e dos estados ---------- */
  function ligar() {
    $$('[data-escolher]', ul).forEach(function (a) {
      var c = grupoDe(a);
      a.addEventListener('click', function () {
        track('select_item', { item_list_id: 'resultado_busca', items: [item(c, lista.indexOf(c))], value: c.total, currency: 'BRL' });
      });
    });
    $$('[data-detalhes]', ul).forEach(function (b) { b.addEventListener('click', function () { abrirDetalhes(grupoDe(b), b); }); });
    $$('[data-abrir-busca]', document.querySelector('[data-vitrine]')).forEach(function (b) {
      if (!b.ligado) { b.ligado = true; b.addEventListener('click', function () { abrirBusca(b); }); }
    });
    var limpar = $('[data-limpar-todos]', vazio);
    if (limpar) limpar.addEventListener('click', function () { limparTudo(); });
    var tirar = $('[data-tirar-ultimo]', vazio);
    if (tirar) tirar.addEventListener('click', function () {
      var f = ultimo.pop();
      if (f.tipo === 'preco') { faixa.min = precoMin; faixa.max = precoMax; syncRange(); }
      else sel[f.tipo] = sel[f.tipo].filter(function (v) { return v !== f.valor; });
      aplicar(null);
    });
    $$('[data-wa-vitrine]', vazio).forEach(function (a) {
      a.addEventListener('click', function () { track('generate_lead', { method: 'whatsapp', lead_topic: a.dataset.waVitrine, page_type: 'vitrine' }); });
    });
  }
  function grupoDe(el) { var g = el.closest('[data-grupo]').dataset.grupo; return GRUPOS.filter(function (c) { return c.g === g; })[0]; }

  function aplicar(evento) {
    salvarUrl();
    desenhar('filtro');
    if (evento) track('filter_applied', { filter_type: evento.tipo, filter_value: evento.valor, results_count: lista.filter(function (c) { return !c.esgotado; }).length });
  }
  function limparTudo() {
    Object.keys(sel).forEach(function (k) { sel[k] = []; });
    faixa.min = precoMin; faixa.max = precoMax; ultimo = [];
    syncRange();
    aplicar(null);
  }

  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type !== 'checkbox') return;
    var arr = sel[t.name];
    if (t.checked) { arr.push(t.value); ultimo.push({ tipo: t.name, valor: t.value }); }
    else {
      sel[t.name] = arr.filter(function (v) { return v !== t.value; });
      ultimo = ultimo.filter(function (f) { return !(f.tipo === t.name && f.valor === t.value); });
    }
    aplicar({ tipo: FILTRO_NOME[t.name], valor: t.value });
  });

  /* Preço: dois controles ("De" e "Até"), com os valores escritos. */
  var rMin = $('[data-preco-min]'), rMax = $('[data-preco-max]');
  function syncRange() {
    [rMin, rMax].forEach(function (r) { r.min = precoMin; r.max = precoMax; });
    rMin.value = faixa.min; rMax.value = faixa.max;
    rMin.setAttribute('aria-valuetext', real(faixa.min));
    rMax.setAttribute('aria-valuetext', real(faixa.max));
  }
  [rMin, rMax].forEach(function (r) {
    r.addEventListener('input', function () {
      var a = +rMin.value, b = +rMax.value;
      if (r === rMin && a > b) rMin.value = a = b;
      if (r === rMax && b < a) rMax.value = b = a;
      faixa.min = a; faixa.max = b;
      syncRange();
      $('[data-preco-min-txt]').textContent = real(a);
      $('[data-preco-max-txt]').textContent = real(b);
    });
    r.addEventListener('change', function () {
      ultimo.push({ tipo: 'preco' });
      aplicar({ tipo: 'preco', valor: faixa.min + '-' + faixa.max });
    });
  });

  $('[data-limpar]').addEventListener('click', limparTudo);

  /* Atalhos: marcam o mesmo filtro do painel. Uma categoria por vez;
     "Automático" liga o câmbio automático; "Todos" limpa os dois. */
  $$('[data-chip]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.chip, on = b.getAttribute('aria-pressed') === 'true';
      if (v === 'todos') { sel.categoria = []; sel.cambio = []; }
      else if (v === 'automatico') sel.cambio = on ? [] : ['automatico'];
      else sel.categoria = on ? [] : [v];
      if (!on && v !== 'todos') ultimo.push({ tipo: v === 'automatico' ? 'cambio' : 'categoria', valor: v });
      aplicar({ tipo: v === 'automatico' ? 'cambio' : 'categoria', valor: v });
    });
  });

  $('[data-ordem]').value = ordem;
  $('[data-ordem]').addEventListener('change', function (e) {
    ordem = e.target.value;
    salvarUrl();
    desenhar('ordem');
    track('sort_applied', { sort_value: ordem });
  });

  /* ---------- Camadas: modal e painel, com foco preso e Esc ---------- */
  var aberta = null;
  function abrir(camada, veu, gatilho, foco) {
    var sup = $('.asa-modal__surface, .asa-sheet__surface', camada);
    aberta = { camada: camada, veu: veu, gatilho: gatilho, sup: sup };
    sup.removeAttribute('inert');
    camada.setAttribute('data-state', 'open');
    if (veu) veu.setAttribute('data-state', 'open');
    document.documentElement.classList.add('site-travado');
    setTimeout(function () { (foco || $('button, a[href], input, select', sup)).focus(); }, 30);
  }
  function fechar() {
    if (!aberta) return;
    var a = aberta;
    aberta = null;
    a.camada.setAttribute('data-state', 'closing');
    if (a.veu) a.veu.setAttribute('data-state', 'closing');
    setTimeout(function () {
      a.camada.setAttribute('data-state', 'closed');
      if (a.veu) a.veu.setAttribute('data-state', 'closed');
      if (!(a.camada === painel && desk.matches)) a.sup.setAttribute('inert', '');
    }, 160);
    document.documentElement.classList.remove('site-travado');
    if (a.gatilho && document.contains(a.gatilho)) a.gatilho.focus();
    // Gatilho que não recebe mais foco (o "Reservar" do menu do celular,
    // que já fechou): o foco volta ao "Alterar busca" do resumo.
    if (document.activeElement !== a.gatilho || a.sup.contains(document.activeElement)) {
      var volta = $('[data-resumo] [data-abrir-busca]');
      if (volta && !volta.closest('[hidden]')) volta.focus(); else document.body.focus();
    }
  }
  document.addEventListener('keydown', function (e) {
    if (!aberta) return;
    if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('a[href], button:not([disabled]), input:not([disabled]), select, summary', aberta.sup).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  $$('[data-fechar-modal]').forEach(function (b) { b.addEventListener('click', fechar); });
  $$('[data-veu-busca], [data-veu-detalhes]').forEach(function (v) { v.addEventListener('click', fechar); });

  var modalBusca = $('[data-modal-busca]');
  function abrirBusca(gatilho) { abrir(modalBusca, $('[data-veu-busca]'), gatilho, busca.elements.retirada); }
  $$('[data-abrir-busca]').forEach(function (b) { b.ligado = true; b.addEventListener('click', function () { abrirBusca(b); }); });

  var modalDet = $('[data-modal-detalhes]');
  function abrirDetalhes(c, gatilho) {
    $('[data-det-titulo]').textContent = 'Grupo ' + c.g + ' · ' + c.modelo + ' ou similar';
    var linhas = [['Câmbio', c.cambio], ['Lugares', c.lugares], ['Portas', c.portas], ['Malas', c.malas.replace('–', ' a ') + ' malas médias'],
      ['Motor', c.motor + (c.x4 ? ', tração 4x4' : '')], ['Ar-condicionado', 'Sim'], ['Quilometragem', 'Livre']];
    $('[data-det-tabela]').innerHTML = linhas.map(function (l) { return '<tr><th scope="row">' + l[0] + '</th><td>' + l[1] + '</td></tr>'; }).join('');
    var esc_ = $('[data-det-escolher]');
    esc_.href = proxima(c);
    esc_.hidden = !!c.esgotado;
    esc_.onclick = function () { track('select_item', { item_list_id: 'resultado_busca', items: [item(c, lista.indexOf(c))], value: c.total, currency: 'BRL' }); };
    abrir(modalDet, $('[data-veu-detalhes]'), gatilho);
    track('view_item', { items: [item(c, lista.indexOf(c))], value: c.total, currency: 'BRL' });
  }

  /* Filtros: no celular viram painel ancorado embaixo; no desktop, coluna. */
  var painel = $('[data-filtros]');
  var desk = matchMedia('(min-width: 1024px)');
  var supF = $('.asa-sheet__surface', painel);
  function modoFiltros() {
    if (desk.matches) {
      if (aberta && aberta.camada === painel) fechar();
      supF.removeAttribute('role'); supF.removeAttribute('aria-modal'); supF.removeAttribute('inert');
    } else {
      supF.setAttribute('role', 'dialog'); supF.setAttribute('aria-modal', 'true');
      if (painel.getAttribute('data-state') !== 'open') supF.setAttribute('inert', '');
    }
  }
  modoFiltros();
  desk.addEventListener('change', modoFiltros);
  // O botão "Filtros" fica no pé só enquanto a lista está na tela: no rodapé
  // ele cobriria os links.
  var btnFiltros = $('[data-abrir-filtros]');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { btnFiltros.classList.toggle('site-filters__open--fora', !es[0].isIntersecting); })
      .observe($('[data-vitrine]'));
  }
  $('[data-abrir-filtros]').addEventListener('click', function (e) { abrir(painel, $('.site-filters__veil', painel), e.currentTarget); });
  $$('[data-fechar-filtros]', painel).forEach(function (b) {
    b.addEventListener('click', function () {
      fechar();
      if (b.hasAttribute('data-ver-carros')) $('[data-vitrine]').scrollIntoView({ behavior: LISO });
    });
  });
  var verCarros = $('[data-ver-carros]');
  var obsCont = new MutationObserver(function () {
    var n = lista.filter(function (c) { return !c.esgotado; }).length;
    verCarros.textContent = n ? 'Ver ' + n + (n === 1 ? ' carro' : ' carros') : 'Ver resultado';
  });
  obsCont.observe(contador, { childList: true, characterData: true, subtree: true });

  /* ---------- Resumo da busca ---------- */
  function resumo() {
    var r = $('[data-resumo]');
    r.hidden = false;
    $('[data-resumo-local]').textContent = LOCAIS[local].nome + ' (' + local + ')';
    $('[data-resumo-retirada]').textContent = 'Retirada ' + data(ini) + ', ' + hora(ini);
    $('[data-resumo-devolucao]').textContent = 'Devolução ' + data(fim) + ', ' + hora(fim);
    $('[data-resumo-regra]').innerHTML = '<b>' + dias + (dias === 1 ? ' diária.' : ' diárias.') + '</b> Com a diária de 27 horas, você devolve até as ' + hora(limite) + ' sem outra diária.';
    if (codigo) {
      var cp = $('[data-resumo-cupom]');
      cp.hidden = false;
      $('.asa-tag', cp).textContent = 'Cupom ' + codigo + ' aplicado';
    }
    $('[data-titulo]').textContent = 'Carros disponíveis no ' + LOCAIS[local].nome;
    $('[data-balcao]').textContent = LOCAIS[local].balcao;
    $('[data-balcao-link]').href = LOCAIS[local].url;
    $('[data-balcao-link]').textContent = 'Como chegar ao balcão ' + (local === 'REC' ? 'de Recife' : 'de Fortaleza');
  }

  /* ---------- Estados de carga ---------- */
  function esqueleto() {
    ul.setAttribute('aria-busy', 'true');
    contador.textContent = 'Estamos conferindo a disponibilidade para as suas datas.';
    $('[data-titulo]').textContent = 'Procurando carros ' + LOCAIS[local].curto;
    $$('[data-chip-conta]').forEach(function (s) { s.textContent = ''; });
    var sk = '<li><div class="asa-card" aria-hidden="true"><div class="asa-skeleton asa-skeleton--media"></div><div class="asa-card__body site-skel">' +
      '<div class="asa-skeleton asa-skeleton--title" style="width:80%"></div><div class="asa-skeleton asa-skeleton--text" style="width:50%"></div>' +
      '<div class="asa-skeleton asa-skeleton--text" style="width:90%"></div><div class="asa-skeleton" style="width:60%;height:36px"></div>' +
      '<div class="asa-skeleton" style="width:100%;height:36px"></div></div></div></li>';
    ul.innerHTML = sk + sk + sk;
  }
  function erro() {
    ul.removeAttribute('aria-busy');
    ul.innerHTML = '';
    contador.textContent = '';
    $('[data-titulo]').textContent = 'Carros disponíveis no ' + LOCAIS[local].nome;
    estadoVazio('Não conseguimos carregar os carros', 'A busca falhou do nosso lado. Tente de novo em alguns segundos. Se continuar, a reserva pode ser feita pelo WhatsApp.',
      '<button class="asa-btn asa-btn--primary" type="button" data-tentar>Tentar de novo</button>' + waLink('reserva'));
    $$('[data-wa-vitrine]', vazio).forEach(function (a) {
      a.addEventListener('click', function () { track('generate_lead', { method: 'whatsapp', lead_topic: 'reserva', page_type: 'vitrine' }); });
    });
    $('[data-tentar]', vazio).addEventListener('click', function () { estado = ''; carregar(); });
  }
  function carregar() {
    esqueleto();
    if (estado === 'carregando') return;
    // Protótipo: o tempo de resposta do motor.
    setTimeout(function () {
      if (estado === 'erro') { erro(); return; }
      $('[data-titulo]').textContent = 'Carros disponíveis no ' + LOCAIS[local].nome;
      vazio.innerHTML = '';
      desenhar('carga');
      track('view_search_results', {
        search_term: local, pickup_date: toLocal(ini), return_date: toLocal(fim), rental_days: dias, one_way: false,
        coupon: codigo, results_count: GRUPOS.filter(function (c) { return !c.esgotado; }).length
      });
    }, 700);
  }

  /* "Reservar" do cabeçalho e do menu do celular: aqui a busca já existe,
     então ele abre "Alterar busca" em vez de levar à home. Sem busca
     válida, rola até a busca aberta na página. */
  $$('[data-reservar]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (buscaOk) { setTimeout(function () { abrirBusca(a); }, 0); return; }
      busca.scrollIntoView({ behavior: LISO, block: 'center' });
      busca.elements.local.focus({ preventScroll: true });
    });
  });

  /* Busca expirada: depois de 30 minutos na mesma aba, ou já pela URL. */
  var aviso = $('[data-expirada]');
  function expirar() { aviso.hidden = false; }
  $('[data-atualizar]').addEventListener('click', function () {
    var u = new URLSearchParams(location.search);
    u.delete('estado');
    location.search = u.toString();
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (!buscaOk) {
      // Sem busca válida: a mesma busca aparece aberta na página.
      $('[data-vitrine]').hidden = true;
      $('.site-filters__open').hidden = true;
      $('[data-sem-busca]').hidden = false;
      $('[data-busca-inline]').appendChild(busca);
      return;
    }
    resumo();
    syncRange();
    carregar();
    if (estado === 'expirada') expirar();
    else setTimeout(expirar, 30 * 60 * 1000);
  });
})();
