# Pendências e decisões do novo site

O que ficou em aberto nas páginas já construídas em `site/`. É a lista de trabalho para os ajustes gerais: cada item diz o que falta, quem responde, onde aparece e, quando há, a evidência que já encontramos.

Os códigos entre parênteses (C7, J1, O1...) são os de `novo-site/copy-v2/00c-perguntas-para-a-asa.md`. O item que já está lá não é repetido aqui; esta lista só acrescenta o que as páginas revelaram.

**Páginas cobertas:** componentes globais (cabeçalho, rodapé, WhatsApp, busca, 404), blog e modelo de artigo, Relações com Investidores, Política de Privacidade, Termos e Condições, Quem somos, Contato, Ofertas, Primeira locação, as campanhas de Carnaval, São João e Réveillon, Regras de locação, Assistência 24h, Prevenção a fraudes e Acessibilidade.

**Regra de publicação:** nenhuma marcação vai ao ar. Nas páginas em rascunho (RI, Privacidade, Termos, Quem somos, Contato, as cinco de ofertas e as quatro de ajuda), cada pendência aparece em laranja na tela e um aviso abre a página. Nas outras, ela fica em comentário no HTML.

---

## 1. Decisões que travam o texto

Cada uma tem duas versões possíveis, e as duas não podem conviver no site.

| # | Decisão | O que encontramos | Onde muda | Quem decide |
|---|---|---|---|---|
| D1 | **Regra de cancelamento** (C7) | A copy e a reserva online dizem "grátis até 24h antes". Os termos publicados hoje em asalocadora.com.br cobram multa em todo cancelamento: devolvem 70% com mais de 48h, 60% entre 24h e 48h e 30% com menos de 24h ou não comparecimento. | Termos (seção 9 e resumo), busca (linha "Cancele grátis até 24h"), blog, home, Regras de locação (seção de cancelamento), as cinco páginas de ofertas (faixa do que toda locação tem, regras do BEMVINDOASA, cuidados das campanhas) | Diretoria + jurídico |
| D2 | **Razão social e CNPJ** (J1) | Além dos dois valores em conflito na fonte de verdade, a escritura da 1ª emissão de debêntures, registrada na JUCEPE em 07/12/2023 e publicada na própria página de RI, traz **Companhia Asa Rent a Car Locação de Veículos S.A.**, CNPJ **07.005.206/0001-53**. É um terceiro valor. | Rodapé, Termos (seção 1), Privacidade (seção 1), RI, schema `Organization` | Diretoria |
| D3 | **A Asa é franquia?** | Os termos publicados hoje identificam a locadora como "empresa definida no Documento de Locação, na qualidade de Sociedade Franqueada". | Termos, Privacidade (quem é o controlador), Quem somos | Diretoria + jurídico |
| D4 | **Nota do Google: qual número mostrar** | A regra até aqui é o par fixo 4,7 (Google) e 9,4 (Reclame Aqui). No Google Business Profile, em 02/10/2026: Recife 4,7 com 4.767 avaliações, Fortaleza 4,9 com 3.718, e as duas juntas dão 4,8 com 8.485. A copy pede o valor puxado da API, com data, e que ele suma se a API falhar. | Quem somos (faixa preta), home, páginas de aeroporto | Marketing |
| D5 | **WhatsApp é botão amarelo ou vermelho na página de Contato** | O sistema reserva o vermelho para a ação principal e põe o WhatsApp em amarelo (secundário). Na página de Contato, a copy chama o WhatsApp de "CTA primário". Fiz em amarelo, e o vermelho ficou com "Enviar mensagem". | Contato. Nas páginas de ajuda (Regras, Fraudes, Acessibilidade) o WhatsApp é a única ação do fechamento e saiu em vermelho; na Assistência, o vermelho é o Ligar e o WhatsApp sai em contorno | Marketing |
| D6 | **Banner de cookies: qual versão vale** | `00-componentes-globais.md` define três tipos (Necessários, Medição, Publicidade) e os botões Aceitar todos, Somente necessários e Configurar. A copy da Privacidade trazia quatro tipos (com Preferências) e os botões Recusar opcionais e Personalizar. A política foi escrita pela versão dos componentes globais. | Privacidade (seção 8), banner | Marketing + jurídico |
| D7 | **Domínio com ou sem www** (M2) | O site atual e as fichas do Google usam `asalocadora.com.br`, sem www. O JSON-LD da copy de Contato usa `www`. As páginas foram feitas sem www. | canonical e schema de todas as páginas | Marketing / dev |
| D8 | **Nome das lojas** | As fichas no Google se chamam "ASA Locadora - Aeroporto do Recife" (ASA em caixa alta) e "Asa Locadora - Aeroporto de Fortaleza". O rodapé usava "Asa Rent a Car · Aeroporto do Recife". Sugestão: padronizar a ficha de Recife para "Asa Locadora - Aeroporto do Recife" e usar esse nome no site. | Rodapé, Contato, Lojas, schema `AutoRental` | Marketing |
| D9 | **Frota: a tabela de 15 grupos está atual?** | As avaliações de Fortaleza de setembro citam Nissan Kicks, VW Polo automático e Fiat Argo, que não estão na tabela de grupos da fonte de verdade. | Frota, blog (artigo de Porto de Galinhas), Quem somos ("15 grupos") | Operação |
| D10 | **Vitrine de ofertas sem validade** (C5, C6) | A copy manda: card sem validade confirmada não vai ao ar, e "Por tempo indeterminado" só se for verdade. Hoje nenhuma das duas ofertas tem validade, então `/ofertas` iria ao ar no estado vazio ("No momento não há oferta ativa"). | Ofertas, Primeira locação | Comercial + marketing |
| D11 | **"Mais um dia" depende de pagamento antecipado?** | No site atual, a oferta "Adicione mais um dia na sua locação e economize até 15% na diária" vem com a nota "Valores para pagamento antecipado". A copy nova não fala disso. Se o desconto exige pagar antes, isso é regra do card. | Ofertas (regras do card), Réveillon (alta temporada) | Comercial |
| D12 | **Estrada sem pavimentação: pode ou não?** | Os termos publicados hoje proíbem usar o carro "em estradas sem pavimentação". Ao mesmo tempo, a copy e as páginas sugerem carro para areia: a picape 4x4 "para trechos de areia" no Réveillon, o acesso a Jericoacoara, e o exemplo do card de veículo em 06 Componentes ("altura livre para estrada de areia"). | Réveillon, Regras de locação (durante a locação), páginas de Jericoacoara, 06 Componentes | Operação + jurídico |
| D13 | **Roubo e furto: o que o cliente paga** | Os termos de hoje dizem que o cliente responde pelo valor integral do carro em caso de perda total, furto ou roubo, "independentemente da culpa". Isso precisa conversar com o que as proteções cobrem, antes de qualquer página falar de roubo. | Assistência 24h (situações comuns), Termos, Proteções e taxas | Jurídico |

