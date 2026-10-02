/* ==========================================================================
   SITE ASA: comportamento comum a todas as páginas.
   Cabeçalho (submenus e menu do celular), rodapé em acordeão, WhatsApp,
   busca compacta e os eventos de GA4 da copy. Sem dependência. Tudo o que
   está aqui melhora uma página que já funciona sem JS: links são links,
   submenus abrem por hover e foco, o rodapé é <details>.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var page = document.body.dataset.pageType || 'conteudo';

  /* ---------- GA4: dataLayer ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    window.dataLayer.push(Object.assign({ event: event }, params || {}));
  }
  window.asaTrack = track;

  /* ---------- Aviso curto ---------- */
  var toast;
  function say(text) {
    if (!toast) {
      toast = document.createElement('p');
      toast.className = 'site-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    clearTimeout(say.t);
    say.t = setTimeout(function () { toast.textContent = ''; }, 4000);
  }

  /* ---------- Reservar: vai para a busca da página, ou para a da home ---------- */
  if (document.getElementById('reservar')) {
    $$('[data-reservar]').forEach(function (a) { a.setAttribute('href', '#reservar'); });
  }

  /* ---------- Submenus do cabeçalho ---------- */
  var items = $$('[data-submenu]');
  function closeItem(li) {
    li.removeAttribute('data-aberto');
    $('.site-nav__toggle', li).setAttribute('aria-expanded', 'false');
  }
  items.forEach(function (li) {
    var btn = $('.site-nav__toggle', li);
    btn.addEventListener('click', function () {
      var open = li.hasAttribute('data-aberto');
      items.forEach(closeItem);
      if (!open) {
        li.setAttribute('data-aberto', '');
        li.removeAttribute('data-fechado');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    li.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeItem(li);
      li.setAttribute('data-fechado', '');
      btn.focus();
    });
    li.addEventListener('mouseleave', function () { li.removeAttribute('data-fechado'); });
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) { closeItem(li); li.removeAttribute('data-fechado'); }
    });
  });
  document.addEventListener('click', function (e) {
    items.forEach(function (li) { if (!li.contains(e.target)) closeItem(li); });
  });

  /* ---------- Menu do celular ---------- */
  var drawer = $('#menu-celular');
  var veil = $('[data-drawer-veu]');
  var opener = $('.asa-navbar__toggle');
  if (drawer && opener) {
    var surface = $('.asa-navdrawer__surface', drawer);
    var openDrawer = function () {
      drawer.dataset.state = 'open';
      veil.dataset.state = 'open';
      surface.removeAttribute('inert');
      opener.setAttribute('aria-expanded', 'true');
      document.documentElement.setAttribute('data-drawer-aberto', '');
      $('[data-drawer-fechar]', surface).focus();
    };
    var closeDrawer = function (silent) {
      drawer.dataset.state = 'closed';
      veil.dataset.state = 'closed';
      surface.setAttribute('inert', '');
      opener.setAttribute('aria-expanded', 'false');
      document.documentElement.removeAttribute('data-drawer-aberto');
      if (!silent) opener.focus();
    };
    opener.addEventListener('click', openDrawer);
    veil.addEventListener('click', function () { closeDrawer(); });
    $$('[data-drawer-fechar]', drawer).forEach(function (el) {
      el.addEventListener('click', function () { closeDrawer(el.tagName === 'A'); });
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { closeDrawer(true); }); });
    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      var focusables = $$('a[href], button, summary', surface).filter(function (el) { return el.offsetParent !== null; });
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Rodapé: acordeão só no celular ---------- */
  var wide = matchMedia('(min-width: 768px)');
  function syncFooter() { $$('[data-rodape-grupo]').forEach(function (d) { d.open = wide.matches; }); }
  syncFooter();
  wide.addEventListener('change', syncFooter);

  /* ---------- Telefone: no computador, copia o número ---------- */
  var desktop = matchMedia('(hover: hover) and (pointer: fine)');
  $$('[data-telefone]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!desktop.matches || !navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText('0800 080 0015').then(function () { say('Número copiado: 0800 080 0015'); });
    });
  });

  /* ---------- WhatsApp ---------- */
  var WA = 'https://wa.me/5508000800015?text=';
  var AEROPORTO = { REC: 'do Recife', FOR: 'de Fortaleza' };
  function waText(topic) {
    if (topic === 'tenho_reserva') return 'Olá! Tenho uma reserva na Asa e preciso de ajuda. Meu localizador é: ';
    if (topic === 'empresa') return 'Olá! Sou de uma empresa e quero falar sobre locação ou terceirização de frota.';
    var form = $('[data-booking]');
    var local = form && form.elements.local ? AEROPORTO[form.elements.local.value] : null;
    var text = 'Olá! Estou no site da Asa e quero reservar um carro no aeroporto ' + (local || 'do Recife ou de Fortaleza');
    if (form && form.elements.retirada.value && form.elements.devolucao.value) {
      var r = parse(form.elements.retirada.value), d = parse(form.elements.devolucao.value);
      text += ', retirada no dia ' + day(r) + ' às ' + hour(r) + ', devolução no dia ' + day(d);
    }
    return text + '.';
  }
  $$('[data-wa]').forEach(function (a) {
    a.addEventListener('click', function () { a.href = WA + encodeURIComponent(waText(a.dataset.wa)); });
  });

  var fab = $('[data-fab]');
  if (fab) {
    var fabBtn = $('.site-fab__btn', fab);
    var setFab = function (open) {
      if (open) fab.setAttribute('data-aberto', ''); else fab.removeAttribute('data-aberto');
      fabBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    fabBtn.addEventListener('click', function () { setFab(!fab.hasAttribute('data-aberto')); });
    fab.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setFab(false); fabBtn.focus(); } });
    document.addEventListener('click', function (e) { if (!fab.contains(e.target)) setFab(false); });
    // Some quando o teclado do celular está aberto.
    if (window.visualViewport) {
      visualViewport.addEventListener('resize', function () {
        if (visualViewport.height < window.innerHeight * 0.75) fab.setAttribute('data-oculto', '');
        else fab.removeAttribute('data-oculto');
      });
    }
  }

  /* ---------- Leads: WhatsApp e telefone ---------- */
  $$('[data-lead]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('generate_lead', { method: a.dataset.lead, lead_topic: a.dataset.wa || 'reserva', page_type: page });
    });
  });

  /* ---------- Busca compacta ---------- */
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var toLocal = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  function parse(v) { return v ? new Date(v) : null; }
  function day(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); }
  function hour(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function at(days, h) { var d = new Date(); d.setDate(d.getDate() + days); d.setHours(h, 0, 0, 0); return d; }

  $$('[data-booking]').forEach(function (form) {
    form.noValidate = true;
    var pick = form.elements.retirada, ret = form.elements.devolucao, local = form.elements.local;
    var btn = $('button[type="submit"]', form);
    var label = $('.asa-btn__label', btn);
    var idle = label.textContent;
    var status = $('[data-status]', form);
    var line = $('[data-diaria]', form);

    var now = new Date(); now.setSeconds(0, 0);
    pick.min = toLocal(now);
    if (!pick.value) pick.value = toLocal(at(1, 10));
    if (!ret.value) ret.value = toLocal(at(4, 10));
    ret.min = pick.value;

    function error(input, msg) {
      var box = document.getElementById(input.getAttribute('aria-describedby').split(' ').pop());
      $('span', box).textContent = msg || '';
      box.hidden = !msg;
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    function validate() {
      var p = parse(pick.value), r = parse(ret.value), ok = true;
      if (!p) { error(pick, 'Escolha o dia da retirada.'); ok = false; }
      else if (p < new Date(Date.now() - 60000)) { error(pick, 'Escolha uma data e hora a partir de agora.'); ok = false; }
      else error(pick, '');
      if (!r) { error(ret, 'Escolha o dia da devolução.'); ok = false; }
      else if (p && r <= p) { error(ret, 'A devolução precisa ser depois da retirada.'); ok = false; }
      else error(ret, '');
      return ok;
    }
    function diaria() {
      var p = parse(pick.value);
      if (!line || !p) return;
      var limit = new Date(p.getTime() + 3 * 3600 * 1000);
      $('[data-hora-retirada]', line).textContent = hour(p);
      $('[data-hora-limite]', line).textContent = hour(limit);
    }
    diaria();
    pick.addEventListener('change', function () {
      ret.min = pick.value;
      diaria();
      if (pick.hasAttribute('aria-invalid') || ret.hasAttribute('aria-invalid')) validate();
    });
    ret.addEventListener('change', function () { if (ret.hasAttribute('aria-invalid')) validate(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      if (!validate()) { (pick.hasAttribute('aria-invalid') ? pick : ret).focus(); return; }
      track('search', { local_retirada: local.value, origem: form.dataset.origem || page, artigo: form.dataset.artigo || '' });
      btn.disabled = true;
      btn.setAttribute('data-state', 'loading');
      label.textContent = 'Buscando carros…';
      // Protótipo: em produção o formulário segue para o motor de reservas.
      setTimeout(function () {
        btn.disabled = false;
        btn.removeAttribute('data-state');
        label.textContent = idle;
        var p = parse(pick.value), r = parse(ret.value);
        status.textContent = 'Protótipo: aqui abre a lista de carros disponíveis no Aeroporto ' + AEROPORTO[local.value] +
          ', de ' + day(p) + ' às ' + hour(p) + ' a ' + day(r) + ' às ' + hour(r) + '.';
      }, 600);
    });
  });

  /* ---------- Artigo: leitura até 90% ---------- */
  var article = $('[data-artigo]');
  if (article) {
    var sent = false;
    addEventListener('scroll', function () {
      if (sent) return;
      var box = article.getBoundingClientRect();
      if (box.height && (innerHeight - box.top) / box.height >= 0.9) {
        sent = true;
        track('scroll', { percent_scrolled: 90, artigo: article.dataset.artigo });
      }
    }, { passive: true });
  }

  /* ---------- Índice de texto longo ---------- */
  var toc = $('[data-toc]');
  if (toc) {
    var desk = matchMedia('(min-width: 1024px)');
    var syncToc = function () { if (desk.matches) toc.open = true; };
    syncToc();
    desk.addEventListener('change', syncToc);
    var links = $$('.asa-toc__link', toc);
    var alvos = links.map(function (a) { return document.getElementById(a.hash.slice(1)); }).filter(Boolean);
    links.forEach(function (a) { a.addEventListener('click', function () { if (!desk.matches) toc.open = false; }); });
    if ('IntersectionObserver' in window && alvos.length) {
      var marcar = function (id) {
        links.forEach(function (a) {
          if (a.hash === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) marcar(e.target.id); });
      }, { rootMargin: '-20% 0px -70% 0px' });
      alvos.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Abas com painel (role="tab") ---------- */
  $$('[data-tabs]').forEach(function (bar) {
    var tabs = $$('[role="tab"]', bar);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length], true); }
      });
    });
    select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  });

  /* ---------- Download de documento ---------- */
  $$('[data-download]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('file_download', { file_name: a.dataset.download, tipo_documento: a.dataset.tipo || '' });
    });
  });

  /* ---------- Imprimir ou salvar em PDF ---------- */
  $$('[data-imprimir]').forEach(function (b) {
    b.addEventListener('click', function () {
      track('print_terms', { pagina: b.dataset.imprimir });
      window.print();
    });
  });

  /* ---------- Quem somos: linha de negócio e avaliações ---------- */
  $$('[data-linha]').forEach(function (a) {
    a.addEventListener('click', function () { track('select_content', { content_type: 'linha_negocio', item_id: a.dataset.linha }); });
  });
  $$('[data-reviews]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_reviews', { loja: a.dataset.reviews }); });
  });

  /* ---------- Clique em card de artigo ---------- */
  $$('[data-slug]').forEach(function (card) {
    var link = $('a', card);
    if (!link) return;
    link.addEventListener('click', function () {
      track('select_content', { content_type: 'artigo', item_id: card.dataset.slug, categoria: card.dataset.categoria });
    });
  });
})();
