/* ==========================================================================
   EMPRESAS · formulário de proposta B2B.
   Validação ao sair do campo e no envio, com resumo de erros no topo e
   links para cada campo. Máscara e dígitos do CNPJ, máscara do telefone,
   aviso (sem bloquear) para e-mail pessoal, "Processo de contratação" só
   para órgão público e economia mista, contador da mensagem. Sem destino
   definido (PENDENCIAS.md): o envio é simulado; ?erro mostra o erro.
   GA4 sem dado pessoal nem CNPJ.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.querySelector('[data-proposta]');
  if (!form) return;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var track = window.asaTrack || function () {};
  var digitos = function (v) { return v.replace(/\D/g, ''); };
  var ERRO = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  var PESSOAIS = /@(gmail|hotmail|outlook|live|yahoo|icloud|bol|uol|terra|ig)\./i;
  var FORM_ID = 'proposta_empresas';

  var el = {
    tipo: $$('input[name="tipo"]', form), org: $('#em-org'), cnpj: $('#em-cnpj'), cidade: $('#em-cidade'),
    nome: $('#em-nome'), email: $('#em-email'), tel: $('#em-tel'), contratacao: $('#em-contratacao'),
    qtd: $('#em-qtd'), detalhes: $('#em-detalhes'), lgpd: $('#em-lgpd'), armadilha: $('#em-site')
  };

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
    tipo: function () { return el.tipo.some(function (r) { return r.checked; }) ? '' : 'Escolha o tipo de organização.'; },
    org: function (v) { return v.trim() ? '' : 'Informe o nome da empresa ou do órgão.'; },
    cnpj: function (v) { return !digitos(v) ? 'Informe o CNPJ.' : cnpjOk(v) ? '' : 'Esse CNPJ não confere. Confira os 14 números.'; },
    cidade: function (v) { return v.trim() ? '' : 'Informe onde os carros vão rodar.'; },
    nome: function (v) { return v.trim() ? '' : 'Informe seu nome.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Esse e-mail parece incompleto. Confira se tem @ e domínio.'; },
    tel: function (v) { var n = digitos(v).length; return n === 10 || n === 11 ? '' : 'Confira o número com DDD.'; },
    contratacao: function (v) { return v ? '' : 'Escolha o tipo de contratação, ou marque "Ainda não sei".'; },
    qtd: function (v) { return v ? '' : 'Diga quantos veículos, mesmo que seja uma estimativa.'; },
    detalhes: function (v) { return v.length <= 1000 ? '' : 'Use até 1.000 caracteres. O edital completo pode ir por e-mail depois.'; },
    lgpd: function () { return el.lgpd.checked ? '' : 'Marque a autorização para o comercial poder responder.'; }
  };
  var ROTULO = { tipo: 'Tipo de organização', org: 'Nome da empresa ou órgão', cnpj: 'CNPJ', cidade: 'Cidade e estado da operação', nome: 'Seu nome',
    email: 'E-mail de trabalho', tel: 'Telefone ou WhatsApp', contratacao: 'Tipo de contratação', qtd: 'Quantos veículos', detalhes: 'Detalhes', lgpd: 'Autorização de contato' };
  var alvo = function (nome) { return nome === 'tipo' ? el.tipo[0] : el[nome]; };
  var caixa = function (nome) { return document.getElementById('em-' + nome + '-erro'); };

  function mostrar(nome, msg) {
    var box = caixa(nome);
    $('span', box).textContent = msg;
    box.hidden = !msg;
    (nome === 'tipo' ? el.tipo : [el[nome]]).forEach(function (i) {
      if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
    });
  }
  function validar(nome) {
    var msg = REGRAS[nome](nome === 'tipo' ? '' : el[nome].value);
    mostrar(nome, msg);
    return !msg;
  }

  Object.keys(REGRAS).forEach(function (nome) {
    var inputs = nome === 'tipo' ? el.tipo : [el[nome]];
    inputs.forEach(function (i) {
      var evento = i.type === 'checkbox' || i.type === 'radio' || i.tagName === 'SELECT' ? 'change' : 'blur';
      i.addEventListener(evento, function () {
        if (evento === 'blur' && !i.value && !i.hasAttribute('aria-invalid')) return;
        validar(nome);
      });
      i.addEventListener('input', function () {
        if (i.hasAttribute('aria-invalid') && !REGRAS[nome](nome === 'tipo' ? '' : i.value)) mostrar(nome, '');
      });
    });
  });

  /* ---------- Máscaras ---------- */
  el.cnpj.addEventListener('input', function () {
    var d = digitos(el.cnpj.value).slice(0, 14);
    el.cnpj.value = d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  });
  el.tel.addEventListener('input', function () {
    var d = digitos(el.tel.value).slice(0, 11);
    var v = d;
    if (d.length > 2) v = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 6) v = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(d.length - 4);
    el.tel.value = v;
  });

  /* ---------- E-mail pessoal: aviso, sem bloquear ---------- */
  var avisoEmail = $('#em-email-aviso');
  el.email.addEventListener('blur', function () { avisoEmail.hidden = !PESSOAIS.test(el.email.value); });

  /* ---------- Processo de contratação: só para órgão público e economia mista ---------- */
  var processo = $('[data-condicional="processo"]', form);
  el.tipo.forEach(function (r) {
    r.addEventListener('change', function () { processo.hidden = !(r.checked && r.value !== 'privada'); });
  });

  /* ---------- Contador ---------- */
  var conta = $('#em-detalhes-conta');
  el.detalhes.addEventListener('input', function () { conta.textContent = el.detalhes.value.length + '/1000'; });

  /* ---------- Atalhos "Escolha o seu caso": pré-seleciona a contratação ---------- */
  $$('[data-preset]').forEach(function (a) {
    a.addEventListener('click', function () { el.contratacao.value = a.dataset.preset; mostrar('contratacao', ''); });
  });

  /* ---------- form_start ---------- */
  var comecou = false;
  form.addEventListener('input', function () { if (!comecou) { comecou = true; track('form_start', { form_id: FORM_ID }); } });

  /* ---------- Resumo de erros e avisos ---------- */
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

  /* ---------- Envio ---------- */
  var btn = $('button[type="submit"]', form);
  var label = $('.asa-btn__label', btn);
  var feito = document.querySelector('[data-sucesso]');

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
    btn.disabled = true;
    btn.setAttribute('data-state', 'loading');
    btn.setAttribute('aria-busy', 'true');
    label.textContent = 'Enviando…';
    aviso.innerHTML = '';

    // Protótipo: aqui entra o envio real (CRM ou e-mail do comercial, a definir). ?erro mostra o estado de erro.
    setTimeout(function () {
      btn.disabled = false;
      btn.removeAttribute('data-state');
      btn.removeAttribute('aria-busy');
      label.textContent = 'Enviar pedido de proposta';
      if (location.search.indexOf('erro') !== -1) {
        aviso.innerHTML = '<div class="asa-alert asa-alert--error" role="alert">' + ERRO + '<div class="asa-alert__body"><span class="asa-alert__title">Não conseguimos enviar agora</span><span class="asa-alert__text">Seus dados continuam preenchidos. Tente de novo ou ligue para 0800 080 0015.</span><button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-de-novo>Tentar de novo</button></div></div>';
        $('[data-de-novo]', aviso).addEventListener('click', enviar);
        track('form_error', { form_id: FORM_ID, error_fields: 'envio' });
        return;
      }
      var tipo = el.tipo.filter(function (r) { return r.checked; })[0].value;
      track('generate_lead', { form_id: FORM_ID, lead_type: 'b2b', org_type: tipo, contract_type: el.contratacao.value, fleet_size_bucket: el.qtd.value });
      $('[data-sucesso-email]', feito).textContent = el.email.value.trim();
      form.hidden = true;
      feito.hidden = false;
      var titulo = $('h3', feito);
      titulo.focus();
    }, 800);
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); if (!btn.disabled) enviar(); });
})();