## 2. Dados da empresa a confirmar

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| E1 | E-mail de contato oficial (J2). A copy indica contato@asalocadora.com.br; os termos de hoje usam reservas2@asalocadora.com.br. | Rodapé, Contato, Termos | Diretoria |
| E2 | Horário do atendimento remoto no WhatsApp (O15) | Menu do celular, botão do WhatsApp, Contato | Operação |
| E3 | Formulário de contato: para onde vai (e-mail, CRM) e prazo de resposta | Contato | Operação + dev |
| E4 | Encarregado de dados (DPO): nome, e-mail e prazo de resposta a pedidos (J2) | Privacidade (seções 10 e 11), banner de cookies | Jurídico |
| E5 | Perfil do Facebook (J4) | Rodapé, Contato | Marketing |
| E6 | WhatsApps regionais (J3) e a lista oficial de canais que a Asa usa | Contato (alerta de golpe), Prevenção a fraudes | Diretoria |
| E7 | Contato de RI: área ou responsável, e-mail, telefone institucional (J6) | RI | Diretoria |
| E8 | Governança publicável: conselho, auditoria, código de conduta, canal de integridade. Sem isso, o bloco não vai ao ar. | RI | Diretoria |
| E9 | Certidões para contratação pública entram na página de RI? | RI | Diretoria |
| E10 | Data e número de versão da Privacidade e dos Termos aprovados | Privacidade, Termos | Jurídico |

## 3. Regras de locação a confirmar

