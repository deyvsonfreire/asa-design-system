#!/usr/bin/env python3
"""Valida o site/ inteiro antes de uma rodada de avaliação.

Confere, sem navegador, o que dá para conferir no HTML:

  1. Cobertura: cada copy de novo-site/copy-v2 (01 a 44) tem a página no
     endereço da ficha de SEO, e os componentes globais existem.
  2. Cabeçalho e rodapé iguais em todas as páginas (scripts/parciais.py).
  3. Por página: title (até 60, único, com a marca), meta description (até
     155, única), um H1, lang pt-BR, canonical sem www, robots das páginas
     que não indexam, JSON-LD que abre, BreadcrumbList, alt nas imagens.
  4. Links internos: todo href e src que começa com "/" aponta para algo
     que existe no repositório.
  5. 15 Composição (scripts/auditar.py): sobretítulo, fundo repetido e
     travessão têm limite zero.
  6. Guia de copy (00b): palavras e promessas proibidas no texto visível.
  7. Rascunho: página com marcação pendente abre com o aviso de rascunho;
     conta as marcações ([CONFIRMAR], [VERIFICAR], regra de hoje).

Uso:
    python3 scripts/validar_site.py                 # resumo no terminal
    python3 scripts/validar_site.py --relatorio site/VALIDACAO.md

Sai com código 1 se houver FALHA. AVISO é para ler, não trava.
"""
import glob
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from html.parser import HTMLParser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(RAIZ, "site")
COPY = os.path.join(os.path.dirname(os.path.dirname(RAIZ)), "app", "asa-identidade-visual", "novo-site", "copy-v2")
sys.path.insert(0, os.path.join(RAIZ, "scripts"))
from auditar import auditar, texto_visivel  # noqa: E402

DOMINIO = "https://asalocadora.com.br"
NAO_INDEXA = ("/reservas-online", "/minha-reserva", "/404", "/blog/404")
PROIBIDO = [
    (r"sem taxas?\b", "sem taxas"), (r"zero taxas?", "zero taxas"), (r"taxas? ocultas?", "taxas ocultas"),
    (r"sem surpresas?", "sem surpresas"), (r"monitoramos", "monitoramos seu voo"),
    (r"retirada em \d+ ?min", "retirada em X min"), (r"exclusiv[oa]s?\b", "exclusivo"),
    (r"\blíder\b", "líder"), (r"\bmergulhe\b", "mergulhe"),
    (r"\bdescubra\b", "descubra"), (r"\bdesvende\b", "desvende"), (r"experiência (?:única|incrível)", "experiência única"),
    (r"\bjornada\b", "jornada"), (r"sem complicaç", "sem complicação"), (r"de forma prática", "de forma prática"),
    (r"(?:^|[.!?]\s)Imagine\b", "Imagine…"), (r"seminov", "seminovos"), (r"Portão B\b", "Portão B"),
    (r"Mascarenhas", "Mascarenhas"), (r"3302-4400", "telefone antigo"), (r"\bagência\b", "agência"),
    (r"(?<!sem )(?<!há )\bvans?\b", "van"), (r"\butilitári", "utilitários"),
]
ATENCAO = [(r"\búnic[oa]\b", "único/única (conferir se é superlativo)"),
           (r"\b[oa] melhor\b", "o melhor (conferir se é promessa)")]
VAZIOS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr",
          "path", "line", "polyline", "polygon", "circle", "rect", "ellipse", "use", "stop"}


class ContaH1(HTMLParser):
    """Conta os H1 fora de [hidden]: estados alternativos (campanha fora de
    temporada, funil sem busca) trazem o próprio H1 escondido."""

    def __init__(self):
        super().__init__()
        self.pilha, self.visiveis, self.ocultos = [], 0, 0

    def handle_starttag(self, tag, attrs):
        oculto = "hidden" in dict(attrs) or bool(self.pilha and self.pilha[-1][1])
        if tag == "h1":
            if oculto:
                self.ocultos += 1
            else:
                self.visiveis += 1
        if tag not in VAZIOS:
            self.pilha.append((tag, oculto))

    def handle_endtag(self, tag):
        for i in range(len(self.pilha) - 1, -1, -1):
            if self.pilha[i][0] == tag:
                del self.pilha[i:]
                break
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")


def rel(p):
    return os.path.relpath(p, SITE)


def url_de(path):
    r = "/" + rel(path).replace("index.html", "").rstrip("/")
    return "/" if r == "/" else r.replace(".html", "") if r.endswith("404.html") else r


def paginas():
    out = []
    for p in sorted(glob.glob(os.path.join(SITE, "**", "*.html"), recursive=True)):
        if "/_parciais/" in p:
            continue
        out.append(p)
    return out


