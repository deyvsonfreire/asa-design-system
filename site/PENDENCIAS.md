# Pendências e decisões do novo site

O que ficou em aberto nas páginas já construídas em `site/`. É a lista de trabalho para os ajustes gerais: cada item diz o que falta, quem responde, onde aparece e, quando há, a evidência que já encontramos.

Os códigos entre parênteses (C7, J1, O1...) são os de `novo-site/copy-v2/00c-perguntas-para-a-asa.md`. O item que já está lá não é repetido aqui; esta lista só acrescenta o que as páginas revelaram.

**Páginas cobertas:** componentes globais (cabeçalho, rodapé, WhatsApp, busca, 404), blog e modelo de artigo, Relações com Investidores, Política de Privacidade, Termos e Condições, Quem somos, Contato.

**Regra de publicação:** nenhuma marcação vai ao ar. Nas páginas em rascunho (RI, Privacidade, Termos, Quem somos, Contato), cada pendência aparece em laranja na tela e um aviso abre a página. Nas outras, ela fica em comentário no HTML.

---

## 1. Decisões que travam o texto

Cada uma tem duas versões possíveis, e as duas não podem conviver no site.

| # | Decisão | O que encontramos | Onde muda | Quem decide |
|---|---|---|---|---|
| D1 | **Regra de cancelamento** (C7) | A copy e a reserva online dizem "grátis até 24h antes". Os termos publicados hoje em asalocadora.com.br cobram multa em todo cancelamento: devolvem 70% com mais de 48h, 60% entre 24h e 48h e 30% com menos de 24h ou não comparecimento. | Termos (seção 9 e resumo), busca (linha "Cancele grátis até 24h"), blog, home | Diretoria + jurídico |
| D2 | **Razão social e CNPJ** (J1) | Além dos dois valores em conflito na fonte de verdade, a escritura da 1ª emissão de debêntures, registrada na JUCEPE em 07/12/2023 e publicada na própria página de RI, traz **Companhia Asa Rent a Car Locação de Veículos S.A.**, CNPJ **07.005.206/0001-53**. É um terceiro valor. | Rodapé, Termos (seção 1), Privacidade (seção 1), RI, schema `Organization` | Diretoria |
| D3 | **A Asa é franquia?** | Os termos publicados hoje identificam a locadora como "empresa definida no Documento de Locação, na qualidade de Sociedade Franqueada". | Termos, Privacidade (quem é o controlador), Quem somos | Diretoria + jurídico |
| D4 | **Nota do Google: qual número mostrar** | A regra até aqui é o par fixo 4,7 (Google) e 9,4 (Reclame Aqui). No Google Business Profile, em 02/10/2026: Recife 4,7 com 4.767 avaliações, Fortaleza 4,9 com 3.718, e as duas juntas dão 4,8 com 8.485. A copy pede o valor puxado da API, com data, e que ele suma se a API falhar. | Quem somos (faixa preta), home, páginas de aeroporto | Marketing |
| D5 | **WhatsApp é botão amarelo ou vermelho na página de Contato** | O sistema reserva o vermelho para a ação principal e põe o WhatsApp em amarelo (secundário). Na página de Contato, a copy chama o WhatsApp de "CTA primário". Fiz em amarelo, e o vermelho ficou com "Enviar mensagem". | Contato | Marketing |
| D6 | **Banner de cookies: qual versão vale** | `00-componentes-globais.md` define três tipos (Necessários, Medição, Publicidade) e os botões Aceitar todos, Somente necessários e Configurar. A copy da Privacidade trazia quatro tipos (com Preferências) e os botões Recusar opcionais e Personalizar. A política foi escrita pela versão dos componentes globais. | Privacidade (seção 8), banner | Marketing + jurídico |
| D7 | **Domínio com ou sem www** (M2) | O site atual e as fichas do Google usam `asalocadora.com.br`, sem www. O JSON-LD da copy de Contato usa `www`. As páginas foram feitas sem www. | canonical e schema de todas as páginas | Marketing / dev |
| D8 | **Nome das lojas** | As fichas no Google se chamam "ASA Locadora - Aeroporto do Recife" (ASA em caixa alta) e "Asa Locadora - Aeroporto de Fortaleza". O rodapé usava "Asa Rent a Car · Aeroporto do Recife". Sugestão: padronizar a ficha de Recife para "Asa Locadora - Aeroporto do Recife" e usar esse nome no site. | Rodapé, Contato, Lojas, schema `AutoRental` | Marketing |
| D9 | **Frota: a tabela de 15 grupos está atual?** | As avaliações de Fortaleza de setembro citam Nissan Kicks, VW Polo automático e Fiat Argo, que não estão na tabela de grupos da fonte de verdade. | Frota, blog (artigo de Porto de Galinhas), Quem somos ("15 grupos") | Operação |

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
| R1 | Depois das 27 horas (C8) | Termos de hoje: nova diária completa depois dos 180 minutos de cortesia | Termos |
| R2 | Combustível (O7) | Termos de hoje: sai com tanque cheio, volta cheio, o que faltar é cobrado por litro | Termos |
| R3 | Limpeza (O7) | Termos de hoje: taxa por sujeira excessiva ou cheiro de cigarro | Termos |
| R4 | Multas (O7) | Termos de hoje: taxa de administração de R$ 70,00 por infração | Termos |
| R5 | Prazo de liberação da caução (C3) | Termos de hoje: até 60 dias, dependendo do banco | Termos |
| R6 | Condutor estrangeiro (O2) | Termos de hoje: habilitação do país de origem por até 180 dias da entrada no Brasil | Termos |
| R7 | Uso proibido e áreas de circulação (O9) | Em aberto | Termos |
| R8 | Falta de carro do grupo reservado (O10) | Em aberto | Termos |
| R9 | Devolução antecipada e reembolso | Em aberto | Termos |