Os itens marcados como "termos de hoje" já estão escritos nas páginas com a regra publicada hoje em asalocadora.com.br, em laranja, esperando confirmação.

| # | Regra | Situação | Onde |
|---|---|---|---|
| R1 | Depois das 27 horas (C8) | Termos de hoje: nova diária completa depois dos 180 minutos de cortesia | Termos, exemplo de horário das três campanhas |
| R2 | Combustível (O7) | Termos de hoje: sai com tanque cheio, volta cheio, o que faltar é cobrado por litro | Termos |
| R3 | Limpeza (O7) | Termos de hoje: taxa por sujeira excessiva ou cheiro de cigarro | Termos |
| R4 | Multas (O7) | Termos de hoje: taxa de administração de R$ 70,00 por infração | Termos |
| R5 | Prazo de liberação da caução (C3) | Termos de hoje: até 60 dias, dependendo do banco | Termos |
| R6 | Condutor estrangeiro (O2) | Termos de hoje: habilitação do país de origem por até 180 dias da entrada no Brasil | Termos |
| R7 | Uso proibido e áreas de circulação (O9) | Termos de hoje: proíbem fins comerciais, carga, competições, estradas sem pavimentação (D12), direção sob efeito de álcool ou drogas e fins ilícitos; circulação só no território nacional, fora dele com autorização por escrito | Termos, Regras de locação |
| R8 | Falta de carro do grupo reservado (O10) | Em aberto | Termos |
| R9 | Devolução antecipada e reembolso | Em aberto | Termos |
| R10 | Remoção e guincho | Termos de hoje: "Não sendo pane elétrica ou defeito mecânico, a LOCADORA arcará com os custos de remoção em um raio de 100km da loja mais próxima." A frase é ambígua e ficou fora da página | Assistência 24h |
| R11 | Boletim de ocorrência | Termos de hoje: comunicar a polícia e a Asa e entregar o BO em até 24 horas | Assistência 24h |
| R12 | Condutor adicional | Termos de hoje: até 3 condutores adicionais, com custo por condutor | Regras de locação |
| R13 | Não comparecimento | Termos de hoje: devolvem 30% (multa de 70%); faz parte de D1 | Regras de locação, Termos |
| R14 | Prorrogação | Termos de hoje: contratada antes do fim, e pode sair por outra tarifa | Regras de locação |
| R15 | Devolução em outra loja (O8) | Termos de hoje: cobram uma "Taxa de Retorno" | Regras de locação |
| R16 | Divergência de vistoria | Termos de hoje: sem a assinatura do check-list de devolução, o cliente não pode questionar depois a vistoria. Pede revisão jurídica | Regras de locação |
| R17 | Objetos esquecidos | Termos de hoje: a Asa não se responsabiliza por objetos deixados no carro | Regras de locação |
| R18 | Chave, documento e placa perdidos | Termos de hoje: não são cobertos pela proteção | Assistência 24h |

As demais regras dos Termos (parcelamento, Pix, no-show, devolução em outra loja, nº do voo, tabela de caução, coberturas das proteções) já estão em 00c (C1, C3, C4, C7, O4, O8).

## 3b. Ofertas e campanhas a confirmar

A mecânica do BEMVINDOASA (C5), do "mais um dia" (C6), das campanhas (C12), o voo atrasado (O4), a devolução em outra loja (O8) e o pré-cadastro (O13) já estão em 00c. Aqui fica o que as páginas acrescentaram.

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| F1 | **Onde o cupom vale e o que ele muda:** só no site ou também no 0800, no WhatsApp e no balcão; se o desconto muda a caução; se vale no aluguel mensal; se volta a valer quando a reserva é cancelada; se serve para reservar para outra pessoa | Ofertas (dúvidas), Primeira locação (regras e dúvidas) | Comercial |
| F2 | **Operação na temporada:** grupos que esgotam primeiro no Carnaval, no São João e no fim de ano; faixas de horário de pico do balcão em Recife e em Fortaleza; período de maior ocupação no fim de ano | Carnaval, São João, Réveillon | Operação |
| F3 | **Cupom no motor de reservas:** a lista de códigos válidos, a resposta para código inválido, expirado e para o BEMVINDOASA usado por quem já alugou (como o sistema reconhece a primeira locação) | Busca de todas as páginas de oferta | Comercial + dev |
| F4 | **Onde vale cada campanha:** o São João vale também em Fortaleza? O Carnaval vale nas duas praças? | São João, Carnaval | Comercial |
| F5 | **Próxima edição:** pelo calendário, a próxima é o Réveillon 2026/2027. A página está pronta; falta a mecânica (C12) para ligar a campanha, trocar para index e pôr o card na vitrine | Réveillon, Ofertas | Marketing + comercial |

