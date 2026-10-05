#!/usr/bin/env python3
"""Gera a versão offline do site/ para abrir com dois cliques, sem servidor.

As páginas do site usam os endereços de produção (/frota, /css/..., /site/...),
que só funcionam servidos por scripts/servir-site.py. Esta versão reescreve
tudo para caminhos relativos e arquivos index.html, para abrir direto do disco
(file://) no Chrome, no Safari ou no Edge:

  - atributos href, src, action e data-*-href que começam com "/";
  - no JavaScript, os endereços de navegação (location.href, F.url(...)) passam
    por ASA_URL(), definido em offline.js;
  - links montados pelo JavaScript na hora são corrigidos no clique, também
    por offline.js;
  - as categorias do blog (/blog/categoria/x) viram blog/index.html?categoria=x;
  - endereço que não existe cai na 404, como no servidor.

Esta versão mostra o site como ficaria no ar, sem as notas do protótipo:
  - sai o aviso "Rascunho para revisão" (.site-draft);
  - saem os marcadores [CONFIRMAR], [VERIFICAR] e [REVISÃO JURÍDICA]; a regra
    dos termos de hoje fica como texto normal;
  - "[preço do motor]" e "[diária do motor]" viram preços de exemplo, com a
    tarifa do protótipo (funil.js), a proteção básica e a taxa de 12%;
  - a proteção Completa ganha um valor de exemplo, para o funil fechar a conta;
  - a foto que ainda é briefing vira um painel neutro com a asa, sem a legenda.
As notas continuam na versão de desenvolvimento (site/), que é a oficial.

Copia junto css/ e assets/ (fontes e logos). Não copia os documentos de
trabalho (PENDENCIAS, VALIDACAO, briefing).

Uso:
    python3 scripts/site_offline.py                     # ../asa-design-system-offline/site
    python3 scripts/site_offline.py /outro/destino/site
"""
import json
import os
import re
import shutil
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(RAIZ, "site")
DESTINO = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(RAIZ), "asa-design-system-offline", "site")
FORA = {"_parciais", ".DS_Store"}
DOCS = (".md", ".csv")


def paginas_e_arquivos():
    pags, arqs = [], []
    for base, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in FORA]
        rel = os.path.relpath(base, SITE)
        rel = "" if rel == "." else rel
        if "index.html" in files and rel:
            pags.append(rel)
        for f in files:
            if f.endswith(".html") and f != "index.html":
                arqs.append(os.path.join(rel, f) if rel else f)
    return sorted(pags), sorted(arqs)


PAGS, ARQS = paginas_e_arquivos()


def converter(caminho, prefixo):
    """Endereço de produção (/frota/suv?x=1#y) para o arquivo relativo."""
    m = re.match(r"^([^?#]*)(\?[^#]*)?(#.*)?$", caminho)
    cam, q, h = m.group(1).strip("/"), m.group(2) or "", m.group(3) or ""
    cat = re.match(r"^blog/categoria/([a-z-]+)$", cam)
    if cat:
        cam, q = "blog", (q + "&" if q else "?") + "categoria=" + cat.group(1)
    if re.match(r"^(css|assets)/", cam):
        return prefixo + cam + q + h
    if cam.startswith("site/"):
        return prefixo + cam[5:] + q + h
    if cam == "":
        alvo = "index.html"
    elif cam in PAGS:
        alvo = cam + "/index.html"
    elif cam in ARQS or cam + ".html" in ARQS:
        alvo = cam if cam in ARQS else cam + ".html"
    else:
        alvo = "blog/404.html" if cam.startswith("blog/") else "404.html"
    return prefixo + alvo + q + h


ATTR = re.compile(r'(\s(?:href|src|action|data-[a-z-]*href|data-src))="(/(?!/)[^"]*)"')


# Tarifas do protótipo, lidas de funil.js, para os preços de exemplo.
FUNIL = open(os.path.join(SITE, "reservas-online", "funil.js"), encoding="utf-8").read()
GRUPOS = [dict(g=m.group(1), cambio=m.group(2), cats=re.findall(r"'([a-z0-9-]+)'", m.group(3)), tarifa=float(m.group(4)))
          for m in re.finditer(r"\{ g: '([A-Z]\+?)',.*?cambio: '(\w+)'.*?cats: \[([^\]]*)\],\s*tarifa: (\d+)", FUNIL)]
BASICA, TAXA = 19.90, 0.12
CAT = {"sedan": "seda"}


def real(v):
    return "R$ " + ("%.2f" % v).replace(".", ",")


def preco_exemplo(trecho):
    """Preço de 1 diária com a proteção básica e a taxa, do grupo do card."""
    g = re.search(r"grupo ([A-Z]\+?)(?![A-Za-z])", re.sub(r"<[^>]+>", " ", trecho))
    if g:
        ts = [x["tarifa"] for x in GRUPOS if x["g"] == g.group(1)]
    else:
        cat = re.search(r'data-item-cat="([a-z0-9-]+)"', trecho)
        cat = CAT.get(cat.group(1), cat.group(1)) if cat else ""
        ts = [x["tarifa"] for x in GRUPOS if cat in x["cats"] or (cat == "automatico" and x["cambio"] == "Automático")]
    return real((min(ts) + BASICA) * (1 + TAXA)) if ts else None


