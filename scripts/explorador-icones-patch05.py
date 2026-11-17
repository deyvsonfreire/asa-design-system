import sys
p = sys.argv[1]
t = open(p, encoding="utf-8").read()
if 'id="explorador"' in t: print("já aplicado"); sys.exit()
SEC = '''<section class="asa-doc-section asa-doc-section--white" id="explorador">
  <div class="asa-doc-section__inner">
    <span class="asa-doc-section__label">Explorador</span>
    <h2>Todos os ícones, com o <em>ajuste</em> na hora.</h2>
    <p class="asa-doc-section__lead">As duas bibliotecas oficiais num lugar só: Sistema, para site, app e Central, e Peças, para posts, anúncios e impressos. Mude tamanho, traço, cor e fundo e veja o resultado em todos os ícones. Os controles só vão até onde a marca permite, e o aviso diz quando a combinação sai da regra. Clique num ícone para selecionar; em Detalhes, baixe o SVG ou o PNG, ou copie o código.</p>
    <div class="asa-ix" id="asa-ix"><noscript><p>O explorador precisa de JavaScript. Os arquivos estão em 14 · Downloads.</p></noscript></div>
  </div>
</section>

'''
anchor = '<section class="asa-doc-section asa-doc-section--white" id="conjunto">'
assert t.count(anchor) == 1
t = t.replace(anchor, SEC + anchor)
css = '<link rel="stylesheet" href="css/asa-docs.css">'
assert t.count(css) == 1
t = t.replace(css, css + '\n<link rel="stylesheet" href="css/asa-docs-icones.css">')
assert t.count("</body>") == 1
t = t.replace("</body>", '<script src="assets/js/asa-icones-dados.js"></script>\n<script src="assets/js/asa-icones-explorador.js"></script>\n</body>')
open(p, "w", encoding="utf-8").write(t)
print("ok")