def existe(href):
    caminho = href.split("#")[0].split("?")[0]
    if caminho in ("", "/"):
        return os.path.exists(os.path.join(SITE, "index.html"))
    for pref, base in (("/css/", RAIZ + "/css/"), ("/assets/", RAIZ + "/assets/"), ("/site/", SITE + "/")):
        if caminho.startswith(pref):
            return os.path.exists(base + caminho[len(pref):])
    if caminho.startswith("/blog/categoria/"):
        return True
    alvo = os.path.join(SITE, caminho.strip("/"))
    return os.path.isfile(alvo) or os.path.isfile(os.path.join(alvo, "index.html"))


def cobertura(falhas, avisos):
    linhas = []
    if not os.path.isdir(COPY):
        avisos.append(("cobertura", "pasta copy-v2 não encontrada: " + COPY))
        return linhas
    for f in sorted(os.listdir(COPY)):
        m = re.match(r"(\d\d)-.*\.md$", f)
        if not m or not (1 <= int(m.group(1)) <= 44):
            continue
        txt = open(os.path.join(COPY, f), encoding="utf-8").read()
        u = re.search(r"\*\*URL:\*\*\s*(/[^\s(]*)", txt)
        url = u.group(1) if u else "?"
        ok = url != "?" and existe(url)
        linhas.append((f, url, ok))
        if not ok:
            falhas.append(("cobertura", "%s: página %s não existe" % (f, url)))
    for p in ("404.html", "_parciais/cabecalho.html", "_parciais/rodape.html"):
        ok = os.path.exists(os.path.join(SITE, p))
        linhas.append(("00-componentes-globais.md", "/" + p, ok))
        if not ok:
            falhas.append(("cobertura", "componente global ausente: " + p))
    return linhas


def checar_pagina(p, falhas, avisos, titulos, descricoes, pend):
    src = open(p, encoding="utf-8").read()
    u = url_de(p)
    nome = rel(p)
    sem_coment = re.sub(r"<!--.*?-->", "", src, flags=re.S)
    funil = u.startswith(NAO_INDEXA)

    t = re.findall(r"<title>(.*?)</title>", src, flags=re.S)
    if len(t) != 1:
        falhas.append((nome, "title: %d encontrados" % len(t)))
    else:
        t = t[0].strip()
        titulos[t].append(nome)
        if len(t) > 60:
            falhas.append((nome, "title com %d caracteres (máx. 60)" % len(t)))
        if "Asa Locadora" not in t:
            falhas.append((nome, "title sem a marca: " + t))
        elif not funil and not t.endswith("| Asa Locadora"):
            avisos.append((nome, "title não termina em '| Asa Locadora'"))

    d = re.search(r'<meta name="description" content="([^"]*)"', src)
    if not d:
        (avisos if funil else falhas).append((nome, "sem meta description"))
    else:
        descricoes[d.group(1)].append(nome)
        if len(d.group(1)) > 155:
            falhas.append((nome, "meta description com %d caracteres (máx. 155)" % len(d.group(1))))

    conta = ContaH1()
    conta.feed(sem_coment)
    if conta.visiveis != 1:
        if funil and (conta.visiveis > 1 or conta.ocultos):
            avisos.append((nome, "%d H1 visíveis e %d ocultos: o JS escolhe o estado (conferir no navegador)"
                           % (conta.visiveis, conta.ocultos)))
        else:
            falhas.append((nome, "%d H1 visíveis" % conta.visiveis))
    if 'lang="pt-BR"' not in src:
        falhas.append((nome, "sem lang=pt-BR"))

    robots = re.search(r'<meta name="robots" content="([^"]*)"', src)
    noindex = bool(robots and "noindex" in robots.group(1))
    if funil and not noindex:
        falhas.append((nome, "deveria ter noindex"))
    can = re.search(r'<link rel="canonical" href="([^"]*)"', src)
    if not noindex:
        if not can:
            falhas.append((nome, "sem canonical"))
        elif "www." in can.group(1):
            falhas.append((nome, "canonical com www"))
        elif can.group(1).rstrip("/") != (DOMINIO + u).rstrip("/"):
            avisos.append((nome, "canonical %s difere do endereço %s" % (can.group(1), u)))

    tipos = []
    for bloco in re.findall(r'<script type="application/ld\+json">(.*?)</script>', src, flags=re.S):
        try:
            dado = json.loads(bloco)
        except ValueError as e:
            falhas.append((nome, "JSON-LD inválido: %s" % e))
            continue
        tipos += re.findall(r'"@type":\s*"([^"]+)"', json.dumps(dado))
        if "aggregateRating" in bloco:
            falhas.append((nome, "aggregateRating no JSON-LD (00b proíbe)"))
    if not noindex and u != "/" and "BreadcrumbList" not in tipos:
        avisos.append((nome, "sem BreadcrumbList"))

    for img in re.findall(r"<img\b[^>]*>", sem_coment):
        if "alt=" not in img:
            falhas.append((nome, "imagem sem alt: " + img[:80]))

    for href in re.findall(r'(?:href|src)="(/[^"]*)"', sem_coment):
        if href.startswith("//"):
            continue
        if not existe(href):
            if re.match(r"/blog/[a-z0-9-]+$", href):
                avisos.append((nome, "artigo do blog ainda não publicado (pauta ou URL antiga, A6 e T7): " + href))
            else:
                falhas.append((nome, "link interno quebrado: " + href))

    r = auditar(p)
    for chave in ("sobretitulos", "fundos_iguais_seguidos", "travessoes"):
        if r[chave]:
            falhas.append((nome, "%s: %d (limite 0)" % (chave, r[chave])))

    vis = texto_visivel(src)
    vis = re.sub(r"\[(?:CONFIRMAR|VERIFICAR|AUTORIZAÇÃO)[^\]]*\]", " ", vis)
    for rx, rot in PROIBIDO:
        for m in re.finditer(rx, vis, flags=re.I):
            falhas.append((nome, "proibido (00b) '%s': …%s…" % (rot, vis[max(0, m.start() - 40):m.end() + 30].strip())))
    for rx, rot in ATENCAO:
        for m in re.finditer(rx, vis, flags=re.I):
            avisos.append((nome, "%s: …%s…" % (rot, vis[max(0, m.start() - 40):m.end() + 30].strip())))
    if EMOJI.search(vis):
        falhas.append((nome, "emoji no texto"))

    c = {
        "confirmar": len(re.findall(r"\[CONFIRMAR", sem_coment)),
        "verificar": len(re.findall(r"\[VERIFICAR", sem_coment)),
        "hoje": len(re.findall(r"regra dos termos publicados hoje no site", sem_coment)),
    }
    pend[u] = c
    if sum(c.values()) and "Rascunho para revisão" not in src:
        falhas.append((nome, "tem marcação pendente e não abre com o aviso de rascunho"))
    return u


