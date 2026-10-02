/* ==========================================================================
   MINHA RESERVA · consulta por localizador e CPF, sem senha.
   Duas versões da copy no mesmo HTML:
   - B (padrão, sem integração): valida só o formato e segue para o
     WhatsApp com o localizador na mensagem (o CPF não vai).
   - A (?versao=a, com integração ao Sankhya): mostra o painel da reserva
     com o status e só as ações que valem para ele.
   Protótipo da A: REC-7K4P2Q + 529.982.247-25 abre a reserva de exemplo
   (?status=pix|cancelada|concluida|proxima); a reserva feita no funil
   nesta aba também é encontrada. ?estado= mostra nao-encontrada,
   bloqueada, erro e expirada.
   GA4: manage_booking, refund e generate_lead, sem localizador nem CPF
   (salvo o transaction_id do refund).
   ========================================================================== */
(function () {
  'use strict';

  var F = window.AsaFunil, fmt = F.fmt, track = F.track;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var q = new URLSearchParams(location.search);
  var VERSAO = q.get('versao') === 'a' ? 'A' : 'B';
  var demo = q.get('estado') || '';
  var LISO = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  var digitos = function (v) { return (v || '').replace(/\D/g, ''); };
  var ERRO = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  var OK = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  var WA = 'https://wa.me/5508000800015?text=';
  var STATUS = {
    confirmada: { rotulo: 'Confirmada', cls: 'asa-tag--ok', icone: '<polyline points="20 6 9 17 4 12"/>' },
    pix: { rotulo: 'Aguardando pagamento', cls: 'asa-tag--warn', icone: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>' },
    cancelada: { rotulo: 'Cancelada', cls: 'asa-tag--neutral', icone: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' },
    concluida: { rotulo: 'Concluída', cls: 'asa-tag--ink', icone: '<polyline points="20 6 9 17 4 12"/>' }
  };
  var PAGO = { credito_online: 'Pago no cartão', pix_online: 'Pago no Pix', pagar_retirada: 'Pagar na retirada' };

  /* Contato nesta página é lead de quem já tem reserva (a copy pede
     generate_lead), não o contact_click das páginas de ajuda. */
  $$('[data-contato]').forEach(function (a) {
    a.removeAttribute('data-contato');
    a.addEventListener('click', function () { track('generate_lead', { method: 'whatsapp', lead_topic: 'tenho_reserva', version: VERSAO }); });
  });

  var form, campoLoc, campoCpf, btn, label, idle, tentativas = 0, reserva = null;

  /* ---------- Validação de formato ---------- */
  var LOC = /^[A-Z0-9]{2,4}-?[A-Z0-9]{4,8}$/;   // [CONFIRMAR: formato do localizador]
  function cpfOk(v) {
    var d = digitos(v);
    if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
    for (var t = 9; t < 11; t++) {
      var s = 0;
      for (var i = 0; i < t; i++) s += +d[i] * (t + 1 - i);
      if (((s * 10) % 11) % 10 !== +d[t]) return false;
    }
    return true;
  }
  function mostrar(id, msg) {
    var box = document.getElementById(id + '-erro'), el = document.getElementById(id);
    $('span', box).textContent = msg || '';
    box.hidden = !msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }
  function validar() {
    var l = campoLoc.value.trim().toUpperCase(), ok = true;
    if (!l) { mostrar('mr-loc', 'Informe o localizador da reserva.'); ok = false; }
    else if (!LOC.test(l)) { mostrar('mr-loc', 'Confira o localizador: ele está no e-mail de confirmação.'); ok = false; }
    else mostrar('mr-loc', '');
    if (!cpfOk(campoCpf.value)) { mostrar('mr-cpf', 'Este CPF não é válido. Confira os números.'); ok = false; }
    else mostrar('mr-cpf', '');
    return ok;
  }

  /* ---------- Avisos no topo do cartão ---------- */
  var aviso;
  function avisar(tipo, titulo, texto, acoes) {
    aviso.innerHTML = '<div class="asa-alert asa-alert--' + tipo + '" role="alert">' + ERRO + '<div class="asa-alert__body"><span class="asa-alert__title">' + titulo + '</span>' +
      '<span class="asa-alert__text">' + texto + '</span>' + (acoes ? '<span class="site-alert__links">' + acoes + '</span>' : '') + '</div></div>';
    $$('[data-wa-aviso]', aviso).forEach(function (a) {
      a.addEventListener('click', function () { track('generate_lead', { method: 'whatsapp', lead_topic: 'tenho_reserva', version: VERSAO }); });
    });
    var de = $('[data-de-novo]', aviso);
    if (de) de.addEventListener('click', function () { aviso.innerHTML = ''; campoLoc.focus(); });
  }
  var waAviso = function () {
    return '<a class="asa-btn asa-btn--link asa-btn--sm" href="' + WA + encodeURIComponent('Olá! Tenho uma reserva na Asa e preciso de ajuda.') + '" target="_blank" rel="noopener noreferrer" data-wa-aviso>Falar no WhatsApp<span class="site-sr"> (abre em nova aba)</span></a>';
  };

  /* ---------- Reserva de exemplo e reserva da aba ---------- */
  function exemplo() {
    var st = q.get('status') || 'confirmada';
    var ini = new Date(); ini.setHours(10, 0, 0, 0);
    ini.setDate(ini.getDate() + (st === 'proxima' ? 0 : st === 'concluida' ? -10 : 10));
    if (st === 'proxima') ini = new Date(Date.now() + 18 * F.HORA);   // menos de 24h para a retirada
    var fim = new Date(ini.getTime() + 3 * F.DIA);
    return {
      localizador: 'REC-7K4P2Q', cpf: '52998224725', status: st === 'proxima' ? 'confirmada' : st, pagamento: st === 'pix' ? 'pix_online' : 'credito_online',
      busca: 'local=REC&retirada=' + fmt.toLocal(ini) + '&devolucao=' + fmt.toLocal(fim) + '&grupo=B&protecao=terceiros',
      condutor: 'Ana Exemplo da Silva', cpfMeio: '982'
    };
  }
  function procurar(l, cpf) {
    var e = exemplo();
    if (l.replace('-', '') === e.localizador.replace('-', '') && cpf === e.cpf) return e;
    var feita = F.ler('asa-reserva-feita');
    // A reserva da aba guarda só o meio do CPF (privacidade): no protótipo, basta o meio bater.
    if (feita && l.replace('-', '') === feita.localizador.replace('-', '') && cpf.slice(3, 6) === feita.cpfMeio) {
      return Object.assign({}, feita, { status: feita.pagamento === 'pix_online' && !F.ler('asa-pix-pago-' + feita.localizador) ? 'pix' : 'confirmada' });
    }
    return null;
  }

  /* ---------- Painel (versão A) ---------- */
  function painel(r) {
    var s = F.estado('?' + r.busca);
    if (r.ajusteTarifa) s.grupo.tarifa += r.ajusteTarifa;
    var conta = F.calcular(s), c = s.upgrade || s.grupo, L = F.LOCAIS[s.local];
    var st = STATUS[r.status];
    var antes = s.ini > new Date();
    var horas = (s.ini - new Date()) / F.HORA;
    var nomes = r.condutor.split(/\s+/);
    $('[data-r-loc]').textContent = r.localizador;
    var tag = $('[data-r-status]');
    tag.className = 'asa-tag site-status ' + st.cls;
    tag.innerHTML = '<svg class="asa-icon" viewBox="0 0 24 24" aria-hidden="true">' + st.icone + '</svg>' + st.rotulo;
    var linhas = [
      ['Carro', 'Grupo ' + c.g + ' · ' + fmt.esc(c.modelo) + ' ou similar'],
      ['Retirada', fmt.data(s.ini) + ', ' + fmt.hora(s.ini) + ' · ' + L.nome],
      ['Devolução', fmt.data(s.fim) + ', ' + fmt.hora(s.fim) + ' · ' + L.nome + ' · até as ' + fmt.hora(s.limite) + ' sem outra diária'],
      ['Condutor', fmt.esc(nomes[0] + ' ' + nomes[nomes.length - 1][0] + '.') + ' · CPF ***.' + r.cpfMeio + '.***-**'],
      ['Preço final', fmt.real(conta.total) + ' · ' + (r.status === 'pix' ? 'Aguardando o Pix' : r.status === 'cancelada' ? 'Cancelada' : PAGO[r.pagamento])]
    ];
    $('[data-r-linhas]').innerHTML = linhas.map(function (l) { return '<div><dt>' + l[0] + '</dt><dd>' + l[1] + '</dd></div>'; }).join('');
    $('[data-r-cartao]').hidden = !(antes && (r.status === 'confirmada' || r.status === 'pix'));

    // Só as ações que valem para o status.
    var acoes = [];
    var waAlterar = WA + encodeURIComponent('Olá! Quero alterar a reserva ' + r.localizador + '.');
    var waTarde = WA + encodeURIComponent('Olá! Quero cancelar a reserva ' + r.localizador + '. Faltam menos de 24 horas para a retirada.');
    if (r.status === 'confirmada' && antes) {
      acoes.push('<div class="site-booking-card__main"><a class="asa-btn asa-btn--primary" href="https://precadastro.asalocadora.com.br" target="_blank" rel="noopener noreferrer" data-acao="precadastro">Fazer meu pré-cadastro<span class="site-sr"> (abre em nova aba)</span></a>' +
        '<p>Adiante seus dados e a foto da CNH antes de viajar.</p></div>');
      acoes.push('<p class="site-booking-card__row"><a class="site-booking-card__link" href="/reservas-online/confirmacao' + (r.cpf ? '?exemplo=cartao' : '') + '" data-acao="voucher">Ver o voucher</a> <span class="site-pending">[CONFIRMAR: PDF do voucher]</span></p>');
      acoes.push('<p class="site-booking-card__row"><a class="site-booking-card__link" href="' + waAlterar + '" target="_blank" rel="noopener noreferrer" data-acao="alterar">Pedir alteração de data ou carro<span class="site-sr"> (abre em nova aba)</span></a> <span class="site-pending">[CONFIRMAR: alteração pelo site]</span></p>');
      if (horas > 24) acoes.push('<button class="asa-btn asa-btn--link site-booking-card__link" type="button" data-acao="cancelar_iniciar" aria-haspopup="dialog" aria-controls="cancelar-modal">Cancelar reserva</button>');
      else acoes.push('<p class="site-booking-card__late">Faltam menos de 24 horas para a retirada. Para cancelar agora, fale com a equipe. <a href="' + waTarde + '" target="_blank" rel="noopener noreferrer" data-acao="whatsapp">Falar no WhatsApp<span class="site-sr"> (abre em nova aba)</span></a> <span class="site-pending">[CONFIRMAR: cancelamento com menos de 24h e no-show]</span></p>');
    } else if (r.status === 'pix') {
      acoes.push('<a class="asa-btn asa-btn--primary" href="/reservas-online/confirmacao' + (r.cpf ? '?exemplo=pix' : '') + '" data-acao="pagar_pix">Ver código Pix</a>');
    }
    $('[data-r-acoes]').innerHTML = acoes.join('');
    $('[data-r-acoes]').hidden = !acoes.length;
    $$('[data-acao]', $('[data-r-acoes]')).forEach(function (a) {
      a.addEventListener('click', function () {
        if (a.dataset.acao === 'whatsapp') { track('generate_lead', { method: 'whatsapp', lead_topic: 'tenho_reserva', version: VERSAO }); return; }
        track('manage_booking', { action: a.dataset.acao, booking_status: r.status });
        if (a.dataset.acao === 'cancelar_iniciar') abrirModal('cancelar', a);
      });
    });
    $('[data-c-loc]').textContent = r.localizador;
    reserva = { r: r, conta: conta };
  }

  /* ---------- Modais ---------- */
  var aberto = null;
  function abrirModal(nome, gatilho) {
    var m = $('[data-modal="' + nome + '"]'), sup = $('.asa-modal__surface', m), veu = $('[data-veu]');
    aberto = { m: m, sup: sup, gatilho: gatilho };
    sup.removeAttribute('inert');
    m.setAttribute('data-state', 'open');
    veu.setAttribute('data-state', 'open');
    document.documentElement.classList.add('site-travado');
    setTimeout(function () { $(nome === 'cancelar' ? '[data-fechar].asa-btn--outline:not(.asa-btn--icon)' : 'a, button', sup).focus(); }, 30);
  }
  function fecharModal() {
    if (!aberto) return;
    var a = aberto;
    aberto = null;
    a.m.setAttribute('data-state', 'closed');
    $('[data-veu]').setAttribute('data-state', 'closed');
    a.sup.setAttribute('inert', '');
    document.documentElement.classList.remove('site-travado');
    if (a.gatilho && document.contains(a.gatilho)) a.gatilho.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (!aberto) return;
    if (e.key === 'Escape') { e.preventDefault(); fecharModal(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('a[href], button:not([disabled])', aberto.sup);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  function cancelar() {
    var b = $('[data-cancelar-sim]');
    b.disabled = true; b.setAttribute('data-state', 'loading');
    setTimeout(function () {
      b.disabled = false; b.removeAttribute('data-state');
      var r = reserva.r;
      track('manage_booking', { action: 'cancelar_confirmar', booking_status: r.status });
      if (r.pagamento === 'credito_online' || r.pagamento === 'pix_online') track('refund', { transaction_id: r.localizador, value: reserva.conta.total, currency: 'BRL' });
      r.status = 'cancelada';
      fecharModal();
      painel(r);
      var msg = $('[data-r-msg]');
      msg.innerHTML = '<div class="asa-alert asa-alert--ok">' + OK + '<div class="asa-alert__body"><span class="asa-alert__title">Reserva ' + r.localizador + ' cancelada.</span><span class="asa-alert__text">Enviamos a confirmação para o seu e-mail.</span></div></div>';
      $('#resultado-titulo').focus();
    }, 900);
  }

  /* ---------- Envio da consulta ---------- */
  function consultar() {
    aviso.innerHTML = '';
    if (!validar()) { (campoLoc.hasAttribute('aria-invalid') ? campoLoc : campoCpf).focus(); return; }
    var l = campoLoc.value.trim().toUpperCase(), cpf = digitos(campoCpf.value);

    if (VERSAO === 'B') {
      // Sem integração: só o formato no navegador, e a conversa segue com o localizador (o CPF não vai).
      $('[data-b-wa]').href = WA + encodeURIComponent('Olá! Quero ver minha reserva na Asa. Localizador: ' + l + '.');
      mostrarResultado('b');
      track('manage_booking', { action: 'consultar', result: 'encaminhada', version: 'B' });
      return;
    }

    btn.disabled = true; btn.setAttribute('data-state', 'loading'); label.textContent = 'Procurando sua reserva…';
    setTimeout(function () {
      btn.disabled = false; btn.removeAttribute('data-state'); label.textContent = idle;
      var d = demo; demo = '';
      if (d === 'erro') {
        track('manage_booking', { action: 'consultar', result: 'erro', version: 'A' });
        avisar('error', 'Não conseguimos consultar agora', 'Sua reserva continua válida. Tente de novo em alguns minutos ou fale com a equipe.',
          '<button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-de-novo>Tentar de novo</button>' + waAviso());
        return;
      }
      var r = d === 'nao-encontrada' ? null : procurar(l, cpf);
      if (!r) tentativas++;
      if (d === 'bloqueada' || tentativas >= 5) {
        // Muitas tentativas: pausa a consulta. Em produção o limite é por IP e por localizador, no servidor.
        track('manage_booking', { action: 'consultar', result: 'bloqueada', version: 'A' });
        btn.disabled = true;
        avisar('error', 'Consulta pausada', 'Por segurança, a consulta foi pausada por 15 minutos [CONFIRMAR: tempo]. Se precisar agora, fale com a equipe.', waAviso());
        return;
      }
      if (!r) {
        // A mesma mensagem quando o localizador não existe e quando o CPF não bate.
        track('manage_booking', { action: 'consultar', result: 'nao_encontrada', version: 'A' });
        avisar('error', 'Não encontramos essa reserva', 'Confira o localizador e o CPF do condutor principal (não o do responsável financeiro). Se a reserva foi feita há poucos minutos, espere um pouco e tente de novo.',
          '<button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-de-novo>Tentar de novo</button>' + waAviso());
        return;
      }
      track('manage_booking', { action: 'consultar', result: 'encontrada', version: 'A' });
      painel(r);
      mostrarResultado('a');
    }, 900);
  }
  function mostrarResultado(v) {
    $('[data-resultado]').hidden = false;
    $('[data-versao-a]').hidden = v !== 'a';
    $('[data-versao-b]').hidden = v !== 'b';
    // Dúvidas alterna o fundo com o resultado.
    var faixa = $('[data-faixa-duvidas]');
    faixa.classList.remove('asa-bg-white'); faixa.classList.add('asa-bg-mist');
    $('#resultado').scrollIntoView({ behavior: LISO, block: 'start' });
    $(v === 'a' ? '#resultado-titulo' : '#resultado-titulo-b').focus({ preventScroll: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    form = $('[data-consulta]');
    campoLoc = $('#mr-loc'); campoCpf = $('#mr-cpf');
    btn = $('button[type="submit"]', form); label = $('.asa-btn__label', btn); idle = label.textContent;
    aviso = $('[data-aviso-topo]');
    if (demo === 'expirada') {
      avisar('warn', 'A consulta fechou', 'Por segurança, a consulta fechou. Informe localizador e CPF de novo.');
      demo = '';
    }
    campoLoc.addEventListener('input', function () { campoLoc.value = campoLoc.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); });
    campoCpf.addEventListener('input', function () {
      var d = digitos(campoCpf.value).slice(0, 11);
      campoCpf.value = d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
    });
    [campoLoc, campoCpf].forEach(function (c) {
      c.addEventListener('input', function () { if (c.hasAttribute('aria-invalid')) mostrar(c.id, ''); });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); if (!btn.disabled) consultar(); });
    $('[data-abrir-ajuda]').addEventListener('click', function (e) { abrirModal('ajuda', e.currentTarget); });
    $$('[data-fechar]').forEach(function (b) { b.addEventListener('click', fecharModal); });
    $('[data-veu]').addEventListener('click', fecharModal);
    $('[data-cancelar-sim]').addEventListener('click', cancelar);
    $$('[data-precadastro]').forEach(function (a) {
      a.addEventListener('click', function () { track('manage_booking', { action: 'precadastro', booking_status: 'desconhecido' }); });
    });
    $('[data-b-wa]').addEventListener('click', function () { track('generate_lead', { method: 'whatsapp', lead_topic: 'tenho_reserva', version: 'B' }); });
    $('[data-b-ligar]').addEventListener('click', function () { track('generate_lead', { method: 'telefone', lead_topic: 'tenho_reserva', version: 'B' }); });
  });
})();