## 3c. Ajuda: assistência, fraudes e acessibilidade

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| S1 | **Assistência:** os serviços (reboque, socorro mecânico, chaveiro, troca de pneu, carro reserva), a área de cobertura, se há protocolo, se todos os carros têm triângulo e macaco, a regra para conserto ou guincho contratado pelo cliente e o reembolso, e o procedimento e a cobrança em pneu, bateria, pane seca, chave e roubo | Assistência 24h | Operação |
| S2 | **Número da assistência:** o 0800 080 0015 atende a assistência ou existe um número da seguradora ou da empresa de assistência? | Assistência 24h, barra de ligação | Operação |
| S3 | **"Não assine acordo nem assuma culpa"** com terceiros em acidente: confirmar a orientação | Assistência 24h | Jurídico |
| S4 | **Fraudes:** validar item a item a lista do que a Asa nunca pede (só entra o que ela garante nunca fazer); o recebedor que aparece no Pix (depende de D2); o selo de conta comercial verificada no WhatsApp; o domínio dos e-mails de confirmação; um canal ou e-mail para denúncia; e a posição sobre pagamentos feitos a golpistas, sem prometer reembolso | Prevenção a fraudes | Operação + diretoria |
| S5 | **Acessibilidade:** a avaliação WCAG 2.2 AA (data, método e resultado). Sem ela, a página diz "foi construído para atender" e não "está em conformidade". Também os leitores de tela testados, as limitações encontradas e o tempo limite de sessão do motor de reservas | Acessibilidade | Marketing + dev |
| S6 | **Balcão e frota para PcD:** a acessibilidade física dos balcões e do caminho até o pátio, como funciona a fila preferencial, se a equipe acompanha até o carro, se há carro adaptado (e com quanta antecedência) e se há regra especial para PcD | Acessibilidade | Operação |
| S7 | E-mail e prazo de resposta aos relatos de acessibilidade | Acessibilidade | Marketing |
| S8 | Modelo de contrato em PDF para baixar. Sem o arquivo, o link não entra | Regras de locação | Jurídico |
| S9 | Linkar Prevenção a fraudes no e-mail de confirmação da reserva e na resposta automática do WhatsApp | Fora do site | Marketing |

## 4. Privacidade: dados que só a empresa sabe

Todos estão marcados na página. O jurídico revisa o texto inteiro (J7).

- Documentos pedidos no pré-cadastro e se há selfie ou biometria (dado sensível, art. 11 da LGPD).
- Gateway de pagamento e se a Asa guarda algum dado do cartão.
- Rastreador ou telemetria nos carros.
- Gravação de ligações.
- Fornecedores e compartilhamentos: antifraude, seguradora ou proteção veicular, assistência 24h, birô de crédito, tecnologia.
- Transferência internacional: quais fornecedores guardam dados fora do Brasil.
- Prazos de guarda: pré-cadastro, fotos de vistoria, mensagens de atendimento.
- Ferramenta de consentimento e lista de cookies.
- Decisão automatizada (recusa automática de cadastro existe?).

## 5. Conteúdo, imagem e autorização

