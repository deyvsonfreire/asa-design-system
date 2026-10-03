# Pendências e decisões do novo site

O que ficou em aberto nas páginas já construídas em `site/`. É a lista de trabalho para os ajustes gerais: cada item diz o que falta, quem responde, onde aparece e, quando há, a evidência que já encontramos.

Os códigos entre parênteses (C7, J1, O1...) são os de `novo-site/copy-v2/00c-perguntas-para-a-asa.md`. O item que já está lá não é repetido aqui; esta lista só acrescenta o que as páginas revelaram.

**Páginas cobertas:** componentes globais (cabeçalho, rodapé, WhatsApp, busca, 404), blog e modelo de artigo, Relações com Investidores, Política de Privacidade, Termos e Condições, Quem somos, Contato, Ofertas, Primeira locação, as campanhas de Carnaval, São João e Réveillon, Regras de locação, Assistência 24h, Prevenção a fraudes, Acessibilidade, Empresas, Dúvidas, Diária de 27 horas, Proteções e taxas, Caução e requisitos, a home e as quatro etapas da reserva (vitrine, proteção e adicionais, dados e pagamento, confirmação), Minha reserva, o pré-cadastro, a frota (hub e as seis categorias) as quatro praças (Aeroporto do Recife, Recife, Aeroporto de Fortaleza, Fortaleza), Lojas, os quatro destinos (Porto de Galinhas, Maragogi, Olinda, Jericoacoara) e o aluguel mensal.

**Regra de publicação:** nenhuma marcação vai ao ar. Nas páginas em rascunho (RI, Privacidade, Termos, Quem somos, Contato, as cinco de ofertas, as quatro de ajuda, as cinco de regras e empresas, a home, as quatro etapas da reserva, Minha reserva, o pré-cadastro, as sete páginas da frota, as quatro praças, Lojas, os destinos e o aluguel mensal), cada pendência aparece em laranja na tela e um aviso abre a página. Nas outras, ela fica em comentário no HTML.

---

## 1. Decisões que travam o texto

Cada uma tem duas versões possíveis, e as duas não podem conviver no site.

| # | Decisão | O que encontramos | Onde muda | Quem decide |
|---|---|---|---|---|
| D1 | **Regra de cancelamento** (C7) | A copy e a reserva online dizem "grátis até 24h antes". Os termos publicados hoje em asalocadora.com.br cobram multa em todo cancelamento: devolvem 70% com mais de 48h, 60% entre 24h e 48h e 30% com menos de 24h ou não comparecimento. | Termos (seção 9 e resumo), busca (linha "Cancele grátis até 24h"), blog, home, Regras de locação (seção de cancelamento), Dúvidas, Caução e requisitos (fechamento), as cinco páginas de ofertas (faixa do que toda locação tem, regras do BEMVINDOASA, cuidados das campanhas) | Diretoria + jurídico |
| D2 | **Razão social e CNPJ** (J1) | Além dos dois valores em conflito na fonte de verdade, a escritura da 1ª emissão de debêntures, registrada na JUCEPE em 07/12/2023 e publicada na própria página de RI, traz **Companhia Asa Rent a Car Locação de Veículos S.A.**, CNPJ **07.005.206/0001-53**. É um terceiro valor. | Rodapé, Termos (seção 1), Privacidade (seção 1), RI, schema `Organization` | Diretoria |
| D3 | **A Asa é franquia?** | Os termos publicados hoje identificam a locadora como "empresa definida no Documento de Locação, na qualidade de Sociedade Franqueada". | Termos, Privacidade (quem é o controlador), Quem somos | Diretoria + jurídico |
| D4 | **Nota do Google: qual número mostrar** | A regra até aqui é o par fixo 4,7 (Google) e 9,4 (Reclame Aqui). No Google Business Profile, em 02/10/2026: Recife 4,7 com 4.767 avaliações, Fortaleza 4,9 com 3.718, e as duas juntas dão 4,8 com 8.485. A copy pede o valor puxado da API, com data, e que ele suma se a API falhar. | Quem somos e Empresas (faixa preta), Primeira locação, campanhas, home, páginas de aeroporto | Marketing |
| D5 | **WhatsApp é botão amarelo ou vermelho na página de Contato** | O sistema reserva o vermelho para a ação principal e põe o WhatsApp em amarelo (secundário). Na página de Contato, a copy chama o WhatsApp de "CTA primário". Fiz em amarelo, e o vermelho ficou com "Enviar mensagem". | Contato. Nas páginas de ajuda (Regras, Fraudes, Acessibilidade, Dúvidas) o WhatsApp é a única ação do fechamento e saiu em vermelho; na Assistência, o vermelho é o Ligar e o WhatsApp sai em contorno | Marketing |
| D6 | **Banner de cookies: qual versão vale** | `00-componentes-globais.md` define três tipos (Necessários, Medição, Publicidade) e os botões Aceitar todos, Somente necessários e Configurar. A copy da Privacidade trazia quatro tipos (com Preferências) e os botões Recusar opcionais e Personalizar. A política foi escrita pela versão dos componentes globais. | Privacidade (seção 8), banner | Marketing + jurídico |
| D7 | **Domínio com ou sem www** (M2) | O site atual e as fichas do Google usam `asalocadora.com.br`, sem www. O JSON-LD da copy de Contato usa `www`. As páginas foram feitas sem www. | canonical e schema de todas as páginas | Marketing / dev |
| D8 | **Nome das lojas** | As fichas no Google se chamam "ASA Locadora - Aeroporto do Recife" (ASA em caixa alta) e "Asa Locadora - Aeroporto de Fortaleza". O rodapé usava "Asa Rent a Car · Aeroporto do Recife". Sugestão: padronizar a ficha de Recife para "Asa Locadora - Aeroporto do Recife" e usar esse nome no site. | Rodapé, Contato, Lojas, schema `AutoRental` | Marketing |
| D9 | **Frota: a tabela de 15 grupos está atual?** | As avaliações de Fortaleza de setembro citam Nissan Kicks, VW Polo automático e Fiat Argo, que não estão na tabela de grupos da fonte de verdade. | Frota, blog (artigo de Porto de Galinhas), Quem somos ("15 grupos") | Operação |
| D10 | **Vitrine de ofertas sem validade** (C5, C6) | A copy manda: card sem validade confirmada não vai ao ar, e "Por tempo indeterminado" só se for verdade. Hoje nenhuma das duas ofertas tem validade, então `/ofertas` iria ao ar no estado vazio ("No momento não há oferta ativa"). | Ofertas, Primeira locação | Comercial + marketing |
| D11 | **"Mais um dia" depende de pagamento antecipado?** | No site atual, a oferta "Adicione mais um dia na sua locação e economize até 15% na diária" vem com a nota "Valores para pagamento antecipado". A copy nova não fala disso. Se o desconto exige pagar antes, isso é regra do card. | Ofertas (regras do card), Réveillon (alta temporada) | Comercial |
| D12 | **Estrada sem pavimentação: pode ou não?** | Os termos publicados hoje proíbem usar o carro "em estradas sem pavimentação". Ao mesmo tempo, a copy e as páginas sugerem carro para areia: a picape 4x4 "para trechos de areia" no Réveillon, o acesso a Jericoacoara, e o exemplo do card de veículo em 06 Componentes ("altura livre para estrada de areia"). | Réveillon, Regras de locação (durante a locação), Proteções e taxas (exclusões), páginas de Jericoacoara, 06 Componentes | Operação + jurídico |
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

## 3d. Empresas, proteções, caução e diária

