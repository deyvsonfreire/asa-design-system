/* ==========================================================================
   OFERTAS · estados da página.
   Cada página de oferta tem dois estados no mesmo HTML: o normal (campanha
   na temporada, cupom ativo, vitrine com ofertas) e o alternativo
   (campanha encerrada, cupom pausado, nenhuma oferta). Em produção o CMS
   escolhe o estado pela flag da campanha e entrega só um. No protótipo, o
   parâmetro da URL mostra o alternativo:
     /ofertas?vazio                    nenhuma oferta ativa
     /ofertas/primeira-locacao?pausado cupom pausado
     /ofertas/carnaval?encerrada       fora da temporada (o padrão do ano)
   O que é só do estado normal leva data-temporada; o que é só do
   alternativo, data-fora.
   ========================================================================== */
(function () {
  'use strict';

  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var body = document.body;
  var param = body.dataset.estadoParam;
  if (!param || !new URLSearchParams(location.search).has(param)) return;

  $$('[data-temporada]').forEach(function (el) { el.hidden = true; });
  $$('[data-fora]').forEach(function (el) { el.hidden = false; });
  body.dataset.estado = param;

  // Fora da temporada (ou com o cupom pausado) a página sai do índice.
  if (body.dataset.foraNoindex !== undefined) {
    var robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.content = 'noindex, follow';
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.remove();
  }
  if (body.dataset.tituloFora) document.title = body.dataset.tituloFora;

  // Sem as faixas da temporada, as que sobram voltam a alternar branco e
  // névoa entre o hero e o fechamento, como manda 15 Composição.
  var faixas = $$('[data-faixa]').filter(function (s) { return !s.hidden; });
  faixas.forEach(function (s, i) {
    s.classList.remove('asa-bg-white', 'asa-bg-mist');
    s.classList.add(i % 2 ? 'asa-bg-mist' : 'asa-bg-white');
  });
})();