| # | O que falta | Onde |
|---|---|---|
| A1 | **Autorização de nome, foto e cargo** de Sandro, Saulo Viana e Robson (J8). Sem ela, o bloco "Quem recebe você no aeroporto" sai inteiro. As avaliações indicam as funções: Robson abre o contrato no balcão de Fortaleza, Saulo Viana é agente de pátio em Fortaleza e Sandro faz entrega e vistoria em Recife. Os cargos ainda precisam ser confirmados. | Quem somos |
| A2 | **Política de uso das avaliações** do Google citadas com primeiro nome e inicial (Lais C., Danilo L., Priscila V., Jones D., Raquel A., Maria Eduarda). Letícya, citada na avaliação de Maria Eduarda, também é colaboradora (J8). | Quem somos, home, Primeira locação (Raquel A.) |
| A3 | Fotos reais (M3): equipe no balcão (é o LCP de Quem somos), retratos da equipe, balcões, pátio, frota, destinos do blog, estrada. Hoje todas são placeholder com o briefing na legenda. | Todas |
| A3b | Fotos das páginas de oferta: cliente recebendo a chave no balcão (com autorização de imagem), SUV na estrada à beira-mar, pátio do Aeroporto do Recife, carro em ladeira de Olinda sem foliões identificáveis, SUV na BR-232 ao entardecer sem marca de festa, estrada costeira ao pôr do sol sem fogos com marca de evento, Porto de Galinhas, Jericoacoara, e um carro por grupo da vitrine (Spin, Commander, Onix Plus, Tracker, Toro). | Ofertas, Primeira locação, campanhas |
| A4 | Autor dos artigos do blog, com nome e função (M5) | Blog |
| A5 | Padrão de URL de categoria e paginação do blog atual (M5) | Blog |
| A6 | Endereços dos artigos novos da pauta 2 a 8 (propostos, não confirmados) | Blog |
| A7 | Distâncias, tempos e data de conferência dos roteiros ([VERIFICAR] em 00c) | Blog |
| A8 | **Roteiros das campanhas** ([VERIFICAR] na tela): programação e polos do Carnaval do Recife e de Olinda e o esquema de trânsito; Caruaru pela BR-232 (cerca de 130 km) e se Gravatá entra; as cidades juninas do ano; distâncias de Porto de Galinhas, Carneiros, Maragogi, Cumbuco e Canoa Quebrada; local das festas de virada; regras de acesso de veículos a Jericoacoara e se a Toro 4x4 serve para ele. Conferir a cada edição, com a data. | Carnaval, São João, Réveillon |
| A9 | **Anúncios das campanhas** (Google Ads e Meta): estão como rascunho na copy e não entram nas páginas. Antes de subir: o título "Sem van: carro no aeroporto" só vale para Recife (O1); o texto do Réveillon na Meta cita os dois aeroportos; o título "Réveillon em Porto de carro" usa uma abreviação que a própria copy pede para testar. | Google Ads, Meta |

## 6. Técnico e de lançamento

