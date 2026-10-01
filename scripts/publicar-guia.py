#!/usr/bin/env python3
"""Sincroniza o guia de parceiros com o repositório que o GitHub Pages publica.

O site https://deyvsonfreire.github.io/asa-guia-parceiros/ vem do repositório
deyvsonfreire/asa-guia-parceiros, que é uma cópia achatada de guia-parceiros/:
as páginas ficam na raiz, ao lado de css/ e assets/. Por isso os caminhos
"../css/" e "../assets/" das páginas daqui viram "css/" e "assets/" lá.

Este script copia, para um clone local daquele repositório:
  - guia-parceiros/*.html e guia.css, com os caminhos reescritos;
  - css/*.css (inclusive asa-docs.css, que o guia usa);
  - assets/img, assets/fonts e assets/downloads.
Não toca em README.md, .nojekyll nem .github/ do destino. Páginas que deixaram
de existir aqui são apagadas lá, para o site não servir versão órfã.

Uso:
    git clone https://github.com/deyvsonfreire/asa-guia-parceiros.git /caminho/do/clone
    python3 scripts/publicar-guia.py /caminho/do/clone
    cd /caminho/do/clone && git status

Depois, commit e push na main do clone: o GitHub Pages republica sozinho.
"""
import filecmp
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUIA = os.path.join(ROOT, "guia-parceiros")
PASTAS_DE_ASSETS = ("img", "fonts", "downloads")
IGNORAR = {".DS_Store"}

# Só atributos href/src e url() com "../" na frente: é a única diferença entre
# as duas árvores.
SOBE = re.compile(r'((?:href|src)=")\.\./|(url\(["\']?)\.\./')


def reescrever(texto):
    return SOBE.sub(lambda m: m.group(1) or m.group(2), texto)


def escrever_se_mudou(destino, conteudo, mudancas):
    atual = open(destino, encoding="utf-8").read() if os.path.exists(destino) else None
    if atual != conteudo:
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        open(destino, "w", encoding="utf-8").write(conteudo)
        mudancas.append(("novo" if atual is None else "alterado", os.path.relpath(destino, DEST)))


def copiar_se_mudou(origem, destino, mudancas):
    if os.path.exists(destino) and filecmp.cmp(origem, destino, shallow=False):
        return
    novo = not os.path.exists(destino)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    shutil.copy2(origem, destino)
    mudancas.append(("novo" if novo else "alterado", os.path.relpath(destino, DEST)))


def main():
    mudancas = []

    # 1. Páginas e guia.css, com os caminhos reescritos.
    paginas = sorted(f for f in os.listdir(GUIA) if f.endswith(".html"))
    for nome in paginas + ["guia.css"]:
        texto = open(os.path.join(GUIA, nome), encoding="utf-8").read()
        escrever_se_mudou(os.path.join(DEST, nome), reescrever(texto), mudancas)

    # Páginas que sumiram daqui somem de lá.
    for nome in os.listdir(DEST):
        if nome.endswith(".html") and nome not in paginas:
            os.remove(os.path.join(DEST, nome))
            mudancas.append(("removido", nome))

    # 2. Biblioteca CSS.
    for nome in sorted(os.listdir(os.path.join(ROOT, "css"))):
        if nome.endswith(".css"):
            copiar_se_mudou(os.path.join(ROOT, "css", nome), os.path.join(DEST, "css", nome), mudancas)

    # 3. Assets.
    for pasta in PASTAS_DE_ASSETS:
        base = os.path.join(ROOT, "assets", pasta)
        for raiz, _, arquivos in os.walk(base):
            for nome in arquivos:
                if nome in IGNORAR:
                    continue
                origem = os.path.join(raiz, nome)
                rel = os.path.relpath(origem, ROOT)
                copiar_se_mudou(origem, os.path.join(DEST, rel), mudancas)

    # 4. Conferência: todo href/src local das páginas precisa existir no destino.
    quebrados = []
    for nome in paginas:
        texto = open(os.path.join(DEST, nome), encoding="utf-8").read()
        for alvo in re.findall(r'(?:href|src)="([^"#?:]+)', texto):
            if alvo.startswith(("//", "mailto", "tel")) or not alvo.strip():
                continue
            if not os.path.exists(os.path.join(DEST, alvo)):
                quebrados.append((nome, alvo))

    for tipo, caminho in mudancas:
        print("  %-9s %s" % (tipo, caminho))
    print("%d arquivo(s) mudaram." % len(mudancas))
    if quebrados:
        print("\nLinks quebrados no destino:")
        for nome, alvo in quebrados:
            print("  %s -> %s" % (nome, alvo))
        sys.exit(1)
    print("Todos os links locais resolvem.")


if __name__ == "__main__":
    if len(sys.argv) != 2 or not os.path.isdir(os.path.join(sys.argv[1], ".git")):
        print(__doc__)
        sys.exit(2)
    DEST = os.path.abspath(sys.argv[1])
    main()
