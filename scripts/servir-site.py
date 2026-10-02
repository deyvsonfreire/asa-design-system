#!/usr/bin/env python3
"""Serve as páginas de site/ com as URLs de produção.

As páginas do site usam os endereços reais (/blog, /frota, /css/...), não
caminhos relativos: é o que vai para o portal. Este servidor monta essa
árvore a partir do repositório:

  /css/*     -> css/
  /assets/*  -> assets/
  /site/*    -> site/  (site.css, site.js)
  /blog      -> site/blog/index.html
  /blog/x    -> site/blog/x/index.html
  /blog/categoria/<slug>  -> o próprio hub (a categoria é lida pelo JS)

O que não existe responde 404 com site/blog/404.html (dentro do blog) ou
site/404.html. Links para páginas que ainda não foram feitas (/frota,
/lojas...) caem nesse 404: é esperado.

Uso:
    python3 scripts/servir-site.py          # http://localhost:8766/blog
    python3 scripts/servir-site.py 9000
"""
import http.server
import os
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
MONTAGENS = {"/css/": os.path.join(ROOT, "css"), "/assets/": os.path.join(ROOT, "assets"), "/site/": SITE}
HUBS = {"/blog/categoria/": "/blog"}


def resolver(caminho):
    """Devolve o arquivo que responde à URL, ou None."""
    for prefixo, pasta in MONTAGENS.items():
        if caminho.startswith(prefixo):
            alvo = os.path.join(pasta, caminho[len(prefixo):])
            return alvo if os.path.isfile(alvo) else None
    for prefixo, hub in HUBS.items():
        if caminho.startswith(prefixo):
            caminho = hub
    base = os.path.join(SITE, caminho.strip("/"))
    for alvo in (os.path.join(base, "index.html"), base + ".html", base):
        if os.path.isfile(alvo):
            return alvo
    return None


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        caminho = urllib.parse.urlsplit(self.path).path
        caminho = urllib.parse.unquote(caminho)
        if ".." in caminho:
            self.send_error(400)
            return None
        alvo = resolver(caminho)
        status = 200
        if alvo is None:
            status = 404
            secao = os.path.join(SITE, caminho.strip("/").split("/")[0], "404.html")
            alvo = secao if os.path.isfile(secao) else os.path.join(SITE, "404.html")
            if not os.path.isfile(alvo):
                self.send_error(404)
                return None
        f = open(alvo, "rb")
        self.send_response(status)
        self.send_header("Content-Type", self.guess_type(alvo))
        self.send_header("Content-Length", str(os.fstat(f.fileno()).st_size))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        return f


if __name__ == "__main__":
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    print("Site em http://localhost:%d/blog" % porta)
    http.server.ThreadingHTTPServer(("", porta), Handler).serve_forever()
