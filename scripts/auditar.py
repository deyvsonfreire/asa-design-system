#!/usr/bin/env python3
"""Conta, numa página HTML, o que o checklist de 15-composicao.html manda contar.

É uma contagem estática sobre o markup (sem navegador), feita para pegar os
vícios de template que nenhuma regra de componente pega: caixa alta
espalhada, sobretítulo, ícone decorativo, card em tudo, fundos iguais em
sequência, marca d'água repetida, falta de foto e travessão no texto.

Uso:
    python3 scripts/auditar.py asa-home-v2/index.html
    python3 scripts/auditar.py 06-componentes.html 08-fluxo-reserva.html

Os limites são os de 15 Composição. "Acima do limite" é motivo para
reconstruir a seção, não para discutir.
"""
import html as htmllib
import re
import sys
from html.parser import HTMLParser

LIMITES = {
    "caixa_alta": "H1, etiquetas (.asa-tag), preços e placas; nada mais",
    "sobretitulos": "0",
    "icones_fora_de_controle": "só em botão, menu e lista com mais de cinco itens",
    "cards_com_borda": "só onde há produto para comparar",
    "fundos_iguais_seguidos": "0",
    "marcas_dagua": "1",
    "secoes_sem_foto": "0 entre as faixas que falam de lugar, carro ou gente",
    "travessoes": "0",
}

# Classes que podem estar em caixa alta por regra do sistema.
CAIXA_ALTA_PERMITIDA = ("asa-tag", "asa-price__value", "asa-numberplate__value", "asa-display", "t-display", "t-plate")

# Classes de "card com borda" do sistema e dos protótipos.
# Só a classe do bloco conta (asa-card-article), nunca os elementos BEM
# dele (asa-card-article__title): um card é um elemento, não seis.
CARD = re.compile(r'class="[^"]*?(?<![\w-])(asa-card(?:-[a-z]+)?|asa-doc-card|border-\[1\.5px\])(?![\w-])')

# Fundos de faixa (sistema e protótipo em Tailwind).
FUNDO = re.compile(r'class="[^"]*\b(asa-bg-(surface|white|mist|dense|deep)|asa-doc-section--(yellow|white|mist|dense)|bg-\[#[0-9A-Fa-f]{6}\]|bg-white)\b')


CONTROLE = {"button", "a", "summary", "label", "nav"}
MENSAGEM = ("asa-field__error", "asa-alert", "asa-combobox__option")
VAZIOS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr",
          "path", "circle", "line", "polyline", "polygon", "rect", "ellipse"}


class _Pilha(HTMLParser):
    """Percorre a página com a pilha de elementos abertos. Na primeira
    passada só mede cada lista; na segunda, com o tamanho final de cada
    lista já sabido, conta os svg sem ancestral permitido."""

    def __init__(self, tamanhos=None):
        super().__init__()
        self.pilha, self.soltos = [], 0
        self.tamanhos = tamanhos
        self.medidos, self.listas = [], 0

    def handle_starttag(self, tag, attrs):
        if tag == "svg" and self.tamanhos is not None and not self._permitido():
            self.soltos += 1
        if tag in VAZIOS:
            return
        item = [tag, dict(attrs).get("class") or "", None]
        if tag in ("ul", "ol"):
            item[2] = self.listas
            self.listas += 1
            self.medidos.append(0)
        if tag == "li":
            for el in reversed(self.pilha):
                if el[0] in ("ul", "ol"):
                    self.medidos[el[2]] += 1
                    break
        self.pilha.append(item)

    def handle_startendtag(self, tag, attrs):
        if tag == "svg" and self.tamanhos is not None and not self._permitido():
            self.soltos += 1

    def handle_endtag(self, tag):
        for i in range(len(self.pilha) - 1, -1, -1):
            if self.pilha[i][0] == tag:
                del self.pilha[i:]
                break

    def _permitido(self):
        for tag, cls, lista in self.pilha:
            if tag in CONTROLE or any(c in cls for c in MENSAGEM):
                return True
            if lista is not None and self.tamanhos[lista] > 5:
                return True
        return False