Já estão em 00c: proteção obrigatória, Completa e coberturas (C1), a taxa de 12% sobre adicionais (C2), o valor e o prazo da caução (C3), parcelamento e Pix (C4), empresas: NF, terceirização, licitações e comercial (C10), idade, CNH digital e estrangeiro (O2), análise no balcão (O3), fotos da vistoria (O5), combustível, lavagem e multas (O7). Aqui fica o que as páginas acrescentaram.

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| B1 | **Empresa na locação avulsa:** existe cadastro corporativo com faturamento para o colaborador em viagem? Qual a regra de caução para empresa cadastrada? Empresa pode ser a responsável pelo pagamento? | Empresas (casos e dúvidas), Caução e requisitos (dúvidas) | Comercial |
| B2 | **Área atendida pela terceirização:** estados e municípios | Empresas | Comercial |
| B3 | **O lead B2B:** para onde vai o formulário (CRM ou e-mail), o prazo de retorno do comercial, se haverá protocolo e o valor do lead para o evento-chave no GA4 | Empresas (formulário) | Comercial + dev |
| B4 | **Prova de empresa:** nomes ou logos de clientes, número de carros operados e percentual de economia só entram com dado aprovado e autorização por escrito | Empresas | Comercial + jurídico |
| P1 | **Proteções, o que falta além de C1:** a Asa aceita o seguro do cartão de crédito no lugar da proteção? Faixas de idade e peso da cadeirinha e se há assento de elevação. O valor do upgrade varia por grupo? | Proteções e taxas | Comercial |
| P2 | **Caução, o que falta além de C3:** como ela aparece na fatura, se a caução cobre multas e outras pendências, e se aceita dois cartões para somar o limite | Caução e requisitos, Dúvidas | Operação |
| P3 | **Requisitos, o que falta além de O2:** a Permissão para Dirigir é recusada? O balcão pede outro documento além da CNH (RG, comprovante de residência)? O condutor adicional precisa estar presente? | Caução e requisitos, Dúvidas, Regras | Operação |
| P4 | **Diária de 27 horas, o que falta além de C8:** a contagem parte da retirada efetiva ou do horário reservado? Vale para os 15 grupos, para todos os canais e para o aluguel mensal? Há tempo médio de devolução medido (só se for publicar número)? | Diária de 27 horas, Dúvidas | Operação |
| P5 | **Reserva:** alterar datas ou carro muda o valor e até quando pode? Como e em quanto tempo é o reembolso de reserva paga antes? Combustível e pedágio ficam por conta do cliente? | Dúvidas | Operação |

## 3e. Home e reserva (vitrine)

Já estão em 00c: o pátio de Fortaleza (O1), devolução em outro local (O8), parcelamento e Pix (C4), CNH digital (O2). Aqui fica o que a home e a vitrine acrescentaram.

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| H1 | **Fichas do Google para o JSON-LD da home:** nome exato de cada ficha e coordenadas (`geo`). Até lá, o `AutoRental` sai com nome descritivo e sem `geo`. URL canônica com ou sem `www` e o caminho do logo para o `Organization`. | Home | Marketing + dev |
| H2 | **Nota por praça nos cards de Recife e Fortaleza** (tokens `{nota_google_rec}` e `{nota_google_for}`, hoje 4,7 e 4,9) e a data da consulta. Depende de D4; sem decisão, os cards ficam sem nota. | Home | Marketing |
| H3 | **Preço dos cards de categoria da home:** `{preco_final_a_partir}` e `{diaria_a_partir}` do motor. Sem preço carregado, a linha vira "Veja o preço para as suas datas". | Home | Dev + comercial |
| R1 | **Critério do "Recomendado"** na ordenação. No protótipo: disponíveis primeiro, depois menor preço final. | Vitrine | Comercial |
| R2 | **Selo "Preferido do público":** critério e período. No protótipo, no grupo B, como a copy sugere. | Vitrine | Comercial |
| R3 | **Parcelamento no card** ("ou {n}x de {valor}"). Enquanto não houver, a linha fica só com a diária. | Vitrine | Comercial |
| R4 | **Malas 2 a 3:** o filtro conta esses grupos em "Até 2 malas" e em "3 malas ou mais" até a Asa decidir. | Vitrine | Operação |
| R5 | **O que é a "Diária" do card:** a tarifa sem proteção e taxa, ou o preço final dividido pelos dias? No protótipo é o preço final dividido pelos dias, para a diária e o total contarem a mesma história. Tokens `{preco_final_total}` e `{preco_diaria}` do motor. | Vitrine | Comercial + dev |
| R6 | **Motor de cada grupo** para a ficha "Ver detalhes". A fonte traz só a cilindrada no nome do modelo, e é ela que aparece. | Vitrine | Operação |
| R7 | **D e D+ (hatch automático) no atalho "Hatch":** a copy lista só A, B e B+ em hatch econômico; sem D e D+, quem filtra "Hatch" e "Automático" não acha nenhum carro. Entraram em "Hatch", com o nome "Hatch" no lugar de "Hatch econômico". | Vitrine | Marketing |

## 3f. Reserva: proteção, pagamento e confirmação

Já estão em 00c: coberturas, franquia e qual proteção é obrigatória (C1), a taxa sobre adicionais (C2), o valor da caução (C3), parcelamento e Pix (C4), idade, CNH digital e estrangeiro (O2), voo e tolerância (O4), pré-cadastro (O13). Aqui fica o que as etapas acrescentaram.

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| F6 | **Proteção Completa sem preço:** sem o valor por dia, ela não entra na conta. Na etapa 2 a opção aparece, mas fica desabilitada com "Disponível quando o valor da Completa for confirmado". | Etapa 2 | Comercial |
| F7 | **Comparação das proteções:** pela regra da copy, a linha que a operação não confirmar sai inteira, nas três colunas. Hoje só o preço da Básica e da Básica + Terceiros está confirmado; as oito linhas de cobertura esperam (C1). | Etapa 2 | Operação |
| F8 | **Upgrade:** quem é o grupo "acima" de cada grupo, o preço (o "+R$ 3,00/dia" da ficha vale para qualquer grupo?) e a base do "4 em cada 10 clientes". No protótipo o mapa de upgrade é de exemplo. | Etapa 2 | Comercial |
| F9 | **Cadeira de bebê:** faixa de idade e peso, e o máximo por reserva (no protótipo, 3). Condutor adicional: os requisitos são os do principal? Precisa ir ao balcão? Os termos de hoje permitem até 3. | Etapa 2, Etapa 3 | Operação |
| F10 | **Cupom e o que ele desconta:** no protótipo o desconto incide sobre diárias, upgrade, proteção e taxa, e não sobre os adicionais (a mesma conta da vitrine). | Etapas 1 a 4 | Comercial |
| F11 | **Pagamento online:** quais formas o checkout aceita, se existe "pagar na retirada", parcelas e juros, prazo e desconto do Pix, o nome do gateway, o selo que ele autoriza e o que a Asa guarda do cartão. Em produção, número, validade e código são campos hospedados do gateway (PCI). | Etapa 3, Etapa 4 | Financeiro + TI |
| F12 | **Campos do condutor:** o motor coleta a data da 1ª habilitação? "Mais de 21 anos" é 22 completos ou 21 completos? Número do voo (sem confirmação, o campo sai). Condutor estrangeiro, CNH estrangeira e PID ficam fora desta versão. | Etapa 3 | Operação + TI |
| F13 | **Confirmação:** a confirmação também vai por WhatsApp? O voucher em PDF é gerado pelo sistema (hoje, "Imprimir ou salvar em PDF" usa o navegador)? O e-mail pode ser corrigido pelo site? Qual o formato do localizador? | Etapa 4 | TI |
| F14 | **Fortaleza:** a sinalização exata até a Área de Locadoras no terminal (o texto de Recife está confirmado). | Etapa 4 | Operação |