| # | O que falta | Onde |
|---|---|---|
| T1 | Banner de cookies (`asa-consent`) e o link "Configurar cookies" no rodapé. Depende de D6. | Global, Privacidade |
| T2 | Barra de primeira locação (BEMVINDOASA). Só entra com as regras do cupom (C5). A página `/ofertas/primeira-locacao` já existe para receber o link da barra. | Global |
| T3 | Busca ligada ao motor de reservas. Hoje mostra uma linha "Protótipo". | Global |
| T4 | Formulário de contato com destino real, anti-spam (honeypot) e os eventos de GA4. Depende de E3. | Contato |
| T5 | Migração dos 14 PDFs de RI: levar os arquivos e manter os endereços `/_files/pasta/6/...` ou redirecionar com 301. | RI |
| T6 | Redirecionamentos 301: `/privacidade-e-cookies` para `/politica-de-privacidade`, `/termos-de-uso` para `/politica-de-termos-e-condicoes`, `/blog/index` para `/blog`, `/contratos-e-assistencia` (hoje com Lorem Ipsum) para `/regras-de-locacao`. | Global |
| T7 | As três URLs antigas do blog com erro 500 (Brennand, Recife, Fortaleza) voltam com status 200 e conteúdo novo. | Blog |
| T9 | Coordenadas `geo` das duas lojas para o schema. A API do Google Business Profile não devolveu latitude e longitude; o link do Maps de cada ficha já está nas páginas. | Contato, Lojas |
| T11 | A demonstração de dúvidas em 06 Componentes diz que a equipe "atende no WhatsApp e no telefone, 24 horas". O horário do atendimento remoto ainda não foi confirmado (E2); o texto da documentação muda junto. | Design system |
| T10 | Depois de cada merge: sincronizar o guia de parceiros (GitHub Pages), a skill e a cópia offline. Secrets do FTP para o deploy do design system. | Repositório |
| T12 | **Estados das páginas de oferta no CMS.** Campanha: flag de temporada que liga index, follow e a canonical, troca H1 e fechamento e mostra ou esconde as faixas da oferta e dos carros; a URL nunca muda e o status é 200 o ano todo. Cupom: estado pausado com noindex. Vitrine: card com validade obrigatória, esqueleto no formato do card enquanto carrega, `ItemList` só com os cards ativos. No protótipo, os estados abrem com `?encerrada`, `?pausado` e `?vazio`. | Ofertas, Primeira locação, campanhas |
| T13 | **Busca nas páginas de oferta:** cupom pré-preenchido por `?cupom=` (sem exemplo no placeholder), datas pré-sugeridas com o período da campanha e o local pelo anúncio. "Devolver em outro local", pedido na copy de `/ofertas`, ficou fora até O8. | Ofertas, Primeira locação, campanhas |
| T14 | **Eventos novos no GTM:** `view_promotion`, `select_promotion`, `coupon_copy`, `coupon_apply` (valido, invalido, expirado), `tab_select` e os parâmetros novos do `search` (iata, dias pela regra das 27 horas, antecedência, cupom_aplicado). Das páginas de ajuda: `contact_click` (method, placement, context), que é sinal operacional e não conversão de marketing, `emergency_call_click` (number), `faq_expand` (question_id) e `select_content` (regras_secao e denuncia_fraude). O `dataLayer` já empurra todos. | GTM, GA4 |
| T15 | **Preço "a partir de" nos cards de veículo das campanhas** vem do motor (`{preco_final_a_partir}`). Até lá, o lugar dele está marcado em laranja. | Carnaval, São João, Réveillon |
| T16 | **Card de veículo da biblioteca:** a linha de grupo fica acima do título, o que pela regra de 15 Composição é sobretítulo. Nas campanhas ela foi para baixo do título, como já é no card de artigo. Falta alinhar o componente e o exemplo em 06 Componentes (e a home de referência). | Design system |
| T17 | **Regra sem confirmação em produção:** a copy pede que a seção mostre "Consulte esta regra no contrato ou no WhatsApp 0800 080 0015." no lugar da marcação. O CMS precisa desse texto de reserva por seção | Regras de locação |
| T18 | **QA de acessibilidade:** cada item de "O que o site oferece" é requisito do sistema e precisa ser conferido no site final antes de publicar (teclado, pular para o conteúdo, rótulos, contraste e piso de 12px, zoom de 200%, movimento reduzido) | Acessibilidade |

## 7. Encontrado nas fichas do Google (para o marketing ajustar lá)

Não é pendência do site, mas aparece ao conferir o NAP:

- As duas fichas têm a categoria adicional **"Agência de locação de vans"** e serviços como aluguel de limusine, trator, motocicleta, trailer, caminhão, vans e microônibus. A fonte de verdade diz que vans e utilitários estão fora do escopo. Vale limpar as categorias e os serviços nas duas fichas.
- A maior parte das avaliações recentes está sem resposta.

## 8. Já resolvido

| Item | Como resolveu | Fonte |
|---|---|---|
| M1: nome exato das fichas, endereço e link do Maps | Lido no Google Business Profile em 02/10/2026; o rodapé e a página de Contato usam o texto letra a letra | API do GBP |
| J6: documentos de RI | Os 14 documentos publicados hoje (demonstrações financeiras 2020 a 2023 e debêntures) entram com data e tamanho | asalocadora.com.br/relacoes-com-investidores |
| Trecho de avaliação citando Robson | "Atendimento impecável do Robson e Saulo atendentes super atenciosos, amei tudo." (Priscila V., Fortaleza, 19/09/2026) | API do GBP |
| Links das avaliações de cada loja | Links do Maps das duas fichas | API do GBP |
| T8: `/prevencao-a-fraudes` existir antes do lançamento | Página feita; o alerta de Contato, a Assistência e as ofertas apontam para ela | site/prevencao-a-fraudes |

## 9. Desvios da copy que pedem aprovação

Mudanças feitas nas páginas de ofertas para seguir o sistema ou a fonte de verdade.

