/* Explorador de ícones da Asa Locadora · ajuste em tempo real.
   Lê window.ASA_ICONES (asa-icones-dados.js) e monta o bloco #explorador de 05-icones.html.
   Os ajustes ficam dentro das regras da marca: cores da paleta, faixa de traço de cada
   biblioteca, cantos e pontas sempre redondos e só contorno. */
(function () {
  "use strict";
  var root = document.getElementById("asa-ix");
  if (!root || !window.ASA_ICONES) return;

  var LIBS = {
    sistema: { nome: "Sistema", grade: 24, tam: [16, 48, 1, 24], traco: [1, 2, 0.25, 1.5], prefixo: "asa-",
      nota: "Site, app, Central e CRM. Grade de 24, traço 1,5 por padrão." },
    pecas: { nome: "Peças", grade: 40, tam: [48, 160, 4, 64], traco: [2, 4, 0.5, 3], prefixo: "asa-kit-",
      nota: "Posts, stories, anúncios, TV e impressos. Grade de 40, traço 3. Mínimo de 48 px numa arte de 1080." }
  };
  var CORES = [
    { id: "preto", nome: "Preto", hex: "#141517" },
    { id: "branco", nome: "Branco", hex: "#FFFFFF" },
    { id: "amarelo", nome: "Amarelo", hex: "#FEC42B" },
    { id: "vermelho", nome: "Vermelho", hex: "#E80911" }
  ];
  var FUNDOS = [
    { id: "branco", nome: "Branco", hex: "#FFFFFF" },
    { id: "cinza", nome: "Cinza", hex: "#F4F4F3" },
    { id: "amarelo", nome: "Amarelo", hex: "#FEC42B" },
    { id: "preto", nome: "Preto", hex: "#141517" }
  ];
  var PADRAO = { lib: "sistema", cor: "preto", fundo: "branco", fixo: false, grade: false };

  var st = carregar();
  var sel = new Set();
  var q = "", grupo = "";

  function carregar() {
    var s = Object.assign({}, PADRAO);
    try { Object.assign(s, JSON.parse(localStorage.getItem("asa-ix") || "{}")); } catch (e) { /* sem armazenamento */ }
    if (!LIBS[s.lib]) s.lib = "sistema";
    var L = LIBS[s.lib];
    if (typeof s.tam !== "number") s.tam = L.tam[3];
    if (typeof s.traco !== "number") s.traco = L.traco[3];
    return s;
  }
  function salvar() { try { localStorage.setItem("asa-ix", JSON.stringify(st)); } catch (e) { /* sem armazenamento */ } }

  /* ---------- cor e contraste ---------- */
  function lum(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function corHex() { return CORES.find(function (c) { return c.id === st.cor; }).hex; }
  function fundoHex() { return FUNDOS.find(function (c) { return c.id === st.fundo; }).hex; }
  function aviso() {
    var c = st.cor, f = st.fundo, r = contraste(corHex(), fundoHex());
    var txt = "Contraste " + r.toFixed(2).replace(".", ",") + ":1";
    if (c === f) return { nivel: "erro", txt: "Mesma cor do fundo: o ícone some." };
    if (c === "vermelho" && f === "amarelo") return { nivel: "erro", txt: "Proibido: vermelho sobre amarelo (" + r.toFixed(2).replace(".", ",") + ":1)." };
    if (c === "vermelho") return { nivel: "atencao", txt: txt + ". Vermelho só em ícone de ação, dentro de botão." };
    if (r < 3) return { nivel: "erro", txt: txt + ". Abaixo de 3:1, o mínimo para ícone (WCAG 1.4.11)." };
    return { nivel: "ok", txt: txt + ". Dentro da regra." };
  }

  /* ---------- svg ---------- */
  function lista() { return window.ASA_ICONES[st.lib]; }
  function arquivo(ic) { return st.lib === "pecas" ? "asa-kit-" + ic.num + "-" + ic.slug : "asa-" + ic.slug; }
  function svgDe(ic, opts) {
    opts = opts || {};
    var L = LIBS[st.lib], g = L.grade, tam = opts.tam || st.tam;
    var cor = opts.cor || corHex(), traco = st.traco;
    var inner = ic.svg;
    if (st.fixo) {
      /* traço fixo em pixels: o valor do controle vale na tela, em qualquer tamanho */
      traco = st.traco;
      inner = inner.replace(/<(path|line|polyline|polygon|circle|rect|ellipse)\b/g, '<$1 vector-effect="non-scaling-stroke"');
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + tam + '" height="' + tam + '" viewBox="0 0 ' + g + " " + g +
      '" fill="none" stroke="' + cor + '" stroke-width="' + traco + '" stroke-linecap="round" stroke-linejoin="round"' +
      (opts.aria === false ? "" : ' aria-hidden="true" focusable="false"') + ">" + inner + "</svg>";
  }
  function gradeSvg(g) {
    var s = "", i;
    for (i = 1; i < g; i++) s += '<path d="M' + i + " 0V" + g + "M0 " + i + "H" + g + '"/>';
    var area = g === 40 ? '<rect x="5" y="5" width="30" height="30"/>' : '<rect x="2" y="2" width="20" height="20"/>';
    return '<svg class="asa-ix__grid" viewBox="0 0 ' + g + " " + g + '" aria-hidden="true"><g class="l">' + s + '</g><g class="a">' + area + "</g></svg>";
  }

  /* ---------- montagem ---------- */
  root.innerHTML =
    '<div class="asa-ix__main">' +
      '<div class="asa-ix__libs" role="tablist" aria-label="Biblioteca"></div>' +
      '<div class="asa-ix__busca"><label class="asa-ix__sr" for="asa-ix-q">Buscar ícone</label>' +
        '<input class="asa-input" id="asa-ix-q" type="search" placeholder="Buscar por nome, número ou nome no Feather" autocomplete="off"></div>' +
      '<div class="asa-ix__grupos" aria-label="Famílias"></div>' +
      '<p class="asa-ix__conta" aria-live="polite"></p>' +
      '<ul class="asa-ix__grade" role="list"></ul>' +
    "</div>" +
    '<aside class="asa-ix__painel" aria-label="Ajustes">' +
      '<div class="asa-ix__bloco"><div class="asa-ix__rot"><label for="asa-ix-tam">Tamanho</label><output id="asa-ix-tam-v"></output></div>' +
        '<input type="range" id="asa-ix-tam" class="asa-ix__range"></div>' +
      '<div class="asa-ix__bloco"><div class="asa-ix__rot"><label for="asa-ix-tr">Traço</label><output id="asa-ix-tr-v"></output></div>' +
        '<input type="range" id="asa-ix-tr" class="asa-ix__range">' +
        '<label class="asa-ix__chk"><input type="checkbox" id="asa-ix-fixo"> Traço fixo em pixels</label>' +
        '<p class="asa-ix__dica" id="asa-ix-dica-tr"></p></div>' +
      '<div class="asa-ix__bloco"><span class="asa-ix__rot">Cor do ícone</span><div class="asa-ix__cores" id="asa-ix-cor"></div></div>' +
      '<div class="asa-ix__bloco"><span class="asa-ix__rot">Fundo</span><div class="asa-ix__cores" id="asa-ix-fundo"></div>' +
        '<p class="asa-ix__aviso" id="asa-ix-aviso" role="status"></p></div>' +
      '<div class="asa-ix__bloco"><span class="asa-ix__rot">Pontas e cantos</span><p class="asa-ix__fixo">Redondos, fixos pela marca</p>' +
        '<span class="asa-ix__rot">Estilo</span><p class="asa-ix__fixo">Só contorno. Preenchido só para marcar estado ativo, ver “Uso”.</p></div>' +
      '<label class="asa-ix__chk"><input type="checkbox" id="asa-ix-grade"> Mostrar a grade</label>' +
      '<div class="asa-ix__acoes">' +
        '<button type="button" class="asa-btn asa-btn--primary" id="asa-ix-baixar"></button>' +
        '<button type="button" class="asa-btn asa-btn--outline" id="asa-ix-limpar">Limpar seleção</button>' +
        '<button type="button" class="asa-btn asa-btn--outline" id="asa-ix-reset">Voltar ao padrão</button>' +
      "</div>" +
      '<p class="asa-ix__nota" id="asa-ix-nota"></p>' +
    "</aside>" +
    '<div class="asa-ix__det" id="asa-ix-det" hidden></div>' +
    '<p class="asa-ix__sr" aria-live="assertive" id="asa-ix-live"></p>';

  var $ = function (s) { return root.querySelector(s); };
  var elQ = $("#asa-ix-q"), elGrade = $(".asa-ix__grade"), elGrupos = $(".asa-ix__grupos"), elConta = $(".asa-ix__conta");
  var elTam = $("#asa-ix-tam"), elTr = $("#asa-ix-tr"), elFixo = $("#asa-ix-fixo"), elG = $("#asa-ix-grade");
  var elDet = $("#asa-ix-det"), elLive = $("#asa-ix-live");

  function anunciar(t) { elLive.textContent = ""; setTimeout(function () { elLive.textContent = t; }, 30); }

  function pintarLibs() {
    $(".asa-ix__libs").innerHTML = Object.keys(LIBS).map(function (k) {
      return '<button type="button" role="tab" data-lib="' + k + '" aria-selected="' + (k === st.lib) + '">' +
        LIBS[k].nome + " <span>" + window.ASA_ICONES[k].length + "</span></button>";
    }).join("");
  }
  function pintarCores() {
    var f = function (arr, chave) {
      return arr.map(function (c) {
        return '<button type="button" class="asa-ix__cor" data-' + chave + '="' + c.id + '" aria-pressed="' + (st[chave] === c.id) +
          '" title="' + c.nome + '"><span style="background:' + c.hex + '"></span><b>' + c.nome + "</b></button>";
      }).join("");
    };
    $("#asa-ix-cor").innerHTML = f(CORES, "cor");
    $("#asa-ix-fundo").innerHTML = f(FUNDOS, "fundo");
    var a = aviso(), el = $("#asa-ix-aviso");
    el.className = "asa-ix__aviso asa-ix__aviso--" + a.nivel; el.textContent = a.txt;
  }
  function pintarControles() {
    var L = LIBS[st.lib];
    elTam.min = L.tam[0]; elTam.max = L.tam[1]; elTam.step = L.tam[2]; elTam.value = st.tam;
    elTr.min = L.traco[0]; elTr.max = L.traco[1]; elTr.step = L.traco[2]; elTr.value = st.traco;
    $("#asa-ix-tam-v").textContent = st.tam + " px";
    var px = st.fixo ? st.traco : st.traco * st.tam / L.grade;
    $("#asa-ix-tr-v").textContent = String(st.traco).replace(".", ",") + (st.fixo ? " px" : " · " + px.toFixed(1).replace(".", ",") + " px na tela");
    elFixo.checked = st.fixo; elG.checked = st.grade;
    var d = "";
    if (st.lib === "pecas" && st.tam >= 120) d = "No tamanho de destaque (120 px ou mais), use traço 2 na grade: dá 6 px na arte.";
    else if (st.lib === "pecas" && st.tam < 48) d = "Abaixo de 48 px numa arte de 1080 o ícone vira borrão no celular.";
    else if (st.traco !== L.traco[3]) d = "Fora do padrão (" + String(L.traco[3]).replace(".", ",") + "). Use só quando a peça pedir.";
    $("#asa-ix-dica-tr").textContent = d;
    $("#asa-ix-nota").textContent = L.nota;
    root.style.setProperty("--ix-fundo", fundoHex());
    root.classList.toggle("asa-ix--grade", st.grade);
  }
  function grupos() {
    var g = [];
    lista().forEach(function (i) { if (g.indexOf(i.grupo) < 0) g.push(i.grupo); });
    elGrupos.innerHTML = ['<button type="button" data-grupo="" aria-pressed="' + (grupo === "") + '">Todas</button>']
      .concat(g.map(function (x) { return '<button type="button" data-grupo="' + x + '" aria-pressed="' + (grupo === x) + '">' + x + "</button>"; })).join("");
  }
  function filtrados() {
    var t = q.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return lista().filter(function (i) {
      if (grupo && i.grupo !== grupo) return false;
      if (!t) return true;
      var h = [i.nome, i.slug, i.ref || "", i.num || ""].join(" ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      return h.indexOf(t) >= 0;
    });
  }
  function pintarGrade() {
    var F = filtrados(), cel = Math.max(96, st.tam + 56);
    root.style.setProperty("--ix-cel", cel + "px");
    var g = LIBS[st.lib].grade;
    elGrade.innerHTML = F.map(function (i) {
      var k = arquivo(i), on = sel.has(k);
      return '<li><button type="button" class="asa-ix__item" data-k="' + k + '" aria-pressed="' + on + '" aria-label="' + i.nome + (on ? ", selecionado" : "") + '">' +
        '<span class="asa-ix__ic">' + (st.grade ? gradeSvg(g) : "") + svgDe(i) + "</span>" +
        '<span class="asa-ix__nome">' + (i.num ? "<b>" + i.num + "</b> " : "") + i.nome + "</span></button>" +
        '<button type="button" class="asa-ix__mais" data-det="' + k + '" aria-label="Detalhes de ' + i.nome + '">Detalhes</button></li>';
    }).join("") || '<li class="asa-ix__vazio">Nenhum ícone com esse nome. Tente o nome em inglês do Feather.</li>';
    elConta.textContent = F.length + " de " + lista().length + " ícones" + (sel.size ? " · " + sel.size + " selecionado" + (sel.size > 1 ? "s" : "") : "");
    $("#asa-ix-baixar").textContent = sel.size ? "Baixar " + sel.size + " SVG" : "Baixar " + F.length + " SVG";
  }
  function tudo() { pintarLibs(); pintarCores(); pintarControles(); grupos(); pintarGrade(); salvar(); }

  /* ---------- detalhe ---------- */
  function porChave(k) { return lista().find(function (i) { return arquivo(i) === k; }); }
  function abrirDet(k) {
    var i = porChave(k); if (!i) return;
    var g = LIBS[st.lib].grade;
    elDet.innerHTML =
      '<div class="asa-ix__det-in" role="dialog" aria-modal="true" aria-labelledby="asa-ix-det-t">' +
        '<button type="button" class="asa-ix__fechar" aria-label="Fechar">×</button>' +
        '<div class="asa-ix__det-prev">' + gradeSvg(g) + svgDe(i, { tam: 240 }) + "</div>" +
        '<div class="asa-ix__det-txt"><h3 id="asa-ix-det-t">' + (i.num ? i.num + " · " : "") + i.nome + "</h3>" +
          '<p class="asa-ix__arq">' + k + ".svg</p>" +
          "<p>" + i.grupo + (i.ref ? " · no Feather: " + i.ref : "") + (i.status === "novo" ? " · novo" : "") + "</p>" +
          '<div class="asa-ix__tamanhos">' + (st.lib === "pecas" ? [48, 64, 120] : [16, 20, 24, 32]).map(function (t) {
            return "<figure>" + svgDe(i, { tam: t }) + "<figcaption>" + t + "</figcaption></figure>"; }).join("") + "</div>" +
          '<div class="asa-ix__acoes">' +
            '<button type="button" class="asa-btn asa-btn--primary" data-a="svg">Baixar SVG</button>' +
            '<button type="button" class="asa-btn asa-btn--outline" data-a="png">Baixar PNG</button>' +
            '<button type="button" class="asa-btn asa-btn--outline" data-a="copiar">Copiar SVG</button>' +
          "</div></div></div>";
    elDet.hidden = false;
    elDet.dataset.k = k;
    elDet.querySelector(".asa-ix__fechar").focus();
  }
  function fecharDet() { elDet.hidden = true; var b = root.querySelector('[data-det="' + elDet.dataset.k + '"]'); if (b) b.focus(); }

  /* ---------- downloads ---------- */
  function baixar(nome, blob) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function svgArquivo(i) { return svgDe(i, { aria: false }).replace("<svg ", '<svg role="img" ').replace(">", "><title>" + i.nome + "</title>") + "\n"; }
  function png(i) {
    var t = st.tam * 2, img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas"); c.width = t; c.height = t;
      c.getContext("2d").drawImage(img, 0, 0, t, t);
      c.toBlob(function (b) { baixar(arquivo(i) + "-" + st.tam + "px@2x.png", b); });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgDe(i, { tam: t, aria: false }));
  }
  /* ZIP sem compressão (método 0): suficiente para SVG e sem dependência externa */
  var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(arqs) {
    var enc = new TextEncoder(), partes = [], central = [], off = 0;
    function u16(v) { return [v & 255, (v >> 8) & 255]; }
    function u32(v) { return [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255]; }
    arqs.forEach(function (f) {
      var nome = enc.encode(f.nome), dados = enc.encode(f.txt), crc = crc32(dados);
      var cab = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(dados.length), u32(dados.length), u16(nome.length), u16(0));
      partes.push(new Uint8Array(cab), nome, dados);
      central.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(dados.length), u32(dados.length),
        u16(nome.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nome);
      off += cab.length + nome.length + dados.length;
    });
    var tam = central.reduce(function (s, p) { return s + p.length; }, 0);
    var fim = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(arqs.length), u16(arqs.length), u32(tam), u32(off), u16(0)));
    return new Blob(partes.concat(central, [fim]), { type: "application/zip" });
  }
  function baixarLote() {
    var F = sel.size ? lista().filter(function (i) { return sel.has(arquivo(i)); }) : filtrados();
    if (!F.length) return;
    if (F.length === 1) { baixar(arquivo(F[0]) + ".svg", new Blob([svgArquivo(F[0])], { type: "image/svg+xml" })); return; }
    baixar("asa-icones-" + st.lib + "-" + st.tam + "px.zip", zip(F.map(function (i) { return { nome: arquivo(i) + ".svg", txt: svgArquivo(i) }; })));
    anunciar(F.length + " ícones baixados");
  }

  /* ---------- eventos ---------- */
  root.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || !root.contains(b)) return;
    if (b.dataset.lib && b.dataset.lib !== st.lib) {
      st.lib = b.dataset.lib; st.tam = LIBS[st.lib].tam[3]; st.traco = LIBS[st.lib].traco[3]; grupo = ""; sel.clear(); tudo(); return;
    }
    if (b.dataset.cor) { st.cor = b.dataset.cor; pintarCores(); pintarGrade(); salvar(); return; }
    if (b.dataset.fundo) { st.fundo = b.dataset.fundo; pintarCores(); pintarControles(); salvar(); return; }
    if ("grupo" in b.dataset) { grupo = b.dataset.grupo; grupos(); pintarGrade(); return; }
    if (b.dataset.k) {
      var k = b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k);
      b.setAttribute("aria-pressed", sel.has(k)); pintarGrade(); return;
    }
    if (b.dataset.det) { abrirDet(b.dataset.det); return; }
    if (b.id === "asa-ix-baixar") { baixarLote(); return; }
    if (b.id === "asa-ix-limpar") { sel.clear(); pintarGrade(); return; }
    if (b.id === "asa-ix-reset") { st = Object.assign({}, PADRAO, { lib: st.lib, tam: LIBS[st.lib].tam[3], traco: LIBS[st.lib].traco[3] }); tudo(); anunciar("Ajustes no padrão da marca"); return; }
    if (b.classList.contains("asa-ix__fechar")) { fecharDet(); return; }
    if (b.dataset.a) {
      var i = porChave(elDet.dataset.k);
      if (b.dataset.a === "svg") baixar(arquivo(i) + ".svg", new Blob([svgArquivo(i)], { type: "image/svg+xml" }));
      if (b.dataset.a === "png") png(i);
      if (b.dataset.a === "copiar") {
        var t = svgArquivo(i);
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = "Copiado"; anunciar("SVG copiado"); },
          function () { b.textContent = "Não deu para copiar"; });
        setTimeout(function () { b.textContent = "Copiar SVG"; }, 1600);
      }
    }
  });
  elDet.addEventListener("click", function (e) { if (e.target === elDet) fecharDet(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !elDet.hidden) fecharDet(); });
  elQ.addEventListener("input", function () { q = elQ.value; pintarGrade(); });
  elTam.addEventListener("input", function () { st.tam = +elTam.value; pintarControles(); pintarGrade(); salvar(); });
  elTr.addEventListener("input", function () { st.traco = +elTr.value; pintarControles(); pintarGrade(); salvar(); });
  elFixo.addEventListener("change", function () { st.fixo = elFixo.checked; pintarControles(); pintarGrade(); salvar(); });
  elG.addEventListener("change", function () { st.grade = elG.checked; pintarControles(); pintarGrade(); salvar(); });

  tudo();
})();
