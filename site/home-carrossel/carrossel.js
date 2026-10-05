/* Carrossel do hero da home (teste, /home-carrossel).
   Troca a cada 7 s. Para quando o mouse está sobre ele, quando o foco entra
   nele e quando a pessoa aperta pausa ou escolhe um slide; com
   prefers-reduced-motion, começa parado. Setas do teclado trocam o slide
   quando o foco está nos controles. Os slides fora de cena ficam inertes,
   para o leitor de tela e o Tab não caírem em link escondido. */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-carrossel]');
  if (!raiz) return;
  var slides = Array.prototype.slice.call(raiz.querySelectorAll('[data-slide]'));
  var pontos = Array.prototype.slice.call(raiz.querySelectorAll('[data-hc-ir]'));
  var pausa = raiz.querySelector('[data-hc-pausa]');
  var atual = 0, timer = null, parado = false, sobre = false;
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INTERVALO = 7000;

  function track(acao, i) {
    (window.asaTrack || function () {})('carousel_interaction', { acao: acao, slide: i + 1 });
  }

  function mostrar(i) {
    atual = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      var ativo = n === atual;
      s.toggleAttribute('data-ativo', ativo);
      s.toggleAttribute('inert', !ativo);
      s.setAttribute('aria-hidden', ativo ? 'false' : 'true');
    });
    pontos.forEach(function (p, n) { p.setAttribute('aria-current', n === atual ? 'true' : 'false'); });
  }

  function agendar() {
    clearInterval(timer);
    if (!parado && !sobre && !calmo) timer = setInterval(function () { mostrar(atual + 1); }, INTERVALO);
  }

  function pausar(sim) {
    parado = sim;
    pausa.setAttribute('aria-label', sim ? 'Retomar a troca dos destaques' : 'Pausar a troca dos destaques');
    pausa.querySelector('[data-icone-pausa]').hidden = sim;
    pausa.querySelector('[data-icone-tocar]').hidden = !sim;
    agendar();
  }

  raiz.querySelector('[data-hc-anterior]').addEventListener('click', function () { mostrar(atual - 1); pausar(true); track('anterior', atual); });
  raiz.querySelector('[data-hc-proximo]').addEventListener('click', function () { mostrar(atual + 1); pausar(true); track('proximo', atual); });
  pontos.forEach(function (p) {
    p.addEventListener('click', function () { mostrar(+p.dataset.hcIr); pausar(true); track('ponto', atual); });
  });
  pausa.addEventListener('click', function () { pausar(!parado); track(parado ? 'pausa' : 'retomar', atual); });

  raiz.querySelector('.site-hc__controles').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { mostrar(atual - 1); pausar(true); }
    else if (e.key === 'ArrowRight') { mostrar(atual + 1); pausar(true); }
  });
  raiz.addEventListener('mouseenter', function () { sobre = true; agendar(); });
  raiz.addEventListener('mouseleave', function () { sobre = false; agendar(); });
  raiz.addEventListener('focusin', function () { sobre = true; agendar(); });
  raiz.addEventListener('focusout', function (e) { if (!raiz.contains(e.relatedTarget)) { sobre = false; agendar(); } });
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else agendar(); });

  mostrar(0);
  pausar(calmo);
})();
