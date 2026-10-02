/* ==========================================================================
   RESERVA · ETAPA 2: proteção e adicionais.
   Lê o estado da URL (funil.js), monta o carro escolhido, o upgrade, a
   proteção e os adicionais, e recalcula o resumo a cada mudança. Cada
   escolha volta para a URL (replaceState), então recarregar ou voltar da
   etapa 3 mantém tudo. Estados da copy por ?estado=: carregando,
   upgrade-esgotado, recalculo e expirada.
   ========================================================================== */
(function () {
  'use strict';

  var F = window.AsaFunil, fmt = F.fmt, track = F.track;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var LISO = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  var demo = new URLSearchParams(location.search).get('estado') || '';
  var s = F.estado();

  document.addEventListener('DOMContentLoaded', function () {
    if (!s.ok || demo === 'expirada') {
      // Sem busca ou sem carro: a sessão acabou. "Refazer busca" mantém local e datas quando existem.
      $('[data-etapa]').hidden = true;
      $('[data-barra]').hidden = true;
      $('[data-expirada]').hidden = false;
      if (s.busca) $('[data-refazer]').href = F.url('/reservas-online', s, { grupo: '', upgrade: '', protecao: '', cadeiras: '', condutor: '', responsavel: '' });
      return;
    }
    iniciar();
  });

  function itemCarro() {
    var c = s.upgrade || s.grupo;
    return { item_id: c.g, item_name: c.modelo, item_category: c.cat, item_variant: c.cambio, price: F.calcular(s).total, quantity: 1 };
  }
  function salvar() { history.replaceState(null, '', F.url(location.pathname, s)); ligarLinks(); }

  /* "Editar", "Trocar de carro" e "Continuar" levam o estado junto. */
  function ligarLinks() {
    $$('[data-editar="carro"]').forEach(function (a) {
      a.href = F.url('/reservas-online', s, { grupo: '', upgrade: '', protecao: '', cadeiras: '', condutor: '', responsavel: '' });
    });
    $$('[data-continuar]').forEach(function (a) { a.href = F.url('/reservas-online/checkout', s); });
  }

  /* ---------- Carro escolhido ---------- */
  function escolhido() {
    var c = s.upgrade || s.grupo;
    $('[data-escolhido-titulo]').innerHTML = '<b>Grupo ' + c.g + ' · ' + c.cat + '</b> · ' + fmt.esc(c.modelo) + ' ou similar' +
      (s.upgrade ? ' <span class="asa-tag asa-tag--ok">Upgrade escolhido</span>' : '');
    $('[data-escolhido-specs]').textContent = c.lugares + ' lugares · ' + c.malas.replace('–', ' a ') + ' malas · ' + c.cambio + ' · Ar-condicionado · Km livre';
    var foto = $('[data-escolhido-foto]');
    foto.setAttribute('aria-label', c.modelo + ', ' + c.cat.toLowerCase() + ' da frota Asa');
    $('.asa-photo__caption', foto).textContent = '[ foto · ' + c.modelo + ' ]';
  }

  /* ---------- Upgrade ---------- */
  var caixaUp = $('[data-upgrade]');
  function upgrade() {
    var u = F.upgradeDe(s.grupo);
    if (!u) { caixaUp.hidden = true; return; }   // sem grupo acima livre: o bloco não aparece, sem mensagem
    caixaUp.hidden = false;
    if (s.upgrade) {
      caixaUp.innerHTML = '<div class="asa-upsell site-upsell site-upsell--feito"><div class="asa-upsell__body">' +
        '<span class="asa-upsell__title">Upgrade escolhido: ' + fmt.esc(u.modelo) + ' ou similar</span>' +
        '<span class="asa-upsell__proof">Grupo ' + u.g + ' · ' + u.cat + ' · +' + fmt.real(F.UPGRADE_DIA) + '/dia</span></div>' +
        '<button class="asa-btn asa-btn--link asa-btn--sm" type="button" data-desfazer>Desfazer upgrade</button></div>';
      $('[data-desfazer]', caixaUp).addEventListener('click', function () {
        s.upgrade = null;
        track('remove_from_cart', carrinho([{ item_id: u.g, item_name: u.modelo, item_category: 'upgrade', price: F.UPGRADE_DIA, quantity: s.dias }]));
        mudou();
        $('[data-trocar-up]', caixaUp).focus();
      });
      return;
    }
    var tags = F.ganhos(s.grupo, u).map(function (g) { return '<li class="asa-tag asa-tag--outline">' + g + '</li>'; }).join('');
    caixaUp.innerHTML = '<div class="asa-upsell site-upsell" data-promo-up>' +
      '<div class="asa-upsell__body">' +
      '<h2 class="site-upsell__title">Que tal um <em>upgrade</em>?</h2>' +
      '<p class="site-upsell__car"><span class="asa-tag asa-tag--ink">Melhor upgrade</span> <b>' + fmt.esc(u.modelo) + ' ou similar</b> · Grupo ' + u.g + ' · ' + u.cat + '</p>' +
      (tags ? '<ul class="site-upsell__tags" aria-label="O que muda">' + tags + '</ul>' : '') +
      '<span class="asa-upsell__proof">Escolhido por 4 em cada 10 clientes <span class="site-pending">[CONFIRMAR: base atual do dado]</span></span>' +
      '</div>' +
      '<div class="site-upsell__side"><span class="asa-upsell__delta">+' + fmt.real(F.UPGRADE_DIA) + '/dia</span>' +
      '<button class="asa-btn asa-btn--outline asa-btn--sm" type="button" data-trocar-up>Trocar para o ' + fmt.esc(u.modelo.split(' ').slice(0, 2).join(' ')) + '</button></div>' +
      '<p class="site-upsell__msg" data-up-msg role="status"></p></div>';
    var promo = { promotion_id: 'upgrade', promotion_name: 'Melhor upgrade', items: [{ item_id: u.g, item_name: u.modelo }] };
    if (!upgrade.visto) { upgrade.visto = true; track('view_promotion', promo); }
    $('[data-trocar-up]', caixaUp).addEventListener('click', function () {
      if (demo === 'upgrade-esgotado') {
        $('[data-up-msg]', caixaUp).textContent = 'O ' + u.modelo + ' acabou de ser reservado por outra pessoa. Seu carro original continua garantido nesta etapa.';
        $('[data-trocar-up]', caixaUp).disabled = true;
        return;
      }
      s.upgrade = u;
      track('select_promotion', Object.assign({}, promo, { delta_price_day: F.UPGRADE_DIA }));
      mudou();
      $('[data-desfazer]', caixaUp).focus();
    });
  }

  /* ---------- Proteção: nenhuma vem marcada ---------- */
  function protecoes() {
    $$('input[name="protecao"]').forEach(function (r) {
      r.checked = !!s.protecao && s.protecao.id === r.value;
      r.closest('.site-prot').toggleAttribute('data-escolhida', r.checked);
    });
    // Diferença no total da reserva, com a taxa de 12% sobre a proteção.
    F.PROTECOES.forEach(function (p) {
      var el = $('[data-delta="' + p.id + '"]');
      if (p.id === 'basica') el.textContent = 'Incluída no preço final';
      else if (p.dia === null) el.innerHTML = '<span class="site-pending">[CONFIRMAR: diferença no total]</span>';
      else el.textContent = '+ ' + fmt.real(Math.round((p.dia - F.PROTECOES[0].dia) * s.dias * (1 + F.TAXA) * (1 - s.desconto) * 100) / 100) + ' no total da reserva';
    });
  }
  function carrinho(items) {
    var v = items.reduce(function (t, i) { return t + i.price * i.quantity; }, 0);
    return { currency: 'BRL', value: Math.round(v * 100) / 100, items: items };
  }
  function itemProt(p) { return { item_id: 'protecao_' + p.id, item_name: 'Proteção ' + p.nome, item_category: 'protecao', price: p.dia || 0, quantity: s.dias }; }

  $$('input[name="protecao"]').forEach(function (r) {
    r.addEventListener('change', function () {
      var antes = s.protecao;
      s.protecao = F.PROTECOES.filter(function (p) { return p.id === r.value; })[0];
      if (antes && antes !== s.protecao) track('remove_from_cart', carrinho([itemProt(antes)]));
      track('add_to_cart', carrinho([itemProt(s.protecao)]));
      $('#protecao-erro').hidden = true;
      mudou();
    });
  });
  // O card inteiro escolhe a proteção, não só o círculo de 20px.
  $$('.site-prot').forEach(function (card) {
    card.addEventListener('click', function (e) {
      var r = $('input[type="radio"]', card);
      if (r.disabled || e.target.closest('label, a, input')) return;
      r.checked = true;
      r.dispatchEvent(new Event('change', { bubbles: true }));
      r.focus();
    });
  });

  /* ---------- Adicionais ---------- */
  var MAX = F.ADICIONAIS.cadeira.max;
  function adicionais() {
    $('[data-qty-valor]').textContent = s.cadeiras;
    $('[data-qty="-1"]').disabled = s.cadeiras === 0;
    $('input[name="condutor"]').checked = s.condutor;
    $('input[name="responsavel"]').checked = s.responsavel;
    $('[data-resp-alerta]').hidden = !s.responsavel;
  }
  function itemAd(chave, q) { var a = F.ADICIONAIS[chave]; return { item_id: a.id, item_name: a.nome, item_category: 'adicional', price: a.dia, quantity: q }; }
  $$('[data-qty]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = s.cadeiras + +b.dataset.qty, msg = $('[data-qty-msg]');
      if (n > MAX) { msg.textContent = 'Máximo de ' + MAX + ' cadeiras por reserva.'; return; }
      msg.textContent = '';
      if (n < 0) return;
      track(+b.dataset.qty > 0 ? 'add_to_cart' : 'remove_from_cart', carrinho([itemAd('cadeira', s.dias)]));
      s.cadeiras = n;
      mudou();
    });
  });
  ['condutor', 'responsavel'].forEach(function (k) {
    $('input[name="' + k + '"]').addEventListener('change', function (e) {
      s[k] = e.target.checked;
      track(s[k] ? 'add_to_cart' : 'remove_from_cart', carrinho([itemAd(k, s.dias)]));
      mudou();
    });
  });

  /* ---------- Resumo ---------- */
  var resumoEl = $('[data-resumo]');
  var anuncio;
  function resumo() {
    var conta = F.calcular(s);
    resumoEl.innerHTML = F.resumo(s, conta);
    $('[data-barra-total]').innerHTML = conta.pendente ? 'a confirmar' : fmt.real(conta.total);
    // Leitor de tela: só o total, não o resumo inteiro.
    if (!anuncio) {
      anuncio = document.createElement('p');
      anuncio.className = 'site-sr';
      anuncio.setAttribute('role', 'status');
      document.body.appendChild(anuncio);
      resumoEl.removeAttribute('aria-live');
    } else {
      anuncio.textContent = conta.pendente ? 'Preço final a confirmar.' : 'Preço final atualizado: ' + fmt.real(conta.total) + '.';
    }
  }

  var bloqueado = false;
  function mudou() {
    if (demo === 'recalculo' && !mudou.falhou) {
      // Falha ao recalcular: o total não muda e "Continuar" fica bloqueado até dar certo.
      mudou.falhou = true;
      bloqueado = true;
      $('[data-recalculo]').hidden = false;
      $$('[data-continuar]').forEach(function (a) { a.setAttribute('aria-disabled', 'true'); });
      salvar(); escolhido(); upgrade(); protecoes(); adicionais();
      return;
    }
    salvar(); escolhido(); upgrade(); protecoes(); adicionais(); resumo();
  }
  $('[data-recalcular]').addEventListener('click', function () {
    bloqueado = false;
    $('[data-recalculo]').hidden = true;
    $$('[data-continuar]').forEach(function (a) { a.removeAttribute('aria-disabled'); });
    resumo();
  });

  /* ---------- Continuar ---------- */
  $$('[data-continuar]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (bloqueado) { e.preventDefault(); $('[data-recalcular]').focus(); return; }
      if (!s.protecao) {
        e.preventDefault();
        var erro = $('#protecao-erro');
        erro.hidden = false;
        $('#protecao').scrollIntoView({ behavior: LISO, block: 'start' });
        $('input[name="protecao"]').focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Barra do celular ---------- */
  $('[data-ver-resumo]').addEventListener('click', function () {
    resumoEl.scrollIntoView({ behavior: LISO, block: 'start' });
    resumoEl.focus({ preventScroll: true });
    var conta = F.calcular(s);
    track('view_cart', { currency: 'BRL', value: conta.total, items: conta.items });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { $('[data-barra]').classList.toggle('site-sumbar--fora', es[0].isIntersecting); })
      .observe($('.site-sum__actions'));
  }

  function iniciar() {
    var esq = $('[data-prot-esqueleto]'), lista = $('.site-prots-wrap');
    if (demo === 'carregando') {
      // Carregando proteções: esqueleto no formato da tabela, sem preço falso.
      esq.hidden = false; lista.hidden = true;
      $('[data-prot-carregando]').textContent = 'Carregando as proteções para o grupo ' + s.grupo.g + '…';
    }
    mudou();
    track('view_item', { currency: 'BRL', value: F.calcular(s).total, items: [itemCarro()] });
  }
})();
