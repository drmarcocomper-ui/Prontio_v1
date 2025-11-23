# Estrutura Backend – PRONTIO (Google Apps Script)

Documentação oficial da organização do backend do sistema PRONTIO.

O backend do PRONTIO é implementado em **Google Apps Script**, com uma estrutura baseada em **módulos por domínio** (Pacientes, Agenda, Receitas, etc.) e um roteador central (`doPost`) que recebe todas as requisições do frontend.

---

## 🧩 Visão Geral

### Arquivos principais `.gs`:

- `Code.gs`              → Roteador principal + helpers globais + Prontuário  
- `Util.gs`              → Funções utilitárias compartilhadas  

### Módulos de negócio:

- `Pacientes.gs`         → CRUD de Pacientes  
- `Agenda.gs`            → Agenda médica / agendamentos  
- `Evolucao.gs`          → Evoluções / consultas  
- `Receitas.gs`          → Receitas médicas  
- `Exames.gs`            → Solicitações de exames  
- `Laudos.gs`            → Laudos médicos  
- `Atestados.gs`         → Atestados médicos  
- `Comparecimento.gs`    → Declarações de comparecimento  
- `SADT.gs`              → Solicitação SADT / Internações  
- `Consentimento.gs`     → Termos de consentimento informado  
- `Medicamentos.gs`      → Cadastro / listagem de medicamentos (tabela de apoio)

O Prontuário do paciente (timeline) é gerenciado dentro do próprio `Code.gs` por funções dedicadas.

---

## 🧠 1. Code.gs – Cérebro do Backend

Responsabilidades:

- `doGet(e)`  
  - usado para *ping* / teste rápido da API  
- `doPost(e)`  
  - recebe requisições JSON do frontend  
  - lê `body.action`  
  - roteia para a função `_` correspondente, ex.:  
    - `"pacientes-listar"  → pacientesListar_(body)`  
    - `"agenda-salvar"     → agendaSalvar_(body)`  
    - `"receita-salvar"    → receitaSalvar_(body)`  
    - `"listarProntuarioPorPaciente" → listarProntuarioPorPaciente_(body)`  

- Helpers globais:
  - `parseJsonBody_(e)`  
  - `jsonResponse_(obj)`  
  - `jsonError_(err)`  
  - `getSheet_(nomeAba)`  
  - `rowToObject_(header, row)`  
  - `listAllRowsAsObjects_(sheet)`  
  - `gerarId_()`  
  - `formatDate_(d)`  