PEND = re.compile(r'<(span|p)([^>]*\bclass="site-(?:article__)?pending"[^>]*)>((?:(?!<span\b|</span>|<p\b|</p>).)*?)</\1>', re.S)
PRECO = re.compile(r'<span class="site-pending">\[(preço|diária) do motor\]</span>')


# Notas que, tiradas, deixariam a frase pela metade: troca pontual.
_AP = '<span class="site-article__pending">'
TROCAS = [
    ("Distância e tempo conferidos em " + _AP + "[VERIFICAR: data e fonte]</span>. ", ""),
    ("A distância e o tempo do resumo foram conferidos em " + _AP + "[VERIFICAR: data e fonte]</span>. ", ""),
    ("<span>Distância</span>" + _AP + "[VERIFICAR]</span>", "<span>Distância</span><span>Cerca de 60 km</span>"),
    ("<span>Tempo estimado</span>" + _AP + "[VERIFICAR]</span>", "<span>Tempo estimado</span><span>Cerca de 1 hora</span>"),
    ("Por " + _AP + "[CONFIRMAR: nome e função de quem assina]</span>", "Por Equipe Asa"),
    (" [AUTORIZAÇÃO]", ""),
]


def sem_notas(texto):
    # Preços de exemplo: cada marcador pega o grupo (ou a categoria) do card em volta.
    def troca_preco(m):
        ini = texto.rfind("<article", 0, m.start())
        fim = texto.find("</article>", m.end())
        v = preco_exemplo(texto[ini:fim]) if ini >= 0 and fim > 0 else None
        return v or ""
    texto = PRECO.sub(troca_preco, texto)
    for a, b in TROCAS:
        texto = texto.replace(a, b)
    # Marcadores entre colchetes saem; o resto (regra dos termos de hoje) fica como texto.
    while True:
        novo = PEND.sub(lambda m: "" if re.sub(r"<[^>]+>", "", m.group(3)).strip().startswith("[") else m.group(3), texto)
        if novo == texto:
            break
        texto = novo
    texto = re.sub(r"[ \t]+([.,;:])", r"\1", texto)
    return texto


def html(texto, prefixo):
    texto = sem_notas(texto)
    texto = ATTR.sub(lambda m: '%s="%s"' % (m.group(1), converter(m.group(2), prefixo)), texto)
    carga = ('<link rel="stylesheet" href="%soffline.css"><script>window.ASA_RAIZ = "%s";</script><script src="%soffline.js"></script>'
             % (prefixo, prefixo, prefixo))
    if "<script" in texto:
        texto = texto.replace("<script", carga + "\n  <script", 1)
    else:
        texto = texto.replace("</head>", "  " + carga + "\n</head>", 1)
    return texto


# Literais completos de endereço no JS ('/reservas-online', '/?local='), fora de
# HTML (href="/...") e sem os prefixos que o código completa ('/frota/' + x):
# esses ficam para a correção no clique. O primeiro segmento começa com letra,
# para não pegar contadores como '/500'.
LITERAL = re.compile(r"(?<![=\w])'(/(?:[a-z][a-z0-9-]*(?:/[a-z0-9-]+)*)?(?:\?[^'\s<>]*)?)'")


def js(texto, nome):
    def troca(m):
        lit = m.group(1)
        if lit == "/" or lit.endswith("/") and "?" not in lit:
            return m.group(0)
        return "ASA_URL('%s')" % lit
    texto = LITERAL.sub(troca, texto)
    if nome == "funil.js":
        texto = texto.replace("{ id: 'completa',  nome: 'Completa',           dia: null,",
                              "{ id: 'completa',  nome: 'Completa',           dia: 59.90,")
        texto = texto.replace('pré-autorização de <span class="site-pending">[CONFIRMAR: valor da caução por grupo e proteção]</span> no',
                              'pré-autorização no')
    if nome == "blog.js":
        texto = texto.replace(
            "var m = location.pathname.match(/^\\/blog\\/categoria\\/([a-z-]+)\\/?$/);",
            "var m = location.pathname.match(/^\\/blog\\/categoria\\/([a-z-]+)\\/?$/);"
            " var qc = new URLSearchParams(location.search).get('categoria'); if (!m && qc) m = [0, qc];")
        texto = texto.replace(
            "return (cat ? '/blog/categoria/' + cat : ASA_URL('/blog')) + (pagina > 1 ? '?pagina=' + pagina : '');",
            "return ASA_URL((cat ? '/blog/categoria/' + cat : '/blog') + (pagina > 1 ? '?pagina=' + pagina : ''));")
    return texto


