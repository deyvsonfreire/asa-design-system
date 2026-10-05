/* ==========================================================================
   RESERVA · ETAPA 4: confirmação e voucher.
   Lê a reserva gravada pela etapa 3 (no protótipo, no sessionStorage da
   aba; em produção, a sessão do motor). Sem reserva, mostra só o caminho
   para Minha reserva, sem nenhum dado pessoal.

   purchase dispara uma vez por localizador (recarregar não repete). No
   Pix, a página mostra o código e só dispara purchase quando o pagamento
   cai. Para revisar sem fazer a reserva: ?exemplo=cartao|pix|retirada;
   no Pix, ?estado=pix-pago (cai em 4 segundos) e ?estado=pix-expirado.
   ========================================================================== */
(function () {
  'use strict';

  var F = window.AsaFunil, fmt = F.fmt, track = F.track;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var q = new URLSearchParams(location.search);
  var demo = q.get('estado') || '';
  var STATUS = { credito_online: 'Pago no cartão', pix_online: 'Pago no Pix', pagar_retirada: 'Pagar na retirada' };

  /* Reserva de exemplo, para revisar a página sem passar pelo funil. */
  function exemplo(tipo) {
    var ini = new Date(); ini.setDate(ini.getDate() + 10); ini.setHours(10, 0, 0, 0);
    var fim = new Date(ini.getTime() + 3 * F.DIA);
    return {
      localizador: 'REC-7K4P2Q', pagamento: { cartao: 'credito_online', pix: 'pix_online', retirada: 'pagar_retirada' }[tipo] || 'credito_online',
      busca: 'local=REC&retirada=' + fmt.toLocal(ini) + '&devolucao=' + fmt.toLocal(fim) + '&grupo=B&protecao=terceiros&cadeiras=1&responsavel=1',
      primeiroNome: 'Ana', email: 'ana@exemplo.com.br', condutor: 'Ana Exemplo da Silva', cpfMeio: '456', adicional: '', responsavel: 'Carlos Exemplo da Silva', ajusteTarifa: 0, exemplo: true
    };
  }

  var r = q.get('exemplo') ? exemplo(q.get('exemplo')) : F.ler('asa-reserva-feita');

  document.addEventListener('DOMContentLoaded', function () {
    if (!r) { $('[data-sem-sessao]').hidden = false; return; }
    var s = F.estado('?' + r.busca);
    if (!s.ok) { $('[data-sem-sessao]').hidden = false; return; }
    if (r.ajusteTarifa) s.grupo.tarifa += r.ajusteTarifa;
    var conta = F.calcular(s);
    $$('[data-reserva]').forEach(function (el) { el.hidden = false; });
    montar(s, conta);
    var pix = r.pagamento === 'pix_online' && !F.ler('asa-pix-pago-' + r.localizador);
    if (pix) modoPix(s, conta); else confirmada(s, conta);
  });

  function itens(conta) { return conta.items; }
  function compra(s, conta) {
    var chave = 'asa-purchase-' + r.localizador;
    if (F.ler(chave) && !r.exemplo) return;
    F.gravar(chave, true);
    track('purchase', {
      transaction_id: r.localizador, value: conta.total, currency: 'BRL', tax: conta.taxa, coupon: s.codigo, payment_type: r.pagamento,
      items: itens(conta), pickup_location: s.local, rental_days: s.dias
    });
  }

  function copiar(botao, campo, aviso, texto, ev) {
    botao.addEventListener('click', function () {
      var lbl = $('.asa-btn__label', botao), idle = lbl.textContent;
      var ok = function () { lbl.textContent = 'Copiado'; aviso.textContent = texto; setTimeout(function () { lbl.textContent = idle; }, 3000); };
      if (ev) track(ev, { transaction_id: r.localizador });
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(campo.value).then(ok, function () { campo.select(); aviso.textContent = 'Código selecionado. Copie com o teclado.'; });
      else { campo.select(); aviso.textContent = 'Código selecionado. Copie com o teclado.'; }
    });
  }

  function confirmada(s, conta) {
    $('[data-titulo]').textContent = 'Reserva confirmada, ' + r.primeiroNome;
    document.title = 'Reserva confirmada | Asa Locadora';
    $('[data-status-texto]').textContent = 'Reserva confirmada';
    $('[data-ok]').hidden = false;
    $('[data-bloco-ok]').hidden = false;
    $('[data-bloco-pix]').hidden = true;
    $('[data-pix-expirado]').hidden = true;
    compra(s, conta);
  }

  function modoPix(s, conta) {
    $('[data-titulo]').textContent = 'Falta só o Pix, ' + r.primeiroNome;
    document.title = 'Falta só o Pix | Asa Locadora';
    $('[data-status-texto]').textContent = 'Aguardando o Pix';
    $('.site-confirm__status').classList.add('site-confirm__status--wait');
    $('[data-bloco-ok]').hidden = true;
    $('[data-bloco-pix]').hidden = false;
    $('[data-qr]').setAttribute('aria-label', 'QR Code do Pix para pagar a reserva ' + r.localizador);
    // Código de exemplo, no formato do copia e cola; o real vem do gateway.
    $('[data-pix-codigo]').value = '00020126580014BR.GOV.BCB.PIX0136exemplo-' + r.localizador.toLowerCase() + '5204000053039865406' + conta.total.toFixed(2) + '5802BR6009EXEMPLO6304ABCD';
    $('[data-pix-valor]').textContent = fmt.real(conta.total);
    copiar($('[data-copiar-pix]'), $('[data-pix-codigo]'), $('[data-pix-aviso]'), 'Código copiado. Cole no app do seu banco, na opção Pix copia e cola.', 'pix_code_copied');
    track('pix_pending', { transaction_id: r.localizador, value: conta.total });

    if (demo === 'pix-expirado') {
      $('[data-bloco-pix]').hidden = true;
      $('[data-pix-expirado]').hidden = false;
      $('[data-titulo]').textContent = 'O Pix não foi pago, ' + r.primeiroNome;
      $('[data-status-texto]').textContent = 'Prazo do Pix encerrado';
      $('[data-novo-pix]').addEventListener('click', function () { location.search = location.search.replace(/([?&])estado=pix-expirado&?/, '$1'); });
    }
    if (demo === 'pix-pago') {
      // Em produção a página consulta o gateway; aqui, o pagamento "cai" em 4 segundos.
      setTimeout(function () {
        F.gravar('asa-pix-pago-' + r.localizador, true);
        $('[data-pix-estado]').textContent = 'Pix recebido. Reserva confirmada.';
        confirmada(s, conta);
        montarVoucher(s, conta, 'Pago no Pix');
        $('[data-titulo]').focus();
      }, 4000);
    }
  }

  function montarVoucher(s, conta, status) {
    var c = s.upgrade || s.grupo, L = F.LOCAIS[s.local];
    var cancel = new Date(s.ini.getTime() - F.DIA);
    var ad = conta.linhas.filter(function (l) { return /Cadeira|Condutor adicional|Responsável/.test(l.rotulo); }).map(function (l) { return l.rotulo.replace(/ \(.*\)$/, ''); });
    var linhas = [
      ['Localizador', r.localizador],
      ['Carro', 'Grupo ' + c.g + ' · ' + fmt.esc(c.modelo) + ' ou similar (' + c.cambio + ', ' + c.lugares + ' lugares)'],
      ['Retirada', fmt.data(s.ini) + ', ' + fmt.hora(s.ini) + ' · ' + L.nome],
      ['Devolução', fmt.data(s.fim) + ', ' + fmt.hora(s.fim) + ' · ' + L.nome],
      ['Diária de 27 horas', 'Devolução até as ' + fmt.hora(s.limite) + ' sem pagar outra diária'],
      ['Condutor', fmt.esc(r.condutor) + ' · CPF ***.' + r.cpfMeio + '.***-**']
    ];
    if (r.adicional) linhas.push(['Condutor adicional', fmt.esc(r.adicional)]);
    if (r.responsavel) linhas.push(['Responsável financeiro', fmt.esc(r.responsavel) + ' · precisa estar no balcão']);
    linhas.push(['Proteção', s.protecao.nome]);
    linhas.push(['Adicionais', ad.length ? ad.join(', ') : 'Nenhum']);
    linhas.push(['Taxa administrativa (12%)', fmt.real(conta.taxa)]);
    if (conta.desconto) linhas.push(['Cupom ' + s.codigo, '− ' + fmt.real(conta.desconto)]);
    $('[data-voucher]').innerHTML = '<dl class="site-voucher__list">' + linhas.map(function (l) { return '<div class="asa-summary__row"><dt>' + l[0] + '</dt><dd>' + l[1] + '</dd></div>'; }).join('') +
      '<div class="asa-summary__row asa-summary__row--total"><dt>Preço final</dt><dd><span class="site-voucher__total">' + fmt.real(conta.total) + '</span> <span class="site-voucher__status">' + status + '</span></dd></div>' +
      '<div class="asa-summary__row"><dt>Cancelamento</dt><dd>Grátis até ' + fmt.data(cancel) + ', ' + fmt.hora(cancel) + ' (24h antes da retirada)</dd></div></dl>';
  }

  function montar(s, conta) {
    var L = F.LOCAIS[s.local];
    $('[data-localizador]').value = r.localizador;
    copiar($('[data-copiar-loc]'), $('[data-localizador]'), $('[data-loc-aviso]'), 'Localizador copiado.');
    $('[data-email]').textContent = r.email;
    $('[data-email-errado]').href = 'https://wa.me/5508000800015?text=' + encodeURIComponent('Olá! Fiz a reserva ' + r.localizador + ' e digitei o e-mail errado.');
    if (r.responsavel) {
      var av = $('[data-resp-aviso]');
      av.hidden = false;
      // Quem preencheu e é o responsável financeiro lê "você"; senão, o nome de quem precisa ir junto.
      av.innerHTML = r.souResponsavel ? '<b>Você é o responsável financeiro: vá ao balcão na retirada, com seu cartão.</b>'
        : '<b>' + fmt.esc(r.responsavel.split(/\s+/)[0]) + ' precisa ir ao balcão com você.</b>';
    }
    montarVoucher(s, conta, r.pagamento === 'pix_online' && !F.ler('asa-pix-pago-' + r.localizador) ? 'Aguardando o Pix' : STATUS[r.pagamento]);

    var levar = ['CNH de quem vai dirigir' + (r.adicional ? ' e do condutor adicional' : '') + ' <span class="site-pending">[CONFIRMAR: se a CNH digital é aceita]</span>',
      'Cartão de crédito físico no nome de quem paga', 'Quem paga, presente no balcão', 'Este localizador: <b>' + r.localizador + '</b>'];
    $('[data-levar]').innerHTML = levar.map(function (t) { return '<li>' + t + '</li>'; }).join('');

    // Balcão: só a praça da reserva.
    var rec = s.local === 'REC';
    $('[data-balcao-titulo]').innerHTML = 'Como achar a Asa no ' + L.nome.replace('Aeroporto', '<em>Aeroporto</em>');
    $('[data-balcao-texto]').innerHTML = rec
      ? 'O balcão da Asa fica no <b>Portão A5 de Desembarque</b>. Depois de pegar as malas, siga para o Portão A5. Lá você faz o atendimento e pega o carro no pátio dentro do próprio aeroporto. Não precisa pegar van.'
      : 'O balcão da Asa fica na <b>Área de Locadoras do Terminal de Desembarque</b>. Depois de pegar as malas, siga as placas de locadoras. <span class="site-pending">[CONFIRMAR: sinalização exata no terminal]</span>';
    $('[data-balcao-endereco]').textContent = L.endereco;
    $('[data-balcao-maps]').href = L.maps;
    var mais = $('[data-balcao-mais]');
    mais.href = L.url;
    mais.textContent = 'Mais sobre o balcão de ' + L.cidade;
    // Imagem do retrofit de cada loja; a faixa de cima mostra o letreiro e a tela da cidade.
    var foto = $('[data-balcao-foto]');
    var src = rec ? '/site/img/lojas/loja-asa-aeroporto-recife.webp' : '/site/img/lojas/loja-asa-aeroporto-fortaleza.webp';
    if (window.ASA_URL) src = window.ASA_URL(src);
    foto.classList.add('site-foto');
    foto.removeAttribute('role');
    foto.innerHTML = '<img src="' + src + '" alt="' + (rec ? 'Loja da Asa Rent a Car no Portão A5 de desembarque do Aeroporto do Recife' : 'Loja da Asa Rent a Car na Área de Locadoras do Aeroporto de Fortaleza') +
      '" width="' + (rec ? 1024 : 1086) + '" height="' + (rec ? 1536 : 1448) + '" style="object-position:50% ' + (rec ? '13%' : '20%') + '" loading="lazy" decoding="async">';

    // WhatsApp já com o localizador.
    var wa = 'https://wa.me/5508000800015?text=' + encodeURIComponent('Olá! Minha reserva na Asa é a ' + r.localizador + ' e preciso de ajuda.');
    $$('[data-wa-reserva]').forEach(function (a) {
      a.href = wa;
      a.addEventListener('click', function () { track('generate_lead', { method: 'whatsapp', lead_topic: 'tenho_reserva', page_type: 'confirmacao' }); });
    });
    $('[data-precadastro]').addEventListener('click', function (e) {
      track('precadastro_click', { transaction_id: r.localizador, link_url: e.currentTarget.href });
    });
    $('[data-imprimir-voucher]').addEventListener('click', function () {
      track('voucher_download', { transaction_id: r.localizador, method: 'imprimir' });
      window.print();
    });
  }
})();
