/* ==========================================================================
   CONTATO · formulário.
   Validação ao sair do campo (nunca a cada tecla), localizador que só
   aparece nos assuntos de reserva, contador da mensagem, envio com estado
   de carregando e os eventos de GA4 da copy. Sem destino definido ainda
   (PENDENCIAS.md, E3): o envio é simulado.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.querySelector('[data-contato]');
  if (!form) return;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var track = window.asaTrack || function () {};
  var COM_LOCALIZADOR = ['Reserva que já fiz', 'Cobrança ou caução', 'Reclamação'];
  var ERRO = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  var el = {
    nome: $('#ct-nome'), email: $('#ct-email'), celular: $('#ct-celular'), assunto: $('#ct-assunto'),
    mensagem: $('#ct-mensagem'), lgpd: $('#ct-lgpd'), armadilha: $('#ct-site')
  };
  var boxLocalizador = $('[data-localizador]', form);
  var conta = $('#ct-mensagem-conta');
  var aviso = $('[data-aviso]', form);
  var btn = $('button[type="submit"]', form);
  var label = $('.asa-btn__label', btn);

  /* ---------- Regras ---------- */
  var digitos = function (v) { return v.replace(/\D/g, ''); };
  var REGRAS = {
    nome: function (v) { return v.trim() ? '' : 'Digite seu nome.'; },
    email: function (v) {
      if (!v.trim()) return 'Digite seu e-mail.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Confira o e-mail. Falta o @ ou o domínio.';
    },
    celular: function (v) { return digitos(v).length === 11 ? '' : 'Digite o celular com DDD, 11 números.'; },
    assunto: function (v) { return v ? '' : 'Escolha um assunto.'; },
    mensagem: function (v) { return v.trim().length >= 20 ? '' : 'Escreva pelo menos 20 caracteres para a gente entender o pedido.'; },
    lgpd: function (_, input) { return input.checked ? '' : 'Para enviar, marque que concorda com o uso dos dados.'; }
  };

  function mostrar(nome, msg) {
    var input = el[nome];
    var box = document.getElementById(input.id + '-erro');
    $('span', box).textContent = msg;
    box.hidden = !msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    if (msg) track('form_error', { campo: nome, tipo_erro: 'validacao' });
  }

  function validar(nome) {
    var input = el[nome];
    var msg = REGRAS[nome](input.value, input);
    mostrar(nome, msg);
    return !msg;
  }

  Object.keys(REGRAS).forEach(function (nome) {
    var input = el[nome];
    var evento = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'blur';
    input.addEventListener(evento, function () {
      // Campo vazio que só recebeu foco não acusa erro; o envio acusa.
      if (evento === 'blur' && !input.value && !input.hasAttribute('aria-invalid')) return;
      validar(nome);
    });
    // Depois de acusado, o erro some assim que o campo fica certo.
    input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid') && !REGRAS[nome](input.value, input)) mostrar(nome, ''); });
  });

  /* ---------- Máscara do celular ---------- */
  el.celular.addEventListener('input', function () {
    var d = digitos(el.celular.value).slice(0, 11);
    var v = d;
    if (d.length > 2) v = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) v = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    el.celular.value = v;
  });

  /* ---------- Localizador condicional e contador ---------- */
  el.assunto.addEventListener('change', function () {
    boxLocalizador.hidden = COM_LOCALIZADOR.indexOf(el.assunto.value) === -1;
  });
  el.mensagem.addEventListener('input', function () { conta.textContent = el.mensagem.value.length + '/1000'; });

  /* ---------- form_start: primeiro campo preenchido ---------- */
  var comecou = false;
  form.addEventListener('input', function () {
    if (comecou) return;
    comecou = true;
    track('form_start', { form_id: 'contato' });
  });

  /* ---------- Aviso (sucesso ou erro) ---------- */
  function avisar(tipo, titulo, texto) {
    var icone = tipo === 'ok'
      ? '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
      : ERRO;
    aviso.innerHTML = '<div class="asa-alert asa-alert--' + tipo + '">' + icone +
      '<div class="asa-alert__body"><span class="asa-alert__title"></span><span class="asa-alert__text"></span></div></div>';
    $('.asa-alert__title', aviso).textContent = titulo;
    $('.asa-alert__text', aviso).textContent = texto;
    aviso.scrollIntoView({ block: 'center' });
  }

  /* ---------- Envio ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    var ok = true, primeiro = null;
    Object.keys(REGRAS).forEach(function (nome) {
      if (!validar(nome)) { ok = false; primeiro = primeiro || el[nome]; }
    });
    if (!ok) { primeiro.focus(); return; }
    if (el.armadilha.value) return; // honeypot: robô preencheu o campo oculto

    btn.disabled = true;
    btn.setAttribute('data-state', 'loading');
    label.textContent = 'Enviando…';
    aviso.innerHTML = '';

    // Protótipo: aqui entra o envio real (e-mail ou CRM, a definir). Para ver o estado de erro, use ?erro na URL.
    setTimeout(function () {
      btn.disabled = false;
      btn.removeAttribute('data-state');
      label.textContent = 'Enviar mensagem';
      if (location.search.indexOf('erro') !== -1) {
        track('form_error', { campo: 'envio', tipo_erro: 'rede' });
        avisar('error', 'Não conseguimos enviar agora', 'Seus dados continuam no formulário. Tente de novo ou fale pelo WhatsApp no 0800 080 0015.');
        return;
      }
      track('generate_lead', { origem: 'formulario_contato', assunto: el.assunto.value });
      avisar('ok', 'Recebemos sua mensagem', 'Vamos responder no e-mail ' + el.email.value.trim() + ' em até [prazo a confirmar].');
      form.reset();
      conta.textContent = '0/1000';
      boxLocalizador.hidden = true;
    }, 800);
  });

  /* ---------- Cliques: ligar e rota ---------- */
  var ligar = document.querySelector('[data-ligar]');
  if (ligar) ligar.addEventListener('click', function () { track('click_to_call', { origem: 'contato' }); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-rota]'), function (a) {
    a.addEventListener('click', function () { track('get_directions', { loja: a.dataset.rota }); });
  });
})();