| Página | O que a copy pedia | O que entrou | Por quê |
|---|---|---|---|
| Primeira locação, campanhas | Selo ("Primeira locação", "Carnaval {ano}") acima do H1 | Primeira locação: sem selo, o H1 já diz. Campanhas: o selo foi para a linha da oferta, abaixo do H1 | Sobretítulo é proibido em 15 Composição |
| Primeira locação | Selo "Regras" acima do H2 das regras | Sem selo | Mesmo motivo |
| Ofertas | Selo do card acima do título | Selo sobre a foto, no canto baixo | Mesmo motivo; é o padrão do selo do card de veículo |
| Campanhas | Foto no hero | O hero leva só a busca; a foto foi para a oferta e os roteiros | Hero leve (LCP), como a copy de `/ofertas` já pedia |
| Carnaval | "Chegou em Recife ou Fortaleza, o carro está no pátio do próprio aeroporto" | "o balcão da Asa fica dentro do aeroporto e funciona 24h" | O pátio dentro do aeroporto só está confirmado em Recife (O1) |
| Primeira locação | "O carro sai do pátio do próprio aeroporto" no passo 4 | "Em Recife, o carro sai do pátio do próprio aeroporto" | O1 |
| Carnaval | "Informe o voo na reserva" | "Avise se o voo atrasar: 0800 080 0015" | O campo do voo está planejado e não confirmado (O4); entrou a alternativa da própria copy |
| Carnaval | "Faça o pré-cadastro antes de viajar" | Fora da página, em comentário | Link e efeito no balcão sem confirmação (O13) |
| Ofertas | "Alert neutro com `asa-price` de exemplo" | Resumo de exemplo com os nomes das linhas, sem valores | A fonte de verdade proíbe preço fixo na copy |
| Ofertas | Estado vazio "No momento não há campanha ativa" | "No momento não há oferta ativa" | O estado aparece quando não há nenhuma oferta, não só campanha |
| Ofertas, campanhas | CTA final com `asa-cut` de fundo | Fechamento amarelo curto (`asa-closing`) | É o fechamento do sistema; o corte fica nas fotos |
| Campanhas | BenefitItem com ícones; LocationCard | Faixa-foto com três fatos; lugar com foto e link, sem card | Ícone decorativo e card fora da vitrine são vícios de 15 Composição |
| Campanhas | Bloco de prova ausente; nota no fechamento | Notas 4,7 e 9,4 no fechamento, sem faixa preta | O preto aparece só quando há prova; a regra do par de notas segue D4 |
| Regras de locação | Regras sem confirmação só com `[CONFIRMAR]` | Onde os termos publicados hoje já trazem a regra, ela aparece em laranja ao lado | Mesmo padrão da página de Termos: quem revisa vê a regra atual e decide |
| Regras de locação | Link "Baixar o modelo de contrato (PDF)" | Sem link; a pendência aparece no lugar | O arquivo não existe ainda (S8) |
| Regras, Fraudes, Acessibilidade | Fechamento em `asa-card` com botão | Faixa curta de fechamento, sem card e sem amarelo | Card só na vitrine; página informativa não usa amarelo fora do cabeçalho |
| Assistência 24h | `asa-stickybar` com Ligar e WhatsApp | Barra de ligação fixa no pé, só no celular, que substitui o botão flutuante | O `asa-stickybar` da biblioteca é a barra do cupom, no topo; no pé, ela fica no alcance do polegar e não briga com o botão flutuante |
| Assistência 24h | Ligar e WhatsApp com `generate_lead` (padrão do site) | `contact_click` com o lugar e o contexto | A copy pede que o contato de assistência seja sinal operacional, não conversão |
| Prevenção a fraudes | Card "Canais oficiais" e três cards de golpes | Lista com divisor ao lado do H1 e três colunas com fio no topo | Card só na vitrine |
| Prevenção a fraudes | Lista "nunca pede" com ícone de proibição | Sem ícone, o fato em negrito | Cinco itens não pedem ícone (15 Composição); o texto já diz |
| Acessibilidade | Item sobre mapas incorporados de terceiros | Saiu | O site não incorpora mapa: o endereço está em texto e o link abre o Google Maps |
| Acessibilidade | "do Citroën C3 à Toyota Corolla" | "do Citroën C3 à Chevrolet S10" | A S10 4x4 também é automática e é o maior grupo |
