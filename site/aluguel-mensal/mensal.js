/* ==========================================================================
   ALUGUEL MENSAL · formulário de cotação.
   O mesmo desenho do formulário de Empresas: validação ao sair do campo e
   no envio, resumo de erros no topo com links para cada campo, máscara do
   WhatsApp e do CNPJ. CNPJ e quantidade de carros só para empresa. Data
   de início a partir de hoje. Envio repetido com o mesmo WhatsApp em menos
   de 10 minutos não gera um segundo pedido. Sem destino definido
   (PENDENCIAS.md): o envio é simulado; ?erro mostra o erro de envio.
   GA4 sem nome, e-mail, telefone nem CNPJ.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.querySelector('[data-mensal]');
  if (!form) return;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var track = function (e, p) { (window.asaTrack || function () {})(e, p); };
  var digitos = function (v) { return v.replace(/\D/g, ''); };
  var ERRO = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  var INFO = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  var FORM_ID = 'cotacao_mensal';
  var DEZ_MIN = 10 * 60 * 1000;

  var el = {
    perfil: $$('input[name="perfil"]', form), nome: $('#am-nome'), whats: $('#am-whats'), email: $('#am-email'),
    cnpj: $('#am-cnpj'), qtd: $('#am-qtd'), cidade: $('#am-cidade'), inicio: $('#am-inicio'), prazo: $('#am-prazo'),
    tipo: $('#am-tipo'), msg: $('#am-msg'), lgpd: $('#am-lgpd'), armadilha: $('#am-site')
  };
  var pj = function () { return el.perfil.some(function (r) { return r.checked && r.value === 'pj'; }); };
  var hoje = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  el.inicio.min = hoje();

  function cnpjOk(v) {
    var d = digitos(v);
    if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
    var calc = function (n) {
      var soma = 0, peso = n - 7;
      for (var i = 0; i < n; i++) { soma += +d[i] * peso--; if (peso < 2) peso = 9; }
      var r = soma % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return calc(12) === +d[12] && calc(13) === +d[13];
  }

  var REGRAS = {
    perfil: function () { return el.perfil.some(function (r) { return r.checked; }) ? '' : 'Diga se o pedido é para você ou para a sua empresa.'; },
    nome: function (v) {
      v = v.trim();
      if (!v) return 'Informe seu nome completo.';
      return v.split(/\s+/).length < 2 ? 'Escreva nome e sobrenome, como na CNH.' : '';
    },
    whats: function (v) {
      var n = digitos(v).length;
      if (!n) return 'Informe um WhatsApp para receber a proposta.';
      return n === 11 ? '' : 'Confira o número: faltam dígitos. Use DDD + número.';
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Esse e-mail parece incompleto. Confira se tem @ e domínio (ex.: nome@email.com).'; },
    cnpj: function (v) { if (!pj()) return ''; return !digitos(v) ? 'Informe o CNPJ da empresa.' : cnpjOk(v) ? '' : 'Esse CNPJ não confere. Confira os 14 números.'; },
    qtd: function (v) { if (!pj()) return ''; return +v >= 1 ? '' : 'Informe pelo menos 1 carro.'; },
    cidade: function (v) { return v ? '' : 'Escolha onde você vai retirar o carro.'; },
    inicio: function (v) { if (!v) return 'Escolha a data de início.'; return v < hoje() ? 'Escolha uma data a partir de hoje.' : ''; },
    prazo: function (v) { return v ? '' : 'Diga por quanto tempo, mesmo que seja uma estimativa.'; },
    msg: function (v) { return v.length <= 500 ? '' : 'Use até 500 caracteres. Detalhes extras podem ir pelo WhatsApp.'; },
    lgpd: function () { return el.lgpd.checked ? '' : 'Marque a autorização para a gente poder responder.'; }
  };
  var ROTULO = { perfil: 'Para quem é o pedido', nome: 'Nome completo', whats: 'WhatsApp', email: 'E-mail', cnpj: 'CNPJ', qtd: 'Quantos carros',
    cidade: 'Cidade de retirada', inicio: 'Data de início', prazo: 'Por quanto tempo', msg: 'Mensagem', lgpd: 'Autorização de contato' };
  var alvo = function (nome) { return nome === 'perfil' ? el.perfil[0] : el[nome]; };
  var caixa = function (nome) { return document.getElementById('am-' + nome + '-erro'); };

  function mostrar(nome, msg) {
    var box = caixa(nome);
    $('span', box).textContent = msg;
    box.hidden = !msg;
    (nome === 'perfil' ? el.perfil : [el[nome]]).forEach(function (i) {
      if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
    });
  }
  function validar(nome) {
    var msg = REGRAS[nome](nome === 'perfil' ? '' : el[nome].value);
    mostrar(nome, msg);
    return !msg;
  }

  Object.keys(REGRAS).forEach(function (nome) {
    var inputs = nome === 'perfil' ? el.perfil : [el[nome]];
    inputs.forEach(function (i) {
      var evento = i.type === 'checkbox' || i.type === 'radio' || i.tagName === 'SELECT' || i.type === 'date' ? 'change' : 'blur';
      i.addEventListener(evento, function () {
        if (evento === 'blur' && !i.value && !i.hasAttribute('aria-invalid')) return;
        validar(nome);
      });
      i.addEventListener('input', function () {
        if (i.hasAttribute('aria-invalid') && !REGRAS[nome](nome === 'perfil' ? '' : i.value)) mostrar(nome, '');
      });
    });
  });

  /* ---------- Empresa: CNPJ e quantidade aparecem ---------- */
  var soPj = $('[data-so-pj]', form);
  el.perfil.forEach(function (r) {
    r.addEventListener('change', function () {
      soPj.hidden = !pj();
      el.cnpj.required = pj();
      if (!pj()) { mostrar('cnpj', ''); mostrar('qtd', ''); }
    });
  });

  /* ---------- Máscaras ---------- */
  el.cnpj.addEventListener('input', function () {
    var d = digitos(el.cnpj.value).slice(0, 14);
    el.cnpj.value = d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  });
  el.whats.addEventListener('input', function () {
    var d = digitos(el.whats.value).slice(0, 11);
    var v = d;
    if (d.length > 2) v = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) v = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    el.whats.value = v;
  });

  /* ---------- Contador ---------- */
  var conta = $('#am-msg-conta');
  el.msg.addEventListener('input', function () { conta.textContent = el.msg.value.length + '/500'; });

  /* ---------- Atalhos para o formulário ---------- */
  $$('[data-ir-cotacao]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('cotacao').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      el.perfil[0].focus({ preventScroll: true });
    });
  });

  /* ---------- form_start ---------- */
  var comecou = false;
  form.addEventListener('input', function () { if (!comecou) { comecou = true; track('form_start', { form_id: FORM_ID }); } });
  form.addEventListener('change', function () { if (!comecou) { comecou = true; track('form_start', { form_id: FORM_ID }); } });

  /* ---------- Resumo de erros ---------- */
  var resumo = $('[data-resumo]', form);
  var aviso = $('[data-aviso]', form);
  function mostrarResumo(erros) {
    resumo.innerHTML = '';
    if (!erros.length) return;
    var n = erros.length;
    resumo.innerHTML = '<div class="asa-alert asa-alert--error" role="alert">' + ERRO + '<div class="asa-alert__body"><span class="asa-alert__title"></span><ul></ul></div></div>';
    $('.asa-alert__title', resumo).textContent = 'Faltam ' + n + (n === 1 ? ' informação' : ' informações') + ' para enviar. Confira os campos marcados.';
    var ul = $('ul', resumo);
    erros.forEach(function (nome) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + alvo(nome).id;
      a.textContent = ROTULO[nome];
      a.addEventListener('click', function (e) { e.preventDefault(); alvo(nome).focus(); });
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  /* ---------- Envio repetido: o mesmo WhatsApp em menos de 10 minutos ----------
     Guardado na sessão da aba, só como prova de envio (os dígitos, sem nome
     nem e-mail). Em produção, o servidor decide. */
  function repetido() {
    try {
      var r = JSON.parse(sessionStorage.getItem('asa-mensal-enviado') || 'null');
      return r && r.w === digitos(el.whats.value) && Date.now() - r.t < DEZ_MIN;
    } catch (e) { return false; }
  }
  function marcarEnvio() {
    try { sessionStorage.setItem('asa-mensal-enviado', JSON.stringify({ w: digitos(el.whats.value), t: Date.now() })); } catch (e) { /* aba sem storage */ }
  }

  /* ---------- Envio ---------- */
  var btn = $('button[type="submit"]', form);
  var label = $('.asa-btn__label', btn);
  var idle = label.textContent;
  var feito = document.querySelector('[data-sucesso]');
  var faixa = function (v) { return { '1': '1', '2-3': '2_3', '4-6': '4_6', '7-12': '7_12', '12+': 'mais_12', 'nao_sei': 'nao_sei' }[v] || ''; };

  function enviar() {
    var erros = Object.keys(REGRAS).filter(function (nome) { return !validar(nome); });
    mostrarResumo(erros);
    if (erros.length) {
      track('form_error', { form_id: FORM_ID, error_fields: erros.join(',') });
      resumo.scrollIntoView({ block: 'start' });
      $('a', resumo).focus();
      return;
    }
    if (el.armadilha.value) return; // honeypot
    if (repetido()) {
      aviso.innerHTML = '<div class="asa-alert asa-alert--info" role="status">' + INFO + '<div class="asa-alert__body"><span class="asa-alert__text">Já recebemos um pedido com este WhatsApp há pouco. A equipe vai responder esse pedido.</span></div></div>';
      return;
    }
    btn.disabled = true;
    btn.setAttribute('data-state', 'loading');
    btn.setAttribute('aria-busy', 'true');
    label.textContent = 'Enviando…';
    aviso.innerHTML = '';

    // Protótipo: aqui entra o envio real (Sankhya, Chatwoot ou e-mail comercial, a definir). ?erro mostra o estado de erro.
    setTimeout(function () {
      btn.disabled = false;
      btn.removeAttribute('data-state');
      btn.removeAttribute('aria-busy');
      label.textContent = idle;
      if (location.search.indexOf('erro') !== -1) {
        aviso.innerHTML = '<div class="asa-alert asa-alert--error" role="alert">' + ERRO + '<div class="asa-alert__body"><span class="asa-alert__title">Não conseguimos enviar seu pedido agora</span><span class="asa-alert__text">Seus dados continuam no formulário. Tente de novo ou fale com a gente no WhatsApp 0800 080 0015.</span><button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-de-novo>Tentar de novo</button></div></div>';
        $('[data-de-novo]', aviso).addEventListener('click', enviar);
        track('form_error', { form_id: FORM_ID, error_fields: 'envio' });
        return;
      }
      var cambio = $$('input[name="cambio"]', form).filter(function (r) { return r.checked; })[0];
      track('generate_lead', {
        form_id: FORM_ID, lead_type: 'mensal', customer_type: pj() ? 'pj' : 'pf', pickup_location: el.cidade.value,
        duration_bucket: faixa(el.prazo.value), vehicle_type: el.tipo.value || 'nao_informado', transmission: cambio ? cambio.value : 'nao_informado',
        vehicles_qty: pj() ? +el.qtd.value : 1
      });
      marcarEnvio();
      $('[data-sucesso-nome]', feito).textContent = el.nome.value.trim().split(/\s+/)[0];
      $('[data-sucesso-whats]', feito).textContent = el.whats.value;
      form.hidden = true;
      feito.hidden = false;
      $('h3', feito).focus();
    }, 800);
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); if (!btn.disabled) enviar(); });
})();
