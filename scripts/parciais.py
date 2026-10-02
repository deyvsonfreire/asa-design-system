#!/usr/bin/env python3
"""Copia o cabeçalho e o rodapé de site/_parciais/ para todas as páginas de site/.

Cada página marca onde cada parte entra:

    <!-- parcial:cabecalho -->
    ...
    <!-- /parcial:cabecalho -->

e o script troca o que estiver entre as marcas pelo conteúdo de
site/_parciais/cabecalho.html (o mesmo para rodape). A página continua
abrindo sozinha, com o cabeçalho dentro dela; o parcial é só a fonte única.

Se a página declarar <meta name="asa:secao" content="/frota">, o link do
menu com esse endereço ganha aria-current="page".

Uso:
    python3 scripts/parciais.py           # atualiza todas
    python3 scripts/parciais.py --check   # só confere; sai com 1 se algo mudaria
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
PARCIAIS = os.path.join(SITE, "_parciais")
MARCA = re.compile(r"([ \t]*)<!-- parcial:([a-z-]+) -->.*?<!-- /parcial:\2 -->", re.S)
SECAO = re.compile(r'<meta name="asa:secao" content="([^"]+)">')


def paginas():
    for raiz, pastas, arquivos in os.walk(SITE):
        pastas[:] = [p for p in pastas if not p.startswith("_")]
        for nome in arquivos:
            if nome.endswith(".html"):
                yield os.path.join(raiz, nome)


def montar(src):
    secao = SECAO.search(src)

    def trocar(m):
        recuo, nome = m.group(1), m.group(2)
        corpo = open(os.path.join(PARCIAIS, nome + ".html"), encoding="utf-8").read().rstrip("\n")
        if secao:
            alvo = 'href="%s"' % secao.group(1)
            corpo = re.sub(r'(<a class="asa-navbar__link"[^>]*?)' + re.escape(alvo), r'\1' + alvo + ' aria-current="page"', corpo)
            corpo = re.sub(r'(<a class="asa-navdrawer__link"[^>]*?)' + re.escape(alvo), r'\1' + alvo + ' aria-current="page"', corpo)
        corpo = "\n".join((recuo + linha) if linha else linha for linha in corpo.split("\n"))
        return "%s<!-- parcial:%s -->\n%s\n%s<!-- /parcial:%s -->" % (recuo, nome, corpo, recuo, nome)

    return MARCA.sub(trocar, src)


def main():
    conferir = "--check" in sys.argv
    mudaram = []
    for p in sorted(paginas()):
        src = open(p, encoding="utf-8").read()
        novo = montar(src)
        if novo != src:
            mudaram.append(os.path.relpath(p, ROOT))
            if not conferir:
                open(p, "w", encoding="utf-8").write(novo)
    for p in mudaram:
        print(("  desatualizada " if conferir else "  atualizada ") + p)
    print("%d página(s) %s." % (len(mudaram), "fora do parcial" if conferir else "atualizada(s)"))
    if conferir and mudaram:
        sys.exit(1)


if __name__ == "__main__":
    main()