- Configuração de abas:
  ```js
  const CONFIG = {
    ABA_PACIENTES:       "Pacientes",
    ABA_PRONTUARIO:      "Prontuario",
    ABA_AGENDA:          "Agenda",
    ABA_RECEITAS:        "Receitas",
    ABA_EVOLUCAO:        "Consultas",
    ABA_EXAMES:          "Exames",
    ABA_LAUDOS:          "Laudos",
    ABA_ATESTADOS:       "Atestados",
    ABA_COMPARECIMENTO:  "Comparecimento",
    ABA_MEDICAMENTOS:    "Medicamentos",
    ABA_SADT:            "SADT",
    ABA_CONSENTIMENTO:   "Consentimento"
  };

🧰 2. Util.gs – Funções de Apoio

Responsável por utilidades reusáveis entre módulos:

getSpreadsheet_()

getHeaderMap_(sheet)

upsertRow_(sheet, headerIdName, idValue, dataObj, extraForNew)

faz insert ou update genérico baseado em um campo ID (ex.: ID_Paciente)

formatTime_(date)

Funções centrais como getSheet_, rowToObject_, listAllRowsAsObjects_, jsonResponse_, jsonError_, parseJsonBody_, gerarId_, formatDate_ ficam em Code.gs para evitar duplicações.

👨‍⚕️ 3. Pacientes.gs – Módulo de Pacientes

Abas: CONFIG.ABA_PACIENTES (ex.: "Pacientes")

Colunas típicas:

ID_Paciente, NomePaciente, DataNascimento, Sexo, CPF, Telefone1, Telefone2, Email, ...

Funções:

pacientesListar_(body)

lista todos os pacientes como array de objetos { pacientes: [...] }

pacientesSalvar_(body)

recebe body.paciente

se não tiver ID_Paciente, gera gerarId_()

usa upsertRow_()

devolve { paciente: pacienteSalvo }

pacientesObter_(body)

recebe ID_Paciente

retorna um único paciente { paciente }

📅 4. Agenda.gs – Módulo de Agenda

Abas: CONFIG.ABA_AGENDA (ex.: "Agenda")

Colunas típicas:

ID_Agenda, ID_Paciente, NomePaciente, Data, HoraInicio, HoraFim, Tipo, Status, Observacoes

Funções:

agendaSalvar_(body)

cria/edita agendamento

normaliza horário e data

upsert em ID_Agenda

agendaListar_(body)

filtros genéricos: data, status, busca

retorna lista bruta

agendaListarPorData_(body)

filtra por dia específico

agendaListarPorPaciente_(body)

filtra agenda por paciente

agendaAtualizarStatus_(body)

altera coluna Status de um registro específico

🩺 5. Evolucao.gs – Evolução / Consultas

Abas: CONFIG.ABA_EVOLUCAO (ex.: "Consultas")

Colunas típicas:

ID_Evolucao, Data, Hora, ID_Paciente, NomePaciente, Tipo, Evolucao, CriadoEm

Funções:

evolucaoSalvar_(body)

cria ou atualiza uma evolução

usa upsertRow_() com ID_Evolucao

registra no prontuário (tipo = "evolucao")

evolucaoListarPorPaciente_(body)

filtra por paciente

ordena por data/hora (mais novas primeiro)

retorna { evolucao: [...] }

💊 6. Receitas.gs – Receitas Médicas

Abas: CONFIG.ABA_RECEITAS

Colunas sugeridas:

ID_Receita, ID_Paciente, NomePaciente, Data, Hora, ItemNumero, ID_Medicamento, NomeMedicacao, DescricaoCompleta, TipoReceita, Observacoes, UrlPdf

Funções:

receitaSalvar_(body)

recebe um objeto com dados + itens (lista de medicamentos)

gera um ID_Receita único

escreve uma linha por item de medicamento

registra no prontuário com tipo "receita"

receitaListarPorPaciente_(body)

lista todas as linhas da aba Receitas para o paciente

agrupa por ID_Receita

retorna { receitas: [ { receita + itens[] } ] }

🔬 7. Exames.gs – Pedidos de Exames

Abas: CONFIG.ABA_EXAMES

Colunas típicas:

ID_Exame, Data, Hora, ID_Paciente, NomePaciente, TipoExame, Descricao, Observacoes, UrlPdf

Funções:

exameSalvar_(body)

gera ou usa ID_Exame

upsert

registra no prontuário ("exame")

exameListarPorPaciente_(body)

retorna { exames: [...] } já ordenados por data/hora

📄 8. Laudos.gs – Laudos Médicos

Abas: CONFIG.ABA_LAUDOS

Colunas típicas:

ID_Laudo, Data, Hora, ID_Paciente, NomePaciente, TipoLaudo, Conteudo, Observacoes, UrlPdf

Funções:

laudoSalvar_(body)

upsert em ID_Laudo

registra no prontuário ("laudo")

laudoListarPorPaciente_(body)

retorna { laudos: [...] }

🧾 9. Atestados.gs – Atestados

Abas: CONFIG.ABA_ATESTADOS

Colunas típicas:

ID_Atestado, Data, Hora, ID_Paciente, NomePaciente, TextoAtestado, CID, Periodo, Observacoes, UrlPdf

Funções:

atestadoSalvar_(body)

gera ID se necessário

salva texto e metadados

registra no prontuário ("atestado")

atestadoListarPorPaciente_(body)

retorna { atestados: [...] }

📃 10. Comparecimento.gs – Declaração de Comparecimento

Abas: CONFIG.ABA_COMPARECIMENTO

Colunas típicas:

ID_Comparecimento, Data, Hora, ID_Paciente, NomePaciente, Texto, Observacoes, UrlPdf

Funções:

comparecimentoSalvar_(body)

upsert em ID_Comparecimento

registra no prontuário ("comparecimento")

comparecimentoListarPorPaciente_(body)

retorna { comparecimentos: [...] }

📑 11. SADT.gs – Solicitação / Guia SADT

Abas: CONFIG.ABA_SADT

Colunas típicas:

ID_Sadt, Data, Hora, ID_Paciente, NomePaciente, Procedimento, CID, Justificativa, Observacoes, UrlPdf

Funções:

sadtSalvar_(body)

gera ID

upsert

registra no prontuário com tipo "encaminhamento" / "sadt"

sadtListarPorPaciente_(body)

retorna { sadt: [...] }

📘 12. Consentimento.gs – Termo de Consentimento

Abas: CONFIG.ABA_CONSENTIMENTO

Colunas típicas:

ID_Consentimento, Data, Hora, ID_Paciente, NomePaciente, Procedimento, Texto, Observacoes, UrlPdf

Funções:

consentimentoSalvar_(body)

gera ID

salva termo

registra no prontuário ("consentimento")

consentimentoListarPorPaciente_(body)

retorna { consentimentos: [...] }

💊 13. Medicamentos.gs – Tabela de Apoio

Abas: CONFIG.ABA_MEDICAMENTOS

Colunas sugeridas:

ID_Medicamento, NomeMedicacao, Apresentacao, PosologiaSugerida, QuantidadePadrao, ViaAdministracao, TipoReceita, Observacoes, EhAntibiotico, EhControleEspecial

Funções:

medicamentosListar_(body)

retorna { medicamentos: [...] }

aceita opcionalmente filtros (ex.: busca)

ordena por nome

🔐 Segurança e Padrões

Sempre retornar { ok: true, data: ... } ou { ok: false, erro: ... }

Nunca expor detalhes de exceção sensível para o frontend

Usar CONFIG.ABA_* para nomes de aba (não strings soltas)

Sempre validar ID_Paciente antes de operações sensíveis

Nunca confiar em dados vindos do frontend sem normalizar

🎉 Resumo

A arquitetura backend do PRONTIO é:

Modular (um arquivo por domínio)

Roteada (via doPost + action)

Organizada (uso de CONFIG, helpers globais, upsert genérico)

Integrada (todos os módulos registram no Prontuário)

Escalável (fácil adicionar novos tipos de documentos ou registros)

Essa documentação deve ser usada como referência para qualquer ajuste ou novo módulo que for criado no futuro no backend PRONTIO.