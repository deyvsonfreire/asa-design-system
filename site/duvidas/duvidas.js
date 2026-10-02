/* ==========================================================================
   DÚVIDAS · busca com filtro ao digitar.
   Filtro local e instantâneo, sem estado de carregando. Compara sem acento
   e sem caixa, na pergunta e na resposta. Temas sem nenhuma pergunta
   visível somem; o total é anunciado por aria-live. O evento search sai
   com 3 ou mais caracteres, 800 ms depois da última tecla. Cada pergunta
   tem âncora própria (/duvidas#caucao-valor): chegando por ela, a pergunta
   abre.
   ========================================================================== */
(function () {
  'use strict';

  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var track = window.asaTrack || function () {};
  var campo = document.getElementById('faq-busca');
  var conta = document.getElementById('faq-busca-conta');
  var vazio = document.querySelector('[data-faq-vazio]');
  var termoVazio = document.querySelector('[data-faq-termo]');
  var temas = $$('[data-faq-tema]');
  var itens = $$('[data-faq-tema] details');
  var semAcento = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var textos = itens.map(function (d) { return semAcento(d.textContent); });

  // Tema de cada pergunta, para o faq_expand.
  itens.forEach(function (d) { d.dataset.faqTopic = d.closest('[data-faq-tema]').dataset.faqTema; });

  var espera;
  function filtrar() {
    var termo = campo.value.trim();
    var t = semAcento(termo);
    var n = 0;
    itens.forEach(function (d, i) {
      var ok = !t || textos[i].indexOf(t) !== -1;
      d.hidden = !ok;
      if (ok) n++;
    });
    temas.forEach(function (sec) { sec.hidden = !$$('details', sec).some(function (d) { return !d.hidden; }); });
    vazio.hidden = n > 0;
    if (!n) termoVazio.textContent = termo;
    conta.textContent = !t ? '' : n ? n + (n === 1 ? ' pergunta' : ' perguntas') + ' com "' + termo + '"' : '';
    clearTimeout(espera);
    if (t.length >= 3) {
      espera = setTimeout(function () {
        track('search', { search_term: termo, placement: 'duvidas' });
        if (!n) track('faq_search_empty', { search_term: termo });
      }, 800);
    }
  }
  campo.addEventListener('input', filtrar);
  campo.addEventListener('keydown', function (e) { if (e.key === 'Escape' && campo.value) { campo.value = ''; filtrar(); } });

  // Atalhos de tema: select_content.
  $$('[data-faq-atalho]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (campo.value) { campo.value = ''; filtrar(); }
      track('select_content', { content_type: 'faq_topic', item_id: a.dataset.faqAtalho });
    });
  });

  // Âncora de pergunta: abre e rola até ela.
  function abrirDoHash() {
    var alvo = location.hash && document.getElementById(location.hash.slice(1));
    if (alvo && alvo.tagName === 'DETAILS') { alvo.open = true; alvo.scrollIntoView({ block: 'start' }); }
  }
  addEventListener('hashchange', abrirDoHash);
  abrirDoHash();
})();