def main():
    falhas, avisos = [], []
    cob = cobertura(falhas, avisos)

    parc = subprocess.run([sys.executable, os.path.join(RAIZ, "scripts", "parciais.py"), "--check"],
                          capture_output=True, text=True, cwd=RAIZ)
    fora = re.search(r"(\d+) página\(s\) fora do parcial", parc.stdout)
    if not fora or fora.group(1) != "0":
        falhas.append(("parciais", parc.stdout.strip() or parc.stderr.strip()))

    titulos, descricoes, pend = defaultdict(list), defaultdict(list), {}
    urls = [checar_pagina(p, falhas, avisos, titulos, descricoes, pend) for p in paginas()]
    for t, ps in titulos.items():
        if len(ps) > 1:
            falhas.append(("title repetido", "%s: %s" % (t, ", ".join(ps))))
    for d, ps in descricoes.items():
        if len(ps) > 1:
            avisos.append(("description repetida", ", ".join(ps)))

    tot = Counter()
    for c in pend.values():
        tot.update(c)

    linhas = ["# Validação do site", "",
              "Gerado por `scripts/validar_site.py`. %d páginas, %d copys conferidas." % (len(urls), len([c for c in cob if c[0][:2] != "00"])), "",
              "**Resultado:** %s · %d falha(s) · %d aviso(s)" % ("APROVADO" if not falhas else "REPROVADO", len(falhas), len(avisos)), "",
              "## Cobertura da copy", "", "| Copy | Endereço | Página |", "|---|---|---|"]
    linhas += ["| %s | `%s` | %s |" % (f, u, "ok" if ok else "**falta**") for f, u, ok in cob]
    linhas += ["", "## Falhas", ""] + (["- **%s**: %s" % f for f in falhas] or ["Nenhuma."])
    linhas += ["", "## Avisos", ""] + (["- **%s**: %s" % a for a in avisos] or ["Nenhum."])
    linhas += ["", "## Marcações pendentes por página", "",
               "Em produção, nenhuma vai ao ar: a frase fica oculta até a confirmação (00c).", "",
               "| Página | [CONFIRMAR] | [VERIFICAR] | Regra de hoje (termos) |", "|---|---:|---:|---:|"]
    for u in sorted(pend, key=lambda k: -sum(pend[k].values())):
        c = pend[u]
        if sum(c.values()):
            linhas.append("| `%s` | %d | %d | %d |" % (u, c["confirmar"], c["verificar"], c["hoje"]))
    linhas.append("| **Total** | **%d** | **%d** | **%d** |" % (tot["confirmar"], tot["verificar"], tot["hoje"]))
    relatorio = "\n".join(linhas) + "\n"

    if "--relatorio" in sys.argv:
        destino = sys.argv[sys.argv.index("--relatorio") + 1]
        open(destino, "w", encoding="utf-8").write(relatorio)
        print("Relatório em", destino)
    print("%d páginas · %d falha(s) · %d aviso(s) · pendências: %d CONFIRMAR, %d VERIFICAR, %d regras de hoje"
          % (len(urls), len(falhas), len(avisos), tot["confirmar"], tot["verificar"], tot["hoje"]))
    for f in falhas:
        print("FALHA", *f)
    for a in avisos:
        print("AVISO", *a)
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