def icones_soltos(corpo):
    medida = _Pilha()
    medida.feed(corpo)
    conta = _Pilha(medida.medidos)
    conta.feed(corpo)
    return conta.soltos

def texto_visivel(src):
    src = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", src, flags=re.S | re.I)
    # O endereço (NAP) é cópia literal do Google Business Profile, com o
    # traço do nome oficial do aeroporto; não é texto escrito pela marca.
    src = re.sub(r"<address\b[^>]*>.*?</address>", " ", src, flags=re.S | re.I)
    src = re.sub(r"<!--.*?-->", " ", src, flags=re.S)
    src = re.sub(r"<[^>]+>", " ", src)
    return htmllib.unescape(src)


def secoes(src):
    """Divide a página nas faixas de nível de página (section de primeiro nível)."""
    partes = re.split(r"(?=<section\b)", src)
    return [p for p in partes if p.lstrip().startswith("<section")]


def auditar(path):
    src = open(path, encoding="utf-8").read()
    corpo = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", src, flags=re.S | re.I)
    r = {}

    # 1. Caixa alta: text-transform inline, classes utilitárias e Registro 1 fora do permitido.
    upper = re.findall(r'<([a-z0-9]+)\b([^>]*)>', corpo)
    n = 0
    for tag, attrs in upper:
        if "uppercase" in attrs or "text-transform:uppercase" in attrs.replace(" ", ""):
            if not any(c in attrs for c in CAIXA_ALTA_PERMITIDA):
                n += 1
    r["caixa_alta"] = n

    # 2. Sobretítulos: texto curto (<= 40 caracteres) imediatamente antes de um h2/h3.
    sobre = re.findall(r"<(?:span|p|small)\b[^>]*>([^<]{1,40})</(?:span|p|small)>\s*<h[23]\b", corpo)
    r["sobretitulos"] = len(sobre)

    # 3. Ícones fora de controle: svg sem um ancestral de controle (botão,
    #    link, summary, label, nav), de mensagem (erro de campo, alerta) ou de
    #    lista longa (li de uma lista com mais de cinco itens).
    r["icones_fora_de_controle"] = icones_soltos(corpo)

    # 4. Cards com borda.
    r["cards_com_borda"] = len(CARD.findall(corpo))

    # 5. Fundos iguais em sequência e seções sem foto.
    fundos, sem_foto = [], 0
    for sec in secoes(corpo):
        # O fundo da faixa é o da própria tag <section>, não o de um filho.
        tag = re.match(r"<section\b[^>]*>", sec)
        m = FUNDO.search(tag.group(0)) if tag else None
        fundos.append(m.group(1) if m else "padrão")
        if not re.search(r"<img\b|asa-figure|asa-photo|sk--photo", sec):
            sem_foto += 1
    iguais = sum(1 for a, b in zip(fundos, fundos[1:]) if a == b)
    r["fundos_iguais_seguidos"] = iguais
    r["secoes_sem_foto"] = sem_foto
    r["_fundos"] = fundos

    # 6. Marca d'água.
    r["marcas_dagua"] = len(re.findall(r"asa-watermark", corpo))

    # 7. Travessões no texto visível (intervalo numérico 72–120 é permitido;
    #    <address> fica de fora, ver texto_visivel).
    t = texto_visivel(src)
    r["travessoes"] = len(re.findall(r"—|(?<![0-9])–(?![0-9])", t))

    return r


def imprimir(path, r):
    print(path)
    for chave, limite in LIMITES.items():
        print("  %-26s %5d   limite: %s" % (chave, r[chave], limite))
    print("  %-26s %s" % ("fundos, em ordem", " > ".join(r["_fundos"]) or "nenhuma section"))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    for p in sys.argv[1:]:
        imprimir(p, auditar(p))
        print()