As demais regras dos Termos (parcelamento, Pix, no-show, devolução em outra loja, nº do voo, tabela de caução, coberturas das proteções) já estão em 00c (C1, C3, C4, C7, O4, O8).

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
| A2 | **Política de uso das avaliações** do Google citadas com primeiro nome e inicial (Lais C., Danilo L., Priscila V., Jones D., Raquel A., Maria Eduarda). Letícya, citada na avaliação de Maria Eduarda, também é colaboradora (J8). | Quem somos, home |
| A3 | Fotos reais (M3): equipe no balcão (é o LCP de Quem somos), retratos da equipe, balcões, pátio, frota, destinos do blog, estrada. Hoje todas são placeholder com o briefing na legenda. | Todas |
| A4 | Autor dos artigos do blog, com nome e função (M5) | Blog |
| A5 | Padrão de URL de categoria e paginação do blog atual (M5) | Blog |
| A6 | Endereços dos artigos novos da pauta 2 a 8 (propostos, não confirmados) | Blog |
| A7 | Distâncias, tempos e data de conferência dos roteiros ([VERIFICAR] em 00c) | Blog |

## 6. Técnico e de lançamento

| # | O que falta | Onde |
|---|---|---|
| T1 | Banner de cookies (`asa-consent`) e o link "Configurar cookies" no rodapé. Depende de D6. | Global, Privacidade |
| T2 | Barra de primeira locação (BEMVINDOASA). Só entra com as regras do cupom (C5). | Global |
| T3 | Busca ligada ao motor de reservas. Hoje mostra uma linha "Protótipo". | Global |
| T4 | Formulário de contato com destino real, anti-spam (honeypot) e os eventos de GA4. Depende de E3. | Contato |
| T5 | Migração dos 14 PDFs de RI: levar os arquivos e manter os endereços `/_files/pasta/6/...` ou redirecionar com 301. | RI |
| T6 | Redirecionamentos 301: `/privacidade-e-cookies` para `/politica-de-privacidade`, `/termos-de-uso` para `/politica-de-termos-e-condicoes`, `/blog/index` para `/blog`. | Global |
| T7 | As três URLs antigas do blog com erro 500 (Brennand, Recife, Fortaleza) voltam com status 200 e conteúdo novo. | Blog |
| T8 | Página `/prevencao-a-fraudes` precisa existir antes do lançamento: o alerta da página de Contato aponta para ela. | Contato |
| T9 | Coordenadas `geo` das duas lojas para o schema. A API do Google Business Profile não devolveu latitude e longitude; o link do Maps de cada ficha já está nas páginas. | Contato, Lojas |
| T11 | A demonstração de dúvidas em 06 Componentes diz que a equipe "atende no WhatsApp e no telefone, 24 horas". O horário do atendimento remoto ainda não foi confirmado (E2); o texto da documentação muda junto. | Design system |
| T10 | Depois de cada merge: sincronizar o guia de parceiros (GitHub Pages), a skill e a cópia offline. Secrets do FTP para o deploy do design system. | Repositório |

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
