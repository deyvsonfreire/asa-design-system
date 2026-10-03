/* ==========================================================================
   LOJAS · o mapa de cada loja e a ordem no celular.
   O mapa do Google só carrega quando a pessoa toca em "Mostrar mapa": o
   iframe pesa e leva a terceiro, então não entra no carregamento da página.
   Ele aponta para a ficha da loja no Google (cid), não para coordenadas.
   Com ?local=FOR (ou REC), a loja daquela praça vem primeiro no celular.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var track = function (e, p) { (window.asaTrack || function () {})(e, p); };

  /* ---------- Mapa sob demanda ---------- */
  $$('[data-mapa]').forEach(function (box) {
    var botao = $('[data-mostrar-mapa]', box);
    var status = $('.site-map__status', box);
    var iframe = null;
    botao.addEventListener('click', function () {
      if (iframe) {
        var aberto = !iframe.hidden;
        iframe.hidden = aberto;
        botao.textContent = aberto ? 'Mostrar mapa' : 'Esconder mapa';
        botao.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        return;
      }
      status.textContent = 'Carregando mapa…';
      iframe = document.createElement('iframe');
      iframe.src = box.dataset.src;
      iframe.title = box.dataset.titulo;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.className = 'site-map__frame';
      // Um iframe de outro domínio não avisa quando falha: depois de alguns
      // segundos sem carregar, a pessoa recebe o caminho alternativo.
      var falhou = setTimeout(function () {
        status.textContent = 'O mapa não carregou. Use o link Como chegar no Google Maps.';
      }, 8000);
      iframe.addEventListener('load', function () { clearTimeout(falhou); status.textContent = ''; });
      box.appendChild(iframe);
      botao.textContent = 'Esconder mapa';
      botao.setAttribute('aria-expanded', 'true');
      track('map_open', { location: box.dataset.mapa });
    });
  });

  /* ---------- Escolha de loja (ver carros) ---------- */
  $$('[data-local-loja]').forEach(function (a) {
    a.addEventListener('click', function () { track('select_location', { location: a.dataset.localLoja }); });
  });

  /* ---------- A praça da busca primeiro, no celular ---------- */
  var local = new URLSearchParams(location.search).get('local');
  var lojas = $('[data-lojas]');
  if (lojas && (local === 'FOR' || local === 'REC')) lojas.setAttribute('data-primeiro', local);
})();
