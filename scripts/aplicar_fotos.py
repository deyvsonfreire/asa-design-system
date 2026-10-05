#!/usr/bin/env python3
"""Troca os placeholders de foto (.asa-photo com o briefing) pelas fotos de
site/fotos.json.

Cada entrada de site/fotos.json diz a imagem do briefing (item de
BRIEFING-FOTOS.md), o arquivo em site/img/fotos/, a fonte e a licença, e as
legendas exatas dos placeholders que ela substitui. O placeholder mantém a
caixa (classes, proporção, corte); entra um <img> com o alt que estava no
aria-label, e o briefing fica num comentário logo depois, para a troca pela
foto própria. Rodar de novo não duplica: só troca o que ainda é placeholder.

Uso:
    python3 scripts/aplicar_fotos.py            # aplica e mostra quantas trocou
    python3 scripts/aplicar_fotos.py --check    # só conta o que falta aplicar
"""
import glob
import html
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(RAIZ, "site")

FOTO = re.compile(
    r'<(div|figure)\b([^>]*\bclass="[^"]*\basa-photo\b[^"]*"[^>]*)>'
    r'\s*<span class="asa-photo__caption">(.*?)</span>\s*</\1>', re.S)


def main():
    fotos = json.load(open(os.path.join(SITE, "fotos.json"), encoding="utf-8"))
    por_legenda = {}
    for f in fotos:
        for leg in f["legendas"]:
            por_legenda[leg] = f
    so_conta = "--check" in sys.argv
    total, paginas = 0, 0

    for p in sorted(glob.glob(os.path.join(SITE, "**", "*.html"), recursive=True)):
        if "_parciais" in p:
            continue
        src = open(p, encoding="utf-8").read()
        n = [0]

        def troca(m):
            tag, attrs, cap = m.group(1), m.group(2), m.group(3)
            leg = html.unescape(re.sub(r"<[^>]+>", "", cap)).strip()
            f = por_legenda.get(leg)
            if not f:
                return m.group(0)
            n[0] += 1
            # O alt descreve a foto escolhida (site/fotos.json), não o briefing.
            alt = html.escape(f.get("alt") or f["imagem"], quote=True)
            novo = re.sub(r'\s(role="img"|aria-label="[^"]*")', "", attrs)
            extra = " site-foto--inteira" if f.get("ajuste") == "inteira" else ""
            novo = novo.replace('class="', 'class="site-foto%s ' % extra, 1)
            novo += ' data-foto="%s"' % f["item"]
            # A abertura da home é a maior imagem da página (LCP): carrega já.
            carga = 'loading="eager" fetchpriority="high"' if "hero" in leg else 'loading="lazy"'
            # Foto vertical em caixa deitada: o enquadramento escolhe a faixa que aparece.
            if f.get("posicao"):
                carga += ' style="object-position:%s"' % f["posicao"]
            return ('<%s%s><img src="%s" alt="%s" width="%d" height="%d" %s decoding="async">'
                    '<!-- foto %s: %s (%s). Briefing original: %s --></%s>'
                    % (tag, novo, f["arquivo"], alt, f["largura"], f["altura"], carga,
                       f["item"], f["fonte"], f["licenca"], leg.replace("--", "-"), tag))

        novo_src = FOTO.sub(troca, src)
        if n[0]:
            total += n[0]
            paginas += 1
            if not so_conta:
                open(p, "w", encoding="utf-8").write(novo_src)
    acao = "a aplicar" if so_conta else "trocadas"
    print("%d fotos %s em %d páginas" % (total, acao, paginas))


if __name__ == "__main__":
    main()
