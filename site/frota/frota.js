/* ==========================================================================
   FROTA · o hub (/frota) e as seis páginas de categoria.
   Preço, disponibilidade e os atalhos para a reserva. A frota e a conta
   são as de funil.js (diária + proteção básica + taxa de 12%), as mesmas
   da vitrine e das etapas da reserva.

   Dois modos:
   - Sem datas: cada card mostra o "a partir de" de 1 diária (período de
     referência a confirmar) e "Reservar grupo X" leva à busca do topo com
     o grupo escolhido; a busca segue então direto para a etapa 2.
   - Com datas (a pessoa mudou a retirada ou a devolução na busca, ou a URL
     trouxe local, retirada e devolução): o total do período, a diária e o
     esgotado; "Reservar grupo X" vai direto para a etapa 2.

   Protótipo: ?estado=carregando | erro | esgotado mostra os outros estados.
   Em produção, preço e esgotado vêm do motor de reservas.
   ========================================================================== */
(function () {
  'use strict';

  var F = window.AsaFunil;
  if (!F) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var real = F.fmt.real, esc = F.fmt.esc;
  var track = F.track;
  var LISO = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  var q = new URLSearchParams(location.search);
  var forcado = ['carregando', 'erro', 'esgotado'].indexOf(q.get('estado')) !== -1 ? q.get('estado') : '';
  var lista = document.body.dataset.lista || 'frota';
  var categoria = document.body.dataset.categoria || '';

  /* Os grupos da página, na ordem em que aparecem. */
  var slots = $$('[data-preco]');
  var grupos = [];
  slots.forEach(function (s) { if (grupos.indexOf(s.dataset.preco) === -1) grupos.push(s.dataset.preco); });
  if (!grupos.length) return;

  var datas = null;        // { ini, fim, dias } quando a página está no modo com datas
  var estado = '';         // '' | carregando | erro | esgotado

  /* ---------- Conta ---------- */
  function conta(g, dias) {
    var c = F.grupo(g);
    var total = F.calcular({ grupo: c, dias: dias }).total;
    return { c: c, total: total, diaria: Math.round(total / dias * 100) / 100 };
  }
  function esgotado(g) {
    if (!datas) return false;
    if (estado === 'esgotado') return grupos.indexOf(g) !== -1;
    return !!F.grupo(g).esgotado;
  }
  function plural(n) { return n + (n === 1 ? ' diária' : ' diárias'); }
  function anchor(g) { return 'grupo-' + g.toLowerCase().replace('+', '-mais'); }

  /* Página da categoria onde um grupo mora (para o link "Ver o grupo X"). */
  var PAGINA_DO_GRUPO = { 'A': 'hatch-economico', 'B': 'hatch-economico', 'B+': 'hatch-economico', 'C+': 'sedan', 'D': 'automatico', 'D+': 'automatico',
    'E+': 'sedan', 'F+': '7-lugares', 'G+': 'suv', 'H': 'picape', 'I+': 'suv', 'J+': 'suv', 'N+': 'sedan', 'O+': 'picape', 'P+': 'picape' };
  function hrefGrupo(g) {
    return document.getElementById(anchor(g)) ? '#' + anchor(g) : '/frota/' + PAGINA_DO_GRUPO[g] + '#' + anchor(g);
  }

  /* ---------- Formulário da busca do topo ---------- */
  var form = $('[data-booking]');
  var escolhido = null;    // linha "Grupo X escolhido" dentro da busca
  function lerDatas() {
    if (!form) return null;
    var ini = new Date(form.elements.retirada.value), fim = new Date(form.elements.devolucao.value);
    if (isNaN(ini) || isNaN(fim) || fim <= ini || ini < new Date(Date.now() - 60000)) return null;
    return { ini: ini, fim: fim, dias: Math.max(1, Math.ceil((fim - ini - 3 * F.HORA) / F.DIA)) };
  }
  function urlEtapa2(g) {
    return F.url('/reservas-online/adicionais', { local: form.elements.local.value, ini: datas.ini, fim: datas.fim, codigo: '' }, { grupo: g });
  }

  /* ---------- Desenho do preço ---------- */
  function htmlCard(g) {
    if (estado === 'carregando') {
      return '<span class="asa-skeleton asa-skeleton--text" style="width:40%"></span><span class="asa-skeleton asa-skeleton--title" style="width:60%"></span>' +
        '<span class="asa-skeleton asa-skeleton--text" style="width:80%"></span>';
    }
    if (estado === 'erro') return '<span class="asa-price__note">Veja o preço final para as suas datas.</span>';
    if (!datas) {
      var r = conta(g, 1);
      return '<span class="asa-price__label">A partir de</span><span class="asa-price__value">' + real(r.total) + '</span>' +
        '<span class="asa-price__note">Preço final de 1 diária · proteção básica e taxa inclusas</span>';
    }
    if (esgotado(g)) return htmlEsgotado(g);
    var t = conta(g, datas.dias);
    return '<span class="asa-price__label">Total de ' + plural(datas.dias) + '</span><span class="asa-price__value">' + real(t.total) + '</span>' +
      '<span class="asa-price__note">Preço final · proteção básica e taxa inclusas</span><span class="asa-price__daily">Diária ' + real(t.diaria) + '</span>';
  }
  function altDe(g) {
    var card = document.getElementById(anchor(g));
    var alt = card && card.dataset.alt;
    if (alt && !esgotado(alt) && (estado !== 'esgotado' || grupos.indexOf(alt) === -1)) return { g: alt, nota: card.dataset.altNota || '' };
    return null;
  }
  function htmlEsgotado(g) {
    var alt = altDe(g);
    var link = alt ? '<a class="asa-btn asa-btn--link asa-btn--sm" href="' + hrefGrupo(alt.g) + '" data-ver-grupo="' + alt.g + '">Ver o grupo ' + alt.g +
      (alt.nota ? ' (' + esc(alt.nota) + ')' : '') + '</a>' : '';
    return '<div class="site-vcard__soldout"><span class="asa-tag asa-tag--neutral">Esgotado nesta data</span>' +
      '<p>Este grupo não tem carro livre para o seu período.</p>' + link + '</div>';
  }
  function htmlTabela(g) {
    if (estado === 'carregando') return '<span class="asa-skeleton asa-skeleton--text" style="width:72px"></span>';
    if (!datas || estado === 'erro') return '';
    if (esgotado(g)) {
      return '<span class="asa-tag asa-tag--neutral">Esgotado nesta data</span>' +
        (estado === 'esgotado' ? '' : '<button class="asa-btn asa-btn--link asa-btn--sm" type="button" data-parecidos="' + g + '">Ver grupos parecidos</button>');
    }
    var t = conta(g, datas.dias);
    return '<b>' + real(t.total) + '</b><span>' + plural(datas.dias) + '</span>';
  }

  function desenhar() {
    slots.forEach(function (s) {
      var g = s.dataset.preco;
      s.innerHTML = s.dataset.precoModo === 'tabela' ? htmlTabela(g) : htmlCard(g);
      var card = s.closest('[data-grupo-card], [data-grupo-linha]');
      var fora = esgotado(g);
      if (card) { if (fora) card.setAttribute('data-esgotado', ''); else card.removeAttribute('data-esgotado'); }
    });
    $$('[data-reservar-grupo]').forEach(function (b) {
      var g = b.dataset.reservarGrupo;
      b.hidden = esgotado(g) || estado === 'carregando';
      if (b.dataset.rotuloSemDatas) {
        b.firstChild.nodeValue = datas && estado !== 'erro' ? b.dataset.rotuloComDatas : b.dataset.rotuloSemDatas;
      }
      b.setAttribute('href', datas && !estado ? urlEtapa2(g) : '#reservar');
    });
    desenharDesde();
    desenharStatus();
    desenharAlerta();
    $$('[data-painel-grupos]').forEach(function (p) {
      var gs = $$('[data-grupo-card]', p).map(function (c) { return c.dataset.grupoCard; });
      $('[data-painel-vazio]', p).hidden = !(datas && estado !== 'esgotado' && gs.every(esgotado));
    });
  }

  /* O "a partir de" do hero e da barra do celular: o menor dos grupos da página. */
  var desde = $('[data-preco-desde]');
  var barraPreco = $('[data-fleetbar-preco]');
  function menor() {
    var dias = datas ? datas.dias : 1;
    var vivos = grupos.filter(function (g) { return !esgotado(g); });
    if (!vivos.length) return null;
    return Math.min.apply(null, vivos.map(function (g) { return conta(g, dias).total; }));
  }
  function desenharDesde() {
    var m = estado === 'carregando' || estado === 'erro' ? null : menor();
    if (desde) {
      var rot = esc($('.asa-price__label', desde) ? $('.asa-price__label', desde).textContent : 'A partir de');
      var html;
      if (estado === 'carregando') html = '<span class="asa-price__label">' + rot + '</span><span class="asa-skeleton asa-skeleton--title" style="width:180px"></span>';
      else if (estado === 'erro') html = '<span class="asa-price__label">' + rot + '</span><span class="asa-price__note">Veja o preço final para as suas datas.</span>';
      else if (m === null) html = '<span class="asa-price__note">Esgotado nas suas datas. Tente outras datas.</span>';
      else html = '<span class="asa-price__label">' + rot + '</span><span class="asa-price__value">' + real(m) + '</span>' +
        '<span class="asa-price__note">' + (datas ? 'Total de ' + plural(datas.dias) : 'Preço final de 1 diária') + ' · proteção básica e taxa inclusas</span>';
      $('.asa-price', desde).innerHTML = html;
    }
    if (barraPreco) barraPreco.textContent = m === null ? 'Veja o preço' : 'a partir de ' + real(m);
  }

  var status = $('[data-preco-status]');
  function desenharStatus() {
    if (!status) return;
    var L = form && F.LOCAIS[form.elements.local.value];
    if (estado === 'carregando') { status.textContent = $('[data-frota-alerta]').dataset.msgCarregando; return; }
    if (!datas || estado === 'erro') {
      status.innerHTML = $('[data-preco-desde]') || $('[data-grupo-card]')
        ? 'Preços a partir de 1 diária. <a href="#reservar" data-ir-datas>Informe as datas</a> para ver o total do seu período.'
        : '<a href="#reservar" data-ir-datas>Informe as datas</a> para ver o preço final de cada grupo no seu período.';
      return;
    }
    status.innerHTML = 'Preço final para ' + plural(datas.dias) + ' ' + (L ? L.curto : '') + ': retirada ' + F.fmt.dataCurta(datas.ini) + ' às ' + F.fmt.hora(datas.ini) +
      ', devolução ' + F.fmt.dataCurta(datas.fim) + ' às ' + F.fmt.hora(datas.fim) + '. <a href="#reservar" data-ir-datas>Mudar datas</a>';
  }

  var alerta = $('[data-frota-alerta]');
  function desenharAlerta() {
    if (!alerta) return;
    var ICONE = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    if (estado === 'erro') {
      alerta.innerHTML = '<div class="asa-alert asa-alert--error" role="alert">' + ICONE + '<div class="asa-alert__body"><span class="asa-alert__text">' +
        'Não conseguimos carregar o preço agora. Tente de novo em instantes ou fale no WhatsApp 0800 080 0015.</span>' +
        '<div class="site-actions"><button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-tentar>Tentar de novo</button></div></div></div>';
    } else if (estado === 'esgotado') {
      var h = alerta.dataset.esgotadoHref;
      var cta = h.charAt(0) === '#' ? '<a class="asa-btn asa-btn--outline asa-btn--sm" href="' + h + '" data-ir-datas>' + esc(alerta.dataset.esgotadoTexto) + '</a>'
        : '<a class="asa-btn asa-btn--outline asa-btn--sm" href="' + h + '">' + esc(alerta.dataset.esgotadoTexto) + '</a>';
      alerta.innerHTML = '<div class="asa-alert asa-alert--warn" role="status">' + ICONE + '<div class="asa-alert__body"><span class="asa-alert__text">' +
        esc(alerta.dataset.msgEsgotado) + '</span><div class="site-actions">' + cta + '</div></div></div>';
    } else alerta.innerHTML = '';
  }

  /* ---------- Modo com datas ---------- */
  function usarDatas(d) {
    datas = d;
    desenhar();
  }

  function iniciar() {
    // A URL pode trazer a busca (vindo da vitrine ou de um link com datas).
    if (form && q.get('retirada') && q.get('devolucao')) {
      form.elements.retirada.value = q.get('retirada').slice(0, 16);
      form.elements.devolucao.value = q.get('devolucao').slice(0, 16);
      // Avisa o site.js (linha da diária de 27h, mínimo da devolução).
      form.elements.retirada.dispatchEvent(new Event('change'));
    }
    var urlDatas = q.get('retirada') && q.get('devolucao') ? lerDatas() : null;
    if (forcado) { estado = forcado; datas = lerDatas(); }
    else datas = urlDatas;
    desenhar();

    if (form) {
      ['retirada', 'devolucao', 'local'].forEach(function (n) {
        form.elements[n].addEventListener('change', function () {
          var d = lerDatas();
          if (n === 'local' && !datas) return;
          if (d) usarDatas(d);
        });
      });
    }
  }

  /* ---------- Reservar grupo X ---------- */
  function item(g, i) {
    var c = F.grupo(g);
    var it = { item_id: g, item_name: c.modelo, item_category: c.cat, item_variant: c.cambio, index: i, currency: 'BRL' };
    if (datas && !esgotado(g) && !estado) it.price = conta(g, datas.dias).total;
    return it;
  }
  function escolher(g) {
    var c = F.grupo(g);
    form.dataset.grupo = g;
    var lbl = $('button[type="submit"] .asa-btn__label', form);
    if (!form.dataset.rotuloOriginal) form.dataset.rotuloOriginal = lbl.textContent;
    lbl.textContent = 'Continuar com o grupo ' + g;
    if (!escolhido) {
      escolhido = document.createElement('p');
      escolhido.className = 'site-booking__grupo';
      escolhido.setAttribute('role', 'status');
      $('.asa-search__row', form).insertAdjacentElement('afterend', escolhido);
    }
    escolhido.innerHTML = '<b>Grupo ' + g + ' · ' + esc(c.modelo) + ' ou similar.</b> Confira o local e as datas para continuar. ' +
      '<button class="asa-btn asa-btn--link asa-btn--sm" type="button" data-desfazer-grupo>Ver todos os grupos</button>';
    form.scrollIntoView({ behavior: LISO, block: 'center' });
    form.elements.retirada.focus({ preventScroll: true });
  }
  function desfazer() {
    delete form.dataset.grupo;
    $('button[type="submit"] .asa-btn__label', form).textContent = form.dataset.rotuloOriginal;
    if (escolhido) { escolhido.remove(); escolhido = null; }
    form.elements.local.focus();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-reservar-grupo]');
    if (b) {
      var g = b.dataset.reservarGrupo;
      track('select_item', { item_list_id: lista, item_list_name: lista, items: [item(g, grupos.indexOf(g))] });
      if (datas && !estado) { b.href = urlEtapa2(g); return; }
      e.preventDefault();
      if (form) escolher(g);
      return;
    }
    if (e.target.closest('[data-desfazer-grupo]')) { desfazer(); return; }
    var ir = e.target.closest('[data-ir-datas]');
    if (ir && form) {
      e.preventDefault();
      form.scrollIntoView({ behavior: LISO, block: 'center' });
      form.elements.retirada.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest('[data-tentar]')) {
      estado = '';
      datas = lerDatas();
      var u = new URLSearchParams(location.search);
      u.delete('estado');
      history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash);
      desenhar();
      // O botão some com o alerta: o foco vai para a linha que diz o período.
      if (status) { status.setAttribute('tabindex', '-1'); status.focus(); }
      return;
    }
    var p = e.target.closest('[data-parecidos]');
    if (p) parecidos(p.dataset.parecidos);
    var cta = e.target.closest('[data-cta-categoria]');
    if (cta) track('cta_reservar_categoria', { categoria: cta.dataset.ctaCategoria, placement: cta.dataset.placement || '' });
    var uso = e.target.closest('[data-uso]');
    if (uso) track('select_item', { item_list_id: 'frota_usos', item_list_name: 'frota_usos', items: [{ item_id: uso.dataset.uso, item_name: uso.dataset.usoNome, item_category: 'categoria' }] });
  });

  /* ---------- view_item_list, uma vez, quando a lista entra na tela ---------- */
  var alvo = $('[data-lista-frota]');
  if (alvo && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      track('view_item_list', { item_list_id: lista, item_list_name: lista, items: grupos.map(item) });
    }, { threshold: 0.2 });
    io.observe(alvo);
  }

  /* ---------- Filtros da tabela (hub) ---------- */
  var caixa = $('[data-frota-filtros]');
  var linhas = $$('[data-grupo-linha]');
  var sel = { cambio: [], lugares: [], malas: [], tipo: [], tracao: [] };
  function passa(tr) {
    return Object.keys(sel).every(function (k) { return !sel[k].length || sel[k].indexOf(tr.dataset[k]) !== -1; });
  }
  function filtrar(anunciar) {
    var n = 0;
    linhas.forEach(function (tr) { var ok = passa(tr); tr.hidden = !ok; if (ok) n++; });
    var cont = $('[data-contador]');
    if (cont) cont.textContent = n === 15 ? '15 grupos' : n + (n === 1 ? ' grupo' : ' grupos') + ' de 15';
    $('[data-vazio]').hidden = n > 0;
    $('.site-fleet-wrap').hidden = n === 0;
    var algum = Object.keys(sel).some(function (k) { return sel[k].length; });
    $$('[data-limpar]').forEach(function (b) { if (!b.closest('[data-vazio]')) b.hidden = !algum; });
    $$('[data-filtro]', caixa).forEach(function (c) { c.setAttribute('aria-pressed', sel[c.dataset.filtro].indexOf(c.dataset.valor) !== -1 ? 'true' : 'false'); });
    var u = new URLSearchParams(location.search);
    Object.keys(sel).forEach(function (k) { if (sel[k].length) u.set(k, sel[k].join(',')); else u.delete(k); });
    history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash);
    return n;
  }
  function limpar() {
    Object.keys(sel).forEach(function (k) { sel[k] = []; });
    filtrar();
    track('filter_applied', { item_list_id: lista, filtro: 'limpar', valor: '', resultados: 15 });
    $('[data-filtro]', caixa).focus();
  }
  function parecidos(g) {
    var c = F.grupo(g);
    Object.keys(sel).forEach(function (k) { sel[k] = []; });
    sel.cambio = [c.cambio === 'Automático' ? 'automatico' : 'manual'];
    sel.lugares = [String(c.lugares)];
    var n = filtrar();
    track('filter_applied', { item_list_id: lista, filtro: 'parecidos', valor: g, resultados: n });
    caixa.scrollIntoView({ behavior: LISO, block: 'start' });
    $('[data-filtro="cambio"][aria-pressed="true"]', caixa).focus({ preventScroll: true });
  }
  if (caixa) {
    Object.keys(sel).forEach(function (k) { if (q.get(k)) sel[k] = q.get(k).split(','); });
    filtrar();
    $$('[data-filtro]', caixa).forEach(function (c) {
      c.addEventListener('click', function () {
        var k = c.dataset.filtro, v = c.dataset.valor, i = sel[k].indexOf(v);
        if (i === -1) sel[k].push(v); else sel[k].splice(i, 1);
        var n = filtrar();
        track('filter_applied', { item_list_id: lista, filtro: k, valor: v, ativo: i === -1, resultados: n });
      });
    });
    $$('[data-limpar]').forEach(function (b) { b.addEventListener('click', limpar); });
  }

  /* ---------- Barra do celular ----------
     Fora da tela enquanto a busca do topo, o fechamento ou o rodapé estão
     à vista: os três já têm a ação. */
  var barra = $('[data-fleetbar]');
  if (barra && 'IntersectionObserver' in window) {
    var vistos = new Set();
    var alvos = [$('.asa-hero'), $('[data-fim]'), $('footer')].filter(Boolean);
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) vistos.add(en.target); else vistos.delete(en.target); });
      var fora = vistos.size > 0;
      barra.classList.toggle('site-sumbar--fora', fora);
      if (fora) { barra.setAttribute('aria-hidden', 'true'); barra.inert = true; }
      else { barra.removeAttribute('aria-hidden'); barra.inert = false; }
    });
    alvos.forEach(function (a) { obs.observe(a); });
  }

  /* site.js (que roda depois deste arquivo) preenche o local e as datas
     sugeridas da busca; a página só começa depois disso. Scripts defer
     rodam antes do DOMContentLoaded, com readyState já "interactive". */
  if (document.readyState === 'complete') iniciar();
  else document.addEventListener('DOMContentLoaded', iniciar);
})();
