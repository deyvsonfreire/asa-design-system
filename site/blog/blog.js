/* ==========================================================================
   BLOG · filtro por categoria e paginação do hub.
   O servidor entrega a mesma página em /blog, /blog/categoria/<slug> e
   ?pagina=N. Sem JS, todos os artigos aparecem; com JS, esta página lê o
   endereço, mostra a categoria e a página certas e troca de categoria sem
   recarregar (history.pushState), mantendo cada estado com URL própria.
   ========================================================================== */
(function () {
  'use strict';

  var POR_PAGINA = 9;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var lista = $('[data-lista]');
  if (!lista) return;
  var cards = $$('li', lista);
  var tabs = $$('.site-blog__tabs .asa-tabs__tab');
  var destaque = $('section[data-destaque]');
  var vazio = $('[data-vazio]');
  var contagem = $('[data-contagem]');
  var paginas = $('[data-paginas]');
  var canonical = $('link[rel="canonical"]');
  var tituloBase = document.title;
  var NOMES = {};
  tabs.forEach(function (t) { NOMES[t.dataset.categoria] = t.textContent; });

  function ler() {
    var m = location.pathname.match(/^\/blog\/categoria\/([a-z-]+)\/?$/);
    var cat = m && NOMES[m[1]] ? m[1] : '';
    var pagina = parseInt(new URLSearchParams(location.search).get('pagina'), 10) || 1;
    return { cat: cat, pagina: Math.max(1, pagina) };
  }

  function endereco(cat, pagina) {
    return (cat ? '/blog/categoria/' + cat : '/blog') + (pagina > 1 ? '?pagina=' + pagina : '');
  }

  function item(href, texto, rotulo, atual, desativado, classe) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'asa-pagination__item' + (classe ? ' ' + classe : '');
    a.href = href;
    a.textContent = texto;
    if (rotulo) a.setAttribute('aria-label', rotulo);
    if (atual) a.setAttribute('aria-current', 'page');
    if (desativado) { a.setAttribute('aria-disabled', 'true'); a.removeAttribute('href'); }
    li.appendChild(a);
    return li;
  }

  function mostrar(estado, rolar) {
    var cat = estado.cat;
    // Em "Todos", o artigo em destaque fica só na faixa de cima, que aparece
    // na primeira página. Numa categoria, a faixa sai e ele entra na grade.
    var comDestaque = !cat && estado.pagina === 1;
    var visiveis = cards.filter(function (li) {
      return cat ? li.dataset.categoria === cat : !li.hasAttribute('data-destaque');
    });

    var total = Math.max(1, Math.ceil(visiveis.length / POR_PAGINA));
    var pagina = Math.min(estado.pagina, total);
    var inicio = (pagina - 1) * POR_PAGINA;
    var daPagina = visiveis.slice(inicio, inicio + POR_PAGINA);

    cards.forEach(function (li) { li.hidden = daPagina.indexOf(li) === -1; });
    if (destaque) destaque.hidden = !comDestaque;
    vazio.hidden = visiveis.length > 0;
    lista.hidden = visiveis.length === 0;

    tabs.forEach(function (t) {
      if (t.dataset.categoria === cat) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
      // Categoria vazia só aparece nas abas quando é a página aberta.
      if (t.hasAttribute('data-vazia')) t.hidden = t.dataset.categoria !== cat;
    });

    contagem.textContent = cat && visiveis.length
      ? visiveis.length + (visiveis.length === 1 ? ' artigo em ' : ' artigos em ') + NOMES[cat] + '.'
      : '';

    var ul = $('ul', paginas);
    ul.innerHTML = '';
    paginas.hidden = total < 2;
    if (total > 1) {
      ul.appendChild(item(endereco(cat, pagina - 1), 'Artigos mais recentes', null, false, pagina === 1, 'asa-pagination__item--text'));
      for (var n = 1; n <= total; n++) ul.appendChild(item(endereco(cat, n), String(n), 'Página ' + n, n === pagina, false));
      ul.appendChild(item(endereco(cat, pagina + 1), 'Artigos anteriores', null, false, pagina === total, 'asa-pagination__item--text'));
    }

    // Categoria e página ganham title próprio, curto: "Praias e litoral · Asa na Estrada | Asa Locadora".
    var prefixo = (cat ? NOMES[cat] + ' · ' : '') + (pagina > 1 ? 'Página ' + pagina + ' · ' : '');
    document.title = prefixo ? prefixo + 'Asa na Estrada | Asa Locadora' : tituloBase;
    if (canonical) canonical.href = 'https://asalocadora.com.br' + endereco(cat, pagina);

    if (rolar) $('#artigos').scrollIntoView({ block: 'start' });
  }

  function ir(href, rolar) {
    history.pushState(null, '', href);
    mostrar(ler(), rolar);
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      if (t.getAttribute('aria-current') === 'page') return;
      if (window.asaTrack) window.asaTrack('filter_applied', { tipo_filtro: 'categoria_blog', valor: t.dataset.categoria || 'todos' });
      ir(t.getAttribute('href'), false);
    });
  });

  paginas.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    e.preventDefault();
    ir(a.getAttribute('href'), true);
  });

  addEventListener('popstate', function () { mostrar(ler(), false); });
  mostrar(ler(), false);
})();
