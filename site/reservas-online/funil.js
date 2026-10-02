/* ==========================================================================
   FUNIL DE RESERVA · o que as quatro etapas compartilham.
   Frota, proteções, adicionais, a conta do preço final, o resumo do pedido
   e o estado da reserva.

   Onde fica cada coisa:
   - Busca e escolhas (local, datas, cupom, grupo, proteção, adicionais,
     upgrade) vão na URL: não são dado pessoal, sobrevivem ao recarregar e
     ao voltar uma etapa.
   - Dado pessoal (nome, CPF, e-mail, celular) nunca vai na URL nem no GA4.
     No protótipo fica no sessionStorage da aba, que some ao fechar; em
     produção, na sessão do motor de reservas.
   - Número de cartão não é guardado em lugar nenhum.

   Protótipo: a frota é a de 00a-fonte-de-verdade (25/09). Tarifa, esgotado,
   o grupo de upgrade e o localizador são de exemplo; proteções e adicionais
   são os valores de referência de 08/09. Em produção, tudo vem do motor.
   ========================================================================== */
(function () {
  'use strict';

  var GRUPOS = [
    { g: 'A',  cat: 'Hatch econômico',  modelo: 'Fiat Mobi',                     cambio: 'Manual',     lugares: 5, portas: 4, malas: '1–2', cats: ['hatch'],            tarifa: 109 },
    { g: 'B',  cat: 'Hatch econômico',  modelo: 'Hyundai HB20 1.0',              cambio: 'Manual',     lugares: 5, portas: 4, malas: '2–3', cats: ['hatch'],            tarifa: 119, selo: 'Preferido do público' },
    { g: 'B+', cat: 'Hatch econômico',  modelo: 'Chevrolet Onix 1.0',            cambio: 'Manual',     lugares: 5, portas: 4, malas: '2–3', cats: ['hatch'],            tarifa: 125 },
    { g: 'C+', cat: 'Sedã',             modelo: 'Chevrolet Onix Plus 1.0',       cambio: 'Manual',     lugares: 5, portas: 4, malas: '2–3', cats: ['seda'],             tarifa: 135 },
    { g: 'D',  cat: 'Hatch automático', modelo: 'Citroën C3 Live Pack 1.6',      cambio: 'Automático', lugares: 5, portas: 4, malas: '1–2', cats: ['hatch'],            tarifa: 139 },
    { g: 'D+', cat: 'Hatch automático', modelo: 'Chevrolet Onix 1.0 Turbo',      cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['hatch'],            tarifa: 149 },
    { g: 'E+', cat: 'Sedã automático',  modelo: 'Chevrolet Onix Plus 1.0 Turbo', cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['seda'],             tarifa: 159 },
    { g: 'F+', cat: '7 lugares',        modelo: 'Chevrolet Spin 1.8',            cambio: 'Automático', lugares: 7, portas: 4, malas: '3–4', cats: ['7-lugares'],        tarifa: 189 },
    { g: 'G+', cat: 'SUV',              modelo: 'Chevrolet Tracker 1.0 Turbo',   cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['suv'],              tarifa: 179 },
    { g: 'H',  cat: 'Picape',           modelo: 'Fiat Strada 1.3',               cambio: 'Manual',     lugares: 2, portas: 2, malas: '3–4', cats: ['picape'],           tarifa: 169 },
    { g: 'I+', cat: 'SUV 7 lugares',    modelo: 'Jeep Commander 1.3',            cambio: 'Automático', lugares: 7, portas: 4, malas: '2–3', cats: ['suv', '7-lugares'], tarifa: 259 },
    { g: 'J+', cat: 'SUV',              modelo: 'Jeep Compass 1.3',              cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['suv'],              tarifa: 239 },
    { g: 'N+', cat: 'Sedã automático',  modelo: 'Toyota Corolla 2.0',            cambio: 'Automático', lugares: 5, portas: 4, malas: '2–3', cats: ['seda'],             tarifa: 229, esgotado: true },
    { g: 'O+', cat: 'Picape 4x4',       modelo: 'Fiat Toro 2.0',                 cambio: 'Automático', lugares: 5, portas: 4, malas: '3–4', cats: ['picape'],           tarifa: 279, x4: true },
    { g: 'P+', cat: 'Picape 4x4',       modelo: 'Chevrolet S10 2.8 CD',          cambio: 'Automático', lugares: 5, portas: 4, malas: '3–4', cats: ['picape'],           tarifa: 329, x4: true }
  ];

  /* O grupo "acima" de cada um, sempre com um ganho que dê para dizer em
     uma palavra (automático, 7 lugares, mais porta-malas, 4x4). Exemplo:
     quem decide o upgrade e o preço dele é o motor. */
  var UPGRADE = { 'A': 'B', 'B': 'D+', 'B+': 'D+', 'C+': 'E+', 'D': 'D+', 'D+': 'G+', 'E+': 'N+', 'F+': 'I+', 'G+': 'I+', 'H': 'O+', 'J+': 'I+' };
  var UPGRADE_DIA = 3.00;          // "+R$ 3,00/dia" (FICHA, 08/09)

  var PROTECOES = [
    { id: 'basica',    nome: 'Básica',             dia: 19.90, cta: 'Ficar com a Básica' },
    { id: 'terceiros', nome: 'Básica + Terceiros', dia: 39.90, cta: 'Escolher Básica + Terceiros', popular: true },
    { id: 'completa',  nome: 'Completa',           dia: null,  cta: 'Escolher Completa' }
  ];
  var ADICIONAIS = {
    cadeira:     { id: 'cadeira_bebe',            nome: 'Cadeira de bebê',        dia: 29.90, max: 3 },
    condutor:    { id: 'condutor_adicional',      nome: 'Condutor adicional',     dia: 10.90 },
    responsavel: { id: 'responsavel_financeiro',  nome: 'Responsável financeiro', dia: 14.90 }
  };
  var TAXA = 0.12;                 // sobre diárias e proteção
  var CUPONS = { BEMVINDOASA: 0.15 };

  var LOCAIS = {
    REC: { nome: 'Aeroporto do Recife', curto: 'no Aeroporto do Recife', cidade: 'Recife', balcao: 'Portão A5 de Desembarque, com o carro no pátio do aeroporto.',
           url: '/aluguel-de-carros/aeroporto-recife', maps: 'https://maps.google.com/maps?cid=7788866797979248996',
           endereco: 'Aeroporto Internacional do Recife/Guararapes – Gilberto Freyre, Praça Ministro Salgado Filho, s/n, Imbiribeira, Recife/PE, CEP 51210-902' },
    FOR: { nome: 'Aeroporto de Fortaleza', curto: 'no Aeroporto de Fortaleza', cidade: 'Fortaleza', balcao: 'Área de Locadoras, no Terminal de Desembarque.',
           url: '/aluguel-de-carros/aeroporto-fortaleza', maps: 'https://maps.google.com/maps?cid=6562632952082218298',
           endereco: 'Aeroporto Internacional de Fortaleza – Pinto Martins, Av. Senador Carlos Jereissati, 3000, Serrinha, Fortaleza/CE, CEP 60741-900' }
  };

  /* ---------- Formatos ---------- */
  var HORA = 3600 * 1000, DIA = 24 * HORA;
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var fmt = {
    real: function (v) { return BRL.format(v); },
    hora: function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); },
    data: function (d) { return d.getDate() + ' ' + MESES[d.getMonth()]; },
    dataCurta: function (d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); },
    toLocal: function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); },
    esc: function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  };
  var round = function (v) { return Math.round(v * 100) / 100; };

  function grupo(g) {
    var c = GRUPOS.filter(function (x) { return x.g === g; })[0];
    if (!c) return null;
    c = Object.assign({}, c);
    c.malasMax = +c.malas.split('–')[1];
    c.motor = (c.modelo.match(/\d\.\d( Turbo)?/) || [''])[0];
    return c;
  }

  /* ---------- Estado da reserva, lido da URL ---------- */
  function estado(search) {
    var q = new URLSearchParams(search === undefined ? location.search : search);
    var s = { local: q.get('local'), codigo: (q.get('cupom') || '').toUpperCase() };
    s.ini = q.get('retirada') ? new Date(q.get('retirada')) : null;
    s.fim = q.get('devolucao') ? new Date(q.get('devolucao')) : null;
    s.busca = !!(LOCAIS[s.local] && s.ini && s.fim && !isNaN(s.ini) && !isNaN(s.fim) && s.fim > s.ini);
    s.desconto = CUPONS[s.codigo] || 0;
    if (!s.desconto) s.codigo = '';
    // Diárias pela regra das 27 horas: as 3 primeiras horas além de cada 24 não abrem diária nova.
    s.dias = s.busca ? Math.max(1, Math.ceil((s.fim - s.ini - 3 * HORA) / DIA)) : 0;
    s.limite = s.busca ? new Date(s.ini.getTime() + s.dias * DIA + 3 * HORA) : null;
    s.grupo = grupo(q.get('grupo'));
    s.ok = s.busca && !!s.grupo;
    s.upgrade = q.get('upgrade') === '1' && s.grupo && UPGRADE[s.grupo.g] ? grupo(UPGRADE[s.grupo.g]) : null;
    s.protecao = PROTECOES.filter(function (p) { return p.id === q.get('protecao'); })[0] || null;
    s.cadeiras = Math.max(0, Math.min(ADICIONAIS.cadeira.max, parseInt(q.get('cadeiras'), 10) || 0));
    s.condutor = q.get('condutor') === '1';
    s.responsavel = q.get('responsavel') === '1';
    return s;
  }

  /* Monta a URL de uma etapa com o estado (só o que não é dado pessoal). */
  function url(caminho, s, muda) {
    var o = {
      local: s.local, retirada: s.ini && fmt.toLocal(s.ini), devolucao: s.fim && fmt.toLocal(s.fim), cupom: s.codigo,
      grupo: s.grupo && s.grupo.g, upgrade: s.upgrade ? '1' : '', protecao: s.protecao && s.protecao.id,
      cadeiras: s.cadeiras || '', condutor: s.condutor ? '1' : '', responsavel: s.responsavel ? '1' : ''
    };
    Object.assign(o, muda || {});
    var q = new URLSearchParams();
    Object.keys(o).forEach(function (k) { if (o[k]) q.set(k, o[k]); });
    return caminho + '?' + q.toString();
  }

  function upgradeDe(c) {
    var u = c && UPGRADE[c.g] ? grupo(UPGRADE[c.g]) : null;
    return u && !u.esgotado ? u : null;
  }

  /* O que o upgrade muda, em uma palavra cada. */
  function ganhos(de, para) {
    var g = [];
    if (de.cambio !== 'Automático' && para.cambio === 'Automático') g.push('Automático');
    if (para.lugares > de.lugares) g.push(para.lugares + ' lugares');
    if (+para.malas.split('–')[1] > +de.malas.split('–')[1]) g.push('Mais porta-malas');
    if (para.x4 && !de.x4) g.push('4x4');
    if (para.cats.indexOf('suv') !== -1 && de.cats.indexOf('suv') === -1) g.push('SUV');
    return g;
  }

  /* ---------- A conta ----------
     Diárias (+ upgrade) e proteção somam a base; a taxa de 12% incide sobre
     ela; adicionais entram sem taxa (a fonte diz "diárias + proteção"; C2);
     o cupom desconta sobre base + taxa, como na vitrine. Com a proteção
     ainda não escolhida, a conta usa a Básica, que já está no preço que a
     pessoa viu na vitrine. */
  function calcular(s) {
    var c = s.grupo, n = s.dias;
    var prot = s.protecao || PROTECOES[0];
    var r = { linhas: [], items: [], pendente: prot.dia === null };
    var diarias = round(c.tarifa * n);
    var up = s.upgrade ? round(UPGRADE_DIA * n) : 0;
    var protecao = prot.dia === null ? 0 : round(prot.dia * n);
    var base = diarias + up + protecao;
    var taxa = round(base * TAXA);
    r.linhas.push({ rotulo: 'Diárias (' + n + ' × ' + fmt.real(c.tarifa) + ')', valor: diarias });
    r.items.push({ item_id: (s.upgrade || c).g, item_name: (s.upgrade || c).modelo, item_category: 'carro', price: round(c.tarifa + (s.upgrade ? UPGRADE_DIA : 0)), quantity: n });
    if (s.upgrade) r.linhas.push({ rotulo: 'Upgrade para o grupo ' + s.upgrade.g + ' (' + n + ' × ' + fmt.real(UPGRADE_DIA) + ')', valor: up });
    r.linhas.push({ rotulo: 'Proteção ' + prot.nome + (prot.dia === null ? '' : ' (' + n + ' × ' + fmt.real(prot.dia) + ')'), valor: prot.dia === null ? null : protecao });
    r.items.push({ item_id: 'protecao_' + prot.id, item_name: 'Proteção ' + prot.nome, item_category: 'protecao', price: prot.dia || 0, quantity: n });
    var adicionais = 0;
    [['cadeira', s.cadeiras], ['condutor', s.condutor ? 1 : 0], ['responsavel', s.responsavel ? 1 : 0]].forEach(function (a) {
      if (!a[1]) return;
      var ad = ADICIONAIS[a[0]], v = round(ad.dia * n * a[1]);
      adicionais += v;
      r.linhas.push({ rotulo: ad.nome + (a[1] > 1 ? ' × ' + a[1] : '') + ' (' + n + ' × ' + fmt.real(ad.dia) + ')', valor: v });
      r.items.push({ item_id: ad.id, item_name: ad.nome, item_category: 'adicional', price: ad.dia, quantity: n * a[1] });
    });
    r.linhas.push({ rotulo: 'Taxa administrativa (12% sobre diárias e proteção)', valor: taxa, forte: true });
    var desconto = s.desconto ? round((base + taxa) * s.desconto) : 0;
    if (desconto) r.linhas.push({ rotulo: 'Cupom ' + s.codigo, valor: -desconto });
    r.taxa = taxa;
    r.desconto = desconto;
    r.total = round(base + taxa + adicionais - desconto);
    return r;
  }

  /* ---------- Resumo do pedido (asa-summary) ---------- */
  function resumo(s, conta, opts) {
    opts = opts || {};
    var c = s.upgrade || s.grupo, L = LOCAIS[s.local];
    var linhas = conta.linhas.map(function (l) {
      var v = l.valor === null ? '<span class="site-pending">[CONFIRMAR: valor]</span>' : (l.valor < 0 ? '− ' + fmt.real(-l.valor) : fmt.real(l.valor));
      return '<div class="asa-summary__row' + (l.forte ? ' site-sum__strong' : '') + '"><span>' + l.rotulo + '</span><span>' + v + '</span></div>';
    }).join('');
    var total = conta.pendente ? '<span class="site-pending">[CONFIRMAR: valor da Completa]</span>' : fmt.real(conta.total);
    return '<h2 class="site-sum__title">Resumo da reserva</h2>' +
      '<p class="site-sum__trip"><b>' + L.nome + '</b><br>' + fmt.data(s.ini) + ', ' + fmt.hora(s.ini) + ' → ' + fmt.data(s.fim) + ', ' + fmt.hora(s.fim) + '</p>' +
      '<p class="site-sum__rule">Diária de 27 horas: devolução até as ' + fmt.hora(s.limite) + ' sem outra diária.</p>' +
      '<p class="site-sum__car"><b>Grupo ' + c.g + ' · ' + fmt.esc(c.modelo) + ' ou similar</b>' + (s.upgrade ? '<span>Upgrade do grupo ' + s.grupo.g + '</span>' : '') + '</p>' +
      linhas +
      '<div class="asa-summary__row asa-summary__row--total"><span>Preço final</span><span class="site-sum__total" data-total>' + total + '</span></div>' +
      '<p class="site-sum__note">Preço final · proteção e taxa inclusas</p>' +
      (opts.caucao === false ? '' : '<p class="site-sum__deposit">Na retirada, fica uma pré-autorização de <span class="site-pending">[CONFIRMAR: valor da caução por grupo e proteção]</span> no cartão de crédito físico de quem paga. O valor é estornado por inteiro depois da devolução e da vistoria.</p>') +
      '<p class="site-sum__cancel">Cancele grátis até 24h antes da retirada</p>' +
      (opts.prova ? '<p class="site-sum__proof"><b>4,7 no Google</b> · balcões de Recife e Fortaleza</p>' : '');
  }

  /* ---------- Dados da etapa 3 e reserva feita (sessionStorage) ---------- */
  function ler(chave) { try { return JSON.parse(sessionStorage.getItem(chave) || 'null'); } catch (e) { return null; } }
  function gravar(chave, v) { try { sessionStorage.setItem(chave, JSON.stringify(v)); } catch (e) { /* aba privada: segue sem guardar */ } }

  function track(ev, p) { (window.asaTrack || function () {})(ev, p); }

  window.AsaFunil = {
    GRUPOS: GRUPOS, PROTECOES: PROTECOES, ADICIONAIS: ADICIONAIS, LOCAIS: LOCAIS, CUPONS: CUPONS, TAXA: TAXA, UPGRADE_DIA: UPGRADE_DIA,
    grupo: grupo, grupos: function () { return GRUPOS.map(function (c) { return grupo(c.g); }); },
    estado: estado, url: url, upgradeDe: upgradeDe, ganhos: ganhos, calcular: calcular, resumo: resumo,
    ler: ler, gravar: gravar, track: track, fmt: fmt, HORA: HORA, DIA: DIA
  };
})();