OFFLINE_JS = """/* Versão offline do site da Asa (gerada por scripts/site_offline.py).
   Converte os endereços de produção para os arquivos locais. */
(function () {
  var RAIZ = window.ASA_RAIZ || '';
  var PAGS = %s;
  var ARQS = %s;
  window.ASA_URL = function (p) {
    if (typeof p !== 'string' || p.charAt(0) !== '/' || p.charAt(1) === '/') return p;
    var m = p.match(/^([^?#]*)(\\?[^#]*)?(#.*)?$/);
    var cam = m[1].replace(/^\\/+|\\/+$/g, ''), q = m[2] || '', h = m[3] || '';
    var cat = cam.match(/^blog\\/categoria\\/([a-z-]+)$/);
    if (cat) { cam = 'blog'; q = (q ? q + '&' : '?') + 'categoria=' + cat[1]; }
    if (/^(css|assets)\\//.test(cam)) return RAIZ + cam + q + h;
    if (cam.indexOf('site/') === 0) return RAIZ + cam.slice(5) + q + h;
    var alvo = cam === '' ? 'index.html'
      : PAGS.indexOf(cam) >= 0 ? cam + '/index.html'
      : ARQS.indexOf(cam) >= 0 ? cam
      : ARQS.indexOf(cam + '.html') >= 0 ? cam + '.html'
      : cam.indexOf('blog/') === 0 ? 'blog/404.html' : '404.html';
    return RAIZ + alvo + q + h;
  };
  /* Notas do protótipo montadas pelo JavaScript: marcador sai, texto fica. */
  function limpar() {
    var ns = document.querySelectorAll('.site-pending');
    for (var i = ns.length - 1; i >= 0; i--) {
      var n = ns[i];
      if (/^\\s*\\[/.test(n.textContent)) n.remove();
      else n.replaceWith.apply(n, Array.prototype.slice.call(n.childNodes));
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    limpar();
    var agendado = false;
    new MutationObserver(function () {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(function () { agendado = false; limpar(); });
    }).observe(document.body, { childList: true, subtree: true });
  });
  /* Links montados pelo JavaScript: corrige no clique. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h && h.charAt(0) === '/' && h.charAt(1) !== '/') a.setAttribute('href', window.ASA_URL(h));
  }, true);
})();
"""


OFFLINE_CSS = """/* Versão offline: o site como ficaria no ar, sem as notas do protótipo. */
.site-draft { display: none !important; }
/* Foto que ainda é briefing: painel neutro com a asa, sem a legenda. */
.asa-photo:not(.site-foto) { background: var(--asa-placeholder) url(assets/img/w-atual-red.png) center / 18% auto no-repeat; }
.asa-photo:not(.site-foto) > .asa-photo__caption { display: none; }
"""


def main():
    if os.path.exists(DESTINO):
        shutil.rmtree(DESTINO)
    n_html = n_js = 0
    for base, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in FORA]
        rel = os.path.relpath(base, SITE)
        rel = "" if rel == "." else rel
        prof = 0 if not rel else rel.count(os.sep) + 1
        prefixo = "../" * prof
        os.makedirs(os.path.join(DESTINO, rel), exist_ok=True)
        for f in files:
            if f in FORA or f.endswith(DOCS):
                continue
            ori, dst = os.path.join(base, f), os.path.join(DESTINO, rel, f)
            if f.endswith(".html"):
                open(dst, "w", encoding="utf-8").write(html(open(ori, encoding="utf-8").read(), prefixo))
                n_html += 1
            elif f.endswith(".js"):
                open(dst, "w", encoding="utf-8").write(js(open(ori, encoding="utf-8").read(), f))
                n_js += 1
            else:
                shutil.copy2(ori, dst)
    shutil.copytree(os.path.join(RAIZ, "css"), os.path.join(DESTINO, "css"))
    for d in ("fonts", "img"):
        shutil.copytree(os.path.join(RAIZ, "assets", d), os.path.join(DESTINO, "assets", d),
                        ignore=shutil.ignore_patterns(".DS_Store"))
    open(os.path.join(DESTINO, "offline.js"), "w", encoding="utf-8").write(
        OFFLINE_JS % (json.dumps(PAGS), json.dumps(ARQS)))
    open(os.path.join(DESTINO, "offline.css"), "w", encoding="utf-8").write(OFFLINE_CSS)
    open(os.path.join(DESTINO, "LEIA-ME.txt"), "w", encoding="utf-8").write(
        "Site da Asa Rent a Car, versão offline\n\n"
        "Abra index.html com dois cliques (Chrome, Safari ou Edge). Não precisa de servidor nem de internet,\n"
        "exceto para o que depende de terceiros: o mapa da página Lojas, os links de WhatsApp e do Google Maps.\n\n"
        "Mostra o site como ficaria no ar: sem o aviso de rascunho, sem as pendências em laranja e com preços\n"
        "de exemplo (tarifas do protótipo, proteção básica e taxa). As notas seguem na versão de desenvolvimento.\n"
        "As fotos de banco são da coleção gratuita do Adobe Stock, licenciadas pela Asa; onde ainda falta foto,\n"
        "aparece um painel neutro com a asa.\n"
        "A reserva funciona de ponta a ponta com dados de teste; nada é enviado a lugar nenhum.\n\n"
        "Gerado por scripts/site_offline.py, no repositório asa-design-system. Para atualizar, rode o script de novo.\n")
    print("%d páginas e %d scripts em %s" % (n_html, n_js, DESTINO))


if __name__ == "__main__":
    main()
