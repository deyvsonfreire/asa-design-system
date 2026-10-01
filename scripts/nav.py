#!/usr/bin/env python3
"""Regenera o bloco de navegação (<div class="asa-doc-nav__list">) de todas as
páginas da documentação e do guia de parceiros.

A navegação é markup estático, repetido em cada página, para funcionar sem
JS. Mudar um item na mão em 30 arquivos é convite a erro; este script
reescreve o bloco inteiro a partir de uma lista só.

Uso, a partir da raiz do repositório:
    python3 scripts/nav.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PRINCIPAL = [
    ("index.html", "00 Início"),
    ("01-fundamentos.html", "01 Fundamentos"),
    ("02-grid.html", "02 Grid"),
    ("03-cor.html", "03 Cor"),
    ("04-tipografia.html", "04 Tipografia"),
    ("05-icones.html", "05 Ícones"),
    ("06-componentes.html", "06 Componentes"),
    ("07-hierarquia.html", "07 Hierarquia"),
    ("08-fluxo-reserva.html", "08 Fluxo de reserva"),
    ("09-seguranca.html", "09 Segurança"),
    ("10-tokens.html", "10 Tokens"),
    ("11-movimento.html", "11 Movimento"),
    ("12-app-nativo.html", "12 App nativo"),
    ("13-roadmap.html", "13 Roadmap"),
    ("14-downloads.html", "14 Downloads"),
    ("15-composicao.html", "15 Composição"),
]

# O guia de parceiros não publica o roadmap (13) e renomeia 09 e 10 para o
# público externo.
PARCEIROS = [
    ("index.html", "00 Início"),
    ("01-fundamentos.html", "01 Fundamentos"),
    ("02-grid.html", "02 Grid"),
    ("03-cor.html", "03 Cor"),
    ("04-tipografia.html", "04 Tipografia"),
    ("05-icones.html", "05 Ícones"),
    ("06-componentes.html", "06 Componentes"),
    ("07-hierarquia.html", "07 Hierarquia"),
    ("08-fluxo-reserva.html", "08 Fluxo de reserva"),
    ("09-seguranca.html", "09 Confiança"),
    ("10-tokens.html", "10 Referência"),
    ("11-movimento.html", "11 Movimento"),
    ("12-app-nativo.html", "12 App nativo"),
    ("14-downloads.html", "14 Downloads"),
    ("15-composicao.html", "15 Composição"),
]

# Páginas que recebem a navegação do guia sem aparecer nela (a 13 do guia é
# uma nota curta, alcançada só pelo link "Anterior" da 14).
PARCEIROS_EXTRA = ["13-roadmap.html"]

PAT = re.compile(r'(<div class="asa-doc-nav__list">)(.*?)(</div>)', re.S)


def regenerate(folder, pages, extra=()):
    for fname in [f for f, _ in pages] + list(extra):
        path = os.path.join(folder, fname)
        if not os.path.exists(path):
            print("  ausente:", path)
            continue
        src = open(path, encoding="utf-8").read()
        links = "\n".join(
            '      <a href="%s"%s>%s</a>' % (f, ' aria-current="page"' if f == fname else "", t)
            for f, t in pages
        )
        new, n = PAT.subn(lambda m: m.group(1) + "\n" + links + "\n    " + m.group(3), src, count=1)
        if n != 1:
            print("  sem bloco de navegação:", path)
            continue
        if new != src:
            open(path, "w", encoding="utf-8").write(new)
            print("  ok:", os.path.relpath(path, ROOT))


if __name__ == "__main__":
    print("principal")
    regenerate(ROOT, PRINCIPAL)
    print("guia-parceiros")
    regenerate(os.path.join(ROOT, "guia-parceiros"), PARCEIROS, PARCEIROS_EXTRA)
    sys.exit(0)