## 3g. Minha reserva e pré-cadastro

Já estão em 00c: o pré-cadastro e o que ele coleta (O13), o voo e a tolerância (O4), o encarregado de dados (seção 4 desta lista). Aqui fica o que as duas páginas acrescentaram.

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| M1 | **Integração com o Sankhya:** sem ela, `/minha-reserva` vai ao ar na versão B (valida só o formato e segue para o WhatsApp com o localizador). Com ela, a versão A: consulta, status, cancelamento e voucher no site. As duas estão prontas no mesmo HTML. | Minha reserva | TI |
| M2 | **Localizador:** o formato (para a máscara e a validação) e o assunto exato do e-mail de confirmação. No protótipo, aceita de 6 a 12 letras e números com hífen opcional. | Minha reserva, Confirmação | TI |
| M3 | **Status que o sistema devolve:** a copy prevê Confirmada, Aguardando pagamento, Cancelada e Concluída. | Minha reserva | TI |
| M4 | **Cancelamento:** prazo de estorno do pagamento antecipado, regra com menos de 24h e no-show, e se cancelar e alterar podem ser feitos pelo site. Os termos de hoje falam em multa de 30% a 70% em todo cancelamento e reembolso de 30% no no-show, o que conflita com "grátis até 24h". | Minha reserva, Dúvidas, Termos | Jurídico + operação |
| M5 | **Bloqueio por tentativas:** quantas tentativas e por quanto tempo (no protótipo, 5 tentativas e "15 minutos" pendente). Em produção, no servidor, por IP e por localizador, com a mesma mensagem quando o CPF não bate. | Minha reserva | TI |
| K1 | **Pré-cadastro, o que falta além de O13:** aceita o PDF da CNH digital? Pede os dados do responsável financeiro? Como o cliente recebe a confirmação do envio? Há tempo médio medido (só com medição entra número)? | Pré-cadastro | Operação |
| K2 | **Contrato:** a assinatura no balcão é física ou digital? | Pré-cadastro | Operação |
| K3 | **Documentos e LGPD:** empresa terceira na validação ou no armazenamento, prazo de guarda, base legal e o e-mail do encarregado. | Pré-cadastro, Política de privacidade | Jurídico |

## 3h. Frota (hub e as seis categorias)

Já estão em 00c e nesta lista: a caução por categoria (C3), a devolução em outro aeroporto (O8), estrada sem pavimentação (D12), uso proibido e carga (R7), cadeira de bebê (F9), a tabela de 15 grupos estar atual (D9) e "mais um dia" (D11). Aqui fica o que as sete páginas acrescentaram.

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| V1 | **"A partir de" sem datas:** qual período de referência (no protótipo, 1 diária com a proteção básica e a taxa) e os tokens `{preco_final_a_partir}` e `{diaria_a_partir}` do motor. Com 1 diária, a linha "Diária a partir de" repetiria o total e saiu; volta se o período for maior. Com datas, cada card mostra o total do período, a diária e o esgotado. | Hero e cards das seis categorias, barra do celular | Dev + comercial |
| V2 | **Grupo B e B+:** o que muda além do modelo de referência (itens, tarifa). | Hatch econômico | Operação |
| V3 | **"Ou similar":** o critério interno; se o similar sempre mantém o câmbio; o que acontece se faltar carro do grupo (e do automático); se dá para pedir um modelo específico, com qual antecedência; e a troca de grupo depois da reserva concluída. | Frota, Automático | Operação |
| V4 | **Malas:** o tamanho de mala de referência da coluna "Malas", a capacidade do porta-malas em litros (hatch e sedã) e as malas com a 3ª fileira em uso (Spin e Commander). Também a orientação para 7 pessoas com mais de 4 malas. | Frota, Sedã, SUV, 7 lugares | Operação |
| V5 | **Tração dos SUVs:** Tracker, Compass e Commander são 4x2 ou 4x4? | SUV | Operação |
| V6 | **Picapes:** combustível da Toro 2.0 e da S10 2.8, capota ou tampa na caçamba, limite de peso e o que pode ir na caçamba (os termos de hoje proíbem transporte de carga, R7). | Picape | Operação + jurídico |
| V7 | **CNH categoria B** para carro de 7 lugares e para as três picapes (CTB, art. 143). | 7 lugares, Picape | Jurídico |
| V8 | **Grupo D é o automático de menor tarifa?** A copy diz que ele "abre a lista"; o texto não afirma que é o mais barato até a confirmação. | Frota, Automático | Comercial |
| V9 | **Cartão corporativo (PJ):** o titular entra como responsável financeiro e vai ao balcão? | Sedã | Operação |
| V10 | **Consumo por modelo:** só entra se houver dado oficial publicável. | Hatch econômico | Operação |
| V11 | **Volume de busca** dos termos principais na Semrush: "carros para alugar em Recife e Fortaleza", "aluguel de carro econômico", "aluguel de carro sedã" e "sedan", "aluguel de SUV", "aluguel de picape", "aluguel de caminhonete", "picape 4x4" e "aluguel de carro automático". | As sete páginas | Marketing |

## 3i. Praças (Aeroporto do Recife, Recife, Aeroporto de Fortaleza, Fortaleza)

Já estão em 00c e nesta lista: o pátio de Fortaleza (O1), voo e tolerância (O4), devolução em outra loja (O8), as fotos da vistoria, as coordenadas das lojas (T9), a regra de cancelamento (D1), estrada sem pavimentação (D12) e as regras de hoje R1, R2, R5 e R7. Aqui fica o que as quatro páginas acrescentaram.

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| P1 | **Recife, do balcão ao carro:** a referência visual para achar o Portão A5 no saguão, como o cliente vai do balcão ao pátio (a pé, acompanhado, distância) e o acesso de carro ao pátio na devolução. | Aeroporto do Recife | Operação |
| P2 | **Fortaleza, do balcão ao carro:** a referência da Área de Locadoras no saguão, onde fica o pátio e como o cliente chega até ele, e o ponto de devolução. Enquanto O1 não sai, a página não diz onde o carro fica nem "sem van". | Aeroporto de Fortaleza | Operação |
| P3 | **Sair do estado:** os termos de hoje permitem circular em todo o território nacional (R7). Há alguma condição para ir a Alagoas, Paraíba, Rio Grande do Norte ou Piauí? | Recife, Fortaleza | Operação + jurídico |
| P4 | **Trilha das páginas de cidade:** a copy pede "Início > Aluguel de carros > Recife" com o nível do meio apontando para `/lojas`, até o SEO decidir. As páginas de aeroporto usam "Início > Lojas". `/lojas` ainda não existe (copy 19). | Recife, Fortaleza | SEO |
| P5 | **Dados de roteiro ([VERIFICAR] na tela):** distâncias do aeroporto até Boa Viagem, Olinda, Gaibu e Calhetas, Porto de Galinhas, Maragogi, Beira-Mar, Praia do Futuro, Beach Park, Morro Branco, Canoa Quebrada, Cumbuco, Lagoinha, Jericoacoara e Guaramiranga; as rodovias CE-040, CE-025 e CE-085; a faixa de lazer da Av. Boa Viagem; Zona Azul no Recife Antigo e em Fortaleza; a estação Aeroporto do metrô; Brennand; vias de pico; o caranguejo às quintas na Praia do Futuro. | As quatro | Marketing |
| P6 | **"Passeios em dunas são feitos com bugueiros credenciados":** confirmar o texto com a operação, junto com D12. | Fortaleza | Operação |

