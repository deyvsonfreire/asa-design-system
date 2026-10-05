/* ==========================================================================
   RESERVA · ETAPA 3: dados e pagamento.
   Para quem é a reserva, dados do condutor (e do condutor adicional e de
   quem paga, quando há), forma de pagamento e consentimentos. Validação ao
   sair do campo e no envio, com resumo de erros no topo e foco no primeiro.

   Privacidade: nada pessoal vai para a URL nem para o GA4. Os dados do
   formulário ficam no sessionStorage da aba para voltar uma etapa sem
   perder nada; os campos do cartão (data-sem-guardar) não são guardados.
   Em produção, número, validade e código são campos hospedados do gateway.

   O envio é simulado. ?estado= mostra os retornos: recusado, preco,
   esgotado, erro; expirada mostra a sessão expirada.
   ========================================================================== */
(function () {
  'use strict';

  var F = window.AsaFunil, fmt = F.fmt, track = F.track;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var LISO = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  var digitos = function (v) { return (v || '').replace(/\D/g, ''); };
  var ERRO = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  var CHAVE = 'asa-checkout';
  var demo = new URLSearchParams(location.search).get('estado') || '';
  var s = F.estado();
  var respDaEtapa2 = s.responsavel;
  var form, conta;

  document.addEventListener('DOMContentLoaded', function () {
    if (s.ok && !s.protecao) { location.replace(F.url('/reservas-online/adicionais', s)); return; }
    if (!s.ok || demo === 'expirada') {
      $('[data-etapa]').hidden = true;
      $('[data-barra]').hidden = true;
      $('[data-expirada]').hidden = false;
      if (s.busca) $('[data-refazer]').href = F.url('/reservas-online', s, { grupo: '', upgrade: '', protecao: '', cadeiras: '', condutor: '', responsavel: '' });
      return;
    }
    form = $('[data-checkout]');
    iniciar();
  });

  function links() {
    $$('[data-editar="carro"]').forEach(function (a) { a.href = F.url('/reservas-online', s, { grupo: '', upgrade: '', protecao: '', cadeiras: '', condutor: '', responsavel: '' }); });
    $$('[data-editar="adicionais"]').forEach(function (a) { a.href = F.url('/reservas-online/adicionais', s); });
  }

  /* ---------- Resumo e botão ---------- */
  var anuncio = document.createElement('p');
  anuncio.className = 'site-sr';
  anuncio.setAttribute('role', 'status');
  function resumo(avisar) {
    conta = F.calcular(s);
    var el = $('[data-resumo]');
    el.removeAttribute('aria-live');
    el.innerHTML = F.resumo(s, conta, { prova: true });
    $('[data-barra-total]').textContent = fmt.real(conta.total);
    if (avisar) anuncio.textContent = 'Preço final atualizado: ' + fmt.real(conta.total) + '.';
    rotulo();
  }
  function pagamento() { var r = $('input[name="pagamento"]:checked', form); return r ? r.value : ''; }
  function rotulo() {
    var p = pagamento(), t = p === 'credito_online' ? 'Pagar ' + fmt.real(conta.total) + ' e reservar' : p === 'pix_online' ? 'Gerar Pix e reservar' : 'Confirmar reserva';
    $('[data-enviar-rotulo]').textContent = t;
    $('[data-enviar-barra]').textContent = p === 'credito_online' ? 'Pagar e reservar' : p === 'pix_online' ? 'Gerar Pix' : 'Reservar';
  }
  function salvarUrl() { history.replaceState(null, '', F.url(location.pathname, s)); links(); }

  /* ---------- Máscaras ---------- */
  var MASCARAS = {
    cpf: function (d) { d = d.slice(0, 11); return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2'); },
    data: function (d) { d = d.slice(0, 8); return d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3'); },
    cel: function (d) { d = d.slice(0, 11); if (d.length > 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4); if (d.length > 2) return '(' + d.slice(0, 2) + ') ' + d.slice(2); return d; },
    cartao: function (d) { return d.slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 '); },
    validade: function (d) { d = d.slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
  };

  /* ---------- Regras ---------- */
  function data(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 ? d : null;
  }
  function anos(de, ate) {
    var a = ate.getFullYear() - de.getFullYear();
    if (ate.getMonth() < de.getMonth() || (ate.getMonth() === de.getMonth() && ate.getDate() < de.getDate())) a--;
    return a;
  }
  function cpfOk(v) {
    var d = digitos(v);
    if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += +d[i] * (t + 1 - i);
      if (((soma * 10) % 11) % 10 !== +d[t]) return false;
    }
    return true;
  }
  function luhn(v) {
    var d = digitos(v), soma = 0, dobra = false;
    if (d.length < 13) return false;
    for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (dobra) { n *= 2; if (n > 9) n -= 9; } soma += n; dobra = !dobra; }
    return soma % 10 === 0;
  }
  var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var ativo = function (id) { var el = document.getElementById(id); return el && !el.closest('[hidden]'); };

  // Cada regra devolve [mensagem, tipo para o GA4] ou '' quando está certo.
  var R = {
    nome: function (id) { return val(id).split(/\s+/).filter(Boolean).length >= 2 ? '' : ['Escreva nome e sobrenome, como na CNH.', 'nome']; },
    cpf: function (id) {
      if (!digitos(val(id))) return ['Informe o CPF.', 'vazio'];
      if (!cpfOk(val(id))) return ['Este CPF não é válido. Confira os números.', 'cpf'];
      var outros = ['co-cpf', 'ad-cpf', 'rf-cpf'].filter(function (o) { return o !== id && ativo(o) && digitos(val(o)) === digitos(val(id)); });
      if (outros.length && id !== 'co-cpf') return [id === 'ad-cpf' ? 'O condutor adicional precisa ser outra pessoa, com CPF próprio.' : 'O responsável financeiro precisa ser outra pessoa, com CPF próprio.', 'cpf_repetido'];
      return '';
    },
    nasc: function (id) {
      if (!val(id)) return ['Informe a data de nascimento.', 'vazio'];
      var d = data(val(id));
      if (!d || d > new Date()) return ['Confira a data de nascimento, no formato dd/mm/aaaa.', 'data'];
      return anos(d, s.ini) < 21 ? ['Para alugar na Asa, o condutor precisa ter 21 anos completos na data da retirada.', 'idade'] : '';
    },
    cnh: function (id) {
      if (!val(id)) return ['Informe a data da 1ª habilitação.', 'vazio'];
      var d = data(val(id)), nasc = data(val(id.replace('cnh', 'nasc')));
      var aos18 = nasc ? new Date(nasc.getFullYear() + 18, nasc.getMonth(), nasc.getDate()) : null;
      if (!d || d > new Date() || (aos18 && d < aos18)) return ['Confira a data: ela está no campo "1ª habilitação" da CNH.', 'data'];
      return anos(d, s.ini) < 2 ? ['A CNH precisa ter pelo menos 2 anos na data da retirada. Se outra pessoa habilitada há mais tempo puder dirigir, cadastre essa pessoa como condutor.', 'cnh_2_anos'] : '';
    },
    email: function (id) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val(id)) ? '' : ['Confira o e-mail. Exemplo de formato: nome@provedor.com', 'email']; },
    cel: function (id) { return digitos(val(id)).length === 11 ? '' : ['Informe o celular com DDD, 11 números.', 'celular']; },
    voo: function (id) { return !val(id) || /^[A-Z0-9]{2}\s?\d{1,4}$/i.test(val(id)) ? '' : ['Use o código da companhia e o número, como aparece no seu bilhete.', 'voo']; },
    'ca-num': function () { return luhn(val('ca-num')) ? '' : ['Confira o número do cartão.', 'cartao']; },
    'ca-nome': function () { return val('ca-nome') ? '' : ['Informe o nome impresso no cartão.', 'vazio']; },
    'ca-val': function () {
      var m = /^(\d{2})\/(\d{2})$/.exec(val('ca-val'));
      if (!m || +m[1] < 1 || +m[1] > 12) return ['Confira a validade, no formato MM/AA.', 'validade'];
      var fim = new Date(2000 + +m[2], +m[1], 0, 23, 59);
      return fim < new Date() ? ['Este cartão está vencido. Use outro cartão.', 'cartao_vencido'] : '';
    },
    'ca-cvv': function () { var n = digitos(val('ca-cvv')).length; return n === 3 || n === 4 ? '' : ['Informe os 3 ou 4 números do código de segurança.', 'cvv']; }
  };
  function regra(id) {
    if (R[id]) return R[id];
    var tipo = id.split('-')[1];
    return function () { return R[tipo](id); };
  }
  var ROTULO = { 'co-nome': 'Nome do condutor', 'co-cpf': 'CPF do condutor', 'co-nasc': 'Data de nascimento', 'co-cnh': 'Data da 1ª habilitação', 'co-email': 'E-mail',
    'co-cel': 'Celular', 'co-voo': 'Número do voo', 'ad-nome': 'Nome do condutor adicional', 'ad-cpf': 'CPF do condutor adicional', 'ad-nasc': 'Nascimento do condutor adicional',
    'ad-cnh': '1ª habilitação do condutor adicional', 'rf-nome': 'Nome de quem paga', 'rf-cpf': 'CPF de quem paga', 'rf-email': 'E-mail de quem paga', 'rf-cel': 'Celular de quem paga',
    'ca-num': 'Número do cartão', 'ca-nome': 'Nome no cartão', 'ca-val': 'Validade do cartão', 'ca-cvv': 'Código de segurança', dono: 'De quem é o cartão',
    pagamento: 'Forma de pagamento', 'aceite-regras': 'Aceite das regras', 'aceite-requisitos': 'Confirmação dos requisitos' };

  function mostrar(id, msg) {
    var box = document.getElementById(id + '-erro');
    if (!box) return;
    $('span', box).textContent = msg || '';
    box.hidden = !msg;
    var alvos = id === 'dono' || id === 'pagamento' ? $$('input[name="' + id + '"]', form) : [document.getElementById(id)];
    alvos.forEach(function (el) { if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); });
  }
  function checar(id) {
    var r = regra(id)();
    mostrar(id, r ? r[0] : '');
    return r ? r[1] : '';
  }
  function campos() {
    var ids = ['co-nome', 'co-cpf', 'co-nasc', 'co-cnh', 'co-email', 'co-cel', 'co-voo', 'ad-nome', 'ad-cpf', 'ad-nasc', 'ad-cnh', 'rf-nome', 'rf-cpf', 'rf-email', 'rf-cel'];
    if (pagamento() === 'credito_online') ids = ids.concat(['ca-num', 'ca-nome', 'ca-val', 'ca-cvv']);
    return ids.filter(ativo);
  }
  function validarTudo() {
    var erros = [];
    if ($('#outra').checked && !$('input[name="dono"]:checked', form)) { mostrar('dono', 'Diga de quem é o cartão de crédito da caução.'); erros.push(['dono', 'vazio']); } else mostrar('dono', '');
    campos().forEach(function (id) { var t = checar(id); if (t) erros.push([id, t]); });
    if (!pagamento()) { mostrar('pagamento', 'Escolha como quer pagar.'); erros.push(['pagamento', 'vazio']); } else mostrar('pagamento', '');
    ['aceite-regras', 'aceite-requisitos'].forEach(function (id) {
      var ok = document.getElementById(id).checked;
      mostrar(id, ok ? '' : 'Para reservar, marque esta confirmação.');
      if (!ok) erros.push([id, 'consentimento']);
    });
    return erros;
  }
  function primeiro(id) { return id === 'dono' || id === 'pagamento' ? $('input[name="' + id + '"]', form) : document.getElementById(id); }

  var caixaErros;
  function resumoErros(erros) {
    caixaErros.innerHTML = '';
    if (!erros.length) return;
    var n = erros.length;
    caixaErros.innerHTML = '<div class="asa-alert asa-alert--error" role="alert">' + ERRO + '<div class="asa-alert__body"><span class="asa-alert__title"></span><ul></ul></div></div>';
    $('.asa-alert__title', caixaErros).textContent = (n === 1 ? 'Falta 1 informação' : 'Faltam ' + n + ' informações') + ' para reservar. Confira os campos marcados.';
    var ul = $('ul', caixaErros);
    erros.forEach(function (e) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + primeiro(e[0]).id;
      a.textContent = ROTULO[e[0]];
      a.addEventListener('click', function (ev) { ev.preventDefault(); primeiro(e[0]).focus(); });
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  /* ---------- Para quem é a reserva ---------- */
  function quemPaga() {
    var outra = $('#outra').checked, dono = $('input[name="dono"]:checked', form);
    var meu = outra && dono && dono.value === 'meu';
    $('[data-outra]').hidden = !outra;
    $('[data-meu-alerta]').hidden = !meu;
    // "Meu" põe o responsável financeiro na reserva (e de volta na etapa 2); desligar volta ao que a etapa 2 tinha.
    var antes = s.responsavel;
    s.responsavel = meu || respDaEtapa2;
    $('[data-responsavel]').hidden = !s.responsavel;
    $('#resp-titulo').innerHTML = meu ? 'Seus <em>dados</em>' : 'Quem paga a <em>caução</em>';
    $('[data-resp-lead]').textContent = meu ? 'Você é o responsável financeiro: precisa estar no balcão na retirada, com o cartão de crédito físico no seu nome.'
      : 'O dono do cartão precisa estar no balcão na retirada, com o cartão de crédito físico no nome dele.';
    if (antes !== s.responsavel) { salvarUrl(); resumo(true); }
  }

  /* ---------- Guardar e repor (sem o cartão) ---------- */
  function guardar() {
    var d = {};
    $$('input, select', form).forEach(function (el) {
      if (el.hasAttribute('data-sem-guardar') || !el.name || el.name === 'site') return;
      if (el.type === 'checkbox') d[el.name] = el.checked;
      else if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; }
      else d[el.id || el.name] = el.value;
    });
    F.gravar(CHAVE, d);
  }
  function repor() {
    var d = F.ler(CHAVE);
    if (!d) return;
    $$('input, select', form).forEach(function (el) {
      if (el.hasAttribute('data-sem-guardar') || !el.name) return;
      if (el.type === 'checkbox') el.checked = !!d[el.name];
      else if (el.type === 'radio') el.checked = d[el.name] === el.value;
      else if (d[el.id || el.name] !== undefined) el.value = d[el.id || el.name];
    });
  }

  /* ---------- Envio ---------- */
  var envio;
  function enviando(on) {
    $$('[data-enviar], [data-enviar-barra]').forEach(function (b) {
      b.disabled = on;
      if (on) { b.setAttribute('data-state', 'loading'); b.setAttribute('aria-busy', 'true'); } else { b.removeAttribute('data-state'); b.removeAttribute('aria-busy'); }
    });
    if (on) $('[data-enviar-rotulo]').textContent = 'Confirmando sua reserva…'; else rotulo();
    $('[data-enviando]').hidden = !on;
  }
  function aviso(tipo, titulo, texto, acoes) {
    envio.innerHTML = '<div class="asa-alert asa-alert--' + tipo + '" role="alert">' + ERRO + '<div class="asa-alert__body"><span class="asa-alert__title">' + titulo + '</span>' +
      '<span class="asa-alert__text">' + texto + '</span><span class="site-alert__links">' + acoes + '</span></div></div>';
    envio.scrollIntoView({ behavior: LISO, block: 'center' });
    var foco = $('button, a', envio);
    if (foco) foco.focus({ preventScroll: true });
  }
  function enviar() {
    var erros = validarTudo();
    resumoErros(erros);
    envio.innerHTML = '';
    if (erros.length) {
      track('checkout_error', { error_field: erros.map(function (e) { return e[0]; }).join(','), error_type: erros.map(function (e) { return e[1]; }).join(',') });
      caixaErros.scrollIntoView({ behavior: LISO, block: 'start' });
      $('a', caixaErros).focus({ preventScroll: true });
      return;
    }
    if ($('#ck-site').value) return;   // armadilha de robô
    enviando(true);
    setTimeout(function () {
      enviando(false);
      var d = demo;
      demo = '';   // o retorno simulado aparece uma vez; "Tentar de novo" segue
      if (d === 'recusado' && pagamento() === 'credito_online') {
        track('checkout_error', { error_field: 'pagamento', error_type: 'cartao_recusado' });
        aviso('error', 'O pagamento não foi aprovado pelo banco', 'Nada foi cobrado. Confira os dados, tente outro cartão ou escolha outra forma de pagamento.',
          '<button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-de-novo>Tentar de novo</button>');
        $('[data-de-novo]', envio).addEventListener('click', function () { envio.innerHTML = ''; $('#ca-num').focus(); });
        return;
      }
      if (d === 'preco') {
        var novo = F.calcular(Object.assign({}, s, { grupo: Object.assign({}, s.grupo, { tarifa: s.grupo.tarifa + 10 }) })).total;
        track('checkout_error', { error_field: 'preco', error_type: 'preco_mudou' });
        aviso('warn', 'O preço mudou', 'O preço deste carro mudou desde a sua busca: agora é ' + fmt.real(novo) + '. Quer continuar com o novo valor?',
          '<button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-novo-preco>Continuar com ' + fmt.real(novo) + '</button><a class="asa-btn asa-btn--link asa-btn--sm" href="' + $('[data-editar="carro"]').href + '">Voltar e escolher outro carro</a>');
        $('[data-novo-preco]', envio).addEventListener('click', function () {
          s.grupo.tarifa += 10; s.ajusteTarifa = 10;
          resumo(true);
          envio.innerHTML = '';
          enviar();
        });
        return;
      }
      if (d === 'esgotado') {
        track('checkout_error', { error_field: 'disponibilidade', error_type: 'esgotado' });
        aviso('error', 'Este grupo esgotou', 'Este grupo acabou de esgotar para as suas datas. Seus dados continuam preenchidos.',
          '<a class="asa-btn asa-btn--outline asa-btn--sm" href="' + $('[data-editar="carro"]').href + '">Escolher outro carro</a>');
        return;
      }
      if (d === 'erro') {
        track('checkout_error', { error_field: 'sistema', error_type: 'erro_sistema' });
        var wa = 'https://wa.me/5508000800015?text=' + encodeURIComponent('Olá! Estou terminando uma reserva no site da Asa e o sistema deu erro. Retirada ' + F.LOCAIS[s.local].curto + ' no dia ' + fmt.dataCurta(s.ini) + '.');
        aviso('error', 'Não conseguimos concluir a reserva agora', 'Nada foi cobrado. Tente de novo em alguns minutos ou fale com a equipe, que termina a reserva com você.',
          '<button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-de-novo>Tentar de novo</button><a class="asa-btn asa-btn--link asa-btn--sm" href="' + wa + '" target="_blank" rel="noopener noreferrer" data-wa-erro>Falar no WhatsApp<span class="site-sr"> (abre em nova aba)</span></a>');
        $('[data-de-novo]', envio).addEventListener('click', enviar);
        $('[data-wa-erro]', envio).addEventListener('click', function () { track('generate_lead', { method: 'whatsapp', lead_topic: 'checkout_erro', page_type: 'checkout' }); });
        return;
      }
      concluir();
    }, 1200);
  }

  /* Reserva feita: guarda o que a confirmação precisa (no protótipo, na aba) e segue. */
  function concluir() {
    var L = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', cod = '';
    for (var i = 0; i < 6; i++) cod += L[Math.floor(Math.random() * L.length)];
    var meu = $('#outra').checked && ($('input[name="dono"]:checked', form) || {}).value === 'meu';
    var cpf = digitos(val('co-cpf'));
    F.gravar('asa-reserva-feita', {
      localizador: s.local + '-' + cod, busca: F.url('', s).slice(1), ajusteTarifa: s.ajusteTarifa || 0, pagamento: pagamento(),
      primeiroNome: (meu ? val('rf-nome') : val('co-nome')).split(/\s+/)[0],
      email: meu ? val('rf-email') : val('co-email'),
      condutor: val('co-nome'), cpfMeio: cpf.slice(3, 6),
      adicional: ativo('ad-nome') ? val('ad-nome') : '', responsavel: s.responsavel ? val('rf-nome') : '', souResponsavel: !!meu,
      criada: new Date().toISOString()
    });
    try { sessionStorage.removeItem(CHAVE); } catch (e) { /* segue */ }
    location.href = '/reservas-online/confirmacao';
  }

  function iniciar() {
    caixaErros = $('[data-resumo-erros]');
    envio = $('[data-envio]');
    document.body.appendChild(anuncio);
    repor();
    links();
    $('[data-adicional]').hidden = !s.condutor;

    $$('[data-mascara]', form).forEach(function (el) {
      el.addEventListener('input', function () { el.value = MASCARAS[el.dataset.mascara](digitos(el.value)); });
    });
    // Validação ao sair do campo; o erro some assim que o valor fica certo.
    form.addEventListener('focusout', function (e) {
      var el = e.target;
      if (!el.id || !el.value || el.type === 'checkbox' || el.type === 'radio') return;
      if (regra(el.id) && (R[el.id] || R[el.id.split('-')[1]])) checar(el.id);
    });
    form.addEventListener('input', function (e) {
      var el = e.target;
      if (el.getAttribute('aria-invalid') === 'true' && el.id && (R[el.id] || R[el.id.split('-')[1]]) && !regra(el.id)()) mostrar(el.id, '');
      guardar();
    });
    form.addEventListener('change', function (e) {
      var el = e.target;
      if (el.name === 'aceite-regras' || el.name === 'aceite-requisitos') { if (el.checked) mostrar(el.id, ''); }
      guardar();
    });

    $('#outra').addEventListener('change', function (e) {
      if (!e.target.checked) $$('input[name="dono"]', form).forEach(function (r) { r.checked = false; });
      quemPaga();
      track('checkout_option', { booking_for: e.target.checked ? 'other' : 'self' });
    });
    $$('input[name="dono"]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        mostrar('dono', '');
        quemPaga();
        track('checkout_option', { booking_for: 'other', card_owner: r.value === 'meu' ? 'responsavel_financeiro' : 'condutor' });
      });
    });
    $('[data-meu-manter]').addEventListener('click', function () { $('#rf-nome').focus(); });
    $('[data-meu-mudar]').addEventListener('click', function () {
      $$('input[name="dono"]', form).forEach(function (r) { r.checked = false; });
      quemPaga();
      $('input[name="dono"]', form).focus();
    });

    $$('input[name="pagamento"]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        $$('[data-pay-corpo]', form).forEach(function (c) { c.hidden = c.dataset.payCorpo !== r.value; });
        mostrar('pagamento', '');
        rotulo();
        track('add_payment_info', { payment_type: r.value, currency: 'BRL', value: conta.total, items: conta.items });
      });
    });

    form.addEventListener('submit', function (e) { e.preventDefault(); if (!$('[data-enviar]').disabled) enviar(); });

    $('[data-ver-resumo]').addEventListener('click', function () {
      var el = $('[data-resumo]');
      el.scrollIntoView({ behavior: LISO, block: 'start' });
      el.focus({ preventScroll: true });
      track('view_cart', { currency: 'BRL', value: conta.total, items: conta.items });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { $('[data-barra]').classList.toggle('site-sumbar--fora', es[0].isIntersecting); }).observe($('.site-sum__actions'));
    }

    quemPaga();
    var marcado = $('input[name="pagamento"]:checked', form);
    if (marcado) $$('[data-pay-corpo]', form).forEach(function (c) { c.hidden = c.dataset.payCorpo !== marcado.value; });
    resumo(false);
    track('begin_checkout', { currency: 'BRL', value: conta.total, coupon: s.codigo, items: conta.items });
  }
})();