## 3j. Lojas, destinos e aluguel mensal

Já estão nesta lista: as referências dos balcões (P1, P2), a devolução em outra loja (O8 e R15, agora em laranja em todas as páginas que falam dela), estrada sem pavimentação (D12), circulação (R7), combustível (R2), caução (R5), prorrogação (R14) e condutor adicional (R12).

| # | O que falta | Onde aparece | Quem responde |
|---|---|---|---|
| G1 | **Dados de rota ([VERIFICAR] na tela):** distâncias e tempos do aeroporto a Porto de Galinhas, Maragogi, Olinda e Jijoca; as rodovias (BR-101, PE-060, PE-038, PE-009, AL-101, CE-085); o pedágio da Rota do Atlântico; a divisa perto de São José da Coroa Grande; os trechos de pista simples; o trânsito de pico na saída sul e no centro do Recife; o sinal de celular no caminho de Jeri. | Destinos | Marketing |
| G2 | **Dados de roteiro ([VERIFICAR] na tela):** Maracaípe e os cavalos-marinhos, Carneiros a 50 km de Porto, tábua de marés, galés de Maragogi e a saída com maré baixa, Antunes e Barra Grande, São Miguel dos Milagres, estacionamentos na vila de Porto e nos pontos de embarque, ruas e estacionamento no Sítio Histórico de Olinda, o trânsito no Carnaval, Rio Doce e Janga, Itamaracá e o Recife Antigo a 7 km de Olinda. | Destinos | Marketing |
| G3 | **Jericoacoara:** as regras atuais de acesso de veículos ao parque nacional e à vila, se todo o trajeto até Jijoca é asfaltado, os estacionamentos em Jijoca e a taxa de turismo do município. Junto com D12, que hoje proíbe estrada sem pavimentação. | Jericoacoara, Fortaleza, Aeroporto de Fortaleza | Operação + marketing |
| G4 | **Mapa ilustrado da rota** (arte própria, sem marca de terceiros) para Porto de Galinhas e Maragogi; em Jericoacoara, com o trecho final marcado como "transporte local". Até lá, o lugar dele mostra o briefing. | Destinos | Design |
| G5 | **Title com a marca curta "\| Asa"** em Maragogi e Olinda, para caber o termo e a origem em 60 caracteres. | Maragogi, Olinda | SEO |
| L1 | **Ordem das lojas no celular:** a copy pede a loja da praça detectada (ou da última busca) primeiro. No protótipo, só com `?local=FOR`; em produção, pela última busca ou pela localização. | Lojas | Dev |
| MS1 | **Condições do mensal:** prazo mínimo, franquia de km e km excedente, manutenção e revisão, troca em pane, proteções, taxa de 12%, forma e periodicidade da cobrança, valor da caução, grupos disponíveis, renovação (R14), devolução em outra cidade (R15), valor do condutor adicional e a diferença para um plano de assinatura (IPVA, manutenção e seguro inclusos?). | Aluguel mensal | Comercial |
| MS2 | **"Pequena empresa" e os termos de hoje:** eles proíbem usar o carro para "fins comerciais" (R7). O que conta como uso comercial no mensal e na locação comum? A página oferece o mensal para a equipe de uma pequena empresa. | Aluguel mensal, Empresas | Jurídico + comercial |
| MS3 | **Cotação:** para onde vai o pedido (Sankhya, Chatwoot ou e-mail comercial), quem responde e em quanto tempo. O bloqueio de pedido repetido (mesmo WhatsApp em 10 minutos) fica no servidor; no protótipo, na sessão da aba. | Aluguel mensal | Comercial + dev |

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

| A10 | Fotos da home e da vitrine: carro da frota saindo do pátio do Aeroporto do Recife com pessoas reais (LCP da home), os dois balcões com a sinalização, atendente entregando a chave, os quatro destinos e os 15 modelos de referência na mesma angulação e fundo. A home aprovada (PR asa-design-system#1) usava 16 fotos de banco sem licença, que não vieram para o site. | Home, Vitrine |
| A11 | **Fotos da frota:** os 15 modelos de referência no pátio, no mesmo ângulo 3/4 dianteiro e fundo neutro, e as da copy de cada categoria (Corolla com o porta-malas aberto, Compass saindo do pátio, Spin com a 3ª fileira, S10 com a caçamba, câmbio automático do Tracker). Também os roteiros (Olinda, Beira-Mar, Porto de Galinhas, Maragogi, litoral do Ceará, picape com prancha) e os dois balcões. Depoimentos de Jones D. (Frota) e Daniel G. (Automático) dependem de A2. | Frota e categorias |
| A12 | **Fotos das praças:** o balcão do Portão A5 com atendente e cliente (com autorização), o balcão de Fortaleza à noite, Recife Antigo, Beira-Mar de Fortaleza, os bate-voltas e destinos (Boa Viagem, Olinda, Calhetas, Porto de Galinhas, Maragogi, Porto das Dunas, Jericoacoara, Morro Branco, Cumbuco, Guaramiranga). Depoimentos de Lais C., Jones D., Danilo L., Raquel A., Maria Eduarda e Daniel G., e os nomes Sandro, Saulo Viana e Letícya, dependem de A1 e A2. | Praças |
| A13 | **Fotos dos destinos, das lojas e do mensal:** piscinas naturais de Porto de Galinhas e galés de Maragogi (licenciadas), Maracaípe, Muro Alto, Carneiros, Antunes, São Miguel dos Milagres, Sítio Histórico e Alto da Sé de Olinda, Janga, Itamaracá, a estrada asfaltada entre carnaubais rumo a Jeri (nunca carro em duna ou areia), os dois balcões com colaboradores autorizados e o Onix Plus no pátio do Aeroporto do Recife. Depoimentos de Jones D., Lais C. e Danilo L. dependem de A2. | Lojas, destinos, mensal |

## 6. Técnico e de lançamento

| # | O que falta | Onde |
|---|---|---|
| T1 | Banner de cookies (`asa-consent`) e o link "Configurar cookies" no rodapé. Depende de D6. | Global, Privacidade |
| T2 | Barra de primeira locação (BEMVINDOASA). Só entra com as regras do cupom (C5). A página `/ofertas/primeira-locacao` já existe para receber o link da barra. | Global |
| T3 | Busca ligada ao motor de reservas. Hoje mostra uma linha "Protótipo". | Global |
| T4 | Formulário de contato com destino real, anti-spam (honeypot) e os eventos de GA4. Depende de E3. | Contato |
| T5 | Migração dos 14 PDFs de RI: levar os arquivos e manter os endereços `/_files/pasta/6/...` ou redirecionar com 301. | RI |
| T6 | Redirecionamentos 301: `/privacidade-e-cookies` para `/politica-de-privacidade`, `/termos-de-uso` para `/politica-de-termos-e-condicoes`, `/blog/index` para `/blog`, `/contratos-e-assistencia` (hoje com Lorem Ipsum) para `/regras-de-locacao`, `/tarifas` para `/protecoes-e-taxas`, `/terceirizacao-de-frotas` para `/empresas` e `/duvidas-frequentes` para `/duvidas`. | Global |
| T7 | As três URLs antigas do blog com erro 500 (Brennand, Recife, Fortaleza) voltam com status 200 e conteúdo novo. | Blog |
| T9 | Coordenadas `geo` das duas lojas para o schema. A API do Google Business Profile não devolveu latitude e longitude; o link do Maps de cada ficha já está nas páginas. | Contato, Lojas |
| T11 | A demonstração de dúvidas em 06 Componentes diz que a equipe "atende no WhatsApp e no telefone, 24 horas". O horário do atendimento remoto ainda não foi confirmado (E2); o texto da documentação muda junto. | Design system |
| T10 | Depois de cada merge: sincronizar o guia de parceiros (GitHub Pages), a skill e a cópia offline. Secrets do FTP para o deploy do design system. | Repositório |
| T12 | **Estados das páginas de oferta no CMS.** Campanha: flag de temporada que liga index, follow e a canonical, troca H1 e fechamento e mostra ou esconde as faixas da oferta e dos carros; a URL nunca muda e o status é 200 o ano todo. Cupom: estado pausado com noindex. Vitrine: card com validade obrigatória, esqueleto no formato do card enquanto carrega, `ItemList` só com os cards ativos. No protótipo, os estados abrem com `?encerrada`, `?pausado` e `?vazio`. | Ofertas, Primeira locação, campanhas |
| T13 | **Busca nas páginas de oferta:** cupom pré-preenchido por `?cupom=` (sem exemplo no placeholder), datas pré-sugeridas com o período da campanha e o local pelo anúncio. "Devolver em outro local", pedido na copy de `/ofertas`, ficou fora até O8. | Ofertas, Primeira locação, campanhas |
| T14 | **Eventos novos no GTM:** `view_promotion`, `select_promotion`, `coupon_copy`, `coupon_apply` (valido, invalido, expirado), `tab_select` e os parâmetros novos do `search` (iata, dias pela regra das 27 horas, antecedência, cupom_aplicado). Das páginas de ajuda: `contact_click` (method, placement, context), que é sinal operacional e não conversão de marketing, `emergency_call_click` (number), `faq_expand` (question_id) e `select_content` (regras_secao e denuncia_fraude). Das páginas de regras e empresas: `search` na busca de Dúvidas (search_term, com 3 ou mais letras e 800 ms de pausa), `faq_search_empty`, `faq_expand` com topic, `select_content` (faq_topic, caso_empresa, ajuste_27h, cta_protecoes, cta_requisitos, ancora_sem_cartao) e, no formulário de Empresas, `form_start`, `form_error` (error_fields) e `generate_lead` (lead_type b2b, org_type, contract_type, fleet_size_bucket), sem dado pessoal nem CNPJ. O `dataLayer` já empurra todos. | GTM, GA4 |
| T15 | **Preço "a partir de" nos cards de veículo das campanhas** vem do motor (`{preco_final_a_partir}`). Até lá, o lugar dele está marcado em laranja. | Carnaval, São João, Réveillon |
| T16 | **Card de veículo da biblioteca:** a linha de grupo fica acima do título, o que pela regra de 15 Composição é sobretítulo. Nas campanhas ela foi para baixo do título, como já é no card de artigo. Falta alinhar o componente e o exemplo em 06 Componentes (e a home de referência). | Design system |
| T17 | **Regra sem confirmação em produção:** a copy pede que a seção mostre "Consulte esta regra no contrato ou no WhatsApp 0800 080 0015." no lugar da marcação. O CMS precisa desse texto de reserva por seção | Regras de locação |
| T18 | **QA de acessibilidade:** cada item de "O que o site oferece" é requisito do sistema e precisa ser conferido no site final antes de publicar (teclado, pular para o conteúdo, rótulos, contraste e piso de 12px, zoom de 200%, movimento reduzido) | Acessibilidade |
| T19 | **Dúvidas no CMS:** pergunta com resposta pendente fica oculta até o fato ser confirmado, e o `FAQPage` do JSON-LD sai do mesmo conteúdo, com o mesmo texto da tela. Hoje o JSON-LD leva as 13 perguntas com resposta completa. | Dúvidas |
| T20 | **Dica das 27 horas na busca:** sugere o horário-limite quando a devolução passa da tolerância. Supõe a tolerância no fim do contrato; o motor de reservas precisa confirmar o cálculo (P4, C8). | Diária de 27 horas |
| T21 | **Valores de proteção e adicionais:** puxar do motor quando a integração permitir; até lá, a data de referência (08/09/2026) fica visível. | Proteções e taxas, Dúvidas |
| T22 | **A busca agora segue para a vitrine:** todas as buscas do site levam a `/reservas-online?local=&retirada=&devolucao=[&cupom=]`. Em produção, ou o motor de reservas responde nessa URL, ou a busca passa a apontar para ele. Na vitrine, os filtros e a ordenação também vivem na URL. | Todas as páginas com busca, Vitrine |
| T23 | **Eventos novos no GTM:** da home, `view_item_list` e `select_item` (item_list_id home_categorias) e `select_content` (praca, destino, avaliacoes_google); da vitrine, `view_search_results`, `view_item_list` (a cada filtro), `select_item`, `view_item`, `filter_applied` e `sort_applied` (personalizados) e `generate_lead` com page_type vitrine e lead_topic disponibilidade ou reserva. A copy da home pede `faq_open`; ficou `faq_expand`, o nome que o site já usa. | GTM, GA4 |
| T24 | **Estados da vitrine no motor:** carregando (esqueleto, sem preço falso), erro, tudo esgotado, vazio por filtro, sem busca e busca expirada (30 minutos na mesma aba). No protótipo abrem por `?estado=`. O preço e o esgotado de cada grupo são de exemplo. | Vitrine |
| T25 | **Próxima etapa da reserva:** "Escolher este carro" leva a `/reservas-online/adicionais` com a busca e o grupo na URL; a página ainda não existe (copy 03). | Vitrine |
| T27 | **Estado do funil:** busca e escolhas (local, datas, cupom, grupo, upgrade, proteção, adicionais) ficam na URL e passam de etapa em etapa; dado pessoal nunca vai para a URL nem para o GA4. No protótipo, os dados da etapa 3 e a reserva feita ficam no `sessionStorage` da aba, que some ao fechar; em produção, na sessão do motor. Os campos do cartão não são guardados em lugar nenhum. A conta do preço é uma só (`site/reservas-online/funil.js`), usada da vitrine à confirmação. | Funil |
| T28 | **Eventos do funil no GTM:** `view_item`, `view_promotion` e `select_promotion` (upgrade, com delta_price_day), `add_to_cart` e `remove_from_cart` (proteção, adicionais, upgrade), `view_cart`, `begin_checkout`, `add_payment_info` (credito_online, pix_online, pagar_retirada), `checkout_option` (booking_for, card_owner), `checkout_error` (error_field, error_type), `purchase` (uma vez por localizador; no Pix, só quando cai), `pix_pending`, `pix_code_copied`, `precadastro_click`, `voucher_download` e `generate_lead` (checkout_erro, tenho_reserva). Nenhum leva nome, CPF, e-mail ou telefone. | GTM, GA4 |
| T29 | **Consentimentos do checkout:** registrar data, hora, versão dos textos aceitos e o valor de cada caixa; a de ofertas é opcional e nunca condiciona a reserva. | Etapa 3 |
| T30 | **Eventos de Minha reserva e do pré-cadastro:** `manage_booking` (action consultar, com result encontrada, nao_encontrada, erro, bloqueada ou encaminhada e a version A ou B; e as ações do painel: precadastro, voucher, pagar_pix, alterar, cancelar_iniciar, cancelar_confirmar, com o booking_status), `refund` (só com o localizador como transaction_id), `generate_lead` (tenho_reserva, com a version) e `precadastro_click` (link_url, page_type, placement). Nada de localizador ou CPF fora do `refund`; nenhuma imagem ou dado da CNH em tag nenhuma. | GTM, GA4 |
| T31 | **Pré-cadastro nativo:** quando o fluxo de `/checkin-express` existir (identificação, dados, foto da CNH, enviado, já escritos na copy), trocar o botão para o fluxo interno, revisar a indexação e redirecionar `precadastro.asalocadora.com.br` com 301. | Pré-cadastro |
| T32 | **Frota e o motor de reservas:** a busca das categorias vai à vitrine com o filtro na URL (`categoria=hatch&cambio=manual`, `categoria=seda`, `suv`, `7-lugares`, `picape`, `cambio=automatico`); "Reservar grupo X" com datas vai direto à etapa 2 (`grupo=`); sem datas, leva à busca, que segue para a etapa 2 com o grupo. O preço, a diária e o esgotado dos cards precisam vir do motor por datas. 301 de `/nossos-veiculos` para `/frota`. | Frota e categorias |
| T33 | **Eventos da frota no GTM:** `view_item_list` e `select_item` com as listas `frota_hub`, `frota_hatch_economico`, `frota_sedan`, `frota_suv`, `frota_7_lugares`, `frota_picape`, `frota_automatico` e `frota_usos` (item_id = letra do grupo); `filter_applied` (filtro, valor, ativo, resultados) na tabela; `tab_select` nas abas de automáticos; `cta_reservar_categoria` (categoria, placement); `search` ganhou `categoria` e `grupo`. | Frota e categorias |
| T34 | **Uma loja, um `@id`:** o `AutoRental` de cada loja usa `/lojas#recife` e `/lojas#fortaleza` na home, em Contato e nas quatro praças, com o nome e o endereço da ficha do Google letra a letra e a `url` da página do aeroporto. A página de cidade aponta para a mesma loja e acrescenta `areaServed`. Antes, a home e Contato usavam dois `@id` diferentes. Falta o `geo` (T9). | Home, Contato, praças |
| T35 | **Eventos das praças:** os nomes da copy viram os do site: `search_submit` → `search` (com `origem` e `iata`), `select_vehicle` → `select_item` (listas `praca_aeroporto_recife`, `praca_recife`, `praca_aeroporto_fortaleza`, `praca_fortaleza`), `click_whatsapp` → `generate_lead`, `click_directions` e `click_internal_destination` → `select_content` (rota, destino), `faq_open` → `faq_expand`, `tab_select` nas abas de Fortaleza. | Praças |
| T36 | **Mapa das lojas:** carrega só ao tocar em "Mostrar mapa", com a ficha do Google pelo `cid` (`maps.google.com/maps?cid=…&output=embed`). Para produção, trocar pelo iframe oficial ("Compartilhar > Incorporar" da ficha) ou pela Maps Embed API, conforme os termos do Google. Depois de 8 segundos sem carregar, aparece "O mapa não carregou. Use o link Como chegar no Google Maps." | Lojas |
| T37 | **Eventos novos no GTM:** `map_open` e `select_location` (location REC ou FOR) em Lojas; `select_content` com `regras_de_uso` em Jericoacoara; na cotação do mensal, `form_start`, `form_error` (error_fields) e `generate_lead` (lead_type mensal, customer_type, pickup_location, duration_bucket, vehicle_type, transmission, vehicles_qty), marcado como evento-chave; `contact_click` no WhatsApp e no telefone. Os destinos usam os eventos das praças (T35). | Lojas, destinos, mensal |
| T26 | **Biblioteca, corrigido nesta leva:** na grade de destinos o tile grande não ocupava as duas linhas no desktop (a proporção do celular vencia), e a legenda do placeholder batia no chip do nome no card de destino e de praça. Falta o mesmo cuidado no card de veículo (T16): na vitrine e na home, a linha do grupo também foi para baixo do título. | Design system |

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
| Empresas | Selo "Para empresas e órgãos públicos" acima do H1 | Sem selo | Sobretítulo; o H1 e a frase já dizem |
| Empresas | Três cards de caso e quatro BenefitItem | Atalhos clicáveis com fio no topo; os quatro fatos na faixa preta, com as notas | Card só na vitrine; ícone decorativo sai |
| Empresas | "Sai com o carro do pátio do próprio aeroporto" | "Em Recife, o carro sai do pátio do próprio aeroporto" | O1 |
| Empresas | Linha de prova com {nota_google} e {total_avaliacoes} | Placas 4,7 e 9,4 | D4 |
| Dúvidas | Sete blocos de accordion, um por tema | Uma faixa só, com os temas em sequência e índice ao lado no desktop | Sete faixas iguais em sequência são o vício que 15 Composição proíbe |
| Dúvidas | "Fale com a gente no 0800 080 0015, 24h" | Sem o "24h" | O horário do atendimento remoto não está confirmado (E2); os balcões, sim, são 24h |
| Dúvidas | "No motor de reserva existe a opção Devolver em outro local" | A resposta fica pendente, com a regra dos termos de hoje | A busca do site não tem essa opção até O8 |
| Diária de 27 horas | Hero com CTA e, depois, a busca | A busca dentro do hero; o CTA "Ver carros" saiu | A ação já é a busca; dois passos para o mesmo lugar |
| Diária de 27 horas | Dicas em lista com ícones | Editorial com a foto do painel de chegadas | Ícone decorativo sai; a faixa ganha foto de lugar |
| Proteções e taxas | Tooltip "?" na franquia | A definição vai no rótulo da linha | Sem clique para entender a palavra mais importante da tabela |
| Proteções e taxas, Caução | CTA que "abre o BookingSearch" | A busca fica no fechamento e o CTA da abertura rola até ela | Página informativa: a busca não domina a abertura |
| Caução e requisitos | Lista com ícone de check | Lista com divisor, sem ícone, em corpo grande | Três itens não pedem ícone (15 Composição) |
| Home | Etiqueta "Recife · Fortaleza · 24h" acima do H1 | Sem etiqueta | Sobretítulo; o H1 já diz as duas cidades |
| Home | Nota, praças e depoimentos em três blocos | Uma faixa preta de prova: praças, placas 4,7 e 9,4, "Desde 2004 · 15 grupos" e os quatro depoimentos | O preto aparece uma vez, no momento da prova (home aprovada e 15 Composição) |
| Home | "{nota_google} no Google · {total_avaliacoes} avaliações", com a data da consulta | Placas 4,7 e 9,4 | D4 |
| Home | BenefitItem com ícones no "O que levar" e Alert de informação | Editorial com foto, lista de definições e o aviso da caução no cartão do próprio editorial | Ícone decorativo sai; é a faixa "como funciona" da home aprovada |
| Home | CTA final com `asa-cut` e foto do pátio no fundo | Fechamento amarelo curto, sem foto | O fechamento não repete o hero |
| Home | Motor com o local vazio e sugestões ao focar | A busca do site, com o Recife marcado | É a busca de todas as páginas; o autocomplete entra com o motor |
| Home (aprovada) | "Carro em cerca de 8 minutos" e "Do desembarque ao carro em 8 minutos" | Saiu | A copy retirou a promessa de tempo |
| Home (aprovada) | Tempos de viagem dos destinos ("1h de Recife") | "Retirada no Aeroporto do Recife" | Eram estimativa; a copy nova diz de qual aeroporto sair |
| Vitrine | "Escolher este carro" em botão primário em todo card | Vermelho só no primeiro card disponível; os outros em contorno | Regra do botão vermelho único (08 Fluxo de reserva) |
| Vitrine | SpecTag com ícone por atributo | Atributos em texto, separados por ponto | No card de vitrine a lista é texto (06 Componentes, speclist) |
| Vitrine | Badge "Preferido do público" no topo do card | Selo sobre a foto, no canto baixo | Acima do título seria sobretítulo |
| Vitrine | "{nota_google} no Google · {total_avaliacoes} avaliações" | 4,7 no Google | D4 |
| Vitrine | Slider de faixa de preço | Dois controles, "De" e "Até", com os valores escritos | Mesmo resultado, mais simples de usar no teclado e no leitor de tela |
| Vitrine | Rodapé da lista com BenefitItem | Três itens em texto, sem ícone e sem card | Ícone decorativo sai |
| Vitrine (e todo o funil) | Cabeçalho reduzido (logo, 0800, Minha reserva), sem menu, e WhatsApp só com o ícone (00-componentes-globais) | O cabeçalho e o rodapé de todas as páginas; o "Reservar" do cabeçalho abre "Alterar busca" | Decisão do usuário, 02/10: o site mantém um cabeçalho e um rodapé só. A copy de componentes globais precisa ser atualizada |
| Etapa 2 | `asa-stickybar` com o total no celular | `asa-summary--bar` no pé, com total, "Ver detalhes" e "Continuar"; some quando o resumo está na tela | O `asa-stickybar` da biblioteca é a barra do cupom, no topo; o resumo em barra é o `asa-summary--bar` |
| Etapa 2 | Tabela comparativa com radio por coluna | Três cards lado a lado com as mesmas linhas alinhadas, a escolha embaixo; no celular, empilhados | É a mesma comparação, e o card inteiro escolhe a proteção (não só o círculo) |
| Etapa 2 | Completa selecionável | Completa visível, mas desabilitada até ter preço | Sem o valor, a conta do preço final não fecha |
| Etapa 2 | Badge "Melhor upgrade" | Etiqueta preta, não vermelha | O vermelho da tela é o "Continuar" |
| Etapa 3 | "Entendi, manter" e "Voltar e mudar" como links | Dois botões de texto dentro do aviso | São ações, não navegação |
| Etapa 3 | Data com placeholder dd/mm/aaaa | Campo de texto com máscara dd/mm/aaaa, não o calendário do navegador | Data de nascimento e de 1ª habilitação se digitam mais rápido do que se escolhem num calendário |
| Etapa 4 | Etiqueta "Reserva feita" acima do H1 | Linha de status com ícone, acima do H1 em texto pequeno verde | O H1 já diz; a linha é o estado, não um sobretítulo de seção |
| Etapa 4 | "Baixar voucher em PDF" | "Imprimir ou salvar em PDF", pelo navegador | O PDF do sistema não está confirmado (F13); a impressão já esconde cabeçalho, rodapé e botões |
| Etapa 4 | Pré-cadastro com `asa-cut` de fundo | Faixa amarela curta, o único bloco de cor da etapa | Modo transacional: um bloco de cor por tela; o fechamento do sistema não leva foto |
| Etapa 4 | "Abrir no Google Maps" com [CONFIRMAR] | Os links das fichas do Google, já conhecidos | Resolvido com o Google Business Profile |
| Minha reserva | Uma versão por vez | As versões A e B no mesmo HTML; vai ao ar a B até a integração (M1) | A copy pede a B sem integração; a A fica pronta para quando houver |
| Minha reserva | Formulário sem moldura | Os dois campos num painel branco ao lado do H1, como a busca do hero | A consulta é a tarefa da página; o painel a separa do texto sem virar card |
| Minha reserva | "Baixar voucher em PDF" | "Ver o voucher", que abre a confirmação, com o PDF pendente | O PDF do sistema não está confirmado (F13) |
| Minha reserva | Status por badge | Etiqueta com ícone e texto (Confirmada, Aguardando pagamento, Cancelada, Concluída), nunca só cor | Regra da copy, com a etiqueta da biblioteca |
| Minha reserva | Contato com `generate_lead` | `generate_lead` (tenho_reserva) no lugar do `contact_click` das páginas de ajuda | A copy pede lead: quem tem reserva e chama a equipe é atendimento de venda feita |
| Pré-cadastro | Topo com `asa-cut` e botão | Abertura dividida: texto e botão à esquerda, foto com o corte de 8° à direita | É o mesmo pedido, no padrão das aberturas informativas |
| Pré-cadastro | Versão nativa (etapas 1 a 4) | Só a página-ponte; as etapas ficam na copy para quando o fluxo for construído | A própria copy diz que hoje o serviço está em outro endereço |
| Frota (as sete) | Eyebrow acima do H1 ("Frota Asa · 15 grupos", "Grupos A, B e B+ · câmbio manual") | Hub: saiu. Categorias: a linha dos grupos vai abaixo do H1 | Acima do H1 seria sobretítulo |
| Categorias | Foto do carro no hero (LCP) | O hero leva o preço e a busca; a foto foi para o card do grupo | Hero leve, como nas campanhas |
| Categorias | Preço "a partir de" no hero | No cartão branco da busca, acima dos campos | Vermelho sobre amarelo não passa no contraste (06 Componentes, preço) |
| Categorias | `asa-stickybar` no celular | `asa-summary--bar` no pé, com a categoria, o "a partir de" e Reservar; some enquanto a busca do topo, o fechamento ou o rodapé estão à vista | O `asa-stickybar` é a barra do cupom, no topo (mesma decisão da etapa 2) |
| Categorias | "Cards de roteiro" | Foto do lugar, texto e link, sem card | Card fica para produto; é o padrão dos roteiros das campanhas |
| Categorias | SpecTag com ícones | A ficha em texto corrido, como na vitrine | Mesma regra da vitrine |
| Frota | "Onde você retira" e "Quem já alugou" em duas faixas | Uma faixa preta com os balcões, as notas e o depoimento | É a faixa de prova da home; o preto aparece uma vez |
| Frota | Coluna "Ar" na tabela | Saiu; "todos os grupos têm ar-condicionado" vai na nota da tabela | Era "Sim" nas 15 linhas |
| Frota | No celular, a tabela vira lista de VehicleCard | O mesmo HTML: cada linha vira um bloco com o grupo, o modelo, a ficha numa linha, a categoria e o preço | Um conteúdo só, sem duplicar a frota no HTML |
| Frota e categorias | Fechamento com foto ao fundo (`asa-cut`) | Fechamento amarelo curto, sem foto | Padrão do fechamento do sistema |
| Frota e categorias | Eventos `frota_filtro_aplicado`, `frota_aba_automatico` e `faq_abrir` | `filter_applied` (com item_list_id), `tab_select` e `faq_expand` | Os nomes que a vitrine, as campanhas e as dúvidas já usam: uma configuração só no GTM |
| Categorias | "Devolver em outro local" na busca | Não entrou | Depende de O8, como na busca de todas as páginas |
| Sedã | "A busca tem a opção Devolver em outro local" | "Fale com a equipe antes de reservar" com a pendência | A busca não tem a opção (O8) |
| SUV, Picape | "Se o roteiro pede 4x4"; "4x4 não libera trilha" | "Se você precisa de 4x4"; a regra de hoje (estrada sem pavimentação proibida) em laranja | D12 |
| Picape | "Carga na caçamba: bagagem e equipamento, sim" e "carga ou mudança" | A regra de hoje (transporte de carga proibido) em laranja, com a pendência do que pode ir na caçamba | R7 |
| Picape | Aviso para a Strada com mais de 2 ocupantes | Não entrou | O funil não pergunta o número de passageiros |
| Picape | "Não leva passageiro no banco de trás" | "Não tem banco de trás" | O grupo H tem 2 lugares e 2 portas |
| Automático | H2 "Atenção: estes grupos são manuais" | "Estes cinco grupos são manuais", em faixa curta | Aviso sem alarme; o texto já diz o que fazer |
| Automático | "Fortaleza: chegada de madrugada, carro automático na hora" | "Fortaleza: chegada de madrugada", com o balcão 24h | "Na hora" é promessa de tempo, que a fonte proíbe sem medição |
| Hatch, 7 lugares | "A diária pode sair até 15% mais barata" | Mantido, com o link para a oferta "mais um dia" | Fato do site atual; a condição de pagamento antecipado está em D11 |
| Praças (as quatro) | Selo acima do H1 ("Aeroporto do Recife · Portão A5 · 24h") | Linha abaixo do H1 | Acima do H1 seria sobretítulo |
| Praças | Foto no hero | O hero leva o preço e a busca; a foto foi para o passo a passo (aeroportos) e para a loja e os bairros (cidades) | Hero leve, como na frota e nas campanhas |
| Praças | Preço "a partir de" no hero | No cartão branco da busca; é o menor preço da frota inteira | Vermelho sobre amarelo não passa no contraste |
| Praças | VehicleCard com dois modelos ("HB20 ou Onix") | Um grupo de referência por card, com o título do uso ("Casal com 2 malas"); o outro modelo vai no texto | O preço e o "Reservar" precisam de um grupo |
| Praças | Título da prova com `{nota_google}` e `{total_avaliacoes}` da loja | H2 com o nome do bloco e as placas 4,7 e 9,4 | D4 e H2 |
| Praças | `asa-stickybar` no celular e fechamento com foto ao fundo | `asa-summary--bar` no pé e fechamento curto amarelo | Mesmas decisões da frota |
| Praças | "Quanto custa? A partir de {preco_final_a_partir}" na FAQ | "O valor da busca é o preço final", com o link para a busca | O "a partir de" já está no topo; na FAQ ele ficaria sem atualizar com as datas |
| Praças | "Posso cancelar? Sim, sem custo até 24h" | Mantido, com a regra de hoje (multa de 30% a 70%) em laranja | D1, como em Minha reserva |
| Praças | "Posso ir a Alagoas?" e "ao Rio Grande do Norte?" só com [CONFIRMAR] | A regra de hoje (território nacional) em laranja, com a pendência da condição | R7 |
| Praças | Endereço na FAQ no formato da copy | O texto da ficha do Google | A própria copy manda o GBP valer |
| Aeroporto do Recife | Blocos "24h" e "diária de 27h" em duas faixas | Uma faixa de duas colunas, cada uma com o próprio H2 | Dois assuntos curtos que, sozinhos, seriam faixas de uma linha |
| Aeroporto do Recife e de Fortaleza | Devolução sem as regras de combustível, hora extra e estorno | As regras de hoje (R1, R2, R5) em laranja | A copy pedia [CONFIRMAR]; os termos de hoje já dizem algo |
| Aeroporto de Fortaleza | Depoimento de Daniel G. no bloco da devolução | Na faixa de prova, com Raquel A. e Maria Eduarda | Depoimentos juntos, na faixa preta |
| Recife, Fortaleza | LocationCard da loja | Bloco da loja sem card (foto, endereço da ficha, 24h, mapa), como em Contato | Card fica para produto |
| Recife | "Colada em Boa Viagem" | "Ao lado de Boa Viagem" | Mais preciso: o aeroporto fica na Imbiribeira, que faz divisa com Boa Viagem |
| Recife | Gaibu e Calhetas sem página de destino | Na faixa de bate-voltas, sem link | Não há página para linkar |
| Lojas | LocationCard expandido com botão principal em cada loja | Bloco da loja sem card, com a ação "Ver carros" em contorno nas duas | Página de localização (informativa): as duas lojas têm o mesmo peso e nenhuma ação disputa |
| Lojas | Nota de cada loja (`{nota_google_recife}`, `{nota_google_fortaleza}`) | Não entrou | D4 e H2 |
| Lojas | CTA final com `asa-cut` | Fechamento curto neutro, com as duas lojas em botões de mesmo peso | Padrão das páginas informativas |
| Destinos (os quatro) | Selo acima do H1 e foto no hero | Linha abaixo do H1; a foto foi para a rota e os passeios | Sobretítulo; hero leve |
| Destinos | "Onde retirar" como Alert | Faixa curta de texto com o link para a página do aeroporto | É o assunto da faixa, não um aviso de sistema |
| Destinos | Ficha da rota e mapa em blocos separados | Um editorial: o mapa (ou a foto) de um lado, a ficha da rota (asa-summary) e as dicas do outro | Uma faixa só para planejar a estrada |
| Destinos | LocationCards dos passeios | Foto, texto e link, sem card; sem link quando não há página | Card fica para produto |
| Destinos | Título da prova com `{nota_google}` | H2 com o nome do bloco e as placas 4,7 e 9,4 | D4 |
| Porto de Galinhas, Maragogi, Jericoacoara | "Abasteça… [CONFIRMAR: combustível]" | A regra de hoje (tanque cheio na volta) em laranja | R2 |
| Porto de Galinhas | "Não deixe objetos à vista" | Aviso em destaque, com a regra de hoje sobre objetos esquecidos em laranja | R17 |
| Maragogi | "[CONFIRMAR: circular em Alagoas]" solto | A regra de hoje (território nacional) em laranja, com a pendência da condição | R7 |
| Jericoacoara | "O uso fora de estrada pode ser proibido pelo contrato" | "Os termos de hoje proíbem usar o carro em estrada sem pavimentação, inclusive as picapes 4x4", em laranja | D12: os termos já dizem; "pode ser" seria vago |
| Jericoacoara | Mapa ilustrado da rota | A foto da estrada asfaltada (a da copy para o hero); o mapa fica em G4 | Nenhuma imagem de carro na areia |
| Jericoacoara | Taxa de turismo como nota solta | Item da lista do "leia antes" | É uma das coisas que a pessoa precisa saber antes de ir |
| Lojas, destinos, praças, sedã | "Posso devolver em outra loja?" só com [CONFIRMAR] | A regra de hoje (taxa de retorno) em laranja, com a pendência do valor | R15 |
| Olinda | "Posso cancelar? Sim, sem custo" | Mantido, com a regra de hoje (multa de 30% a 70%) em laranja | D1 |
| Aluguel mensal | Badge "Aluguel mensal" acima do H1 | Saiu; "mensal" vai na placa preta do H1 | Sobretítulo |
| Aluguel mensal | Bloco "Antes de retirar, confira" depois do formulário | Ao lado do formulário, com o canal oficial | O que conferir fica à vista de quem pede a cotação |
| Aluguel mensal | Prova "Nota {nota_google}" no hero | 4,7 no Google e 9,4 no Reclame Aqui | D4 |
| Aluguel mensal | Passo 4: "O carro sai do pátio do próprio aeroporto" para as duas lojas | "Em Recife, o carro sai do pátio do próprio aeroporto" | O1 |
| Aluguel mensal | Renovação, quem dirige, outra cidade e caução só com [CONFIRMAR] | As regras de hoje (R14, R12, R15, R5) em laranja, com a pendência do mensal | Os termos de hoje já dizem algo |
